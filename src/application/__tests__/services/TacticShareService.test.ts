/**
 * @module TacticShareService
 * @description 戦術のエクスポート/インポートサービスの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な変換ロジックのみ）
 * - export: JSON v1フォーマットへのシリアライズを検証
 * - import: JSONからのデシリアライズ、新ID生成を検証
 * - ラウンドトリップ: export→importでデータが劣化しないことを徹底検証
 *   （Movement/BallPass/多言語名/複数フォーメーション/連続変換）
 * - エッジケース: 空配列、0値、負座標、Unicode、不正データ
 */
import { describe, it, expect } from "vitest";
import { TacticShareService } from "../../services/TacticShareService";
import { Tactic } from "@domain/entities/Tactic";
import { ValidationError } from "@shared/errors/AppError";
import { Movement } from "@domain/entities/Movement";
import { BallPass } from "@domain/entities/BallPass";
import { Phase } from "@domain/value-objects/Phase";

/** テスト用の戦術を作成するヘルパー */
function createTestTactic(options?: {
  name?: Record<string, string>;
  icon?: string;
  phase?: Phase;
  withBallPasses?: boolean;
}): Tactic {
  const movements = new Map<string, Movement[]>();
  movements.set("4-4-2", [
    Movement.create("CF", 2.0, 3.0, 0, "#ef4444"),
    Movement.create("RW", 4.0, 1.0, 200, "#3b82f6"),
  ]);

  const ballPasses = new Map<string, BallPass[]>();
  if (options?.withBallPasses) {
    ballPasses.set("4-4-2", [
      BallPass.create({
        startRole: "CF",
        endRole: "RW",
        delay: 100,
        color: "#facc15",
      }),
      BallPass.create({
        startRole: "RW",
        endRole: "LW",
        delay: 300,
        color: "#22c55e",
        endX: 5.0,
        endZ: 2.0,
      }),
    ]);
  }

  return Tactic.create({
    name: options?.name ?? { ja: "テスト戦術", en: "Test Tactic" },
    icon: options?.icon ?? "⚽",
    phase: options?.phase ?? Phase.attack(),
    movements,
    ballPasses: ballPasses.size > 0 ? ballPasses : undefined,
  });
}

/** 複数フォーメーションにまたがる戦術を作成するヘルパー */
function createMultiFormationTactic(): Tactic {
  const movements = new Map<string, Movement[]>();
  movements.set("4-4-2", [
    Movement.create("CF", 2.0, 3.0, 0, "#ef4444"),
    Movement.create("RW", 4.0, 1.0, 200, "#3b82f6"),
  ]);
  movements.set("4-3-3", [
    Movement.create("ST", 1.0, 5.0, 100, "#10b981"),
    Movement.create("LW", -3.0, 2.0, 0, "#f59e0b"),
    Movement.create("RW", 3.0, 2.0, 50, "#8b5cf6"),
  ]);

  const ballPasses = new Map<string, BallPass[]>();
  ballPasses.set("4-4-2", [
    BallPass.create({
      startRole: "CF",
      endRole: "RW",
      delay: 100,
      color: "#facc15",
    }),
  ]);
  ballPasses.set("4-3-3", [
    BallPass.create({
      startRole: "ST",
      endRole: "LW",
      delay: 0,
      color: "#22c55e",
      endX: 5.0,
      endZ: 2.0,
    }),
    BallPass.create({
      startRole: "LW",
      endRole: "RW",
      delay: 200,
      color: "#ef4444",
    }),
  ]);

  return Tactic.create({
    name: { ja: "複数フォーメーション", en: "Multi Formation" },
    icon: "🎯",
    phase: Phase.attack(),
    movements,
    ballPasses,
  });
}

