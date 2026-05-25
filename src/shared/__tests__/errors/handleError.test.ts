/**
 * @module handleError ユーティリティ
 * @description 共通エラーハンドリング関数の単体テスト
 *
 * テスト方針:
 * - Logger（getLogger）をvi.mockでスタブ化し、ログ出力を検証
 * - エラーログ記録・トースト表示・メタデータ付与の3機能を検証
 * - Error/文字列/null など異なるエラー型での動作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleError } from "@shared/errors/handleError";
import { DatabaseError, ValidationError } from "@shared/errors/AppError";

/* ------------------------------------------------------------------ */
/*  Mock                                                               */
/* ------------------------------------------------------------------ */

const mockError = vi.fn();

vi.mock("@shared/logger", () => ({
  getLogger: () => ({
    error: mockError,
  }),
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("handleError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ログに error レベルで記録される", () => {
    const err = new Error("something broke");

    handleError(err, "database", "DB write failed");

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith("database", "DB write failed", {
      error: err,
    });
  });

  it("toast が指定されていればユーザー向けトーストを表示する", () => {
    const showToast = vi.fn();
    const err = new Error("fail");

    handleError(err, "ui", "UI error", {
      toast: { show: showToast, message: "エラーが発生しました" },
    });

    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith("エラーが発生しました", "error");
  });

  it("toast が指定されていない場合、トーストは表示しない", () => {
    const err = new Error("silent");

    // toast なしで呼び出し — 例外が起きなければ OK
    handleError(err, "system", "Silent error");

    // logger.error は呼ばれるが、toast 系の関数は呼ばれない
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  it("meta が指定されればログに追加メタデータが含まれる", () => {
    const err = new Error("meta test");

    handleError(err, "domain", "Domain error", {
      meta: { tacticId: "t-1", step: 3 },
    });

    expect(mockError).toHaveBeenCalledWith("domain", "Domain error", {
      error: err,
      tacticId: "t-1",
      step: 3,
    });
  });

  it("error が Error オブジェクトでも文字列でも null でも動作する", () => {
    // Error オブジェクト
    handleError(new TypeError("type err"), "system", "msg1");
    expect(mockError).toHaveBeenLastCalledWith("system", "msg1", {
      error: expect.any(TypeError),
    });

    // 文字列
    handleError("string error", "ui", "msg2");
    expect(mockError).toHaveBeenLastCalledWith("ui", "msg2", {
      error: "string error",
    });

    // null
    handleError(null, "database", "msg3");
    expect(mockError).toHaveBeenLastCalledWith("database", "msg3", {
      error: null,
    });

    expect(mockError).toHaveBeenCalledTimes(3);
  });

  it("AppError の場合はカテゴリを自動推論する（2引数オーバーロード）", () => {
    const dbError = new DatabaseError("connection lost");

    handleError(dbError, "DB operation failed");

    expect(mockError).toHaveBeenCalledWith("database", "DB operation failed", {
      error: dbError,
    });
  });

  it("AppError の場合に toast と meta を渡せる", () => {
    const showToast = vi.fn();
    const valError = new ValidationError("invalid input");

    handleError(valError, "Validation failed", {
      toast: { show: showToast, message: "入力エラー" },
      meta: { field: "name" },
    });

    expect(mockError).toHaveBeenCalledWith("validation", "Validation failed", {
      error: valError,
      field: "name",
    });
    expect(showToast).toHaveBeenCalledWith("入力エラー", "error");
  });
});
