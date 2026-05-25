/**
 * @module schemas（Zodスキーマ）
 * @description 永続化レコードおよびインポート/エクスポート用Zodスキーマの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なZodスキーマバリデーション）
 * - 各スキーマ（tactic / team / formation / glossary / export）の正常系・異常系を網羅
 * - 必須フィールド欠落、型不一致、境界値のバリデーションエラーを検証
 * - デフォルト値の適用やオプショナルフィールドの扱いを検証
 */
import { describe, it, expect } from "vitest";
import {
  movementRecordSchema,
  ballPassRecordSchema,
  tacticRecordSchema,
} from "../tacticSchema";
import { tacticExportDataSchema } from "@application/schemas/tacticExportSchema";
import { playerRecordSchema, teamRecordSchema } from "../teamSchema";
import { teamImportDataSchema } from "@application/schemas/teamImportSchema";
import {
  positionRecordSchema,
  formationRecordSchema,
} from "../formationSchema";
import { glossaryTermSchema, glossaryRecordSchema } from "../glossarySchema";
import { glossaryImportSchema } from "@application/schemas/glossaryImportSchema";

describe("tacticSchema", () => {
  describe("movementRecordSchema", () => {
    it("有効な移動レコードをパースできる", () => {
      const record = {
        role: "CF",
        targetX: 2.0,
        targetZ: 3.0,
        delay: 0,
        arrowColor: "#ef4444",
      };
      expect(movementRecordSchema.parse(record)).toEqual(record);
    });

    it("delay が負の値だとエラーになる", () => {
      expect(() =>
        movementRecordSchema.parse({
          role: "CF",
          targetX: 0,
          targetZ: 0,
          delay: -1,
          arrowColor: "#000",
        }),
      ).toThrow();
    });

    it("必須フィールドがないとエラーになる", () => {
      expect(() => movementRecordSchema.parse({ role: "CF" })).toThrow();
    });
  });

  describe("ballPassRecordSchema", () => {
    it("有効なボールパスレコードをパースできる", () => {
      const record = {
        startRole: "CF",
        endRole: "RW",
        delay: 100,
        color: "#facc15",
      };
      expect(ballPassRecordSchema.parse(record)).toEqual(record);
    });

    it("オプションフィールドをパースできる", () => {
      const record = {
        startRole: "CF",
        endRole: "RW",
        delay: 0,
        color: "#000",
        endX: 5.0,
        endZ: 2.0,
        startX: 1.0,
        startZ: 1.0,
        trajectoryType: "high",
      };
      expect(ballPassRecordSchema.parse(record)).toEqual(record);
    });
  });

  describe("tacticRecordSchema", () => {
    it("有効な戦術レコードをパースできる", () => {
      const record = {
        id: "tactic-1",
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: "attack",
        movements: {
          "4-3-3": [
            {
              role: "CF",
              targetX: 2,
              targetZ: 3,
              delay: 0,
              arrowColor: "#ff0000",
            },
          ],
        },
        isCustom: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(tacticRecordSchema.parse(record)).toEqual(record);
    });

    it("ballPasses がオプションでパースできる", () => {
      const record = {
        id: "tactic-1",
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: "attack",
        movements: {},
        ballPasses: {
          "4-3-3": [
            {
              startRole: "CF",
              endRole: "RW",
              delay: 0,
              color: "#000",
            },
          ],
        },
        isCustom: true,
        createdAt: 0,
        updatedAt: 0,
      };
      expect(tacticRecordSchema.parse(record).ballPasses).toBeDefined();
    });

    it("不正な型はエラーになる", () => {
      expect(() => tacticRecordSchema.parse({ id: 123, name: true })).toThrow();
    });
  });

  describe("tacticExportDataSchema", () => {
    it("有効なエクスポートデータをパースできる", () => {
      const data = {
        version: 1,
        tactics: [
          {
            name: { ja: "テスト", en: "Test" },
            icon: "⚽",
            phase: "attack",
            movements: {
              "4-4-2": [
                {
                  role: "CF",
                  targetX: 1,
                  targetZ: 2,
                  delay: 0,
                  arrowColor: "#ff0000",
                },
              ],
            },
          },
        ],
      };
      const result = tacticExportDataSchema.parse(data);
      expect(result.version).toBe(1);
      expect(result.tactics).toHaveLength(1);
    });

    it("空の戦術配列をパースできる", () => {
      const data = { version: 1, tactics: [] };
      expect(tacticExportDataSchema.parse(data).tactics).toHaveLength(0);
    });

    it("version がないとエラーになる", () => {
      expect(() => tacticExportDataSchema.parse({ tactics: [] })).toThrow();
    });

    it("tactics がないとエラーになる", () => {
      expect(() => tacticExportDataSchema.parse({ version: 1 })).toThrow();
    });
  });
});

describe("teamSchema", () => {
  describe("playerRecordSchema", () => {
    it("有効な選手レコードをパースできる", () => {
      const record = {
        id: "player-1",
        name: "Test Player",
        number: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(playerRecordSchema.parse(record)).toEqual(record);
    });

    it("オプションフィールドをパースできる", () => {
      const record = {
        id: "player-1",
        name: "Test",
        number: 1,
        position: "gk" as const,
        createdAt: 0,
        updatedAt: 0,
        nationality: "Japan",
        club: "FC Test",
        imageUrl: "https://example.com/img.png",
      };
      expect(playerRecordSchema.parse(record).position).toBe("gk");
    });

    it("背番号が 0-99 の範囲外だとエラーになる", () => {
      expect(() =>
        playerRecordSchema.parse({
          id: "p",
          name: "Test",
          number: 100,
          createdAt: 0,
          updatedAt: 0,
        }),
      ).toThrow();
    });

    it("position が不正な値だとエラーになる", () => {
      expect(() =>
        playerRecordSchema.parse({
          id: "p",
          name: "Test",
          number: 1,
          position: "invalid",
          createdAt: 0,
          updatedAt: 0,
        }),
      ).toThrow();
    });
  });

  describe("teamRecordSchema", () => {
    const validTeam = {
      id: "team-1",
      name: "Test FC",
      subtitle: "Sub",
      colors: { gk: "#FFD700", main: "#1E90FF" },
      availableFormations: ["4-3-3"],
      flagType: "japan",
      headerGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("有効なチームレコードをパースできる", () => {
      expect(teamRecordSchema.parse(validTeam)).toEqual(validTeam);
    });

    it("players 配列をパースできる", () => {
      const withPlayers = {
        ...validTeam,
        players: [
          {
            id: "p1",
            name: "Player 1",
            number: 10,
            createdAt: 0,
            updatedAt: 0,
          },
        ],
      };
      expect(teamRecordSchema.parse(withPlayers).players).toHaveLength(1);
    });
  });

  describe("teamImportDataSchema", () => {
    it("最小限のデータでパースできる（デフォルト値が適用される）", () => {
      const result = teamImportDataSchema.parse({ name: "Test FC" });
      expect(result.name).toBe("Test FC");
      expect(result.subtitle).toBe("");
      expect(result.availableFormations).toEqual(["4-3-3"]);
      expect(result.flagType).toBe("japan");
      expect(result.colors.gk).toBe("#FFD700");
    });

    it("name が空文字だとエラーになる", () => {
      expect(() => teamImportDataSchema.parse({ name: "" })).toThrow();
    });

    it("name がないとエラーになる", () => {
      expect(() => teamImportDataSchema.parse({})).toThrow();
    });

    it("完全なデータをパースできる", () => {
      const data = {
        name: "Test FC",
        subtitle: "Example",
        country: "Japan",
        colors: { gk: "#FFD700", main: "#1E90FF" },
        availableFormations: ["4-3-3", "4-4-2"],
        defaultFormation: "4-3-3",
        flagType: "jp",
        manager: "Coach",
        players: [
          { name: "Player 1", number: 1, position: "gk" },
          { name: "Player 2", number: 10 },
        ],
      };
      const result = teamImportDataSchema.parse(data);
      expect(result.players).toHaveLength(2);
      expect(result.players![1].position).toBe("mf");
    });
  });
});

describe("formationSchema", () => {
  describe("positionRecordSchema", () => {
    it("有効なポジションレコードをパースできる", () => {
      const record = { pos: "GK", x: 0, z: -4, cat: "gk" as const };
      expect(positionRecordSchema.parse(record)).toEqual(record);
    });

    it("cat が不正な値だとエラーになる", () => {
      expect(() =>
        positionRecordSchema.parse({ pos: "GK", x: 0, z: 0, cat: "st" }),
      ).toThrow();
    });
  });

  describe("formationRecordSchema", () => {
    it("有効なフォーメーションレコードをパースできる", () => {
      const record = {
        id: "f1",
        name: "4-3-3",
        type: "football",
        positions: [{ pos: "GK", x: 0, z: -4, cat: "gk" as const }],
        roleMap: { GK: 0 },
        isCustom: false,
        createdAt: 0,
        updatedAt: 0,
      };
      expect(formationRecordSchema.parse(record)).toEqual(record);
    });

    it("gameMode がオプションでパースできる", () => {
      const record = {
        id: "f1",
        name: "2-2",
        type: "futsal",
        positions: [],
        roleMap: {},
        isCustom: false,
        gameMode: "futsal" as const,
        createdAt: 0,
        updatedAt: 0,
      };
      expect(formationRecordSchema.parse(record).gameMode).toBe("futsal");
    });

    it("不正な gameMode だとエラーになる", () => {
      expect(() =>
        formationRecordSchema.parse({
          id: "f1",
          name: "test",
          type: "test",
          positions: [],
          roleMap: {},
          isCustom: false,
          gameMode: "invalid",
          createdAt: 0,
          updatedAt: 0,
        }),
      ).toThrow();
    });
  });
});

describe("glossarySchema", () => {
  describe("glossaryTermSchema", () => {
    it("有効な用語をパースできる", () => {
      const term = {
        id: "t1",
        term: "プレス",
        description: "相手にプレッシャーをかける",
        keywords: ["守備", "戦術"],
      };
      expect(glossaryTermSchema.parse(term)).toEqual(term);
    });

    it("reading がオプションでパースできる", () => {
      const term = {
        id: "t1",
        term: "テスト",
        reading: "てすと",
        description: "説明",
        keywords: [],
      };
      expect(glossaryTermSchema.parse(term).reading).toBe("てすと");
    });
  });

  describe("glossaryRecordSchema", () => {
    it("有効な用語集レコードをパースできる", () => {
      const record = {
        id: "g1",
        name: "サッカー用語",
        description: "基本用語集",
        terms: [
          {
            id: "t1",
            term: "オフサイド",
            description: "説明",
            keywords: ["ルール"],
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(glossaryRecordSchema.parse(record).terms).toHaveLength(1);
    });
  });

  describe("glossaryImportSchema", () => {
    it("最小限のデータでパースできる（デフォルト値が適用される）", () => {
      const result = glossaryImportSchema.parse({});
      expect(result.name).toBe("Untitled");
      expect(result.description).toBe("");
      expect(result.terms).toEqual([]);
    });

    it("用語付きデータをパースできる", () => {
      const data = {
        name: "My Glossary",
        terms: [
          {
            term: "Press",
            description: "Apply pressure",
            keywords: ["defense"],
          },
        ],
      };
      const result = glossaryImportSchema.parse(data);
      expect(result.terms).toHaveLength(1);
      expect(result.terms[0].term).toBe("Press");
    });
  });
});
