/**
 * @module PlayerId 値オブジェクト
 * @description PlayerId値オブジェクトの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な値オブジェクト）
 * - コンストラクタのバリデーション（空文字・空白のみ禁止）
 * - UUID自動生成（generate）の一意性
 * - 等値判定（equals）とtoString
 */
import { describe, it, expect } from "vitest";
import { PlayerId } from "../../value-objects/PlayerId";

describe("PlayerId", () => {
  describe("constructor", () => {
    it("有効な文字列でPlayerIdを作成できる", () => {
      const id = new PlayerId("player-1");
      expect(id.value).toBe("player-1");
    });

    it("空文字はエラーになる", () => {
      expect(() => new PlayerId("")).toThrow("PlayerId cannot be empty");
    });

    it("空白のみはエラーになる", () => {
      expect(() => new PlayerId("   ")).toThrow("PlayerId cannot be empty");
    });
  });

  describe("generate", () => {
    it("UUIDを生成する", () => {
      const id = PlayerId.generate();
      expect(id.value).toBeTruthy();
      expect(id.value.length).toBeGreaterThan(0);
    });

    it("生成されるIDは毎回異なる", () => {
      const id1 = PlayerId.generate();
      const id2 = PlayerId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe("equals", () => {
    it("同じ値のPlayerIdは等しい", () => {
      const a = new PlayerId("player-1");
      const b = new PlayerId("player-1");
      expect(a.equals(b)).toBe(true);
    });

    it("異なる値のPlayerIdは等しくない", () => {
      const a = new PlayerId("player-1");
      const b = new PlayerId("player-2");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toString", () => {
    it("値を文字列として返す", () => {
      const id = new PlayerId("player-1");
      expect(id.toString()).toBe("player-1");
    });
  });
});
