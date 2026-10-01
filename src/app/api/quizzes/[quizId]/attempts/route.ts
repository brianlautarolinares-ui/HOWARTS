import { auth } from "@/auth";
import { canAccessCourse } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import { gradeQuiz } from "@/lib/quiz-scoring";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.string())
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ quizId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = submitQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Respuestas inválidas." }, { status: 400 });
  }

  const { quizId } = await context.params;
  const quiz = await prisma.classQuiz.findUnique({
    where: { id: quizId },
    include: {
      liveClass: { select: { releasedAt: true, stage: { select: { courseId: true } } } },
      questions: { select: { id: true, choices: true, correctAnswer: true } }
    }
  });
  if (!quiz || !quiz.liveClass.releasedAt || quiz.questions.length === 0) {
    return NextResponse.json({ error: "Evaluación no disponible." }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: quiz.liveClass.stage.courseId } },
    select: { id: true, status: true }
  });
  const role = session.user.role === "ADMIN" ? "ADMIN" : "STUDENT";
  if (!enrollment || (role !== "ADMIN" && !canAccessCourse("STUDENT", enrollment.status))) {
    return NextResponse.json({ error: "No tenés acceso a esta evaluación." }, { status: 403 });
  }

  const answerIds = new Set(quiz.questions.map((question) => question.id));
  const answers = parsed.data.answers;
  if (Object.keys(answers).length !== quiz.questions.length || Object.keys(answers).some((id) => !answerIds.has(id))) {
    return NextResponse.json({ error: "Respondé todas las preguntas." }, { status: 400 });
  }

  for (const question of quiz.questions) {
    const choices = Array.isArray(question.choices) ? question.choices.filter((choice): choice is string => typeof choice === "string") : [];
    if (!choices.includes(answers[question.id])) {
      return NextResponse.json({ error: "Una respuesta no pertenece a las opciones disponibles." }, { status: 400 });
    }
  }

  const { scorePercent, correctCount } = gradeQuiz(quiz.questions, answers);
  const passed = scorePercent >= quiz.passingPercent;
  await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      enrollmentId: enrollment.id,
      answers,
      scorePercent,
      passed
    }
  });

  return NextResponse.json({
    scorePercent,
    correctCount,
    totalQuestions: quiz.questions.length,
    passingPercent: quiz.passingPercent,
    passed
  }, { status: 201 });
}