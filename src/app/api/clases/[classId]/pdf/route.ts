import { auth } from "@/auth";
import { canAccessCourse } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import { watermarkPdf } from "@/lib/pdf-watermark";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ classId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 });
  }

  const { classId } = await context.params;
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
    select: {
      releasedAt: true,
      stage: { select: { courseId: true } }
    }
  });

  if (!liveClass?.releasedAt) {
    return NextResponse.json({ error: "Material no disponible." }, { status: 404 });
  }

  if (session.user.role !== "ADMIN") {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: liveClass.stage.courseId } },
      select: { status: true }
    });
    if (!canAccessCourse("STUDENT", enrollment?.status ?? null)) {
      return NextResponse.json({ error: "No tenés acceso a este material." }, { status: 403 });
    }
  }

  const material = await prisma.liveClass.findUnique({
    where: { id: classId },
    select: { pdfData: true, pdfName: true, authorCredit: true }
  });
  if (!material?.pdfData) {
    return NextResponse.json({ error: "Material no disponible." }, { status: 404 });
  }

  let watermarkedPdf: Uint8Array;
  try {
    const studentLabel = session.user.email ?? session.user.name ?? "Alumno";
    watermarkedPdf = await watermarkPdf(
      material.pdfData,
      studentLabel,
      material.authorCredit ?? "Material de curso"
    );
  } catch (error: unknown) {
    console.error("pdf_watermark_error", error);
    return NextResponse.json({ error: "No se pudo preparar el material." }, { status: 500 });
  }

  return new Response(watermarkedPdf as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(material.pdfName ?? "material.pdf")}`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'"
    }
  });
}