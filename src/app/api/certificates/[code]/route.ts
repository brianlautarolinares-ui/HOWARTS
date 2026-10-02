import { buildVerificationUrl } from "@/lib/certificate";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const decodedCode = decodeURIComponent(code);

  const certificate = await prisma.certificate.findUnique({
    where: { code: decodedCode },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } }
    }
  });

  if (!certificate) {
    return Response.json({ valid: false, error: "Certificado no encontrado" }, { status: 404 });
  }

  return Response.json({
    valid: true,
    code: certificate.code,
    issuedAt: certificate.issuedAt.toISOString(),
    verificationUrl: buildVerificationUrl(certificate.code),
    student: {
      name: certificate.user.name,
      email: certificate.user.email
    },
    course: {
      title: certificate.course.title
    }
  });
}
