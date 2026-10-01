"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? "")
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data: unknown = await response.json();
      if (!response.ok) {
        const message = typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: unknown }).error)
          : "No se pudo crear la cuenta.";
        setError(message);
        return;
      }

      router.push("/login");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Nombre</label>
          <input id="name" name="name" autoComplete="name" required minLength={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <p className="mt-1 text-xs text-slate-500">Mínimo 10 caracteres, mayúscula, minúscula y número.</p>
        </div>
        {error ? <p role="alert" className="text-sm font-medium text-red-700">{error}</p> : null}
        <button disabled={loading} type="submit" className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white disabled:opacity-50">
          {loading ? "Creando cuenta…" : "Registrarme"}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">¿Ya tenés cuenta? <Link href="/login">Ingresá</Link>.</p>
    </main>
  );
}
