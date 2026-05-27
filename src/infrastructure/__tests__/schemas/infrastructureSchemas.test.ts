/**
 * @module infrastructureSchemas.test
 * @description インフラストラクチャ層スキーマの単体テスト。
 * 各スキーマ（formation, glossary, team, tactic, teamManual）について
 * バリデーション成功・必須フィールド欠如・不正な型・列挙値のバリデーションを検証する。
 */
import { describe, it, expect } from "vitest";

import {
  positionRecordSchema,
  formationRecordSchema,
} from "../../schemas/formationSchema";
import {
  glossaryTermSchema,
  glossaryRecordSchema,
} from "../../schemas/glossarySchema";
import { playerRecordSchema, teamRecordSchema } from "../../schemas/teamSchema";
import {
  movementRecordSchema,
  ballPassRecordSchema,
  tacticRecordSchema,
} from "../../schemas/tacticSchema";
import {
  manualItemSchema,
  manualSectionSchema,
  teamManualRecordSchema,
} from "../../schemas/teamManualSchema";

/* ================================================================== */
/*  formationSchema                                                    */
/* ================================================================== */

describe("formationSchema", () => {
  describe("positionRecordSchema", () => {
    const validPosition = { pos: "GK", x: 0, z: -4, cat: "gk" as const };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(positionRecordSchema.safeParse(validPosition).success).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validPosition };
      delete (missing as Record<string, unknown>).pos;
      expect(positionRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        positionRecordSchema.safeParse({ ...validPosition, x: "abc" }).success,
      ).toBe(false);
    });

    it("position category enum バリデーション — 有効な値", () => {
      for (const cat of ["gk", "df", "mf", "fw"] as const) {
        expect(
          positionRecordSchema.safeParse({ ...validPosition, cat }).success,
        ).toBe(true);
      }
    });

    it("position category enum バリデーション — 不正な値", () => {
      expect(
        positionRecordSchema.safeParse({ ...validPosition, cat: "st" }).success,
      ).toBe(false);
    });
  });

  describe("formationRecordSchema", () => {
    const validFormation = {
      id: "f-1",
      name: "4-4-2",
      type: "standard",
      positions: [{ pos: "GK", x: 0, z: -4, cat: "gk" }],
      roleMap: { GK: 0 },
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(formationRecordSchema.safeParse(validFormation).success).toBe(
        true,
      );
    });

    it("gameMode オプション付きでバリデーション成功", () => {
      expect(
        formationRecordSchema.safeParse({
          ...validFormation,
          gameMode: "futsal",
        }).success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validFormation };
      delete (missing as Record<string, unknown>).name;
      expect(formationRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("name が空文字列でバリデーション失敗", () => {
      expect(
        formationRecordSchema.safeParse({ ...validFormation, name: "" })
          .success,
      ).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        formationRecordSchema.safeParse({ ...validFormation, isCustom: "yes" })
          .success,
      ).toBe(false);
    });

    it("game mode enum バリデーション — 有効な値", () => {
      for (const mode of [
        "football",
        "futsal",
        "eight_aside",
        "society",
      ] as const) {
        expect(
          formationRecordSchema.safeParse({
            ...validFormation,
            gameMode: mode,
          }).success,
        ).toBe(true);
      }
    });

    it("game mode enum バリデーション — 不正な値", () => {
      expect(
        formationRecordSchema.safeParse({
          ...validFormation,
          gameMode: "basketball",
        }).success,
      ).toBe(false);
    });
  });
});

/* ================================================================== */
/*  glossarySchema                                                     */
/* ================================================================== */

