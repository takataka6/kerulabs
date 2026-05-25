/**
 * @module AppError
 * @description アプリケーション共通のカスタムエラークラス階層。
 * instanceof による型安全なエラー判別と、ErrorCategory の自動推論を可能にする。
 */
import type { ErrorCategory } from "@shared/logger";

/**
 * アプリケーション全体の基底エラークラス。
 * すべてのカスタムエラーはこのクラスを継承する。
 *
 * @example
 * ```ts
 * try { ... } catch (error) {
 *   if (error instanceof AppError) {
 *     console.log(error.category); // ErrorCategory が型安全に取得できる
 *   }
 * }
 * ```
 */
export class AppError extends Error {
  readonly category: ErrorCategory;

  constructor(
    message: string,
    category: ErrorCategory,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AppError";
    this.category = category;
  }
}

/**
 * データベース操作に関するエラー。
 * IndexedDB の読み書き・接続失敗などで使用する。
 *
 * @throws withDB, withErrorHandling ラッパー内で自動的にラップされる
 */
export class DatabaseError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "database", options);
    this.name = "DatabaseError";
  }
}

/**
 * バリデーションエラー。
 * Zod スキーマ検証・JSON パース・入力検証の失敗で使用する。
 */
export class ValidationError extends AppError {
  readonly details?: ReadonlyArray<{ path: string; message: string }>;

  constructor(
    message: string,
    options?: ErrorOptions & {
      details?: ReadonlyArray<{ path: string; message: string }>;
    },
  ) {
    super(message, "validation", options);
    this.name = "ValidationError";
    this.details = options?.details;
  }
}

/**
 * ドメインロジックに関するエラー。
 * ビジネスルール違反・不正な状態遷移などで使用する。
 */
export class DomainError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "domain", options);
    this.name = "DomainError";
  }
}
