import { buildVerificationUrl, generateQrDataUrl } from "@/lib/certificate";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function VerifyCertificatePage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);

  const certificate = await prisma.certificate.findUnique({
    where: { code: decodedCode },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } }
    }
  });

  if (!certificate) notFound();

  const verificationUrl = buildVerificationUrl(certificate.code);
  const qrDataUrl = await generateQrDataUrl(verificationUrl);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Certificado verificado</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">{certificate.course.title}</h1>
        <p className="mt-3 text-slate-600">Emitido a favor de {certificate.user.name}.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-ink">Código</p>
              <p>{certificate.code}</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Fecha de emisión</p>
              <p>
                {new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "long",
                  timeStyle: "short",
                  timeZone: "America/Argentina/Buenos_Aires"
                }).format(certificate.issuedAt)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Verificación pública</p>
              <a href={verificationUrl} className="break-all text-brand underline" target="_blank" rel="noreferrer">
                {verificationUrl}
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src={qrDataUrl}
              alt={`Código QR del certificado ${certificate.code}`}
              width={220}
              height={220}
              unoptimized
              className="rounded-lg border border-slate-200 bg-white p-2"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`/api/certificates/${encodeURIComponent(certificate.code)}/pdf`} target="_blank" rel="noreferrer" className="rounded-md bg-brand px-4 py-2 font-semibold text-white">
            Descargar certificado PDF
          </a>
          <Link href="/" className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-ink">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
