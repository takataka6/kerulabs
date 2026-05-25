/**
 * @module useBallPlacement
 * @description ボール配置モードの状態管理フック。フィールド上へのボール配置・ドラッグ移動・削除を制御する。
 */
import { useState, useCallback } from "react";

/**
 * ボール配置モードの状態管理。
 *
 * フィールド上へのボール配置・ドラッグ移動・削除を制御する。
 *
 * @param onPushSnapshot - 状態変更後にUndo/Redoスナップショットを保存するコールバック。
 * @param onDisableOtherModes - ボール配置モード開始時に他の排他モードを無効化するコールバック。
 * @returns ボール位置、配置モードフラグ、および配置/ドラッグ/削除/トグルのハンドラー。
 */
export function useBallPlacement(
  onPushSnapshot: () => void,
  onDisableOtherModes?: () => void,
) {
  const [ballPosition, setBallPosition] = useState<{
    x: number;
    z: number;
  } | null>(null);
  const [ballPlacementMode, setBallPlacementMode] = useState(false);

  const handleBallPlace = useCallback(
    (pos: { x: number; z: number }) => {
      setBallPosition(pos);
      setBallPlacementMode(false);
      requestAnimationFrame(() => onPushSnapshot());
    },
    [onPushSnapshot],
  );

  const handleBallDrag = useCallback((pos: { x: number; z: number }) => {
    setBallPosition(pos);
  }, []);

  const handleBallRemove = useCallback(() => {
    setBallPosition(null);
    requestAnimationFrame(() => onPushSnapshot());
  }, [onPushSnapshot]);

  const toggleBallPlacement = useCallback(() => {
    setBallPlacementMode((prev) => !prev);
    onDisableOtherModes?.();
  }, [onDisableOtherModes]);

  return {
    ballPosition,
    setBallPosition,
    ballPlacementMode,
    setBallPlacementMode,
    handleBallPlace,
    handleBallDrag,
    handleBallRemove,
    toggleBallPlacement,
  };
}
