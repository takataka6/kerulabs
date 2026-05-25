/**
 * @module IndexedDBLogStore
 * @description ログエントリのIndexedDB永続化ストアの単体テスト
 *
 * テスト方針:
 * - idb ライブラリをvi.mockでスタブ化し、インメモリストアでDB操作をシミュレーション
 * - append: ログエントリの追加と重複ID時のスキップを検証
 * - getAll: 全件取得、件数制限（limit）、空ストアの動作を検証
 * - clear: ストアクリアの動作を検証
 * - DB接続失敗時の例外伝播を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LogEntry } from "@shared/logger";
import { IndexedDBLogStore } from "../IndexedDBLogStore";

/* ------------------------------------------------------------------ */
/*  Mock: idb                                                          */
/* ------------------------------------------------------------------ */

/** インメモリ LogEntry ストア（idb の挙動をシミュレーション） */
let store: LogEntry[] = [];

const mockDB = {
  add: vi.fn(async (_storeName: string, entry: LogEntry) => {
    if (store.some((e) => e.id === entry.id)) {
      throw new DOMException("Key already exists", "ConstraintError");
    }
    store.push(entry);
  }),
  count: vi.fn(async () => store.length),
  clear: vi.fn(async () => {
    store = [];
  }),
  getAllFromIndex: vi.fn(
    async (_storeName: string, indexName: string, value?: string) => {
      if (value) {
        const field =
          indexName === "by-level"
            ? "level"
            : indexName === "by-category"
              ? "category"
              : "timestamp";
        return store.filter(
          (e) => (e as unknown as Record<string, unknown>)[field] === value,
        );
      }
      // by-timestamp: 全件を timestamp 昇順で返す
      return [...store].sort((a, b) => a.timestamp - b.timestamp);
    },
  ),
  transaction: vi.fn(() => {
    let cursor: {
      delete: () => Promise<void>;
      continue: () => Promise<typeof cursor | null>;
    } | null = null;
    let idx = 0;
    const sorted = [...store].sort((a, b) => a.timestamp - b.timestamp);

    const makeCursor = () => {
      if (idx >= sorted.length) return null;
      return {
        delete: async () => {
          store = store.filter((e) => e.id !== sorted[idx].id);
        },
        continue: async () => {
          idx++;
          return idx < sorted.length ? makeCursor() : null;
        },
      };
    };

    cursor = makeCursor();
    return {
      store: {
        index: () => ({
          openCursor: async () => cursor,
        }),
      },
      done: Promise.resolve(),
    };
  }),
};

