/**
 * @module Phase 値オブジェクト
 * @description Phase値オブジェクト（戦術フェーズ）の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な値オブジェクト）
 * - 文字列からの生成（fromString）と4種のファクトリメソッドを検証
 * - 等値判定（equals）と不正値のバリデーション
 * - attack / defense / positive_transition / negative_transition の4フェーズを網羅
 */
import { describe, it, expect } from "vitest";
import { Phase } from "../../value-objects/Phase";

describe("Phase", () => {
  describe("fromString", () => {
    it.each([
      "attack",
      "defense",
      "positive_transition",
      "negative_transition",
    ])('有効なフェーズ "%s" を作成できる', (phase) => {
      const result = Phase.fromString(phase);
      expect(result.value).toBe(phase);
    });

    it("無効なフェーズはエラーになる", () => {
      expect(() => Phase.fromString("invalid")).toThrow("Invalid phase");
    });

    it("空文字はエラーになる", () => {
      expect(() => Phase.fromString("")).toThrow("Invalid phase");
    });
  });

  describe("ファクトリメソッド", () => {
    it("attack() は attack を返す", () => {
      expect(Phase.attack().value).toBe("attack");
    });

    it("defense() は defense を返す", () => {
      expect(Phase.defense().value).toBe("defense");
    });

    it("positiveTransition() は positive_transition を返す", () => {
      expect(Phase.positiveTransition().value).toBe("positive_transition");
    });

    it("negativeTransition() は negative_transition を返す", () => {
      expect(Phase.negativeTransition().value).toBe("negative_transition");
    });
  });

  describe("equals", () => {
    it("同じフェーズは等しい", () => {
      const a = Phase.attack();
      const b = Phase.fromString("attack");
      expect(a.equals(b)).toBe(true);
    });

    it("異なるフェーズは等しくない", () => {
      const a = Phase.attack();
      const b = Phase.defense();
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toString", () => {
    it("フェーズの値を文字列として返す", () => {
      expect(Phase.attack().toString()).toBe("attack");
    });
  });
});
