/**
 * @module GameMode
 * @description ゲームモードの型定義とユーティリティ。サッカー・フットサル・8人制・ソサイチの各モードを表す型、定数配列、型ガード関数を提供する。
 */

/** ゲームモード（サッカー・フットサル・8人制・ソサイチ） */
export type GameMode = "football" | "futsal" | "eight_aside" | "society";

/** 全ゲームモードの定数配列 */
export const GAME_MODES: readonly GameMode[] = [
  "football",
  "futsal",
  "eight_aside",
  "society",
] as const;

/**
 * 文字列が有効なGameModeかを判定する型ガード
 * @param mode - 判定対象の文字列
 * @returns 有効なGameModeの場合true
 */
export function isValidGameMode(mode: string): mode is GameMode {
  return GAME_MODES.includes(mode as GameMode);
}
