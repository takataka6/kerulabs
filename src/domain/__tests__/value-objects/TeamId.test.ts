/**
 * @module TeamId 値オブジェクト
 * @description TeamId値オブジェクトの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な値オブジェクト）
 * - コンストラクタのバリデーション（空文字・空白のみ禁止）
 * - UUID自動生成（generate）の一意性
 * - 等値判定（equals）とtoString
 */
import { describe, it, expect } from "vitest";
import { TeamId } from "../../value-objects/TeamId";

describe("TeamId", () => {
  describe("constructor", () => {
    it("有効な文字列でTeamIdを作成できる", () => {
      const id = new TeamId("team-1");
      expect(id.value).toBe("team-1");
    });

    it("空文字はエラーになる", () => {
      expect(() => new TeamId("")).toThrow("TeamId cannot be empty");
    });

    it("空白のみはエラーになる", () => {
      expect(() => new TeamId("   ")).toThrow("TeamId cannot be empty");
    });
  });

  describe("generate", () => {
    it("UUIDを生成する", () => {
      const id = TeamId.generate();
      expect(id.value).toBeTruthy();
      expect(id.value.length).toBeGreaterThan(0);
    });

    it("生成されるIDは毎回異なる", () => {
      const id1 = TeamId.generate();
      const id2 = TeamId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe("equals", () => {
    it("同じ値のTeamIdは等しい", () => {
      const a = new TeamId("team-1");
      const b = new TeamId("team-1");
      expect(a.equals(b)).toBe(true);
    });

    it("異なる値のTeamIdは等しくない", () => {
      const a = new TeamId("team-1");
      const b = new TeamId("team-2");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toString", () => {
    it("値を文字列として返す", () => {
      const id = new TeamId("team-1");
      expect(id.toString()).toBe("team-1");
    });
  });
});
