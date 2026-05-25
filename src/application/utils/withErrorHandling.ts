/**
 * @module withErrorHandling
 * @description Interactor メソッドの共通エラーハンドリングラッパー。
 * try-catch + handleError + throw のボイラープレートを集約する。
 */
import { handleError } from "@shared/errors/handleError";
import { AppError, DatabaseError } from "@shared/errors/AppError";

/**
 * 非同期処理をエラーハンドリング付きで実行する。
 * エラーが発生した場合、適切な AppError でラップしてログ記録した後に再スローする。
 * 既に AppError のサブクラスであればそのまま利用し、それ以外は DatabaseError でラップする。
 *
 * @param fn - 実行する非同期処理
 * @param message - エラーログに記録するメッセージ
 * @param meta - エラーログに付与するメタデータ
 * @throws {AppError} 操作が失敗した場合
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  message: string,
  meta?: Record<string, unknown>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError =
      error instanceof AppError
        ? error
        : new DatabaseError(message, { cause: error });
    handleError(appError, message, meta ? { meta } : undefined);
    throw appError;
  }
}
