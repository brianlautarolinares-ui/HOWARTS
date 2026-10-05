"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ConfirmPaymentFormProps = {
  userId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  amountArs: number;
};

export function ConfirmPaymentForm({ userId, studentName, courseId, courseTitle, amountArs }: ConfirmPaymentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId,
          amountArs,
          method: formData.get("method"),
          reference: formData.get("reference")
        })
      });

      if (!response.ok) {
        const result: unknown = await response.json();
        const message = typeof result === "object" && result !== null && "error" in result
          ? String((result as { error: unknown }).error)
          : "No se pudo confirmar el pago.";
        setError(message);
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label={`Confirmar pago de ${studentName} para ${courseTitle}`} className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-medium">
        Medio recibido
        <select name="method" defaultValue="BANK_TRANSFER" className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base">
          <option value="BANK_TRANSFER">Transferencia</option>
          <option value="CASH">Efectivo</option>
        </select>
      </label>
      <label className="text-sm font-medium">
        Referencia o comprobante (opcional)
        <input name="reference" maxLength={120} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base" />
      </label>
      <button disabled={isPending} type="submit" className="rounded-md bg-brand px-4 py-2 font-semibold text-white disabled:opacity-50">
        Confirmar pago
      </button>
      {error ? <p role="alert" className="text-sm text-red-700 sm:col-span-3">{error}</p> : null}
    </form>
  );
}