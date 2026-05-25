/**
 * @module Logger
 * @description 構造化ロガーの本体実装。バッファリング・定期フラッシュ・レベルフィルタリング・メタデータサニタイズ機能を持ち、LogStoreへの永続化を行う。
 */
import { generateUUID } from "@shared/utils/generateUUID";
import type {
  LogLevel,
  ErrorCategory,
  LogEntry,
  LogFilter,
  LogStore,
  LoggerPort,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Logger — 構造化ロガーの本体実装                                      */
/* ------------------------------------------------------------------ */

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const FLUSH_INTERVAL_MS = 5_000;
const BUFFER_MAX = 50;

export class Logger implements LoggerPort {
  private buffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushPending: Promise<void> = Promise.resolve();
  private store: LogStore | null = null;
  private minLevel: LogLevel;
  private isDev: boolean;

  constructor(
    store: LogStore | null,
    opts?: { minLevel?: LogLevel; isDev?: boolean },
  ) {
    this.store = store;
    this.minLevel = opts?.minLevel ?? "debug";
    this.isDev = opts?.isDev ?? process.env.NODE_ENV === "development";

    // 定期 flush（error 以外をまとめて書き込み）
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  /* ---- 公開ログメソッド ---- */

  debug(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log("debug", category, message, meta);
  }

  info(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log("info", category, message, meta);
  }

  warn(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log("warn", category, message, meta);
  }

  error(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    this.log("error", category, message, meta);
  }

  /* ---- クエリ / エクスポート ---- */

  async getEntries(filter?: LogFilter): Promise<LogEntry[]> {
    // 進行中の flush を待ってから、残りのバッファも flush
    await this.flushPending;
    await this.flush();
    if (!this.store) return [];
    return this.store.getAll(filter);
  }

  async clear(): Promise<void> {
    this.buffer = [];
    if (this.store) {
      await this.store.clear();
    }
  }

  async exportJSON(): Promise<string> {
    const entries = await this.getEntries();
    return JSON.stringify(entries, null, 2);
  }

  /* ---- ライフサイクル ---- */

  dispose(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    void this.flush();
  }

  /* ---- 内部メソッド ---- */

  private log(
    level: LogLevel,
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) return;

    const entry: LogEntry = {
      id: generateUUID(),
      timestamp: Date.now(),
      level,
      category,
      message,
      ...(meta !== undefined ? { meta: this.sanitizeMeta(meta) } : {}),
    };

    // dev 環境ではコンソールにも出力
    if (this.isDev) {
      this.consoleOutput(entry);
    }

    this.buffer.push(entry);

    // error は即 flush
    if (level === "error" || this.buffer.length >= BUFFER_MAX) {
      this.flushPending = this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.store) return;

    const batch = this.buffer.splice(0);
    for (const entry of batch) {
      try {
        await this.store.append(entry);
      } catch {
        // ストア書き込み失敗時はサイレント（無限ループ防止）
      }
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const tag = `[${entry.level.toUpperCase()}][${entry.category}]`;
    const fn =
      entry.level === "error"
        ? console.error
        : entry.level === "warn"
          ? console.warn
          : entry.level === "debug"
            ? console.debug
            : console.info;
    fn(tag, entry.message, entry.meta ?? "");
  }

  private sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      if (value instanceof Error) {
        result[key] = {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
