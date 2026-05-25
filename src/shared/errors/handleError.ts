/**
 * @module handleError
 * @description アプリケーション全体で使用する統一エラーハンドラ。構造化ロガーへの記録とユーザー向けトースト通知を一元的に処理する。
 */
import { getLogger } from "@shared/logger";
import type { ErrorCategory } from "@shared/logger";
import { AppError } from "./AppError";

type ShowToastFn = (message: string, type: "success" | "error") => void;

/**
 * 統一エラーハンドラ。
 *
 * 1. 構造化ロガーに error レベルで記録する
 * 2. toast が指定されていればユーザー向けトーストを表示する
 *
 * @param error    - catch で受け取ったエラーオブジェクト
 * @param category - ロガーのエラーカテゴリ ("database" | "ui" | …)
 * @param logMessage - 英語のデバッグ向けログメッセージ
 * @param options  - toast: ユーザー向け通知, meta: 追加のログメタデータ
 *
 * @example
 * ```ts
 * // toast 付き（最も一般的）
 * handleError(error, "database", "Failed to save team", {
 *   toast: { show: showToast, message: t("team.saveFailed") },
 * });
 *
 * // 追加メタデータ付き
 * handleError(error, "database", "Failed to delete tactic", {
 *   meta: { tacticId },
 * });
 *
 * // ログのみ（toast 不要）
 * handleError(error, "ui", "Image load failed");
 *
 * // AppError の場合はカテゴリ省略可能（自動推論）
 * handleError(new DatabaseError("connection lost"), "DB write failed");
 * ```
 */
export function handleError(
  error: AppError,
  logMessage: string,
  options?: {
    toast?: { show: ShowToastFn; message: string };
    meta?: Record<string, unknown>;
  },
): void;
export function handleError(
  error: unknown,
  category: ErrorCategory,
  logMessage: string,
  options?: {
    toast?: { show: ShowToastFn; message: string };
    meta?: Record<string, unknown>;
  },
): void;
export function handleError(
  error: unknown,
  categoryOrMessage: ErrorCategory | string,
  logMessageOrOptions?:
    | string
    | {
        toast?: { show: ShowToastFn; message: string };
        meta?: Record<string, unknown>;
      },
  maybeOptions?: {
    toast?: { show: ShowToastFn; message: string };
    meta?: Record<string, unknown>;
  },
): void {
  let category: ErrorCategory;
  let logMessage: string;
  let options: typeof maybeOptions;

  if (error instanceof AppError && typeof logMessageOrOptions !== "string") {
    // AppError overload: handleError(appError, logMessage, options?)
    category = error.category;
    logMessage = categoryOrMessage;
    options = logMessageOrOptions;
  } else {
    // Standard overload: handleError(error, category, logMessage, options?)
    category = categoryOrMessage as ErrorCategory;
    logMessage = logMessageOrOptions as string;
    options = maybeOptions;
  }

  getLogger().error(category, logMessage, {
    error,
    ...options?.meta,
  });

  options?.toast?.show(options.toast.message, "error");
}
