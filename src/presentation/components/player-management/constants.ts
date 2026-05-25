/**
 * @module player-management/constants
 * @description 選手管理で使用する定数・型定義。ポジション設定・ソート種別・一括インポートスキーマを提供する。
 */
import type { PositionCategory } from "@domain/types";
import {
  getPositionBgDark,
  getPositionBorderDark,
} from "@shared/constants/positionColors";
import { z } from "zod";

// ── Types ──

export type SortBy = "number" | "name" | "position";
export type FilterPosition = "all" | PositionCategory;

// ── Position config ──

export const POSITION_CONFIG: Record<
  PositionCategory,
  { label: string; color: string; borderColor: string; icon: string }
> = {
  gk: {
    label: "GK",
    color: getPositionBgDark("gk"),
    borderColor: getPositionBorderDark("gk"),
    icon: "🧤",
  },
  df: {
    label: "DF",
    color: getPositionBgDark("df"),
    borderColor: getPositionBorderDark("df"),
    icon: "🛡️",
  },
  mf: {
    label: "MF",
    color: getPositionBgDark("mf"),
    borderColor: getPositionBorderDark("mf"),
    icon: "⚡",
  },
  fw: {
    label: "FW",
    color: getPositionBgDark("fw"),
    borderColor: getPositionBorderDark("fw"),
    icon: "⚽",
  },
};

// ── Bulk import schema ──

export const playerBulkImportSchema = z.array(
  z.object({
    name: z.string(),
    number: z.coerce.number(),
    position: z.string().optional(),
    nationality: z.string().optional(),
    club: z.string().optional(),
    leagueCountry: z.string().optional(),
    note: z.string().optional(),
    status: z.enum(["available", "suspended", "injured"]).optional(),
  }),
);
