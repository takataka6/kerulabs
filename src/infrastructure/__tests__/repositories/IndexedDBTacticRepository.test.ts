/**
 * @module IndexedDBTacticRepository
 * @description IndexedDBを使った戦術リポジトリの単体テスト
 *
 * テスト方針:
 * - IndexedDBClient をvi.mockでスタブ化し、mockDBでCRUD操作をシミュレーション
 * - TestableTacticRepository サブクラスでprotectedマッパーを公開
 * - マッパーテスト: ドメイン⇔永続化レコードの変換精度を検証
 *   （Movement/BallPass/Phase/多言語名/フォーメーション別データ）
 * - ラウンドトリップ: 変換往復でデータが保持されることを検証
 * - CRUDテスト: findAll / findById / findByPhase / findByPhaseAndFormation / save / delete
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexedDBTacticRepository } from "../../repositories/indexeddb/IndexedDBTacticRepository";
import { Tactic } from "@domain/entities/Tactic";
import { Movement } from "@domain/entities/Movement";
import { BallPass } from "@domain/entities/BallPass";
import { Phase } from "@domain/value-objects/Phase";
import { TacticId } from "@domain/value-objects";

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
class TestableTacticRepository extends IndexedDBTacticRepository {
  public testMapToDomain(record: Parameters<typeof this.mapToDomain>[0]) {
    return this.mapToDomain(record);
  }
  public testMapToPersistence(tactic: Tactic) {
    return this.mapToPersistence(tactic);
  }
}

// --- テストデータ ---

const sampleRecord = {
  id: "tactic-1",
  name: { ja: "テスト戦術", en: "Test Tactic" },
  icon: "icon-1",
  phase: "attack",
  movements: {
    "4-4-2": [
      {
        role: "CF",
        targetX: 2.0,
        targetZ: 3.0,
        delay: 0,
        arrowColor: "#ef4444",
      },
      {
        role: "RW",
        targetX: 4.0,
        targetZ: 1.0,
        delay: 200,
        arrowColor: "#3b82f6",
      },
    ],
  },
  ballPasses: {
    "4-4-2": [
      { startRole: "CF", endRole: "RW", delay: 100, color: "#facc15" },
      {
        startRole: "RW",
        endRole: "LW",
        delay: 300,
        color: "#22c55e",
        endX: 5.0,
        endZ: 2.0,
      },
    ],
  },
  isCustom: true,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe("IndexedDBTacticRepository", () => {
  const repo = new TestableTacticRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ────────────────────────────────────────────
  // マッパーテスト
  // ────────────────────────────────────────────
  describe("mapToDomain", () => {
    it("レコードからTacticエンティティに変換できる", () => {
      const tactic = repo.testMapToDomain(sampleRecord);

      expect(tactic).toBeInstanceOf(Tactic);
      expect(tactic.id.value).toBe("tactic-1");
      expect(tactic.getDisplayName("ja")).toBe("テスト戦術");
      expect(tactic.getDisplayName("en")).toBe("Test Tactic");
      expect(tactic.icon).toBe("icon-1");
      expect(tactic.phase.value).toBe("attack");
      expect(tactic.isCustom).toBe(true);
    });

    it("移動データが正しく復元される", () => {
      const tactic = repo.testMapToDomain(sampleRecord);
      const movements = tactic.getMovementsForFormation("4-4-2");

      expect(movements).toHaveLength(2);
      expect(movements[0].role).toBe("CF");
      expect(movements[0].targetX).toBe(2.0);
      expect(movements[0].targetZ).toBe(3.0);
      expect(movements[0].delay).toBe(0);
      expect(movements[0].arrowColor).toBe("#ef4444");
    });

    it("ボールパスデータが正しく復元される", () => {
      const tactic = repo.testMapToDomain(sampleRecord);
      const passes = tactic.getBallPassesForFormation("4-4-2");

      expect(passes).toHaveLength(2);
      expect(passes[0].startRole).toBe("CF");
      expect(passes[0].endRole).toBe("RW");
      expect(passes[1].endX).toBe(5.0);
      expect(passes[1].endZ).toBe(2.0);
    });

    it("ボールパスがない場合も正しく処理される", () => {
      const recordNoPass = { ...sampleRecord, ballPasses: undefined };
      const tactic = repo.testMapToDomain(recordNoPass);
      expect(tactic.getBallPassesForFormation("4-4-2")).toHaveLength(0);
    });

    it("createdAt/updatedAtがDateに変換される", () => {
      const tactic = repo.testMapToDomain(sampleRecord);
      expect(tactic.createdAt).toBeInstanceOf(Date);
      expect(tactic.createdAt.getTime()).toBe(1700000000000);
    });

    it("ballPositionがある場合に正しく復元される", () => {
      const recordWithBallPos = {
        ...sampleRecord,
        ballPosition: { x: 1.5, z: 2.5 },
      };
      const tactic = repo.testMapToDomain(recordWithBallPos);
      expect(tactic.ballPosition).toEqual({ x: 1.5, z: 2.5 });
    });

    it("複数フォーメーションの移動データが正しく復元される", () => {
      const multiFormationRecord = {
        ...sampleRecord,
        movements: {
          "4-4-2": [
            {
              role: "CF",
              targetX: 2,
              targetZ: 3,
              delay: 0,
              arrowColor: "#ef4444",
            },
          ],
          "3-5-2": [
            {
              role: "ST",
              targetX: 1,
              targetZ: 4,
              delay: 100,
              arrowColor: "#3b82f6",
            },
          ],
        },
      };
      const tactic = repo.testMapToDomain(multiFormationRecord);

      const m442 = tactic.getMovementsForFormation("4-4-2");
      const m352 = tactic.getMovementsForFormation("3-5-2");

      expect(m442).toHaveLength(1);
      expect(m442[0].role).toBe("CF");
      expect(m352).toHaveLength(1);
      expect(m352[0].role).toBe("ST");
    });

    it("ボールパスの trajectoryType が復元される", () => {
      const recordWithTrajectory = {
        ...sampleRecord,
        ballPasses: {
          "4-4-2": [
            {
              startRole: "CF",
              endRole: "RW",
              delay: 0,
              color: "#fff",
              startX: 1.0,
              startZ: 2.0,
              endX: 3.0,
              endZ: 4.0,
              trajectoryType: "high" as const,
            },
          ],
        },
      };
      const tactic = repo.testMapToDomain(recordWithTrajectory);
      const passes = tactic.getBallPassesForFormation("4-4-2");

      expect(passes[0].trajectoryType).toBe("high");
      expect(passes[0].startX).toBe(1.0);
      expect(passes[0].startZ).toBe(2.0);
    });
  });

  describe("mapToPersistence", () => {
    it("Tacticエンティティをレコードに変換できる", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("CF", 2.0, 3.0, 0, "#ef4444")]);
      const tactic = Tactic.create({
        name: { ja: "保存テスト", en: "Save Test" },
        icon: "icon-save",
        phase: Phase.defense(),
        movements,
      });

      const record = repo.testMapToPersistence(tactic);

      expect(record.id).toBe(tactic.id.value);
      expect(record.name).toEqual({ ja: "保存テスト", en: "Save Test" });
      expect(record.icon).toBe("icon-save");
      expect(record.phase).toBe("defense");
      expect(record.isCustom).toBe(true);
      expect(typeof record.createdAt).toBe("number");
    });

    it("移動データが正しくシリアライズされる", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("CF", 2.0, 3.0, 100, "#ff0000")]);
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "icon-test",
        phase: Phase.attack(),
        movements,
      });

      const record = repo.testMapToPersistence(tactic);
      expect(record.movements["4-4-2"]).toHaveLength(1);
      expect(record.movements["4-4-2"][0]).toEqual({
        role: "CF",
        targetX: 2.0,
        targetZ: 3.0,
        delay: 100,
        arrowColor: "#ff0000",
      });
    });

    it("ボールパスがない場合はフィールドがundefined", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("CF", 0, 0, 0)]);
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "icon-test",
        phase: Phase.attack(),
        movements,
      });

      const record = repo.testMapToPersistence(tactic);
      expect(record.ballPasses).toBeUndefined();
    });

    it("カスタム終点座標が保持される", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("CF", 0, 0, 0)]);
      const ballPasses = new Map<string, BallPass[]>();
      ballPasses.set("4-4-2", [
        BallPass.create({
          startRole: "CF",
          endRole: "RW",
          delay: 0,
          color: "#fff",
          endX: 5.0,
          endZ: 3.0,
        }),
      ]);
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "icon-test",
        phase: Phase.attack(),
        movements,
        ballPasses,
      });

      const record = repo.testMapToPersistence(tactic);
      expect(record.ballPasses!["4-4-2"][0].endX).toBe(5.0);
      expect(record.ballPasses!["4-4-2"][0].endZ).toBe(3.0);
    });

    it("ballPositionが正しくシリアライズされる", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("CF", 0, 0, 0)]);
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "icon-test",
        phase: Phase.attack(),
        movements,
        ballPosition: { x: 1.5, z: 2.5 },
      });

      const record = repo.testMapToPersistence(tactic);
      expect(record.ballPosition).toEqual({ x: 1.5, z: 2.5 });
    });

    it("ボールパスのstartX/startZ/trajectoryTypeが保持される", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("CF", 0, 0, 0)]);
      const ballPasses = new Map<string, BallPass[]>();
      ballPasses.set("4-4-2", [
        BallPass.create({
          startRole: "CF",
          endRole: "RW",
          delay: 50,
          color: "#fff",
          endX: 5.0,
          endZ: 3.0,
          startX: 1.0,
          startZ: 2.0,
          trajectoryType: "curveLeft",
        }),
      ]);
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "icon-test",
        phase: Phase.attack(),
        movements,
        ballPasses,
      });

      const record = repo.testMapToPersistence(tactic);
      const bp = record.ballPasses!["4-4-2"][0];
      expect(bp.startX).toBe(1.0);
      expect(bp.startZ).toBe(2.0);
      expect(bp.trajectoryType).toBe("curveLeft");
      expect(bp.delay).toBe(50);
    });
  });

  describe("ラウンドトリップ", () => {
    it("変換して戻しても値が保持される", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [
        Movement.create("CF", 2.0, 3.0, 0, "#ef4444"),
        Movement.create("RW", 4.0, 1.0, 200, "#3b82f6"),
      ]);
      movements.set("3-5-2", [Movement.create("CF", 1.0, 4.0, 100, "#22c55e")]);
      const ballPasses = new Map<string, BallPass[]>();
      ballPasses.set("4-4-2", [
        BallPass.create({
          startRole: "CF",
          endRole: "RW",
          delay: 50,
          color: "#facc15",
          endX: 5.0,
          endZ: 2.0,
        }),
      ]);

      const original = Tactic.create({
        name: { ja: "ラウンドトリップ", en: "Round Trip" },
        icon: "icon-rt",
        phase: Phase.positiveTransition(),
        movements,
        ballPasses,
      });

      const record = repo.testMapToPersistence(original);
      const restored = repo.testMapToDomain(record);

      expect(restored.id.value).toBe(original.id.value);
      expect(restored.getDisplayName("ja")).toBe("ラウンドトリップ");
      expect(restored.icon).toBe("icon-rt");
      expect(restored.phase.value).toBe("positive_transition");

      // 4-4-2 の移動
      const m442 = restored.getMovementsForFormation("4-4-2");
      expect(m442).toHaveLength(2);
      expect(m442[0].role).toBe("CF");
      expect(m442[1].arrowColor).toBe("#3b82f6");

      // 3-5-2 の移動
      const m352 = restored.getMovementsForFormation("3-5-2");
      expect(m352).toHaveLength(1);

      // ボールパス
      const bp = restored.getBallPassesForFormation("4-4-2");
      expect(bp).toHaveLength(1);
      expect(bp[0].endX).toBe(5.0);
      expect(bp[0].endZ).toBe(2.0);
    });
  });

  // ────────────────────────────────────────────
  // CRUD テスト
  // ────────────────────────────────────────────
  describe("findAll", () => {
    it("全戦術を取得してTacticエンティティの配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([sampleRecord]);

      const results = await repo.findAll();

      expect(mockDB.getAll).toHaveBeenCalledWith("tactics");
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Tactic);
      expect(results[0].id.value).toBe("tactic-1");
    });

    it("レコードがない場合は空配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([]);

      const results = await repo.findAll();

      expect(results).toEqual([]);
    });
  });

  describe("findById", () => {
    it("IDに一致する戦術を返す", async () => {
      mockDB.get.mockResolvedValue(sampleRecord);

      const result = await repo.findById(new TacticId("tactic-1"));

      expect(mockDB.get).toHaveBeenCalledWith("tactics", "tactic-1");
      expect(result).toBeInstanceOf(Tactic);
      expect(result!.id.value).toBe("tactic-1");
      expect(result!.getDisplayName("ja")).toBe("テスト戦術");
    });

    it("存在しないIDの場合はnullを返す", async () => {
      mockDB.get.mockResolvedValue(undefined);

      const result = await repo.findById(new TacticId("non-existent"));

      expect(mockDB.get).toHaveBeenCalledWith("tactics", "non-existent");
      expect(result).toBeNull();
    });
  });

  describe("findByPhase", () => {
    it("フェーズに一致する戦術の配列を返す", async () => {
      mockDB.getAllFromIndex.mockResolvedValue([sampleRecord]);

      const results = await repo.findByPhase(Phase.attack());

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith(
        "tactics",
        "by-phase",
        "attack",
      );
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Tactic);
      expect(results[0].phase.value).toBe("attack");
    });

    it("該当する戦術がない場合は空配列を返す", async () => {
      mockDB.getAllFromIndex.mockResolvedValue([]);

      const results = await repo.findByPhase(Phase.defense());

      expect(results).toEqual([]);
    });
  });

  describe("findByPhaseAndFormation", () => {
    it("フェーズとフォーメーションに一致する戦術を返す", async () => {
      mockDB.getAllFromIndex.mockResolvedValue([sampleRecord]);

      const results = await repo.findByPhaseAndFormation(
        Phase.attack(),
        "4-4-2",
      );

      expect(results).toHaveLength(1);
      expect(results[0].supportsFormation("4-4-2")).toBe(true);
    });

    it("フォーメーションに対応しない戦術はフィルタされる", async () => {
      mockDB.getAllFromIndex.mockResolvedValue([sampleRecord]);

      const results = await repo.findByPhaseAndFormation(
        Phase.attack(),
        "3-5-2",
      );

      expect(results).toHaveLength(0);
    });
  });

  describe("save", () => {
    it("Tacticエンティティを永続化する", async () => {
      mockDB.put.mockResolvedValue(undefined);
      const tactic = repo.testMapToDomain(sampleRecord);

      await repo.save(tactic);

      expect(mockDB.put).toHaveBeenCalledWith(
        "tactics",
        expect.objectContaining({
          id: "tactic-1",
          phase: "attack",
          isCustom: true,
        }),
      );
    });
  });

  describe("delete", () => {
    it("IDを指定して戦術を削除する", async () => {
      mockDB.delete.mockResolvedValue(undefined);

      await repo.delete(new TacticId("tactic-1"));

      expect(mockDB.delete).toHaveBeenCalledWith("tactics", "tactic-1");
    });
  });
});
