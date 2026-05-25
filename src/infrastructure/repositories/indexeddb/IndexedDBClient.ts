/**
 * @module IndexedDBClient
 * @description IndexedDB接続をシングルトンで管理するクライアント。データベースのオープン、マイグレーション実行、全ストアのエクスポート・インポート機能を提供する。
 */
import { openDB, IDBPDatabase } from "idb";
import { z } from "zod";
import { runMigrations, LATEST_VERSION } from "./migrations";
import type { TacticsDB } from "./schema";
import {
  teamRecordSchema,
  formationRecordSchema,
  tacticRecordSchema,
  glossaryRecordSchema,
  teamManualRecordSchema,
  pluginRecordSchema,
} from "@infrastructure/schemas";

export type { TacticsDB } from "./schema";

/** importAll で汎用ストア操作に使うための全ストア値の共用型 */
type AnyStoreValue = TacticsDB[keyof TacticsDB]["value"];

/** ストア名ごとの Zod スキーマ（バリデーション対象のみ） */
const storeSchemas: Partial<Record<string, z.ZodType<AnyStoreValue>>> = {
  teams: teamRecordSchema as z.ZodType<AnyStoreValue>,
  formations: formationRecordSchema as z.ZodType<AnyStoreValue>,
  tactics: tacticRecordSchema as z.ZodType<AnyStoreValue>,
  glossaries: glossaryRecordSchema as z.ZodType<AnyStoreValue>,
  teamManuals: teamManualRecordSchema as z.ZodType<AnyStoreValue>,
  plugins: pluginRecordSchema as z.ZodType<AnyStoreValue>,
};

const DB_NAME = "tactics_simulator_db";
const DB_VERSION = LATEST_VERSION;

export class IndexedDBClient {
  private static instance: IndexedDBClient;
  private db: IDBPDatabase<TacticsDB> | null = null;

  private constructor() {}

  static getInstance(): IndexedDBClient {
    if (!IndexedDBClient.instance) {
      IndexedDBClient.instance = new IndexedDBClient();
    }
    return IndexedDBClient.instance;
  }

  /** @internal テスト専用: シングルトンインスタンスをリセットする */
  static resetForTesting(): void {
    IndexedDBClient.instance = undefined as unknown as IndexedDBClient;
  }

  async getDB(): Promise<IDBPDatabase<TacticsDB>> {
    if (this.db) {
      return this.db;
    }

    this.db = await openDB<TacticsDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, tx) {
        runMigrations(db, oldVersion, newVersion ?? DB_VERSION, tx);
      },
    });

    return this.db;
  }

  /** 全ストアのデータをエクスポート */
  async exportAll(): Promise<Record<string, unknown[]>> {
    const db = await this.getDB();
    const storeNames = [
      "teams",
      "players",
      "formations",
      "tactics",
      "preferences",
      "sketches",
      "glossaries",
      "teamManuals",
      "plugins",
    ] as const;
    const result: Record<string, unknown[]> = {};
    for (const name of storeNames) {
      result[name] = await db.getAll(name);
    }
    return result;
  }

  /** 全ストアをクリアしてデータをインポート（単一トランザクションでアトミック実行） */
  async importAll(data: Record<string, unknown[]>): Promise<void> {
    const db = await this.getDB();
    const storeNames = [
      "teams",
      "players",
      "formations",
      "tactics",
      "preferences",
      "sketches",
      "glossaries",
      "teamManuals",
      "plugins",
    ] as const;

    // インポート前にバリデーション（トランザクション外で実行し、不正データを事前に拒否）
    const validated: Record<string, AnyStoreValue[]> = {};
    for (const name of storeNames) {
      const records = data[name] ?? [];
      const schema = storeSchemas[name];
      validated[name] = records.map((record, i) => {
        if (schema) {
          const result = schema.safeParse(record);
          if (!result.success) {
            throw new Error(
              `Invalid ${name}[${i}]: ${result.error.issues.map((e) => e.message).join(", ")}`,
            );
          }
          return result.data;
        }
        return record as AnyStoreValue;
      });
    }

    // 全ストアを1つのトランザクションで処理（アトミック: 全成功 or 全ロールバック）
    const tx = db.transaction([...storeNames], "readwrite");
    for (const name of storeNames) {
      const store = tx.objectStore(name);
      await store.clear();
      for (const record of validated[name]) {
        await store.put(record);
      }
    }
    await tx.done;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
