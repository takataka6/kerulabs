/**
 * @module IndexedDBTeamRepository
 * @description IndexedDBを使ったチームリポジトリの単体テスト
 *
 * テスト方針:
 * - IndexedDBClient をvi.mockでスタブ化し、mockDBオブジェクトでCRUD操作をシミュレーション
 * - TestableTeamRepository サブクラスでprotectedなmapToDomain/mapToPersistenceを公開
 * - マッパーテスト: ドメイン⇔永続化レコードの変換精度を検証
 *   （選手・カラー・フォーメーション・スカッド・カード・戦術など全フィールド）
 * - ラウンドトリップ: mapToPersistence→mapToDomainで値が保持されることを検証
 * - CRUDテスト: findAll / findById / save / delete のDB操作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IndexedDBTeamRepository } from "../../repositories/indexeddb/IndexedDBTeamRepository";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";

// --- Mock DB ---
const mockDB = {
  getAll: vi.fn(),
  get: vi.fn(),
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

/**
 * テスト用サブクラス --- protected な mapToDomain / mapToPersistence を公開する。
 * これにより IndexedDB を使わずにマッパーロジックだけを単体テストできる。
 */
class TestableTeamRepository extends IndexedDBTeamRepository {
  public testMapToDomain(record: Parameters<typeof this.mapToDomain>[0]) {
    return this.mapToDomain(record);
  }
  public testMapToPersistence(team: Team) {
    return this.mapToPersistence(team);
  }
}

// --- テストデータ ---

const sampleRecord = {
  id: "team-1",
  name: "テストチーム",
  subtitle: "サブタイトル",
  colors: { gk: "#ffff00", main: "#0000ff" },
  availableFormations: ["4-4-2", "4-3-3"],
  players: [
    {
      id: "player-1",
      name: "田中太郎",
      number: 10,
      position: "mf" as const,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      nationality: "Japan",
      club: "FC Sample",
      leagueCountry: "Japan",
    },
  ],
  flagType: "flag-jp",
  headerGradient: "from-blue-500 to-blue-700",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  country: "Japan",
  defaultFormation: "4-4-2",
  manager: "監督A",
};

