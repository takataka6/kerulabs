/**
 * @module useManualPositions
 * @description プレイヤーのドラッグによる手動位置変更を管理するフック。
 */
import { useState, useCallback } from "react";

export interface UseManualPositionsReturn {
  manualPlayerPositions: Record<number, { x: number; z: number }>;
  setManualPlayerPositions: React.Dispatch<
    React.SetStateAction<Record<number, { x: number; z: number }>>
  >;
  clearManualPositions: () => void;
}

/**
 * ドラッグ操作による選手の手動位置変更を管理する。
 *
 * フォーメーションの基準位置を上書きし、
 * タクティクス実行やステップ切替時にクリアされる。
 */
export function useManualPositions(): UseManualPositionsReturn {
  const [manualPlayerPositions, setManualPlayerPositions] = useState<
    Record<number, { x: number; z: number }>
  >({});

  const clearManualPositions = useCallback(
    () => setManualPlayerPositions({}),
    [],
  );

  return {
    manualPlayerPositions,
    setManualPlayerPositions,
    clearManualPositions,
  };
}
