import { auth } from "@/auth";
import { summarizeAdminMetrics } from "@/lib/admin-stats";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/alumno");

  const [users, courses, enrollments, payments] = await Promise.all([
    prisma.user.findMany({ select: { role: true } }),
    prisma.course.findMany({ select: { status: true } }),
    prisma.enrollment.findMany({ select: { status: true } }),
    prisma.payment.findMany({ select: { status: true, amountArs: true } })
  ]);

  const metrics = summarizeAdminMetrics({ users, courses, enrollments, payments });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <nav aria-label="Navegación de administración" className="flex flex-wrap gap-5 text-sm font-semibold text-brand">
        <Link href="/alumno">Volver al campus</Link>
        <Link href="/admin/cursos">Cursos</Link>
        <Link href="/admin/pagos">Datos de cobro</Link>
        <Link href="/admin/pagos/solicitudes">Solicitudes</Link>
      </nav>

      <header className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Panel de administración</p>
        <h1 className="mt-3 text-3xl font-bold">Resumen operativo</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Seguimiento rápido del estado del negocio, la actividad educativa y el rendimiento de pagos.
        </p>
      </header>

      <section aria-labelledby="metrics-heading" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <h2 id="metrics-heading" className="sr-only">Métricas del campus</h2>
        <MetricCard title="Estudiantes" value={String(metrics.totalStudents)} description="Usuarios activos" />
        <MetricCard title="Cursos" value={String(metrics.publishedCourses)} description="Publicados" />
        <MetricCard title="Inscripciones" value={String(metrics.activeEnrollments)} description="Activas o finalizadas" />
        <MetricCard title="Solicitudes" value={String(metrics.pendingRequests)} description="Pendientes de aprobación" />
        <MetricCard title="Ingresos" value={formatCurrency(metrics.approvedRevenue)} description="Pagos aprobados" />
      </section>

      <section aria-labelledby="key-indicators-heading" className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 id="key-indicators-heading" className="text-xl font-bold">Indicadores clave</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            <li className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span>Usuarios registrados</span>
              <strong>{users.length}</strong>
            </li>
            <li className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span>Cursos cargados</span>
              <strong>{courses.length}</strong>
            </li>
            <li className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span>Pagos aprobados</span>
              <strong>{payments.filter((payment) => payment.status === "APPROVED").length}</strong>
            </li>
            <li className="flex items-center justify-between">
              <span>Enrolamientos pendientes</span>
              <strong>{metrics.pendingRequests}</strong>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Acciones rápidas</h2>
          <div className="mt-5 grid gap-3">
            <Link href="/admin/cursos" className="rounded-md bg-brand px-4 py-3 text-center font-semibold text-white">Administrar cursos</Link>
            <Link href="/admin/pagos" className="rounded-md border border-slate-300 px-4 py-3 text-center font-semibold text-ink">Configurar cobro</Link>
            <Link href="/admin/pagos/solicitudes" className="rounded-md border border-slate-300 px-4 py-3 text-center font-semibold text-ink">Revisar solicitudes</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </article>
  );
}