describe("glossarySchema", () => {
  describe("glossaryTermSchema", () => {
    const validTerm = {
      id: "t-1",
      term: "オフサイド",
      description: "オフサイドの説明",
      keywords: ["offside", "反則"],
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(glossaryTermSchema.safeParse(validTerm).success).toBe(true);
    });

    it("reading オプション付きでバリデーション成功", () => {
      expect(
        glossaryTermSchema.safeParse({ ...validTerm, reading: "おふさいど" })
          .success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validTerm };
      delete (missing as Record<string, unknown>).term;
      expect(glossaryTermSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        glossaryTermSchema.safeParse({ ...validTerm, keywords: "string" })
          .success,
      ).toBe(false);
    });
  });

  describe("glossaryRecordSchema", () => {
    const validRecord = {
      id: "g-1",
      name: "基本用語集",
      description: "サッカーの基本用語",
      terms: [
        {
          id: "t-1",
          term: "オフサイド",
          description: "説明",
          keywords: ["offside"],
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(glossaryRecordSchema.safeParse(validRecord).success).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validRecord };
      delete (missing as Record<string, unknown>).name;
      expect(glossaryRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        glossaryRecordSchema.safeParse({ ...validRecord, createdAt: "now" })
          .success,
      ).toBe(false);
    });
  });
});

/* ================================================================== */
/*  teamSchema                                                         */
/* ================================================================== */

describe("teamSchema", () => {
  describe("playerRecordSchema", () => {
    const validPlayer = {
      id: "p-1",
      name: "選手A",
      number: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(playerRecordSchema.safeParse(validPlayer).success).toBe(true);
    });

    it("オプションフィールド付きでバリデーション成功", () => {
      expect(
        playerRecordSchema.safeParse({
          ...validPlayer,
          position: "mf",
          nationality: "Japan",
          club: "FC Test",
          status: "available",
        }).success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validPlayer };
      delete (missing as Record<string, unknown>).name;
      expect(playerRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        playerRecordSchema.safeParse({ ...validPlayer, number: "ten" }).success,
      ).toBe(false);
    });

    it("number が範囲外でバリデーション失敗", () => {
      expect(
        playerRecordSchema.safeParse({ ...validPlayer, number: 100 }).success,
      ).toBe(false);
      expect(
        playerRecordSchema.safeParse({ ...validPlayer, number: -1 }).success,
      ).toBe(false);
    });

    it("position category enum バリデーション — 有効な値", () => {
      for (const pos of ["gk", "df", "mf", "fw"] as const) {
        expect(
          playerRecordSchema.safeParse({ ...validPlayer, position: pos })
            .success,
        ).toBe(true);
      }
    });

    it("position category enum バリデーション — 不正な値", () => {
      expect(
        playerRecordSchema.safeParse({ ...validPlayer, position: "striker" })
          .success,
      ).toBe(false);
    });

    it("status enum バリデーション — 不正な値", () => {
      expect(
        playerRecordSchema.safeParse({ ...validPlayer, status: "retired" })
          .success,
      ).toBe(false);
    });
  });

  describe("teamRecordSchema", () => {
    const validTeam = {
      id: "team-1",
      name: "テストFC",
      subtitle: "サブタイトル",
      colors: { gk: "#ff0000", main: "#0000ff" },
      availableFormations: ["4-4-2"],
      flagType: "standard",
      headerGradient: "linear-gradient(#000, #fff)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(teamRecordSchema.safeParse(validTeam).success).toBe(true);
    });

    it("オプションフィールド付きでバリデーション成功", () => {
      expect(
        teamRecordSchema.safeParse({
          ...validTeam,
          country: "Japan",
          defaultFormation: "4-4-2",
          manager: "監督A",
          selectedSquad: ["p-1"],
        }).success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validTeam };
      delete (missing as Record<string, unknown>).name;
      expect(teamRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        teamRecordSchema.safeParse({ ...validTeam, colors: "red" }).success,
      ).toBe(false);
    });
  });
});

/* ================================================================== */
/*  tacticSchema                                                       */
/* ================================================================== */

