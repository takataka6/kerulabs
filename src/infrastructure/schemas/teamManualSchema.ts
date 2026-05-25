import { z } from "zod";

/** マニュアル項目のスキーマ */
export const manualItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  diagram: z.string().optional(),
  linkedTacticIds: z.array(z.string()),
});

/** マニュアルセクションのスキーマ */
export const manualSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    "offense",
    "defense",
    "positive_transition",
    "negative_transition",
    "set_piece",
    "position_task",
    "free_note",
  ]),
  formations: z.array(z.string()),
  items: z.array(manualItemSchema),
});

/** IndexedDB に保存されるチームマニュアルレコードのスキーマ */
export const teamManualRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  teamId: z.string().optional(),
  sections: z.array(manualSectionSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ManualItemRecord = z.infer<typeof manualItemSchema>;
export type ManualSectionRecord = z.infer<typeof manualSectionSchema>;
export type TeamManualRecord = z.infer<typeof teamManualRecordSchema>;
