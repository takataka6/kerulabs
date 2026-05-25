/**
 * @module IndexedDBLogStore.test
 * @description IndexedDBを使ったログ永続化ストアの単体テスト。
 * idb モジュールの openDB をモックし、append / getAll / clear / count /
 * 自動クリーンアップの各動作を検証する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LogEntry } from "@shared/logger";

/* ------------------------------------------------------------------ */
/*  Mock DB (vi.hoisted で vi.mock より先に初期化)                       */
/* ------------------------------------------------------------------ */

const { mockDB, mockCursor, mockIndex } = vi.hoisted(() => {
  const mockCursor = {
    delete: vi.fn(),
    continue: vi.fn(),
  };

  const mockIndex = {
    openCursor: vi.fn(),
  };

  const mockTxStore = {
    index: vi.fn().mockReturnValue(mockIndex),
  };

  const mockTx = {
    store: mockTxStore,
    done: Promise.resolve(),
  };

  const mockDB = {
    add: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
    clear: vi.fn(),
    getAll: vi.fn(),
    getAllFromIndex: vi.fn(),
    transaction: vi.fn().mockReturnValue(mockTx),
    objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
  };

  return { mockDB, mockCursor, mockIndex, mockTxStore, mockTx };
});

vi.mock("idb", () => ({
  openDB: vi.fn().mockResolvedValue(mockDB),
}));

import { IndexedDBLogStore } from "../../logging/IndexedDBLogStore";

/* ------------------------------------------------------------------ */
/*  テストデータ                                                        */
/* ------------------------------------------------------------------ */

const createEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: `log-${Math.random().toString(36).slice(2)}`,
  timestamp: Date.now(),
  level: "info",
  category: "system",
  message: "テストメッセージ",
  ...overrides,
});

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("IndexedDBLogStore", () => {
  let store: IndexedDBLogStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDB.count.mockResolvedValue(0);
    mockDB.getAllFromIndex.mockResolvedValue([]);
    store = new IndexedDBLogStore();
  });

  /* ---- append ---------------------------------------------------- */

  it("append でエントリを追加できる", async () => {
    const entry = createEntry();

    await store.append(entry);

    expect(mockDB.add).toHaveBeenCalledWith("logs", entry);
  });

  /* ---- getAll ---------------------------------------------------- */

  it("getAll でフィルタなしの全件取得", async () => {
    const entries = [createEntry(), createEntry()];
    mockDB.getAllFromIndex.mockResolvedValue(entries);

    const result = await store.getAll();

    expect(mockDB.getAllFromIndex).toHaveBeenCalledWith("logs", "by-timestamp");
    expect(result).toHaveLength(2);
  });

  it("getAll でレベルフィルタ", async () => {
    const entry = createEntry({ level: "error" });
    mockDB.getAllFromIndex.mockResolvedValue([entry]);

    const result = await store.getAll({ level: "error" });

    expect(mockDB.getAllFromIndex).toHaveBeenCalledWith(
      "logs",
      "by-level",
      "error",
    );
    expect(result).toHaveLength(1);
    expect(result[0].level).toBe("error");
  });

  it("getAll でカテゴリフィルタ", async () => {
    const entry = createEntry({ category: "database" });
    mockDB.getAllFromIndex.mockResolvedValue([entry]);

    const result = await store.getAll({ category: "database" });

    expect(mockDB.getAllFromIndex).toHaveBeenCalledWith(
      "logs",
      "by-category",
      "database",
    );
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("database");
  });

  it("getAll で検索フィルタ", async () => {
    const match = createEntry({ message: "接続エラーが発生しました" });
    const noMatch = createEntry({ message: "正常に処理されました" });
    mockDB.getAllFromIndex.mockResolvedValue([match, noMatch]);

    const result = await store.getAll({ search: "エラー" });

    expect(result).toHaveLength(1);
    expect(result[0].message).toContain("エラー");
  });

  it("getAll で検索フィルタが meta を含めて検索する", async () => {
    const entry = createEntry({
      message: "通常メッセージ",
      meta: { detail: "重要なエラー情報" },
    });
    mockDB.getAllFromIndex.mockResolvedValue([entry]);

    const result = await store.getAll({ search: "重要" });

    expect(result).toHaveLength(1);
  });

  it("getAll でタイムスタンプフィルタ (since/until)", async () => {
    const old = createEntry({ timestamp: 1000 });
    const recent = createEntry({ timestamp: 3000 });
    mockDB.getAllFromIndex.mockResolvedValue([old, recent]);

    const result = await store.getAll({ since: 2000, until: 4000 });

    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(3000);
  });

  it("getAll で limit", async () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      createEntry({ timestamp: i }),
    );
    mockDB.getAllFromIndex.mockResolvedValue(entries);

    const result = await store.getAll({ limit: 2 });

    expect(result).toHaveLength(2);
  });

  it("getAll の結果が新しい順にソートされる", async () => {
    const entries = [
      createEntry({ timestamp: 100 }),
      createEntry({ timestamp: 300 }),
      createEntry({ timestamp: 200 }),
    ];
    mockDB.getAllFromIndex.mockResolvedValue(entries);

    const result = await store.getAll();

    expect(result[0].timestamp).toBe(300);
    expect(result[1].timestamp).toBe(200);
    expect(result[2].timestamp).toBe(100);
  });

  /* ---- clear ----------------------------------------------------- */

  it("clear で全件削除", async () => {
    await store.clear();

    expect(mockDB.clear).toHaveBeenCalledWith("logs");
  });

  /* ---- count ----------------------------------------------------- */

  it("count でエントリ数を返す", async () => {
    mockDB.count.mockResolvedValue(42);

    const result = await store.count();

    expect(result).toBe(42);
  });

  /* ---- cleanup --------------------------------------------------- */

  it("MAX_ENTRIES 超過時にクリーンアップが実行される", async () => {
    // entryCount を MAX_ENTRIES (2000) に設定するため、count を 2000 に
    mockDB.count.mockResolvedValue(2000);

    // cursor のモック: 1回だけ削除して終了
    mockCursor.continue.mockResolvedValue(null);
    mockIndex.openCursor.mockResolvedValue(mockCursor);

    // append すると 2001 になり cleanup が発動
    const entry = createEntry();
    await store.append(entry);

    // transaction が呼ばれたことを確認
    expect(mockDB.transaction).toHaveBeenCalledWith("logs", "readwrite");
    expect(mockCursor.delete).toHaveBeenCalled();
  });

  it("MAX_ENTRIES 以下では クリーンアップが実行されない", async () => {
    mockDB.count.mockResolvedValue(10);

    await store.append(createEntry());

    expect(mockDB.transaction).not.toHaveBeenCalled();
  });
});
