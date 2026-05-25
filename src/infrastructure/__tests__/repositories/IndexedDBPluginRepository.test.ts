/**
 * @module IndexedDBPluginRepository
 * @description IndexedDBを使ったプラグインリポジトリの単体テスト
 *
 * テスト方針:
 * - IndexedDBClient をvi.mockでスタブ化し、mockDBでCRUD操作をシミュレーション
 * - マッパーテスト: ドメイン⇔永続化レコードの変換精度を検証
 * - CRUDテスト: findAll / findById / findByMetadataId / save / delete のDB操作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexedDBPluginRepository } from "../../repositories/indexeddb/IndexedDBPluginRepository";
import { Plugin } from "@domain/entities/Plugin";
import { PluginId } from "@domain/value-objects";

// --- Mock DB ---
const mockDB = {
  getAll: vi.fn(),
  get: vi.fn(),
  getFromIndex: vi.fn(),
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

const sampleRecord = {
  id: "uuid-1",
  kerulabs_plugin: "1.0",
  type: "lesson" as const,
  metadata: {
    id: "test-plugin",
    name: { ja: "テスト", en: "Test" },
    author: "Author",
    version: "1.0.0",
    description: { ja: "説明", en: "Description" },
  },
  data: {
    lessonId: "test-lesson",
    category: "programming-basics",
    title: { ja: "タイトル", en: "Title" },
    description: { ja: "説明", en: "Desc" },
    icon: "🧪",
    gradient: "from-blue-600 to-cyan-500",
    sections: [{ type: "heading", text: { ja: "見出し", en: "Heading" } }],
  },
  installedAt: 1700000000000,
};

describe("IndexedDBPluginRepository", () => {
  const repo = new IndexedDBPluginRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("全プラグインをドメインオブジェクトとして返す", async () => {
      mockDB.getAll.mockResolvedValue([sampleRecord]);

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Plugin);
      expect(result[0].id.value).toBe("uuid-1");
      expect(result[0].metadataId).toBe("test-plugin");
      expect(result[0].type).toBe("lesson");
      expect(mockDB.getAll).toHaveBeenCalledWith("plugins");
    });

    it("プラグインがない場合は空配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([]);

      const result = await repo.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("IDでプラグインを取得する", async () => {
      mockDB.get.mockResolvedValue(sampleRecord);

      const result = await repo.findById(new PluginId("uuid-1"));

      expect(result).toBeInstanceOf(Plugin);
      expect(result?.id.value).toBe("uuid-1");
      expect(mockDB.get).toHaveBeenCalledWith("plugins", "uuid-1");
    });

    it("存在しない場合はnullを返す", async () => {
      mockDB.get.mockResolvedValue(undefined);

      const result = await repo.findById(new PluginId("nonexistent"));

      expect(result).toBeNull();
    });
  });

  describe("findByMetadataId", () => {
    it("メタデータIDでプラグインを取得する", async () => {
      mockDB.getFromIndex.mockResolvedValue(sampleRecord);

      const result = await repo.findByMetadataId("test-plugin");

      expect(result).toBeInstanceOf(Plugin);
      expect(result?.metadataId).toBe("test-plugin");
      expect(mockDB.getFromIndex).toHaveBeenCalledWith(
        "plugins",
        "by-metadata-id",
        "test-plugin",
      );
    });

    it("存在しない場合はnullを返す", async () => {
      mockDB.getFromIndex.mockResolvedValue(undefined);

      const result = await repo.findByMetadataId("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("プラグインを永続化レコードとして保存する", async () => {
      const plugin = new Plugin({
        id: new PluginId("uuid-1"),
        kerulabsPlugin: "1.0",
        type: "lesson",
        metadata: sampleRecord.metadata,
        data: sampleRecord.data as Plugin["data"],
        installedAt: new Date(1700000000000),
      });

      await repo.save(plugin);

      expect(mockDB.put).toHaveBeenCalledWith("plugins", {
        id: "uuid-1",
        kerulabs_plugin: "1.0",
        type: "lesson",
        metadata: sampleRecord.metadata,
        data: sampleRecord.data,
        installedAt: 1700000000000,
      });
    });
  });

  describe("delete", () => {
    it("IDでプラグインを削除する", async () => {
      await repo.delete(new PluginId("uuid-1"));

      expect(mockDB.delete).toHaveBeenCalledWith("plugins", "uuid-1");
    });
  });

  describe("ドメインマッピング", () => {
    it("永続化レコードからドメインオブジェクトへのラウンドトリップが正しい", async () => {
      mockDB.getAll.mockResolvedValue([sampleRecord]);

      const [plugin] = await repo.findAll();

      expect(plugin.id.value).toBe(sampleRecord.id);
      expect(plugin.kerulabsPlugin).toBe(sampleRecord.kerulabs_plugin);
      expect(plugin.type).toBe(sampleRecord.type);
      expect(plugin.metadata).toEqual(sampleRecord.metadata);
      expect(plugin.data.lessonId).toBe(sampleRecord.data.lessonId);
      expect(plugin.installedAt).toEqual(new Date(sampleRecord.installedAt));
    });
  });
});
