/**
 * @module useTacticsOrchestration
 * @description 戦術の作成・実行・マージを統括する中核オーケストレーションフック。
 * 内部で複数の戦術関連フックを統合管理する。
 *
 * 責務ごとに分割された子フックを合成する構造:
 * - {@link useManualPositions} 手動プレイヤー位置
 * - {@link useBallPassCreation} ボールパス作成状態
 * - {@link useMergedTacticDisplay} 表示データのマージ
 */
import { useCallback, useMemo, useRef } from "react";
import type { Formation } from "@domain/entities/Formation";
import type { Tactic } from "@domain/entities/Tactic";
import type { Team } from "@domain/entities/Team";
import type { PhaseKey } from "@shared/constants/phases";
import type { SetPlayType } from "@shared/constants/setPlayTypes";
import type { TranslationKey } from "@shared/i18n/translations";
import { translations } from "@shared/i18n/translations";
import { handleError } from "@shared/errors/handleError";
import {
  POSITION_HEX_COLORS,
  POSITION_FALLBACK_HEX_COLOR,
} from "@shared/constants/positionColors";
import { useTacticCreation, type WizardStep } from "./useTacticCreation";
import { useTacticExecution } from "./useTacticExecution";
import { useConfirm } from "@presentation/components/ui";
import { useSaveTactic } from "../queries/useSaveTactic";
import { useDeleteTactic } from "../queries/useDeleteTactic";
import type { useBallPlacement } from "../field/useBallPlacement";
import type { useConnectionLines } from "../field/useConnectionLines";
import type { useOpponents } from "../field/useOpponents";
import type { usePlayerView } from "../ui/usePlayerView";
import { useManualPositions } from "./useManualPositions";
import { useBallPassCreation } from "./useBallPassCreation";
import { useMergedTacticDisplay } from "./useMergedTacticDisplay";
import { useTacticShareHandlers } from "./useTacticShareHandlers";
import { createPreviewTacticFromCopyRange } from "./restoreCreationStateFromTactic";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";
import { useTacticsModeReset } from "./useTacticsModeReset";

const COPY_CREATION_COMPLETION_BUFFER_MS = 1500;

function buildDefaultTacticNames(gamePhase: PhaseKey, count: number) {
  const isSetPlayPhase =
    gamePhase === "set_piece" ||
    gamePhase === "throw_in" ||
    gamePhase === "goal_kick";

  if (!isSetPlayPhase) {
    return {
      ja: `${translations.ja["tactics.creation.defaultName"]}${count}`,
      en: `${translations.en["tactics.creation.defaultName"]} ${count}`,
    };
  }

  const phaseKey = `phase.${gamePhase}` as TranslationKey;
  return {
    ja: `${translations.ja[phaseKey]}${count}`,
    en: `${translations.en[phaseKey]} ${count}`,
  };
}

/**
 * 戦術の作成・実行・マージを統括する中核フック。
 *
 * 内部で useTacticCreation, useTacticExecution, useSaveTactic, useDeleteTactic を保持し、
 * 手動プレイヤー位置、ボールパス作成、プレビュー位置のマージなどを一括管理する。
 *
 * @param params.currentFormation - アクティブなフォーメーション（選手スロット数と基準位置を定義）。
 * @param params.selectedTeam - 現在選択中のチーム（タクティクス保存コンテキストに使用）。
 * @param params.tactics - React Query から取得した現在のフェーズのタクティクス一覧。
 * @param params.playMode - `"field"` または `"setPlay"` — タクティクスのフェーズマッピングを決定する。
 * @param params.selectedPhase - 現在選択中のフェーズキー。
 * @param params.selectedSetPlayType - 現在選択中のセットプレータイプ（`playMode` が `"setPlay"` の場合）。
 * @param params.ballHook - ボール配置フックのインスタンス。
 * @param params.connLines - 接続ラインフックのインスタンス。
 * @param params.opponentsHook - 相手チームフックのインスタンス。
 * @param params.playerView - プレイヤー視点フックのインスタンス。
 * @param params.pushCurrentSnapshot - Undo/Redoスナップショットを記録するコールバック。
 * @param params.showToast - トースト通知コールバック。
 * @param params.t - i18n翻訳関数。
 * @returns マージ済みの選手ポジション、矢印、ボール軌道、タクティクスCRUDハンドラー、
 *          作成ウィザードの状態、および実行トリガー。
 */