describe("tacticSchema", () => {
  describe("movementRecordSchema", () => {
    const validMovement = {
      role: "CB1",
      targetX: 1.5,
      targetZ: -2.0,
      delay: 0,
      arrowColor: "#FF0000",
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(movementRecordSchema.safeParse(validMovement).success).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validMovement };
      delete (missing as Record<string, unknown>).role;
      expect(movementRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        movementRecordSchema.safeParse({ ...validMovement, delay: "fast" })
          .success,
      ).toBe(false);
    });

    it("role が空文字列でバリデーション失敗", () => {
      expect(
        movementRecordSchema.safeParse({ ...validMovement, role: "" }).success,
      ).toBe(false);
    });

    it("delay が負の値でバリデーション失敗", () => {
      expect(
        movementRecordSchema.safeParse({ ...validMovement, delay: -1 }).success,
      ).toBe(false);
    });

    it("hex color pattern バリデーション — 有効な6桁カラー", () => {
      expect(
        movementRecordSchema.safeParse({
          ...validMovement,
          arrowColor: "#aaBB00",
        }).success,
      ).toBe(true);
    });

    it("hex color pattern バリデーション — 有効な3桁カラー", () => {
      expect(
        movementRecordSchema.safeParse({
          ...validMovement,
          arrowColor: "#f0A",
        }).success,
      ).toBe(true);
    });

    it("hex color pattern バリデーション — #なしで失敗", () => {
      expect(
        movementRecordSchema.safeParse({
          ...validMovement,
          arrowColor: "FF0000",
        }).success,
      ).toBe(false);
    });

    it("hex color pattern バリデーション — 不正な文字で失敗", () => {
      expect(
        movementRecordSchema.safeParse({
          ...validMovement,
          arrowColor: "#GGGGGG",
        }).success,
      ).toBe(false);
    });

    it("hex color pattern バリデーション — 桁数不正で失敗", () => {
      expect(
        movementRecordSchema.safeParse({
          ...validMovement,
          arrowColor: "#FF00",
        }).success,
      ).toBe(false);
    });

    it("targetX/targetZ に Infinity で失敗", () => {
      expect(
        movementRecordSchema.safeParse({
          ...validMovement,
          targetX: Infinity,
        }).success,
      ).toBe(false);
    });
  });

  describe("ballPassRecordSchema", () => {
    const validPass = {
      startRole: "CB1",
      endRole: "MF1",
      delay: 0,
      color: "#00FF00",
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(ballPassRecordSchema.safeParse(validPass).success).toBe(true);
    });

    it("オプションフィールド付きでバリデーション成功", () => {
      expect(
        ballPassRecordSchema.safeParse({
          ...validPass,
          endX: 1.0,
          endZ: -2.0,
          startX: 0,
          startZ: 0,
          trajectoryType: "high",
        }).success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validPass };
      delete (missing as Record<string, unknown>).startRole;
      expect(ballPassRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        ballPassRecordSchema.safeParse({ ...validPass, delay: "slow" }).success,
      ).toBe(false);
    });

    it("hex color pattern バリデーション — 不正な値で失敗", () => {
      expect(
        ballPassRecordSchema.safeParse({ ...validPass, color: "red" }).success,
      ).toBe(false);
    });

    it("trajectoryType enum バリデーション — 有効な値", () => {
      for (const t of ["low", "high", "curveLeft", "curveRight"] as const) {
        expect(
          ballPassRecordSchema.safeParse({
            ...validPass,
            trajectoryType: t,
          }).success,
        ).toBe(true);
      }
    });

    it("trajectoryType enum バリデーション — 不正な値", () => {
      expect(
        ballPassRecordSchema.safeParse({
          ...validPass,
          trajectoryType: "straight",
        }).success,
      ).toBe(false);
    });
  });

  describe("tacticRecordSchema", () => {
    const validTactic = {
      id: "tactic-1",
      name: { ja: "プレスA" },
      icon: "press",
      phase: "defense",
      movements: {
        step1: [
          {
            role: "CB1",
            targetX: 1,
            targetZ: -2,
            delay: 0,
            arrowColor: "#FF0000",
          },
        ],
      },
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(tacticRecordSchema.safeParse(validTactic).success).toBe(true);
    });

    it("オプションフィールド付きでバリデーション成功", () => {
      expect(
        tacticRecordSchema.safeParse({
          ...validTactic,
          ballPasses: {
            step1: [
              {
                startRole: "CB1",
                endRole: "MF1",
                delay: 0,
                color: "#00FF00",
              },
            ],
          },
          ballPosition: { x: 0, z: 0 },
        }).success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validTactic };
      delete (missing as Record<string, unknown>).id;
      expect(tacticRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        tacticRecordSchema.safeParse({ ...validTactic, isCustom: 1 }).success,
      ).toBe(false);
    });

    it("movements 内の hex color が不正で失敗", () => {
      const bad = {
        ...validTactic,
        movements: {
          step1: [
            {
              role: "CB1",
              targetX: 1,
              targetZ: -2,
              delay: 0,
              arrowColor: "invalid",
            },
          ],
        },
      };
      expect(tacticRecordSchema.safeParse(bad).success).toBe(false);
    });
  });
});

