import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { enrolledAt: "desc" }
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mi campus</h1>
          <p className="mt-1 text-slate-600">Hola, {session.user.name ?? "alumno"}.</p>
          {session.user.role === "ADMIN" ? (
            <Link href="/admin/pagos" className="mt-3 inline-block text-sm font-semibold text-brand">
              Configurar datos de cobro
            </Link>
          ) : null}
        </div>
        <LogoutButton />
      </div>
      <h2 className="mt-10 text-xl font-bold">Mis cursos</h2>
      {enrollments.length === 0 ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-white p-6">Todavía no tenés cursos asignados.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {enrollments.map((enrollment) => (
            <article key={enrollment.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold">{enrollment.course.title}</h3>
              <p className="mt-2 text-sm text-slate-600">Estado: {enrollment.status}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
