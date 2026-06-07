/**
 * @module useTacticCreation
 * @description タクティクス作成ウィザードの状態管理フック。
 * 選手移動・ボールパスのステップ編集からTacticエンティティの構築までを提供する。
 *
 * 内部は責務ごとに分割された子フックを合成する構造:
 * - {@link useMovementEditor} 選手移動の編集
 * - {@link useBallPassEditor} ボールパスの編集
 * - {@link useTacticBuilder} Tacticエンティティ構築 & プレビュー生成
 */
import { useState, useCallback } from "react";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { Tactic } from "@domain/entities/Tactic";
import type { Formation } from "@domain/entities/Formation";
import type { PhaseKey } from "@shared/constants/phases";
import {
  createEmptyStep,
  type CreationState,
  type WizardStep,
  type ArrowPreview,
  type BallPassPreview,
} from "./tacticCreationTypes";
import { useMovementEditor } from "./useMovementEditor";
import { useBallPassEditor } from "./useBallPassEditor";
import { useTacticBuilder } from "./useTacticBuilder";
import { restoreCreationStateFromTactic } from "./restoreCreationStateFromTactic";

// 型の再エクスポート（後方互換性）
export { phaseKeyToPhaseType } from "./tacticCreationTypes";
export type {
  CreationStepBallPass,
  CreationStep,
  WizardStep,
  CreationState,
} from "./tacticCreationTypes";

// ---------------------------------------------------------------------------
// 戻り値の型
// ---------------------------------------------------------------------------

export interface UseTacticCreationReturn {
  creation: CreationState | null;

  // ライフサイクル
  startCreation: (
    formationName: string,
    gamePhase: PhaseKey,
    formationId?: string,
  ) => void;
  startCreationFromTactic: (
    tactic: Tactic,
    formationName: string,
    copyUntilStep?: number,
    formationId?: string,
  ) => void;
  cancelCreation: () => void;

  // 移動編集（useMovementEditor）
  setPlayerTarget: (role: string, x: number, z: number, color?: string) => void;
  removePlayerTarget: (role: string) => void;
  resetCurrentStep: () => void;

  // ボールパス編集（useBallPassEditor）
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

  // ステップ管理
  addStep: () => void;
  switchToStep: (index: number) => void;

  // メタデータ
  setNameJa: (name: string) => void;
  setNameEn: (name: string) => void;
  setIcon: (icon: string) => void;
  setGamePhase: (phase: PhaseKey) => void;

  // ウィザード & タイムライン
  setWizardStep: (step: WizardStep) => void;
  setTimelineOpen: (open: boolean) => void;
  setMovementDelay: (stepIndex: number, role: string, delay: number) => void;
  setStepDuration: (stepIndex: number, duration: number) => void;

  // ボール位置 & 軌道
  setBallPosition: (pos: { x: number; z: number } | null) => void;
  setBallTrajectory: (
    trajectory: {
      endX: number;
      endZ: number;
      color: string;
      trajectoryType: TrajectoryType;
    } | null,
  ) => void;
  setTrajectoryType: (type: TrajectoryType) => void;

  // セットポジション
  setSetPosition: (role: string, x: number, z: number) => void;
  resetSetPositions: () => void;

  // ビルダー & プレビュー（useTacticBuilder）
  buildTactic: (formation: Formation, stepIndex?: number) => Tactic;
  getPreviewArrows: (formation: Formation) => ArrowPreview[];
  getPreviewBallPasses: (formation: Formation) => BallPassPreview[];
  getStepStartPositions: (
    stepIndex: number,
    formation: Formation,
  ) => Record<number, { x: number; z: number }>;
}

// ---------------------------------------------------------------------------
// フック本体
// ---------------------------------------------------------------------------

/**
 * タクティクス作成ウィザードの状態管理。
 *
 * 選手の移動先・矢印・ボールパスなどのステップを順に案内し、
 * 最終的に {@link Tactic} エンティティを構築して保存する。
 *
 * 内部は責務ごとに分割された子フックを合成する:
 * - useMovementEditor: 選手移動の追加・削除・リセット
 * - useBallPassEditor: ボールパスの追加・削除・軌道タイプ変更
 * - useTacticBuilder: Tacticエンティティ構築 & プレビュー生成
 */