describe("TacticShareService", () => {
  describe("export", () => {
    it("戦術をJSON文字列にエクスポートできる", () => {
      const tactic = createTestTactic();
      const json = TacticShareService.export([tactic]);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe(1);
      expect(parsed.tactics).toHaveLength(1);
      expect(parsed.tactics[0].name).toEqual({
        ja: "テスト戦術",
        en: "Test Tactic",
      });
      expect(parsed.tactics[0].icon).toBe("⚽");
      expect(parsed.tactics[0].phase).toBe("attack");
    });

    it("移動データが正しくシリアライズされる", () => {
      const tactic = createTestTactic();
      const json = TacticShareService.export([tactic]);
      const parsed = JSON.parse(json);

      const movements = parsed.tactics[0].movements["4-4-2"];
      expect(movements).toHaveLength(2);
      expect(movements[0]).toEqual({
        role: "CF",
        targetX: 2.0,
        targetZ: 3.0,
        delay: 0,
        arrowColor: "#ef4444",
      });
    });

    it("ボールパスがある場合はシリアライズされる", () => {
      const tactic = createTestTactic({ withBallPasses: true });
      const json = TacticShareService.export([tactic]);
      const parsed = JSON.parse(json);

      expect(parsed.tactics[0].ballPasses).toBeDefined();
      const passes = parsed.tactics[0].ballPasses["4-4-2"];
      expect(passes).toHaveLength(2);
      expect(passes[0].startRole).toBe("CF");
      expect(passes[0].endRole).toBe("RW");
    });

    it("ボールパスがない場合はフィールドが省略される", () => {
      const tactic = createTestTactic({ withBallPasses: false });
      const json = TacticShareService.export([tactic]);
      const parsed = JSON.parse(json);

      expect(parsed.tactics[0].ballPasses).toBeUndefined();
    });

    it("カスタム終点座標がシリアライズされる", () => {
      const tactic = createTestTactic({ withBallPasses: true });
      const json = TacticShareService.export([tactic]);
      const parsed = JSON.parse(json);

      const pass = parsed.tactics[0].ballPasses["4-4-2"][1];
      expect(pass.endX).toBe(5.0);
      expect(pass.endZ).toBe(2.0);
    });

    it("複数の戦術をエクスポートできる", () => {
      const tactics = [
        createTestTactic({ name: { ja: "戦術1", en: "Tactic 1" } }),
        createTestTactic({
          name: { ja: "戦術2", en: "Tactic 2" },
          phase: Phase.defense(),
        }),
      ];
      const json = TacticShareService.export(tactics);
      const parsed = JSON.parse(json);

      expect(parsed.tactics).toHaveLength(2);
      expect(parsed.tactics[0].name.ja).toBe("戦術1");
      expect(parsed.tactics[1].name.ja).toBe("戦術2");
      expect(parsed.tactics[1].phase).toBe("defense");
    });

    it("空の戦術配列をエクスポートできる", () => {
      const json = TacticShareService.export([]);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe(1);
      expect(parsed.tactics).toHaveLength(0);
    });
  });

  describe("import", () => {
    it("エクスポートしたJSONをインポートできる（ラウンドトリップ）", () => {
      const original = createTestTactic({ withBallPasses: true });
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      expect(imported).toHaveLength(1);
      const tactic = imported[0];
      expect(tactic.getDisplayName("ja")).toBe("テスト戦術");
      expect(tactic.getDisplayName("en")).toBe("Test Tactic");
      expect(tactic.icon).toBe("⚽");
      expect(tactic.phase.value).toBe("attack");
      expect(tactic.isCustom).toBe(true);
    });

    it("インポート時に新しいIDが生成される", () => {
      const original = createTestTactic();
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      expect(imported[0].id.value).not.toBe(original.id.value);
    });

    it("移動データが正しく復元される", () => {
      const original = createTestTactic();
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      const movements = imported[0].getMovementsForFormation("4-4-2");
      expect(movements).toHaveLength(2);
      expect(movements[0].role).toBe("CF");
      expect(movements[0].targetX).toBe(2.0);
      expect(movements[0].targetZ).toBe(3.0);
    });

    it("ボールパスデータが正しく復元される", () => {
      const original = createTestTactic({ withBallPasses: true });
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      const passes = imported[0].getBallPassesForFormation("4-4-2");
      expect(passes).toHaveLength(2);
      expect(passes[0].startRole).toBe("CF");
      expect(passes[1].endX).toBe(5.0);
      expect(passes[1].endZ).toBe(2.0);
    });

    it("不正なJSONは ValidationError になる", () => {
      expect(() => TacticShareService.import("not json")).toThrow(
        ValidationError,
      );
    });

    it("versionがないJSONは ValidationError になる", () => {
      const json = JSON.stringify({ tactics: [] });
      expect(() => TacticShareService.import(json)).toThrow(ValidationError);
    });

    it("tacticsがないJSONは ValidationError になる", () => {
      const json = JSON.stringify({ version: 1 });
      expect(() => TacticShareService.import(json)).toThrow(ValidationError);
    });
  });

  // ── ラウンドトリップ完全性テスト ──
  describe("roundtrip completeness", () => {
    it("全Movement フィールドが export→import で完全一致する", () => {
      const original = createTestTactic();
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      const origMov = original.getMovementsForFormation("4-4-2");
      const impMov = imported[0].getMovementsForFormation("4-4-2");

      expect(impMov).toHaveLength(origMov.length);
      for (let i = 0; i < origMov.length; i++) {
        expect(impMov[i].role).toBe(origMov[i].role);
        expect(impMov[i].targetX).toBe(origMov[i].targetX);
        expect(impMov[i].targetZ).toBe(origMov[i].targetZ);
        expect(impMov[i].delay).toBe(origMov[i].delay);
        expect(impMov[i].arrowColor).toBe(origMov[i].arrowColor);
      }
    });

    it("全BallPass フィールドが export→import で完全一致する", () => {
      const original = createTestTactic({ withBallPasses: true });
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      const origPasses = original.getBallPassesForFormation("4-4-2");
      const impPasses = imported[0].getBallPassesForFormation("4-4-2");

      expect(impPasses).toHaveLength(origPasses.length);
      for (let i = 0; i < origPasses.length; i++) {
        expect(impPasses[i].startRole).toBe(origPasses[i].startRole);
        expect(impPasses[i].endRole).toBe(origPasses[i].endRole);
        expect(impPasses[i].delay).toBe(origPasses[i].delay);
        expect(impPasses[i].color).toBe(origPasses[i].color);
        expect(impPasses[i].endX).toBe(origPasses[i].endX);
        expect(impPasses[i].endZ).toBe(origPasses[i].endZ);
      }
    });

    it("複数フォーメーションの Movement が全て復元される", () => {
      const original = createMultiFormationTactic();
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      // 4-4-2 フォーメーション
      const mov442 = imported[0].getMovementsForFormation("4-4-2");
      expect(mov442).toHaveLength(2);
      expect(mov442[0].role).toBe("CF");
      expect(mov442[1].role).toBe("RW");

      // 4-3-3 フォーメーション
      const mov433 = imported[0].getMovementsForFormation("4-3-3");
      expect(mov433).toHaveLength(3);
      expect(mov433[0].role).toBe("ST");
      expect(mov433[1].role).toBe("LW");
      expect(mov433[2].role).toBe("RW");
    });

    it("複数フォーメーションの BallPass が全て復元される", () => {
      const original = createMultiFormationTactic();
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      const passes442 = imported[0].getBallPassesForFormation("4-4-2");
      expect(passes442).toHaveLength(1);
      expect(passes442[0].startRole).toBe("CF");

      const passes433 = imported[0].getBallPassesForFormation("4-3-3");
      expect(passes433).toHaveLength(2);
      expect(passes433[0].endX).toBe(5.0);
      expect(passes433[0].endZ).toBe(2.0);
      expect(passes433[1].startRole).toBe("LW");
    });

    it("多言語 name が export→import で完全一致する", () => {
      const original = createTestTactic({
        name: { ja: "ハイプレス", en: "High Press", es: "Presión alta" },
      });
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      expect(imported[0].name).toEqual({
        ja: "ハイプレス",
        en: "High Press",
        es: "Presión alta",
      });
      expect(imported[0].getDisplayName("ja")).toBe("ハイプレス");
      expect(imported[0].getDisplayName("en")).toBe("High Press");
      expect(imported[0].getDisplayName("es")).toBe("Presión alta");
    });

    it("複数タクティクスの一括 export→import でデータが保持される", () => {
      const tactics = [
        createTestTactic({
          name: { ja: "戦術A", en: "Tactic A" },
          phase: Phase.attack(),
          withBallPasses: true,
        }),
        createTestTactic({
          name: { ja: "戦術B", en: "Tactic B" },
          icon: "🛡️",
          phase: Phase.defense(),
          withBallPasses: false,
        }),
        createMultiFormationTactic(),
      ];

      const json = TacticShareService.export(tactics);
      const imported = TacticShareService.import(json);

      expect(imported).toHaveLength(3);

      // 戦術A: ballPasses あり
      expect(imported[0].getDisplayName("ja")).toBe("戦術A");
      expect(imported[0].phase.value).toBe("attack");
      expect(imported[0].getBallPassesForFormation("4-4-2")).toHaveLength(2);

      // 戦術B: ballPasses なし
      expect(imported[1].getDisplayName("ja")).toBe("戦術B");
      expect(imported[1].icon).toBe("🛡️");
      expect(imported[1].phase.value).toBe("defense");
      expect(imported[1].getBallPassesForFormation("4-4-2")).toHaveLength(0);

      // 戦術C: 複数フォーメーション
      expect(imported[2].getDisplayName("ja")).toBe("複数フォーメーション");
      expect(imported[2].getMovementsForFormation("4-3-3")).toHaveLength(3);
      expect(imported[2].getBallPassesForFormation("4-3-3")).toHaveLength(2);
    });

    it("全3フェーズが export→import で保持される", () => {
      const phases = [Phase.attack(), Phase.defense(), Phase.setPiece()];
      const tactics = phases.map((phase, i) =>
        createTestTactic({
          name: { ja: `フェーズ${i}`, en: `Phase${i}` },
          phase,
        }),
      );

      const json = TacticShareService.export(tactics);
      const imported = TacticShareService.import(json);

      expect(imported[0].phase.value).toBe("attack");
      expect(imported[1].phase.value).toBe("defense");
      expect(imported[2].phase.value).toBe("set_piece");
    });

    it("ballPasses なしのタクティクスが空Mapとして復元される", () => {
      const original = createTestTactic({ withBallPasses: false });
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      // ballPasses は空だが取得できる（エラーにならない）
      const passes = imported[0].getBallPassesForFormation("4-4-2");
      expect(passes).toHaveLength(0);
    });

    it("2回連続 export→import してもデータが劣化しない", () => {
      const original = createMultiFormationTactic();

      // 1回目
      const json1 = TacticShareService.export([original]);
      const imported1 = TacticShareService.import(json1);

      // 2回目（インポートしたものを再エクスポート）
      const json2 = TacticShareService.export(imported1);
      const imported2 = TacticShareService.import(json2);

      // データが同一であることを確認（IDは毎回変わる）
      const mov1 = imported1[0].getMovementsForFormation("4-3-3");
      const mov2 = imported2[0].getMovementsForFormation("4-3-3");
      expect(mov2).toHaveLength(mov1.length);
      for (let i = 0; i < mov1.length; i++) {
        expect(mov2[i].role).toBe(mov1[i].role);
        expect(mov2[i].targetX).toBe(mov1[i].targetX);
        expect(mov2[i].targetZ).toBe(mov1[i].targetZ);
        expect(mov2[i].delay).toBe(mov1[i].delay);
        expect(mov2[i].arrowColor).toBe(mov1[i].arrowColor);
      }

      const bp1 = imported1[0].getBallPassesForFormation("4-3-3");
      const bp2 = imported2[0].getBallPassesForFormation("4-3-3");
      expect(bp2).toHaveLength(bp1.length);
      for (let i = 0; i < bp1.length; i++) {
        expect(bp2[i].startRole).toBe(bp1[i].startRole);
        expect(bp2[i].endRole).toBe(bp1[i].endRole);
        expect(bp2[i].delay).toBe(bp1[i].delay);
        expect(bp2[i].color).toBe(bp1[i].color);
        expect(bp2[i].endX).toBe(bp1[i].endX);
        expect(bp2[i].endZ).toBe(bp1[i].endZ);
      }

      // name, icon, phase も一致
      expect(imported2[0].name).toEqual(imported1[0].name);
      expect(imported2[0].icon).toBe(imported1[0].icon);
      expect(imported2[0].phase.value).toBe(imported1[0].phase.value);
    });
  });

  // ── エッジケースとエラーハンドリング ──
  describe("edge cases", () => {
    it("movement が空のフォーメーションキーを含む戦術を処理できる", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", []);
      const tactic = Tactic.create({
        name: { ja: "空", en: "Empty" },
        icon: "⚽",
        phase: Phase.attack(),
        movements,
      });

      const json = TacticShareService.export([tactic]);
      const imported = TacticShareService.import(json);
      expect(imported[0].getMovementsForFormation("4-4-2")).toHaveLength(0);
    });

    it("delay=0 の Movement が正しくラウンドトリップする", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("CF", 0, 0, 0, "#000000")]);
      const tactic = Tactic.create({
        name: { ja: "ゼロ", en: "Zero" },
        icon: "⚽",
        phase: Phase.attack(),
        movements,
      });

      const json = TacticShareService.export([tactic]);
      const imported = TacticShareService.import(json);
      const mov = imported[0].getMovementsForFormation("4-4-2");
      expect(mov[0].delay).toBe(0);
      expect(mov[0].targetX).toBe(0);
      expect(mov[0].targetZ).toBe(0);
    });

    it("負の座標値が正しくラウンドトリップする", () => {
      const movements = new Map<string, Movement[]>();
      movements.set("4-4-2", [Movement.create("LW", -5.5, -3.2, 0, "#000")]);
      const tactic = Tactic.create({
        name: { ja: "負座標", en: "Negative" },
        icon: "⚽",
        phase: Phase.attack(),
        movements,
      });

      const json = TacticShareService.export([tactic]);
      const imported = TacticShareService.import(json);
      const mov = imported[0].getMovementsForFormation("4-4-2");
      expect(mov[0].targetX).toBe(-5.5);
      expect(mov[0].targetZ).toBe(-3.2);
    });

    it("movement の delay が負だとインポート時にエラーになる", () => {
      const json = JSON.stringify({
        version: 1,
        tactics: [
          {
            name: { ja: "不正", en: "Invalid" },
            icon: "⚽",
            phase: "attack",
            movements: {
              "4-4-2": [
                {
                  role: "CF",
                  targetX: 0,
                  targetZ: 0,
                  delay: -1,
                  arrowColor: "#000",
                },
              ],
            },
          },
        ],
      });

      expect(() => TacticShareService.import(json)).toThrow();
    });

    it("不正な phase 文字列はエラーになる", () => {
      const json = JSON.stringify({
        version: 1,
        tactics: [
          {
            name: { ja: "不正", en: "Invalid" },
            icon: "⚽",
            phase: "invalid_phase",
            movements: {},
          },
        ],
      });

      expect(() => TacticShareService.import(json)).toThrow();
    });

    it("Unicode 特殊文字を含む name がラウンドトリップする", () => {
      const original = createTestTactic({
        name: { ja: "🔥ハイプレス⚡", en: "High Press 🎯" },
        icon: "🏟️",
      });
      const json = TacticShareService.export([original]);
      const imported = TacticShareService.import(json);

      expect(imported[0].getDisplayName("ja")).toBe("🔥ハイプレス⚡");
      expect(imported[0].getDisplayName("en")).toBe("High Press 🎯");
      expect(imported[0].icon).toBe("🏟️");
    });
  });
});
