import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string()
    .min(10)
    .regex(/[a-z]/, "Debe incluir una minúscula.")
    .regex(/[A-Z]/, "Debe incluir una mayúscula.")
    .regex(/[0-9]/, "Debe incluir un número.")
});