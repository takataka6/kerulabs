/**
 * @module TeamManualInteractor
 * @description チームマニュアルユースケース（TeamManualInteractor）の単体テスト
 *
 * テスト方針:
 * - ITeamManualRepository をモック化し、DB層を分離
 * - CRUD操作のリポジトリ委譲を検証
 * - エラーハンドリング: リポジトリエラーがそのまま伝播することを確認
 */
import { describe, it, expect, vi } from "vitest";
import { TeamManualInteractor } from "../../use-cases/team-manual/TeamManualInteractor";
import type { ITeamManualRepository } from "../../ports/output/repositories/ITeamManualRepository";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects";

function createMockRepository(
  overrides?: Partial<ITeamManualRepository>,
): ITeamManualRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const now = new Date("2025-01-01T00:00:00Z");

function createTestManual(id = "m-1", name = "Test"): TeamManual {
  return new TeamManual({
    id: new TeamManualId(id),
    name,
    description: "desc",
    sections: [],
    createdAt: now,
    updatedAt: now,
  });
}

describe("TeamManualInteractor", () => {
  describe("getAll", () => {
    it("リポジトリの findAll() に委譲する", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TeamManualInteractor(mockRepo);

      await interactor.getAll();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });

    it("リポジトリから取得したマニュアル一覧を返す", async () => {
      const manuals = [
        createTestManual("m-1", "マニュアル1"),
        createTestManual("m-2", "マニュアル2"),
      ];
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockResolvedValue(manuals),
      });
      const interactor = new TeamManualInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("マニュアル1");
      expect(result[1].name).toBe("マニュアル2");
    });

    it("マニュアルがない場合は空配列を返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TeamManualInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("リポジトリの findById() に委譲する", async () => {
      const manual = createTestManual();
      const mockRepo = createMockRepository({
        findById: vi.fn().mockResolvedValue(manual),
      });
      const interactor = new TeamManualInteractor(mockRepo);

      const result = await interactor.getById(new TeamManualId("m-1"));

      expect(result).toBe(manual);
      expect(mockRepo.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: "m-1" }),
      );
    });

    it("存在しないIDの場合はnullを返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TeamManualInteractor(mockRepo);

      const result = await interactor.getById(new TeamManualId("non-existent"));

      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("リポジトリの save() に委譲する", async () => {
      const manual = createTestManual();
      const mockRepo = createMockRepository();
      const interactor = new TeamManualInteractor(mockRepo);

      await interactor.save(manual);

      expect(mockRepo.save).toHaveBeenCalledOnce();
      expect(mockRepo.save).toHaveBeenCalledWith(manual);
    });
  });

  describe("delete", () => {
    it("リポジトリの delete() に委譲する", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TeamManualInteractor(mockRepo);

      await interactor.delete(new TeamManualId("m-1"));

      expect(mockRepo.delete).toHaveBeenCalledOnce();
      expect(mockRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ value: "m-1" }),
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("findAll がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("DB connection failed");
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TeamManualInteractor(mockRepo);

      await expect(interactor.getAll()).rejects.toThrow(
        "TeamManualInteractor.getAll failed",
      );
    });

    it("findById がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("findById failed");
      const mockRepo = createMockRepository({
        findById: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TeamManualInteractor(mockRepo);

      await expect(interactor.getById(new TeamManualId("m-1"))).rejects.toThrow(
        "TeamManualInteractor.getById failed",
      );
    });

    it("save がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("save failed");
      const mockRepo = createMockRepository({
        save: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TeamManualInteractor(mockRepo);
      const manual = createTestManual();

      await expect(interactor.save(manual)).rejects.toThrow("save failed");
    });

    it("delete がエラーを投げた場合、そのまま伝播する", async () => {
      const error = new Error("delete failed");
      const mockRepo = createMockRepository({
        delete: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TeamManualInteractor(mockRepo);

      await expect(interactor.delete(new TeamManualId("m-1"))).rejects.toThrow(
        "delete failed",
      );
    });
  });
});
