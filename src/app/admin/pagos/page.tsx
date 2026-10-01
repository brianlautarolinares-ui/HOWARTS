import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { savePaymentSettings } from "./actions";

export default async function PaymentSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ guardado?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/alumno");

  const [settings, params] = await Promise.all([
    prisma.paymentSettings.findUnique({ where: { id: "default" } }),
    searchParams
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <nav className="flex gap-5 text-sm font-semibold text-brand">
        <Link href="/alumno">Volver al campus</Link>
        <Link href="/admin/cursos">Administrar cursos</Link>
      </nav>
      <h1 className="mt-6 text-3xl font-bold">Datos para recibir pagos</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Estos datos se mostrarán a los alumnos al solicitar un curso o capacitación.
      </p>

      {params.guardado === "1" ? (
        <p role="status" className="mt-6 border-l-4 border-emerald-600 bg-white p-4 text-sm">
          Los datos de cobro se guardaron correctamente.
        </p>
      ) : null}
      {params.error === "datos" ? (
        <p role="alert" className="mt-6 border-l-4 border-red-700 bg-white p-4 text-sm">
          Ingresá un CBU/CVU, número de cuenta o alias para recibir pagos.
        </p>
      ) : null}

      <form action={savePaymentSettings} className="mt-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Banco, billetera o medio de pago
            <input name="institution" defaultValue={settings?.institution ?? ""} maxLength={120} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="block text-sm font-medium">
            Titular de la cuenta
            <input name="accountHolder" defaultValue={settings?.accountHolder ?? ""} maxLength={120} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="block text-sm font-medium">
            CBU/CVU, número o identificador de cuenta
            <input name="accountIdentifier" defaultValue={settings?.accountIdentifier ?? ""} maxLength={140} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="block text-sm font-medium">
            Alias
            <input name="alias" defaultValue={settings?.alias ?? ""} maxLength={100} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            CUIT/CUIL del titular (opcional)
            <input name="taxId" defaultValue={settings?.taxId ?? ""} maxLength={40} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Instrucciones para el alumno
            <textarea name="instructions" defaultValue={settings?.instructions ?? ""} maxLength={2000} rows={4} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
          </label>
        </div>
        <button type="submit" className="rounded-md bg-brand px-5 py-3 font-semibold text-white">
          Guardar datos de cobro
        </button>
      </form>
    </main>
  );
}