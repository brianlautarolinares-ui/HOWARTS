import { auth } from "@/auth";
import { PdfMaterialViewer } from "@/components/pdf-material-viewer";
import { canAccessCourse } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function StudentCoursePage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { courseId } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    select: {
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
                  developedTopic: true,
                  authorCredit: true,
                  pdfName: true,
                  releasedAt: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!enrollment || !canAccessCourse("STUDENT", enrollment.status)) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <Link href="/alumno" className="text-sm font-semibold text-brand">Volver a mis cursos</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand">Curso · {enrollment.status === "COMPLETED" ? "Finalizado" : "Inscripción confirmada"}</p>
          <h1 className="mt-2 text-3xl font-bold">{enrollment.course.title}</h1>
          <p className="mt-2 text-slate-600">{enrollment.course.summary}</p>
        </div>
      </div>

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
                          <h4 className="font-semibold">Tema desarrollado</h4>
                          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{liveClass.developedTopic}</p>
                          <p className="mt-4 text-xs text-slate-500">Material de autoría: {liveClass.authorCredit}</p>
                          <PdfMaterialViewer
                            classId={liveClass.id}
                            studentLabel={session.user.email ?? session.user.name ?? "Alumno"}
                            authorCredit={liveClass.authorCredit}
                          />
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