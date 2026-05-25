/**
 * @module IndexedDBFormationRepository
 * @description IndexedDBを使ったフォーメーションリポジトリの単体テスト
 *
 * テスト方針:
 * - IndexedDBClient をvi.mockでスタブ化し、mockDBでCRUD操作をシミュレーション
 * - TestableFormationRepository サブクラスでprotectedマッパーを公開
 * - マッパーテスト: ドメイン⇔永続化レコードの変換精度を検証
 *   （ポジション・roleMap・ゲームモード・カスタムフラグ）
 * - ラウンドトリップ: 変換往復でデータが保持されることを検証
 * - CRUDテスト: findAll / findById / findByType / save / delete のDB操作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexedDBFormationRepository } from "../../repositories/indexeddb/IndexedDBFormationRepository";
import { Formation } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import { FormationId } from "@domain/value-objects";

// --- Mock DB ---
const mockDB = {
  getAll: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  getAllFromIndex: vi.fn(),
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
 * テスト用サブクラス --- protected メソッドを公開
 */
class TestableFormationRepository extends IndexedDBFormationRepository {
  public testMapToDomain(record: Parameters<typeof this.mapToDomain>[0]) {
    return this.mapToDomain(record);
  }
  public testMapToPersistence(formation: Formation) {
    return this.mapToPersistence(formation);
  }
}

// --- テストデータ ---

