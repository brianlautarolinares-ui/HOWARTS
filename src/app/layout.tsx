import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Educativo",
  description: "Campus virtual de cursos online."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}