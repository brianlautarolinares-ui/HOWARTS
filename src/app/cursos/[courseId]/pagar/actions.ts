"use server";

import { auth } from "@/auth";
import { dispatchEmailEvent } from "@/lib/notification-events";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requestEnrollment(courseId: string) {
  const paymentPath = `/cursos/${courseId}/pagar`;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=${encodeURIComponent(paymentPath)}`);

  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, title: true }
  });
  if (!course) redirect("/");

  const enrollmentKey = { userId_courseId: { userId: session.user.id, courseId } };
  const existing = await prisma.enrollment.findUnique({
    where: enrollmentKey,
    select: { status: true }
  });

  if (existing?.status === "ACTIVE" || existing?.status === "COMPLETED") {
    redirect("/alumno");
  }

  await prisma.enrollment.upsert({
    where: enrollmentKey,
    create: { userId: session.user.id, courseId, status: "PENDING" },
    update: existing?.status === "CANCELLED" ? { status: "PENDING", completedAt: null } : {}
  });

  if (!existing || existing.status === "CANCELLED") {
    if (session.user.email) {
      const emailResult = await dispatchEmailEvent("payment.requested", {
        email: session.user.email,
        name: session.user.name ?? "alumno",
        courseTitle: course.title
      });
      if (!emailResult.ok) console.error("payment_pending_email_failed", emailResult.message);
    }
  }

  redirect(`${paymentPath}?solicitud=pendiente`);
}