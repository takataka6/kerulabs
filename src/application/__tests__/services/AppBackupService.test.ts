/**
 * @module AppBackupService
 * @description アプリケーションバックアップサービスの単体テスト
 *
 * テスト方針:
 * - IBackupService をモック化し、IndexedDBへのアクセスを分離
 * - export: v1フォーマットのJSON生成を検証
 * - import: JSONパース、Zodバリデーション、デフォルト補完、アトミック（ロールバック）を検証
 * - resetAll: 空データでのクリア動作を検証
 * - エッジケース: 不正JSON、スキーマ違反、ロールバック失敗
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IBackupService } from "@application/ports/output/services/IBackupService";
import { AppBackupService } from "../../services/AppBackupService";
import { ValidationError } from "@shared/errors/AppError";

// --- Mock IBackupService ---
function createMockBackupService(): IBackupService {
  return {
    exportAll: vi.fn(),
    importAll: vi.fn(),
  };
}

// --- Helpers ---
function createValidBackupJson(
  overrides?: Record<string, unknown>,
  indexedDBOverrides?: Record<string, unknown>,
) {
  return JSON.stringify({
    version: 1,
    exportedAt: "2025-01-01T00:00:00.000Z",
    indexedDB: {
      teams: [],
      players: [],
      formations: [],
      tactics: [],
      preferences: [{ key: "language", value: "ja" }],
      glossaries: [],
      sketches: [],
      ...indexedDBOverrides,
    },
    ...overrides,
  });
}

// --- Tests ---
describe("AppBackupService", () => {
  let mockBackup: IBackupService;
  let service: AppBackupService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBackup = createMockBackupService();
    service = new AppBackupService(mockBackup);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── export ──
  describe("export", () => {
    it("IndexedDB のデータを含む v1 JSON を返す", async () => {
      vi.mocked(mockBackup.exportAll).mockResolvedValue({
        teams: [{ id: "t1", name: "Test" }],
        players: [],
        preferences: [{ key: "language", value: "ja" }],
        glossaries: [],
      });

      const json = await service.export();
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe(1);
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.indexedDB.teams).toEqual([{ id: "t1", name: "Test" }]);
      expect(parsed.indexedDB.preferences).toEqual([
        { key: "language", value: "ja" },
      ]);
    });
  });

  // ── import ──
  describe("import", () => {
    it("バックアップ JSON から IndexedDB にデータを復元する", async () => {
      vi.mocked(mockBackup.exportAll).mockResolvedValue({});
      vi.mocked(mockBackup.importAll).mockResolvedValue(undefined);

      await service.import(createValidBackupJson());

      expect(mockBackup.importAll).toHaveBeenCalledWith({
        teams: [],
        players: [],
        formations: [],
        tactics: [],
        preferences: [{ key: "language", value: "ja" }],
        glossaries: [],
        sketches: [],
        teamManuals: [],
      });
    });

    it("存在しないストアは空配列としてデフォルト補完される", async () => {
      vi.mocked(mockBackup.exportAll).mockResolvedValue({});
      vi.mocked(mockBackup.importAll).mockResolvedValue(undefined);

      const json = JSON.stringify({
        version: 1,
        exportedAt: "2025-01-01T00:00:00.000Z",
        indexedDB: {
          teams: [],
        },
      });
      await service.import(json);

      // 省略されたストアもデフォルト空配列で補完
      const importedData = vi.mocked(mockBackup.importAll).mock.calls[0][0];
      expect(importedData).toEqual(
        expect.objectContaining({
          teams: [],
          players: [],
          formations: [],
          tactics: [],
          preferences: [],
          glossaries: [],
          sketches: [],
        }),
      );
    });

    // ── JSON パースエラー ──
    it("無効な JSON 文字列で ValidationError を投げる", async () => {
      await expect(service.import("not json")).rejects.toThrow(ValidationError);
      await expect(service.import("not json")).rejects.toThrow(
        "Invalid JSON format",
      );
    });

    // ── Zod 検証エラー ──
    it("version が欠落している場合に ValidationError を投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ version: undefined })),
      ).rejects.toThrow(ValidationError);
      await expect(
        service.import(createValidBackupJson({ version: undefined })),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("version が負数の場合に検証エラーを投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ version: -1 })),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("未対応の将来バージョンの場合に検証エラーを投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ version: 2 })),
      ).rejects.toThrow("Invalid backup file structure");
      expect(mockBackup.importAll).not.toHaveBeenCalled();
    });

    it("version が小数の場合に検証エラーを投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ version: 1.5 })),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("version が文字列の場合に検証エラーを投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ version: "1" })),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("indexedDB が欠落している場合に検証エラーを投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ indexedDB: undefined })),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("indexedDB が文字列の場合に検証エラーを投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ indexedDB: "not-object" })),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("exportedAt が日時文字列でない場合に検証エラーを投げる", async () => {
      await expect(
        service.import(createValidBackupJson({ exportedAt: "2025/01/01" })),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("teams の中身が不正な場合に検証エラーを投げる", async () => {
      await expect(
        service.import(
          createValidBackupJson(undefined, {
            teams: [{ bad: "data" }],
          }),
        ),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("formations の positions が不正な場合に検証エラーを投げる", async () => {
      await expect(
        service.import(
          createValidBackupJson(undefined, {
            formations: [
              {
                id: "f1",
                name: "4-3-3",
                type: "standard",
                positions: [{ pos: "GK", x: 0 }], // z が欠落
                roleMap: {},
                isCustom: false,
                createdAt: 0,
                updatedAt: 0,
              },
            ],
          }),
        ),
      ).rejects.toThrow("Invalid backup file structure");
    });

    it("検証エラーに最大5件の issue 詳細が含まれる", async () => {
      try {
        await service.import(
          JSON.stringify({
            version: "bad",
            exportedAt: 123,
            indexedDB: "not-object",
          }),
        );
        expect.fail("Should have thrown");
      } catch (e) {
        const msg = (e as Error).message;
        expect(msg).toContain("Invalid backup file structure:");
        // パスと説明が含まれる
        expect(msg).toContain("version");
      }
    });

    // ── アトミック: ロールバック ──
    it("importAll が失敗した場合、元のデータにロールバックする", async () => {
      const snapshot = { teams: [{ id: "t1" }], players: [] };
      vi.mocked(mockBackup.exportAll).mockResolvedValue(snapshot);
      vi.mocked(mockBackup.importAll)
        .mockRejectedValueOnce(new Error("DB write failed"))
        .mockResolvedValueOnce(undefined); // ロールバック成功

      await expect(service.import(createValidBackupJson())).rejects.toThrow(
        "DB write failed",
      );

      // 2回目の呼び出しが元のスナップショットでロールバック
      expect(mockBackup.importAll).toHaveBeenCalledTimes(2);
      expect(mockBackup.importAll).toHaveBeenNthCalledWith(2, snapshot);
    });

    it("importAll 失敗後のロールバックも失敗した場合、元のエラーを投げる", async () => {
      vi.mocked(mockBackup.exportAll).mockResolvedValue({});
      vi.mocked(mockBackup.importAll)
        .mockRejectedValueOnce(new Error("DB write failed"))
        .mockRejectedValueOnce(new Error("Rollback failed"));

      await expect(service.import(createValidBackupJson())).rejects.toThrow(
        "DB write failed",
      );
    });

    it("インポート前にスナップショットを取得する", async () => {
      vi.mocked(mockBackup.exportAll).mockResolvedValue({});
      vi.mocked(mockBackup.importAll).mockResolvedValue(undefined);

      await service.import(createValidBackupJson());

      // exportAll がインポート前に呼ばれている
      expect(mockBackup.exportAll).toHaveBeenCalledTimes(1);
      expect(mockBackup.exportAll).toHaveBeenCalledBefore(
        vi.mocked(mockBackup.importAll),
      );
    });
  });

  describe("previewImport", () => {
    it("DB を変更せずにストア別件数を返す", () => {
      const preview = service.previewImport(
        createValidBackupJson(undefined, {
          teams: [
            {
              id: "team-1",
              name: "Team",
              subtitle: "Sub",
              colors: { gk: "#fff", main: "#000" },
              availableFormations: ["4-3-3"],
              flagType: "flag",
              headerGradient: "gradient",
              createdAt: 1,
              updatedAt: 1,
            },
          ],
          preferences: [{ key: "language", value: "ja" }],
        }),
      );

      expect(preview).toEqual({
        version: 1,
        exportedAt: "2025-01-01T00:00:00.000Z",
        storeCounts: {
          teams: 1,
          players: 0,
          formations: 0,
          tactics: 0,
          preferences: 1,
          sketches: 0,
          glossaries: 0,
          teamManuals: 0,
        },
        totalRecords: 2,
      });
      expect(mockBackup.exportAll).not.toHaveBeenCalled();
      expect(mockBackup.importAll).not.toHaveBeenCalled();
    });

    it("不正なバックアップは ValidationError を投げる", () => {
      expect(() => service.previewImport("not json")).toThrow(ValidationError);
    });
  });

  // ── resetAll ──
  describe("resetAll", () => {
    it("IndexedDB を空データでクリアする", async () => {
      vi.mocked(mockBackup.importAll).mockResolvedValue(undefined);

      await service.resetAll();

      expect(mockBackup.importAll).toHaveBeenCalledWith({});
    });
  });
});
