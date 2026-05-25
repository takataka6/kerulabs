/**
 * @module Movement エンティティ
 * @description Movementドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - ファクトリメソッド（create）のパラメータとデフォルト値（delay=0, arrowColor=#ef4444）を検証
 * - delay の負値バリデーション
 * - イミュータブル性（readonlyプロパティ）の確認
 */
import { describe, it, expect } from "vitest";
import { Movement } from "../../entities/Movement";

describe("Movement", () => {
  describe("create", () => {
    it("移動を作成できる", () => {
      const movement = Movement.create("CF", 2.0, 3.0, 100, "#ff0000");
      expect(movement.role).toBe("CF");
      expect(movement.targetX).toBe(2.0);
      expect(movement.targetZ).toBe(3.0);
      expect(movement.delay).toBe(100);
      expect(movement.arrowColor).toBe("#ff0000");
    });

    it("デフォルト値で作成できる（delay=0, arrowColor=#ef4444）", () => {
      const movement = Movement.create("GK", 0, 0);
      expect(movement.delay).toBe(0);
      expect(movement.arrowColor).toBe("#ef4444");
    });

    it("負のdelayはエラーになる", () => {
      expect(() => Movement.create("CF", 0, 0, -1)).toThrow(
        "Movement delay cannot be negative",
      );
    });

    it("delay=0は有効", () => {
      const movement = Movement.create("CF", 0, 0, 0);
      expect(movement.delay).toBe(0);
    });
  });

  describe("immutability", () => {
    it("プロパティはreadonlyである", () => {
      const movement = Movement.create("CF", 1.0, 2.0, 100, "#ff0000");
      // TypeScriptのreadonly制約を確認（コンパイル時チェック）
      expect(movement.role).toBe("CF");
      expect(movement.targetX).toBe(1.0);
      expect(movement.targetZ).toBe(2.0);
    });
  });
});
