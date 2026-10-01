import { describe, expect, it } from "vitest";
import { canAccessCourse } from "./course-access";

describe("canAccessCourse", () => {
  it("permite acceso administrativo sin inscripción", () => {
    expect(canAccessCourse("ADMIN", null)).toBe(true);
  });

  it("permite acceso a una inscripción activa o completada", () => {
    expect(canAccessCourse("STUDENT", "ACTIVE")).toBe(true);
    expect(canAccessCourse("STUDENT", "COMPLETED")).toBe(true);
  });

  it("rechaza inscripciones pendientes, canceladas o inexistentes", () => {
    expect(canAccessCourse("STUDENT", "PENDING")).toBe(false);
    expect(canAccessCourse("STUDENT", "CANCELLED")).toBe(false);
    expect(canAccessCourse("STUDENT", null)).toBe(false);
  });
});