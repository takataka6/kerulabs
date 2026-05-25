/**
 * @module Formation エンティティ
 * @description Formationドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - サッカー（11人）とフットサル（5人）の両ゲームモードを検証
 * - ポジション数のバリデーション（競技別の人数制約）
 * - roleMap の自動生成とインデックス取得ロジック
 * - デフォルトフォーメーション（isCustom=false）とカスタムの区別
 */
import { describe, it, expect } from "vitest";
import { Formation, FormationPosition } from "../../entities/Formation";
import { Position } from "../../value-objects/Position";
import { FormationId } from "@domain/value-objects";

describe("Formation", () => {
  const create11Positions = (): FormationPosition[] => [
    { pos: "GK", position: Position.create(0, -4), category: "gk" },
    { pos: "LB", position: Position.create(-3, -2), category: "df" },
    { pos: "CB1", position: Position.create(-1, -2.5), category: "df" },
    { pos: "CB2", position: Position.create(1, -2.5), category: "df" },
    { pos: "RB", position: Position.create(3, -2), category: "df" },
    { pos: "LM", position: Position.create(-3, 0), category: "mf" },
    { pos: "CM1", position: Position.create(-1, 0), category: "mf" },
    { pos: "CM2", position: Position.create(1, 0), category: "mf" },
    { pos: "RM", position: Position.create(3, 0), category: "mf" },
    { pos: "CF1", position: Position.create(-1, 2.5), category: "fw" },
    { pos: "CF2", position: Position.create(1, 2.5), category: "fw" },
  ];

  const create5Positions = (): FormationPosition[] => [
    { pos: "GK", position: Position.create(0, -3), category: "gk" },
    { pos: "FIXO", position: Position.create(0, -1), category: "df" },
    { pos: "ALA_L", position: Position.create(-2, 0), category: "mf" },
    { pos: "ALA_R", position: Position.create(2, 0), category: "mf" },
    { pos: "PIVO", position: Position.create(0, 2), category: "fw" },
  ];

  describe("create", () => {
    it("11人のフットボールフォーメーションを作成できる", () => {
      const formation = Formation.create(
        "4-4-2",
        "standard",
        create11Positions(),
      );
      expect(formation.name).toBe("4-4-2");
      expect(formation.type).toBe("standard");
      expect(formation.positions).toHaveLength(11);
      expect(formation.isCustom).toBe(true);
      expect(formation.gameMode).toBe("football");
    });

    it("5人のフットサルフォーメーションを作成できる", () => {
      const formation = Formation.create(
        "1-2-1",
        "futsal",
        create5Positions(),
        "futsal",
      );
      expect(formation.positions).toHaveLength(5);
      expect(formation.gameMode).toBe("futsal");
    });

    it("roleMapが自動生成される", () => {
      const formation = Formation.create(
        "4-4-2",
        "standard",
        create11Positions(),
      );
      expect(formation.roleMap.get("GK")).toBe(0);
      expect(formation.roleMap.get("CF2")).toBe(10);
    });

    it("ポジション数が不正だとエラーになる（11人制で10人）", () => {
      const positions = create11Positions().slice(0, 10);
      expect(() => Formation.create("test", "standard", positions)).toThrow(
        "Formation must have exactly 11 positions for football",
      );
    });

    it("フットサルで11人はエラーになる", () => {
      expect(() =>
        Formation.create("test", "futsal", create11Positions(), "futsal"),
      ).toThrow("Formation must have exactly 5 positions for futsal");
    });
  });

  describe("createDefault", () => {
    it("デフォルトフォーメーションを作成できる（isCustom=false）", () => {
      const formation = Formation.createDefault(
        new FormationId("default-442"),
        "4-4-2",
        "standard",
        create11Positions(),
      );
      expect(formation.id.value).toBe("default-442");
      expect(formation.isCustom).toBe(false);
    });

    it("カスタムroleMapを指定できる", () => {
      const customRoleMap = new Map<string, number>();
      customRoleMap.set("GK", 0);
      customRoleMap.set("CF2", 1);

      const formation = Formation.createDefault(
        new FormationId("custom"),
        "4-4-2",
        "standard",
        create11Positions(),
        customRoleMap,
      );
      expect(formation.roleMap.get("GK")).toBe(0);
      expect(formation.roleMap.get("CF2")).toBe(1);
    });
  });

  describe("getPlayerIndexByRole", () => {
    it("ロール名からインデックスを取得できる", () => {
      const formation = Formation.create(
        "4-4-2",
        "standard",
        create11Positions(),
      );
      expect(formation.getPlayerIndexByRole("GK")).toBe(0);
      expect(formation.getPlayerIndexByRole("CF1")).toBe(9);
    });

    it("存在しないロールはundefined", () => {
      const formation = Formation.create(
        "4-4-2",
        "standard",
        create11Positions(),
      );
      expect(formation.getPlayerIndexByRole("NONEXISTENT")).toBeUndefined();
    });
  });

  describe("getPositionByIndex", () => {
    it("インデックスからポジションを取得できる", () => {
      const formation = Formation.create(
        "4-4-2",
        "standard",
        create11Positions(),
      );
      const pos = formation.getPositionByIndex(0);
      expect(pos?.pos).toBe("GK");
      expect(pos?.category).toBe("gk");
    });

    it("範囲外のインデックスはundefined", () => {
      const formation = Formation.create(
        "4-4-2",
        "standard",
        create11Positions(),
      );
      expect(formation.getPositionByIndex(99)).toBeUndefined();
    });
  });
});
