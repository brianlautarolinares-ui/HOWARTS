import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

function sanitizeCodePart(value: string, fallback: string, maxLength: number) {
  const cleaned = value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (!cleaned) {
    return fallback.slice(0, maxLength).toUpperCase();
  }

  return cleaned.slice(0, maxLength);
}

export function createCertificateCode(courseTitle: string, email: string, issuedAt: Date = new Date()) {
  const coursePart = sanitizeCodePart(courseTitle, "CURSO", 8);
  const userPart = sanitizeCodePart(email.split("@")[0] || "ALUMNO", "ALUMNO", 8);
  const datePart = new Date(issuedAt).toISOString().slice(0, 10).replace(/-/g, "");

  return `CURSO-${coursePart}-${userPart}-${datePart}`.toUpperCase();
}

export function buildVerificationUrl(code: string, baseUrl: string = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  return `${normalizedBaseUrl}/verificar/${encodeURIComponent(code)}`;
}

export async function generateQrDataUrl(url: string) {
  return QRCode.toDataURL(url, {
    width: 220,
    margin: 1,
    errorCorrectionLevel: "M"
  });
}

export async function generateCertificatePdf({
  studentName,
  courseTitle,
  code,
  verificationUrl,
  issuedAt
}: {
  studentName: string;
  courseTitle: string;
  code: string;
  verificationUrl: string;
  issuedAt: Date;
}) {
  const document = await PDFDocument.create();
  const page = document.addPage([595, 842]);
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const textFont = await document.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 40,
    y: 40,
    width: 515,
    height: 762,
    borderColor: rgb(0.12, 0.18, 0.35),
    borderWidth: 2,
    color: rgb(1, 1, 1)
  });

  page.drawText("CERTIFICADO", {
    x: 220,
    y: 740,
    size: 26,
    font,
    color: rgb(0.12, 0.18, 0.35)
  });

  page.drawText("Se certifica que", {
    x: 80,
    y: 660,
    size: 22,
    font: textFont,
    color: rgb(0.2, 0.2, 0.2)
  });

  page.drawText(studentName, {
    x: 80,
    y: 610,
    size: 30,
    font,
    color: rgb(0.08, 0.12, 0.21)
  });

  page.drawText(`ha completado satisfactoriamente el curso`, {
    x: 80,
    y: 570,
    size: 20,
    font: textFont,
    color: rgb(0.2, 0.2, 0.2)
  });

  page.drawText(courseTitle, {
    x: 80,
    y: 520,
    size: 24,
    font,
    color: rgb(0.12, 0.18, 0.35)
  });

  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires"
  }).format(issuedAt);

  page.drawText(`Emitido el ${dateLabel}`, {
    x: 80,
    y: 470,
    size: 14,
    font: textFont,
    color: rgb(0.25, 0.25, 0.25)
  });

  page.drawText(`Código: ${code}`, {
    x: 80,
    y: 430,
    size: 12,
    font: textFont,
    color: rgb(0.25, 0.25, 0.25)
  });

  page.drawText("Verificación pública:", {
    x: 80,
    y: 390,
    size: 12,
    font: textFont,
    color: rgb(0.25, 0.25, 0.25)
  });

  const wrappedUrl = verificationUrl.length > 54 ? `${verificationUrl.slice(0, 54)}…` : verificationUrl;
  page.drawText(wrappedUrl, {
    x: 80,
    y: 370,
    size: 11,
    font: textFont,
    color: rgb(0.18, 0.18, 0.18)
  });

  const qrDataUrl = await generateQrDataUrl(verificationUrl);
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrImage = await document.embedPng(Buffer.from(qrBase64, "base64"));

  page.drawImage(qrImage, {
    x: 420,
    y: 100,
    width: 100,
    height: 100
  });

  return document.save();
}
