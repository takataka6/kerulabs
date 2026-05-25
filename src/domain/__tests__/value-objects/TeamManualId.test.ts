/**
 * @module TeamManualId 値オブジェクト
 * @description TeamManualId値オブジェクトの単体テスト
 */
import { describe, it, expect } from "vitest";
import { TeamManualId } from "../../value-objects/TeamManualId";

describe("TeamManualId", () => {
  describe("constructor", () => {
    it("有効な文字列でTeamManualIdを作成できる", () => {
      const id = new TeamManualId("manual-1");
      expect(id.value).toBe("manual-1");
    });

    it("空文字はエラーになる", () => {
      expect(() => new TeamManualId("")).toThrow(
        "TeamManualId cannot be empty",
      );
    });

    it("空白のみはエラーになる", () => {
      expect(() => new TeamManualId("   ")).toThrow(
        "TeamManualId cannot be empty",
      );
    });
  });

  describe("generate", () => {
    it("UUIDを生成する", () => {
      const id = TeamManualId.generate();
      expect(id.value).toBeTruthy();
      expect(id.value.length).toBeGreaterThan(0);
    });

    it("生成されるIDは毎回異なる", () => {
      const id1 = TeamManualId.generate();
      const id2 = TeamManualId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe("equals", () => {
    it("同じ値のTeamManualIdは等しい", () => {
      const a = new TeamManualId("manual-1");
      const b = new TeamManualId("manual-1");
      expect(a.equals(b)).toBe(true);
    });

    it("異なる値のTeamManualIdは等しくない", () => {
      const a = new TeamManualId("manual-1");
      const b = new TeamManualId("manual-2");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toString", () => {
    it("値を文字列として返す", () => {
      const id = new TeamManualId("manual-1");
      expect(id.toString()).toBe("manual-1");
    });
  });
});
