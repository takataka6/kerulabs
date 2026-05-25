/**
 * @module GlossaryInteractor
 * @description 用語集ユースケース（GlossaryInteractor）の単体テスト
 *
 * テスト方針:
 * - IGlossaryRepository をモック化し、DB層を分離
 * - CRUD操作（getAll / getById / save / delete）のリポジトリ委譲を検証
 * - エラーハンドリング: リポジトリエラーがそのまま伝播することを確認
 */
import { describe, it, expect, vi } from "vitest";
import { GlossaryInteractor } from "../../use-cases/glossary/GlossaryInteractor";
import type { IGlossaryRepository } from "../../ports/output/repositories/IGlossaryRepository";
import { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects";

function createMockRepository(
  overrides?: Partial<IGlossaryRepository>,
): IGlossaryRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const now = new Date("2025-01-01T00:00:00Z");

function createTestGlossary(id = "g-1", name = "Test"): Glossary {
  return new Glossary({
    id: new GlossaryId(id),
    name,
    description: "desc",
    terms: [],
    createdAt: now,
    updatedAt: now,
  });
}

describe("GlossaryInteractor", () => {
  describe("getAll", () => {
    it("リポジトリの findAll() に委譲する", async () => {
      const mockRepo = createMockRepository();
      const interactor = new GlossaryInteractor(mockRepo);

      await interactor.getAll();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });

    it("リポジトリから取得した用語集一覧を返す", async () => {
      const glossaries = [
        createTestGlossary("g-1", "用語集1"),
        createTestGlossary("g-2", "用語集2"),
      ];
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockResolvedValue(glossaries),
      });
      const interactor = new GlossaryInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("用語集1");
      expect(result[1].name).toBe("用語集2");
    });

    it("用語集がない場合は空配列を返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new GlossaryInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("リポジトリの findById() に委譲する", async () => {
      const glossary = createTestGlossary();
      const mockRepo = createMockRepository({
        findById: vi.fn().mockResolvedValue(glossary),
      });
      const interactor = new GlossaryInteractor(mockRepo);

      const result = await interactor.getById(new GlossaryId("g-1"));

      expect(result).toBe(glossary);
      expect(mockRepo.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: "g-1" }),
      );
    });

    it("存在しないIDの場合はnullを返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new GlossaryInteractor(mockRepo);

      const result = await interactor.getById(new GlossaryId("non-existent"));

      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("リポジトリの save() に委譲する", async () => {
      const glossary = createTestGlossary();
      const mockRepo = createMockRepository();
      const interactor = new GlossaryInteractor(mockRepo);

      await interactor.save(glossary);

      expect(mockRepo.save).toHaveBeenCalledOnce();
      expect(mockRepo.save).toHaveBeenCalledWith(glossary);
    });
  });

  describe("delete", () => {
    it("リポジトリの delete() に委譲する", async () => {
      const mockRepo = createMockRepository();
      const interactor = new GlossaryInteractor(mockRepo);

      await interactor.delete(new GlossaryId("g-1"));

      expect(mockRepo.delete).toHaveBeenCalledOnce();
      expect(mockRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ value: "g-1" }),
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("リポジトリの findAll がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("DB connection failed");
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockRejectedValue(error),
      });
      const interactor = new GlossaryInteractor(mockRepo);

      await expect(interactor.getAll()).rejects.toThrow(
        "GlossaryInteractor.getAll failed",
      );
    });

    it("リポジトリの findById がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("findById failed");
      const mockRepo = createMockRepository({
        findById: vi.fn().mockRejectedValue(error),
      });
      const interactor = new GlossaryInteractor(mockRepo);

      await expect(interactor.getById(new GlossaryId("g-1"))).rejects.toThrow(
        "GlossaryInteractor.getById failed",
      );
    });

    it("リポジトリの save がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("save failed");
      const mockRepo = createMockRepository({
        save: vi.fn().mockRejectedValue(error),
      });
      const interactor = new GlossaryInteractor(mockRepo);
      const glossary = createTestGlossary();

      await expect(interactor.save(glossary)).rejects.toThrow("save failed");
    });

    it("リポジトリの delete がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("delete failed");
      const mockRepo = createMockRepository({
        delete: vi.fn().mockRejectedValue(error),
      });
      const interactor = new GlossaryInteractor(mockRepo);

      await expect(interactor.delete(new GlossaryId("g-1"))).rejects.toThrow(
        "delete failed",
      );
    });
  });
});
