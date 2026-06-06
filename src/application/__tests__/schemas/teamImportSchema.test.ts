/**
 * @module teamImportSchema
 * @description アプリケーション層インポート/エクスポート用スキーマの単体テスト
 *
 * テスト方針:
 * - 各スキーマの有効データ・無効データのバリデーション検証
 * - デフォルト値の設定確認
 * - オプショナルフィールドの省略可能性確認
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { teamImportDataSchema } from "../../schemas/teamImportSchema";
import { glossaryImportSchema } from "../../schemas/glossaryImportSchema";
import { teamManualImportSchema } from "../../schemas/teamManualImportSchema";
import { tacticExportDataSchema } from "../../schemas/tacticExportSchema";

describe("teamImportDataSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効なデータを受け付ける", () => {
    const validData = {
      name: "チームA",
      subtitle: "サブタイトル",
      country: "japan",
      colors: { gk: "#FF0000", main: "#0000FF" },
      availableFormations: ["4-3-3", "4-4-2"],
      defaultFormation: "4-3-3",
      flagType: "japan",
      headerGradient: "linear-gradient(135deg, #000 0%, #fff 100%)",
      manager: "監督A",
      players: [
        { name: "選手1", number: 10, position: "fw" },
        { name: "選手2", number: 1, position: "gk" },
      ],
    };

    const result = teamImportDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("必須フィールド name が欠如した場合にバリデーション失敗", () => {
    const invalidData = { subtitle: "サブタイトル" };

    const result = teamImportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("name が空文字の場合にバリデーション失敗", () => {
    const invalidData = { name: "" };

    const result = teamImportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("デフォルト値が正しく設定される", () => {
    const minimalData = { name: "チームA" };

    const result = teamImportDataSchema.parse(minimalData);
    expect(result.subtitle).toBe("");
    expect(result.availableFormations).toEqual(["4-3-3"]);
    expect(result.flagType).toBe("japan");
    expect(result.headerGradient).toBe(
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    );
    expect(result.colors.gk).toBe("#FFD700");
  });

  it("オプショナルフィールドの省略が可能", () => {
    const minimalData = { name: "チームA" };

    const result = teamImportDataSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBeUndefined();
      expect(result.data.defaultFormation).toBeUndefined();
      expect(result.data.manager).toBeUndefined();
      expect(result.data.players).toBeUndefined();
    }
  });

  it("選手の背番号が不正な値でバリデーション失敗", () => {
    const invalidData = {
      name: "チームA",
      players: [{ name: "選手1", number: 100 }],
    };

    const result = teamImportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("選手のポジションが不正な値でバリデーション失敗", () => {
    const invalidData = {
      name: "チームA",
      players: [{ name: "選手1", number: 10, position: "invalid" }],
    };

    const result = teamImportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("glossaryImportSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効なデータを受け付ける", () => {
    const validData = {
      name: "用語集A",
      description: "説明文",
      terms: [
        {
          term: "用語1",
          reading: "ようご1",
          description: "説明1",
          keywords: ["key1"],
        },
      ],
    };

    const result = glossaryImportSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("デフォルト値が正しく設定される", () => {
    const emptyData = {};

    const result = glossaryImportSchema.parse(emptyData);
    expect(result.name).toBe("Untitled");
    expect(result.description).toBe("");
    expect(result.terms).toEqual([]);
  });

  it("オプショナルフィールドの省略が可能", () => {
    const minimalData = {};

    const result = glossaryImportSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it("terms 内のデフォルト値が正しく設定される", () => {
    const data = {
      terms: [{}],
    };

    const result = glossaryImportSchema.parse(data);
    expect(result.terms[0].term).toBe("");
    expect(result.terms[0].description).toBe("");
  });

  it("不正な型のデータでバリデーション失敗", () => {
    const invalidData = {
      name: 123,
    };

    const result = glossaryImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("teamManualImportSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効なデータを受け付ける", () => {
    const validData = {
      name: "マニュアルA",
      description: "説明文",
      teamId: "team-1",
      sections: [
        {
          title: "セクション1",
          category: "offense",
          formations: ["4-3-3"],
          items: [
            {
              title: "項目1",
              content: "内容1",
              linkedTacticIds: ["tactic-1"],
            },
          ],
        },
      ],
    };

    const result = teamManualImportSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("デフォルト値が正しく設定される", () => {
    const emptyData = {};

    const result = teamManualImportSchema.parse(emptyData);
    expect(result.name).toBe("Untitled");
    expect(result.description).toBe("");
    expect(result.sections).toEqual([]);
  });

  it("セクション内のデフォルト値が正しく設定される", () => {
    const data = {
      sections: [{}],
    };

    const result = teamManualImportSchema.parse(data);
    expect(result.sections[0].title).toBe("");
    expect(result.sections[0].category).toBe("free_note");
    expect(result.sections[0].formations).toEqual([]);
    expect(result.sections[0].items).toEqual([]);
  });

  it("オプショナルフィールドの省略が可能", () => {
    const minimalData = {};

    const result = teamManualImportSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teamId).toBeUndefined();
    }
  });

  it("不正なカテゴリでバリデーション失敗", () => {
    const invalidData = {
      sections: [{ category: "invalid_category" }],
    };

    const result = teamManualImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("tacticExportDataSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効なデータを受け付ける", () => {
    const validData = {
      version: 1,
      tactics: [
        {
          name: { ja: "戦術A", en: "Tactic A" },
          icon: "icon-1",
          phase: "attack",
          movements: {
            "4-3-3": [
              {
                role: "CF",
                targetX: 0.5,
                targetZ: 0.8,
                delay: 0,
                arrowColor: "#FF0000",
              },
            ],
          },
        },
      ],
    };

    const result = tacticExportDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("必須フィールドが欠如した場合にバリデーション失敗", () => {
    const invalidData = {
      tactics: [{ name: { ja: "戦術A" } }],
    };

    const result = tacticExportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("version が欠如した場合にバリデーション失敗", () => {
    const invalidData = {
      tactics: [],
    };

    const result = tacticExportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("オプショナルフィールドの省略が可能", () => {
    const validData = {
      version: 1,
      tactics: [
        {
          name: { ja: "戦術A" },
          icon: "icon-1",
          phase: "attack",
          movements: {
            "4-3-3": [
              {
                role: "CF",
                targetX: 0.5,
                targetZ: 0.8,
                delay: 0,
                arrowColor: "#FF0000",
              },
            ],
          },
        },
      ],
    };

    const result = tacticExportDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tactics[0].ballPasses).toBeUndefined();
    }
  });

  it("不正なHEXカラーコードでバリデーション失敗", () => {
    const invalidData = {
      version: 1,
      tactics: [
        {
          name: { ja: "戦術A" },
          icon: "icon-1",
          phase: "attack",
          movements: {
            "4-3-3": [
              {
                role: "CF",
                targetX: 0.5,
                targetZ: 0.8,
                delay: 0,
                arrowColor: "not-a-hex",
              },
            ],
          },
        },
      ],
    };

    const result = tacticExportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("movement の role が空文字でバリデーション失敗", () => {
    const invalidData = {
      version: 1,
      tactics: [
        {
          name: { ja: "戦術A" },
          icon: "icon-1",
          phase: "attack",
          movements: {
            "4-3-3": [
              {
                role: "",
                targetX: 0.5,
                targetZ: 0.8,
                delay: 0,
                arrowColor: "#FF0000",
              },
            ],
          },
        },
      ],
    };

    const result = tacticExportDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
