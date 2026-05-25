/**
 * @module useMovementEditor
 * @description 選手移動の編集操作を提供するフック。
 * ステップ内の選手ターゲット位置の追加・削除・リセットを管理する。
 */
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { POSITION_FALLBACK_HEX_COLOR } from "@shared/constants/positionColors";
import type { CreationState } from "./tacticCreationTypes";

export interface UseMovementEditorReturn {
  setPlayerTarget: (role: string, x: number, z: number, color?: string) => void;
  removePlayerTarget: (role: string) => void;
  resetCurrentStep: () => void;
}

/**
 * 選手移動の編集操作フック。
 *
 * @param setCreation - CreationState の更新関数
 */
export function useMovementEditor(
  setCreation: Dispatch<SetStateAction<CreationState | null>>,
): UseMovementEditorReturn {
  const setPlayerTarget = useCallback(
    (role: string, x: number, z: number, color?: string) => {
      setCreation((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((step, i) => {
          if (i !== prev.currentStepIndex) return step;
          const newMovements = new Map(step.movements);
          newMovements.set(role, {
            targetX: x,
            targetZ: z,
            color: color || POSITION_FALLBACK_HEX_COLOR,
          });
          return { ...step, movements: newMovements };
        });
        return { ...prev, steps };
      });
    },
    [setCreation],
  );

  const removePlayerTarget = useCallback(
    (role: string) => {
      setCreation((prev) => {
        if (!prev) return prev;
        const steps = prev.steps.map((step, i) => {
          if (i !== prev.currentStepIndex) return step;
          const newMovements = new Map(step.movements);
          newMovements.delete(role);
          return { ...step, movements: newMovements };
        });
        return { ...prev, steps };
      });
    },
    [setCreation],
  );

  const resetCurrentStep = useCallback(() => {
    setCreation((prev) => {
      if (!prev) return prev;
      const steps = prev.steps.map((step, i) => {
        if (i !== prev.currentStepIndex) return step;
        return { ...step, movements: new Map(), ballPasses: [] };
      });
      return { ...prev, steps };
    });
  }, [setCreation]);

  return { setPlayerTarget, removePlayerTarget, resetCurrentStep };
}
