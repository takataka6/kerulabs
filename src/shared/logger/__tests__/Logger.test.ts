/**
 * @module Logger クラス
 * @description ロガーの単体テスト
 *
 * テスト方針:
 * - インメモリ LogStore スタブで永続化層を置き換え
 * - 各ログレベル（debug/info/warn/error）の記録とminLevelフィルタを検証
 * - エラー即flush・Errorオブジェクトのシリアライズ・getEntriesフィルタを検証
 * - devモードのコンソール出力・dispose後のタイマー停止・exportJSONを検証
 * - store=null時のコンソール出力のみモードを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Logger } from "../Logger";
import type { LogEntry, LogFilter, LogStore } from "../types";

/* ------------------------------------------------------------------ */
/*  In-memory LogStore stub                                            */
/* ------------------------------------------------------------------ */

class InMemoryLogStore implements LogStore {
  entries: LogEntry[] = [];

  async append(entry: LogEntry): Promise<void> {
    this.entries.push(entry);
  }

  async getAll(filter?: LogFilter): Promise<LogEntry[]> {
    let result = [...this.entries];
    if (filter?.level) result = result.filter((e) => e.level === filter.level);
    if (filter?.category)
      result = result.filter((e) => e.category === filter.category);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((e) => e.message.toLowerCase().includes(q));
    }
    return result;
  }

  async clear(): Promise<void> {
    this.entries = [];
  }

  async count(): Promise<number> {
    return this.entries.length;
  }
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("Logger", () => {
  let store: InMemoryLogStore;
  let logger: Logger;

  beforeEach(() => {
    store = new InMemoryLogStore();
    logger = new Logger(store, { isDev: false });
  });

  it("error レベルのログは即座に flush される", async () => {
    logger.error("database", "DB connection failed", { host: "localhost" });
    // error は即 flush なので await 不要で store に入る
    await new Promise((r) => setTimeout(r, 10));
    expect(store.entries).toHaveLength(1);
    expect(store.entries[0].level).toBe("error");
    expect(store.entries[0].category).toBe("database");
    expect(store.entries[0].message).toBe("DB connection failed");
    expect(store.entries[0].meta).toEqual({ host: "localhost" });
  });

  it("各レベルのログが正しいレベルで記録される", async () => {
    logger.debug("system", "debug msg");
    logger.info("system", "info msg");
    logger.warn("ui", "warn msg");
    logger.error("domain", "error msg");

    // error は即 flush、他は手動 flush が必要
    const entries = await logger.getEntries();
    expect(entries).toHaveLength(4);

    const levels = entries.map((e) => e.level).sort();
    expect(levels).toEqual(["debug", "error", "info", "warn"]);
  });

  it("minLevel 以下のログはスキップされる", async () => {
    const warnLogger = new Logger(store, { minLevel: "warn", isDev: false });
    warnLogger.debug("system", "skipped");
    warnLogger.info("system", "skipped");
    warnLogger.warn("system", "kept");
    warnLogger.error("system", "kept");

    const entries = await warnLogger.getEntries();
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.level).sort()).toEqual(["error", "warn"]);
  });

  it("Error オブジェクトは name/message/stack に変換される", async () => {
    const err = new TypeError("test error");
    logger.error("system", "Something failed", { error: err });

    await new Promise((r) => setTimeout(r, 10));
    const meta = store.entries[0].meta as Record<string, unknown>;
    const serialized = meta.error as Record<string, unknown>;
    expect(serialized.name).toBe("TypeError");
    expect(serialized.message).toBe("test error");
    expect(typeof serialized.stack).toBe("string");
  });

  it("meta なしでもログが記録される", async () => {
    logger.error("ui", "No meta");
    await new Promise((r) => setTimeout(r, 10));
    expect(store.entries[0].meta).toBeUndefined();
  });

  it("getEntries でフィルタが効く", async () => {
    logger.error("database", "db error");
    logger.error("ui", "ui error");
    logger.warn("database", "db warning");

    const dbOnly = await logger.getEntries({ category: "database" });
    expect(dbOnly).toHaveLength(2);

    const errorOnly = await logger.getEntries({ level: "error" });
    expect(errorOnly).toHaveLength(2);
  });

  it("clear でエントリが全削除される", async () => {
    logger.error("system", "msg1");
    logger.error("system", "msg2");

    await logger.clear();
    const entries = await logger.getEntries();
    expect(entries).toHaveLength(0);
  });

  it("exportJSON が JSON 文字列を返す", async () => {
    logger.error("system", "test");

    const json = await logger.exportJSON();
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].message).toBe("test");
  });

  it("store が null の場合はコンソール出力のみ（エラーなし）", async () => {
    const consoleLogger = new Logger(null, { isDev: false });
    consoleLogger.error("system", "no store");

    const entries = await consoleLogger.getEntries();
    expect(entries).toHaveLength(0);
  });

  it("dev モードではコンソールに出力される", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const devLogger = new Logger(store, { isDev: true });
    devLogger.error("system", "dev error");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("dispose 後は flush タイマーが停止する", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    logger.dispose();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("LogEntry に id と timestamp が付与される", async () => {
    logger.error("system", "test");
    await new Promise((r) => setTimeout(r, 10));
    const entry = store.entries[0];
    expect(entry.id).toBeTruthy();
    expect(typeof entry.timestamp).toBe("number");
    expect(entry.timestamp).toBeGreaterThan(0);
  });

  it("dev モードで debug レベルは console.debug に出力される", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const devLogger = new Logger(store, { isDev: true });
    devLogger.debug("system", "debug msg");
    expect(spy).toHaveBeenCalledWith("[DEBUG][system]", "debug msg", "");
    spy.mockRestore();
  });

  it("dev モードで warn レベルは console.warn に出力される", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const devLogger = new Logger(store, { isDev: true });
    devLogger.warn("ui", "warn msg");
    expect(spy).toHaveBeenCalledWith("[WARN][ui]", "warn msg", "");
    spy.mockRestore();
  });

  it("dev モードで info レベルは console.info に出力される", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const devLogger = new Logger(store, { isDev: true });
    devLogger.info("system", "info msg");
    expect(spy).toHaveBeenCalledWith("[INFO][system]", "info msg", "");
    spy.mockRestore();
  });

  it("dev モードで meta 付きのログは meta も出力される", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const devLogger = new Logger(store, { isDev: true });
    devLogger.info("system", "info msg", { key: "value" });
    expect(spy).toHaveBeenCalledWith("[INFO][system]", "info msg", {
      key: "value",
    });
    spy.mockRestore();
  });

  it("バッファが上限に達すると自動 flush される", async () => {
    // BUFFER_MAX=50 なので、50件の非errorログでflushが発火する
    for (let i = 0; i < 50; i++) {
      logger.info("system", `msg-${i}`);
    }
    await new Promise((r) => setTimeout(r, 50));
    expect(store.entries).toHaveLength(50);
  });

  it("store.append が失敗してもエラーを投げない", async () => {
    const failStore: LogStore = {
      append: vi.fn().mockRejectedValue(new Error("write failed")),
      getAll: vi.fn().mockResolvedValue([]),
      clear: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    };
    const failLogger = new Logger(failStore, { isDev: false });
    failLogger.error("system", "test");
    // flush が完了しても例外が投げられない
    await new Promise((r) => setTimeout(r, 50));
    expect(failStore.append).toHaveBeenCalled();
  });

  it("getEntries で search フィルタが効く", async () => {
    logger.error("system", "database connection lost");
    logger.error("system", "user login failed");

    const searchResult = await logger.getEntries({ search: "database" });
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0].message).toBe("database connection lost");
  });

  it("store が null の場合 clear はエラーなく完了する", async () => {
    const nullLogger = new Logger(null, { isDev: false });
    await expect(nullLogger.clear()).resolves.toBeUndefined();
  });
});
