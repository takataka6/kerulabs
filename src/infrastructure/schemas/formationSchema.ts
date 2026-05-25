import { z } from "zod";

const positionCategory = z.enum(["gk", "df", "mf", "fw"]);
const gameMode = z.enum(["football", "futsal", "eight_aside", "society"]);

/** IndexedDB に保存されるポジションレコードのスキーマ */
export const positionRecordSchema = z.object({
  pos: z.string(),
  x: z.number(),
  z: z.number(),
  cat: positionCategory,
});

/** IndexedDB に保存されるフォーメーションレコードのスキーマ */
export const formationRecordSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.string().min(1),
  positions: z.array(positionRecordSchema),
  roleMap: z.record(z.string(), z.number()),
  isCustom: z.boolean(),
  gameMode: gameMode.optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type PositionRecord = z.infer<typeof positionRecordSchema>;
export type FormationRecord = z.infer<typeof formationRecordSchema>;
