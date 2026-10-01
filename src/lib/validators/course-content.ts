import { z } from "zod";

const isHttpUrl = (value: string) => {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const courseManagementSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(10).max(10000),
  priceArs: z.string().regex(/^[1-9]\d{0,8}$/).transform(Number),
  status: z.enum(["DRAFT", "PUBLISHED"])
});

export const courseStageSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().min(2).max(120)
});

export const liveClassSchema = z.object({
  stageId: z.string().min(1),
  title: z.string().trim().min(2).max(160),
  scheduledAt: z.string().refine((value) => {
    const date = new Date(value);
    return value.length > 0 && !Number.isNaN(date.getTime());
  }, "Ingresá una fecha y hora válidas."),
  meetingUrl: z.string().trim().max(500).refine(isHttpUrl, "Ingresá un enlace http o https válido.")
});

export const classMaterialSchema = z.object({
  classId: z.string().min(1),
  developedTopic: z.string().trim().min(10).max(20000),
  authorCredit: z.string().trim().min(2).max(120),
  recordingUrl: z.string().trim().max(500).refine(isHttpUrl, "Ingresá un enlace http o https válido.")
});

export const quizQuestionSchema = z.object({
  liveClassId: z.string().min(1),
  prompt: z.string().trim().min(5).max(1000),
  choices: z.string().transform((value) => [...new Set(value.split(/\r?\n/).map((choice) => choice.trim()).filter(Boolean))])
    .refine((choices) => choices.length >= 2 && choices.length <= 6, "Ingresá entre 2 y 6 opciones distintas."),
  correctAnswer: z.string().trim().min(1).max(300),
  passingPercent: z.string().regex(/^(100|[1-9]?\d)$/).transform(Number)
}).refine((question) => question.choices.some(
  (choice) => choice.toLocaleLowerCase() === question.correctAnswer.toLocaleLowerCase()
), {
  path: ["correctAnswer"],
  message: "La respuesta correcta debe ser una de las opciones."
});

export const coursePublicationSchema = z.object({
  courseId: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"])
});