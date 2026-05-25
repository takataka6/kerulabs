/**
 * @module appBackupSchema
 * @description appBackupSchema のバリデーション単体テスト
 *
 * テスト方針:
 * - 有効なバックアップデータの受け入れ検証
 * - version / exportedAt の型・制約検証
 * - indexedDB ペイロード内の各配列のデフォルト値検証
 * - 不正なデータ構造のバリデーション失敗検証
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { appBackupSchema } from "../../schemas/appBackupSchema";

/** テスト用の最小限の有効バックアップデータ */
function createValidBackup(
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    version: 1,
    exportedAt: "2024-01-01T00:00:00.000Z",
    indexedDB: {},
    ...overrides,
  };
}

describe("appBackupSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効なバックアップデータを受け付ける", () => {
    const validData = createValidBackup();

    const result = appBackupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("全フィールドが揃った有効なデータを受け付ける", () => {
    const now = Date.now();
    const fullData = {
      version: 1,
      exportedAt: "2024-06-15T12:00:00.000Z",
      indexedDB: {
        teams: [
          {
            id: "team-1",
            name: "チームA",
            subtitle: "サブタイトル",
            colors: { gk: "#FFD700", main: "#0000FF" },
            availableFormations: ["4-3-3"],
            flagType: "japan",
            headerGradient: "linear-gradient(135deg, #000 0%, #fff 100%)",
            createdAt: now,
            updatedAt: now,
          },
        ],
        players: [
          {
            id: "player-1",
            teamId: "team-1",
            name: "選手1",
            number: 10,
            createdAt: now,
            updatedAt: now,
          },
        ],
        formations: [],
        tactics: [],
        preferences: [],
        sketches: [],
        glossaries: [],
        teamManuals: [],
      },
    };

    const result = appBackupSchema.safeParse(fullData);
    expect(result.success).toBe(true);
  });

  describe("version フィールド", () => {
    it("正の整数を受け付ける", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ version: 1 }),
      );
      expect(result.success).toBe(true);
    });

    it("未対応バージョンでバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ version: 2 }),
      );
      expect(result.success).toBe(false);
    });

    it("0 でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ version: 0 }),
      );
      expect(result.success).toBe(false);
    });

    it("負の数でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ version: -1 }),
      );
      expect(result.success).toBe(false);
    });

    it("小数でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ version: 1.5 }),
      );
      expect(result.success).toBe(false);
    });

    it("文字列でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ version: "1" }),
      );
      expect(result.success).toBe(false);
    });

    it("欠如でバリデーション失敗", () => {
      const data = createValidBackup();
      delete data.version;
      const result = appBackupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("exportedAt フィールド", () => {
    it("ISO日時文字列を受け付ける", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ exportedAt: "2024-01-01T00:00:00.000Z" }),
      );
      expect(result.success).toBe(true);
    });

    it("日時でない文字列でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ exportedAt: "2024/01/01" }),
      );
      expect(result.success).toBe(false);
    });

    it("数値でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(
        createValidBackup({ exportedAt: 1704067200000 }),
      );
      expect(result.success).toBe(false);
    });

    it("欠如でバリデーション失敗", () => {
      const data = createValidBackup();
      delete data.exportedAt;
      const result = appBackupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("indexedDB ペイロード", () => {
    it("空オブジェクトの場合に各配列がデフォルト値で初期化される", () => {
      const data = createValidBackup({ indexedDB: {} });

      const result = appBackupSchema.parse(data);
      expect(result.indexedDB.teams).toEqual([]);
      expect(result.indexedDB.players).toEqual([]);
      expect(result.indexedDB.formations).toEqual([]);
      expect(result.indexedDB.tactics).toEqual([]);
      expect(result.indexedDB.preferences).toEqual([]);
      expect(result.indexedDB.sketches).toEqual([]);
      expect(result.indexedDB.glossaries).toEqual([]);
      expect(result.indexedDB.teamManuals).toEqual([]);
    });

    it("一部の配列のみ指定した場合に残りはデフォルト値になる", () => {
      const data = createValidBackup({
        indexedDB: {
          preferences: [{ key: "theme", value: "dark" }],
        },
      });

      const result = appBackupSchema.parse(data);
      expect(result.indexedDB.preferences).toHaveLength(1);
      expect(result.indexedDB.teams).toEqual([]);
      expect(result.indexedDB.players).toEqual([]);
    });

    it("indexedDB が欠如した場合にバリデーション失敗", () => {
      const data = createValidBackup();
      delete data.indexedDB;
      const result = appBackupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("不正なデータ構造", () => {
    it("null でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("文字列でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });

    it("配列でバリデーション失敗", () => {
      const result = appBackupSchema.safeParse([]);
      expect(result.success).toBe(false);
    });

    it("teams に不正なレコードが含まれるとバリデーション失敗", () => {
      const data = createValidBackup({
        indexedDB: {
          teams: [{ invalid: true }],
        },
      });

      const result = appBackupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
