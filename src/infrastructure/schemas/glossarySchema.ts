import { z } from "zod";

/** 用語のスキーマ */
export const glossaryTermSchema = z.object({
  id: z.string(),
  term: z.string(),
  reading: z.string().optional(),
  description: z.string(),
  keywords: z.array(z.string()),
});

/** IndexedDB に保存される用語集レコードのスキーマ */
export const glossaryRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  gameMode: z.string().optional(),
  terms: z.array(glossaryTermSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;
export type GlossaryRecord = z.infer<typeof glossaryRecordSchema>;
