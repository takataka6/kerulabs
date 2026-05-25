/**
 * @module FormationInteractor
 * @description フォーメーションユースケース（FormationInteractor）の単体テスト
 *
 * テスト方針:
 * - IFormationRepository をモック化し、DB層を分離
 * - getAll のリポジトリ委譲と戻り値を検証
 * - エラーハンドリング: handleError の呼び出しとエラー再スローを検証
 * - handleError モジュールはvi.mockでスタブ化
 */
import { describe, it, expect, vi } from "vitest";
import { FormationInteractor } from "../../use-cases/formation/FormationInteractor";
import type { IFormationRepository } from "../../ports/output/repositories/IFormationRepository";
import { Formation, FormationPosition } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import { FormationId } from "@domain/value-objects";
import { DatabaseError } from "@shared/errors/AppError";

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

function createMockRepository(
  overrides?: Partial<IFormationRepository>,
): IFormationRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findByType: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function create11Positions(): FormationPosition[] {
  const roles = [
    "GK",
    "LB",
    "CB1",
    "CB2",
    "RB",
    "LM",
    "CM1",
    "CM2",
    "RM",
    "CF1",
    "CF2",
  ];
  const cats: Array<"gk" | "df" | "mf" | "fw"> = [
    "gk",
    "df",
    "df",
    "df",
    "df",
    "mf",
    "mf",
    "mf",
    "mf",
    "fw",
    "fw",
  ];
  return roles.map((pos, i) => ({
    pos,
    position: Position.create(i, 0),
    category: cats[i],
  }));
}

describe("FormationInteractor", () => {
  describe("getAll", () => {
    it("リポジトリのfindAllを呼び出す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new FormationInteractor(mockRepo);

      await interactor.getAll();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });

    it("リポジトリから取得したフォーメーション一覧を返す", async () => {
      const formations = [
        Formation.createDefault(
          new FormationId("f1"),
          "4-4-2",
          "standard",
          create11Positions(),
        ),
        Formation.createDefault(
          new FormationId("f2"),
          "4-3-3",
          "standard",
          create11Positions(),
        ),
      ];
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockResolvedValue(formations),
      });
      const interactor = new FormationInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("4-4-2");
      expect(result[1].name).toBe("4-3-3");
    });

    it("フォーメーションがない場合は空配列を返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new FormationInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("エラーハンドリング", () => {
    it("getAll でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする", async () => {
      const { handleError } = await import("@shared/errors/handleError");
      const error = new Error("DB connection failed");
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockRejectedValue(error),
      });
      const interactor = new FormationInteractor(mockRepo);

      await expect(interactor.getAll()).rejects.toThrow(
        "FormationInteractor.getAll failed",
      );
      expect(handleError).toHaveBeenCalledWith(
        expect.any(DatabaseError),
        "FormationInteractor.getAll failed",
        undefined,
      );
    });
  });
});
