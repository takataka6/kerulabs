import { z } from "zod";

const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/** IndexedDB / エクスポートで使用する移動レコードのスキーマ */
export const movementRecordSchema = z.object({
  role: z.string().min(1),
  targetX: z.number().finite(),
  targetZ: z.number().finite(),
  delay: z.number().min(0),
  arrowColor: z.string().regex(hexColorPattern),
});

/** IndexedDB / エクスポートで使用するボールパスレコードのスキーマ */
export const ballPassRecordSchema = z.object({
  startRole: z.string(),
  endRole: z.string(),
  delay: z.number().min(0),
  color: z.string().regex(hexColorPattern),
  endX: z.number().optional(),
  endZ: z.number().optional(),
  startX: z.number().optional(),
  startZ: z.number().optional(),
  trajectoryType: z.enum(["low", "high", "curveLeft", "curveRight"]).optional(),
});

/** IndexedDB に保存される戦術レコードのスキーマ */
export const tacticRecordSchema = z.object({
  id: z.string(),
  name: z.record(z.string(), z.string()),
  icon: z.string(),
  phase: z.string(),
  movements: z.record(z.string(), z.array(movementRecordSchema)),
  ballPasses: z.record(z.string(), z.array(ballPassRecordSchema)).optional(),
  ballPosition: z.object({ x: z.number(), z: z.number() }).optional(),
  stepBoundaries: z.array(z.number().min(0)).optional(),
  isCustom: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type MovementRecord = z.infer<typeof movementRecordSchema>;
export type BallPassRecord = z.infer<typeof ballPassRecordSchema>;
export type TacticRecord = z.infer<typeof tacticRecordSchema>;
