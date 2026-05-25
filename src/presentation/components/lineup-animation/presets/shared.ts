/**
 * @module lineup-animation/presets/shared
 * @description アニメーションプリセット間で共有されるユーティリティ関数・定数。カテゴリ順序・色計算・グループ化ヘルパーを提供する。
 */
import { useMemo } from "react";
import type { LineupPlayer } from "../types";

/** ポジションカテゴリの表示順序: GK → DF → MF → FW */
export const CATEGORY_ORDER: Record<string, number> = {
  gk: 0,
  df: 1,
  mf: 2,
  fw: 3,
};

/** ポジションの短縮ラベル */
export const CATEGORY_LABEL_SHORT: Record<string, string> = {
  gk: "GK",
  df: "DF",
  mf: "MF",
  fw: "FW",
};

/** ポジションの正式名称ラベル（シネマティックスタイル用） */
export const CATEGORY_LABEL_FULL: Record<string, string> = {
  gk: "GOALKEEPER",
  df: "DEFENDER",
  mf: "MIDFIELDER",
  fw: "FORWARD",
};

/** チームカラーからメインアクセントカラーを導出する */
export function getMainColor(colors: Record<string, string>): string {
  return colors.df || colors.mf || "#3b82f6";
}

/** 特定の選手のカテゴリに対応するカラーを取得する */
export function getPlayerColor(
  player: LineupPlayer,
  colors: Record<string, string>,
  fallback: string,
): string {
  return colors[player.category as keyof typeof colors] || fallback;
}

/** フック: 選手をポジションカテゴリ順にソートする（メモ化済み） */
export function useSortedPlayers(players: LineupPlayer[]): LineupPlayer[] {
  return useMemo(
    () =>
      [...players].sort(
        (a, b) =>
          (CATEGORY_ORDER[a.category] ?? 2) - (CATEGORY_ORDER[b.category] ?? 2),
      ),
    [players],
  );
}
