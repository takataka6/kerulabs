/**
 * @module useBallPassCreation
 * @description ボールパス作成モードの状態管理フック。
 * 開始位置・終了位置・軌道タイプの一時状態を管理する。
 */
import { useState, useCallback } from "react";
import type { TrajectoryType } from "@domain/entities/BallPass";

export interface UseBallPassCreationReturn {
  ballPassCreationMode: boolean;
  setBallPassCreationMode: React.Dispatch<React.SetStateAction<boolean>>;
  ballPassStartPos: { x: number; z: number } | null;
  setBallPassStartPos: React.Dispatch<
    React.SetStateAction<{ x: number; z: number } | null>
  >;
  ballPassPendingEndPos: { x: number; z: number } | null;
  setBallPassPendingEndPos: React.Dispatch<
    React.SetStateAction<{ x: number; z: number } | null>
  >;
  ballPassTrajectoryType: TrajectoryType;
  setBallPassTrajectoryType: React.Dispatch<
    React.SetStateAction<TrajectoryType>
  >;
  resetBallPassState: () => void;
}

/**
 * ボールパス作成モードの状態を管理する。
 *
 * 開始位置・仮終了位置・軌道タイプを保持し、
 * 作成キャンセル時やステップ切替時に一括リセットできる。
 */
export function useBallPassCreation(): UseBallPassCreationReturn {
  const [ballPassCreationMode, setBallPassCreationMode] = useState(false);
  const [ballPassStartPos, setBallPassStartPos] = useState<{
    x: number;
    z: number;
  } | null>(null);
  const [ballPassPendingEndPos, setBallPassPendingEndPos] = useState<{
    x: number;
    z: number;
  } | null>(null);
  const [ballPassTrajectoryType, setBallPassTrajectoryType] =
    useState<TrajectoryType>("low");

  const resetBallPassState = useCallback(() => {
    setBallPassCreationMode(false);
    setBallPassStartPos(null);
    setBallPassPendingEndPos(null);
  }, []);

  return {
    ballPassCreationMode,
    setBallPassCreationMode,
    ballPassStartPos,
    setBallPassStartPos,
    ballPassPendingEndPos,
    setBallPassPendingEndPos,
    ballPassTrajectoryType,
    setBallPassTrajectoryType,
    resetBallPassState,
  };
}
