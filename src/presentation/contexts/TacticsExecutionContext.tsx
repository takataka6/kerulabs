/**
 * @module TacticsExecutionContext
 * @description 戦術実行・フィールド操作・キャンバス関連の状態を提供するContext。
 * 変更頻度は中程度（戦術操作・フィールド操作時に更新）。
 * UI表示状態やチームデータと分離して責務を明確にする。
 */
import { createContext, useContext, type ReactNode } from "react";
import type { usePlayModePhase } from "@presentation/hooks/ui/usePlayModePhase";
import type { usePlayerView } from "@presentation/hooks/ui/usePlayerView";
import type { useMultiSelect } from "@presentation/hooks/ui/useMultiSelect";
import type { useBackgroundSettings } from "@presentation/hooks/ui/useBackgroundSettings";
import type { useTacticsOrchestration } from "@presentation/hooks/tactic/useTacticsOrchestration";
import type { useOpponents } from "@presentation/hooks/field/useOpponents";
import type { useBallPlacement } from "@presentation/hooks/field/useBallPlacement";
import type { useConnectionLines } from "@presentation/hooks/field/useConnectionLines";
import type { useCanvasMemoization } from "@presentation/hooks/canvas/useCanvasMemoization";
import type { useCanvasCallbacks } from "@presentation/hooks/canvas/useCanvasCallbacks";
import type { useLineupAnimation } from "@presentation/components/lineup-animation/useLineupAnimation";
import type { useSketchOverlay } from "@presentation/hooks/sketch/useSketchOverlay";

export interface TacticsExecutionContextType {
  /** 戦術オーケストレーション */
  tOrch: ReturnType<typeof useTacticsOrchestration>;
  /** プレーモード・フェーズ */
  playModePhase: ReturnType<typeof usePlayModePhase>;
  /** 戦術データ読み込み中フラグ */
  tacticsLoading: boolean;

  /** 相手チーム管理 */
  opponentsHook: ReturnType<typeof useOpponents>;
  /** ボール配置 */
  ballHook: ReturnType<typeof useBallPlacement>;
  /** コネクションライン */
  connLines: ReturnType<typeof useConnectionLines>;

  /** プレイヤービュー */
  playerView: ReturnType<typeof usePlayerView>;
  /** 複数選択 */
  multiSelect: ReturnType<typeof useMultiSelect>;
  /** 背景設定 */
  bgSettings: ReturnType<typeof useBackgroundSettings>;

  /** スタメン発表アニメーション */
  lineupAnimation: ReturnType<typeof useLineupAnimation>;
  /** スケッチ描画 */
  sketch: ReturnType<typeof useSketchOverlay>;

  /** キャンバスメモ化値 */
  canvasMemo: ReturnType<typeof useCanvasMemoization>;
  /** キャンバスコールバック */
  canvasCallbacks: ReturnType<typeof useCanvasCallbacks>;

  /** プレイヤークリック */
  handlePlayerClick: (index: number, event?: MouseEvent) => void;
  /** 相手クリック */
  handleOpponentClick: (id: number, event?: MouseEvent) => void;
  /** PNG保存 */
  handleSavePng: () => void;
  /** フローチャート生成 */
  generateFlowchart: () => string;
}

const TacticsExecutionContext = createContext<
  TacticsExecutionContextType | undefined
>(undefined);

// eslint-disable-next-line react-refresh/only-export-components -- フックは対応する Context と同じファイルに配置する
export function useTacticsExecution() {
  const context = useContext(TacticsExecutionContext);
  if (!context) {
    throw new Error(
      "useTacticsExecution must be used within TacticsExecutionProvider",
    );
  }
  return context;
}

interface TacticsExecutionProviderProps {
  value: TacticsExecutionContextType;
  children: ReactNode;
}

export function TacticsExecutionProvider({
  value,
  children,
}: TacticsExecutionProviderProps) {
  return (
    <TacticsExecutionContext.Provider value={value}>
      {children}
    </TacticsExecutionContext.Provider>
  );
}
