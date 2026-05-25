/**
 * @module AppError テスト
 * @description カスタムエラークラス階層の単体テスト
 *
 * テスト方針:
 * - 各エラークラスが正しい name / category を持つことを検証
 * - instanceof による型判別が正しく動作することを検証
 * - cause チェーンや ValidationError の details が保持されることを検証
 */
import { describe, it, expect } from "vitest";
import {
  AppError,
  DatabaseError,
  ValidationError,
  DomainError,
} from "@shared/errors/AppError";

describe("AppError", () => {
  it("name と category が正しく設定される", () => {
    const error = new AppError("test error", "system");

    expect(error.name).toBe("AppError");
    expect(error.category).toBe("system");
    expect(error.message).toBe("test error");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it("cause を保持できる", () => {
    const cause = new Error("original");
    const error = new AppError("wrapped", "system", { cause });

    expect(error.cause).toBe(cause);
  });
});

describe("DatabaseError", () => {
  it("category が 'database' に固定される", () => {
    const error = new DatabaseError("connection lost");

    expect(error.name).toBe("DatabaseError");
    expect(error.category).toBe("database");
    expect(error.message).toBe("connection lost");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(DatabaseError);
  });

  it("cause を保持できる", () => {
    const cause = new TypeError("indexedDB not available");
    const error = new DatabaseError("DB open failed", { cause });

    expect(error.cause).toBe(cause);
  });
});

describe("ValidationError", () => {
  it("category が 'validation' に固定される", () => {
    const error = new ValidationError("invalid input");

    expect(error.name).toBe("ValidationError");
    expect(error.category).toBe("validation");
    expect(error.message).toBe("invalid input");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
  });

  it("details を保持できる", () => {
    const details = [
      { path: "name", message: "Required" },
      { path: "email", message: "Invalid email" },
    ];
    const error = new ValidationError("Validation failed", { details });

    expect(error.details).toEqual(details);
    expect(error.details).toHaveLength(2);
  });

  it("details が未指定の場合は undefined", () => {
    const error = new ValidationError("no details");

    expect(error.details).toBeUndefined();
  });

  it("cause と details を同時に保持できる", () => {
    const cause = new Error("zod error");
    const details = [{ path: "field", message: "required" }];
    const error = new ValidationError("failed", { cause, details });

    expect(error.cause).toBe(cause);
    expect(error.details).toEqual(details);
  });
});

describe("DomainError", () => {
  it("category が 'domain' に固定される", () => {
    const error = new DomainError("invalid state transition");

    expect(error.name).toBe("DomainError");
    expect(error.category).toBe("domain");
    expect(error.message).toBe("invalid state transition");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(DomainError);
  });
});

describe("instanceof による型判別", () => {
  it("サブクラスは AppError として判別される", () => {
    const errors = [
      new DatabaseError("db error"),
      new ValidationError("validation error"),
      new DomainError("domain error"),
    ];

    errors.forEach((error) => {
      expect(error).toBeInstanceOf(AppError);
    });
  });

  it("異なるサブクラス同士は区別される", () => {
    const dbError = new DatabaseError("db");
    const valError = new ValidationError("val");

    expect(dbError).not.toBeInstanceOf(ValidationError);
    expect(valError).not.toBeInstanceOf(DatabaseError);
  });
});
