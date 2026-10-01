import { signOut } from "@/auth";

export function LogoutButton() {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <form action={logout}>
      <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 font-medium">
        Cerrar sesión
      </button>
    </form>
  );
}