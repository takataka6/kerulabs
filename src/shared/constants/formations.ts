/**
 * @module formations
 * @description ゲームモード別のフォーメーション選択肢定数。サッカー（11人制）・フットサル・8人制・ソサイチの各モードに対応するフォーメーション一覧を定義する。
 */
import type { GameMode } from "@shared/types/GameMode";

export const FORMATION_OPTIONS = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "3-5-2",
  "5-3-2",
  "3-4-2-1",
] as const;

export const FUTSAL_FORMATION_OPTIONS = [
  "2-2",
  "1-2-1",
  "1-1-2",
  "3-1",
  "2-1-1",
  "1-3",
] as const;

// 8人制: GK除外7人
export const EIGHT_ASIDE_FORMATION_OPTIONS = [
  "2-3-2",
  "3-3-1",
  "2-4-1",
  "3-2-2",
  "2-2-3",
] as const;

// ソサイチ: GK除外6人
export const SOCIETY_FORMATION_OPTIONS = [
  "2-3-1",
  "3-2-1",
  "2-2-2",
  "3-1-2",
  "1-3-2",
] as const;

export const DEFAULT_FORMATION_BY_GAME_MODE: Record<GameMode, string> = {
  football: "4-3-3",
  futsal: "2-2",
  eight_aside: "2-3-2",
  society: "2-3-1",
};

export function getFormationOptions(gameMode: GameMode): readonly string[] {
  switch (gameMode) {
    case "futsal":
      return FUTSAL_FORMATION_OPTIONS;
    case "eight_aside":
      return EIGHT_ASIDE_FORMATION_OPTIONS;
    case "society":
      return SOCIETY_FORMATION_OPTIONS;
    default:
      return FORMATION_OPTIONS;
  }
}

export function getDefaultFormationOption(gameMode: GameMode): string {
  return DEFAULT_FORMATION_BY_GAME_MODE[gameMode];
}

export function getFormationOptionsWithDefault(
  formations: readonly string[],
  gameMode: GameMode,
): string[] {
  const options = new Set(getFormationOptions(gameMode));
  const gameModeFormations = formations.filter((formation) =>
    options.has(formation),
  );

  if (gameModeFormations.length > 0) {
    return gameModeFormations;
  }

  return [getDefaultFormationOption(gameMode)];
}

export function ensureFormationDefaultForGameMode(
  formations: readonly string[],
  gameMode: GameMode,
): string[] {
  const options = new Set(getFormationOptions(gameMode));
  const hasGameModeFormation = formations.some((formation) =>
    options.has(formation),
  );

  if (hasGameModeFormation) {
    return [...formations];
  }

  return [...formations, getDefaultFormationOption(gameMode)];
}
