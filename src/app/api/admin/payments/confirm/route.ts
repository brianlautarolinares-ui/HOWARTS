import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatchEmailEvent } from "@/lib/notification-events";
import { PaymentMethod } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const confirmPaymentSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().trim().max(120).optional(),
  amountArs: z.number().int().positive()
});

export async function POST(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = confirmPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { userId, courseId, method, reference, amountArs } = parsed.data;
  const normalizedReference = reference || `MANUAL-${userId}-${courseId}`;

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const [user, course] = await Promise.all([
        transaction.user.findUnique({ where: { id: userId }, select: { id: true } }),
        transaction.course.findUnique({
          where: { id: courseId },
          select: { id: true, priceArs: true, status: true }
        })
      ]);

      if (!user || !course || course.status !== "PUBLISHED") {
        throw new Error("INVALID_PURCHASE");
      }

      if (course.priceArs !== amountArs) {
        throw new Error("INVALID_AMOUNT");
      }

      if (normalizedReference) {
        const existingPayment = await transaction.payment.findUnique({
          where: { reference: normalizedReference },
          select: { id: true, userId: true, courseId: true, status: true }
        });

        if (existingPayment) {
          if (existingPayment.userId !== userId || existingPayment.courseId !== courseId) {
            throw new Error("REFERENCE_IN_USE");
          }

          const payment = await transaction.payment.update({
            where: { id: existingPayment.id },
            data: {
              method,
              amountArs,
              status: "APPROVED",
              paidAt: new Date(),
              recordedById: session.user.id
            }
          });

          await transaction.enrollment.upsert({
            where: { userId_courseId: { userId, courseId } },
            create: { userId, courseId, status: "ACTIVE" },
            update: { status: "ACTIVE", completedAt: null }
          });

          return { payment, shouldNotify: existingPayment.status !== "APPROVED" };
        }
      }

      const payment = await transaction.payment.create({
        data: {
          userId,
          courseId,
          method,
          reference: normalizedReference,
          amountArs,
          status: "APPROVED",
          paidAt: new Date(),
          recordedById: session.user.id
        }
      });

      await transaction.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, status: "ACTIVE" },
        update: { status: "ACTIVE", completedAt: null }
      });

      return { payment, shouldNotify: true };
    });

    if (result.shouldNotify) {
      const [user, course] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
        prisma.course.findUnique({ where: { id: courseId }, select: { title: true } })
      ]);

      if (user && course) {
        const emailResult = await dispatchEmailEvent("payment.approved", {
          email: user.email,
          name: user.name,
          courseTitle: course.title,
          amount: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amountArs)
        });
        if (!emailResult.ok) console.error("payment_approved_email_failed", emailResult.message);
      }
    }

    return NextResponse.json({ payment: result.payment }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_PURCHASE") {
        return NextResponse.json({ error: "El alumno o curso no existe." }, { status: 404 });
      }

      if (error.message === "INVALID_AMOUNT") {
        return NextResponse.json({ error: "El importe no coincide con el precio del curso." }, { status: 400 });
      }

      if (error.message === "REFERENCE_IN_USE") {
        return NextResponse.json({ error: "La referencia ya pertenece a otra compra." }, { status: 409 });
      }
    }

    console.error("confirm_payment_error", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}