import { describe, expect, it } from "vitest";
import { registerSchema } from "./auth";

describe("registerSchema", () => {
  it("normalizes email and accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Ana Pérez",
      email: " ANA@example.com ",
      password: "SecurePass123"
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("ana@example.com");
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "alllowercase"
    });

    expect(result.success).toBe(false);
  });
});