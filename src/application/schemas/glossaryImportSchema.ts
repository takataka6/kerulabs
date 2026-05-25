import { z } from "zod";

/** インポート用の用語スキーマ（id なし） */
const glossaryTermImportSchema = z.object({
  term: z.string().optional().default(""),
  reading: z.string().optional(),
  description: z.string().optional().default(""),
  keywords: z.array(z.string()).optional(),
});

/** インポート用の用語集スキーマ */
export const glossaryImportSchema = z.object({
  name: z.string().optional().default("Untitled"),
  description: z.string().optional().default(""),
  terms: z.array(glossaryTermImportSchema).optional().default([]),
});

export type GlossaryImportData = z.infer<typeof glossaryImportSchema>;
