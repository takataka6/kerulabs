/**
 * @module SketchStorage
 * @description スケッチデータのIndexedDB永続化の単体テスト
 *
 * テスト方針:
 * - IndexedDBClient と withDB をvi.mockでスタブ化し、DB操作を分離
 * - loadSketch: データ有無による返却値（SketchRecord / null）を検証
 * - saveSketch: id="current" への正規化を検証
 * - clearSketch: "current" キーの削除を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SketchRecord } from "@domain/types/Sketch";

const mockClient = { getDB: vi.fn() };

vi.mock("@infrastructure/repositories/indexeddb/IndexedDBClient", () => ({
  IndexedDBClient: {
    getInstance: () => mockClient,
  },
}));

vi.mock("@infrastructure/repositories/indexeddb/withDB", () => ({
  withDB: vi.fn(),
}));

import { SketchStorage } from "../../repositories/indexeddb/SketchStorage";
import { withDB } from "../../repositories/indexeddb/withDB";

describe("SketchStorage", () => {
  let storage: SketchStorage;
  let mockDB: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const sampleRecord: SketchRecord = {
    id: "current",
    layers: [
      {
        id: 0,
        strokes: [
          {
            id: 1,
            tool: "pen",
            points: [{ x: 0.1, y: 0.2 }],
            color: "#ff0000",
            width: 2,
          },
        ],
        visible: true,
        name: "Layer 1",
      },
    ],
    activeLayerId: 0,
    updatedAt: 1700000000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new SketchStorage();
    mockDB = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    // withDB のモックが operation コールバックを mockDB で実行するようにする
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (withDB as any).mockImplementation(
      (_client: unknown, operation: (db: typeof mockDB) => Promise<unknown>) =>
        operation(mockDB),
    );
  });

  describe("loadSketch", () => {
    it("データがある場合は SketchRecord を返す", async () => {
      mockDB.get.mockResolvedValue(sampleRecord);

      const result = await storage.loadSketch();

      expect(result).toEqual(sampleRecord);
      expect(mockDB.get).toHaveBeenCalledWith("sketches", "current");
    });

    it("データがない場合は null を返す", async () => {
      mockDB.get.mockResolvedValue(undefined);

      const result = await storage.loadSketch();

      expect(result).toBeNull();
      expect(mockDB.get).toHaveBeenCalledWith("sketches", "current");
    });
  });

  describe("saveSketch", () => {
    it('id を "current" に設定して保存する', async () => {
      mockDB.put.mockResolvedValue(undefined);

      const recordToSave: SketchRecord = {
        id: "any-id",
        layers: [],
        activeLayerId: 0,
        updatedAt: 1700000000000,
      };

      await storage.saveSketch(recordToSave);

      expect(mockDB.put).toHaveBeenCalledWith("sketches", {
        ...recordToSave,
        id: "current",
      });
    });
  });

  describe("clearSketch", () => {
    it('"current" キーを削除する', async () => {
      mockDB.delete.mockResolvedValue(undefined);

      await storage.clearSketch();

      expect(mockDB.delete).toHaveBeenCalledWith("sketches", "current");
    });
  });
});
