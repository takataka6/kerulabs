/**
 * ポジション別カラーマッピング。
 *
 * GK=黄, DF=青, MF=紫, FW=赤 のカラースキームを
 * SquadPanel / SubstitutesPanel / SquadBuilder / RightControlsColumn /
 * player-management/constants 間で共有する。
 */

import type { PositionCategory } from "@domain/types";

/** 型安全なポジションカテゴリのガード関数 */
function isPositionCategory(value: unknown): value is PositionCategory {
  return value === "gk" || value === "df" || value === "mf" || value === "fw";
}

/** 各ポジションの Tailwind カラー名（500レベル） */
export const POSITION_COLORS: Record<PositionCategory, string> = {
  gk: "yellow",
  df: "blue",
  mf: "violet",
  fw: "red",
} as const;

/** 不明なポジションカテゴリ用のフォールバック Hex カラー */
export const POSITION_FALLBACK_HEX_COLOR = "#ef4444";

/** 各ポジションの Hex カラー値（3D描画用） */
export const POSITION_HEX_COLORS: Record<PositionCategory, string> = {
  gk: "#facc15",
  df: "#3b82f6",
  mf: "#a855f7",
  fw: POSITION_FALLBACK_HEX_COLOR,
} as const;

/*
 * Tailwind JIT はテンプレートリテラル (`bg-${color}-500`) を検出できないため、
 * 完全なクラス名を静的にマッピングする。
 */

const BG_500: Record<PositionCategory, string> = {
  gk: "bg-yellow-500",
  df: "bg-blue-500",
  mf: "bg-violet-500",
  fw: "bg-red-500",
};

const BORDER_500: Record<PositionCategory, string> = {
  gk: "border-yellow-500",
  df: "border-blue-500",
  mf: "border-violet-500",
  fw: "border-red-500",
};

const BG_DARK: Record<PositionCategory, string> = {
  gk: "bg-yellow-600/60",
  df: "bg-blue-600/60",
  mf: "bg-violet-600/60",
  fw: "bg-red-600/60",
};

const BORDER_DARK: Record<PositionCategory, string> = {
  gk: "border-yellow-900/30",
  df: "border-blue-900/30",
  mf: "border-violet-900/30",
  fw: "border-red-900/30",
};

/** ポジション → `bg-{color}-500` クラス */
export function getPositionBg(
  position: string | undefined,
  fallback: string = "bg-gray-500",
): string {
  if (!isPositionCategory(position)) return fallback;
  return BG_500[position];
}

/** ポジション → `border-{color}-500` クラス */
export function getPositionBorder(
  position: string | undefined,
  fallback: string = "border-gray-500",
): string {
  if (!isPositionCategory(position)) return fallback;
  return BORDER_500[position];
}

/** ポジション → `bg-{color}-600/60` クラス（ダークUI用） */
export function getPositionBgDark(position: string | undefined): string {
  if (!isPositionCategory(position)) return "bg-gray-600/60";
  return BG_DARK[position];
}

/** ポジション → `border-{color}-900/30` クラス（ダークUI用） */
export function getPositionBorderDark(position: string | undefined): string {
  if (!isPositionCategory(position)) return "border-gray-900/30";
  return BORDER_DARK[position];
}
