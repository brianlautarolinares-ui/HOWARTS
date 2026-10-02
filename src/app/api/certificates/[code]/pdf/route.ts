import { buildVerificationUrl, generateCertificatePdf } from "@/lib/certificate";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const decodedCode = decodeURIComponent(code);
  const origin = new URL(request.url).origin;

  const certificate = await prisma.certificate.findUnique({
    where: { code: decodedCode },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } }
    }
  });

  if (!certificate) {
    return Response.json({ valid: false, error: "Certificado no encontrado" }, { status: 404 });
  }

  const verificationUrl = buildVerificationUrl(certificate.code, origin);

  const pdfBytes = await generateCertificatePdf({
    studentName: certificate.user.name,
    courseTitle: certificate.course.title,
    code: certificate.code,
    verificationUrl,
    issuedAt: certificate.issuedAt
  });

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${certificate.code}.pdf"`
    }
  });
}
