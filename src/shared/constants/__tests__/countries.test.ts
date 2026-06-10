/**
 * @module countries 定数
 * @description 国情報定数・フラグ絵文字・国名検索ユーティリティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な定数とユーティリティ関数のみ）
 * - COUNTRIES配列の構造・FLAG_EMOJI定数・getCountryInfo関数を検証
 * - 日本語/英語の両言語での国名検索と存在しない国名のフォールバックを検証
 */
import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  FLAG_EMOJI,
  getCountryInfo,
  getFlagTypeByCountryName,
} from "../countries";

describe("countries", () => {
  // ── COUNTRIES ──

  it("COUNTRIES に複数の国が定義されている", () => {
    expect(COUNTRIES.length).toBeGreaterThan(30);
  });

  it("各国に code / nameJa / nameEn / flag が含まれる", () => {
    for (const country of COUNTRIES) {
      expect(country.code).toBeTruthy();
      expect(country.nameJa).toBeTruthy();
      expect(country.nameEn).toBeTruthy();
      expect(country.flag).toBeTruthy();
    }
  });

  it("日本（JP）が含まれている", () => {
    const japan = COUNTRIES.find((c) => c.code === "JP");
    expect(japan).toBeDefined();
    expect(japan!.nameJa).toBe("日本");
    expect(japan!.nameEn).toBe("Japan");
  });

  // ── FLAG_EMOJI ──

  it("FLAG_EMOJI に 59 件のフラグが定義されている", () => {
    expect(Object.keys(FLAG_EMOJI)).toHaveLength(59);
  });

  it("FLAG_EMOJI の japan キーが 🇯🇵 を返す", () => {
    expect(FLAG_EMOJI["japan"]).toBe("🇯🇵");
  });

  it("FLAG_EMOJI の usa キーが 🇺🇸 を返す", () => {
    expect(FLAG_EMOJI["usa"]).toBe("🇺🇸");
  });

  // ── getCountryInfo ──

  it("日本語名で検索すると対応する国情報を返す", () => {
    const result = getCountryInfo("日本", "ja");
    expect(result.flag).toBe("🇯🇵");
    expect(result.name).toBe("日本");
  });

  it("英語名で検索すると対応する国情報を返す", () => {
    const result = getCountryInfo("Japan", "en");
    expect(result.flag).toBe("🇯🇵");
    expect(result.name).toBe("Japan");
  });

  it("日本語名で検索して英語で取得できる", () => {
    const result = getCountryInfo("日本", "en");
    expect(result.name).toBe("Japan");
  });

  it("存在しない国名の場合 🌍 フラグとそのまま名前を返す", () => {
    const result = getCountryInfo("Unknown Country", "ja");
    expect(result.flag).toBe("🌍");
    expect(result.name).toBe("Unknown Country");
  });

  // ── getFlagTypeByCountryName ──

  it("日本語名で国のフラグタイプを返す", () => {
    const result = getFlagTypeByCountryName("日本");
    expect(result).toBeDefined();
  });

  it("英語名で国のフラグタイプを返す", () => {
    const result = getFlagTypeByCountryName("Japan");
    expect(result).toBeDefined();
  });

  it("存在しない国名の場合はundefinedを返す", () => {
    const result = getFlagTypeByCountryName("Unknown Country");
    expect(result).toBeUndefined();
  });
});
