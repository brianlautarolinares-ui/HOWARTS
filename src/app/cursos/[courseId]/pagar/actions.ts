"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requestEnrollment(courseId: string) {
  const paymentPath = `/cursos/${courseId}/pagar`;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=${encodeURIComponent(paymentPath)}`);

  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true }
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

  redirect(`${paymentPath}?solicitud=pendiente`);
}