/**
 * @module setPlayTypes
 * @description セットプレー種別の定数定義。セットピース・スローイン・ゴールキックのフェーズキー配列と型を提供する。
 */
import type { PhaseKey } from "./phases";

export const SET_PLAY_TYPES: PhaseKey[] = [
  "set_piece",
  "throw_in",
  "goal_kick",
] as const;

export type SetPlayType = (typeof SET_PLAY_TYPES)[number];
