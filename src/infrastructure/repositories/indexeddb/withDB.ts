import type { IDBPDatabase } from "idb";
import type { TacticsDB } from "./IndexedDBClient";
import type { IndexedDBClient } from "./IndexedDBClient";
import { handleError } from "@shared/errors/handleError";
import { DatabaseError } from "@shared/errors/AppError";

/**
 * IndexedDB 操作の共通ラッパー。
 *
 * DB 取得・try/catch・handleError・re-throw のボイラープレートを吸収し、
 * 各リポジトリメソッドを純粋な DB 操作ロジックに集中させる。
 *
 * @param client - IndexedDB シングルトンクライアント。
 * @param operation - オープン済みDBインスタンスを受け取る非同期コールバック。
 * @param errorMessage - 失敗時に handleError へ渡す人間可読なメッセージ。
 * @param meta - エラーログに付与する任意のメタデータ。
 * @returns `operation` の戻り値。
 * @throws {DatabaseError} DB接続またはoperation実行が失敗した場合
 */
export async function withDB<T>(
  client: IndexedDBClient,
  operation: (db: IDBPDatabase<TacticsDB>) => Promise<T>,
  errorMessage: string,
  meta?: Record<string, unknown>,
): Promise<T> {
  try {
    const db = await client.getDB();
    return await operation(db);
  } catch (error) {
    const dbError =
      error instanceof DatabaseError
        ? error
        : new DatabaseError(errorMessage, { cause: error });
    handleError(dbError, errorMessage, meta ? { meta } : undefined);
    throw dbError;
  }
}
