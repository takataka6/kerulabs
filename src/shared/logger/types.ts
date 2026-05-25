/**
 * @module logger/types
 * @description 構造化ロガーの型定義。ログレベル・エラーカテゴリ・ログエントリ・フィルタ条件・LogStore/LoggerPortインターフェースを定義する。
 */

/* ------------------------------------------------------------------ */
/*  構造化ロガー — 型定義                                                */
/* ------------------------------------------------------------------ */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type ErrorCategory =
  | "validation"
  | "database"
  | "domain"
  | "ui"
  | "system";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: ErrorCategory;
  message: string;
  meta?: Record<string, unknown>;
}

/**
 * ログの永続化先を抽象化するインターフェース。
 * Renderer (IndexedDB) と Electron main (File) で実装を分ける。
 */
export interface LogStore {
  append(entry: LogEntry): Promise<void>;
  getAll(filter?: LogFilter): Promise<LogEntry[]>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export interface LogFilter {
  level?: LogLevel;
  category?: ErrorCategory;
  since?: number;
  until?: number;
  search?: string;
  limit?: number;
}

/**
 * Logger が外部に公開するポートインターフェース。
 * 各レイヤーはこのインターフェースにのみ依存する。
 */
export interface LoggerPort {
  debug(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void;
  info(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void;
  warn(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void;
  error(
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ): void;
  getEntries(filter?: LogFilter): Promise<LogEntry[]>;
  clear(): Promise<void>;
  exportJSON(): Promise<string>;
}
