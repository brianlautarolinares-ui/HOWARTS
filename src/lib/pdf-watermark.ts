import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export async function watermarkPdf(
  source: Uint8Array,
  studentLabel: string,
  authorCredit: string
) {
  const document = await PDFDocument.load(source);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const watermark = `${studentLabel} | ${authorCredit}`;

  for (const page of document.getPages()) {
    const { width, height } = page.getSize();
    const columns = Math.max(1, Math.ceil(width / 300));
    const rows = Math.max(1, Math.ceil(height / 180));

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        page.drawText(watermark, {
          x: 24 + column * 300,
          y: 28 + row * 180,
          size: 10,
          font,
          color: rgb(0.25, 0.25, 0.25),
          opacity: 0.22,
          rotate: degrees(32)
        });
      }
    }
  }

  document.setAuthor(authorCredit);
  return document.save();
}