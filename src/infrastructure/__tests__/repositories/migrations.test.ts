/**
 * @module migrations（DBマイグレーション）
 * @description IndexedDBのスキーママイグレーション処理の単体テスト
 *
 * テスト方針:
 * - IDBDatabase / IDBTransaction をモックオブジェクトで代用
 * - 新規インストール（0→1）での全ストア・インデックス作成を検証
 * - 同一バージョン時のスキップ、存在しないバージョンへのエラーを検証
 * - 0→LATEST_VERSION のフルマイグレーションが例外なく完了することを確認
 */
import { describe, it, expect, vi } from "vitest";
import {
  runMigrations,
  LATEST_VERSION,
} from "../../repositories/indexeddb/migrations";

/** createObjectStore のモック戻り値 */
function mockStore() {
  return { createIndex: vi.fn() };
}

/** テスト用のダミー db オブジェクト */
function createMockDB() {
  return {
    createObjectStore: vi.fn(() => mockStore()),
  };
}

/** テスト用のダミー transaction オブジェクト */
function createMockTx() {
  return {
    objectStore: vi.fn(() => mockStore()),
  };
}

describe("migrations", () => {
  describe("LATEST_VERSION", () => {
    it("1以上の整数を返す", () => {
      expect(LATEST_VERSION).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(LATEST_VERSION)).toBe(true);
    });
  });

  describe("runMigrations", () => {
    it("新規インストール（0→1）で全ストアが作成される", () => {
      const db = createMockDB();
      const tx = createMockTx();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runMigrations(db as any, 0, 1, tx as any);

      const storeNames = db.createObjectStore.mock.calls.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any[]) => c[0],
      );
      expect(storeNames).toEqual(
        expect.arrayContaining([
          "teams",
          "players",
          "formations",
          "tactics",
          "preferences",
          "sketches",
          "glossaries",
          "teamManuals",
        ]),
      );
      expect(storeNames).toHaveLength(8);
    });

    it("v2マイグレーション（1→2）でpluginsストアが作成される", () => {
      const db = createMockDB();
      const tx = createMockTx();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runMigrations(db as any, 1, 2, tx as any);

      const storeNames = db.createObjectStore.mock.calls.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any[]) => c[0],
      );
      expect(storeNames).toContain("plugins");
      expect(storeNames).toHaveLength(1);
    });

    it("teams ストアに by-name と by-created インデックスが作成される", () => {
      const teamStoreIndexes = vi.fn();
      const db = {
        createObjectStore: vi.fn((name: string) => {
          if (name === "teams") {
            return { createIndex: teamStoreIndexes };
          }
          return mockStore();
        }),
      };
      const tx = createMockTx();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runMigrations(db as any, 0, 1, tx as any);

      const indexNames = teamStoreIndexes.mock.calls.map((c) => c[0]);
      expect(indexNames).toContain("by-name");
      expect(indexNames).toContain("by-created");
    });

    it("同じバージョンへのマイグレーションは何もしない", () => {
      const db = createMockDB();
      const tx = createMockTx();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runMigrations(db as any, 1, 1, tx as any);

      expect(db.createObjectStore).not.toHaveBeenCalled();
    });

    it("存在しないバージョンへのマイグレーションはエラーになる", () => {
      const db = createMockDB();
      const tx = createMockTx();

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        runMigrations(db as any, 0, 999, tx as any),
      ).toThrow("Migration for version");
    });

    it("0→LATEST_VERSION のフルマイグレーションが成功する", () => {
      const db = createMockDB();
      const tx = createMockTx();

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        runMigrations(db as any, 0, LATEST_VERSION, tx as any),
      ).not.toThrow();
    });
  });
});
