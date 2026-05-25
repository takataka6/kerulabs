/**
 * @module BallPass エンティティ
 * @description BallPassドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - ファクトリメソッド（create）のパラメータとデフォルト値を検証
 * - 終点座標（endX/endZ）の有無による hasCustomEnd の判定ロジック
 * - delay の負値バリデーション
 */
import { describe, it, expect } from "vitest";
import { BallPass } from "../../entities/BallPass";

describe("BallPass", () => {
  describe("create", () => {
    it("ボールパスを作成できる", () => {
      const pass = BallPass.create({
        startRole: "CF",
        endRole: "RW",
        delay: 200,
        color: "#facc15",
      });
      expect(pass.startRole).toBe("CF");
      expect(pass.endRole).toBe("RW");
      expect(pass.delay).toBe(200);
      expect(pass.color).toBe("#facc15");
    });

    it("デフォルト値で作成できる（delay=0, color=#facc15）", () => {
      const pass = BallPass.create({ startRole: "GK", endRole: "CB" });
      expect(pass.delay).toBe(0);
      expect(pass.color).toBe("#facc15");
    });

    it("終点座標を指定できる", () => {
      const pass = BallPass.create({
        startRole: "CF",
        endRole: "RW",
        delay: 100,
        color: "#ff0000",
        endX: 5.0,
        endZ: 3.0,
      });
      expect(pass.endX).toBe(5.0);
      expect(pass.endZ).toBe(3.0);
    });

    it("終点座標なしで作成できる", () => {
      const pass = BallPass.create({ startRole: "CF", endRole: "RW" });
      expect(pass.endX).toBeUndefined();
      expect(pass.endZ).toBeUndefined();
    });

    it("負のdelayはエラーになる", () => {
      expect(() =>
        BallPass.create({ startRole: "CF", endRole: "RW", delay: -1 }),
      ).toThrow("BallPass delay cannot be negative");
    });
  });

  describe("hasCustomEnd", () => {
    it("終点座標が両方指定されている場合はtrue", () => {
      const pass = BallPass.create({
        startRole: "CF",
        endRole: "RW",
        delay: 0,
        color: "#facc15",
        endX: 5.0,
        endZ: 3.0,
      });
      expect(pass.hasCustomEnd()).toBe(true);
    });

    it("終点座標が指定されていない場合はfalse", () => {
      const pass = BallPass.create({ startRole: "CF", endRole: "RW" });
      expect(pass.hasCustomEnd()).toBe(false);
    });

    it("endXのみ指定されている場合はfalse", () => {
      const pass = BallPass.create({
        startRole: "CF",
        endRole: "RW",
        delay: 0,
        color: "#facc15",
        endX: 5.0,
        endZ: undefined,
      });
      expect(pass.hasCustomEnd()).toBe(false);
    });

    it("endZのみ指定されている場合はfalse", () => {
      const pass = BallPass.create({
        startRole: "CF",
        endRole: "RW",
        delay: 0,
        color: "#facc15",
        endX: undefined,
        endZ: 3.0,
      });
      expect(pass.hasCustomEnd()).toBe(false);
    });
  });
});
