import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, summary: true, priceArs: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-bold text-ink">
            Campus Educativo
          </Link>
          <nav aria-label="Navegación principal" className="flex items-center gap-3">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-ink">
              Ingresar
            </Link>
            <Link href="/registro" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase text-brand">Campus virtual</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Aprendé algo nuevo, paso a paso.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Encontrá cursos prácticos y seguí tu recorrido desde un solo lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/registro" className="rounded-lg bg-brand px-5 py-3 font-semibold text-white">
              Empezar ahora
            </Link>
            <Link href="/login" className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-ink">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="border-l-4 border-brand pl-6 md:justify-self-end">
          <p className="text-sm font-semibold uppercase text-slate-500">Tu espacio de aprendizaje</p>
          <p className="mt-3 max-w-sm text-2xl font-semibold leading-snug text-ink">
            Cursos, progreso y acceso a tus contenidos.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white" aria-labelledby="courses-heading">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="courses-heading" className="text-2xl font-bold">Cursos y capacitaciones</h2>
          {courses.length === 0 ? (
            <p className="mt-4 text-slate-600">Próximamente habrá cursos disponibles.</p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <article key={course.id} className="flex flex-col border-t-2 border-brand py-4">
                  <h3 className="text-lg font-bold">{course.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.summary}</p>
                  <p className="mt-4 font-semibold">
                    {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(course.priceArs)}
                  </p>
                  <Link href={`/cursos/${course.id}/pagar`} className="mt-4 inline-flex w-fit rounded-md bg-brand px-4 py-2 font-semibold text-white">
                    Ver pago e inscribirme
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
