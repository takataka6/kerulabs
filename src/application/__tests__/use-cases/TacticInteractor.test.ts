/**
 * @module TacticInteractor
 * @description 戦術ユースケース（TacticInteractor）の単体テスト
 *
 * テスト方針:
 * - ITacticRepository をモック化し、DB層を分離
 * - CRUD操作（getAll / getByPhase / save / delete）のリポジトリ委譲を検証
 * - エラーハンドリング: handleError の呼び出しとエラー再スローを全メソッドで検証
 * - handleError モジュールはvi.mockでスタブ化
 */
import { describe, it, expect, vi } from "vitest";
import { TacticInteractor } from "../../use-cases/tactic/TacticInteractor";
import type { ITacticRepository } from "../../ports/output/repositories/ITacticRepository";
import { Tactic } from "@domain/entities/Tactic";
import { Movement } from "@domain/entities/Movement";
import { Phase } from "@domain/value-objects/Phase";
import { TacticId } from "@domain/value-objects";
import { DatabaseError } from "@shared/errors/AppError";

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

function createMockRepository(
  overrides?: Partial<ITacticRepository>,
): ITacticRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findByPhase: vi.fn().mockResolvedValue([]),
    findByPhaseAndFormation: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createSampleTactic(name: string, phase?: Phase): Tactic {
  const movements = new Map<string, Movement[]>();
  movements.set("4-4-2", [Movement.create("CF", 0, 0, 0)]);
  return Tactic.create({
    name: { ja: name, en: name },
    icon: "⚽",
    phase: phase ?? Phase.attack(),
    movements,
  });
}

describe("TacticInteractor", () => {
  describe("getAll", () => {
    it("リポジトリのfindAllを呼び出す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TacticInteractor(mockRepo);

      await interactor.getAll();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });

    it("リポジトリから取得した戦術一覧を返す", async () => {
      const tactics = [
        createSampleTactic("戦術1"),
        createSampleTactic("戦術2"),
      ];
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockResolvedValue(tactics),
      });
      const interactor = new TacticInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].getDisplayName("ja")).toBe("戦術1");
      expect(result[1].getDisplayName("ja")).toBe("戦術2");
    });

    it("戦術がない場合は空配列を返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TacticInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getByPhase", () => {
    it("指定したフェーズの戦術一覧を返す", async () => {
      const phase = Phase.attack();
      const tactics = [
        createSampleTactic("戦術A", phase),
        createSampleTactic("戦術B", phase),
      ];
      const mockRepo = createMockRepository({
        findByPhase: vi.fn().mockResolvedValue(tactics),
      });
      const interactor = new TacticInteractor(mockRepo);

      const result = await interactor.getByPhase(phase);

      expect(result).toHaveLength(2);
      expect(mockRepo.findByPhase).toHaveBeenCalledWith(phase);
    });

    it("該当する戦術がない場合は空配列を返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TacticInteractor(mockRepo);

      const result = await interactor.getByPhase(Phase.negativeTransition());

      expect(result).toEqual([]);
    });
  });

  describe("save", () => {
    it("リポジトリのsaveを呼び出す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TacticInteractor(mockRepo);
      const tactic = createSampleTactic("テスト");

      await interactor.save(tactic);

      expect(mockRepo.save).toHaveBeenCalledOnce();
      expect(mockRepo.save).toHaveBeenCalledWith(tactic);
    });
  });

  describe("delete", () => {
    it("リポジトリのdeleteを呼び出す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TacticInteractor(mockRepo);

      await interactor.delete(new TacticId("tactic-123"));

      expect(mockRepo.delete).toHaveBeenCalledOnce();
      expect(mockRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ value: "tactic-123" }),
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("getAll でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする", async () => {
      const { handleError } = await import("@shared/errors/handleError");
      const error = new Error("findAll failed");
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TacticInteractor(mockRepo);

      await expect(interactor.getAll()).rejects.toThrow(
        "TacticInteractor.getAll failed",
      );
      expect(handleError).toHaveBeenCalledWith(
        expect.any(DatabaseError),
        "TacticInteractor.getAll failed",
        undefined,
      );
    });

    it("getByPhase でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする", async () => {
      const { handleError } = await import("@shared/errors/handleError");
      const error = new Error("findByPhase failed");
      const phase = Phase.attack();
      const mockRepo = createMockRepository({
        findByPhase: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TacticInteractor(mockRepo);

      await expect(interactor.getByPhase(phase)).rejects.toThrow(
        "TacticInteractor.getByPhase failed",
      );
      expect(handleError).toHaveBeenCalledWith(
        expect.any(DatabaseError),
        "TacticInteractor.getByPhase failed",
        { meta: { phase: phase.value } },
      );
    });

    it("save でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする", async () => {
      const { handleError } = await import("@shared/errors/handleError");
      const error = new Error("save failed");
      const mockRepo = createMockRepository({
        save: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TacticInteractor(mockRepo);
      const tactic = createSampleTactic("テスト");

      await expect(interactor.save(tactic)).rejects.toThrow(
        "TacticInteractor.save failed",
      );
      expect(handleError).toHaveBeenCalledWith(
        expect.any(DatabaseError),
        "TacticInteractor.save failed",
        { meta: { tacticId: tactic.id.value } },
      );
    });

    it("delete でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする", async () => {
      const { handleError } = await import("@shared/errors/handleError");
      const error = new Error("delete failed");
      const mockRepo = createMockRepository({
        delete: vi.fn().mockRejectedValue(error),
      });
      const interactor = new TacticInteractor(mockRepo);

      await expect(
        interactor.delete(new TacticId("tactic-456")),
      ).rejects.toThrow("TacticInteractor.delete failed");
      expect(handleError).toHaveBeenCalledWith(
        expect.any(DatabaseError),
        "TacticInteractor.delete failed",
        { meta: { tacticId: "tactic-456" } },
      );
    });
  });
});
