/**
 * @module PluginInteractor
 * @description プラグインユースケース（PluginInteractor）の単体テスト
 *
 * テスト方針:
 * - IPluginRepository をモック化し、DB層を分離
 * - CRUD操作のリポジトリ委譲を検証
 * - JSONインポート時のバリデーション・重複チェックを検証
 */
import { describe, it, expect, vi } from "vitest";
import { PluginInteractor } from "../../use-cases/plugin/PluginInteractor";
import type { IPluginRepository } from "../../ports/output/repositories/IPluginRepository";
import { Plugin } from "@domain/entities/Plugin";
import { PluginId } from "@domain/value-objects";

function createMockRepository(
  overrides?: Partial<IPluginRepository>,
): IPluginRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findByMetadataId: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function validManifestJson() {
  return JSON.stringify({
    kerulabs_plugin: "1.0",
    type: "lesson",
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
  });
}

function createTestPlugin(): Plugin {
  return new Plugin({
    id: new PluginId("existing-id"),
    kerulabsPlugin: "1.0",
    type: "lesson",
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
    installedAt: new Date("2025-01-01"),
  });
}

describe("PluginInteractor", () => {
  describe("getAll", () => {
    it("リポジトリの findAll() に委譲する", async () => {
      const mockRepo = createMockRepository();
      const interactor = new PluginInteractor(mockRepo);

      await interactor.getAll();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });

    it("プラグイン一覧を返す", async () => {
      const plugins = [createTestPlugin()];
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockResolvedValue(plugins),
      });
      const interactor = new PluginInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].metadataId).toBe("test-plugin");
    });
  });

  describe("getById", () => {
    it("リポジトリの findById() に委譲する", async () => {
      const plugin = createTestPlugin();
      const mockRepo = createMockRepository({
        findById: vi.fn().mockResolvedValue(plugin),
      });
      const interactor = new PluginInteractor(mockRepo);

      const result = await interactor.getById(new PluginId("existing-id"));

      expect(result).toBe(plugin);
    });

    it("存在しないIDの場合はnullを返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new PluginInteractor(mockRepo);

      const result = await interactor.getById(new PluginId("nonexistent"));

      expect(result).toBeNull();
    });
  });

  describe("importFromJson", () => {
    it("有効なJSONからプラグインをインポートする", async () => {
      const mockRepo = createMockRepository();
      const interactor = new PluginInteractor(mockRepo);

      const result = await interactor.importFromJson(validManifestJson());

      expect(result).toBeInstanceOf(Plugin);
      expect(result.metadataId).toBe("test-plugin");
      expect(result.type).toBe("lesson");
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    it("不正なJSONではエラーを投げる", async () => {
      const mockRepo = createMockRepository();
      const interactor = new PluginInteractor(mockRepo);

      await expect(interactor.importFromJson("invalid json")).rejects.toThrow();
    });

    it("スキーマに合わないJSONではエラーを投げる", async () => {
      const mockRepo = createMockRepository();
      const interactor = new PluginInteractor(mockRepo);

      const invalidJson = JSON.stringify({ type: "invalid" });
      await expect(interactor.importFromJson(invalidJson)).rejects.toThrow();
    });

    it("同じmetadata.idのプラグインがある場合は上書きする", async () => {
      const existing = createTestPlugin();
      const mockRepo = createMockRepository({
        findByMetadataId: vi.fn().mockResolvedValue(existing),
      });
      const interactor = new PluginInteractor(mockRepo);

      const result = await interactor.importFromJson(validManifestJson());

      // 既存のIDを再利用する
      expect(result.id.value).toBe("existing-id");
      expect(mockRepo.save).toHaveBeenCalledOnce();
    });

    it("新規プラグインには新しいIDが生成される", async () => {
      const mockRepo = createMockRepository();
      const interactor = new PluginInteractor(mockRepo);

      const result = await interactor.importFromJson(validManifestJson());

      expect(result.id.value).toBeTruthy();
      expect(result.id.value).not.toBe("existing-id");
    });
  });

  describe("delete", () => {
    it("リポジトリの delete() に委譲する", async () => {
      const mockRepo = createMockRepository();
      const interactor = new PluginInteractor(mockRepo);

      await interactor.delete(new PluginId("plugin-1"));

      expect(mockRepo.delete).toHaveBeenCalledOnce();
      expect(mockRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ value: "plugin-1" }),
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("findAll がエラーを投げた場合、伝播する", async () => {
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockRejectedValue(new Error("DB error")),
      });
      const interactor = new PluginInteractor(mockRepo);

      await expect(interactor.getAll()).rejects.toThrow(
        "PluginInteractor.getAll failed",
      );
    });

    it("findById がエラーを投げた場合、伝播する", async () => {
      const mockRepo = createMockRepository({
        findById: vi.fn().mockRejectedValue(new Error("DB error")),
      });
      const interactor = new PluginInteractor(mockRepo);

      await expect(interactor.getById(new PluginId("id"))).rejects.toThrow(
        "PluginInteractor.getById failed",
      );
    });

    it("delete がエラーを投げた場合、伝播する", async () => {
      const mockRepo = createMockRepository({
        delete: vi.fn().mockRejectedValue(new Error("DB error")),
      });
      const interactor = new PluginInteractor(mockRepo);

      await expect(interactor.delete(new PluginId("id"))).rejects.toThrow(
        "PluginInteractor.delete failed",
      );
    });
  });
});
