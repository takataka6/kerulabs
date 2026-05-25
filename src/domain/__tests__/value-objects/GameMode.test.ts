/**
 * @module GameMode 値オブジェクト
 * @description ゲームモード定数とバリデーション関数の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な定数と関数のテスト）
 * - GAME_MODES 定数の網羅性（football, futsal, eight_aside, society）
 * - isValidGameMode バリデーション関数の正常系・異常系
 */
import { describe, it, expect } from "vitest";
import { GAME_MODES, isValidGameMode } from "@shared/types/GameMode";

describe("GameMode", () => {
  describe("GAME_MODES", () => {
    it("4つのゲームモードが定義されている", () => {
      expect(GAME_MODES).toHaveLength(4);
    });

    it("football, futsal, eight_aside, society が含まれる", () => {
      expect(GAME_MODES).toContain("football");
      expect(GAME_MODES).toContain("futsal");
      expect(GAME_MODES).toContain("eight_aside");
      expect(GAME_MODES).toContain("society");
    });
  });

  describe("isValidGameMode", () => {
    it.each(["football", "futsal", "eight_aside", "society"])(
      '"%s" は有効なゲームモードである',
      (mode) => {
        expect(isValidGameMode(mode)).toBe(true);
      },
    );

    it("無効な文字列はfalseを返す", () => {
      expect(isValidGameMode("invalid")).toBe(false);
    });

    it("空文字はfalseを返す", () => {
      expect(isValidGameMode("")).toBe(false);
    });
  });
});
