import { auth } from "@/auth";
import { canAccessCourse } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  const { courseId } = await context.params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, status: true }
  });

  if (!course || course.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Curso no encontrado." }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    select: { status: true }
  });
  const role = session.user.role === "ADMIN" ? "ADMIN" : "STUDENT";

  if (!canAccessCourse(role, enrollment?.status ?? null)) {
    return NextResponse.json({ error: "No tenés acceso a este curso." }, { status: 403 });
  }

  return NextResponse.json({ access: true, course });
}