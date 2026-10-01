import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requestEnrollment } from "./actions";

export default async function CoursePaymentPage({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ solicitud?: string }>;
}) {
  const [{ courseId }, query, session] = await Promise.all([params, searchParams, auth()]);
  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, title: true, summary: true, priceArs: true }
  });
  if (!course) notFound();

  const [settings, enrollment] = await Promise.all([
    prisma.paymentSettings.findUnique({ where: { id: "default" } }),
    session?.user?.id
      ? prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.user.id, courseId } },
          select: { status: true }
        })
      : Promise.resolve(null)
  ]);
  const hasPaymentDestination = Boolean(settings?.accountIdentifier || settings?.alias);
  const paymentDetails = [
    ["Entidad", settings?.institution],
    ["Titular", settings?.accountHolder],
    ["CBU/CVU o cuenta", settings?.accountIdentifier],
    ["Alias", settings?.alias],
    ["CUIT/CUIL", settings?.taxId]
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));
  const isEnrolled = enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-brand">Volver a los cursos</Link>
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_0.85fr]">
        <section>
          <p className="text-sm font-semibold uppercase text-brand">Inscripción al curso</p>
          <h1 className="mt-3 text-3xl font-bold">{course.title}</h1>
          <p className="mt-3 leading-7 text-slate-600">{course.summary}</p>
          <p className="mt-6 text-2xl font-bold">
            {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(course.priceArs)}
          </p>
        </section>

        <section className="border border-slate-200 bg-white p-6" aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-xl font-bold">Datos para realizar el pago</h2>
          {hasPaymentDestination ? (
            <>
              <dl className="mt-5 divide-y divide-slate-200">
                {paymentDetails.map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="break-words font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              {settings?.instructions ? (
                <div className="mt-4 border-l-4 border-brand bg-paper p-4">
                  <h3 className="text-sm font-semibold">Instrucciones</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{settings.instructions}</p>
                </div>
              ) : null}
              <p className="mt-4 text-sm text-slate-600">
                El acceso se habilita cuando la administración confirma el pago.
              </p>

              {isEnrolled ? (
                <p className="mt-5 border-l-4 border-emerald-600 bg-emerald-50 p-4 text-sm font-medium">
                  Ya tenés acceso a este curso. Lo encontrarás en tu campus.
                </p>
              ) : enrollment?.status === "PENDING" ? (
                <p role="status" className="mt-5 border-l-4 border-amber-600 bg-amber-50 p-4 text-sm">
                  Tu solicitud está pendiente de confirmación. Conservá el comprobante de pago.
                </p>
              ) : query.solicitud === "pendiente" ? (
                <p role="status" className="mt-5 border-l-4 border-amber-600 bg-amber-50 p-4 text-sm">
                  Registramos tu solicitud. La administración confirmará el pago para habilitar el acceso.
                </p>
              ) : session?.user ? (
                <form action={requestEnrollment.bind(null, course.id)} className="mt-5">
                  <button type="submit" className="w-full rounded-md bg-brand px-4 py-3 font-semibold text-white">
                    Ya pagué, solicitar acceso
                  </button>
                </form>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(`/cursos/${course.id}/pagar`)}`}
                  className="mt-5 inline-flex w-full justify-center rounded-md bg-brand px-4 py-3 text-center font-semibold text-white"
                >
                  Ingresar para solicitar acceso
                </Link>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              El administrador todavía no configuró una cuenta para recibir pagos. Volvé a consultar más tarde.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}