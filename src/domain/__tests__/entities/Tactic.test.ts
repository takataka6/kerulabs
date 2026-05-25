/**
 * @module Tactic エンティティ
 * @description Tacticドメインエンティティの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なドメインロジックのみ）
 * - カスタム戦術とデフォルト戦術（isCustomフラグ）の生成を検証
 * - 多言語対応の表示名（getDisplayName）とフォールバックロジック
 * - フォーメーション別の移動・ボールパス取得
 * - フォーメーションサポート判定（supportsFormation）
 */
import { describe, it, expect } from "vitest";
import { Tactic } from "../../entities/Tactic";
import { Movement } from "../../entities/Movement";
import { BallPass } from "../../entities/BallPass";
import { Phase } from "../../value-objects/Phase";
import { TacticId } from "@domain/value-objects";

describe("Tactic", () => {
  const createMovements = () => {
    const map = new Map<string, Movement[]>();
    map.set("4-4-2", [
      Movement.create("CF", 2.0, 3.0, 0),
      Movement.create("RW", 4.0, 1.0, 100),
    ]);
    return map;
  };

  describe("create", () => {
    it("カスタム戦術を作成できる", () => {
      const movements = createMovements();
      const tactic = Tactic.create({
        name: { ja: "テスト戦術", en: "Test Tactic" },
        icon: "⚽",
        phase: Phase.attack(),
        movements,
      });
      expect(tactic.getDisplayName("ja")).toBe("テスト戦術");
      expect(tactic.getDisplayName("en")).toBe("Test Tactic");
      expect(tactic.icon).toBe("⚽");
      expect(tactic.phase.value).toBe("attack");
      expect(tactic.isCustom).toBe(true);
      expect(tactic.id.value).toBeTruthy();
    });

    it("ボールパス付きで作成できる", () => {
      const movements = createMovements();
      const ballPasses = new Map<string, BallPass[]>();
      ballPasses.set("4-4-2", [
        BallPass.create({ startRole: "CF", endRole: "RW", delay: 50 }),
      ]);

      const tactic = Tactic.create({
        name: { ja: "パス戦術", en: "Pass Tactic" },
        icon: "🎯",
        phase: Phase.attack(),
        movements,
        ballPasses,
      });
      expect(tactic.ballPasses.size).toBe(1);
    });
  });

  describe("createDefault", () => {
    it("デフォルト戦術を作成できる（isCustom=false）", () => {
      const movements = createMovements();
      const tactic = Tactic.createDefault(new TacticId("default-1"), {
        name: { ja: "デフォルト", en: "Default" },
        icon: "⚽",
        phase: Phase.attack(),
        movements,
      });
      expect(tactic.id.value).toBe("default-1");
      expect(tactic.isCustom).toBe(false);
    });
  });

  describe("getDisplayName", () => {
    it("指定した言語の名前を返す", () => {
      const tactic = Tactic.create({
        name: { ja: "日本語名", en: "English Name" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(tactic.getDisplayName("ja")).toBe("日本語名");
      expect(tactic.getDisplayName("en")).toBe("English Name");
    });

    it("存在しない言語の場合はenにフォールバック", () => {
      const tactic = Tactic.create({
        name: { ja: "日本語名", en: "English Name" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(tactic.getDisplayName("fr")).toBe("English Name");
    });

    it("enもない場合はjaにフォールバック", () => {
      const tactic = Tactic.create({
        name: { ja: "日本語名" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(tactic.getDisplayName("fr")).toBe("日本語名");
    });
  });

  describe("getMovementsForFormation", () => {
    it("フォーメーション別の移動を取得できる", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      const movements = tactic.getMovementsForFormation("4-4-2");
      expect(movements).toHaveLength(2);
    });

    it("存在しないフォーメーションは空配列", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(tactic.getMovementsForFormation("3-5-2")).toEqual([]);
    });
  });

  describe("getBallPassesForFormation", () => {
    it("フォーメーション別のボールパスを取得できる", () => {
      const ballPasses = new Map<string, BallPass[]>();
      ballPasses.set("4-4-2", [
        BallPass.create({ startRole: "CF", endRole: "RW" }),
      ]);

      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
        ballPasses,
      });
      expect(tactic.getBallPassesForFormation("4-4-2")).toHaveLength(1);
    });

    it("存在しないフォーメーションは空配列", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(tactic.getBallPassesForFormation("3-5-2")).toEqual([]);
    });
  });

  describe("supportsFormation", () => {
    it("サポートするフォーメーションはtrue", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(tactic.supportsFormation("4-4-2")).toBe(true);
    });

    it("サポートしないフォーメーションはfalse", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(tactic.supportsFormation("3-5-2")).toBe(false);
    });
  });

  describe("updateName", () => {
    it("名前を更新できる", () => {
      const tactic = Tactic.create({
        name: { ja: "旧名前", en: "Old Name" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      tactic.updateName({ ja: "新名前", en: "New Name" });
      expect(tactic.getDisplayName("ja")).toBe("新名前");
      expect(tactic.getDisplayName("en")).toBe("New Name");
    });

    it("更新日時が変わる", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      const before = tactic.updatedAt;
      tactic.updateName({ ja: "新名前", en: "New" });
      expect(tactic.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it("空のname objectはエラーになる", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(() => tactic.updateName({})).toThrow(
        "Tactic name must have at least one language entry",
      );
    });
  });

  describe("updateIcon", () => {
    it("アイコンを更新できる", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      tactic.updateIcon("🎯");
      expect(tactic.icon).toBe("🎯");
    });

    it("空文字のアイコンはエラーになる", () => {
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements: createMovements(),
      });
      expect(() => tactic.updateIcon("")).toThrow(
        "Tactic icon cannot be empty",
      );
    });
  });
});
