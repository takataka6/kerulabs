/**
 * @module shared/logger
 * @description ロガーモジュールの公開API。シングルトンLoggerの初期化・取得関数と型定義をエクスポートする。
 */
import { Logger } from "./Logger";
import type { LogStore, LoggerPort } from "./types";

export type {
  LogLevel,
  ErrorCategory,
  LogEntry,
  LogFilter,
  LogStore,
  LoggerPort,
} from "./types";

/* ------------------------------------------------------------------ */
/*  シングルトン Logger                                                  */
/* ------------------------------------------------------------------ */

let instance: Logger | null = null;

/**
 * ロガーを初期化する。アプリ起動時に1回だけ呼ぶ。
 *
 * @param store - ログの永続化先（IndexedDBLogStore or FileLogStore）
 *                null を渡すとコンソール出力のみ（テスト用）
 */
export function initLogger(store: LogStore | null = null): LoggerPort {
  instance = new Logger(store);
  return instance;
}

/**
 * ロガーインスタンスを取得する。
 * initLogger() 未呼び出しの場合はコンソール出力のみの Logger を自動生成する。
 */
export function getLogger(): LoggerPort {
  if (!instance) {
    instance = new Logger(null);
  }
  return instance;
}