/* ================================================================== */
/*  teamManualSchema                                                   */
/* ================================================================== */

describe("teamManualSchema", () => {
  describe("manualItemSchema", () => {
    const validItem = {
      id: "item-1",
      title: "攻撃パターン1",
      content: "説明文",
      linkedTacticIds: ["tactic-1"],
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(manualItemSchema.safeParse(validItem).success).toBe(true);
    });

    it("diagram オプション付きでバリデーション成功", () => {
      expect(
        manualItemSchema.safeParse({ ...validItem, diagram: "data:image/..." })
          .success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validItem };
      delete (missing as Record<string, unknown>).title;
      expect(manualItemSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        manualItemSchema.safeParse({
          ...validItem,
          linkedTacticIds: "tactic-1",
        }).success,
      ).toBe(false);
    });
  });

  describe("manualSectionSchema", () => {
    const validSection = {
      id: "sec-1",
      title: "攻撃セクション",
      category: "offense" as const,
      formations: ["4-4-2"],
      items: [
        {
          id: "item-1",
          title: "パターン1",
          content: "説明",
          linkedTacticIds: [],
        },
      ],
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(manualSectionSchema.safeParse(validSection).success).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validSection };
      delete (missing as Record<string, unknown>).category;
      expect(manualSectionSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        manualSectionSchema.safeParse({ ...validSection, formations: "4-4-2" })
          .success,
      ).toBe(false);
    });

    it("manual section category enum バリデーション — 有効な値", () => {
      const categories = [
        "offense",
        "defense",
        "positive_transition",
        "negative_transition",
        "set_piece",
        "position_task",
        "free_note",
      ] as const;
      for (const category of categories) {
        expect(
          manualSectionSchema.safeParse({ ...validSection, category }).success,
        ).toBe(true);
      }
    });

    it("manual section category enum バリデーション — 不正な値", () => {
      expect(
        manualSectionSchema.safeParse({
          ...validSection,
          category: "unknown_phase",
        }).success,
      ).toBe(false);
    });
  });

  describe("teamManualRecordSchema", () => {
    const validManual = {
      id: "manual-1",
      name: "チームマニュアル",
      description: "マニュアルの説明",
      sections: [
        {
          id: "sec-1",
          title: "攻撃",
          category: "offense",
          formations: [],
          items: [],
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("有効なレコードデータのバリデーション成功", () => {
      expect(teamManualRecordSchema.safeParse(validManual).success).toBe(true);
    });

    it("teamId オプション付きでバリデーション成功", () => {
      expect(
        teamManualRecordSchema.safeParse({
          ...validManual,
          teamId: "team-1",
        }).success,
      ).toBe(true);
    });

    it("必須フィールドの欠如でバリデーション失敗", () => {
      const missing = { ...validManual };
      delete (missing as Record<string, unknown>).name;
      expect(teamManualRecordSchema.safeParse(missing).success).toBe(false);
    });

    it("型の不正な値でバリデーション失敗", () => {
      expect(
        teamManualRecordSchema.safeParse({
          ...validManual,
          createdAt: "yesterday",
        }).success,
      ).toBe(false);
    });

    it("sections 内の category が不正で失敗", () => {
      const bad = {
        ...validManual,
        sections: [
          {
            id: "sec-1",
            title: "不正",
            category: "invalid_category",
            formations: [],
            items: [],
          },
        ],
      };
      expect(teamManualRecordSchema.safeParse(bad).success).toBe(false);
    });
  });
});
