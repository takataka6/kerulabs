/**
 * @module SidebarCreationContent
 * @description タクティクス作成ウィザードのサイドバーコンテンツコンポーネント。各ウィザードステップを切り替えて表示する。
 */
import { memo } from "react";
import type { PhaseKey } from "@shared/constants";
import type { TranslationKey } from "@shared/i18n/translations";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import { SidebarMetadataStep } from "./SidebarMetadataStep";
import { SidebarBallPositionStep } from "./SidebarBallPositionStep";
import { SidebarBallTrajectoryStep } from "./SidebarBallTrajectoryStep";
import { SidebarSetPositionStep } from "./SidebarSetPositionStep";
import { SidebarEditingStep } from "./SidebarEditingStep";
import { SidebarConfirmStep } from "./SidebarConfirmStep";

// ---------------------------------------------------------------------------
// Props型
// ---------------------------------------------------------------------------

interface SidebarCreationContentProps {
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
  ballPassCreationMode: boolean;
  ballPassStartPos: { x: number; z: number } | null;
  selectedBallPassTrajectoryType: TrajectoryType;
  onToggleBallPassMode?: () => void;
  onBallPassTrajectoryTypeChange?: (type: TrajectoryType) => void;
}

// ---------------------------------------------------------------------------
// ルーター
// ---------------------------------------------------------------------------

export const SidebarCreationContent = memo(function SidebarCreationContent(
  props: SidebarCreationContentProps,
) {
  switch (props.creation.wizardStep) {
    case "metadata":
      return (
        <SidebarMetadataStep
          creation={props.creation}
          t={props.t}
          onNameJaChange={props.onNameJaChange}
          onNameEnChange={props.onNameEnChange}
          onIconChange={props.onIconChange}
          onGamePhaseChange={props.onGamePhaseChange}
          onWizardStep={props.onWizardStep}
          onCancel={props.onCancel}
        />
      );
    case "ballPosition":
      return (
        <SidebarBallPositionStep
          creation={props.creation}
          t={props.t}
          onWizardStep={props.onWizardStep}
        />
      );
    case "ballTrajectory":
      return (
        <SidebarBallTrajectoryStep
          creation={props.creation}
          t={props.t}
          onWizardStep={props.onWizardStep}
          onTrajectoryTypeChange={props.onTrajectoryTypeChange}
        />
      );
    case "setPosition":
      return (
        <SidebarSetPositionStep
          creation={props.creation}
          t={props.t}
          onWizardStep={props.onWizardStep}
        />
      );
    case "editing":
      return (
        <SidebarEditingStep
          creation={props.creation}
          language={props.language}
          t={props.t}
          onWizardStep={props.onWizardStep}
          onSwitchStep={props.onSwitchStep}
          onResetStep={props.onResetStep}
          onResetPreview={props.onResetPreview}
          ballPassCreationMode={props.ballPassCreationMode}
          ballPassStartPos={props.ballPassStartPos}
          selectedBallPassTrajectoryType={props.selectedBallPassTrajectoryType}
          onToggleBallPassMode={props.onToggleBallPassMode}
          onBallPassTrajectoryTypeChange={props.onBallPassTrajectoryTypeChange}
        />
      );
    case "confirm":
      return (
        <SidebarConfirmStep
          creation={props.creation}
          language={props.language}
          isExecuting={props.isExecuting}
          t={props.t}
          onWizardStep={props.onWizardStep}
          onAddStep={props.onAddStep}
          onToggleTimeline={props.onToggleTimeline}
          onPreview={props.onPreview}
          onSave={props.onSave}
        />
      );
  }
});
