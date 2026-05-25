/**
 * @module glossary-import-export スキーマテスト
 * @description 用語集のエクスポート/インポートのラウンドトリップテスト
 *
 * テスト方針:
 * - モック不要（純粋なスキーマバリデーションとデータ変換）
 * - export→import のラウンドトリップでデータが保持されることを検証
 * - Zodスキーマによるインポートデータのバリデーション
 * - Presentationレイヤー非依存でexportロジックを再現しテスト
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { glossaryImportSchema } from "@application/schemas/glossaryImportSchema";
import { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects/GlossaryId";

/**
 * GlossaryPage の handleExport と同等のロジック
 * （Presentation レイヤーの依存なしでテスト可能にするため抽出）
 */
function exportGlossary(glossary: Glossary): string {
  const data = {
    name: glossary.name,
    description: glossary.description,
    terms: glossary.terms.map(({ term, reading, description, keywords }) => ({
      term,
      reading,
      description,
      keywords,
    })),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * GlossaryPage の handleImport と同等のロジック
 */
function importGlossaries(json: string): Glossary[] {
  const raw = JSON.parse(json);
  const items = z
    .array(glossaryImportSchema)
    .parse(Array.isArray(raw) ? raw : [raw]);

  return items.map((item) => {
    return new Glossary({
      id: new GlossaryId(crypto.randomUUID()),
      name: item.name,
      description: item.description,
      terms: item.terms.map((tm) => ({
        id: crypto.randomUUID(),
        term: tm.term,
        reading: tm.reading,
        description: tm.description,
        keywords: tm.keywords ?? [],
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

describe("Glossary import/export", () => {
  describe("roundtrip", () => {
    it("export → import で用語集の name/description が保持される", () => {
      const original = new Glossary({
        id: new GlossaryId("g1"),
        name: "サッカー用語",
        description: "基本的なサッカー用語集",
        terms: [
          {
            id: "t1",
            term: "プレス",
            reading: "ぷれす",
            description: "相手にプレッシャーをかける守備戦術",
            keywords: ["守備", "戦術"],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const json = exportGlossary(original);
      const imported = importGlossaries(json);

      expect(imported).toHaveLength(1);
      expect(imported[0].name).toBe("サッカー用語");
      expect(imported[0].description).toBe("基本的なサッカー用語集");
    });

    it("export → import で用語の全フィールドが保持される", () => {
      const original = new Glossary({
        id: new GlossaryId("g1"),
        name: "Test",
        description: "Desc",
        terms: [
          {
            id: "t1",
            term: "オフサイド",
            reading: "おふさいど",
            description: "攻撃側の選手が守備側の最終ラインより前にいる状態",
            keywords: ["ルール", "審判"],
          },
          {
            id: "t2",
            term: "ビルドアップ",
            reading: "びるどあっぷ",
            description: "後方からボールをつないで攻撃を組み立てる",
            keywords: ["攻撃", "戦術", "パス"],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const json = exportGlossary(original);
      const imported = importGlossaries(json);

      const terms = imported[0].terms;
      expect(terms).toHaveLength(2);

      expect(terms[0].term).toBe("オフサイド");
      expect(terms[0].reading).toBe("おふさいど");
      expect(terms[0].description).toBe(
        "攻撃側の選手が守備側の最終ラインより前にいる状態",
      );
      expect(terms[0].keywords).toEqual(["ルール", "審判"]);

      expect(terms[1].term).toBe("ビルドアップ");
      expect(terms[1].keywords).toEqual(["攻撃", "戦術", "パス"]);
    });

    it("2回連続 export → import でデータが劣化しない", () => {
      const original = new Glossary({
        id: new GlossaryId("g1"),
        name: "テスト辞典",
        description: "説明",
        terms: [
          {
            id: "t1",
            term: "ゾーンディフェンス",
            reading: "ぞーんでぃふぇんす",
            description: "エリアを守る戦術",
            keywords: ["守備"],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 1回目
      const json1 = exportGlossary(original);
      const imported1 = importGlossaries(json1);

      // 2回目
      const json2 = exportGlossary(imported1[0]);
      const imported2 = importGlossaries(json2);

      expect(imported2[0].name).toBe(original.name);
      expect(imported2[0].description).toBe(original.description);
      expect(imported2[0].terms[0].term).toBe("ゾーンディフェンス");
      expect(imported2[0].terms[0].reading).toBe("ぞーんでぃふぇんす");
      expect(imported2[0].terms[0].keywords).toEqual(["守備"]);
    });

    it("用語が空の用語集が正しくラウンドトリップする", () => {
      const original = new Glossary({
        id: new GlossaryId("g1"),
        name: "空の辞典",
        description: "まだ用語がありません",
        terms: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const json = exportGlossary(original);
      const imported = importGlossaries(json);

      expect(imported[0].name).toBe("空の辞典");
      expect(imported[0].terms).toHaveLength(0);
    });

    it("インポート時に新しいIDが生成される", () => {
      const original = new Glossary({
        id: new GlossaryId("original-id"),
        name: "Test",
        description: "",
        terms: [{ id: "term-id", term: "A", description: "B", keywords: [] }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const json = exportGlossary(original);
      const imported = importGlossaries(json);

      expect(imported[0].id.value).not.toBe("original-id");
      expect(imported[0].terms[0].id).not.toBe("term-id");
    });
  });

  describe("import formats", () => {
    it("keywords がない場合は空配列になる", () => {
      const json = JSON.stringify({
        name: "Test",
        terms: [{ term: "Test", description: "Test" }],
      });

      const imported = importGlossaries(json);
      expect(imported[0].terms[0].keywords).toEqual([]);
    });

    it("配列形式で複数の用語集をインポートできる", () => {
      const json = JSON.stringify([
        { name: "辞典A", terms: [{ term: "用語1", description: "説明1" }] },
        { name: "辞典B", terms: [{ term: "用語2", description: "説明2" }] },
      ]);

      const imported = importGlossaries(json);
      expect(imported).toHaveLength(2);
      expect(imported[0].name).toBe("辞典A");
      expect(imported[1].name).toBe("辞典B");
    });

    it("単一オブジェクト形式でもインポートできる", () => {
      const json = JSON.stringify({
        name: "Single",
        terms: [{ term: "A", description: "B" }],
      });

      const imported = importGlossaries(json);
      expect(imported).toHaveLength(1);
      expect(imported[0].name).toBe("Single");
    });

    it("デフォルト値が適用される（name/description/terms なし）", () => {
      const json = JSON.stringify({});
      const imported = importGlossaries(json);

      expect(imported[0].name).toBe("Untitled");
      expect(imported[0].description).toBe("");
      expect(imported[0].terms).toHaveLength(0);
    });

    it("用語の term/description にデフォルト値が適用される", () => {
      const json = JSON.stringify({
        name: "Test",
        terms: [{}],
      });

      const imported = importGlossaries(json);
      expect(imported[0].terms[0].term).toBe("");
      expect(imported[0].terms[0].description).toBe("");
    });
  });

  describe("error handling", () => {
    it("不正なJSONはエラーになる", () => {
      expect(() => importGlossaries("not json")).toThrow();
    });

    it("文字列はエラーになる（オブジェクト/配列が必要）", () => {
      expect(() => importGlossaries('"hello"')).toThrow();
    });
  });
});