describe("IndexedDBTeamRepository", () => {
  const repo = new TestableTeamRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ────────────────────────────────────────────
  // マッパーテスト
  // ────────────────────────────────────────────
  describe("mapToDomain", () => {
    it("レコードからTeamエンティティに変換できる", () => {
      const team = repo.testMapToDomain(sampleRecord);

      expect(team).toBeInstanceOf(Team);
      expect(team.id.value).toBe("team-1");
      expect(team.name).toBe("テストチーム");
      expect(team.subtitle).toBe("サブタイトル");
      expect(team.colors.gk.toHex()).toBe("#ffff00");
      expect(team.colors.main.toHex()).toBe("#0000ff");
      expect(team.availableFormations).toEqual(["4-4-2", "4-3-3"]);
      expect(team.flagType).toBe("flag-jp");
      expect(team.country).toBe("Japan");
      expect(team.manager).toBe("監督A");
    });

    it("選手データが正しく復元される", () => {
      const team = repo.testMapToDomain(sampleRecord);

      expect(team.players).toHaveLength(1);
      const player = team.players[0];
      expect(player.id.value).toBe("player-1");
      expect(player.name).toBe("田中太郎");
      expect(player.number).toBe(10);
      expect(player.position).toBe("mf");
      expect(player.nationality).toBe("Japan");
      expect(player.club).toBe("FC Sample");
    });

    it("選手がいないレコードでも変換できる", () => {
      const recordWithoutPlayers = { ...sampleRecord, players: undefined };
      const team = repo.testMapToDomain(recordWithoutPlayers);
      expect(team.players).toHaveLength(0);
    });

    it("createdAt/updatedAtがDateに変換される", () => {
      const team = repo.testMapToDomain(sampleRecord);
      expect(team.createdAt).toBeInstanceOf(Date);
      expect(team.createdAt.getTime()).toBe(1700000000000);
    });

    it("選手のpositionが未設定の場合mfにフォールバックする", () => {
      const recordWithNoPosition = {
        ...sampleRecord,
        players: [
          {
            id: "player-2",
            name: "無ポジション選手",
            number: 99,
            createdAt: 1700000000000,
            updatedAt: 1700000000000,
          },
        ],
      };
      const team = repo.testMapToDomain(recordWithNoPosition);
      expect(team.players[0].position).toBe("mf");
    });

    it("選手のstatusが未設定の場合availableにフォールバックする", () => {
      const recordWithNoStatus = {
        ...sampleRecord,
        players: [
          {
            id: "player-3",
            name: "ステータスなし",
            number: 5,
            position: "df" as const,
            createdAt: 1700000000000,
            updatedAt: 1700000000000,
          },
        ],
      };
      const team = repo.testMapToDomain(recordWithNoStatus);
      expect(team.players[0].status).toBe("available");
    });

    it("選手のオプショナルフィールドが正しく復元される", () => {
      const recordWithAllFields = {
        ...sampleRecord,
        players: [
          {
            id: "player-full",
            name: "フル選手",
            number: 7,
            position: "fw" as const,
            createdAt: 1700000000000,
            updatedAt: 1700000000000,
            nationality: "Brazil",
            club: "FC Sample",
            leagueCountry: "Brazil",
            imageUrl: "https://example.com/image.jpg",
            mainVisualImageUrl: "https://example.com/main.jpg",
            note: "メモ",
            status: "injured" as const,
          },
        ],
      };
      const team = repo.testMapToDomain(recordWithAllFields);
      const player = team.players[0];
      expect(player.imageUrl).toBe("https://example.com/image.jpg");
      expect(player.mainVisualImageUrl).toBe("https://example.com/main.jpg");
      expect(player.note).toBe("メモ");
      expect(player.status).toBe("injured");
    });

    it("selectedSquadが復元される", () => {
      const recordWithSquad = {
        ...sampleRecord,
        selectedSquad: ["player-1", "player-2"],
      };
      const team = repo.testMapToDomain(recordWithSquad);
      expect(team.selectedSquad).toEqual(["player-1", "player-2"]);
    });

    it("playerCardsが復元される", () => {
      const recordWithCards = {
        ...sampleRecord,
        playerCards: { 0: "yellow", 3: "red" },
      };
      const team = repo.testMapToDomain(recordWithCards);
      expect(team.playerCards).toEqual({ 0: "yellow", 3: "red" });
    });

    it("managerCardが復元される", () => {
      const recordWithManagerCard = {
        ...sampleRecord,
        managerCard: "yellow",
      };
      const team = repo.testMapToDomain(recordWithManagerCard);
      expect(team.managerCard).toBe("yellow");
    });
  });

  describe("mapToPersistence", () => {
    it("Teamエンティティをレコードに変換できる", () => {
      const team = Team.create({
        name: "テストチーム",
        subtitle: "サブタイトル",
        colors: { gk: "#ffff00", main: "#0000ff" },
        availableFormations: ["4-4-2"],
        flagType: "flag-jp",
        headerGradient: "from-blue-500 to-blue-700",
        country: "Japan",
      });

      const record = repo.testMapToPersistence(team);

      expect(record.id).toBe(team.id.value);
      expect(record.name).toBe("テストチーム");
      expect(record.colors.gk).toBe("#ffff00");
      expect(record.colors.main).toBe("#0000ff");
      expect(record.availableFormations).toEqual(["4-4-2"]);
      expect(record.flagType).toBe("flag-jp");
      expect(typeof record.createdAt).toBe("number");
    });

    it("選手データがシリアライズされる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      const player = Player.create({
        name: "選手A",
        number: 7,
        teamId: team.id,
        position: "fw",
        nationality: "Japan",
      });
      team.addPlayer(player);

      const record = repo.testMapToPersistence(team);

      expect(record.players).toHaveLength(1);
      expect(record.players![0].name).toBe("選手A");
      expect(record.players![0].number).toBe(7);
      expect(record.players![0].position).toBe("fw");
      expect(record.players![0].nationality).toBe("Japan");
    });

    it("selectedSquadがシリアライズされる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      team.updateSelectedSquad(["p1", "p2", "p3"]);

      const record = repo.testMapToPersistence(team);

      expect(record.selectedSquad).toEqual(["p1", "p2", "p3"]);
    });

    it("selectedSquadが未設定の場合はundefined", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });

      const record = repo.testMapToPersistence(team);

      expect(record.selectedSquad).toBeUndefined();
    });

    it("playerCardsがシリアライズされる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      team.updatePlayerCards({ 0: "yellow", 5: "red" });

      const record = repo.testMapToPersistence(team);

      expect(record.playerCards).toEqual({ 0: "yellow", 5: "red" });
    });

    it("playerCardsが未設定の場合はundefined", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });

      const record = repo.testMapToPersistence(team);

      expect(record.playerCards).toBeUndefined();
    });

    it("選手のオプショナルフィールドがすべてシリアライズされる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      const player = Player.create({
        name: "選手B",
        number: 11,
        teamId: team.id,
        position: "gk",
        nationality: "Brazil",
        club: "FC Sample",
        leagueCountry: "Brazil",
        imageUrl: "https://example.com/img.jpg",
        mainVisualImageUrl: "https://example.com/main.jpg",
        note: "テストメモ",
        status: "suspended",
      });
      team.addPlayer(player);

      const record = repo.testMapToPersistence(team);
      const p = record.players![0];

      expect(p.nationality).toBe("Brazil");
      expect(p.club).toBe("FC Sample");
      expect(p.leagueCountry).toBe("Brazil");
      expect(p.imageUrl).toBe("https://example.com/img.jpg");
      expect(p.mainVisualImageUrl).toBe("https://example.com/main.jpg");
      expect((p as Record<string, unknown>).note).toBe("テストメモ");
      expect((p as Record<string, unknown>).status).toBe("suspended");
    });

    it("managerCardがシリアライズされる", () => {
      const team = Team.create({
        name: "チーム",
        subtitle: "",
        colors: { gk: "#fff", main: "#fff" },
        availableFormations: ["4-4-2"],
        flagType: "",
        headerGradient: "",
      });
      team.updateManagerCard("red");

      const record = repo.testMapToPersistence(team);

      expect(record.managerCard).toBe("red");
    });
  });

  describe("ラウンドトリップ（mapToPersistence -> mapToDomain）", () => {
    it("変換して戻しても値が保持される", () => {
      const original = Team.create({
        name: "ラウンドトリップ",
        subtitle: "テスト",
        colors: { gk: "#111111", main: "#222222" },
        availableFormations: ["4-4-2", "3-5-2"],
        flagType: "flag-br",
        headerGradient: "from-green-500 to-yellow-500",
        country: "Brazil",
        defaultFormation: "3-5-2",
        manager: "監督B",
      });
      const player = Player.create({
        name: "選手B",
        number: 11,
        teamId: original.id,
        position: "gk",
        nationality: "Brazil",
        club: "FC Sample",
        leagueCountry: "Brazil",
      });
      original.addPlayer(player);

      const record = repo.testMapToPersistence(original);
      const restored = repo.testMapToDomain(record);

      expect(restored.id.value).toBe(original.id.value);
      expect(restored.name).toBe(original.name);
      expect(restored.subtitle).toBe(original.subtitle);
      expect(restored.colors.gk.toHex()).toBe("#111111");
      expect(restored.colors.main.toHex()).toBe("#222222");
      expect(restored.availableFormations).toEqual(
        original.availableFormations,
      );
      expect(restored.country).toBe("Brazil");
      expect(restored.defaultFormation).toBe("3-5-2");
      expect(restored.manager).toBe("監督B");

      expect(restored.players).toHaveLength(1);
      expect(restored.players[0].name).toBe("選手B");
      expect(restored.players[0].number).toBe(11);
      expect(restored.players[0].position).toBe("gk");
      expect(restored.players[0].nationality).toBe("Brazil");
      expect(restored.players[0].club).toBe("FC Sample");
    });
  });

  // ────────────────────────────────────────────
  // CRUD テスト
  // ────────────────────────────────────────────
  describe("findAll", () => {
    it("全チームを取得してTeamエンティティの配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([sampleRecord]);

      const results = await repo.findAll();

      expect(mockDB.getAll).toHaveBeenCalledWith("teams");
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Team);
      expect(results[0].id.value).toBe("team-1");
    });

    it("レコードがない場合は空配列を返す", async () => {
      mockDB.getAll.mockResolvedValue([]);

      const results = await repo.findAll();

      expect(results).toEqual([]);
    });
  });

  describe("findById", () => {
    it("TeamIdに一致するチームを返す", async () => {
      mockDB.get.mockResolvedValue(sampleRecord);
      const teamId = new TeamId("team-1");

      const result = await repo.findById(teamId);

      expect(mockDB.get).toHaveBeenCalledWith("teams", "team-1");
      expect(result).toBeInstanceOf(Team);
      expect(result!.id.value).toBe("team-1");
      expect(result!.name).toBe("テストチーム");
    });

    it("存在しないIDの場合はnullを返す", async () => {
      mockDB.get.mockResolvedValue(undefined);
      const teamId = new TeamId("non-existent");

      const result = await repo.findById(teamId);

      expect(mockDB.get).toHaveBeenCalledWith("teams", "non-existent");
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("Teamエンティティを永続化する", async () => {
      mockDB.put.mockResolvedValue(undefined);
      const team = repo.testMapToDomain(sampleRecord);

      await repo.save(team);

      expect(mockDB.put).toHaveBeenCalledWith(
        "teams",
        expect.objectContaining({
          id: "team-1",
          name: "テストチーム",
        }),
      );
    });
  });

  describe("delete", () => {
    it("TeamIdを指定してチームを削除する", async () => {
      mockDB.delete.mockResolvedValue(undefined);
      const teamId = new TeamId("team-1");

      await repo.delete(teamId);

      expect(mockDB.delete).toHaveBeenCalledWith("teams", "team-1");
    });
  });
});