const sampleRecord = {
  id: "formation-1",
  name: "4-4-2",
  type: "standard",
  positions: [
    { pos: "GK", x: 0, z: -4, cat: "gk" as const },
    { pos: "LB", x: -3, z: -2, cat: "df" as const },
    { pos: "CB1", x: -1, z: -2.5, cat: "df" as const },
    { pos: "CB2", x: 1, z: -2.5, cat: "df" as const },
    { pos: "RB", x: 3, z: -2, cat: "df" as const },
    { pos: "LM", x: -3, z: 0, cat: "mf" as const },
    { pos: "CM1", x: -1, z: 0, cat: "mf" as const },
    { pos: "CM2", x: 1, z: 0, cat: "mf" as const },
    { pos: "RM", x: 3, z: 0, cat: "mf" as const },
    { pos: "CF1", x: -1, z: 2.5, cat: "fw" as const },
    { pos: "CF2", x: 1, z: 2.5, cat: "fw" as const },
  ],
  roleMap: {
    GK: 0,
    LB: 1,
    CB1: 2,
    CB2: 3,
    RB: 4,
    LM: 5,
    CM1: 6,
    CM2: 7,
    RM: 8,
    CF1: 9,
    CF2: 10,
  },
  isCustom: false,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe("IndexedDBFormationRepository", () => {
  const repo = new TestableFormationRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ────────────────────────────────────────────
  // マッパーテスト
  // ────────────────────────────────────────────
  describe("mapToDomain", () => {
    it("レコードからFormationエンティティに変換できる", () => {
      const formation = repo.testMapToDomain(sampleRecord);

      expect(formation).toBeInstanceOf(Formation);
      expect(formation.id.value).toBe("formation-1");
      expect(formation.name).toBe("4-4-2");
      expect(formation.type).toBe("standard");
      expect(formation.isCustom).toBe(false);
      expect(formation.positions).toHaveLength(11);
    });

    it("ポジションの座標が正しく復元される", () => {
      const formation = repo.testMapToDomain(sampleRecord);

      const gk = formation.positions[0];
      expect(gk.pos).toBe("GK");
      expect(gk.position.x).toBe(0);
      expect(gk.position.z).toBe(-4);
      expect(gk.category).toBe("gk");
    });

    it("roleMapが正しく復元される", () => {
      const formation = repo.testMapToDomain(sampleRecord);

      expect(formation.roleMap.get("GK")).toBe(0);
      expect(formation.roleMap.get("CF2")).toBe(10);
      expect(formation.roleMap.size).toBe(11);
    });

    it("gameModeがない場合はfootballがデフォルト", () => {
      const formation = repo.testMapToDomain(sampleRecord);
      expect(formation.gameMode).toBe("football");
    });

    it("gameModeが指定されている場合はその値が使われる", () => {
      const futsalRecord = {
        ...sampleRecord,
        gameMode: "futsal" as const,
        positions: sampleRecord.positions.slice(0, 5),
        roleMap: { GK: 0, LB: 1, CB1: 2, CB2: 3, RB: 4 },
      };
      const formation = repo.testMapToDomain(futsalRecord);
      expect(formation.gameMode).toBe("futsal");
    });

    it("日付がDateオブジェクトに正しく変換される", () => {
      const formation = repo.testMapToDomain(sampleRecord);
      expect(formation.createdAt).toBeInstanceOf(Date);
      expect(formation.createdAt.getTime()).toBe(1700000000000);
      expect(formation.updatedAt).toBeInstanceOf(Date);
      expect(formation.updatedAt.getTime()).toBe(1700000000000);
    });
  });

  describe("mapToPersistence", () => {
    it("Formationエンティティをレコードに変換できる", () => {
      const formation = repo.testMapToDomain(sampleRecord);
      const record = repo.testMapToPersistence(formation);

      expect(record.id).toBe("formation-1"); // persistence layer uses string
      expect(record.name).toBe("4-4-2");
      expect(record.type).toBe("standard");
      expect(record.isCustom).toBe(false);
      expect(record.positions).toHaveLength(11);
      expect(typeof record.createdAt).toBe("number");
    });

    it("ポジション座標が正しくシリアライズされる", () => {
      const formation = repo.testMapToDomain(sampleRecord);
      const record = repo.testMapToPersistence(formation);

      expect(record.positions[0]).toEqual({
        pos: "GK",
        x: 0,
        z: -4,
        cat: "gk",
      });
    });

    it("roleMapがRecord<string, number>にシリアライズされる", () => {
      const formation = repo.testMapToDomain(sampleRecord);
      const record = repo.testMapToPersistence(formation);

      expect(record.roleMap).toEqual(sampleRecord.roleMap);
    });

    it("gameModeが正しくシリアライズされる", () => {
      const formation = repo.testMapToDomain(sampleRecord);
      const record = repo.testMapToPersistence(formation);

      expect(record.gameMode).toBe("football");
    });
  });

  describe("ラウンドトリップ", () => {
    it("変換して戻しても値が保持される", () => {
      const positions = [
        {
          pos: "GK",
          position: Position.create(0, -4),
          category: "gk" as const,
        },
        {
          pos: "LB",
          position: Position.create(-3, -2),
          category: "df" as const,
        },
        {
          pos: "CB1",
          position: Position.create(-1, -2.5),
          category: "df" as const,
        },
        {
          pos: "CB2",
          position: Position.create(1, -2.5),
          category: "df" as const,
        },
        {
          pos: "RB",
          position: Position.create(3, -2),
          category: "df" as const,
        },
        {
          pos: "LM",
          position: Position.create(-3, 0),
          category: "mf" as const,
        },
        {
          pos: "CM1",
          position: Position.create(-1, 0),
          category: "mf" as const,
        },
        {
          pos: "CM2",
          position: Position.create(1, 0),
          category: "mf" as const,
        },
        { pos: "RM", position: Position.create(3, 0), category: "mf" as const },
        {
          pos: "CF1",
          position: Position.create(-1, 2.5),
          category: "fw" as const,
        },
        {
          pos: "CF2",
          position: Position.create(1, 2.5),
          category: "fw" as const,
        },
      ];
      const original = Formation.create("4-4-2", "standard", positions);

      const record = repo.testMapToPersistence(original);
      const restored = repo.testMapToDomain(record);

      expect(restored.id.value).toBe(original.id.value);
      expect(restored.name).toBe(original.name);
      expect(restored.type).toBe(original.type);
      expect(restored.isCustom).toBe(original.isCustom);
      expect(restored.gameMode).toBe(original.gameMode);
      expect(restored.positions).toHaveLength(11);

      // 各ポジションの座標を検証
      for (let i = 0; i < 11; i++) {
        expect(restored.positions[i].pos).toBe(original.positions[i].pos);
        expect(restored.positions[i].position.x).toBe(
          original.positions[i].position.x,
        );
        expect(restored.positions[i].position.z).toBe(
          original.positions[i].position.z,
        );
        expect(restored.positions[i].category).toBe(
          original.positions[i].category,
        );
      }
    });
  });

  // ────────────────────────────────────────────
  // CRUD テスト
  // ────────────────────────────────────────────
  describe("findAll", () => {
    it("全フォーメーションを取得してFormationエンティティの配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([sampleRecord]);

      const results = await repo.findAll();

      expect(mockDB.getAll).toHaveBeenCalledWith("formations");
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Formation);
      expect(results[0].id.value).toBe("formation-1");
    });

    it("レコードがない場合は空配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([]);

      const results = await repo.findAll();

      expect(results).toEqual([]);
    });
  });

  describe("findById", () => {
    it("IDに一致するフォーメーションを返す", async () => {
      mockDB.get.mockResolvedValue(sampleRecord);

      const result = await repo.findById(new FormationId("formation-1"));

      expect(mockDB.get).toHaveBeenCalledWith("formations", "formation-1");
      expect(result).toBeInstanceOf(Formation);
      expect(result!.id.value).toBe("formation-1");
      expect(result!.name).toBe("4-4-2");
    });

    it("存在しないIDの場合はnullを返す", async () => {
      mockDB.get.mockResolvedValue(undefined);

      const result = await repo.findById(new FormationId("non-existent"));

      expect(mockDB.get).toHaveBeenCalledWith("formations", "non-existent");
      expect(result).toBeNull();
    });
  });

  describe("findByType", () => {
    it("typeに一致するフォーメーションの配列を返す", async () => {
      mockDB.getAllFromIndex.mockResolvedValue([sampleRecord]);

      const results = await repo.findByType("standard");

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith(
        "formations",
        "by-type",
        "standard",
      );
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Formation);
      expect(results[0].type).toBe("standard");
    });

    it("該当するフォーメーションがない場合は空配列を返す", async () => {
      mockDB.getAllFromIndex.mockResolvedValue([]);

      const results = await repo.findByType("custom");

      expect(results).toEqual([]);
    });
  });

  describe("save", () => {
    it("Formationエンティティを永続化する", async () => {
      mockDB.put.mockResolvedValue(undefined);
      const formation = repo.testMapToDomain(sampleRecord);

      await repo.save(formation);

      expect(mockDB.put).toHaveBeenCalledWith(
        "formations",
        expect.objectContaining({
          id: "formation-1",
          name: "4-4-2",
          type: "standard",
        }),
      );
    });
  });

  describe("delete", () => {
    it("IDを指定してフォーメーションを削除する", async () => {
      mockDB.delete.mockResolvedValue(undefined);

      await repo.delete(new FormationId("formation-1"));

      expect(mockDB.delete).toHaveBeenCalledWith("formations", "formation-1");
    });
  });
});
