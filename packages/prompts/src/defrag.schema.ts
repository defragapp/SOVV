import { z } from "zod";

export const DefragResultSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(280),

  whatsActive: z.string().min(1).max(500),
  activePattern: z.string().min(1).max(500),
  theRepeat: z.string().min(1).max(500),
  pressure: z.string().min(1).max(500),
  whatHelps: z.string().min(1).max(500),
  bestNextResponse: z.string().min(1).max(500),

  limits: z.string().min(1).max(300),
  confidence: z.enum(["High", "Medium", "Low", "Not enough information"]),
});

export type DefragResult = z.infer<typeof DefragResultSchema>;
