/**
 * @module IndexedDBLogStore
 * @description IndexedDBを使ったログ永続化ストア。ログ専用DBにエントリを保存し、レベル・カテゴリ・タイムスタンプによるフィルタリングと自動クリーンアップ機能を提供する。
 */
import { openDB, IDBPDatabase, DBSchema } from "idb";
import type { LogEntry, LogFilter, LogStore } from "@shared/logger";

/* ------------------------------------------------------------------ */
/*  IndexedDB Schema — ログ専用 DB（既存データに影響なし）                  */
/* ------------------------------------------------------------------ */

interface LogsDB extends DBSchema {
  logs: {
    key: string;
    value: LogEntry;
    indexes: {
      "by-timestamp": number;
      "by-level": string;
      "by-category": string;
    };
  };
}

const LOG_DB_NAME = "kerulabs_logs";
const LOG_DB_VERSION = 1;
const MAX_ENTRIES = 2_000;

/* ------------------------------------------------------------------ */
/*  IndexedDBLogStore                                                  */
/* ------------------------------------------------------------------ */

export class IndexedDBLogStore implements LogStore {
  private db: IDBPDatabase<LogsDB> | null = null;
  private entryCount = 0;
  private countInitialized = false;

  private async getDB(): Promise<IDBPDatabase<LogsDB>> {
    if (this.db) return this.db;

    this.db = await openDB<LogsDB>(LOG_DB_NAME, LOG_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("logs")) {
          const store = db.createObjectStore("logs", { keyPath: "id" });
          store.createIndex("by-timestamp", "timestamp");
          store.createIndex("by-level", "level");
          store.createIndex("by-category", "category");
        }
      },
    });

    return this.db;
  }

  /** メモリ内カウンタを初期化（初回のみ DB から取得） */
  private async ensureCount(): Promise<void> {
    if (this.countInitialized) return;
    const db = await this.getDB();
    this.entryCount = await db.count("logs");
    this.countInitialized = true;
  }

  async append(entry: LogEntry): Promise<void> {
    const db = await this.getDB();
    await this.ensureCount();

    await db.add("logs", entry);
    this.entryCount++;

    // 上限超過時にクリーンアップ
    if (this.entryCount > MAX_ENTRIES) {
      await this.cleanup(db);
    }
  }

  async getAll(filter?: LogFilter): Promise<LogEntry[]> {
    const db = await this.getDB();
    let entries: LogEntry[];

    if (filter?.level) {
      entries = await db.getAllFromIndex("logs", "by-level", filter.level);
    } else if (filter?.category) {
      entries = await db.getAllFromIndex(
        "logs",
        "by-category",
        filter.category,
      );
    } else {
      entries = await db.getAllFromIndex("logs", "by-timestamp");
    }

    // timestamp インデックスを使って取得した場合でも、フィルタ適用
    if (filter) {
      entries = entries.filter((e) => {
        if (filter.level && e.level !== filter.level) return false;
        if (filter.category && e.category !== filter.category) return false;
        if (filter.since && e.timestamp < filter.since) return false;
        if (filter.until && e.timestamp > filter.until) return false;
        if (filter.search) {
          const q = filter.search.toLowerCase();
          return (
            e.message.toLowerCase().includes(q) ||
            JSON.stringify(e.meta ?? {})
              .toLowerCase()
              .includes(q)
          );
        }
        return true;
      });
    }

    // 新しい順にソート
    entries.sort((a, b) => b.timestamp - a.timestamp);

    if (filter?.limit) {
      entries = entries.slice(0, filter.limit);
    }

    return entries;
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await db.clear("logs");
    this.entryCount = 0;
  }

  async count(): Promise<number> {
    await this.ensureCount();
    return this.entryCount;
  }

  /** 古いエントリを削除して MAX_ENTRIES 以内に収める */
  private async cleanup(db: IDBPDatabase<LogsDB>): Promise<void> {
    const deleteCount = this.entryCount - MAX_ENTRIES;
    if (deleteCount <= 0) return;

    // 古い順に取得して削除
    const tx = db.transaction("logs", "readwrite");
    const index = tx.store.index("by-timestamp");
    let cursor = await index.openCursor();
    let deleted = 0;

    while (cursor && deleted < deleteCount) {
      await cursor.delete();
      deleted++;
      cursor = await cursor.continue();
    }

    await tx.done;
    this.entryCount -= deleted;
  }
}
