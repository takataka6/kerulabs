/**
 * @module pitchConfig
 * @description ゲームモード別のピッチ（フィールド）寸法設定。3Dシーン上のフィールドサイズ・境界座標・選手数をゲームモードごとに定義する。
 */
import type { GameMode } from "@shared/types/GameMode";

export interface FieldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface PitchConfig {
  gameMode: GameMode;
  fieldWidth: number;
  fieldLength: number;
  halfWidth: number;
  halfLength: number;
  fieldBounds: FieldBounds;
  playerCount: number;
  maxOpponents: number;
}

export const FOOTBALL_CONFIG: PitchConfig = {
  gameMode: "football",
  fieldWidth: 10,
  fieldLength: 12,
  halfWidth: 5,
  halfLength: 6,
  fieldBounds: { minX: -5, maxX: 5, minZ: -6, maxZ: 6 },
  playerCount: 11,
  maxOpponents: 11,
};

export const FUTSAL_CONFIG: PitchConfig = {
  gameMode: "futsal",
  fieldWidth: 8,
  fieldLength: 6,
  halfWidth: 4,
  halfLength: 3,
  fieldBounds: { minX: -4, maxX: 4, minZ: -3, maxZ: 3 },
  playerCount: 5,
  maxOpponents: 5,
};

// 8人制サッカー: 68m × 50m → 3Dユニット 10 × 7.5
export const EIGHT_ASIDE_CONFIG: PitchConfig = {
  gameMode: "eight_aside",
  fieldWidth: 10,
  fieldLength: 7.5,
  halfWidth: 5,
  halfLength: 3.75,
  fieldBounds: { minX: -5, maxX: 5, minZ: -3.75, maxZ: 3.75 },
  playerCount: 8,
  maxOpponents: 8,
};

// ソサイチ（7人制）: 50m × 30m → 3Dユニット 9 × 5.5
export const SOCIETY_CONFIG: PitchConfig = {
  gameMode: "society",
  fieldWidth: 9,
  fieldLength: 5.5,
  halfWidth: 4.5,
  halfLength: 2.75,
  fieldBounds: { minX: -4.5, maxX: 4.5, minZ: -2.75, maxZ: 2.75 },
  playerCount: 7,
  maxOpponents: 7,
};

export function getPitchConfig(mode: GameMode): PitchConfig {
  switch (mode) {
    case "futsal":
      return FUTSAL_CONFIG;
    case "eight_aside":
      return EIGHT_ASIDE_CONFIG;
    case "society":
      return SOCIETY_CONFIG;
    default:
      return FOOTBALL_CONFIG;
  }
}
