/**
 * @module team-import スキーマテスト
 * @description チームインポート用Zodスキーマの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なZodスキーマバリデーション）
 * - 最小限データへのデフォルト値適用（色・フォーメーション・旗等）を検証
 * - 選手データの変換・バリデーション（位置・カテゴリ・オプショナル項目）
 * - 不正データ拒否のバリデーションエラー検証
 */
import { describe, it, expect } from "vitest";
import { teamImportDataSchema } from "@application/schemas/teamImportSchema";

describe("Team import validation", () => {
  describe("defaults", () => {
    it("最小限のデータにデフォルト値が適用される", () => {
      const result = teamImportDataSchema.parse({ name: "FC Test" });

      expect(result.name).toBe("FC Test");
      expect(result.subtitle).toBe("");
      expect(result.colors.gk).toBe("#FFD700");
      expect(result.availableFormations).toEqual(["4-3-3"]);
      expect(result.flagType).toBe("japan");
      expect(result.headerGradient).toBe(
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      );
    });

    it("colors を省略するとデフォルト gk カラーが適用される", () => {
      const result = teamImportDataSchema.parse({ name: "Test" });
      expect(result.colors).toEqual({ gk: "#FFD700" });
    });

    it("colors.gk を省略するとデフォルト値が適用される", () => {
      const result = teamImportDataSchema.parse({
        name: "Test",
        colors: { main: "#0000FF" },
      });
      expect(result.colors.gk).toBe("#FFD700");
      expect(result.colors.main).toBe("#0000FF");
    });

    it("players の position デフォルトは mf", () => {
      const result = teamImportDataSchema.parse({
        name: "Test",
        players: [{ name: "Player 1", number: 10 }],
      });
      expect(result.players![0].position).toBe("mf");
    });
  });

  describe("full data", () => {
    it("全フィールドを含むチームデータをパースできる", () => {
      const data = {
        name: "Real FC",
        subtitle: "The Best",
        country: "Spain",
        colors: { gk: "#FFD700", main: "#FFFFFF" },
        availableFormations: ["4-3-3", "4-4-2", "3-5-2"],
        defaultFormation: "4-3-3",
        flagType: "spain",
        headerGradient: "linear-gradient(135deg, #fff 0%, #000 100%)",
        manager: "Coach Name",
        availableTactics: {
          attack: ["tiki-taka"],
          defense: ["high-press"],
        },
        players: [
          { name: "GK Player", number: 1, position: "gk" as const },
          {
            name: "Midfielder",
            number: 8,
            position: "mf" as const,
            nationality: "Brazil",
            club: "FC Example",
            leagueCountry: "Spain",
          },
        ],
      };

      const result = teamImportDataSchema.parse(data);
      expect(result.name).toBe("Real FC");
      expect(result.manager).toBe("Coach Name");
      expect(result.players).toHaveLength(2);
      expect(result.players![0].position).toBe("gk");
      expect(result.players![1].nationality).toBe("Brazil");
      expect(result.availableTactics).toEqual({
        attack: ["tiki-taka"],
        defense: ["high-press"],
      });
    });
  });

  describe("player validation", () => {
    it("全ポジション（gk/df/mf/fw）が有効", () => {
      const positions = ["gk", "df", "mf", "fw"] as const;
      for (const pos of positions) {
        const result = teamImportDataSchema.parse({
          name: "Test",
          players: [{ name: "Player", number: 1, position: pos }],
        });
        expect(result.players![0].position).toBe(pos);
      }
    });

    it("不正な position はエラーになる", () => {
      expect(() =>
        teamImportDataSchema.parse({
          name: "Test",
          players: [{ name: "Player", number: 1, position: "st" }],
        }),
      ).toThrow();
    });

    it("背番号 0 は有効", () => {
      const result = teamImportDataSchema.parse({
        name: "Test",
        players: [{ name: "Player", number: 0 }],
      });
      expect(result.players![0].number).toBe(0);
    });

    it("背番号 99 は有効", () => {
      const result = teamImportDataSchema.parse({
        name: "Test",
        players: [{ name: "Player", number: 99 }],
      });
      expect(result.players![0].number).toBe(99);
    });

    it("背番号 100 はエラーになる", () => {
      expect(() =>
        teamImportDataSchema.parse({
          name: "Test",
          players: [{ name: "Player", number: 100 }],
        }),
      ).toThrow();
    });

    it("背番号 -1 はエラーになる", () => {
      expect(() =>
        teamImportDataSchema.parse({
          name: "Test",
          players: [{ name: "Player", number: -1 }],
        }),
      ).toThrow();
    });

    it("背番号が小数だとエラーになる", () => {
      expect(() =>
        teamImportDataSchema.parse({
          name: "Test",
          players: [{ name: "Player", number: 10.5 }],
        }),
      ).toThrow();
    });
  });

  describe("error cases", () => {
    it("name が空文字だとエラーになる", () => {
      expect(() => teamImportDataSchema.parse({ name: "" })).toThrow();
    });

    it("name がないとエラーになる", () => {
      expect(() => teamImportDataSchema.parse({})).toThrow();
    });

    it("name が数値だとエラーになる", () => {
      expect(() => teamImportDataSchema.parse({ name: 123 })).toThrow();
    });

    it("players が配列でないとエラーになる", () => {
      expect(() =>
        teamImportDataSchema.parse({ name: "Test", players: "invalid" }),
      ).toThrow();
    });

    it("player に name がないとエラーになる", () => {
      expect(() =>
        teamImportDataSchema.parse({
          name: "Test",
          players: [{ number: 10 }],
        }),
      ).toThrow();
    });

    it("player に number がないとエラーになる", () => {
      expect(() =>
        teamImportDataSchema.parse({
          name: "Test",
          players: [{ name: "Player" }],
        }),
      ).toThrow();
    });
  });

  describe("bulk import (array)", () => {
    it("配列で複数チームをパースできる", () => {
      const teams = [
        { name: "Team A", colors: { gk: "#FFF", main: "#F00" } },
        { name: "Team B", players: [{ name: "P1", number: 7 }] },
      ];

      const results = teams.map((t) => teamImportDataSchema.parse(t));
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe("Team A");
      expect(results[0].colors.main).toBe("#F00");
      expect(results[1].name).toBe("Team B");
      expect(results[1].players![0].number).toBe(7);
    });
  });
});
