/**
 * @module tactic-creation constants
 * @description 戦術作成ウィザードの定数定義の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な定数のスナップショットテスト）
 * - UI定数（CSSクラス・オプション配列）の存在と構造を検証
 * - 軌道オプション・フェーズキー・アイコンオプション等の網羅性を検証
 */
import { describe, it, expect } from "vitest";
import {
  TRAJECTORY_OPTIONS,
  PHASE_DROPDOWN_KEYS,
  ICON_OPTIONS,
  WIZARD_WRAPPER,
  CARD_BASE,
  STEP_INDICATOR,
  SECTION_TITLE,
  BTN_SECONDARY,
} from "../constants";

/* ------------------------------------------------------------------ */
/*  TRAJECTORY_OPTIONS                                                 */
/* ------------------------------------------------------------------ */

describe("TRAJECTORY_OPTIONS", () => {
  it("4つの軌道タイプが定義されている", () => {
    expect(TRAJECTORY_OPTIONS).toHaveLength(4);
  });

  it("各オプションに type, icon, labelKey が存在する", () => {
    for (const option of TRAJECTORY_OPTIONS) {
      expect(option).toHaveProperty("type");
      expect(option).toHaveProperty("icon");
      expect(option).toHaveProperty("labelKey");
      expect(typeof option.type).toBe("string");
      expect(typeof option.icon).toBe("string");
      expect(typeof option.labelKey).toBe("string");
    }
  });

  it("正しい軌道タイプを含む", () => {
    const types = TRAJECTORY_OPTIONS.map((o) => o.type);
    expect(types).toEqual(["low", "high", "curveLeft", "curveRight"]);
  });

  it("labelKey が tactics.creation.trajectory. プレフィックスを持つ", () => {
    for (const option of TRAJECTORY_OPTIONS) {
      expect(option.labelKey).toMatch(/^tactics\.creation\.trajectory\./);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  PHASE_DROPDOWN_KEYS                                                */
/* ------------------------------------------------------------------ */

describe("PHASE_DROPDOWN_KEYS", () => {
  it("4つのフェーズキーが定義されている", () => {
    expect(PHASE_DROPDOWN_KEYS).toHaveLength(4);
  });

  it("正しいフェーズキーを含む", () => {
    expect(PHASE_DROPDOWN_KEYS).toEqual([
      "attack",
      "defense",
      "positive_transition",
      "negative_transition",
    ]);
  });
});

/* ------------------------------------------------------------------ */
/*  ICON_OPTIONS                                                       */
/* ------------------------------------------------------------------ */

describe("ICON_OPTIONS", () => {
  it("8つのアイコンオプションが定義されている", () => {
    expect(ICON_OPTIONS).toHaveLength(8);
  });

  it("全て文字列である", () => {
    for (const icon of ICON_OPTIONS) {
      expect(typeof icon).toBe("string");
    }
  });

  it("重複がない", () => {
    const unique = new Set(ICON_OPTIONS);
    expect(unique.size).toBe(ICON_OPTIONS.length);
  });
});

/* ------------------------------------------------------------------ */
/*  Tailwind クラス定数                                                 */
/* ------------------------------------------------------------------ */

describe("Tailwind クラス定数", () => {
  it("WIZARD_WRAPPER が定義されている", () => {
    expect(typeof WIZARD_WRAPPER).toBe("string");
    expect(WIZARD_WRAPPER.length).toBeGreaterThan(0);
  });

  it("CARD_BASE が定義されている", () => {
    expect(typeof CARD_BASE).toBe("string");
    expect(CARD_BASE.length).toBeGreaterThan(0);
  });

  it("STEP_INDICATOR が定義されている", () => {
    expect(typeof STEP_INDICATOR).toBe("string");
    expect(STEP_INDICATOR.length).toBeGreaterThan(0);
  });

  it("SECTION_TITLE が定義されている", () => {
    expect(typeof SECTION_TITLE).toBe("string");
    expect(SECTION_TITLE.length).toBeGreaterThan(0);
  });

  it("BTN_SECONDARY が定義されている", () => {
    expect(typeof BTN_SECONDARY).toBe("string");
    expect(BTN_SECONDARY.length).toBeGreaterThan(0);
  });

  it("WIZARD_WRAPPER に flex レイアウト関連のクラスを含む", () => {
    expect(WIZARD_WRAPPER).toContain("flex");
    expect(WIZARD_WRAPPER).toContain("z-50");
  });

  it("CARD_BASE にバックドロップ関連のクラスを含む", () => {
    expect(CARD_BASE).toContain("backdrop-blur");
    expect(CARD_BASE).toContain("rounded");
  });
});
