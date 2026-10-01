import Link from "next/link";

export default function HomePage() {
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
    </main>
  );
}
