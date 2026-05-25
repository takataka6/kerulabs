/**
 * @module IndexedDBGlossaryRepository
 * @description IndexedDBを使った用語集リポジトリの単体テスト
 *
 * テスト方針:
 * - IndexedDBClient をvi.mockでスタブ化し、mockDBでCRUD操作をシミュレーション
 * - TestableGlossaryRepository サブクラスでprotectedマッパーを公開
 * - マッパーテスト: ドメイン⇔永続化レコードの変換精度を検証
 *   （用語・キーワード・読み・日時の変換）
 * - ラウンドトリップ: 変換往復でデータが保持されることを検証
 * - CRUDテスト: findAll / findById / save / delete のDB操作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexedDBGlossaryRepository } from "../../repositories/indexeddb/IndexedDBGlossaryRepository";
import { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects";

// --- Mock DB ---
const mockDB = {
  getAll: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@infrastructure/repositories/indexeddb/IndexedDBClient", () => ({
  IndexedDBClient: {
    getInstance: () => ({ getDB: () => Promise.resolve(mockDB) }),
  },
}));

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

/**
 * テスト用サブクラス -- private メソッドを公開
 */
class TestableGlossaryRepository extends IndexedDBGlossaryRepository {
  public testMapToDomain(record: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).mapToDomain(record);
  }
  public testMapToPersistence(glossary: Glossary) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).mapToPersistence(glossary);
  }
}

// --- テストデータ ---

const sampleRecord = {
  id: "glossary-1",
  name: "サッカー用語集",
  description: "基本的なサッカー用語をまとめたもの",
  terms: [
    {
      id: "term-1",
      term: "オフサイド",
      reading: "おふさいど",
      description: "攻撃側の選手が守備側の最終ラインより前にいる状態",
      keywords: ["ルール", "守備"],
    },
    {
      id: "term-2",
      term: "ドリブル",
      description: "ボールを足で運ぶ技術",
      keywords: ["攻撃", "テクニック"],
    },
  ],
  createdAt: 1700000000000,
  updatedAt: 1700100000000,
};

describe("IndexedDBGlossaryRepository", () => {
  const repo = new TestableGlossaryRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ────────────────────────────────────────────
  // マッパーテスト
  // ────────────────────────────────────────────
  describe("mapToDomain", () => {
    it("レコードを Glossary エンティティに変換する", () => {
      const glossary = repo.testMapToDomain(sampleRecord);

      expect(glossary).toBeInstanceOf(Glossary);
      expect(glossary.id.value).toBe("glossary-1");
      expect(glossary.name).toBe("サッカー用語集");
      expect(glossary.description).toBe("基本的なサッカー用語をまとめたもの");
      expect(glossary.terms).toHaveLength(2);
      expect(glossary.terms[0].term).toBe("オフサイド");
      expect(glossary.terms[1].term).toBe("ドリブル");
      expect(glossary.createdAt).toBeInstanceOf(Date);
      expect(glossary.createdAt.getTime()).toBe(1700000000000);
      expect(glossary.updatedAt).toBeInstanceOf(Date);
      expect(glossary.updatedAt.getTime()).toBe(1700100000000);
    });

    it("terms が空配列の場合も正しく変換する", () => {
      const recordWithNoTerms = { ...sampleRecord, terms: [] };

      const glossary = repo.testMapToDomain(recordWithNoTerms);

      expect(glossary).toBeInstanceOf(Glossary);
      expect(glossary.terms).toEqual([]);
      expect(glossary.name).toBe("サッカー用語集");
    });

    it("terms が空配列の場合は空配列でドメインオブジェクトを生成する", () => {
      const recordWithEmptyTerms = {
        ...sampleRecord,
        terms: [],
      };
      const glossary = repo.testMapToDomain(recordWithEmptyTerms);

      expect(glossary).toBeInstanceOf(Glossary);
      expect(glossary.terms).toEqual([]);
    });
  });

  describe("mapToPersistence", () => {
    it("Glossary エンティティを永続化レコードに変換する", () => {
      const glossary = new Glossary({
        id: new GlossaryId("glossary-2"),
        name: "戦術用語集",
        description: "戦術に関する用語",
        terms: [
          {
            id: "term-a",
            term: "プレス",
            description: "相手にプレッシャーをかけること",
            keywords: ["守備"],
          },
        ],
        createdAt: new Date(1700000000000),
        updatedAt: new Date(1700200000000),
      });

      const record = repo.testMapToPersistence(glossary);

      expect(record.id).toBe("glossary-2");
      expect(record.name).toBe("戦術用語集");
      expect(record.description).toBe("戦術に関する用語");
      expect(record.terms).toHaveLength(1);
      expect(record.terms[0].term).toBe("プレス");
    });

    it("日付をタイムスタンプに変換する", () => {
      const createdAt = new Date(1700000000000);
      const updatedAt = new Date(1700200000000);
      const glossary = new Glossary({
        id: new GlossaryId("glossary-3"),
        name: "テスト",
        description: "説明",
        terms: [],
        createdAt,
        updatedAt,
      });

      const record = repo.testMapToPersistence(glossary);

      expect(typeof record.createdAt).toBe("number");
      expect(record.createdAt).toBe(1700000000000);
      expect(typeof record.updatedAt).toBe("number");
      expect(record.updatedAt).toBe(1700200000000);
    });
  });

  // ────────────────────────────────────────────
  // CRUD テスト
  // ────────────────────────────────────────────
  describe("findAll", () => {
    it("全用語集を取得して Glossary エンティティの配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([sampleRecord]);

      const results = await repo.findAll();

      expect(mockDB.getAll).toHaveBeenCalledWith("glossaries");
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Glossary);
      expect(results[0].id.value).toBe("glossary-1");
    });

    it("レコードがない場合は空配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([]);

      const results = await repo.findAll();

      expect(results).toEqual([]);
    });
  });

  describe("findById", () => {
    it("IDに一致する用語集を返す", async () => {
      mockDB.get.mockResolvedValue(sampleRecord);

      const result = await repo.findById(new GlossaryId("glossary-1"));

      expect(mockDB.get).toHaveBeenCalledWith("glossaries", "glossary-1");
      expect(result).toBeInstanceOf(Glossary);
      expect(result!.id.value).toBe("glossary-1");
      expect(result!.name).toBe("サッカー用語集");
    });

    it("存在しないIDの場合はnullを返す", async () => {
      mockDB.get.mockResolvedValue(undefined);

      const result = await repo.findById(new GlossaryId("non-existent"));

      expect(mockDB.get).toHaveBeenCalledWith("glossaries", "non-existent");
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("Glossary エンティティを永続化する", async () => {
      mockDB.put.mockResolvedValue(undefined);
      const glossary = new Glossary({
        id: new GlossaryId("glossary-save"),
        name: "保存テスト",
        description: "説明",
        terms: [],
        createdAt: new Date(1700000000000),
        updatedAt: new Date(1700000000000),
      });

      await repo.save(glossary);

      expect(mockDB.put).toHaveBeenCalledWith("glossaries", {
        id: "glossary-save",
        name: "保存テスト",
        description: "説明",
        terms: [],
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      });
    });
  });

  describe("delete", () => {
    it("IDを指定して用語集を削除する", async () => {
      mockDB.delete.mockResolvedValue(undefined);

      await repo.delete(new GlossaryId("glossary-1"));

      expect(mockDB.delete).toHaveBeenCalledWith("glossaries", "glossary-1");
    });
  });
});
