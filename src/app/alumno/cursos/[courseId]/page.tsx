import { auth } from "@/auth";
import { PdfMaterialViewer } from "@/components/pdf-material-viewer";
import { QuizAttemptForm } from "@/components/quiz-attempt-form";
import { canAccessCourse } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { markClassCompleted } from "@/app/admin/cursos/actions";
import { issueCourseCertificate } from "./actions";
import { buildVerificationUrl } from "@/lib/certificate";

export default async function StudentCoursePage({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<{ certificate?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [{ courseId }, rawQuery] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({})
  ]);
  const query = (rawQuery ?? {}) as { certificate?: string; error?: string };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    select: {
      id: true,
      status: true,
      course: {
        select: {
          title: true,
          summary: true,
          stages: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              position: true,
              classes: {
                orderBy: { scheduledAt: "asc" },
                select: {
                  id: true,
                  title: true,
                  scheduledAt: true,
                  meetingUrl: true,
                  recordingUrl: true,
                  developedTopic: true,
                  authorCredit: true,
                  pdfName: true,
                  releasedAt: true,
                  quiz: {
                    select: {
                      id: true,
                      passingPercent: true,
                      questions: {
                        orderBy: { position: "asc" },
                        select: { id: true, prompt: true, choices: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!enrollment || !canAccessCourse("STUDENT", enrollment.status)) notFound();

  const [progressRecords, attempts, certificate] = await Promise.all([
    prisma.classProgress.findMany({
      where: { enrollmentId: enrollment.id },
      select: { liveClassId: true }
    }),
    prisma.quizAttempt.findMany({
      where: { enrollmentId: enrollment.id },
      orderBy: { attemptedAt: "desc" },
      select: { quizId: true, scorePercent: true, passed: true }
    }),
    prisma.certificate.findUnique({
      where: { enrollmentId: enrollment.id },
      select: { code: true }
    })
  ]);
  const completedClassIds = new Set(progressRecords.map((progress) => progress.liveClassId));
  const latestAttemptByQuiz = new Map<string, { scorePercent: number; passed: boolean }>();
  for (const attempt of attempts) {
    if (!latestAttemptByQuiz.has(attempt.quizId)) {
      latestAttemptByQuiz.set(attempt.quizId, { scorePercent: attempt.scorePercent, passed: attempt.passed });
    }
  }
  const totalClasses = enrollment.course.stages.reduce((total, stage) => total + stage.classes.length, 0);
  const completedClasses = enrollment.course.stages.reduce(
    (total, stage) => total + stage.classes.filter((liveClass) => completedClassIds.has(liveClass.id)).length,
    0
  );
  const progressPercent = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;
  const courseIsComplete = totalClasses > 0 && completedClasses === totalClasses;
  const verificationUrl = certificate ? buildVerificationUrl(certificate.code) : null;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <Link href="/alumno" className="text-sm font-semibold text-brand">Volver a mis cursos</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand">Curso · {enrollment.status === "COMPLETED" ? "Finalizado" : "Inscripción confirmada"}</p>
          <h1 className="mt-2 text-3xl font-bold">{enrollment.course.title}</h1>
          <p className="mt-2 text-slate-600">{enrollment.course.summary}</p>
          <div className="mt-5 max-w-xl" aria-label={`Progreso del curso: ${progressPercent}%`}>
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{completedClasses} de {totalClasses} clases · {progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del curso">
              <div className="h-full bg-brand" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {query?.error === "completo" ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Para obtener el certificado, primero marcá todas las clases como completadas y aprobá las evaluaciones necesarias.
        </p>
      ) : null}

      {certificate && verificationUrl ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold uppercase text-emerald-800">Certificado emitido</p>
          <p className="mt-2 text-sm text-emerald-900">Código: {certificate.code}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={verificationUrl} target="_blank" rel="noreferrer" className="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white">
              Ver certificado público
            </a>
          </div>
        </div>
      ) : null}

      {courseIsComplete && !certificate ? (
        <form action={issueCourseCertificate.bind(null, courseId)} className="mt-6">
          <button type="submit" className="rounded-md bg-brand px-5 py-3 font-semibold text-white">
            Emitir certificado del curso
          </button>
        </form>
      ) : null}

      {enrollment.course.stages.length === 0 ? (
        <p className="mt-8 border-t border-slate-300 py-6 text-slate-600">Todavía no hay etapas publicadas.</p>
      ) : (
        <div className="mt-8 divide-y divide-slate-300">
          {enrollment.course.stages.map((stage) => (
            <section key={stage.id} className="py-7" aria-labelledby={`stage-${stage.id}`}>
              <h2 id={`stage-${stage.id}`} className="text-xl font-bold">Etapa {stage.position}: {stage.title}</h2>
              {stage.classes.length === 0 ? <p className="mt-3 text-sm text-slate-600">Aún no hay clases pactadas.</p> : (
                <ol className="mt-5 space-y-8">
                  {stage.classes.map((liveClass) => (
                    <li key={liveClass.id} className="border-l-2 border-brand pl-5">
                      <h3 className="font-semibold">{liveClass.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Intl.DateTimeFormat("es-AR", { dateStyle: "full", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(liveClass.scheduledAt)}
                      </p>
                      {liveClass.meetingUrl ? (
                        <a href={liveClass.meetingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-brand">
                          Ingresar a la clase en vivo
                        </a>
                      ) : null}

                      {liveClass.releasedAt && liveClass.developedTopic && liveClass.pdfName && liveClass.authorCredit ? (
                        <div className="mt-5">
                          {liveClass.recordingUrl ? (
                            <a href={liveClass.recordingUrl} target="_blank" rel="noreferrer" className="mb-4 inline-block font-semibold text-brand">
                              Ver grabación de la clase
                            </a>
                          ) : null}
                          <h4 className="font-semibold">Tema desarrollado</h4>
                          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{liveClass.developedTopic}</p>
                          <p className="mt-4 text-xs text-slate-500">Material de autoría: {liveClass.authorCredit}</p>
                          <PdfMaterialViewer
                            classId={liveClass.id}
                            studentLabel={session.user.email ?? session.user.name ?? "Alumno"}
                            authorCredit={liveClass.authorCredit}
                          />
                          {completedClassIds.has(liveClass.id) ? (
                            <p role="status" className="mt-4 text-sm font-medium text-emerald-700">Clase completada</p>
                          ) : (
                            <form action={markClassCompleted.bind(null, liveClass.id)} className="mt-4">
                              <button type="submit" className="rounded-md border border-slate-300 px-4 py-2 font-semibold">Marcar clase como completada</button>
                            </form>
                          )}
                          {liveClass.quiz?.questions.length ? (
                            <section className="mt-6 border-t border-slate-200 pt-4" aria-label={`Evaluación de ${liveClass.title}`}>
                              <p className="mb-3 text-sm text-slate-600">Aprobación: {liveClass.quiz.passingPercent}% · Reintentos permitidos.</p>
                              {latestAttemptByQuiz.has(liveClass.quiz.id) ? (
                                <p className="mb-4 text-sm" role="status">
                                  Último resultado: {latestAttemptByQuiz.get(liveClass.quiz.id)?.scorePercent}% · {latestAttemptByQuiz.get(liveClass.quiz.id)?.passed ? "Aprobada" : "Podés volver a intentarlo"}.
                                </p>
                              ) : null}
                              <QuizAttemptForm
                                quizId={liveClass.quiz.id}
                                questions={liveClass.quiz.questions.map((question) => ({
                                  id: question.id,
                                  prompt: question.prompt,
                                  choices: Array.isArray(question.choices)
                                    ? question.choices.filter((choice): choice is string => typeof choice === "string")
                                    : []
                                }))}
                              />
                            </section>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-4 border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-slate-700">
                          El tema y el PDF estarán disponibles cuando termine la clase y el admin publique el material.
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}