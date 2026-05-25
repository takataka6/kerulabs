/**
 * @module TeamManual エンティティ
 * @description TeamManualドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - セクション・項目のCRUD操作を網羅
 * - カテゴリ集約、更新日時の自動更新、存在しないIDへの操作の安全性
 */
import { describe, it, expect } from "vitest";
import { TeamManual } from "../../entities/TeamManual";
import { TeamManualId } from "../../value-objects/TeamManualId";

describe("TeamManual", () => {
  describe("create", () => {
    it("マニュアルを作成できる", () => {
      const manual = TeamManual.create("シーズンマニュアル", "戦術原則");
      expect(manual.name).toBe("シーズンマニュアル");
      expect(manual.description).toBe("戦術原則");
      expect(manual.sections).toHaveLength(0);
      expect(manual.id.value).toBeTruthy();
    });

    it("teamIdを指定して作成できる", () => {
      const manual = TeamManual.create("マニュアル", "説明", "team-1");
      expect(manual.teamId).toBe("team-1");
    });

    it("作成日時と更新日時が設定される", () => {
      const manual = TeamManual.create("テスト", "説明");
      expect(manual.createdAt).toBeInstanceOf(Date);
      expect(manual.updatedAt).toBeInstanceOf(Date);
    });

    it("空の名前ではエラーになる", () => {
      expect(() => TeamManual.create("", "説明")).toThrow(
        "TeamManual name cannot be empty",
      );
    });

    it("空白のみの名前ではエラーになる", () => {
      expect(() => TeamManual.create("   ", "説明")).toThrow(
        "TeamManual name cannot be empty",
      );
    });
  });

  describe("constructor", () => {
    it("propsから復元できる", () => {
      const now = new Date();
      const manual = new TeamManual({
        id: new TeamManualId("m-1"),
        name: "テスト",
        description: "説明",
        teamId: "t-1",
        sections: [
          {
            id: "s-1",
            title: "攻撃",
            category: "offense",
            formations: ["4-3-3"],
            items: [
              {
                id: "i-1",
                title: "ビルドアップ",
                content: "内容",
                linkedTacticIds: [],
              },
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      });
      expect(manual.name).toBe("テスト");
      expect(manual.sections).toHaveLength(1);
      expect(manual.sections[0].items).toHaveLength(1);
    });
  });

  describe("updateInfo", () => {
    it("名前と説明を更新できる", () => {
      const manual = TeamManual.create("旧名前", "旧説明");
      manual.updateInfo("新名前", "新説明");
      expect(manual.name).toBe("新名前");
      expect(manual.description).toBe("新説明");
    });

    it("空の名前ではエラーになる", () => {
      const manual = TeamManual.create("テスト", "説明");
      expect(() => manual.updateInfo("", "説明")).toThrow(
        "TeamManual name cannot be empty",
      );
    });

    it("更新日時が変わる", () => {
      const manual = TeamManual.create("テスト", "説明");
      const before = manual.updatedAt;
      manual.updateInfo("新名前", "新説明");
      expect(manual.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe("addSection", () => {
    it("セクションを追加できる", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃の原則",
        category: "offense",
        formations: ["4-3-3"],
        items: [],
      });
      expect(manual.sections).toHaveLength(1);
      expect(manual.sections[0].title).toBe("攻撃の原則");
      expect(manual.sections[0].id).toBeTruthy();
    });

    it("追加時に更新日時が変わる", () => {
      const manual = TeamManual.create("テスト", "説明");
      const before = manual.updatedAt;
      manual.addSection({
        title: "守備",
        category: "defense",
        formations: [],
        items: [],
      });
      expect(manual.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe("removeSection", () => {
    it("セクションを削除できる", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃",
        category: "offense",
        formations: [],
        items: [],
      });
      const sectionId = manual.sections[0].id;
      const result = manual.removeSection(sectionId);
      expect(result).toBe(true);
      expect(manual.sections).toHaveLength(0);
    });

    it("存在しないIDの削除はfalseを返す", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃",
        category: "offense",
        formations: [],
        items: [],
      });
      const result = manual.removeSection("non-existent");
      expect(result).toBe(false);
      expect(manual.sections).toHaveLength(1);
    });
  });

  describe("updateSection", () => {
    it("セクションを更新できる", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "旧タイトル",
        category: "offense",
        formations: [],
        items: [],
      });
      const sectionId = manual.sections[0].id;
      const result = manual.updateSection(sectionId, { title: "新タイトル" });
      expect(result).toBe(true);
      expect(manual.sections[0].title).toBe("新タイトル");
      expect(manual.sections[0].category).toBe("offense"); // 未指定フィールドは変わらない
    });

    it("存在しないIDの更新はfalseを返す", () => {
      const manual = TeamManual.create("テスト", "説明");
      const result = manual.updateSection("non-existent", {
        title: "新タイトル",
      });
      expect(result).toBe(false);
    });
  });

  describe("addItem", () => {
    it("セクションに項目を追加できる", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃",
        category: "offense",
        formations: [],
        items: [],
      });
      const sectionId = manual.sections[0].id;
      const result = manual.addItem(sectionId, {
        title: "ビルドアップ",
        content: "GKからCBへ",
        diagram: "graph LR\n  GK --> CB",
        linkedTacticIds: [],
      });
      expect(result).toBe(true);
      expect(manual.sections[0].items).toHaveLength(1);
      expect(manual.sections[0].items[0].title).toBe("ビルドアップ");
      expect(manual.sections[0].items[0].diagram).toBe("graph LR\n  GK --> CB");
    });

    it("存在しないセクションIDの場合はfalseを返す", () => {
      const manual = TeamManual.create("テスト", "説明");
      const result = manual.addItem("non-existent", {
        title: "項目",
        content: "内容",
        linkedTacticIds: [],
      });
      expect(result).toBe(false);
    });
  });

  describe("removeItem", () => {
    it("項目を削除できる", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃",
        category: "offense",
        formations: [],
        items: [],
      });
      const sectionId = manual.sections[0].id;
      manual.addItem(sectionId, {
        title: "項目1",
        content: "内容",
        linkedTacticIds: [],
      });
      const itemId = manual.sections[0].items[0].id;
      const result = manual.removeItem(sectionId, itemId);
      expect(result).toBe(true);
      expect(manual.sections[0].items).toHaveLength(0);
    });

    it("存在しないセクションIDの場合はfalseを返す", () => {
      const manual = TeamManual.create("テスト", "説明");
      const result = manual.removeItem("non-existent", "item-1");
      expect(result).toBe(false);
    });

    it("存在しない項目IDの場合はfalseを返す", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃",
        category: "offense",
        formations: [],
        items: [],
      });
      const sectionId = manual.sections[0].id;
      const result = manual.removeItem(sectionId, "non-existent");
      expect(result).toBe(false);
    });
  });

  describe("updateItem", () => {
    it("項目を更新できる", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃",
        category: "offense",
        formations: [],
        items: [],
      });
      const sectionId = manual.sections[0].id;
      manual.addItem(sectionId, {
        title: "旧タイトル",
        content: "旧内容",
        linkedTacticIds: [],
      });
      const itemId = manual.sections[0].items[0].id;
      const result = manual.updateItem(sectionId, itemId, {
        title: "新タイトル",
      });
      expect(result).toBe(true);
      expect(manual.sections[0].items[0].title).toBe("新タイトル");
      expect(manual.sections[0].items[0].content).toBe("旧内容"); // 未指定フィールドは変わらない
    });

    it("存在しないセクションIDの場合はfalseを返す", () => {
      const manual = TeamManual.create("テスト", "説明");
      const result = manual.updateItem("non-existent", "item-1", {
        title: "新",
      });
      expect(result).toBe(false);
    });

    it("存在しない項目IDの場合はfalseを返す", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃",
        category: "offense",
        formations: [],
        items: [],
      });
      const sectionId = manual.sections[0].id;
      const result = manual.updateItem(sectionId, "non-existent", {
        title: "新",
      });
      expect(result).toBe(false);
    });
  });

  describe("getAllCategories", () => {
    it("全カテゴリを重複なしで取得できる", () => {
      const manual = TeamManual.create("テスト", "説明");
      manual.addSection({
        title: "攻撃1",
        category: "offense",
        formations: [],
        items: [],
      });
      manual.addSection({
        title: "守備1",
        category: "defense",
        formations: [],
        items: [],
      });
      manual.addSection({
        title: "攻撃2",
        category: "offense",
        formations: [],
        items: [],
      });
      const categories = manual.getAllCategories();
      expect(categories).toHaveLength(2);
      expect(categories).toContain("offense");
      expect(categories).toContain("defense");
    });

    it("セクションがない場合は空配列", () => {
      const manual = TeamManual.create("テスト", "説明");
      expect(manual.getAllCategories()).toEqual([]);
    });
  });
});
