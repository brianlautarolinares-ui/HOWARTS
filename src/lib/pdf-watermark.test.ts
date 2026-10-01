import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { watermarkPdf } from "./pdf-watermark";

describe("watermarkPdf", () => {
  it("keeps a readable PDF and records the author credit", async () => {
    const original = await PDFDocument.create();
    original.addPage();

    const result = await watermarkPdf(await original.save(), "alumno@example.com", "Autora del curso");
    const stamped = await PDFDocument.load(result);

    expect(stamped.getPages()).toHaveLength(1);
    expect(stamped.getAuthor()).toBe("Autora del curso");
    expect(result.byteLength).toBeGreaterThan(0);
  });
});