export function useTacticCreation(): UseTacticCreationReturn {
  const [creation, setCreation] = useState<CreationState | null>(null);

  // ----- 子フック合成 ---------------------------------------------------------

  const { setPlayerTarget, removePlayerTarget, resetCurrentStep } =
    useMovementEditor(setCreation);

  const {
    addBallPass,
    addBallPassByCoords,
    removeBallPass,
    updateBallPassTrajectoryType,
  } = useBallPassEditor(setCreation);

  const {
    buildTactic,
    getPreviewArrows,
    getPreviewBallPasses,
    getStepStartPositions,
  } = useTacticBuilder(creation);

  // ----- ライフサイクル -------------------------------------------------------

  const startCreation = useCallback(
    (formationName: string, gamePhase: PhaseKey, formationId?: string) => {
      setCreation({
        nameJa: "",
        nameEn: "",
        icon: "\u26BD",
        gamePhase,
        formationId: formationId ?? formationName,
        formationName,
        currentStepIndex: 0,
        steps: [createEmptyStep(1)],
        timelineOpen: false,
        movementDelays: {},
        wizardStep: "metadata",
        ballPosition: null,
        ballTrajectory: null,
        setPositions: new Map(),
      });
    },
    [],
  );

  const cancelCreation = useCallback(() => {
    setCreation(null);
  }, []);

  const startCreationFromTactic = useCallback(
    (
      tactic: Tactic,
      formationName: string,
      copyUntilStep?: number,
      formationId?: string,
    ) => {
      setCreation(
        restoreCreationStateFromTactic({
          tactic,
          formationName,
          formationId,
          copyUntilStep,
        }),
      );
    },
    [],
  );

  // ----- ステップ管理 -------------------------------------------------------

  const addStep = useCallback(() => {
    setCreation((prev) => {
      if (!prev) return prev;
      const maxId = prev.steps.reduce((max, s) => Math.max(max, s.id), 0);
      const newStep = createEmptyStep(maxId + 1);
      const newSteps = [...prev.steps, newStep];
      return {
        ...prev,
        steps: newSteps,
        currentStepIndex: newSteps.length - 1,
      };
    });
  }, []);

  const switchToStep = useCallback((index: number) => {
    setCreation((prev) => {
      if (!prev) return prev;
      const clamped = Math.max(0, Math.min(index, prev.steps.length - 1));
      return { ...prev, currentStepIndex: clamped };
    });
  }, []);

  // ----- メタデータセッター ---------------------------------------------------

  const setNameJa = useCallback((nameJa: string) => {
    setCreation((prev) => (prev ? { ...prev, nameJa } : prev));
  }, []);

  const setNameEn = useCallback((nameEn: string) => {
    setCreation((prev) => (prev ? { ...prev, nameEn } : prev));
  }, []);

  const setIcon = useCallback((icon: string) => {
    setCreation((prev) => (prev ? { ...prev, icon } : prev));
  }, []);

  const setGamePhase = useCallback((phase: PhaseKey) => {
    setCreation((prev) => (prev ? { ...prev, gamePhase: phase } : prev));
  }, []);

  // ----- ウィザードステップ ---------------------------------------------------

  const setWizardStep = useCallback((step: WizardStep) => {
    setCreation((prev) => (prev ? { ...prev, wizardStep: step } : prev));
  }, []);

  // ----- ボール位置 & 軌道 ---------------------------------------------------

  const setBallPosition = useCallback(
    (pos: { x: number; z: number } | null) => {
      setCreation((prev) => (prev ? { ...prev, ballPosition: pos } : prev));
    },
    [],
  );

  const setBallTrajectory = useCallback(
    (
      trajectory: {
        endX: number;
        endZ: number;
        color: string;
        trajectoryType: TrajectoryType;
      } | null,
    ) => {
      setCreation((prev) =>
        prev ? { ...prev, ballTrajectory: trajectory } : prev,
      );
    },
    [],
  );

  const setTrajectoryType = useCallback((type: TrajectoryType) => {
    setCreation((prev) => {
      if (!prev || !prev.ballTrajectory) return prev;
      return {
        ...prev,
        ballTrajectory: { ...prev.ballTrajectory, trajectoryType: type },
      };
    });
  }, []);

  // ----- セットポジション（セットプレー開始位置） --------------------------------

  const setSetPosition = useCallback((role: string, x: number, z: number) => {
    setCreation((prev) => {
      if (!prev) return prev;
      const newPositions = new Map(prev.setPositions);
      newPositions.set(role, { x, z });
      return { ...prev, setPositions: newPositions };
    });
  }, []);

  const resetSetPositions = useCallback(() => {
    setCreation((prev) => (prev ? { ...prev, setPositions: new Map() } : prev));
  }, []);

  // ----- タイムライン & ディレイ ------------------------------------------------

  const setTimelineOpen = useCallback((open: boolean) => {
    setCreation((prev) => (prev ? { ...prev, timelineOpen: open } : prev));
  }, []);

  const setMovementDelay = useCallback(
    (stepIndex: number, role: string, delay: number) => {
      setCreation((prev) => {
        if (!prev) return prev;
        const step = prev.steps[stepIndex];
        if (!step) return prev;
        const stepDelays = prev.movementDelays[step.id] ?? {};
        return {
          ...prev,
          movementDelays: {
            ...prev.movementDelays,
            [step.id]: { ...stepDelays, [role]: delay },
          },
        };
      });
    },
    [],
  );

  const setStepDuration = useCallback((stepIndex: number, duration: number) => {
    setCreation((prev) => {
      if (!prev) return prev;
      const steps = prev.steps.map((step, i) => {
        if (i !== stepIndex) return step;
        return { ...step, duration };
      });
      return { ...prev, steps };
    });
  }, []);

  // ----- 戻り値 -------------------------------------------------------------

  return {
    creation,

    startCreation,
    startCreationFromTactic,
    cancelCreation,

    setPlayerTarget,
    removePlayerTarget,
    addBallPass,
    addBallPassByCoords,
    removeBallPass,
    updateBallPassTrajectoryType,
    addStep,
    switchToStep,

    setNameJa,
    setNameEn,
    setIcon,
    setGamePhase,

    setWizardStep,
    setTimelineOpen,
    setMovementDelay,
    setStepDuration,
    resetCurrentStep,

    setBallPosition,
    setBallTrajectory,
    setTrajectoryType,
    setSetPosition,
    resetSetPositions,

    buildTactic,
    getPreviewArrows,
    getPreviewBallPasses,
    getStepStartPositions,
  };
}
