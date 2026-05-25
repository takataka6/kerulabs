/**
 * @module Position 値オブジェクト
 * @description Position値オブジェクト（2D座標）の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な値オブジェクト）
 * - ファクトリメソッド（create）で正/負/原点の座標を検証
 * - 2点間距離計算（distanceTo）の正確性と対称性
 * - 等値判定（equals）とtoString
 */
import { describe, it, expect } from "vitest";
import { Position } from "../../value-objects/Position";

describe("Position", () => {
  describe("create", () => {
    it("座標を指定してPositionを作成できる", () => {
      const pos = Position.create(1.5, 3.0);
      expect(pos.x).toBe(1.5);
      expect(pos.z).toBe(3.0);
    });

    it("負の座標でも作成できる", () => {
      const pos = Position.create(-2.0, -4.5);
      expect(pos.x).toBe(-2.0);
      expect(pos.z).toBe(-4.5);
    });

    it("原点でも作成できる", () => {
      const pos = Position.create(0, 0);
      expect(pos.x).toBe(0);
      expect(pos.z).toBe(0);
    });
  });

  describe("distanceTo", () => {
    it("同じ座標の距離は0", () => {
      const a = Position.create(3, 4);
      const b = Position.create(3, 4);
      expect(a.distanceTo(b)).toBe(0);
    });

    it("2点間の距離を計算できる（3-4-5の三角形）", () => {
      const a = Position.create(0, 0);
      const b = Position.create(3, 4);
      expect(a.distanceTo(b)).toBe(5);
    });

    it("距離は対称である（a→b === b→a）", () => {
      const a = Position.create(1, 2);
      const b = Position.create(4, 6);
      expect(a.distanceTo(b)).toBe(b.distanceTo(a));
    });
  });

  describe("equals", () => {
    it("同じ座標は等しい", () => {
      const a = Position.create(1.5, 2.5);
      const b = Position.create(1.5, 2.5);
      expect(a.equals(b)).toBe(true);
    });

    it("異なるx座標は等しくない", () => {
      const a = Position.create(1.0, 2.0);
      const b = Position.create(1.5, 2.0);
      expect(a.equals(b)).toBe(false);
    });

    it("異なるz座標は等しくない", () => {
      const a = Position.create(1.0, 2.0);
      const b = Position.create(1.0, 2.5);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toString", () => {
    it("座標を文字列として返す", () => {
      const pos = Position.create(1.5, 3.0);
      expect(pos.toString()).toBe("(1.5, 3)");
    });
  });
});
