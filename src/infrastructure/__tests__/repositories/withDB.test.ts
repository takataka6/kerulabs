/**
 * @module withDB ユーティリティ
 * @description IndexedDB操作のラッパー関数（withDB）の単体テスト
 *
 * テスト方針:
 * - IndexedDBClient をモック化し、DB接続を分離
 * - handleError をvi.mockでスタブ化
 * - 正常系: DB取得→operation実行→結果返却の流れを検証
 * - 異常系: operation失敗 / DB接続失敗時のhandleError呼び出しと再スロー
 * - meta パラメータの受け渡しを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { withDB } from "../../repositories/indexeddb/withDB";
import type { IndexedDBClient } from "../../repositories/indexeddb/IndexedDBClient";
import { DatabaseError } from "@shared/errors/AppError";

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

import { handleError } from "@shared/errors/handleError";

describe("withDB", () => {
  let mockClient: { getDB: ReturnType<typeof vi.fn> };
  let mockDB: Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDB = { objectStoreNames: ["test"] };
    mockClient = { getDB: vi.fn().mockResolvedValue(mockDB) };
  });

  it("正常系: operation の戻り値を返す", async () => {
    const expected = { id: "1", name: "test" };
    const operation = vi.fn().mockResolvedValue(expected);

    const result = await withDB(
      mockClient as unknown as IndexedDBClient,
      operation,
      "error message",
    );

    expect(result).toBe(expected);
  });

  it("正常系: client.getDB() で取得した DB を operation に渡す", async () => {
    const operation = vi.fn().mockResolvedValue(undefined);

    await withDB(
      mockClient as unknown as IndexedDBClient,
      operation,
      "error message",
    );

    expect(mockClient.getDB).toHaveBeenCalledOnce();
    expect(operation).toHaveBeenCalledWith(mockDB);
  });

  it("異常系: operation がエラーを投げた場合、DatabaseError でラップして再スロー", async () => {
    const error = new Error("operation failed");
    const operation = vi.fn().mockRejectedValue(error);

    await expect(
      withDB(
        mockClient as unknown as IndexedDBClient,
        operation,
        "Failed to do something",
      ),
    ).rejects.toThrow(DatabaseError);

    expect(handleError).toHaveBeenCalledWith(
      expect.any(DatabaseError),
      "Failed to do something",
      undefined,
    );
  });

  it("異常系: client.getDB() がエラーを投げた場合、DatabaseError でラップして再スロー", async () => {
    const error = new Error("DB connection failed");
    mockClient.getDB.mockRejectedValue(error);
    const operation = vi.fn();

    await expect(
      withDB(
        mockClient as unknown as IndexedDBClient,
        operation,
        "Failed to open DB",
      ),
    ).rejects.toThrow(DatabaseError);

    expect(handleError).toHaveBeenCalledWith(
      expect.any(DatabaseError),
      "Failed to open DB",
      undefined,
    );
    expect(operation).not.toHaveBeenCalled();
  });

  it("既に DatabaseError の場合は二重ラップしない", async () => {
    const dbError = new DatabaseError("already wrapped");
    const operation = vi.fn().mockRejectedValue(dbError);

    await expect(
      withDB(
        mockClient as unknown as IndexedDBClient,
        operation,
        "Should not rewrap",
      ),
    ).rejects.toBe(dbError);
  });

  it("meta が指定された場合、handleError に meta を渡す", async () => {
    const error = new Error("fail");
    const operation = vi.fn().mockRejectedValue(error);
    const meta = { id: "abc", action: "save" };

    await expect(
      withDB(
        mockClient as unknown as IndexedDBClient,
        operation,
        "Failed with meta",
        meta,
      ),
    ).rejects.toThrow(DatabaseError);

    expect(handleError).toHaveBeenCalledWith(
      expect.any(DatabaseError),
      "Failed with meta",
      { meta },
    );
  });

  it("meta が未指定の場合、handleError に undefined を渡す", async () => {
    const error = new Error("fail");
    const operation = vi.fn().mockRejectedValue(error);

    await expect(
      withDB(
        mockClient as unknown as IndexedDBClient,
        operation,
        "No meta error",
      ),
    ).rejects.toThrow(DatabaseError);

    expect(handleError).toHaveBeenCalledWith(
      expect.any(DatabaseError),
      "No meta error",
      undefined,
    );
  });
});
