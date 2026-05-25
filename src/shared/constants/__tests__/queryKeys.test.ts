/**
 * @module queryKeys
 * @description クエリキーファクトリ関数の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な定数とファクトリ関数のみ）
 * - 各ドメインの all / detail / byType / byPhase 等のキーが正しいタプルを返すことを検証
 */
import { describe, it, expect } from "vitest";
import { queryKeys } from "../queryKeys";

describe("queryKeys", () => {
  // ── teams ──

  describe("teams", () => {
    it('all は ["teams"] を返す', () => {
      expect(queryKeys.teams.all).toEqual(["teams"]);
    });

    it('detail(id) は ["teams", id] を返す', () => {
      expect(queryKeys.teams.detail("team-1")).toEqual(["teams", "team-1"]);
    });
  });

  // ── formations ──

  describe("formations", () => {
    it('all は ["formations"] を返す', () => {
      expect(queryKeys.formations.all).toEqual(["formations"]);
    });

    it('detail(id) は ["formations", id] を返す', () => {
      expect(queryKeys.formations.detail("f-1")).toEqual(["formations", "f-1"]);
    });

    it('byType(type) は ["formations", "type", type] を返す', () => {
      expect(queryKeys.formations.byType("4-4-2")).toEqual([
        "formations",
        "type",
        "4-4-2",
      ]);
    });
  });

  // ── tactics ──

  describe("tactics", () => {
    it('all は ["tactics"] を返す', () => {
      expect(queryKeys.tactics.all).toEqual(["tactics"]);
    });

    it('detail(id) は ["tactics", id] を返す', () => {
      expect(queryKeys.tactics.detail("t-1")).toEqual(["tactics", "t-1"]);
    });

    it('byPhase(phase) は ["tactics", "phase", phase] を返す', () => {
      expect(queryKeys.tactics.byPhase("attack")).toEqual([
        "tactics",
        "phase",
        "attack",
      ]);
    });

    it('byPhaseAndFormation(phase, formation) は ["tactics", "phase", phase, "formation", formation] を返す', () => {
      expect(queryKeys.tactics.byPhaseAndFormation("defense", "4-3-3")).toEqual(
        ["tactics", "phase", "defense", "formation", "4-3-3"],
      );
    });
  });

  // ── preferences ──

  describe("preferences", () => {
    it('current は ["preferences"] を返す', () => {
      expect(queryKeys.preferences.current).toEqual(["preferences"]);
    });
  });

  // ── glossaries ──

  describe("glossaries", () => {
    it('all は ["glossaries"] を返す', () => {
      expect(queryKeys.glossaries.all).toEqual(["glossaries"]);
    });

    it('detail(id) は ["glossaries", id] を返す', () => {
      expect(queryKeys.glossaries.detail("g-1")).toEqual(["glossaries", "g-1"]);
    });
  });

  // ── teamManuals ──

  describe("teamManuals", () => {
    it('all は ["teamManuals"] を返す', () => {
      expect(queryKeys.teamManuals.all).toEqual(["teamManuals"]);
    });

    it('detail(id) は ["teamManuals", id] を返す', () => {
      expect(queryKeys.teamManuals.detail("tm-1")).toEqual([
        "teamManuals",
        "tm-1",
      ]);
    });
  });
});
