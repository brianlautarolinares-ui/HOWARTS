import { describe, expect, it } from "vitest";
import { paymentSettingsSchema } from "./payment-settings";

describe("paymentSettingsSchema", () => {
  it("accepts and trims a transfer account", () => {
    const result = paymentSettingsSchema.safeParse({
      institution: " Banco Demo ",
      accountHolder: " Ana Pérez ",
      accountIdentifier: " 0000000000000000000000 ",
      alias: " ana.cursos ",
      taxId: "",
      instructions: "Enviar comprobante luego de transferir. "
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.institution).toBe("Banco Demo");
      expect(result.data.taxId).toBeNull();
    }
  });

  it("requires an account number or alias", () => {
    const result = paymentSettingsSchema.safeParse({
      institution: "Banco Demo",
      accountHolder: "Ana Pérez",
      accountIdentifier: "",
      alias: "",
      taxId: "",
      instructions: ""
    });

    expect(result.success).toBe(false);
  });
});