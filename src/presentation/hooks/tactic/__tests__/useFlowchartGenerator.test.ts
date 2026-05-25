/**
 * @module useFlowchartGenerator フック
 * @description 戦術フローチャート生成フックの単体テスト
 *
 * テスト方針:
 * - 翻訳関数（t / tDynamic）をvi.fnでモック化
 * - フォーメーションとタクティクスからMermaid形式のフローチャートを生成する処理を検証
 * - タクティクスなし・フォーメーションなし等のエッジケースを検証
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFlowchartGenerator } from "../useFlowchartGenerator";
import type { Tactic } from "@domain/entities/Tactic";
import type { Formation, FormationPosition } from "@domain/entities/Formation";
import { FormationId } from "@domain/value-objects/FormationId";
import { Position } from "@domain/value-objects/Position";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);
const mockTDynamic = vi.fn((key: string) => key);

function createMockFormation(): Formation {
  const positions: FormationPosition[] = [
    { pos: "GK", position: Position.create(0, 0), category: "gk" },
    { pos: "CB", position: Position.create(-2, 3), category: "df" },
    { pos: "CM", position: Position.create(0, 5), category: "mf" },
    { pos: "CF", position: Position.create(0, 8), category: "fw" },
  ];

  const roleMap = new Map<string, number>();
  positions.forEach((pos, index) => roleMap.set(pos.pos, index));

  return {
    id: new FormationId("fm-1"),
    name: "4-3-3",
    type: "football",
    positions,
    roleMap,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    gameMode: "football",
    getPlayerIndexByRole: (role: string) => roleMap.get(role),
    getPositionByIndex: (index: number) => positions[index],
  } as Formation;
}

function createMockTactic(overrides?: {
  id?: string;
  movements?: Array<{
    role: string;
    delay: number;
    arrowColor: string;
    targetX: number;
    targetZ: number;
  }>;
  ballPasses?: Array<{
    startRole: string;
    endRole: string;
    delay: number;
    color: string;
  }>;
  isCustom?: boolean;
  nameJa?: string;
}): Tactic {
  const movements = overrides?.movements ?? [];
  const ballPasses = overrides?.ballPasses ?? [];

  return {
    id: overrides?.id ?? "tactic-1",
    isCustom: overrides?.isCustom ?? false,
    phase: { value: "attack" },
    getDisplayName: () => overrides?.nameJa ?? "カスタム戦術",
    getMovementsForFormation: () => movements,
    getBallPassesForFormation: () => ballPasses,
    supportsFormation: () => true,
  } as unknown as Tactic;
}

function renderFlowchartGenerator(overrides?: {
  activeTactic?: Tactic | undefined;
  currentFormation?: Formation | undefined;
}) {
  return renderHook(() =>
    useFlowchartGenerator({
      activeTactic: overrides?.activeTactic ?? createMockTactic(),
      currentFormation: overrides?.currentFormation ?? createMockFormation(),
      t: mockT,
      tDynamic: mockTDynamic,
      language: "ja",
    }),
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("useFlowchartGenerator", () => {
  // ── 空・未定義の場合 ──

  it("activeTactic が undefined の場合、空文字を返す", () => {
    const { result } = renderFlowchartGenerator({
      activeTactic: undefined,
    });
    expect(result.current.generateFlowchart()).toBe("");
  });

  it("currentFormation が undefined の場合、空文字を返す", () => {
    const { result } = renderFlowchartGenerator({
      currentFormation: undefined,
    });
    expect(result.current.generateFlowchart()).toBe("");
  });

  it("movements も ballPasses も空の場合、空文字を返す", () => {
    const tactic = createMockTactic({ movements: [], ballPasses: [] });
    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    expect(result.current.generateFlowchart()).toBe("");
  });

  // ── 基本的なフローチャート生成 ──

  it("単一フェーズの movement ノードを生成する", () => {
    const tactic = createMockTactic({
      movements: [
        { role: "CM", delay: 0, arrowColor: "#ef4444", targetX: 1, targetZ: 2 },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    expect(chart).toContain("graph TD");
    expect(chart).toContain("Start");
    expect(chart).toContain("🏁");
    expect(chart).toContain("🏃 CM");
    expect(chart).toContain("Start --> Phase0");
    expect(chart).toContain("Phase0 --> End");
    expect(chart).toContain("✅");
  });

  it("遅延なし（delay=0）の場合、即時ラベルを表示する", () => {
    const tactic = createMockTactic({
      movements: [
        { role: "CB", delay: 0, arrowColor: "#3b82f6", targetX: 0, targetZ: 0 },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    // t("tactics.flow.immediate") → "tactics.flow.immediate"
    expect(chart).toContain("tactics.flow.immediate");
  });

  it("delay > 0 の場合、秒数ラベルを表示する", () => {
    const tactic = createMockTactic({
      movements: [
        {
          role: "CF",
          delay: 1500,
          arrowColor: "#ef4444",
          targetX: 0,
          targetZ: 0,
        },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    expect(chart).toContain("1.5s");
  });

  // ── 複数フェーズ ──

  it("複数の delay でフェーズ分割し、接続する", () => {
    const tactic = createMockTactic({
      movements: [
        { role: "CB", delay: 0, arrowColor: "#ef4444", targetX: 0, targetZ: 0 },
        {
          role: "CF",
          delay: 1000,
          arrowColor: "#3b82f6",
          targetX: 0,
          targetZ: 0,
        },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    expect(chart).toContain("subgraph Phase0");
    expect(chart).toContain("subgraph Phase1");
    expect(chart).toContain("Start --> Phase0");
    expect(chart).toContain("Phase0 --> Phase1");
    expect(chart).toContain("Phase1 --> End");
  });

  // ── ボールパスノード ──

  it("ボールパスノードを「⚽ start → end」形式で生成する", () => {
    const tactic = createMockTactic({
      movements: [],
      ballPasses: [
        {
          startRole: "CM",
          endRole: "CF",
          delay: 0,
          color: "#ef4444",
        },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    expect(chart).toContain("⚽ CM → CF");
  });

  // ── カラーマッピング ──

  it("既知の arrowColor にスタイルを適用する", () => {
    const tactic = createMockTactic({
      movements: [
        { role: "CM", delay: 0, arrowColor: "#ef4444", targetX: 0, targetZ: 0 },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    expect(chart).toContain("fill:#ef4444");
    expect(chart).toContain("stroke:#dc2626");
  });

  it("未知の arrowColor の場合、スタイル行を出力しない", () => {
    const tactic = createMockTactic({
      movements: [
        { role: "CM", delay: 0, arrowColor: "#999999", targetX: 0, targetZ: 0 },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    // N0 のスタイルは出力されない
    expect(chart).not.toContain("style N0");
  });

  // ── カスタム戦術名 ──

  it("カスタム戦術では getDisplayName を使用する", () => {
    const tactic = createMockTactic({
      isCustom: true,
      nameJa: "テスト作戦",
      movements: [
        { role: "CM", delay: 0, arrowColor: "#ef4444", targetX: 0, targetZ: 0 },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    expect(chart).toContain("テスト作戦");
  });

  it("デフォルト戦術では tDynamic を使用する", () => {
    const tactic = createMockTactic({
      id: "possessionPlay",
      isCustom: false,
      movements: [
        { role: "CM", delay: 0, arrowColor: "#ef4444", targetX: 0, targetZ: 0 },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    result.current.generateFlowchart();

    expect(mockTDynamic).toHaveBeenCalledWith("tactics.name.possessionPlay");
  });

  // ── Mermaid 特殊文字エスケープ ──

  it("Mermaid 特殊文字をエスケープする", () => {
    const tactic = createMockTactic({
      isCustom: true,
      nameJa: 'Test[1]"name"',
      movements: [
        { role: "CM", delay: 0, arrowColor: "#ef4444", targetX: 0, targetZ: 0 },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    // [ → #91; ] → #93; " → #34;
    expect(chart).toContain("#91;");
    expect(chart).toContain("#93;");
    expect(chart).toContain("#34;");
    expect(chart).not.toContain("[1]");
  });

  // ── 同一フェーズに movement と ballPass が混在 ──

  it("同一 delay の movement と ballPass を同じ subgraph に配置する", () => {
    const tactic = createMockTactic({
      movements: [
        { role: "CM", delay: 0, arrowColor: "#ef4444", targetX: 0, targetZ: 0 },
      ],
      ballPasses: [
        { startRole: "CB", endRole: "CF", delay: 0, color: "#3b82f6" },
      ],
    });

    const { result } = renderFlowchartGenerator({ activeTactic: tactic });
    const chart = result.current.generateFlowchart();

    // Phase は 1 つだけ
    expect(chart).toContain("subgraph Phase0");
    expect(chart).not.toContain("subgraph Phase1");

    // 両方のノードが含まれる
    expect(chart).toContain("🏃 CM");
    expect(chart).toContain("⚽ CB → CF");
  });
});
