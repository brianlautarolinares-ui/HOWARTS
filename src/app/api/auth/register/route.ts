import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const allowed = await checkAuthRateLimit(`register:${forwardedFor ?? "unknown"}`);

    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Probá nuevamente en unos minutos." },
        { status: 429 }
      );
    }

    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true }
    });

    if (existing) {
      return NextResponse.json(
        { error: "No se pudo crear la cuenta con esos datos." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash
      },
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    console.error("register_error", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
