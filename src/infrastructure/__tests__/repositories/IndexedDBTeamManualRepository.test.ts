/**
 * @module IndexedDBTeamManualRepository
 * @description IndexedDBを使ったチームマニュアルリポジトリの単体テスト
 *
 * テスト方針:
 * - IndexedDBClient をvi.mockでスタブ化し、mockDBオブジェクトでCRUD操作をシミュレーション
 * - TestableTeamManualRepository サブクラスでprotectedなmapToDomain/mapToPersistenceを公開
 * - マッパーテスト: ドメイン⇔永続化レコードの変換精度を検証
 *   （name・description・teamId・sections・timestamps）
 * - ラウンドトリップ: mapToPersistence→mapToDomainで値が保持されることを検証
 * - CRUDテスト: findAll / findById / save / delete のDB操作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexedDBTeamManualRepository } from "../../repositories/indexeddb/IndexedDBTeamManualRepository";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects/TeamManualId";

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
 * テスト用サブクラス --- protected な mapToDomain / mapToPersistence を公開する。
 * これにより IndexedDB を使わずにマッパーロジックだけを単体テストできる。
 */
class TestableTeamManualRepository extends IndexedDBTeamManualRepository {
  public testMapToDomain(record: Parameters<typeof this.mapToDomain>[0]) {
    return this.mapToDomain(record);
  }
  public testMapToPersistence(manual: TeamManual) {
    return this.mapToPersistence(manual);
  }
}

// --- テストデータ ---

const sampleSection = {
  id: "section-1",
  title: "攻撃の原則",
  category: "offense" as const,
  formations: ["4-4-2", "4-3-3"],
  items: [
    {
      id: "item-1",
      title: "ビルドアップ",
      content: "後方からのパス回し",
      diagram: "graph TD; A-->B",
      linkedTacticIds: ["tactic-1"],
    },
  ],
};

