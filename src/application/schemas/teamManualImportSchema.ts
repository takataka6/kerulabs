import { z } from "zod";

/** インポート用のマニュアル項目スキーマ（id なし） */
const manualItemImportSchema = z.object({
  title: z.string().optional().default(""),
  content: z.string().optional().default(""),
  diagram: z.string().optional(),
  linkedTacticIds: z.array(z.string()).optional().default([]),
});

/** インポート用のマニュアルセクションスキーマ（id なし） */
const manualSectionImportSchema = z.object({
  title: z.string().optional().default(""),
  category: z
    .enum([
      "offense",
      "defense",
      "positive_transition",
      "negative_transition",
      "set_piece",
      "position_task",
      "free_note",
    ])
    .optional()
    .default("free_note"),
  formations: z.array(z.string()).optional().default([]),
  items: z.array(manualItemImportSchema).optional().default([]),
});

/** インポート用のチームマニュアルスキーマ */
export const teamManualImportSchema = z.object({
  name: z.string().optional().default("Untitled"),
  description: z.string().optional().default(""),
  teamId: z.string().optional(),
  sections: z.array(manualSectionImportSchema).optional().default([]),
});

export type TeamManualImportData = z.infer<typeof teamManualImportSchema>;
