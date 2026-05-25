/**
 * @module playerValidation
 * @description 選手番号のバリデーションユーティリティ。UI層で共通利用する。
 */

/** 選手番号の有効範囲（UI 入力用: 1〜99） */
const PLAYER_NUMBER_MIN = 1;
const PLAYER_NUMBER_MAX = 99;

/**
 * 選手番号が有効な範囲（1〜99）かを検証する。
 *
 * @remarks
 * ドメイン層 (Player.ts) では 0〜99 を許容するが、
 * UI 入力時は 1〜99 を有効とする。
 */
export function isValidPlayerNumber(n: number): boolean {
  return !isNaN(n) && n >= PLAYER_NUMBER_MIN && n <= PLAYER_NUMBER_MAX;
}
