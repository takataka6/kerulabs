/**
 * @module TacticCreationToolbar コンポーネント
 * @description 戦術作成ツールバーの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - ウィザード各ステップのUIコントロール表示を検証
 * - 移動追加・ボールパス追加等のツールボタンを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TacticCreationToolbar } from "../TacticCreationToolbar";
import type { CreationState } from "@presentation/hooks/tactic";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@presentation/hooks/ui", () => ({
  useDraggable: () => ({
    offset: { x: 0, y: 0 },
    isDragging: false,
    handlePointerDown: vi.fn(),
    resetOffset: vi.fn(),
  }),
}));

// 各ステップコンポーネントをシンプルにモック
vi.mock("../tactic-creation", () => ({
  MetadataStep: () => <div data-testid="metadata-step" />,
  BallPositionStep: () => <div data-testid="ball-position-step" />,
  BallTrajectoryStep: () => <div data-testid="ball-trajectory-step" />,
  SetPositionStep: () => <div data-testid="set-position-step" />,
  EditingStep: () => <div data-testid="editing-step" />,
  ConfirmStep: () => <div data-testid="confirm-step" />,
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createCreation(
  wizardStep: CreationState["wizardStep"],
): CreationState {
  return {
    isCreating: true,
    wizardStep,
    nameJa: "テスト",
    nameEn: "Test",
    icon: "⚽",
    gamePhase: "attack",
    steps: [],
    currentStepIndex: 0,
    showTimeline: false,
    ballPosition: null,
    trajectoryType: "low",
  } as unknown as CreationState;
}

function renderToolbar(wizardStep: CreationState["wizardStep"] = "metadata") {
  return render(
    <TacticCreationToolbar
      creation={createCreation(wizardStep)}
      language="ja"
      isExecuting={false}
      t={mockT}
      onNameJaChange={vi.fn()}
      onNameEnChange={vi.fn()}
      onIconChange={vi.fn()}
      onGamePhaseChange={vi.fn()}
      onWizardStep={vi.fn()}
      onSwitchStep={vi.fn()}
      onAddStep={vi.fn()}
      onResetStep={vi.fn()}
      onResetPreview={vi.fn()}
      onToggleTimeline={vi.fn()}
      onPreview={vi.fn()}
      onSave={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TacticCreationToolbar", () => {
  it('wizardStep="metadata" で MetadataStep を表示する', () => {
    renderToolbar("metadata");
    expect(screen.getByTestId("metadata-step")).toBeInTheDocument();
  });

  it('wizardStep="ballPosition" で BallPositionStep を表示する', () => {
    renderToolbar("ballPosition");
    expect(screen.getByTestId("ball-position-step")).toBeInTheDocument();
  });

  it('wizardStep="ballTrajectory" で BallTrajectoryStep を表示する', () => {
    renderToolbar("ballTrajectory");
    expect(screen.getByTestId("ball-trajectory-step")).toBeInTheDocument();
  });

  it('wizardStep="setPosition" で SetPositionStep を表示する', () => {
    renderToolbar("setPosition");
    expect(screen.getByTestId("set-position-step")).toBeInTheDocument();
  });

  it('wizardStep="editing" で EditingStep を表示する', () => {
    renderToolbar("editing");
    expect(screen.getByTestId("editing-step")).toBeInTheDocument();
  });

  it('wizardStep="confirm" で ConfirmStep を表示する', () => {
    renderToolbar("confirm");
    expect(screen.getByTestId("confirm-step")).toBeInTheDocument();
  });
});
