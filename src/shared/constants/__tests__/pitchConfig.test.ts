/**
 * @module pitchConfig 定数
 * @description ピッチ設定定数とゲームモード別コンフィグ取得関数の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な定数とユーティリティ関数のみ）
 * - 4種のゲームモード（football/futsal/eight_aside/society）の設定値を検証
 * - fieldBoundsの対称性・halfWidth/halfLengthの整合性を検証
 * - getPitchConfig関数のモード別戻り値とデフォルトフォールバックを検証
 */
import { describe, it, expect } from "vitest";
import {
  FOOTBALL_CONFIG,
  FUTSAL_CONFIG,
  EIGHT_ASIDE_CONFIG,
  SOCIETY_CONFIG,
  getPitchConfig,
} from "../pitchConfig";

describe("pitchConfig", () => {
  // ── 定数 ──

  it("FOOTBALL_CONFIG は 11 人制で fieldWidth=10, fieldLength=12", () => {
    expect(FOOTBALL_CONFIG.gameMode).toBe("football");
    expect(FOOTBALL_CONFIG.playerCount).toBe(11);
    expect(FOOTBALL_CONFIG.fieldWidth).toBe(10);
    expect(FOOTBALL_CONFIG.fieldLength).toBe(12);
  });

  it("FUTSAL_CONFIG は 5 人制で fieldWidth=8, fieldLength=6", () => {
    expect(FUTSAL_CONFIG.gameMode).toBe("futsal");
    expect(FUTSAL_CONFIG.playerCount).toBe(5);
    expect(FUTSAL_CONFIG.fieldWidth).toBe(8);
    expect(FUTSAL_CONFIG.fieldLength).toBe(6);
  });

  it("EIGHT_ASIDE_CONFIG は 8 人制", () => {
    expect(EIGHT_ASIDE_CONFIG.gameMode).toBe("eight_aside");
    expect(EIGHT_ASIDE_CONFIG.playerCount).toBe(8);
  });

  it("SOCIETY_CONFIG は 7 人制", () => {
    expect(SOCIETY_CONFIG.gameMode).toBe("society");
    expect(SOCIETY_CONFIG.playerCount).toBe(7);
  });

  it("各コンフィグの fieldBounds が対称になっている", () => {
    for (const config of [
      FOOTBALL_CONFIG,
      FUTSAL_CONFIG,
      EIGHT_ASIDE_CONFIG,
      SOCIETY_CONFIG,
    ]) {
      expect(config.fieldBounds.minX).toBe(-config.fieldBounds.maxX);
      expect(config.fieldBounds.minZ).toBe(-config.fieldBounds.maxZ);
    }
  });

  it("各コンフィグの halfWidth / halfLength が正しい", () => {
    for (const config of [
      FOOTBALL_CONFIG,
      FUTSAL_CONFIG,
      EIGHT_ASIDE_CONFIG,
      SOCIETY_CONFIG,
    ]) {
      expect(config.halfWidth).toBe(config.fieldWidth / 2);
      expect(config.halfLength).toBe(config.fieldLength / 2);
    }
  });

  // ── getPitchConfig ──

  it('getPitchConfig("football") が FOOTBALL_CONFIG を返す', () => {
    expect(getPitchConfig("football")).toBe(FOOTBALL_CONFIG);
  });

  it('getPitchConfig("futsal") が FUTSAL_CONFIG を返す', () => {
    expect(getPitchConfig("futsal")).toBe(FUTSAL_CONFIG);
  });

  it('getPitchConfig("eight_aside") が EIGHT_ASIDE_CONFIG を返す', () => {
    expect(getPitchConfig("eight_aside")).toBe(EIGHT_ASIDE_CONFIG);
  });

  it('getPitchConfig("society") が SOCIETY_CONFIG を返す', () => {
    expect(getPitchConfig("society")).toBe(SOCIETY_CONFIG);
  });

  it("不明なモードでは FOOTBALL_CONFIG をデフォルトとして返す", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getPitchConfig("unknown" as any)).toBe(FOOTBALL_CONFIG);
  });
});
