import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createCourse } from "./actions";

export default async function AdminCoursesPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/alumno");

  const [courses, query] = await Promise.all([
    prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, priceArs: true, status: true, _count: { select: { stages: true } } }
    }),
    searchParams
  ]);

  const errorMessage = {
    curso: "Revisá los campos del curso.",
    slug: "Ese identificador ya está en uso.",
    etapa: "Revisá los datos de la etapa.",
    clase: "Revisá el título, fecha y enlace de la clase.",
    material: "El tema o crédito de autor no es válido.",
    pdf: "El archivo debe ser un PDF válido de hasta 10 MB.",
    evaluacion: "Revisá el enunciado, las opciones, la respuesta correcta y el puntaje mínimo."
  }[query.error ?? ""];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <nav aria-label="Navegación de administración" className="flex flex-wrap gap-5 text-sm font-semibold text-brand">
        <Link href="/alumno">Volver al campus</Link>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/pagos">Datos de cobro</Link>
        <Link href="/admin/pagos/solicitudes">Solicitudes de pago</Link>
      </nav>
      <h1 className="mt-7 text-3xl font-bold">Cursos y capacitaciones</h1>

      {errorMessage ? <p role="alert" className="mt-5 border-l-4 border-red-700 bg-white p-4">{errorMessage}</p> : null}

      <section className="mt-8 border-t border-slate-300 py-6" aria-labelledby="create-course-heading">
        <h2 id="create-course-heading" className="text-xl font-bold">Agregar curso</h2>
        <form action={createCourse} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Nombre
            <input required name="title" minLength={3} maxLength={120} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="text-sm font-medium">
            Identificador URL
            <input required name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={140} placeholder="curso-de-ejemplo" className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="text-sm font-medium">
            Precio (ARS)
            <input required name="priceArs" type="number" min={1} max={999999999} step={1} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="text-sm font-medium">
            Estado
            <select name="status" defaultValue="DRAFT" className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base">
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Resumen
            <textarea required name="summary" minLength={10} maxLength={300} rows={2} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Descripción completa
            <textarea required name="description" minLength={10} maxLength={10000} rows={4} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <button type="submit" className="w-fit rounded-md bg-brand px-5 py-3 font-semibold text-white">Crear curso</button>
        </form>
      </section>

      <section className="mt-6 border-t border-slate-300 py-6" aria-labelledby="courses-list-heading">
        <h2 id="courses-list-heading" className="text-xl font-bold">Cursos cargados</h2>
        {courses.length === 0 ? <p className="mt-4 text-slate-600">Todavía no hay cursos.</p> : (
          <ul className="mt-4 divide-y divide-slate-200">
            {courses.map((course) => (
              <li key={course.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(course.priceArs)}
                    {" · "}{course._count.stages} etapas · {course.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                  </p>
                </div>
                <Link href={`/admin/cursos/${course.id}`} className="font-semibold text-brand">Administrar clases</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}