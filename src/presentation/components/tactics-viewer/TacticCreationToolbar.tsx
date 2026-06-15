/**
 * @module TacticCreationToolbar
 * @description タクティクス作成時のツールバーコンポーネント。矢印色選択・ボールパスモード・リセット操作を表示する。
 */
import { useRef, useEffect } from "react";
import type { PhaseKey } from "@shared/constants";
import type { TranslationKey } from "@shared/i18n/translations";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import { useDraggable } from "@presentation/hooks/ui";
import type { TrajectoryType } from "@domain/entities/BallPass";
import {
  MetadataStep,
  BallPositionStep,
  BallTrajectoryStep,
  SetPositionStep,
  EditingStep,
  ConfirmStep,
} from "./tactic-creation";

// ---------------------------------------------------------------------------
// Props型
// ---------------------------------------------------------------------------

interface TacticCreationToolbarProps {
  creation: CreationState;
  language: string;
  isExecuting: boolean;
  isSetPlayMode?: boolean;
  t: (key: TranslationKey) => string;
  onNameJaChange: (name: string) => void;
  onNameEnChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onGamePhaseChange: (phase: PhaseKey) => void;
  onWizardStep: (step: WizardStep) => void;
  onSwitchStep: (index: number) => void;
  onAddStep: () => void;
  onResetStep: () => void;
  onResetPreview: () => void;
  onToggleTimeline: () => void;
  onTrajectoryTypeChange?: (type: TrajectoryType) => void;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  ballPassCreationMode?: boolean;
  ballPassStartPos?: { x: number; z: number } | null;
  selectedBallPassTrajectoryType?: TrajectoryType;
  onToggleBallPassMode?: () => void;
  onBallPassTrajectoryTypeChange?: (type: TrajectoryType) => void;
}

// ---------------------------------------------------------------------------
// コンポーネント — ウィザードステップルーター
// ---------------------------------------------------------------------------

export function TacticCreationToolbar(props: TacticCreationToolbarProps) {
  const {
    creation,
    language,
    isExecuting,
    t,
    onNameJaChange,
    onNameEnChange,
    onIconChange,
    onGamePhaseChange,
    onWizardStep,
    onSwitchStep,
    onAddStep,
    onResetStep,
    onResetPreview,
    onToggleTimeline,
    onTrajectoryTypeChange,
    onPreview,
    onSave,
    onCancel,
    ballPassCreationMode = false,
    ballPassStartPos = null,
    selectedBallPassTrajectoryType = "low",
    onToggleBallPassMode,
    onBallPassTrajectoryTypeChange,
  } = props;

  const { offset, isDragging, handlePointerDown, resetOffset } = useDraggable();
  const prevWizardStepRef = useRef(creation.wizardStep);

  // ステップ切替時にドラッグ位置をリセット
  useEffect(() => {
    if (prevWizardStepRef.current !== creation.wizardStep) {
      resetOffset();
      prevWizardStepRef.current = creation.wizardStep;
    }
  }, [creation.wizardStep, resetOffset]);

  // 共有ドラッグハンドルProps
  const dragProps = { offset, isDragging, handlePointerDown };

  switch (creation.wizardStep) {
    case "metadata":
      return (
        <MetadataStep
          creation={creation}
          {...dragProps}
          t={t}
          onNameJaChange={onNameJaChange}
          onNameEnChange={onNameEnChange}
          onIconChange={onIconChange}
          onGamePhaseChange={onGamePhaseChange}
          onWizardStep={onWizardStep}
          onCancel={onCancel}
        />
      );

    case "ballPosition":
      return (
        <BallPositionStep
          creation={creation}
          {...dragProps}
          t={t}
          onWizardStep={onWizardStep}
        />
      );

    case "ballTrajectory":
      return (
        <BallTrajectoryStep
          creation={creation}
          {...dragProps}
          t={t}
          onWizardStep={onWizardStep}
          onTrajectoryTypeChange={onTrajectoryTypeChange}
        />
      );

    case "setPosition":
      return (
        <SetPositionStep
          creation={creation}
          {...dragProps}
          t={t}
          onWizardStep={onWizardStep}
        />
      );

    case "editing":
      return (
        <EditingStep
          creation={creation}
          language={language}
          {...dragProps}
          t={t}
          onWizardStep={onWizardStep}
          onSwitchStep={onSwitchStep}
          onResetStep={onResetStep}
          onResetPreview={onResetPreview}
          ballPassCreationMode={ballPassCreationMode}
          ballPassStartPos={ballPassStartPos}
          selectedBallPassTrajectoryType={selectedBallPassTrajectoryType}
          onToggleBallPassMode={onToggleBallPassMode}
          onBallPassTrajectoryTypeChange={onBallPassTrajectoryTypeChange}
        />
      );

    case "confirm":
      return (
        <ConfirmStep
          creation={creation}
          language={language}
          isExecuting={isExecuting}
          {...dragProps}
          t={t}
          onWizardStep={onWizardStep}
          onAddStep={onAddStep}
          onToggleTimeline={onToggleTimeline}
          onPreview={onPreview}
          onSave={onSave}
        />
      );
  }
}
