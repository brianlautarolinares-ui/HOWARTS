import { auth } from "@/auth";
import { ConfirmPaymentForm } from "@/components/confirm-payment-form";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PendingPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/alumno");

  const enrollments = await prisma.enrollment.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, priceArs: true } }
    },
    orderBy: { enrolledAt: "asc" }
  });

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <nav aria-label="Navegación de administración" className="flex flex-wrap gap-5 text-sm font-semibold text-brand">
        <Link href="/alumno">Volver al campus</Link>
        <Link href="/admin/cursos">Administrar cursos</Link>
        <Link href="/admin/pagos">Datos de cobro</Link>
      </nav>
      <h1 className="mt-7 text-3xl font-bold">Solicitudes de pago</h1>
      <p className="mt-2 text-slate-600">Confirmá el ingreso del dinero para habilitar el curso al alumno.</p>

      {enrollments.length === 0 ? (
        <p className="mt-8 border-t border-slate-300 py-6 text-slate-600">No hay pagos pendientes de confirmación.</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-300">
          {enrollments.map((enrollment) => (
            <li key={enrollment.id} className="py-6">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <h2 className="font-bold">{enrollment.course.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{enrollment.user.name} · {enrollment.user.email}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Solicitud: {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(enrollment.enrolledAt)}
                  </p>
                </div>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(enrollment.course.priceArs)}
                </p>
              </div>
              <ConfirmPaymentForm
                userId={enrollment.user.id}
                studentName={enrollment.user.name}
                courseId={enrollment.course.id}
                courseTitle={enrollment.course.title}
                amountArs={enrollment.course.priceArs}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}