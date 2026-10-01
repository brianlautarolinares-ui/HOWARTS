import { z } from "zod";

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
  meetingUrl: z.string().trim().max(500).refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Ingresá un enlace http o https válido.")
});

export const classMaterialSchema = z.object({
  classId: z.string().min(1),
  developedTopic: z.string().trim().min(10).max(20000),
  authorCredit: z.string().trim().min(2).max(120)
});