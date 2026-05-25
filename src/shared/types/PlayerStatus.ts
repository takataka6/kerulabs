/**
 * @module PlayerStatus
 * @description 選手の起用可否ステータスの型定義。available（出場可能）・suspended（出場停止）・injured（負傷）の3状態を定義する。
 */

/** 選手の起用可否ステータス */
export type PlayerStatus = "available" | "suspended" | "injured";

export const PLAYER_STATUSES: PlayerStatus[] = [
  "available",
  "suspended",
  "injured",
];
