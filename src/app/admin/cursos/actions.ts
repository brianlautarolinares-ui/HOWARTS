"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  classMaterialSchema,
  courseManagementSchema,
  coursePublicationSchema,
  courseStageSchema,
  liveClassSchema,
  quizQuestionSchema
} from "@/lib/validators/course-content";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/alumno");
  return session.user;
}

export async function createCourse(formData: FormData) {
  const user = await requireAdmin();
  const parsed = courseManagementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/cursos?error=curso");

  const existing = await prisma.course.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
  if (existing) redirect("/admin/cursos?error=slug");

  const course = await prisma.course.create({
    data: { ...parsed.data, creatorId: user.id }
  });
  revalidatePath("/");
  redirect(`/admin/cursos/${course.id}`);
}

export async function createCourseStage(formData: FormData) {
  await requireAdmin();
  const parsed = courseStageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/cursos?error=etapa");

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
    select: { id: true }
  });
  if (!course) redirect("/admin/cursos");

  const lastStage = await prisma.courseStage.findFirst({
    where: { courseId: course.id },
    orderBy: { position: "desc" },
    select: { position: true }
  });

  await prisma.courseStage.create({
    data: { courseId: course.id, title: parsed.data.title, position: (lastStage?.position ?? 0) + 1 }
  });
  revalidatePath(`/admin/cursos/${course.id}`);
  revalidatePath("/alumno");
  redirect(`/admin/cursos/${course.id}`);
}

export async function createLiveClass(formData: FormData) {
  await requireAdmin();
  const parsed = liveClassSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/cursos?error=clase");

  const stage = await prisma.courseStage.findUnique({
    where: { id: parsed.data.stageId },
    select: { id: true, courseId: true }
  });
  if (!stage) redirect("/admin/cursos");

  await prisma.liveClass.create({
    data: {
      ...parsed.data,
      scheduledAt: new Date(`${parsed.data.scheduledAt}:00-03:00`),
      meetingUrl: parsed.data.meetingUrl || null
    }
  });
  revalidatePath(`/admin/cursos/${stage.courseId}`);
  revalidatePath("/alumno");
  redirect(`/admin/cursos/${stage.courseId}`);
}

export async function publishClassMaterial(formData: FormData) {
  await requireAdmin();
  const parsed = classMaterialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/cursos?error=material");

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: parsed.data.classId },
    select: { id: true, scheduledAt: true, stage: { select: { courseId: true } } }
  });
  if (!liveClass) redirect("/admin/cursos");
  if (liveClass.scheduledAt > new Date()) redirect(`/admin/cursos/${liveClass.stage.courseId}?error=antes`);

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024) {
    redirect(`/admin/cursos/${liveClass.stage.courseId}?error=pdf`);
  }

  const pdfData = Buffer.from(await file.arrayBuffer());
  if (pdfData.subarray(0, 5).toString("ascii") !== "%PDF-") {
    redirect(`/admin/cursos/${liveClass.stage.courseId}?error=pdf`);
  }

  await prisma.liveClass.update({
    where: { id: liveClass.id },
    data: {
      developedTopic: parsed.data.developedTopic,
      authorCredit: parsed.data.authorCredit,
      recordingUrl: parsed.data.recordingUrl || null,
      pdfName: file.name.slice(0, 255),
      pdfData,
      releasedAt: new Date()
    }
  });
  revalidatePath(`/admin/cursos/${liveClass.stage.courseId}`);
  revalidatePath(`/alumno/cursos/${liveClass.stage.courseId}`);
  redirect(`/admin/cursos/${liveClass.stage.courseId}`);
}

export async function updateCoursePublication(formData: FormData) {
  await requireAdmin();
  const parsed = coursePublicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/cursos?error=curso");

  await prisma.course.update({
    where: { id: parsed.data.courseId },
    data: { status: parsed.data.status }
  });
  revalidatePath("/");
  revalidatePath("/admin/cursos");
  redirect(`/admin/cursos/${parsed.data.courseId}`);
}

export async function saveQuizQuestion(formData: FormData) {
  await requireAdmin();
  const parsed = quizQuestionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/cursos?error=evaluacion");

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: parsed.data.liveClassId },
    select: { id: true, releasedAt: true, stage: { select: { courseId: true } } }
  });
  if (!liveClass?.releasedAt) redirect("/admin/cursos?error=evaluacion");

  const quiz = await prisma.classQuiz.upsert({
    where: { liveClassId: liveClass.id },
    create: { liveClassId: liveClass.id, passingPercent: parsed.data.passingPercent },
    update: { passingPercent: parsed.data.passingPercent }
  });
  const lastQuestion = await prisma.quizQuestion.findFirst({
    where: { quizId: quiz.id },
    orderBy: { position: "desc" },
    select: { position: true }
  });

  await prisma.quizQuestion.create({
    data: {
      quizId: quiz.id,
      prompt: parsed.data.prompt,
      choices: parsed.data.choices,
      correctAnswer: parsed.data.correctAnswer,
      position: (lastQuestion?.position ?? 0) + 1
    }
  });
  revalidatePath(`/admin/cursos/${liveClass.stage.courseId}`);
  revalidatePath(`/alumno/cursos/${liveClass.stage.courseId}`);
  redirect(`/admin/cursos/${liveClass.stage.courseId}`);
}

export async function markClassCompleted(liveClassId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: liveClassId },
    select: { id: true, releasedAt: true, stage: { select: { courseId: true } } }
  });
  if (!liveClass?.releasedAt) redirect("/alumno");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: liveClass.stage.courseId } },
    select: { id: true, status: true }
  });
  if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) redirect("/alumno");

  await prisma.classProgress.upsert({
    where: { enrollmentId_liveClassId: { enrollmentId: enrollment.id, liveClassId } },
    create: { enrollmentId: enrollment.id, liveClassId },
    update: { completedAt: new Date() }
  });
  revalidatePath(`/alumno/cursos/${liveClass.stage.courseId}`);
}