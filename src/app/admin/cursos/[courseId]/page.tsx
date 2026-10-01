import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createCourseStage, createLiveClass, publishClassMaterial, saveQuizQuestion, updateCoursePublication } from "../actions";

export default async function AdminCoursePage({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/alumno");

  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      priceArs: true,
      status: true,
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
              releasedAt: true,
              authorCredit: true,
              pdfName: true,
              recordingUrl: true,
              quiz: {
                select: {
                  passingPercent: true,
                  questions: {
                    orderBy: { position: "asc" },
                    select: { prompt: true, choices: true, correctAnswer: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  if (!course) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <Link href="/admin/cursos" className="text-sm font-semibold text-brand">Volver a cursos</Link>
      <h1 className="mt-6 text-3xl font-bold">{course.title}</h1>
      <p className="mt-2 text-slate-600">
        {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(course.priceArs)}
        {" · "}{course.status === "PUBLISHED" ? "Publicado" : "Borrador"}
      </p>
      <form action={updateCoursePublication} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="courseId" value={course.id} />
        <label className="text-sm font-medium">
          Visibilidad del curso
          <select name="status" defaultValue={course.status} className="mt-2 block rounded-md border border-slate-300 bg-white px-3 py-2 text-base">
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </label>
        <button type="submit" className="rounded-md border border-slate-300 px-4 py-2 font-semibold">Guardar estado</button>
      </form>
      {query.error ? (
        <p role="alert" className="mt-5 border-l-4 border-red-700 bg-white p-4 text-sm">
          {query.error === "antes" ? "La clase todavía no llegó a su fecha pactada." : query.error === "material" ? "Completá el tema y el crédito de autor." : "El archivo debe ser un PDF válido de hasta 10 MB."}
        </p>
      ) : null}

      <section className="mt-8 border-y border-slate-300 py-6" aria-labelledby="stage-heading">
        <h2 id="stage-heading" className="text-xl font-bold">Agregar etapa</h2>
        <form action={createCourseStage} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="courseId" value={course.id} />
          <label className="min-w-64 flex-1 text-sm font-medium">
            Nombre de la etapa
            <input required name="title" minLength={2} maxLength={120} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <button type="submit" className="rounded-md bg-brand px-5 py-3 font-semibold text-white">Agregar etapa</button>
        </form>
      </section>

      <div className="divide-y divide-slate-300">
        {course.stages.map((stage) => (
          <section key={stage.id} className="py-8" aria-labelledby={`stage-${stage.id}`}>
            <h2 id={`stage-${stage.id}`} className="text-xl font-bold">Etapa {stage.position}: {stage.title}</h2>
            <form action={createLiveClass} className="mt-5 grid gap-4 rounded-md bg-white p-5 sm:grid-cols-2">
              <input type="hidden" name="stageId" value={stage.id} />
              <label className="text-sm font-medium">
                Nombre de la clase
                <input required name="title" minLength={2} maxLength={160} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
              </label>
              <label className="text-sm font-medium">
                Fecha y hora pactada (Argentina)
                <input required type="datetime-local" name="scheduledAt" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Enlace de la clase en vivo (opcional)
                <input type="url" name="meetingUrl" maxLength={500} placeholder="https://..." className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
              </label>
              <button type="submit" className="w-fit rounded-md border border-slate-300 px-4 py-2 font-semibold">Pactar clase</button>
            </form>

            {stage.classes.length === 0 ? <p className="mt-4 text-sm text-slate-600">Aún no hay clases en esta etapa.</p> : (
              <ol className="mt-5 space-y-5">
                {stage.classes.map((liveClass) => (
                  <li key={liveClass.id} className="border-l-2 border-brand pl-5">
                    <h3 className="font-semibold">{liveClass.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(liveClass.scheduledAt)}
                      {" · "}{liveClass.releasedAt ? "Material publicado" : "Material pendiente"}
                    </p>
                    {liveClass.releasedAt ? (
                      <p className="mt-2 text-sm">Material publicado · Crédito de autor: {liveClass.authorCredit} · {liveClass.pdfName}</p>
                    ) : null}
                    <form action={publishClassMaterial} className="mt-4 grid gap-4 rounded-md bg-white p-4">
                        <input type="hidden" name="classId" value={liveClass.id} />
                        <label className="text-sm font-medium">
                          {liveClass.releasedAt ? "Actualizar tema desarrollado" : "Tema desarrollado"}
                          <textarea required name="developedTopic" minLength={10} maxLength={20000} rows={3} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="text-sm font-medium">
                            Crédito o sello de autor
                            <input required name="authorCredit" defaultValue={liveClass.authorCredit ?? ""} minLength={2} maxLength={120} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
                          </label>
                          <label className="text-sm font-medium sm:col-span-2">
                            Enlace privado o no listado de la grabación (opcional)
                            <input type="url" name="recordingUrl" maxLength={500} defaultValue={liveClass.recordingUrl ?? ""} placeholder="https://..." className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
                          </label>
                          <label className="text-sm font-medium">
                            {liveClass.releasedAt ? "Nuevo PDF (máximo 10 MB)" : "PDF (máximo 10 MB)"}
                            <input required type="file" name="pdf" accept="application/pdf,.pdf" className="mt-2 block w-full text-sm" />
                          </label>
                        </div>
                        <button type="submit" className="w-fit rounded-md bg-brand px-4 py-2 font-semibold text-white">
                          {liveClass.releasedAt ? "Reemplazar material" : "Publicar material"}
                        </button>
                      </form>
                    {liveClass.releasedAt ? (
                      <section className="mt-5 border-t border-slate-200 pt-4" aria-label={`Evaluación de ${liveClass.title}`}>
                        <h4 className="font-semibold">Evaluación · mínimo {liveClass.quiz?.passingPercent ?? 70}%</h4>
                        {liveClass.quiz?.questions.length ? (
                          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                            {liveClass.quiz.questions.map((question, index) => (
                              <li key={`${question.prompt}-${index}`}>
                                {question.prompt} · Respuesta: {question.correctAnswer}
                              </li>
                            ))}
                          </ol>
                        ) : <p className="mt-2 text-sm text-slate-600">Todavía no hay preguntas.</p>}
                        <form action={saveQuizQuestion} className="mt-4 grid gap-4 rounded-md bg-white p-4">
                          <input type="hidden" name="liveClassId" value={liveClass.id} />
                          <label className="text-sm font-medium">
                            Pregunta
                            <textarea required name="prompt" minLength={5} maxLength={1000} rows={2} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
                          </label>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-medium">
                              Opciones, una por línea (2 a 6)
                              <textarea required name="choices" rows={4} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
                            </label>
                            <div className="space-y-4">
                              <label className="block text-sm font-medium">
                                Respuesta correcta (debe coincidir con una opción)
                                <input required name="correctAnswer" maxLength={300} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
                              </label>
                              <label className="block text-sm font-medium">
                                Puntaje mínimo (%)
                                <input required type="number" name="passingPercent" min={0} max={100} defaultValue={liveClass.quiz?.passingPercent ?? 70} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-base" />
                              </label>
                            </div>
                          </div>
                          <button type="submit" className="w-fit rounded-md border border-slate-300 px-4 py-2 font-semibold">Agregar pregunta</button>
                        </form>
                      </section>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}