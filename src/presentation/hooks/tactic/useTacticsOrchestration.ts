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
import { useCallback, useMemo } from "react";
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
    selectedTeam,
    tactics,
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
    reset: resetTactic,
    isExecuting,
    activeTacticId,
    executionPhase,
    executingBallPosition,
    playerPositions,
    arrows,
    ballTrajectories,
    stepExecution,
    startStepExecution,
    executeNextStep,
    exitStepMode,
  } = useTacticExecution(currentFormation ?? undefined);

  /** タクティクスIDからタクティクスを検索するユーティリティ */
  const findTacticById = useCallback(
    (tacticId: string) => tactics?.find((t) => t.id.value === tacticId),
    [tactics],
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
    opponentsHook.setOpponentPlacementMode(false);
    ballHook.setBallPlacementMode(false);
    connLines.resetLineDrawingState();
    playerView.setPlayerViewEnabled(false);
    playerView.setSelectedPlayerIndex(null);
    playerView.setSelectedOpponentViewId(null);
    clearManualPositions();
    resetTactic();
    const phase = playMode === "field" ? selectedPhase : selectedSetPlayType;
    tacticCreation.startCreation(currentFormation.name, phase);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- opponentsHook/ballHook/connLines/playerView のセッターは安定したディスパッチャー。ラッパーオブジェクトを含めると連鎖的な再生成が発生する
  }, [
    currentFormation,
    selectedPhase,
    selectedSetPlayType,
    playMode,
    resetTactic,
    tacticCreation,
    clearManualPositions,
  ]);

  const cancelTacticCreation = useCallback(async () => {
    if (
      tacticCreation.creation &&
      !(await confirm({ message: t("tactics.creation.confirmCancel") }))
    )
      return;
    tacticCreation.cancelCreation();
    clearManualPositions();
    ballPassState.resetBallPassState();
  }, [tacticCreation, t, confirm, clearManualPositions, ballPassState]);

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
      if (!updatedName.ja?.trim()) {
        updatedName.ja = `${translations.ja["tactics.creation.defaultName"]}${customCount}`;
      }
      if (!updatedName.en?.trim()) {
        updatedName.en = `${translations.en["tactics.creation.defaultName"]} ${customCount}`;
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
      resetTactic();
      clearManualPositions();
      const tactic = tacticCreation.buildTactic(currentFormation);
      requestAnimationFrame(() => {
        executeTactic(tactic, currentFormation);
      });
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
    hasCustomTactics,
    handleExportTactics,
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
      if (isExecuting || !currentFormation) return;
      const tactic = findTacticById(tacticId);
      if (!tactic) return;
      clearManualPositions();
      executeTactic(tactic, currentFormation);
    },
    [
      isExecuting,
      currentFormation,
      findTacticById,
      executeTactic,
      clearManualPositions,
    ],
  );

  const triggerStepTactic = useCallback(
    (tacticId: string) => {
      if (isExecuting || !currentFormation) return;
      const tactic = findTacticById(tacticId);
      if (!tactic || !tactic.supportsStepExecution) return;
      clearManualPositions();
      startStepExecution(tactic, currentFormation);
    },
    [
      isExecuting,
      currentFormation,
      findTacticById,
      startStepExecution,
      clearManualPositions,
    ],
  );

  // ── プレイヤードラッグ終了 ──
  const handlePlayerDragEnd = useCallback(
    (index: number, pos: { x: number; z: number }) => {
      if (tacticCreation.creation && currentFormation) {
        const roleMap = currentFormation.roleMap;
        let role: string | null = null;
        roleMap.forEach((playerIndex, roleKey) => {
          if (playerIndex === index) role = roleKey;
        });
        if (role) {
          if (tacticCreation.creation.wizardStep === "setPosition") {
            tacticCreation.setSetPosition(role, pos.x, pos.z);
          } else {
            const cat = currentFormation.positions[index]?.category;
            tacticCreation.setPlayerTarget(
              role,
              pos.x,
              pos.z,
              POSITION_HEX_COLORS[cat as keyof typeof POSITION_HEX_COLORS] ||
                POSITION_FALLBACK_HEX_COLOR,
            );
          }
        }
      }
      setManualPlayerPositions((prev) => ({ ...prev, [index]: pos }));
      pushCurrentSnapshot();
    },
    [
      tacticCreation,
      currentFormation,
      pushCurrentSnapshot,
      setManualPlayerPositions,
    ],
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
      resetTactic();
      clearManualPositions();
    },
    [tacticCreation, resetTactic, clearManualPositions],
  );

  const handleAddStep = useCallback(() => {
    tacticCreation.addStep();
    resetTactic();
    clearManualPositions();
  }, [tacticCreation, resetTactic, clearManualPositions]);

  const handleResetStep = useCallback(() => {
    tacticCreation.resetCurrentStep();
    clearManualPositions();
  }, [tacticCreation, clearManualPositions]);

  const handleResetPreview = useCallback(() => {
    resetTactic();
    clearManualPositions();
  }, [resetTactic, clearManualPositions]);

  // ── フィルタ済みタクティクス ──
  const tacticsForCurrentFormation = useMemo(() => {
    if (!tactics || !currentFormation) return [];
    const formationTactics = tactics.filter((t) =>
      t.supportsFormation(currentFormation.name),
    );
    if (!selectedTeam) return formationTactics;
    const whitelist = selectedTeam.getAvailableTacticsForFormation(
      currentFormation.name,
    );
    if (!whitelist) return formationTactics;
    return formationTactics.filter(
      (t) => t.isCustom || whitelist.includes(t.id.value),
    );
  }, [tactics, currentFormation, selectedTeam]);

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
    cancelTacticCreation,
    handleSaveTactic,
    handlePreviewTactic,
    handleExportTactics,
    handleImportTactics,
    handleImportFromJson,
    handlePlayerDragEnd,
    triggerTactic,
    triggerStepTactic,

    // ── ステップ実行 ──
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
    hasCustomTactics,
    tacticsForCurrentFormation,
  };
}
