/**
 * @module useCanvasMemoization
 * @description Canvasに渡すメモ化済みの計算値を提供し、不要な再描画を防止するフック。
 */
import { useMemo } from "react";
import type { CardStatus } from "@presentation/components/tactics-viewer/types";

/** React.memo 用の安定した空参照 — レンダーごとに新しい `{}` を生成しない */
const EMPTY_PLAYER_CARDS: Record<number, CardStatus> = {};

interface UseCanvasMemoizationParams {
  showCards: boolean;
  captureMode: boolean;
  playerCards: Record<number, CardStatus>;
  lineFromPlayerIndex: number | null;
  selectedPlayerIndex: number | null;
  playerViewEnabled: boolean;
  selectedOpponentViewId: number | null;
  isExecuting: boolean;
  opponentPlacementMode: boolean;
  ballPlacementMode: boolean;
  lineDrawingMode: boolean;
  creation: {
    wizardStep: string;
  } | null;
  ballPassCreationMode: boolean;
  ballPassStartPos: { x: number; z: number } | null;
  pendingLineEndPos: { x: number; z: number } | null;
  lineColor: string;
}

/**
 * Canvas に渡すメモ化済み計算値を提供するフック。
 *
 * TacticsViewerPage の再レンダリング時に不要な Canvas 再描画を避けるため、
 * useMemo で安定した参照を生成する。
 */
export function useCanvasMemoization(params: UseCanvasMemoizationParams) {
  const {
    showCards,
    captureMode,
    playerCards,
    lineFromPlayerIndex,
    selectedPlayerIndex,
    playerViewEnabled,
    selectedOpponentViewId,
    isExecuting,
    opponentPlacementMode,
    ballPlacementMode,
    lineDrawingMode,
    creation,
    ballPassCreationMode,
    ballPassStartPos,
    pendingLineEndPos,
    lineColor,
  } = params;

  const canvasPlayerCards = useMemo(
    () => (showCards && !captureMode ? playerCards : EMPTY_PLAYER_CARDS),
    [showCards, captureMode, playerCards],
  );

  const canvasSelectedPlayerIndex = useMemo(
    () => lineFromPlayerIndex ?? selectedPlayerIndex,
    [lineFromPlayerIndex, selectedPlayerIndex],
  );

  const canvasIsPlayerView = useMemo(
    () =>
      playerViewEnabled &&
      (selectedPlayerIndex !== null || selectedOpponentViewId !== null),
    [playerViewEnabled, selectedPlayerIndex, selectedOpponentViewId],
  );

  const canvasPlayerDraggable = useMemo(
    () =>
      (!isExecuting &&
        !opponentPlacementMode &&
        !ballPlacementMode &&
        !lineDrawingMode &&
        !playerViewEnabled) ||
      (!!creation &&
        !ballPassCreationMode &&
        (creation.wizardStep === "editing" ||
          creation.wizardStep === "setPosition")),
    [
      isExecuting,
      creation,
      ballPassCreationMode,
      opponentPlacementMode,
      ballPlacementMode,
      lineDrawingMode,
      playerViewEnabled,
    ],
  );

  const canvasLineTrackingActive = useMemo(
    () =>
      (lineDrawingMode && lineFromPlayerIndex !== null) ||
      (ballPassCreationMode && ballPassStartPos !== null),
    [
      lineDrawingMode,
      lineFromPlayerIndex,
      ballPassCreationMode,
      ballPassStartPos,
    ],
  );

  const canvasPendingConnectionLine = useMemo(
    () =>
      lineFromPlayerIndex !== null && pendingLineEndPos
        ? {
            fromIndex: lineFromPlayerIndex,
            endPos: pendingLineEndPos,
            color: lineColor,
          }
        : null,
    [lineFromPlayerIndex, pendingLineEndPos, lineColor],
  );

  return {
    canvasPlayerCards,
    canvasSelectedPlayerIndex,
    canvasIsPlayerView,
    canvasPlayerDraggable,
    canvasLineTrackingActive,
    canvasPendingConnectionLine,
  };
}
