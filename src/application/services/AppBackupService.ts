/**
 * @module AppBackupService
 * @description アプリ全体のバックアップ・リストアサービス。IndexedDBデータのJSON形式でのエクスポート・インポートとアトミックなロールバックを提供する
 */

import { ZodError } from "zod";
import type { IBackupService } from "@application/ports/output/services/IBackupService";
import { appBackupSchema } from "@application/schemas";
import type { AppBackupData } from "@application/schemas";
import { handleError } from "@shared/errors/handleError";
import { DatabaseError, ValidationError } from "@shared/errors/AppError";

// ── バックアップデータ構造 ──────────────────────────────
const BACKUP_VERSION = 1;

export interface BackupImportPreview {
  version: number;
  exportedAt: string;
  storeCounts: Record<string, number>;
  totalRecords: number;
}

// ── AppBackupService ──────────────────────────────────────
export class AppBackupService {
  constructor(private readonly backupService: IBackupService) {}

  /** アプリ全体のデータを JSON 文字列としてエクスポート（IndexedDB のみ） */
  async export(): Promise<string> {
    const indexedDBData = await this.backupService.exportAll();

    const backup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      indexedDB: indexedDBData,
    };

    return JSON.stringify(backup);
  }

  /** JSON 文字列からアプリ全体のデータをインポート（既存データは上書き） */
  async import(json: string): Promise<void> {
    const backup = this.parseBackup(json);

    // 3. アトミックインポート（成功するか全ロールバックか）
    const snapshot = await this.backupService.exportAll();
    try {
      await this.backupService.importAll(
        backup.indexedDB as Record<string, unknown[]>,
      );
    } catch (importError) {
      // ロールバック: 元データの復元を試みる
      try {
        await this.backupService.importAll(snapshot);
      } catch (rollbackError) {
        // ロールバックも失敗: 両方のエラー情報を含む複合エラーをスロー
        handleError(rollbackError, "database", "Backup rollback failed", {
          meta: { originalError: importError },
        });
        throw new DatabaseError(
          `Import failed and rollback also failed. Original: ${importError instanceof Error ? importError.message : String(importError)}`,
          { cause: importError },
        );
      }
      throw importError;
    }
  }

  /** 全データを削除（IndexedDB 全ストアをクリア） */
  async resetAll(): Promise<void> {
    await this.backupService.importAll({});
  }

  /** インポート前にファイル互換性と件数を確認する。DB は変更しない。 */
  previewImport(json: string): BackupImportPreview {
    const backup = this.parseBackup(json);
    const storeCounts = Object.fromEntries(
      Object.entries(backup.indexedDB).map(([storeName, records]) => [
        storeName,
        records.length,
      ]),
    );
    const totalRecords = Object.values(storeCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      version: backup.version,
      exportedAt: backup.exportedAt,
      storeCounts,
      totalRecords,
    };
  }

  private parseBackup(json: string): AppBackupData {
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch (err) {
      throw new ValidationError("Invalid JSON format", { cause: err });
    }

    try {
      return appBackupSchema.parse(raw);
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.slice(0, 5).map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));
        const issues = details
          .map((d) => `  ${d.path || "(root)"}: ${d.message}`)
          .join("\n");
        throw new ValidationError(`Invalid backup file structure:\n${issues}`, {
          cause: err,
          details,
        });
      }
      throw new ValidationError("Invalid backup file structure", {
        cause: err,
      });
    }
  }
}
