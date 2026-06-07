import { z } from "zod";

const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/** エクスポート内の移動レコードスキーマ */
const movementExportSchema = z.object({
  role: z.string().min(1),
  targetX: z.number().finite(),
  targetZ: z.number().finite(),
  delay: z.number().min(0),
  arrowColor: z.string().regex(hexColorPattern),
});

/** エクスポート内のボールパスレコードスキーマ */
const ballPassExportSchema = z.object({
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

/** エクスポートファイル内の個別戦術スキーマ（id/timestamps なし） */
const tacticExportRecordSchema = z.object({
  name: z.record(z.string(), z.string()),
  icon: z.string(),
  phase: z.string(),
  movements: z.record(z.string(), z.array(movementExportSchema)),
  ballPasses: z.record(z.string(), z.array(ballPassExportSchema)).optional(),
  stepBoundaries: z.array(z.number().min(0)).optional(),
});

/** 戦術エクスポートファイル全体のスキーマ */
export const tacticExportDataSchema = z.object({
  version: z.number(),
  tactics: z.array(tacticExportRecordSchema),
});

export type TacticExportData = z.infer<typeof tacticExportDataSchema>;
