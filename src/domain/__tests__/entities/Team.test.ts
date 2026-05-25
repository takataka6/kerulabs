/**
 * @module Team エンティティ
 * @description Teamドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - 集約ルート（Team）による選手の追加・削除とビジネスルール検証
 * - フォーメーション管理（更新・デフォルト切替・戦術設定クリーンアップ）
 * - チームカラー・スカッド・監督などの属性更新
 * - 背番号重複チェック、空フォーメーション禁止等のドメイン制約
 */
import { describe, it, expect } from "vitest";
import { Team } from "../../entities/Team";
import { Player } from "../../entities/Player";
import type { PlayerId } from "../../value-objects/PlayerId";

describe("Team", () => {
  const defaultColors = { gk: "#ffff00", main: "#0000ff" };
  const defaultFormations = ["4-4-2", "4-3-3"];

  // ── 生成 ──

  describe("create", () => {
    it("チームを作成できる", () => {
      const team = Team.create({
        name: "テストチーム",
        subtitle: "サブタイトル",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "🇯🇵",
        headerGradient: "from-blue-500 to-blue-700",
      });
      expect(team.name).toBe("テストチーム");
      expect(team.subtitle).toBe("サブタイトル");
      expect(team.players).toHaveLength(0);
      expect(team.availableFormations).toEqual(["4-4-2", "4-3-3"]);
      expect("isCustom" in team).toBe(false); // Teamにはない
    });

    it("IDが自動生成される", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      expect(team.id.value).toBeTruthy();
    });

    it("デフォルトフォーメーションが最初のフォーメーションになる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: ["4-4-2", "3-5-2"],
        flagType: "",
        headerGradient: "",
      });
      expect(team.defaultFormation).toBe("4-4-2");
    });

    it("指定したデフォルトフォーメーションが使われる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: ["4-4-2", "3-5-2"],
        flagType: "",
        headerGradient: "",
        defaultFormation: "3-5-2",
      });
      expect(team.defaultFormation).toBe("3-5-2");
    });

    it("availableFormationsに含まれないデフォルトフォーメーションはエラー", () => {
      expect(() =>
        Team.create({
          name: "チーム",
          subtitle: "",
          colors: defaultColors,
          availableFormations: ["4-4-2"],
          flagType: "",
          headerGradient: "",
          defaultFormation: "3-5-2",
        }),
      ).toThrow(
        'Default formation "3-5-2" must be included in available formations',
      );
    });
  });

  // ── 選手管理 ──

  describe("addPlayer", () => {
    it("選手を追加できる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      const player = Player.create({
        name: "選手A",
        number: 10,
        teamId: team.id,
      });
      team.addPlayer(player);
      expect(team.players).toHaveLength(1);
      expect(team.players[0].name).toBe("選手A");
    });

    it("同じ背番号の選手は追加できない", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      const player1 = Player.create({
        name: "選手A",
        number: 10,
        teamId: team.id,
      });
      const player2 = Player.create({
        name: "選手B",
        number: 10,
        teamId: team.id,
      });
      team.addPlayer(player1);
      expect(() => team.addPlayer(player2)).toThrow(
        "Player with number 10 already exists in team",
      );
    });
  });

  describe("removePlayer", () => {
    it("選手を削除できる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      const player = Player.create({
        name: "選手A",
        number: 10,
        teamId: team.id,
      });
      team.addPlayer(player);
      team.removePlayer(player.id);
      expect(team.players).toHaveLength(0);
    });

    it("存在しない選手を削除しても何も起きない", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      const fakeId = {
        value: "non-existent",
        equals: () => false,
      } as unknown as PlayerId;
      team.removePlayer(fakeId);
      expect(team.players).toHaveLength(0);
    });
  });

  // ── 属性更新 ──

  describe("updateColors", () => {
    it("チームカラーを更新できる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      const newColors = { gk: "#000000", main: "#111111" };
      team.updateColors(newColors);
      expect(team.colors.gk.toHex()).toBe("#000000");
      expect(team.colors.main.toHex()).toBe("#111111");
    });
  });

  describe("updateName", () => {
    it("チーム名を更新できる", () => {
      const team = Team.create({
        name: "旧名前",
        subtitle: "旧サブ",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      team.updateName("新名前", "新サブ");
      expect(team.name).toBe("新名前");
      expect(team.subtitle).toBe("新サブ");
    });
  });

  // ── フォーメーション管理 ──

  describe("updateFormations", () => {
    it("フォーメーションを更新できる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      team.updateFormations(["4-3-3", "3-5-2"]);
      expect(team.availableFormations).toEqual(["4-3-3", "3-5-2"]);
    });

    it("空のフォーメーションはエラーになる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      expect(() => team.updateFormations([])).toThrow(
        "At least one formation must be selected",
      );
    });

    it("削除されたフォーメーションの戦術設定がクリーンアップされる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: ["4-4-2", "3-5-2"],
        flagType: "",
        headerGradient: "",
      });
      team.updateAvailableTactics({
        "4-4-2": ["tactic-1"],
        "3-5-2": ["tactic-2"],
      });
      team.updateFormations(["4-4-2"]);
      expect(team.getAvailableTacticsForFormation("3-5-2")).toBeUndefined();
    });

    it("デフォルトフォーメーションが削除された場合は最初のフォーメーションに変わる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: ["4-4-2", "3-5-2"],
        flagType: "",
        headerGradient: "",
        defaultFormation: "3-5-2",
      });
      team.updateFormations(["4-4-2"]);
      expect(team.defaultFormation).toBe("4-4-2");
    });
  });

  describe("updateSelectedSquad", () => {
    it("スカッドを更新できる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      team.updateSelectedSquad(["player-1", "player-2"]);
      expect(team.selectedSquad).toEqual(["player-1", "player-2"]);
    });
  });

  describe("updateManager", () => {
    it("監督名を設定できる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      team.updateManager("監督A");
      expect(team.manager).toBe("監督A");
    });

    it("空文字を渡すとundefinedになる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      team.updateManager("監督A");
      team.updateManager(undefined);
      expect(team.manager).toBeUndefined();
    });
  });

  // ── 戦術管理 ──

  describe("availableTactics", () => {
    it("フォーメーション別の戦術を設定・取得できる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      team.updateAvailableTactics({ "4-4-2": ["tactic-1", "tactic-2"] });
      expect(team.getAvailableTacticsForFormation("4-4-2")).toEqual([
        "tactic-1",
        "tactic-2",
      ]);
    });

    it("戦術が設定されていないフォーメーションはundefined", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      expect(team.getAvailableTacticsForFormation("4-4-2")).toBeUndefined();
    });

    it("空の戦術配列はクリーンアップされる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: defaultColors,
        availableFormations: defaultFormations,
        flagType: "",
        headerGradient: "",
      });
      team.updateAvailableTactics({ "4-4-2": [] });
      expect(team.availableTactics).toBeUndefined();
    });
  });
});
