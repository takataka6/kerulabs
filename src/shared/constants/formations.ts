/**
 * @module formations
 * @description ゲームモード別のフォーメーション選択肢定数。サッカー（11人制）・フットサル・8人制・ソサイチの各モードに対応するフォーメーション一覧を定義する。
 */
import type { GameMode } from "@shared/types/GameMode";

export const FORMATION_OPTIONS = [
  "4-3-3",
  "4-4-2 Flat",
  "4-4-2 Diamond",
  "4-2-3-1",
  "4-1-4-1",
  "4-3-1-2",
  "4-2-2-2",
  "3-5-2",
  "3-4-1-2",
  "3-1-4-2",
  "5-3-2",
  "3-4-2-1",
  "5-4-1",
  "3-4-3",
  "4-3-2-1",
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

export const FORMATION_ID_BY_NAME: Record<string, string> = {
  "4-3-3": "4-3-3",
  "4-4-2 Flat": "4-4-2-flat",
  "4-4-2 Diamond": "4-4-2-diamond",
  "4-2-3-1": "4-2-3-1",
  "4-1-4-1": "4-1-4-1",
  "4-3-1-2": "4-3-1-2",
  "4-2-2-2": "4-2-2-2",
  "3-5-2": "3-5-2",
  "3-4-1-2": "3-4-1-2",
  "3-1-4-2": "3-1-4-2",
  "5-3-2": "5-3-2",
  "3-4-2-1": "3-4-2-1",
  "5-4-1": "5-4-1",
  "3-4-3": "3-4-3",
  "4-3-2-1": "4-3-2-1",
  "2-2": "futsal-2-2",
  "1-2-1": "futsal-1-2-1",
  "1-1-2": "futsal-1-1-2",
  "3-1": "futsal-3-1",
  "2-1-1": "futsal-2-1-1",
  "1-3": "futsal-1-3",
  "2-3-2": "eight-2-3-2",
  "3-3-1": "eight-3-3-1",
  "2-4-1": "eight-2-4-1",
  "3-2-2": "eight-3-2-2",
  "2-2-3": "eight-2-2-3",
  "2-3-1": "society-2-3-1",
  "3-2-1": "society-3-2-1",
  "2-2-2": "society-2-2-2",
  "3-1-2": "society-3-1-2",
  "1-3-2": "society-1-3-2",
};

export const FORMATION_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(FORMATION_ID_BY_NAME).map(([name, id]) => [id, name]),
);

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

export function getFormationIds(gameMode: GameMode): string[] {
  return getFormationOptions(gameMode).map(normalizeFormationKey);
}

export function getDefaultFormationId(gameMode: GameMode): string {
  return normalizeFormationKey(getDefaultFormationOption(gameMode));
}

export function getFormationIdByName(name: string): string | undefined {
  return FORMATION_ID_BY_NAME[name];
}

export function getFormationNameById(id: string): string | undefined {
  return FORMATION_NAME_BY_ID[id];
}

export function normalizeFormationKey(key: string): string {
  return getFormationIdByName(key) ?? key;
}

export function normalizeFormationKeys(keys: readonly string[] = []): string[] {
  return [...new Set((keys || []).map(normalizeFormationKey))];
}

export function getFormationOptionsWithDefault(
  formations: readonly string[] = [],
  gameMode: GameMode,
): string[] {
  const options = new Set(getFormationIds(gameMode));
  const gameModeFormations = normalizeFormationKeys(formations || []).filter(
    (formationId) => options.has(formationId),
  );

  if (gameModeFormations.length > 0) {
    return gameModeFormations;
  }

  return [getDefaultFormationId(gameMode)];
}

export function ensureFormationDefaultForGameMode(
  formations: readonly string[] = [],
  gameMode: GameMode,
): string[] {
  const normalized = normalizeFormationKeys(formations || []);
  const options = new Set(getFormationIds(gameMode));
  const hasGameModeFormation = normalized.some((formationId) =>
    options.has(formationId),
  );

  if (hasGameModeFormation) {
    return normalized;
  }

  return [...normalized, getDefaultFormationId(gameMode)];
}
