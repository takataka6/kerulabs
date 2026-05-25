/**
 * @module TeamInteractor
 * @description チームユースケース（TeamInteractor）の単体テスト
 *
 * テスト方針:
 * - ITeamRepository をモック化し、DB層を分離
 * - getAll / getById のリポジトリ委譲と戻り値を検証
 * - 存在しないIDの場合のnull返却を確認
 */
import { describe, it, expect, vi } from "vitest";
import { TeamInteractor } from "../../use-cases/team/TeamInteractor";
import type { ITeamRepository } from "../../ports/output/repositories/ITeamRepository";
import { Team } from "@domain/entities/Team";
import { TeamId } from "@domain/value-objects/TeamId";

function createMockRepository(
  overrides?: Partial<ITeamRepository>,
): ITeamRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("TeamInteractor", () => {
  describe("getAll", () => {
    it("リポジトリのfindAllを呼び出す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TeamInteractor(mockRepo);

      await interactor.getAll();

      expect(mockRepo.findAll).toHaveBeenCalledOnce();
    });

    it("リポジトリから取得したチーム一覧を返す", async () => {
      const teams = [
        Team.create({
          name: "チーム1",
          subtitle: "",
          colors: { gk: "#fff", main: "#fff" },
          availableFormations: ["4-4-2"],
          flagType: "",
          headerGradient: "",
        }),
        Team.create({
          name: "チーム2",
          subtitle: "",
          colors: { gk: "#000", main: "#000" },
          availableFormations: ["3-5-2"],
          flagType: "",
          headerGradient: "",
        }),
      ];
      const mockRepo = createMockRepository({
        findAll: vi.fn().mockResolvedValue(teams),
      });
      const interactor = new TeamInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("チーム1");
      expect(result[1].name).toBe("チーム2");
    });

    it("チームがない場合は空配列を返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TeamInteractor(mockRepo);

      const result = await interactor.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("IDを指定してチームを取得できる", async () => {
      const team = Team.create({
        name: "テストチーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      const mockRepo = createMockRepository({
        findById: vi.fn().mockResolvedValue(team),
      });
      const interactor = new TeamInteractor(mockRepo);

      const result = await interactor.getById(team.id);

      expect(result).not.toBeNull();
      expect(result!.name).toBe("テストチーム");
      expect(mockRepo.findById).toHaveBeenCalledWith(team.id);
    });

    it("存在しないIDの場合はnullを返す", async () => {
      const mockRepo = createMockRepository();
      const interactor = new TeamInteractor(mockRepo);

      const result = await interactor.getById(new TeamId("non-existent"));

      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("リポジトリのsaveを呼び出す", async () => {
      const team = Team.create({
        name: "テストチーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      const mockRepo = createMockRepository();
      const interactor = new TeamInteractor(mockRepo);

      await interactor.save(team);

      expect(mockRepo.save).toHaveBeenCalledWith(team);
    });
  });

  describe("delete", () => {
    it("リポジトリのdeleteを呼び出す", async () => {
      const teamId = new TeamId("team-to-delete");
      const mockRepo = createMockRepository();
      const interactor = new TeamInteractor(mockRepo);

      await interactor.delete(teamId);

      expect(mockRepo.delete).toHaveBeenCalledWith(teamId);
    });
  });
});
