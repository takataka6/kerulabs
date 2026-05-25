/**
 * @module useConnectionLines
 * @description プレイヤー間の接続ライン描画モードの状態管理フック。ライン追加・削除・色変更を制御する。
 */
import { useState, useCallback } from "react";
import { DEFAULT_CONNECTION_LINE_COLOR } from "@shared/constants/colors";

/** プレイヤー間の接続ライン (コネクションライン) を表す型 */
export interface ConnectionLine {
  id: number;
  fromIndex: number;
  toIndex: number;
  color: string;
}

/**
 * プレイヤー間の接続ライン描画モードの状態管理。
 *
 * ライン描画モードの ON/OFF、2 選手間のライン追加・削除、色変更を制御する。
 *
 * @param onPushSnapshot - ライン変更後にUndo/Redoスナップショットを保存するコールバック。
 * @param onDisableOtherModes - ライン描画モード開始時に他の排他モードを無効化するコールバック。
 * @returns 接続ライン配列、描画モード状態、ライン色、およびCRUDハンドラー。
 */
export function useConnectionLines(
  onPushSnapshot: () => void,
  onDisableOtherModes?: () => void,
) {
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);
  const [lineDrawingMode, setLineDrawingMode] = useState(false);
  const [lineFromPlayerIndex, setLineFromPlayerIndex] = useState<number | null>(
    null,
  );
  const [pendingLineEndPos, setPendingLineEndPos] = useState<{
    x: number;
    z: number;
  } | null>(null);
  const [nextLineId, setNextLineId] = useState(1);
  const [lineColor, setLineColor] = useState(DEFAULT_CONNECTION_LINE_COLOR);

  const handlePlayerClickForLine = useCallback(
    (index: number) => {
      if (lineFromPlayerIndex === null) {
        setLineFromPlayerIndex(index);
      } else {
        if (index !== lineFromPlayerIndex) {
          setConnectionLines((prev) => [
            ...prev,
            {
              id: nextLineId,
              fromIndex: lineFromPlayerIndex,
              toIndex: index,
              color: lineColor,
            },
          ]);
          setNextLineId((prev) => prev + 1);
          requestAnimationFrame(() => onPushSnapshot());
        }
        setLineFromPlayerIndex(null);
        setPendingLineEndPos(null);
      }
    },
    [lineFromPlayerIndex, nextLineId, lineColor, onPushSnapshot],
  );

  const toggleLineDrawing = useCallback(() => {
    setLineDrawingMode((prev) => {
      if (!prev) {
        onDisableOtherModes?.();
      }
      setLineFromPlayerIndex(null);
      setPendingLineEndPos(null);
      return !prev;
    });
  }, [onDisableOtherModes]);

  const handleConnectionLineRemove = useCallback(
    (id: number) => {
      setConnectionLines((prev) => prev.filter((l) => l.id !== id));
      requestAnimationFrame(() => onPushSnapshot());
    },
    [onPushSnapshot],
  );

  const clearConnectionLines = useCallback(() => {
    setConnectionLines([]);
    setNextLineId(1);
    setLineFromPlayerIndex(null);
    setPendingLineEndPos(null);
    requestAnimationFrame(() => onPushSnapshot());
  }, [onPushSnapshot]);

  const resetLineDrawingState = useCallback(() => {
    setLineDrawingMode(false);
    setLineFromPlayerIndex(null);
    setPendingLineEndPos(null);
  }, []);

  return {
    connectionLines,
    setConnectionLines,
    lineDrawingMode,
    setLineDrawingMode,
    lineFromPlayerIndex,
    pendingLineEndPos,
    setPendingLineEndPos,
    lineColor,
    setLineColor,
    handlePlayerClickForLine,
    toggleLineDrawing,
    handleConnectionLineRemove,
    clearConnectionLines,
    resetLineDrawingState,
  };
}
