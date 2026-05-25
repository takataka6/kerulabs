/**
 * @module useFlowchartGenerator
 * @description アクティブな戦術からMermaidフローチャート定義を生成するフック。フェーズ分割・選手移動・ボールパスを可視化する。
 */
import { useCallback } from "react";
import type { Tactic } from "@domain/entities/Tactic";
import type { Formation } from "@domain/entities/Formation";
import type { TranslationKey } from "@shared/i18n/translations";
import type { Language } from "@presentation/contexts/LanguageContext";

/** Mermaid記法の特殊文字をエスケープする */
function escapeMermaid(text: string): string {
  return text.replace(/[[\]"(){}|<>#&]/g, (ch) => `#${ch.charCodeAt(0)};`);
}

/** フローチャート用カラーマッピング */
const FLOWCHART_COLOR_MAP: Record<string, { fill: string; stroke: string }> = {
  "#ef4444": { fill: "#ef4444", stroke: "#dc2626" },
  "#3b82f6": { fill: "#3b82f6", stroke: "#2563eb" },
  "#7c3aed": { fill: "#7c3aed", stroke: "#6d28d9" },
  "#f59e0b": { fill: "#f59e0b", stroke: "#d97706" },
  "#10b981": { fill: "#10b981", stroke: "#059669" },
};

/**
 * アクティブな戦術の Mermaid フローチャートを生成するフック。
 *
 * delay によるフェーズ分割、選手移動ノード、ボールパスノードを含む。
 *
 * @param params.activeTactic - 可視化対象のタクティクス（`undefined` の場合あり）。
 * @param params.currentFormation - アクティブなフォーメーション（選手インデックスからロールラベルへのマッピング）。
 * @param params.t - ノードラベル用の i18n 翻訳関数。
 * @param params.tDynamic - 動的キー用の翻訳関数（例: フェーズ名）。
 * @param params.language - 条件付きラベルフォーマット用の UI 言語コード。
 * @returns Mermaid 定義文字列を生成する `generateFlowchart` コールバック。タクティクスがない場合は空文字列を返す。
 */
export function useFlowchartGenerator(params: {
  activeTactic: Tactic | undefined;
  currentFormation: Formation | undefined;
  t: (key: TranslationKey) => string;
  tDynamic: (key: string) => string;
  language: Language;
}) {
  const { activeTactic, currentFormation, t, tDynamic, language } = params;

  const generateFlowchart = useCallback(() => {
    if (!activeTactic || !currentFormation) return "";

    const movements = activeTactic.getMovementsForFormation(
      currentFormation.name,
    );
    const ballPasses = activeTactic.getBallPassesForFormation(
      currentFormation.name,
    );
    if (movements.length === 0 && ballPasses.length === 0) return "";

    const tacticName = activeTactic.isCustom
      ? activeTactic.getDisplayName(language)
      : tDynamic(`tactics.name.${activeTactic.id}`);

    // delay でグループ化（mutable な配列でグルーピング）
    type MovementItem = (typeof movements)[number];
    type BallPassItem = (typeof ballPasses)[number];
    const phaseMap = new Map<
      number,
      { movements: MovementItem[]; ballPasses: BallPassItem[] }
    >();
    for (const m of movements) {
      if (!phaseMap.has(m.delay))
        phaseMap.set(m.delay, { movements: [], ballPasses: [] });
      phaseMap.get(m.delay)!.movements.push(m);
    }
    for (const bp of ballPasses) {
      if (!phaseMap.has(bp.delay))
        phaseMap.set(bp.delay, { movements: [], ballPasses: [] });
      phaseMap.get(bp.delay)!.ballPasses.push(bp);
    }
    const phases = [...phaseMap.entries()].sort((a, b) => a[0] - b[0]);

    let chart = "graph TD\n";
    chart += `  Start(["🏁 ${escapeMermaid(tacticName)}"])\n`;
    chart += "  style Start fill:#10b981,stroke:#059669,color:#fff\n";

    let nodeCounter = 0;
    const colorMap = FLOWCHART_COLOR_MAP;

    phases.forEach(([delay, group], phaseIdx) => {
      const phaseId = `Phase${phaseIdx}`;
      const delayLabel =
        delay === 0
          ? t("tactics.flow.immediate")
          : `${(delay / 1000).toFixed(1)}s`;
      chart += `  subgraph ${phaseId}["⏱ ${delayLabel}"]\n`;

      // 選手移動ノード
      for (const m of group.movements) {
        const nodeId = `N${nodeCounter++}`;
        const playerIndex = currentFormation.getPlayerIndexByRole(m.role);
        const playerPos =
          playerIndex !== undefined
            ? currentFormation.positions[playerIndex].pos
            : m.role;
        chart += `    ${nodeId}["🏃 ${escapeMermaid(playerPos)}"]\n`;
        const c = colorMap[m.arrowColor];
        if (c) {
          chart += `    style ${nodeId} fill:${c.fill},stroke:${c.stroke},color:#fff\n`;
        }
      }

      // ボールパスノード
      for (const bp of group.ballPasses) {
        const nodeId = `N${nodeCounter++}`;
        const startIndex = currentFormation.getPlayerIndexByRole(bp.startRole);
        const endIndex = currentFormation.getPlayerIndexByRole(bp.endRole);
        const startPos =
          startIndex !== undefined
            ? currentFormation.positions[startIndex].pos
            : bp.startRole;
        const endPos =
          endIndex !== undefined
            ? currentFormation.positions[endIndex].pos
            : bp.endRole;
        chart += `    ${nodeId}["⚽ ${escapeMermaid(startPos)} → ${escapeMermaid(endPos)}"]\n`;
        const c = colorMap[bp.color];
        if (c) {
          chart += `    style ${nodeId} fill:${c.fill},stroke:${c.stroke},color:#fff\n`;
        }
      }

      chart += `  end\n`;

      // フェーズ間の接続
      if (phaseIdx === 0) {
        chart += `  Start --> ${phaseId}\n`;
      } else {
        chart += `  Phase${phaseIdx - 1} --> ${phaseId}\n`;
      }
    });

    chart += `  Phase${phases.length - 1} --> End(["✅ ${t("tactics.flow.complete")}"])\n`;
    chart += "  style End fill:#f59e0b,stroke:#d97706,color:#fff\n";

    return chart;
  }, [activeTactic, currentFormation, t, tDynamic, language]);

  return { generateFlowchart };
}
