/**
 * @module useBallPassEditor
 * @description ボールパスの編集操作を提供するフック。
 * ステップ内のボールパスの追加・削除・軌道タイプ変更を管理する。
 */
import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { TrajectoryType } from "@domain/entities/BallPass";
import { DEFAULT_BALL_PASS_COLOR } from "@shared/constants";
import type {
  CreationState,
  CreationStepBallPass,
} from "./tacticCreationTypes";

export interface UseBallPassEditorReturn {
  addBallPass: (
    startRole: string,
    endRole: string,
    color?: string,
    trajectoryType?: TrajectoryType,
  ) => void;
  addBallPassByCoords: (
    startX: number,
    startZ: number,
    endX: number,
    endZ: number,
    color?: string,
    trajectoryType?: TrajectoryType,
  ) => void;
  removeBallPass: (index: number) => void;
  updateBallPassTrajectoryType: (index: number, type: TrajectoryType) => void;
}

/**
 * ボールパスの編集操作フック。
 *
 * @param setCreation - CreationState の更新関数
 */
export function useBallPassEditor(
  setCreation: Dispatch<SetStateAction<CreationState | null>>,
): UseBallPassEditorReturn {
  const addBallPass = useCallback(
    (
      startRole: string,
      endRole: string,
      color?: string,
      trajectoryType?: TrajectoryType,
    ) => {
      setCreation((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((step, i) => {
          if (i !== prev.currentStepIndex) return step;
          const newPass: CreationStepBallPass = {
            startRole,
            endRole,
            color: color || DEFAULT_BALL_PASS_COLOR,
            ...(trajectoryType ? { trajectoryType } : {}),
          };
          return {
            ...step,
            ballPasses: [...step.ballPasses, newPass],
          };
        });
        return { ...prev, steps };
      });
    },
    [setCreation],
  );

  const addBallPassByCoords = useCallback(
    (
      startX: number,
      startZ: number,
      endX: number,
      endZ: number,
      color?: string,
      trajectoryType?: TrajectoryType,
    ) => {
      setCreation((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((step, i) => {
          if (i !== prev.currentStepIndex) return step;
          const newPass: CreationStepBallPass = {
            startRole: "",
            endRole: "",
            color: color || DEFAULT_BALL_PASS_COLOR,
            startX,
            startZ,
            endX,
            endZ,
            ...(trajectoryType ? { trajectoryType } : {}),
          };
          return {
            ...step,
            ballPasses: [...step.ballPasses, newPass],
          };
        });
        return { ...prev, steps };
      });
    },
    [setCreation],
  );

  const removeBallPass = useCallback(
    (index: number) => {
      setCreation((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((step, i) => {
          if (i !== prev.currentStepIndex) return step;
          return {
            ...step,
            ballPasses: step.ballPasses.filter((_, bpIdx) => bpIdx !== index),
          };
        });
        return { ...prev, steps };
      });
    },
    [setCreation],
  );

  const updateBallPassTrajectoryType = useCallback(
    (index: number, type: TrajectoryType) => {
      setCreation((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((step, i) => {
          if (i !== prev.currentStepIndex) return step;
          return {
            ...step,
            ballPasses: step.ballPasses.map((bp, bpIdx) =>
              bpIdx === index ? { ...bp, trajectoryType: type } : bp,
            ),
          };
        });
        return { ...prev, steps };
      });
    },
    [setCreation],
  );

  return {
    addBallPass,
    addBallPassByCoords,
    removeBallPass,
    updateBallPassTrajectoryType,
  };
}
