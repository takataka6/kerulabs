/**
 * @module useMergedTacticDisplay
 * @description タクティクス実行・作成・手動操作の表示データをマージするフック。
 * 選手位置・矢印・ボール軌道の統合表示を提供する。
 */
import { useMemo } from "react";
import type { Formation } from "@domain/entities/Formation";
import type { UseTacticCreationReturn } from "./useTacticCreation";
import type { BallTrajectoryEntry } from "./useTacticExecution";
import { DEFAULT_BALL_PASS_COLOR } from "@shared/constants";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { ArrowPreview, BallPassPreview } from "./tacticCreationTypes";

export interface MergedTacticDisplayParams {
  /** 実行中の選手位置 */
  executionPlayerPositions: Record<number, { x: number; z: number }>;
  /** 手動ドラッグによる選手位置 */
  manualPlayerPositions: Record<number, { x: number; z: number }>;
  /** タクティクス作成フック */
  tacticCreation: UseTacticCreationReturn;
  /** 現在のフォーメーション */
  currentFormation: Formation | undefined;
  /** タクティクス実行中かどうか */
  isExecuting: boolean;
  /** 実行中タクティクスID */
  activeTacticId: string | null;
  /** 実行フェーズ */
  executionPhase: string | null;
  /** 実行中の矢印データ */
  executionArrows: ArrowPreview[];
  /** 実行中のボール軌道データ */
  executionBallTrajectories: BallTrajectoryEntry[];
  /** 実行中のボール位置 */
  executingBallPosition: { x: number; z: number } | null;
  /** ボールパス作成の開始位置 */
  ballPassStartPos: { x: number; z: number } | null;
  /** ボールパス作成の仮終了位置 */
  ballPassPendingEndPos: { x: number; z: number } | null;
  /** ボールパス軌道タイプ */
  ballPassTrajectoryType: TrajectoryType;
}

export interface MergedTacticDisplayReturn {
  mergedPlayerPositions: Record<number, { x: number; z: number }>;
  mergedArrows: ArrowPreview[];
  mergedBallTrajectories: BallTrajectoryEntry[];
  ballHighlightPosition: { x: number; z: number } | null;
  creationArrows: ArrowPreview[];
  creationBallPassPreviews: BallPassPreview[];
}

/**
 * タクティクスの実行・作成・手動操作の表示データを統合する。
 *
 * 以下のデータソースをマージして最終的な表示データを計算する:
 * - タクティクス実行エンジンからの位置・矢印・ボール軌道
 * - 作成ウィザードのプレビュー矢印・ボールパス
 * - 手動ドラッグによる位置上書き
 * - ボールパス作成中の仮表示
 */
export function useMergedTacticDisplay(
  params: MergedTacticDisplayParams,
): MergedTacticDisplayReturn {
  const {
    executionPlayerPositions,
    manualPlayerPositions,
    tacticCreation,
    currentFormation,
    isExecuting,
    activeTacticId,
    executionPhase,
    executionArrows,
    executionBallTrajectories,
    executingBallPosition,
    ballPassStartPos,
    ballPassPendingEndPos,
    ballPassTrajectoryType,
  } = params;

  // ── マージ済みポジション ──
  const mergedPlayerPositions = useMemo(() => {
    const result: Record<number, { x: number; z: number }> = {
      ...executionPlayerPositions,
    };
    if (
      tacticCreation.creation &&
      currentFormation &&
      !isExecuting &&
      !activeTacticId
    ) {
      const stepStart = tacticCreation.getStepStartPositions(
        tacticCreation.creation.currentStepIndex,
        currentFormation,
      );
      for (const [key, pos] of Object.entries(stepStart)) {
        result[Number(key)] = pos;
      }
    }
    for (const [key, pos] of Object.entries(manualPlayerPositions)) {
      result[Number(key)] = pos;
    }
    return result;
  }, [
    executionPlayerPositions,
    manualPlayerPositions,
    tacticCreation,
    currentFormation,
    isExecuting,
    activeTacticId,
  ]);

  // ── 作成矢印 ──
  const creationArrows = useMemo(() => {
    if (!tacticCreation.creation || !currentFormation) return [];
    if (isExecuting || activeTacticId) return [];
    return tacticCreation.getPreviewArrows(currentFormation);
  }, [tacticCreation, currentFormation, isExecuting, activeTacticId]);

  const mergedArrows = useMemo(() => {
    return [...executionArrows, ...creationArrows];
  }, [executionArrows, creationArrows]);

  // ── ボール軌道 ──
  const creationBallTrajectories = useMemo(() => {
    if (
      !tacticCreation.creation?.ballPosition ||
      !tacticCreation.creation?.ballTrajectory
    )
      return [];
    return [
      {
        start: tacticCreation.creation.ballPosition,
        end: {
          x: tacticCreation.creation.ballTrajectory.endX,
          z: tacticCreation.creation.ballTrajectory.endZ,
        },
        color: tacticCreation.creation.ballTrajectory.color,
        trajectoryType: tacticCreation.creation.ballTrajectory.trajectoryType,
      },
    ];
  }, [tacticCreation.creation]);

  const creationBallPassPreviews = useMemo(() => {
    if (!tacticCreation.creation || !currentFormation) return [];
    if (isExecuting || activeTacticId) return [];
    return tacticCreation.getPreviewBallPasses(currentFormation);
  }, [tacticCreation, currentFormation, isExecuting, activeTacticId]);

  const pendingBallPassPreview = useMemo(() => {
    if (!ballPassStartPos || !ballPassPendingEndPos) return [];
    return [
      {
        start: ballPassStartPos,
        end: ballPassPendingEndPos,
        color: DEFAULT_BALL_PASS_COLOR,
        trajectoryType: ballPassTrajectoryType,
      },
    ];
  }, [ballPassStartPos, ballPassPendingEndPos, ballPassTrajectoryType]);

  const mergedBallTrajectories = useMemo(() => {
    const hideTrajectory =
      executionPhase === "highlight" || executionPhase === "set";
    const trajectories = hideTrajectory ? [] : executionBallTrajectories;
    return [
      ...trajectories,
      ...creationBallTrajectories,
      ...creationBallPassPreviews,
      ...pendingBallPassPreview,
    ];
  }, [
    executionBallTrajectories,
    creationBallTrajectories,
    creationBallPassPreviews,
    pendingBallPassPreview,
    executionPhase,
  ]);

  // ── ボールハイライト位置 ──
  const ballHighlightPosition = useMemo(() => {
    if (executionPhase !== "highlight") return null;
    if (tacticCreation.creation?.ballPosition) {
      return tacticCreation.creation.ballPosition;
    }
    if (executingBallPosition) {
      return executingBallPosition;
    }
    return null;
  }, [executionPhase, tacticCreation.creation, executingBallPosition]);

  return {
    mergedPlayerPositions,
    mergedArrows,
    mergedBallTrajectories,
    ballHighlightPosition,
    creationArrows,
    creationBallPassPreviews,
  };
}
