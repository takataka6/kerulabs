/**
 * @module positionColors
 * @description ポジション別カラーユーティリティ関数の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なユーティリティ関数のみ）
 * - 有効なポジション（gk/df/mf/fw）で正しいクラス名を返すことを検証
 * - 無効値・undefined でフォールバックを返すことを検証
 * - カスタムフォールバック引数の動作を検証
 */
import { describe, it, expect, beforeEach } from "vitest";
import { vi } from "vitest";
import {
  getPositionBg,
  getPositionBorder,
  getPositionBgDark,
  getPositionBorderDark,
} from "@shared/constants/positionColors";

describe("positionColors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getPositionBg ──

  describe("getPositionBg", () => {
    it.each([
      ["gk", "bg-yellow-500"],
      ["df", "bg-blue-500"],
      ["mf", "bg-violet-500"],
      ["fw", "bg-red-500"],
    ] as const)('"%s" に対して "%s" を返す', (position, expected) => {
      expect(getPositionBg(position)).toBe(expected);
    });

    it("無効なポジションではデフォルトフォールバック bg-gray-500 を返す", () => {
      expect(getPositionBg("invalid")).toBe("bg-gray-500");
    });

    it("undefined ではデフォルトフォールバック bg-gray-500 を返す", () => {
      expect(getPositionBg(undefined)).toBe("bg-gray-500");
    });

    it("カスタムフォールバックを指定できる", () => {
      expect(getPositionBg("invalid", "bg-slate-400")).toBe("bg-slate-400");
    });
  });

  // ── getPositionBorder ──

  describe("getPositionBorder", () => {
    it.each([
      ["gk", "border-yellow-500"],
      ["df", "border-blue-500"],
      ["mf", "border-violet-500"],
      ["fw", "border-red-500"],
    ] as const)('"%s" に対して "%s" を返す', (position, expected) => {
      expect(getPositionBorder(position)).toBe(expected);
    });

    it("無効なポジションではデフォルトフォールバック border-gray-500 を返す", () => {
      expect(getPositionBorder("invalid")).toBe("border-gray-500");
    });

    it("undefined ではデフォルトフォールバック border-gray-500 を返す", () => {
      expect(getPositionBorder(undefined)).toBe("border-gray-500");
    });

    it("カスタムフォールバックを指定できる", () => {
      expect(getPositionBorder("invalid", "border-slate-400")).toBe(
        "border-slate-400",
      );
    });
  });

  // ── getPositionBgDark ──

  describe("getPositionBgDark", () => {
    it.each([
      ["gk", "bg-yellow-600/60"],
      ["df", "bg-blue-600/60"],
      ["mf", "bg-violet-600/60"],
      ["fw", "bg-red-600/60"],
    ] as const)('"%s" に対して "%s" を返す', (position, expected) => {
      expect(getPositionBgDark(position)).toBe(expected);
    });

    it("無効なポジションではフォールバック bg-gray-600/60 を返す", () => {
      expect(getPositionBgDark("invalid")).toBe("bg-gray-600/60");
    });

    it("undefined ではフォールバック bg-gray-600/60 を返す", () => {
      expect(getPositionBgDark(undefined)).toBe("bg-gray-600/60");
    });
  });

  // ── getPositionBorderDark ──

  describe("getPositionBorderDark", () => {
    it.each([
      ["gk", "border-yellow-900/30"],
      ["df", "border-blue-900/30"],
      ["mf", "border-violet-900/30"],
      ["fw", "border-red-900/30"],
    ] as const)('"%s" に対して "%s" を返す', (position, expected) => {
      expect(getPositionBorderDark(position)).toBe(expected);
    });

    it("無効なポジションではフォールバック border-gray-900/30 を返す", () => {
      expect(getPositionBorderDark("invalid")).toBe("border-gray-900/30");
    });

    it("undefined ではフォールバック border-gray-900/30 を返す", () => {
      expect(getPositionBorderDark(undefined)).toBe("border-gray-900/30");
    });
  });
});