export function useTacticsOrchestration(params: {
  currentFormation: Formation | undefined;
  selectedTeam: Team | undefined;
  tactics: Tactic[] | undefined;
  allTactics?: Tactic[] | undefined;
  playMode: "field" | "setPlay";
  selectedPhase: PhaseKey;
  selectedSetPlayType: SetPlayType;
  ballHook: ReturnType<typeof useBallPlacement>;
  connLines: ReturnType<typeof useConnectionLines>;
  opponentsHook: Pick<
    ReturnType<typeof useOpponents>,
    "setOpponentPlacementMode" | "opponents"
  >;
  playerView: ReturnType<typeof usePlayerView>;
  pushCurrentSnapshot: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
  t: (key: TranslationKey) => string;
}) {
  const {
    currentFormation,
    // selectedTeam は現在 tacticsForCurrentFormation のフィルタで使用していないが、
    // 呼び出し元（TacticsViewerPage など）のインターフェース互換のため残す。
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedTeam: _selectedTeam,
    tactics,
    allTactics,
    playMode,
    selectedPhase,
    selectedSetPlayType,
    ballHook,
    connLines,
    opponentsHook,
    playerView,
    pushCurrentSnapshot,
    showToast,
    t,
  } = params;

  const { confirm } = useConfirm();

  // ── 子フック合成 ──
  const {
    manualPlayerPositions,
    setManualPlayerPositions,
    clearManualPositions,
  } = useManualPositions();

  const ballPassState = useBallPassCreation();

  // ── 内部フック ──
  const tacticCreation = useTacticCreation();
  const saveTacticMutation = useSaveTactic();
  const deleteTacticMutation = useDeleteTactic();
  const {
    execute: executeTactic,
    startStepExecution,
    executeNextStep,
    exitStepMode,
    reset: resetTactic,
    isExecuting,
    activeTacticId,
    executionPhase,
    executingBallPosition,
    playerPositions,
    arrows,
    ballTrajectories,
    stepExecution,
  } = useTacticExecution(currentFormation ?? undefined);
  const tacticCopyPreviewRequestRef = useRef(0);
  const tacticCopyCreationTimeoutRef = useRef<number | null>(null);

  // インタラクティブモードの一括リセットを一元管理（Phase 3 で重複を削減）
  const { resetInteractionModes } = useTacticsModeReset({
    opponentsHook,
    ballHook,
    connLines,
    playerView,
    clearManualPositions,
    resetTactic,
  });

  // 小さなヘルパー: ステップ変更時の共通リセット（Phase 3 thinning）
  const resetForStepChange = useCallback(() => {
    resetTactic();
    clearManualPositions();
  }, [resetTactic, clearManualPositions]);

  // 作成中へのドラッグ適用ロジックを抽出（重複削減）
  const applyDragToCreation = useCallback(
    (playerIndex: number, playerPos: { x: number; z: number }) => {
      if (!tacticCreation.creation || !currentFormation) return;

      const roleMap = currentFormation.roleMap;
      let role: string | null = null;
      roleMap.forEach((mappedIndex, roleKey) => {
        if (mappedIndex === playerIndex) role = roleKey;
      });
      if (!role) return;

      if (tacticCreation.creation.wizardStep === "setPosition") {
        tacticCreation.setSetPosition(role, playerPos.x, playerPos.z);
      } else {
        const cat = currentFormation.positions[playerIndex]?.category;
        tacticCreation.setPlayerTarget(
          role,
          playerPos.x,
          playerPos.z,
          POSITION_HEX_COLORS[cat as keyof typeof POSITION_HEX_COLORS] ||
            POSITION_FALLBACK_HEX_COLOR,
        );
      }
    },
    [tacticCreation, currentFormation],
  );

  const clearPendingTacticCopyCreation = useCallback(() => {
    if (tacticCopyCreationTimeoutRef.current !== null) {
      window.clearTimeout(tacticCopyCreationTimeoutRef.current);
      tacticCopyCreationTimeoutRef.current = null;
    }
  }, []);

  /** タクティクスIDからタクティクスを検索するユーティリティ */
  const findTacticById = useCallback(
    (tacticId: string) =>
      tactics?.find((t) => t.id.value === tacticId) ??
      allTactics?.find((t) => t.id.value === tacticId),
    [tactics, allTactics],
  );

  const activeTactic = findTacticById(activeTacticId ?? "");
  const undoRedoEnabled = !tacticCreation.creation;

  // ── 作成状態の派生値 ──
  const isCreationBallPositionStep =
    tacticCreation.creation?.wizardStep === "ballPosition";
  const isCreationBallTrajectoryStep =
    tacticCreation.creation?.wizardStep === "ballTrajectory";

  const effectiveBallPosition = tacticCreation.creation
    ? tacticCreation.creation.ballPosition
    : (executingBallPosition ?? ballHook.ballPosition);

  const effectiveBallPlacementMode =
    isCreationBallPositionStep ||
    isCreationBallTrajectoryStep ||
    ballPassState.ballPassCreationMode ||
    ballHook.ballPlacementMode;

  // ── マージ済み表示データ ──
  const {
    mergedPlayerPositions,
    mergedArrows,
    mergedBallTrajectories,
    ballHighlightPosition,
  } = useMergedTacticDisplay({
    executionPlayerPositions: playerPositions,
    manualPlayerPositions,
    tacticCreation,
    currentFormation,
    isExecuting,
    activeTacticId,
    executionPhase,
    executionArrows: arrows,
    executionBallTrajectories: ballTrajectories,
    executingBallPosition,
    ballPassStartPos: ballPassState.ballPassStartPos,
    ballPassPendingEndPos: ballPassState.ballPassPendingEndPos,
    ballPassTrajectoryType: ballPassState.ballPassTrajectoryType,
  });

  /** 作成中のタクティクスにムーブメントまたはボールパスが含まれるか判定 */
  const hasCreationContent = useCallback(
    () =>
      tacticCreation.creation?.steps.some(
        (s) => s.movements.size > 0 || s.ballPasses.length > 0,
      ) ?? false,
    [tacticCreation.creation],
  );

  // ── タクティクス作成ハンドラー ──
  const startTacticCreation = useCallback(() => {
    if (!currentFormation) return;
    clearPendingTacticCopyCreation();
    resetInteractionModes();
    const phase = playMode === "field" ? selectedPhase : selectedSetPlayType;
    tacticCreation.startCreation(
      currentFormation.name,
      phase,
      currentFormation.id.value,
    );
  }, [
    currentFormation,
    selectedPhase,
    selectedSetPlayType,
    playMode,
    resetInteractionModes,
    tacticCreation,
    clearPendingTacticCopyCreation,
  ]);

  const startTacticCreationFromCopy = useCallback(
    (tacticId: string, copyUntilStep?: number) => {
      if (!currentFormation || stepExecution.isStepMode) return;
      const tactic = findTacticById(tacticId);
      if (!tactic) return;

      clearPendingTacticCopyCreation();
      resetInteractionModes();
      const previewTactic = createPreviewTacticFromCopyRange({
        tactic,
        formationKey: currentFormation.id.value,
        copyUntilStep:
          copyUntilStep ??
          (tactic.hasSetupStepExecution
            ? Math.max(1, tactic.totalSteps - 1)
            : tactic.totalSteps),
      });
      const previewMovements = previewTactic.getMovementsForFormation(
        currentFormation.id.value,
      );
      const previewBallPasses = previewTactic.getBallPassesForFormation(
        currentFormation.id.value,
      );
      const maxDelay = Math.max(
        0,
        ...previewMovements.map((movement) => movement.delay),
        ...previewBallPasses.map((ballPass) => ballPass.delay),
      );

      executeTactic(previewTactic, currentFormation);
      tacticCopyCreationTimeoutRef.current = window.setTimeout(
        () => {
          tacticCopyCreationTimeoutRef.current = null;
          resetTactic();
          tacticCreation.startCreationFromTactic(
            previewTactic,
            currentFormation.name,
            undefined,
            currentFormation.id.value,
          );
        },
        (maxDelay + COPY_CREATION_COMPLETION_BUFFER_MS) / getPlaybackSpeed(),
      );
    },
    [
      ballHook,
      clearPendingTacticCopyCreation,
      connLines,
      currentFormation,
      executeTactic,
      clearManualPositions,
      findTacticById,
      resetInteractionModes,
      opponentsHook,
      playerView,
      resetTactic,
      stepExecution.isStepMode,
      tacticCreation,
    ],
  );

  const previewTacticCopyRange = useCallback(
    (tacticId: string, copyUntilStep: number) => {
      if (!currentFormation || stepExecution.isStepMode) return;
      const tactic = findTacticById(tacticId);
      if (!tactic) return;

      tacticCopyPreviewRequestRef.current += 1;
      const requestId = tacticCopyPreviewRequestRef.current;
      resetTactic();
      clearManualPositions();
      const previewTactic = createPreviewTacticFromCopyRange({
        tactic,
        formationKey: currentFormation.id.value,
        copyUntilStep,
      });
      requestAnimationFrame(() => {
        if (tacticCopyPreviewRequestRef.current !== requestId) return;
        executeTactic(previewTactic, currentFormation);
      });
    },
    [
      currentFormation,
      stepExecution.isStepMode,
      findTacticById,
      resetTactic,
      clearManualPositions,
      executeTactic,
    ],
  );

  const clearTacticCopyPreview = useCallback(() => {
    clearPendingTacticCopyCreation();
    tacticCopyPreviewRequestRef.current += 1;
    resetTactic();
    clearManualPositions();
  }, [clearPendingTacticCopyCreation, resetTactic, clearManualPositions]);

  const cancelTacticCreation = useCallback(async () => {
    clearPendingTacticCopyCreation();
    if (
      tacticCreation.creation &&
      !(await confirm({ message: t("tactics.creation.confirmCancel") }))
    )
      return;
    tacticCreation.cancelCreation();
    clearManualPositions();
    ballPassState.resetBallPassState();
  }, [
    tacticCreation,
    t,
    confirm,
    clearManualPositions,
    ballPassState,
    clearPendingTacticCopyCreation,
  ]);

  const handleDeleteTactic = useCallback(
    async (tacticId: string) => {
      if (
        !(await confirm({
          message: t("tactics.creation.deleteConfirm"),
          variant: "red",
        }))
      ) {
        return;
      }
      await deleteTacticMutation.mutateAsync(tacticId);
    },
    [confirm, t, deleteTacticMutation],
  );

  const handleSaveTactic = useCallback(async () => {
    if (!tacticCreation.creation || !currentFormation) return;

    if (!hasCreationContent()) {
      showToast(t("tactics.creation.noMovements"), "error");
      return;
    }

    try {
      const tactic = tacticCreation.buildTactic(currentFormation);
      const customCount = (tactics || []).filter((t) => t.isCustom).length + 1;
      const updatedName = { ...tactic.name };
      const defaultNames = buildDefaultTacticNames(
        tacticCreation.creation.gamePhase,
        customCount,
      );
      if (!updatedName.ja?.trim()) {
        updatedName.ja = defaultNames.ja;
      }
      if (!updatedName.en?.trim()) {
        updatedName.en = defaultNames.en;
      }
      tactic.updateName(updatedName);

      await saveTacticMutation.mutateAsync(tactic);
      tacticCreation.cancelCreation();
      resetTactic();
      clearManualPositions();
      showToast(t("tactics.creation.saved"), "success");
    } catch (error) {
      handleError(error, "database", "Failed to save tactic", {
        toast: { show: showToast, message: t("tactics.creation.saveFailed") },
      });
    }
  }, [
    tacticCreation,
    currentFormation,
    saveTacticMutation,
    resetTactic,
    clearManualPositions,
    hasCreationContent,
    t,
    tactics,
    showToast,
  ]);

  const handlePreviewTactic = useCallback(() => {
    if (!tacticCreation.creation || !currentFormation) return;
    if (!hasCreationContent()) return;

    try {
      const tactic = tacticCreation.buildTactic(currentFormation);
      clearManualPositions();
      resetTactic();
      executeTactic(tactic, currentFormation);
    } catch (error) {
      handleError(error, "ui", "Tactic preview failed", {
        toast: {
          show: showToast,
          message: t("tactics.creation.previewFailed"),
        },
      });
    }
  }, [
    tacticCreation,
    currentFormation,
    executeTactic,
    resetTactic,
    clearManualPositions,
    hasCreationContent,
    showToast,
    t,
  ]);

  const {
    customTactics,
    hasCustomTactics,
    handleExportTactics,
    exportTacticsToJson,
    downloadExportJson,
    handleImportTactics,
    handleImportFromJson,
  } = useTacticShareHandlers({
    tactics,
    saveTacticMutation,
    showToast,
    t,
  });

  const triggerTactic = useCallback(
    (tacticId: string) => {
      if (isExecuting || stepExecution.isStepMode || !currentFormation) return;
      clearPendingTacticCopyCreation();
      const tactic = findTacticById(tacticId);
      if (!tactic) return;
      clearManualPositions();
      resetTactic();
      executeTactic(tactic, currentFormation);
    },
    [
      clearPendingTacticCopyCreation,
      isExecuting,
      currentFormation,
      findTacticById,
      executeTactic,
      clearManualPositions,
      stepExecution.isStepMode,
      resetTactic,
    ],
  );

  const triggerStepTactic = useCallback(
    (tacticId: string) => {
      if (isExecuting || stepExecution.isStepMode || !currentFormation) return;
      clearPendingTacticCopyCreation();
      const tactic = findTacticById(tacticId);
      if (!tactic?.supportsStepExecution) return;
      clearManualPositions();
      startStepExecution(tactic, currentFormation);
    },
    [
      isExecuting,
      stepExecution.isStepMode,
      currentFormation,
      clearPendingTacticCopyCreation,
      findTacticById,
      clearManualPositions,
      startStepExecution,
    ],
  );

  // ── プレイヤードラッグ終了 ──
  const handlePlayerDragEnd = useCallback(
    (index: number, pos: { x: number; z: number }) => {
      applyDragToCreation(index, pos);
      setManualPlayerPositions((prev) => ({ ...prev, [index]: pos }));
      pushCurrentSnapshot();
    },
    [applyDragToCreation, setManualPlayerPositions, pushCurrentSnapshot],
  );

  const handleGroupPlayerDragEnd = useCallback(
    (positions: Array<{ index: number; pos: { x: number; z: number } }>) => {
      if (positions.length === 0) {
        pushCurrentSnapshot();
        return;
      }

      const nextPositions: Record<number, { x: number; z: number }> = {};

      for (const { index, pos } of positions) {
        applyDragToCreation(index, pos);
        nextPositions[index] = pos;
      }

      setManualPlayerPositions((prev) => ({ ...prev, ...nextPositions }));
      pushCurrentSnapshot();
    },
    [applyDragToCreation, setManualPlayerPositions, pushCurrentSnapshot],
  );

  // ── タクティクス作成ツールバーハンドラー ──
  const handleWizardStepChange = useCallback(
    (step: WizardStep) => {
      const prevStep = tacticCreation.creation?.wizardStep;
      if (prevStep === "setPosition" || prevStep === "editing") {
        clearManualPositions();
      }
      ballPassState.resetBallPassState();
      tacticCreation.setWizardStep(step);
    },
    [tacticCreation, clearManualPositions, ballPassState],
  );

  const handleSwitchStep = useCallback(
    (index: number) => {
      tacticCreation.switchToStep(index);
      resetForStepChange();
    },
    [tacticCreation, resetForStepChange],
  );

  const handleAddStep = useCallback(() => {
    tacticCreation.addStep();
    resetForStepChange();
  }, [tacticCreation, resetForStepChange]);

  const handleResetStep = useCallback(() => {
    tacticCreation.resetCurrentStep();
    clearManualPositions();
  }, [tacticCreation, clearManualPositions]);

  const handleResetPreview = useCallback(() => {
    resetForStepChange();
  }, [resetForStepChange]);

  // ── フィルタ済みタクティクス ──
  const tacticsForCurrentFormation = useMemo(() => {
    if (!tactics || !currentFormation) return [];
    return tactics.filter((t) =>
      t.supportsFormation(currentFormation.id.value),
    );
  }, [tactics, currentFormation]);

  return {
    // ── 手動ポジション ──
    manualPlayerPositions,
    setManualPlayerPositions,
    clearManualPositions,

    // ── ボールパス作成 ──
    ballPassCreationMode: ballPassState.ballPassCreationMode,
    setBallPassCreationMode: ballPassState.setBallPassCreationMode,
    ballPassStartPos: ballPassState.ballPassStartPos,
    setBallPassStartPos: ballPassState.setBallPassStartPos,
    ballPassPendingEndPos: ballPassState.ballPassPendingEndPos,
    setBallPassPendingEndPos: ballPassState.setBallPassPendingEndPos,
    ballPassTrajectoryType: ballPassState.ballPassTrajectoryType,
    setBallPassTrajectoryType: ballPassState.setBallPassTrajectoryType,

    // ── タクティクス作成コア ──
    tacticCreation,
    deleteTacticMutation,

    // ── タクティクス実行 ──
    isExecuting,
    activeTacticId,
    executionPhase,
    resetTactic,
    executeTactic,
    activeTactic,
    undoRedoEnabled,

    // ── 作成状態の派生値 ──
    isCreationBallPositionStep,
    isCreationBallTrajectoryStep,
    effectiveBallPosition,
    effectiveBallPlacementMode,

    // ── マージ済み表示データ ──
    mergedPlayerPositions,
    mergedArrows,
    mergedBallTrajectories,
    ballHighlightPosition,

    // ── ハンドラー ──
    startTacticCreation,
    startTacticCreationFromCopy,
    previewTacticCopyRange,
    clearTacticCopyPreview,
    cancelTacticCreation,
    handleDeleteTactic,
    handleSaveTactic,
    handlePreviewTactic,
    handleExportTactics,
    handleImportTactics,
    handleImportFromJson,
    handlePlayerDragEnd,
    handleGroupPlayerDragEnd,
    triggerTactic,
    triggerStepTactic,
    stepExecution,
    executeNextStep,
    exitStepMode,

    // ── ツールバーハンドラー ──
    handleWizardStepChange,
    handleSwitchStep,
    handleAddStep,
    handleResetStep,
    handleResetPreview,

    // ── フィルタ済みタクティクス ──
    customTactics,
    hasCustomTactics,
    exportTacticsToJson,
    downloadExportJson,
    tacticsForCurrentFormation,
  };
}