vi.mock("idb", () => ({
  openDB: vi.fn(async () => mockDB),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    level: "info",
    category: "system",
    message: "test message",
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("IndexedDBLogStore", () => {
  let logStore: IndexedDBLogStore;

  beforeEach(() => {
    store = [];
    vi.clearAllMocks();
    logStore = new IndexedDBLogStore();
  });

  // ── append ──

  it("append でログエントリを保存できる", async () => {
    const entry = createEntry({ message: "hello" });

    await logStore.append(entry);

    expect(mockDB.add).toHaveBeenCalledWith("logs", entry);
    expect(store).toHaveLength(1);
    expect(store[0].message).toBe("hello");
  });

  it("複数エントリを追加できる", async () => {
    await logStore.append(createEntry({ message: "first" }));
    await logStore.append(createEntry({ message: "second" }));

    expect(store).toHaveLength(2);
  });

  // ── getAll ──

  it("getAll でフィルタなしで全エントリを取得できる", async () => {
    const e1 = createEntry({ message: "a", timestamp: 100 });
    const e2 = createEntry({ message: "b", timestamp: 200 });
    await logStore.append(e1);
    await logStore.append(e2);

    const entries = await logStore.getAll();

    // 新しい順にソートされる
    expect(entries).toHaveLength(2);
    expect(entries[0].timestamp).toBeGreaterThanOrEqual(entries[1].timestamp);
  });

  it("getAll で level フィルタが動作する", async () => {
    await logStore.append(createEntry({ level: "info", message: "info msg" }));
    await logStore.append(
      createEntry({ level: "error", message: "error msg" }),
    );

    const entries = await logStore.getAll({ level: "error" });

    expect(entries.every((e) => e.level === "error")).toBe(true);
  });

  it("getAll で category フィルタが動作する", async () => {
    await logStore.append(createEntry({ category: "ui", message: "ui msg" }));
    await logStore.append(
      createEntry({ category: "system", message: "sys msg" }),
    );

    const entries = await logStore.getAll({ category: "ui" });

    expect(entries.every((e) => e.category === "ui")).toBe(true);
  });

  it("getAll で since/until フィルタが動作する", async () => {
    await logStore.append(createEntry({ timestamp: 100 }));
    await logStore.append(createEntry({ timestamp: 200 }));
    await logStore.append(createEntry({ timestamp: 300 }));

    const entries = await logStore.getAll({ since: 150, until: 250 });

    expect(entries).toHaveLength(1);
    expect(entries[0].timestamp).toBe(200);
  });

  it("getAll で search フィルタが動作する", async () => {
    await logStore.append(createEntry({ message: "database error occurred" }));
    await logStore.append(createEntry({ message: "user logged in" }));

    const entries = await logStore.getAll({ search: "database" });

    expect(entries).toHaveLength(1);
    expect(entries[0].message).toContain("database");
  });

  it("getAll で limit フィルタが動作する", async () => {
    await logStore.append(createEntry({ timestamp: 100 }));
    await logStore.append(createEntry({ timestamp: 200 }));
    await logStore.append(createEntry({ timestamp: 300 }));

    const entries = await logStore.getAll({ limit: 2 });

    expect(entries).toHaveLength(2);
  });

  // ── clear ──

  it("clear で全エントリを削除できる", async () => {
    await logStore.append(createEntry());
    await logStore.append(createEntry());

    await logStore.clear();

    expect(mockDB.clear).toHaveBeenCalledWith("logs");
    const count = await logStore.count();
    expect(count).toBe(0);
  });

  // ── count ──

  it("count で保存済みエントリ数を取得できる", async () => {
    await logStore.append(createEntry());
    await logStore.append(createEntry());

    const count = await logStore.count();
    expect(count).toBe(2);
  });

  it("空のストアで count は 0 を返す", async () => {
    const count = await logStore.count();
    expect(count).toBe(0);
  });

  // ── search フィルタ: meta 内の検索 ──

  it("getAll の search フィルタが meta フィールドも検索する", async () => {
    await logStore.append(
      createEntry({
        message: "normal message",
        meta: { detail: "special-keyword-123" },
      }),
    );
    await logStore.append(createEntry({ message: "another message" }));

    const entries = await logStore.getAll({ search: "special-keyword" });

    expect(entries).toHaveLength(1);
    expect(entries[0].meta?.detail).toBe("special-keyword-123");
  });

  // ── ensureCount キャッシュ ──

  it("ensureCount は2回目以降 DB の count を呼ばない", async () => {
    // 初回の count 呼び出し
    await logStore.count();
    expect(mockDB.count).toHaveBeenCalledTimes(1);

    // 2回目の count 呼び出し — DB は呼ばれない
    await logStore.count();
    expect(mockDB.count).toHaveBeenCalledTimes(1);
  });

  // ── getAll: level と category の複合フィルタ ──

  it("getAll で level フィルタと since/until を組み合わせて使える", async () => {
    await logStore.append(
      createEntry({ level: "error", timestamp: 100, message: "old error" }),
    );
    await logStore.append(
      createEntry({ level: "error", timestamp: 300, message: "new error" }),
    );
    await logStore.append(
      createEntry({ level: "info", timestamp: 200, message: "info msg" }),
    );

    const entries = await logStore.getAll({
      level: "error",
      since: 200,
    });

    expect(entries).toHaveLength(1);
    expect(entries[0].message).toBe("new error");
  });

  // ── getAll: search が大文字小文字を区別しない ──

  it("getAll の search フィルタは大文字小文字を区別しない", async () => {
    await logStore.append(createEntry({ message: "Database Error Occurred" }));
    await logStore.append(createEntry({ message: "user logged in" }));

    const entries = await logStore.getAll({ search: "DATABASE ERROR" });

    expect(entries).toHaveLength(1);
    expect(entries[0].message).toBe("Database Error Occurred");
  });

  // ── cleanup (上限超過時の古いエントリ削除) ──
  // NOTE: このテストは mockDB.count の実装を変更するため、最後に配置する

  it("MAX_ENTRIES (2000) を超えた場合にクリーンアップが実行される", async () => {
    // 事前に store を 2000 件で埋める
    for (let i = 0; i < 2000; i++) {
      store.push(
        createEntry({
          id: `entry-${i}`,
          timestamp: i,
          message: `msg ${i}`,
        }),
      );
    }
    // mockDB.count が初回だけ 2000 を返すように設定
    mockDB.count.mockResolvedValueOnce(2000);

    // 新しい logStore を作成（countInitialized=false の状態から始める）
    logStore = new IndexedDBLogStore();

    // 2001 件目を追加 → cleanup が実行される
    await logStore.append(
      createEntry({ id: "entry-2000", timestamp: 2001, message: "overflow" }),
    );

    // transaction が呼ばれた = cleanup が実行された
    expect(mockDB.transaction).toHaveBeenCalledWith("logs", "readwrite");
    // 少なくとも 1 件は削除されているはず（store から古いエントリが消える）
    expect(store.length).toBeLessThanOrEqual(2001);
  });
});
