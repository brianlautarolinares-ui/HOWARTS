import { describe, expect, it } from "vitest";
import { courseManagementSchema, liveClassSchema } from "./course-content";

describe("courseManagementSchema", () => {
  it("parses a valid ARS course price", () => {
    const result = courseManagementSchema.safeParse({
      title: "Fotografía inicial",
      slug: "fotografia-inicial",
      summary: "Aprendé las bases de la fotografía digital.",
      description: "Programa completo de la capacitación.",
      priceArs: "25000",
      status: "DRAFT"
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.priceArs).toBe(25000);
  });

  it("rejects zero, decimals and non-numeric prices", () => {
    for (const priceArs of ["0", "12.50", "texto"]) {
      expect(courseManagementSchema.safeParse({
        title: "Fotografía inicial",
        slug: "fotografia-inicial",
        summary: "Aprendé las bases de la fotografía digital.",
        description: "Programa completo de la capacitación.",
        priceArs,
        status: "DRAFT"
      }).success).toBe(false);
    }
  });
});

describe("liveClassSchema", () => {
  it("requires valid meeting URLs", () => {
    const valid = {
      stageId: "stage-1",
      title: "Encuentro inicial",
      scheduledAt: "2026-10-20T18:30",
      meetingUrl: "https://meet.example.com/class"
    };

    expect(liveClassSchema.safeParse(valid).success).toBe(true);
    expect(liveClassSchema.safeParse({ ...valid, meetingUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});