const sampleRecord = {
  id: "manual-1",
  name: "テストマニュアル",
  description: "テスト用の説明",
  teamId: "team-1",
  sections: [sampleSection],
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe("IndexedDBTeamManualRepository", () => {
  const repo = new TestableTeamManualRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ────────────────────────────────────────────
  // マッパーテスト
  // ────────────────────────────────────────────
  describe("mapToDomain", () => {
    it("DBレコードからドメインオブジェクトに変換される", () => {
      const manual = repo.testMapToDomain(sampleRecord);

      expect(manual).toBeInstanceOf(TeamManual);
      expect(manual.id.value).toBe("manual-1");
      expect(manual.name).toBe("テストマニュアル");
      expect(manual.description).toBe("テスト用の説明");
      expect(manual.teamId).toBe("team-1");
      expect(manual.sections).toHaveLength(1);
      expect(manual.sections[0].id).toBe("section-1");
      expect(manual.sections[0].title).toBe("攻撃の原則");
      expect(manual.sections[0].category).toBe("offense");
      expect(manual.sections[0].formations).toEqual(["4-4-2", "4-3-3"]);
      expect(manual.sections[0].items).toHaveLength(1);
      expect(manual.sections[0].items[0].id).toBe("item-1");
      expect(manual.sections[0].items[0].title).toBe("ビルドアップ");
      expect(manual.sections[0].items[0].content).toBe("後方からのパス回し");
      expect(manual.sections[0].items[0].diagram).toBe("graph TD; A-->B");
      expect(manual.sections[0].items[0].linkedTacticIds).toEqual(["tactic-1"]);
      expect(manual.createdAt).toBeInstanceOf(Date);
      expect(manual.createdAt.getTime()).toBe(1700000000000);
      expect(manual.updatedAt).toBeInstanceOf(Date);
      expect(manual.updatedAt.getTime()).toBe(1700000000000);
    });

    it("セクションが空配列のレコードでも変換できる", () => {
      const recordWithoutSections = { ...sampleRecord, sections: [] };
      const manual = repo.testMapToDomain(recordWithoutSections);
      expect(manual.sections).toHaveLength(0);
    });

    it("teamIdが未設定のレコードでも変換できる", () => {
      const recordWithoutTeamId = { ...sampleRecord };
      delete (recordWithoutTeamId as Record<string, unknown>).teamId;
      const manual = repo.testMapToDomain(recordWithoutTeamId);
      expect(manual.teamId).toBeUndefined();
    });
  });

  describe("mapToPersistence", () => {
    it("ドメインオブジェクトからDBレコードに変換される", () => {
      const manual = TeamManual.create(
        "テストマニュアル",
        "テスト用の説明",
        "team-1",
      );

      const record = repo.testMapToPersistence(manual);

      expect(record.id).toBe(manual.id.value);
      expect(record.name).toBe("テストマニュアル");
      expect(record.description).toBe("テスト用の説明");
      expect(record.teamId).toBe("team-1");
      expect(record.sections).toEqual([]);
      expect(typeof record.createdAt).toBe("number");
      expect(typeof record.updatedAt).toBe("number");
    });

    it("セクションとアイテムがシリアライズされる", () => {
      const manual = new TeamManual({
        id: new TeamManualId("manual-2"),
        name: "マニュアル2",
        description: "説明2",
        teamId: "team-2",
        sections: [sampleSection],
        createdAt: new Date(1700000000000),
        updatedAt: new Date(1700000000000),
      });

      const record = repo.testMapToPersistence(manual);

      expect(record.sections).toHaveLength(1);
      expect(record.sections[0].id).toBe("section-1");
      expect(record.sections[0].title).toBe("攻撃の原則");
      expect(record.sections[0].category).toBe("offense");
      expect(record.sections[0].formations).toEqual(["4-4-2", "4-3-3"]);
      expect(record.sections[0].items).toHaveLength(1);
      expect(record.sections[0].items[0].title).toBe("ビルドアップ");
    });

    it("teamIdが未設定の場合はundefined", () => {
      const manual = TeamManual.create("マニュアル", "説明");

      const record = repo.testMapToPersistence(manual);

      expect(record.teamId).toBeUndefined();
    });
  });

  describe("ラウンドトリップ（mapToPersistence -> mapToDomain）", () => {
    it("ラウンドトリップ（domain→persistence→domain）で一致する", () => {
      const original = new TeamManual({
        id: new TeamManualId("manual-rt"),
        name: "ラウンドトリップ",
        description: "ラウンドトリップテスト",
        teamId: "team-rt",
        sections: [
          {
            id: "sec-1",
            title: "守備の原則",
            category: "defense",
            formations: ["4-3-3"],
            items: [
              {
                id: "item-rt",
                title: "プレス",
                content: "ハイプレス戦術",
                diagram: "graph LR; X-->Y",
                linkedTacticIds: ["tactic-a", "tactic-b"],
              },
            ],
          },
        ],
        createdAt: new Date(1700000000000),
        updatedAt: new Date(1700000000000),
      });

      const record = repo.testMapToPersistence(original);
      const restored = repo.testMapToDomain(record);

      expect(restored.id.value).toBe(original.id.value);
      expect(restored.name).toBe(original.name);
      expect(restored.description).toBe(original.description);
      expect(restored.teamId).toBe(original.teamId);
      expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
      expect(restored.updatedAt.getTime()).toBe(original.updatedAt.getTime());

      expect(restored.sections).toHaveLength(1);
      expect(restored.sections[0].id).toBe("sec-1");
      expect(restored.sections[0].title).toBe("守備の原則");
      expect(restored.sections[0].category).toBe("defense");
      expect(restored.sections[0].formations).toEqual(["4-3-3"]);
      expect(restored.sections[0].items).toHaveLength(1);
      expect(restored.sections[0].items[0].title).toBe("プレス");
      expect(restored.sections[0].items[0].content).toBe("ハイプレス戦術");
      expect(restored.sections[0].items[0].diagram).toBe("graph LR; X-->Y");
      expect(restored.sections[0].items[0].linkedTacticIds).toEqual([
        "tactic-a",
        "tactic-b",
      ]);
    });
  });

  // ────────────────────────────────────────────
  // CRUD テスト
  // ────────────────────────────────────────────
  describe("findAll", () => {
    it("findAll で全件取得できる", async () => {
      mockDB.getAll.mockResolvedValue([sampleRecord]);

      const results = await repo.findAll();

      expect(mockDB.getAll).toHaveBeenCalledWith("teamManuals");
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(TeamManual);
      expect(results[0].id.value).toBe("manual-1");
    });

    it("findAll で空配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([]);

      const results = await repo.findAll();

      expect(results).toEqual([]);
    });
  });

  describe("findById", () => {
    it("findById でIDに一致するマニュアルを返す", async () => {
      mockDB.get.mockResolvedValue(sampleRecord);
      const manualId = new TeamManualId("manual-1");

      const result = await repo.findById(manualId);

      expect(mockDB.get).toHaveBeenCalledWith("teamManuals", "manual-1");
      expect(result).toBeInstanceOf(TeamManual);
      expect(result!.id.value).toBe("manual-1");
      expect(result!.name).toBe("テストマニュアル");
    });

    it("findById で見つからない場合nullを返す", async () => {
      mockDB.get.mockResolvedValue(undefined);
      const manualId = new TeamManualId("non-existent");

      const result = await repo.findById(manualId);

      expect(mockDB.get).toHaveBeenCalledWith("teamManuals", "non-existent");
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("save でマニュアルを保存できる", async () => {
      mockDB.put.mockResolvedValue(undefined);
      const manual = repo.testMapToDomain(sampleRecord);

      await repo.save(manual);

      expect(mockDB.put).toHaveBeenCalledWith(
        "teamManuals",
        expect.objectContaining({
          id: "manual-1",
          name: "テストマニュアル",
        }),
      );
    });
  });

  describe("delete", () => {
    it("delete でマニュアルを削除できる", async () => {
      mockDB.delete.mockResolvedValue(undefined);
      const manualId = new TeamManualId("manual-1");

      await repo.delete(manualId);

      expect(mockDB.delete).toHaveBeenCalledWith("teamManuals", "manual-1");
    });
  });
});
