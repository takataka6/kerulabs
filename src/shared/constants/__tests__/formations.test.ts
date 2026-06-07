import { describe, it, expect } from "vitest";
import {
  getFormationOptions,
  getFormationOptionsWithDefault,
  FORMATION_OPTIONS,
  FUTSAL_FORMATION_OPTIONS,
  EIGHT_ASIDE_FORMATION_OPTIONS,
  SOCIETY_FORMATION_OPTIONS,
  getDefaultFormationOption,
  ensureFormationDefaultForGameMode,
} from "../formations";

describe("getFormationOptions", () => {
  it("footballモードでサッカーフォーメーションを返す", () => {
    expect(getFormationOptions("football")).toBe(FORMATION_OPTIONS);
    expect(FORMATION_OPTIONS).toEqual([
      "4-3-3",
      "4-4-2 Flat",
      "4-4-2 Diamond",
      "4-2-3-1",
      "4-1-4-1",
      "4-3-1-2",
      "4-2-2-2",
      "3-5-2",
      "3-4-1-2",
      "3-1-4-2",
      "5-3-2",
      "3-4-2-1",
      "5-4-1",
      "3-4-3",
      "4-3-2-1",
    ]);
  });

  it("futsalモードでフットサルフォーメーションを返す", () => {
    expect(getFormationOptions("futsal")).toBe(FUTSAL_FORMATION_OPTIONS);
  });

  it("eight_asideモードで8人制フォーメーションを返す", () => {
    expect(getFormationOptions("eight_aside")).toBe(
      EIGHT_ASIDE_FORMATION_OPTIONS,
    );
  });

  it("societyモードでソサイチフォーメーションを返す", () => {
    expect(getFormationOptions("society")).toBe(SOCIETY_FORMATION_OPTIONS);
  });
});

describe("formation defaults", () => {
  it("各ゲームモードのデフォルトフォーメーションを返す", () => {
    expect(getDefaultFormationOption("football")).toBe("4-3-3");
    expect(getDefaultFormationOption("futsal")).toBe("2-2");
    expect(getDefaultFormationOption("eight_aside")).toBe("2-3-2");
    expect(getDefaultFormationOption("society")).toBe("2-3-1");
  });

  it("対象モードの設定がない場合はデフォルト1件を返す", () => {
    expect(getFormationOptionsWithDefault(["4-3-3"], "futsal")).toEqual([
      "futsal-2-2",
    ]);
  });

  it("対象モードの設定がある場合はその設定を返す", () => {
    expect(
      getFormationOptionsWithDefault(["4-3-3", "1-2-1"], "futsal"),
    ).toEqual(["futsal-1-2-1"]);
  });

  it("対象モードの設定がない場合は既存設定にデフォルトを追加する", () => {
    expect(ensureFormationDefaultForGameMode(["4-3-3"], "society")).toEqual([
      "4-3-3",
      "society-2-3-1",
    ]);
  });
});
