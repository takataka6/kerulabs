/**
 * @module useTacticsModeReset
 * @description フィールド上のインタラクティブモード（相手配置、ボール配置、接続線、プレイヤービュー、手動位置、戦術実行）を一括リセットするフック。
 *
 * 目的:
 * - useTacticsOrchestration や TacticsViewerPage で散在していたリセットロジックを一元化
 * - 新しいインタラクションモード（例: 新しいキャプチャモード）を追加した際に、リセット漏れを防ぐ
 * - テストしやすくする
 *
 * このフックは副作用を持つコールバックを提供する。依存は安定した関数であることを前提に依存配列を最適化している。
 */
import { useCallback } from "react";

export interface TacticsModeResetDeps {
  opponentsHook: {
    setOpponentPlacementMode: (value: boolean) => void;
  };
  ballHook: {
    setBallPlacementMode: (value: boolean) => void;
  };
  connLines: {
    resetLineDrawingState: () => void;
  };
  playerView: {
    setPlayerViewEnabled: (value: boolean) => void;
    setSelectedPlayerIndex: (index: number | null) => void;
    setSelectedOpponentViewId: (id: number | null) => void;
  };
  clearManualPositions: () => void;
  resetTactic: () => void;
}

/**
 * インタラクティブなフィールド操作モードを安全にリセットする。
 *
 * 戦術作成開始時、フェーズ切替時、モード変更時などに使用。
 */
export function useTacticsModeReset(deps: TacticsModeResetDeps) {
  const {
    opponentsHook,
    ballHook,
    connLines,
    playerView,
    clearManualPositions,
    resetTactic,
  } = deps;

  const resetInteractionModes = useCallback(() => {
    opponentsHook.setOpponentPlacementMode(false);
    ballHook.setBallPlacementMode(false);
    connLines.resetLineDrawingState();
    playerView.setPlayerViewEnabled(false);
    playerView.setSelectedPlayerIndex(null);
    playerView.setSelectedOpponentViewId(null);
    clearManualPositions();
    resetTactic();
  }, [
    // セッター関数は安定していることを前提に、主要な依存のみを明示
    // (詳細は呼び出し元でのコメントを参照)
    opponentsHook,
    ballHook,
    connLines,
    playerView,
    clearManualPositions,
    resetTactic,
  ]);

  return {
    /** すべてのインタラクティブ配置/選択モードをリセットする */
    resetInteractionModes,
  };
}
