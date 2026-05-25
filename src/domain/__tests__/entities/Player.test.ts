/**
 * @module Player エンティティ
 * @description Playerドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - ファクトリメソッド（create）による生成とバリデーションを網羅
 * - 各updateメソッドの状態変更と更新日時の自動更新を検証
 * - 背番号の境界値（0〜99）やデフォルト値の確認
 */
import { describe, it, expect } from "vitest";
import { Player } from "../../entities/Player";
import { TeamId } from "../../value-objects/TeamId";

describe("Player", () => {
  const teamId = new TeamId("team-1");

  // ── 生成 ──

  describe("create", () => {
    it("選手を作成できる", () => {
      const player = Player.create({ name: "田中太郎", number: 10, teamId });
      expect(player.name).toBe("田中太郎");
      expect(player.number).toBe(10);
      expect(player.teamId.equals(teamId)).toBe(true);
      expect(player.position).toBe("mf"); // デフォルト
    });

    it("ポジションを指定して作成できる", () => {
      const player = Player.create({
        name: "鈴木花子",
        number: 1,
        teamId,
        position: "gk",
      });
      expect(player.position).toBe("gk");
    });

    it("国籍・クラブ・リーグ国を指定できる", () => {
      const player = Player.create({
        name: "John",
        number: 7,
        teamId,
        position: "fw",
        nationality: "England",
        club: "FC Example",
        leagueCountry: "England",
      });
      expect(player.nationality).toBe("England");
      expect(player.club).toBe("FC Example");
      expect(player.leagueCountry).toBe("England");
    });

    it("IDが自動生成される", () => {
      const player = Player.create({ name: "選手A", number: 1, teamId });
      expect(player.id.value).toBeTruthy();
    });

    it("作成日時と更新日時が設定される", () => {
      const player = Player.create({ name: "選手A", number: 1, teamId });
      expect(player.createdAt).toBeInstanceOf(Date);
      expect(player.updatedAt).toBeInstanceOf(Date);
    });
  });

  // ── バリデーション ──

  describe("バリデーション", () => {
    it("背番号0は有効", () => {
      const player = Player.create({ name: "選手A", number: 0, teamId });
      expect(player.number).toBe(0);
    });

    it("背番号99は有効", () => {
      const player = Player.create({ name: "選手A", number: 99, teamId });
      expect(player.number).toBe(99);
    });

    it("背番号が負の値はエラーになる", () => {
      expect(() =>
        Player.create({ name: "選手A", number: -1, teamId }),
      ).toThrow("Player number must be between 0 and 99");
    });

    it("背番号が100以上はエラーになる", () => {
      expect(() =>
        Player.create({ name: "選手A", number: 100, teamId }),
      ).toThrow("Player number must be between 0 and 99");
    });
  });

  // ── フィールド更新 ──

  describe("updateName", () => {
    it("名前を更新できる", () => {
      const player = Player.create({ name: "旧名前", number: 10, teamId });
      player.updateName("新名前");
      expect(player.name).toBe("新名前");
    });

    it("更新日時が変わる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      const before = player.updatedAt;
      player.updateName("新名前");
      expect(player.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe("updateNumber", () => {
    it("背番号を更新できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updateNumber(7);
      expect(player.number).toBe(7);
    });

    it("不正な背番号への更新はエラーになる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      expect(() => player.updateNumber(-1)).toThrow(
        "Player number must be between 0 and 99",
      );
    });
  });

  describe("updatePosition", () => {
    it("ポジションを更新できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updatePosition("fw");
      expect(player.position).toBe("fw");
    });
  });

  describe("updateNationality", () => {
    it("国籍を更新できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updateNationality("Japan");
      expect(player.nationality).toBe("Japan");
    });

    it("undefinedで国籍を削除できる", () => {
      const player = Player.create({
        name: "選手A",
        number: 10,
        teamId,
        nationality: "Japan",
      });
      player.updateNationality(undefined);
      expect(player.nationality).toBeUndefined();
    });

    it("空文字はエラーになる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      expect(() => player.updateNationality("")).toThrow(
        "Player nationality cannot be empty",
      );
    });
  });

  describe("updateClub", () => {
    it("クラブを更新できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updateClub("FC Sample");
      expect(player.club).toBe("FC Sample");
    });

    it("undefinedでクラブを削除できる", () => {
      const player = Player.create({
        name: "選手A",
        number: 10,
        teamId,
        club: "FC Sample",
      });
      player.updateClub(undefined);
      expect(player.club).toBeUndefined();
    });

    it("空文字はエラーになる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      expect(() => player.updateClub("")).toThrow(
        "Player club cannot be empty",
      );
    });
  });

  describe("updateLeagueCountry", () => {
    it("リーグ国を更新できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updateLeagueCountry("Japan");
      expect(player.leagueCountry).toBe("Japan");
    });

    it("undefinedでリーグ国を削除できる", () => {
      const player = Player.create({
        name: "選手A",
        number: 10,
        teamId,
        leagueCountry: "Japan",
      });
      player.updateLeagueCountry(undefined);
      expect(player.leagueCountry).toBeUndefined();
    });

    it("空文字はエラーになる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      expect(() => player.updateLeagueCountry("")).toThrow(
        "Player leagueCountry cannot be empty",
      );
    });
  });

  describe("updateNote", () => {
    it("メモを設定できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updateNote("右膝に不安");
      expect(player.note).toBe("右膝に不安");
    });

    it("メモを削除できる", () => {
      const player = Player.create({
        name: "選手A",
        number: 10,
        teamId,
        note: "初期メモ",
      });
      player.updateNote(undefined);
      expect(player.note).toBeUndefined();
    });

    it("更新日時が変わる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      const before = player.updatedAt;
      player.updateNote("メモ");
      expect(player.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  // ── ステータス管理 ──

  describe("updateStatus", () => {
    it("デフォルトは available", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      expect(player.status).toBe("available");
    });

    it("ステータスを suspended に更新できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updateStatus("suspended");
      expect(player.status).toBe("suspended");
    });

    it("ステータスを injured に更新できる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      player.updateStatus("injured");
      expect(player.status).toBe("injured");
    });

    it("ステータスを指定して作成できる", () => {
      const player = Player.create({
        name: "選手A",
        number: 10,
        teamId,
        status: "injured",
      });
      expect(player.status).toBe("injured");
    });

    it("更新日時が変わる", () => {
      const player = Player.create({ name: "選手A", number: 10, teamId });
      const before = player.updatedAt;
      player.updateStatus("suspended");
      expect(player.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });
});
