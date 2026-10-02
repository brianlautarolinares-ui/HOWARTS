"use server";

import { auth } from "@/auth";
import { buildVerificationUrl, createCertificateCode } from "@/lib/certificate";
import { prisma } from "@/lib/prisma";
import { dispatchEmailEvent } from "@/lib/notification-events";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function issueCourseCertificate(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    include: {
      user: { select: { id: true, email: true, name: true } },
      course: {
        select: {
          id: true,
          title: true,
          stages: { select: { classes: { select: { id: true } } } }
        }
      }
    }
  });

  if (!enrollment) redirect("/alumno");

  const totalClasses = enrollment.course.stages.reduce((total, stage) => total + stage.classes.length, 0);
  if (totalClasses === 0) redirect(`/alumno/cursos/${courseId}?error=completo`);

  const completedClasses = await prisma.classProgress.count({
    where: { enrollmentId: enrollment.id }
  });

  if (completedClasses < totalClasses) redirect(`/alumno/cursos/${courseId}?error=completo`);

  const existingCertificate = await prisma.certificate.findUnique({
    where: { enrollmentId: enrollment.id },
    select: { code: true }
  });

  if (existingCertificate) {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "COMPLETED", completedAt: enrollment.completedAt ?? new Date() }
    });
    revalidatePath(`/alumno/cursos/${courseId}`);
    revalidatePath("/alumno");
    redirect(`/alumno/cursos/${courseId}?certificate=${existingCertificate.code}`);
  }

  const issuedAt = new Date();
  const code = createCertificateCode(enrollment.course.title, enrollment.user.email, issuedAt);
  const verificationUrl = buildVerificationUrl(code);

  const certificate = await prisma.certificate.create({
    data: {
      code,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrollmentId: enrollment.id,
      issuedAt,
      verificationUrl
    }
  });

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: "COMPLETED", completedAt: issuedAt }
  });

  const emailResult = await dispatchEmailEvent("course.completed", {
    email: enrollment.user.email,
    name: enrollment.user.name,
    courseTitle: enrollment.course.title,
    certificateCode: certificate.code,
    certificateUrl: verificationUrl
  });
  if (!emailResult.ok) console.error("certificate_email_failed", emailResult.message);

  revalidatePath(`/alumno/cursos/${courseId}`);
  revalidatePath("/alumno");
  redirect(`/alumno/cursos/${courseId}?certificate=${certificate.code}`);
}
