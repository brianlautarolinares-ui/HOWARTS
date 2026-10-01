import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);

export const paymentSettingsSchema = z.object({
  institution: optionalText(120),
  accountHolder: optionalText(120),
  accountIdentifier: optionalText(140),
  alias: optionalText(100),
  taxId: optionalText(40),
  instructions: optionalText(2000)
}).refine((settings) => settings.accountIdentifier || settings.alias, {
  path: ["accountIdentifier"],
  message: "Ingresá un CBU/CVU, número de cuenta o alias para recibir pagos."
});