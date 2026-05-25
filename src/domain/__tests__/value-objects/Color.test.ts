/**
 * @module Color 値オブジェクト
 * @description Color値オブジェクトの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な値オブジェクト）
 * - HEXカラー文字列のパース・バリデーション（3桁/6桁、大文字小文字、空白除去）
 * - 等値判定（大文字小文字の正規化を含む）
 * - 不正フォーマットのエラーハンドリング
 */
import { describe, it, expect } from "vitest";
import { Color } from "../../value-objects/Color";

describe("Color", () => {
  describe("fromHex", () => {
    it("6桁のHEXカラーを作成できる", () => {
      const color = Color.fromHex("#ff0000");
      expect(color.hex).toBe("#ff0000");
    });

    it("3桁のHEXカラーを作成できる", () => {
      const color = Color.fromHex("#f00");
      expect(color.hex).toBe("#f00");
    });

    it("大文字のHEXカラーを小文字に正規化する", () => {
      const color = Color.fromHex("#FF0000");
      expect(color.hex).toBe("#ff0000");
    });

    it("前後の空白を除去する", () => {
      const color = Color.fromHex("  #ff0000  ");
      expect(color.hex).toBe("#ff0000");
    });

    it("#なしのHEXはエラーになる", () => {
      expect(() => Color.fromHex("ff0000")).toThrow("Invalid hex color");
    });

    it("不正な文字を含むHEXはエラーになる", () => {
      expect(() => Color.fromHex("#gggggg")).toThrow("Invalid hex color");
    });

    it("桁数が不正なHEXはエラーになる", () => {
      expect(() => Color.fromHex("#ff00")).toThrow("Invalid hex color");
    });

    it("空文字はエラーになる", () => {
      expect(() => Color.fromHex("")).toThrow("Invalid hex color");
    });
  });

  describe("toHex", () => {
    it("HEX文字列を返す", () => {
      const color = Color.fromHex("#abcdef");
      expect(color.toHex()).toBe("#abcdef");
    });
  });

  describe("equals", () => {
    it("同じHEXカラーは等しい", () => {
      const a = Color.fromHex("#ff0000");
      const b = Color.fromHex("#ff0000");
      expect(a.equals(b)).toBe(true);
    });

    it("大文字小文字を区別しない", () => {
      const a = Color.fromHex("#FF0000");
      const b = Color.fromHex("#ff0000");
      expect(a.equals(b)).toBe(true);
    });

    it("異なるHEXカラーは等しくない", () => {
      const a = Color.fromHex("#ff0000");
      const b = Color.fromHex("#00ff00");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toString", () => {
    it("HEX文字列を返す", () => {
      const color = Color.fromHex("#123abc");
      expect(color.toString()).toBe("#123abc");
    });
  });
});
