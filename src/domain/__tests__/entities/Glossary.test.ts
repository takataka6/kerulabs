/**
 * @module Glossary エンティティ
 * @description Glossaryドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - 用語集のCRUD操作（用語の追加・削除・更新）を網羅
 * - キーワード集約（getAllKeywords）の重複排除とソートを検証
 * - 更新日時の自動更新、存在しないIDへの操作の安全性
 */
import { describe, it, expect } from "vitest";
import { Glossary } from "../../entities/Glossary";

describe("Glossary", () => {
  describe("create", () => {
    it("用語集を作成できる", () => {
      const glossary = Glossary.create("サッカー用語", "サッカーの基本用語集");
      expect(glossary.name).toBe("サッカー用語");
      expect(glossary.description).toBe("サッカーの基本用語集");
      expect(glossary.terms).toHaveLength(0);
      expect(glossary.id.value).toBeTruthy();
    });

    it("作成日時と更新日時が設定される", () => {
      const glossary = Glossary.create("テスト", "説明");
      expect(glossary.createdAt).toBeInstanceOf(Date);
      expect(glossary.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("addTerm", () => {
    it("用語を追加できる", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({
        term: "オフサイド",
        reading: "おふさいど",
        description: "攻撃側の選手が守備側の最終ラインより前にいる状態",
        keywords: ["ルール", "守備"],
      });
      expect(glossary.terms).toHaveLength(1);
      expect(glossary.terms[0].term).toBe("オフサイド");
      expect(glossary.terms[0].id).toBeTruthy();
    });

    it("複数の用語を追加できる", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({
        term: "用語1",
        description: "説明1",
        keywords: ["a"],
      });
      glossary.addTerm({
        term: "用語2",
        description: "説明2",
        keywords: ["b"],
      });
      expect(glossary.terms).toHaveLength(2);
    });

    it("追加時に更新日時が変わる", () => {
      const glossary = Glossary.create("テスト", "説明");
      const before = glossary.updatedAt;
      glossary.addTerm({ term: "用語", description: "説明", keywords: [] });
      expect(glossary.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe("removeTerm", () => {
    it("用語を削除できる", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({ term: "用語1", description: "説明1", keywords: [] });
      const termId = glossary.terms[0].id;
      glossary.removeTerm(termId);
      expect(glossary.terms).toHaveLength(0);
    });

    it("存在しないIDを削除しても何も起きない", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({ term: "用語1", description: "説明1", keywords: [] });
      glossary.removeTerm("non-existent");
      expect(glossary.terms).toHaveLength(1);
    });
  });

  describe("updateTerm", () => {
    it("用語の内容を更新できる", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({
        term: "旧名前",
        description: "旧説明",
        keywords: ["旧"],
      });
      const termId = glossary.terms[0].id;
      glossary.updateTerm(termId, { term: "新名前", description: "新説明" });
      expect(glossary.terms[0].term).toBe("新名前");
      expect(glossary.terms[0].description).toBe("新説明");
      expect(glossary.terms[0].keywords).toEqual(["旧"]); // 未指定フィールドは変わらない
    });

    it("存在しないIDの更新は何もしない", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({ term: "用語", description: "説明", keywords: [] });
      glossary.updateTerm("non-existent", { term: "新名前" });
      expect(glossary.terms[0].term).toBe("用語");
    });
  });

  describe("updateInfo", () => {
    it("用語集の名前と説明を更新できる", () => {
      const glossary = Glossary.create("旧名前", "旧説明");
      glossary.updateInfo("新名前", "新説明");
      expect(glossary.name).toBe("新名前");
      expect(glossary.description).toBe("新説明");
    });
  });

  describe("getAllKeywords", () => {
    it("全用語のキーワードを重複なしで取得できる", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({
        term: "用語1",
        description: "説明",
        keywords: ["攻撃", "戦術"],
      });
      glossary.addTerm({
        term: "用語2",
        description: "説明",
        keywords: ["守備", "戦術"],
      });
      const keywords = glossary.getAllKeywords();
      expect(keywords).toEqual(["守備", "戦術", "攻撃"]); // ソート済み
    });

    it("用語がない場合は空配列", () => {
      const glossary = Glossary.create("テスト", "説明");
      expect(glossary.getAllKeywords()).toEqual([]);
    });

    it("空文字のキーワードは除外される", () => {
      const glossary = Glossary.create("テスト", "説明");
      glossary.addTerm({
        term: "用語",
        description: "説明",
        keywords: ["", "攻撃", ""],
      });
      expect(glossary.getAllKeywords()).toEqual(["攻撃"]);
    });
  });
});
