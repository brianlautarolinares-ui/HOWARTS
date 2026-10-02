import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildVerificationUrl, createCertificateCode, generateCertificatePdf, generateQrDataUrl } from "./certificate";

describe("certificate helpers", () => {
  it("creates a stable certificate code from course and student data", () => {
    const code = createCertificateCode("Curso de React", "ana@ejemplo.com", new Date("2025-04-20T10:00:00Z"));

    expect(code).toMatch(/^CURSO-[A-Z0-9-]+$/i);
    expect(code).toContain("20250420");
  });

  it("builds a verification URL with the app base URL", () => {
    expect(buildVerificationUrl("CURSO-ANA-20250420", "https://campus.example.com")).toBe(
      "https://campus.example.com/verificar/CURSO-ANA-20250420"
    );
  });

  it("creates a PNG data URL for the QR code", async () => {
    const qr = await generateQrDataUrl("https://campus.example.com/verificar/CURSO-ANA-20250420");

    expect(qr).toMatch(/^data:image\/png;base64,/);
  });

  it("generates a valid PDF certificate document", async () => {
    const pdfBytes = await generateCertificatePdf({
      studentName: "Ana Pérez",
      courseTitle: "Curso de React",
      code: "CURSO-REACT-ANA-20250420",
      verificationUrl: "https://campus.example.com/verificar/CURSO-REACT-ANA-20250420",
      issuedAt: new Date("2025-04-20T10:00:00Z")
    });

    const pdfDocument = await PDFDocument.load(pdfBytes);
    expect(pdfDocument.getPageCount()).toBe(1);
  });
});
