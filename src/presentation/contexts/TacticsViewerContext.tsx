/**
 * @module TacticsViewerContext
 * @description タクティクスビューアーの共有ステートを3つのContextに分割して提供する。
 *
 * **分割の目的（教材ポイント）**:
 * 1つの巨大Contextでは、どの値が変わっても全消費コンポーネントが再レンダリングされる。
 * 変更頻度と責務に応じて分割することで、不要な再レンダリングを防ぎ、関心の分離を実現する。
 *
 * - TacticsUIContext: UI表示状態（変更頻度: 高）
 * - TacticsTeamContext: チーム・フォーメーション（変更頻度: 低）
 * - TacticsExecutionContext: 戦術実行・フィールド操作（変更頻度: 中）
 */
import { useMemo, type ReactNode } from "react";
import {
  TacticsUIProvider,
  type TacticsUIContextType,
} from "./TacticsUIContext";
import {
  TacticsTeamProvider,
  type TacticsTeamContextType,
} from "./TacticsTeamContext";
import {
  TacticsExecutionProvider,
  type TacticsExecutionContextType,
} from "./TacticsExecutionContext";

// DisplayData は TacticsTeamContext で定義。後方互換のために再エクスポート
export type { DisplayData } from "./TacticsTeamContext";

// ── 旧 TacticsViewerContextType を分割済み型の合成として定義 ──

export type TacticsViewerContextType = TacticsUIContextType &
  TacticsTeamContextType &
  TacticsExecutionContextType;

// ── コンポジットProvider ──

interface TacticsViewerProviderProps {
  value: TacticsViewerContextType;
  children: ReactNode;
}

/**
 * 3つの分割Contextを一括で提供するコンポジットProvider。
 * TacticsViewerPage から呼び出す。
 */
export function TacticsViewerProvider({
  value,
  children,
}: TacticsViewerProviderProps) {
  // useMemo で各コンテキスト値の参照を安定化し、
  // 関係のない値が変わった際の不要な再レンダリングを防ぐ
  const uiValue: TacticsUIContextType = useMemo(
    () => ({
      ui: value.ui,
      canUndo: value.canUndo,
      canRedo: value.canRedo,
      handleUndo: value.handleUndo,
      handleRedo: value.handleRedo,
    }),
    [
      value.ui,
      value.canUndo,
      value.canRedo,
      value.handleUndo,
      value.handleRedo,
    ],
  );

  const teamValue: TacticsTeamContextType = useMemo(
    () => ({
      selectedTeam: value.selectedTeam,
      currentFormation: value.currentFormation,
      teams: value.teams,
      teamMgmt: value.teamMgmt,
      formationMgmt: value.formationMgmt,
      displayData: value.displayData,
      cardMgmt: value.cardMgmt,
      managerEditor: value.managerEditor,
      handleSquadCardCycle: value.handleSquadCardCycle,
      handleSaveManager: value.handleSaveManager,
      handleCycleManagerCard: value.handleCycleManagerCard,
    }),
    [
      value.selectedTeam,
      value.currentFormation,
      value.teams,
      value.teamMgmt,
      value.formationMgmt,
      value.displayData,
      value.cardMgmt,
      value.managerEditor,
      value.handleSquadCardCycle,
      value.handleSaveManager,
      value.handleCycleManagerCard,
    ],
  );

  const executionValue: TacticsExecutionContextType = useMemo(
    () => ({
      tOrch: value.tOrch,
      playModePhase: value.playModePhase,
      tacticsLoading: value.tacticsLoading,
      opponentsHook: value.opponentsHook,
      ballHook: value.ballHook,
      connLines: value.connLines,
      playerView: value.playerView,
      multiSelect: value.multiSelect,
      bgSettings: value.bgSettings,
      lineupAnimation: value.lineupAnimation,
      sketch: value.sketch,
      canvasMemo: value.canvasMemo,
      canvasCallbacks: value.canvasCallbacks,
      handlePlayerClick: value.handlePlayerClick,
      handleOpponentClick: value.handleOpponentClick,
      handleSavePng: value.handleSavePng,
      generateFlowchart: value.generateFlowchart,
    }),
    [
      value.tOrch,
      value.playModePhase,
      value.tacticsLoading,
      value.opponentsHook,
      value.ballHook,
      value.connLines,
      value.playerView,
      value.multiSelect,
      value.bgSettings,
      value.lineupAnimation,
      value.sketch,
      value.canvasMemo,
      value.canvasCallbacks,
      value.handlePlayerClick,
      value.handleOpponentClick,
      value.handleSavePng,
      value.generateFlowchart,
    ],
  );

  return (
    <TacticsUIProvider value={uiValue}>
      <TacticsTeamProvider value={teamValue}>
        <TacticsExecutionProvider value={executionValue}>
          {children}
        </TacticsExecutionProvider>
      </TacticsTeamProvider>
    </TacticsUIProvider>
  );
}
