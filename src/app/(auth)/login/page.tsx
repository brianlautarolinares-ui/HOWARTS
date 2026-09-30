import { signIn } from "@/auth";
import Link from "next/link";
import { AuthError } from "next-auth";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/alumno"
      });
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        return;
      }
      throw error;
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Ingresar</h1>
      <form action={login} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white">Ingresar</button>
      </form>
      <p className="mt-5 text-sm text-slate-600">¿No tenés cuenta? <Link href="/registro">Registrate</Link>.</p>
    </section>
  );
}
