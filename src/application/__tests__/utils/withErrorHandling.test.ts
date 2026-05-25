/**
 * @module withErrorHandling
 * @description withErrorHandling ユーティリティの単体テスト
 *
 * テスト方針:
 * - 非同期関数の成功時に結果を返すことを検証
 * - エラー発生時に handleError が呼ばれてから再スローされることを検証
 * - meta の有無による handleError 呼び出しの違いを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { withErrorHandling } from "../../utils/withErrorHandling";
import { DatabaseError } from "@shared/errors/AppError";

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

import { handleError } from "@shared/errors/handleError";

const mockedHandleError = vi.mocked(handleError);

describe("withErrorHandling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("非同期関数が成功した場合に結果を返す", async () => {
    const result = await withErrorHandling(
      () => Promise.resolve("success"),
      "テストメッセージ",
    );

    expect(result).toBe("success");
    expect(mockedHandleError).not.toHaveBeenCalled();
  });

  it("非同期関数が成功した場合にオブジェクトの結果を返す", async () => {
    const data = { id: 1, name: "test" };
    const result = await withErrorHandling(
      () => Promise.resolve(data),
      "テストメッセージ",
    );

    expect(result).toEqual(data);
  });

  it("エラーが発生した場合にDatabaseErrorでラップしてhandleErrorを呼び出してから再スローする", async () => {
    const error = new Error("テストエラー");

    await expect(
      withErrorHandling(() => Promise.reject(error), "エラーメッセージ"),
    ).rejects.toThrow(DatabaseError);

    expect(mockedHandleError).toHaveBeenCalledOnce();
    expect(mockedHandleError).toHaveBeenCalledWith(
      expect.any(DatabaseError),
      "エラーメッセージ",
      undefined,
    );
  });

  it("既にDatabaseErrorの場合は二重ラップしない", async () => {
    const dbError = new DatabaseError("DBエラー");

    await expect(
      withErrorHandling(() => Promise.reject(dbError), "エラーメッセージ"),
    ).rejects.toBe(dbError);

    expect(mockedHandleError).toHaveBeenCalledWith(
      dbError,
      "エラーメッセージ",
      undefined,
    );
  });

  it("metaがある場合はhandleErrorにmetaを渡す", async () => {
    const error = new Error("テストエラー");
    const meta = { teamId: "team-1", operation: "save" };

    await expect(
      withErrorHandling(() => Promise.reject(error), "エラーメッセージ", meta),
    ).rejects.toThrow(DatabaseError);

    expect(mockedHandleError).toHaveBeenCalledWith(
      expect.any(DatabaseError),
      "エラーメッセージ",
      { meta },
    );
  });

  it("metaがない場合はhandleErrorにmetaを渡さない", async () => {
    const error = new Error("テストエラー");

    await expect(
      withErrorHandling(() => Promise.reject(error), "エラーメッセージ"),
    ).rejects.toThrow(DatabaseError);

    expect(mockedHandleError).toHaveBeenCalledWith(
      expect.any(DatabaseError),
      "エラーメッセージ",
      undefined,
    );
  });

  it("戻り値の型が正しいこと", async () => {
    const numberResult = await withErrorHandling(
      () => Promise.resolve(42),
      "数値テスト",
    );
    expect(typeof numberResult).toBe("number");

    const arrayResult = await withErrorHandling(
      () => Promise.resolve([1, 2, 3]),
      "配列テスト",
    );
    expect(Array.isArray(arrayResult)).toBe(true);

    const nullResult = await withErrorHandling(
      () => Promise.resolve(null),
      "nullテスト",
    );
    expect(nullResult).toBeNull();
  });
});
