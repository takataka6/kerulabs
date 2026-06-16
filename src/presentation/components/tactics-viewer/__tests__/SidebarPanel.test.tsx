/**
 * @module SidebarPanel コンポーネント
 * @description サイドバーパネルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数をvi.fnでモック化
 * - パネルの開閉・タイトル・コンテンツ表示を検証
 * - 子コンポーネントのレンダリングを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarPanel } from "../SidebarPanel";
import type {
  SidebarLayoutProps,
  PhaseProps,
  TacticListProps,
  TacticCreationProps,
  CaptureModeProps,
  I18nProps,
} from "../SidebarPanel";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/phases", () => {
  const PHASE_CONFIG = {
    attack: {
      nameKey: "phase.attack",
      icon: "A",
      bgColor: "bg-red-600",
      textColor: "text-white",
      borderColor: "border-red-500",
    },
    transition: {
      nameKey: "phase.transition",
      icon: "T",
      bgColor: "bg-green-600",
      textColor: "text-white",
      borderColor: "border-green-500",
    },
    pressing: {
      nameKey: "phase.pressing",
      icon: "P",
      bgColor: "bg-blue-600",
      textColor: "text-white",
      borderColor: "border-blue-500",
    },
    counter: {
      nameKey: "phase.counter",
      icon: "C",
      bgColor: "bg-orange-600",
      textColor: "text-white",
      borderColor: "border-orange-500",
    },
    defense: {
      nameKey: "phase.defense",
      icon: "D",
      bgColor: "bg-blue-600",
      textColor: "text-white",
      borderColor: "border-blue-500",
    },
    positive_transition: {
      nameKey: "phase.positive_transition",
      icon: "PT",
      bgColor: "bg-green-600",
      textColor: "text-white",
      borderColor: "border-green-500",
    },
    negative_transition: {
      nameKey: "phase.negative_transition",
      icon: "NT",
      bgColor: "bg-orange-600",
      textColor: "text-white",
      borderColor: "border-orange-500",
    },
    set_piece: {
      nameKey: "phase.set_piece",
      icon: "SP",
      bgColor: "bg-teal-600",
      textColor: "text-white",
      borderColor: "border-teal-500",
    },
    throw_in: {
      nameKey: "phase.throw_in",
      icon: "TI",
      bgColor: "bg-sky-600",
      textColor: "text-white",
      borderColor: "border-sky-500",
    },
    goal_kick: {
      nameKey: "phase.goal_kick",
      icon: "GK",
      bgColor: "bg-indigo-600",
      textColor: "text-white",
      borderColor: "border-indigo-500",
    },
  } as const;
  return { PHASE_CONFIG };
});

vi.mock("@shared/constants/setPlayTypes", () => ({
  SET_PLAY_TYPES: ["set_piece", "throw_in", "goal_kick"] as const,
}));

vi.mock("@presentation/components/lineup-animation", () => ({
  LINEUP_ANIMATION_PRESETS: [
    {
      id: "preset-1",
      nameKey: "lineup.animation.preset.classicTv",
      fallbackName: "Classic TV",
      estimatedDurationMs: 15000,
      component: () => null,
    },
  ],
}));

vi.mock("../PhaseDiamond", () => ({
  PhaseDiamond: ({ selectedPhase }: { selectedPhase: string }) => (
    <div data-testid="phase-diamond">{selectedPhase}</div>
  ),
}));

vi.mock("../tactic-creation", () => ({
  SidebarCreationContent: () => (
    <div data-testid="sidebar-creation-content">Creation Content</div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);
const mockTDynamic = vi.fn((key: string) => key);

function renderSidebarPanel(
  overrides: {
    layout?: Partial<SidebarLayoutProps>;
    phase?: Partial<PhaseProps>;
    tactics?: Partial<TacticListProps>;
    creation?: Partial<TacticCreationProps>;
    capture?: Partial<CaptureModeProps>;
    i18n?: Partial<I18nProps>;
  } = {},
) {
  const defaultLayout: SidebarLayoutProps = {
    sidebarOpen: true,
    sidebarAnimating: false,
    onTransitionEnd: vi.fn(),
    isActive: false,
    headerVisible: true,
  };

  const defaultPhase: PhaseProps = {
    playMode: "field",
    selectedPhase: "attack",
    onPhaseChange: vi.fn(),
    selectedSetPlayType: "set_piece",
    onSetPlayTypeChange: vi.fn(),
    onResetState: vi.fn(),
    onResetTactic: vi.fn(),
  };

  const defaultTactics: TacticListProps = {
    tacticsLoading: false,
    tacticsForCurrentFormation: [],
    activeTacticId: null,
    isExecuting: false,
    isCreating: false,
    hasCustomTactics: false,
    onTriggerTactic: vi.fn(),
    onStartCreationFromTactic: vi.fn(),
    onDeleteTactic: vi.fn(),
    onStartCreation: vi.fn(),
    onImportTactics: vi.fn(),
    onExportTactics: vi.fn(),
  };

  const defaultCapture: CaptureModeProps = {
    captureMode: false,
    selectedImagePresetId: "none",
    onSelectImagePreset: vi.fn(),
    lineupAnimation: {
      isActive: false,
      selectedPresetId: "preset-1",
      setSelectedPresetId: vi.fn(),
      start: vi.fn(),
    },
    showPlayerNames: true,
    onTogglePlayerNames: vi.fn(),
    showPlayerNumbers: true,
    onTogglePlayerNumbers: vi.fn(),
    onExitCaptureMode: vi.fn(),
  };

  const defaultCreation: TacticCreationProps = {
    creation: null,
    isSetPlayMode: false,
    onNameJaChange: vi.fn(),
    onNameEnChange: vi.fn(),
    onIconChange: vi.fn(),
    onGamePhaseChange: vi.fn(),
    onWizardStep: vi.fn(),
    onSwitchStep: vi.fn(),
    onAddStep: vi.fn(),
    onResetStep: vi.fn(),
    onResetPreview: vi.fn(),
    onToggleTimeline: vi.fn(),
    onPreview: vi.fn(),
    onSave: vi.fn(),
    onCancelCreation: vi.fn(),
    ballPassCreationMode: false,
    ballPassStartPos: null,
    selectedBallPassTrajectoryType: "low",
  };

  const defaultI18n: I18nProps = {
    language: "ja",
    t: mockT,
    tDynamic: mockTDynamic,
  };

  const props = {
    layout: { ...defaultLayout, ...overrides.layout },
    phase: { ...defaultPhase, ...overrides.phase },
    tactics: { ...defaultTactics, ...overrides.tactics },
    creation: { ...defaultCreation, ...overrides.creation },
    capture: { ...defaultCapture, ...overrides.capture },
    i18n: { ...defaultI18n, ...overrides.i18n },
  };
  return { ...render(<SidebarPanel {...props} />), props };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SidebarPanel", () => {
  it("renders in normal mode with reset button, phase diamond, and tactics", () => {
    renderSidebarPanel();

    // Reset button
    expect(screen.getByText("tactics.reset")).toBeInTheDocument();
    expect(screen.queryByText("States")).not.toBeInTheDocument();

    // Phase diamond
    expect(screen.getByTestId("phase-diamond")).toBeInTheDocument();

    // Tactics section
    expect(screen.getByText("Tactics")).toBeInTheDocument();
    expect(screen.getByText("tactics.noMatchingTactics")).toBeInTheDocument();

    // Create / Import / Export buttons
    expect(screen.getByText("tactics.creation.create")).toBeInTheDocument();
    expect(screen.getByText("tactics.import")).toBeInTheDocument();
    expect(screen.getByText("tactics.export")).toBeInTheDocument();
  });

  it("renders capture mode UI", () => {
    renderSidebarPanel({ capture: { captureMode: true } });

    // Capture section
    expect(screen.getByText("tactics.capture.options")).toBeInTheDocument();
    expect(screen.getByText("tactics.hideNames")).toBeInTheDocument();
    expect(screen.getByText("tactics.capture.close")).toBeInTheDocument();

    // Lineup animation preset button (tDynamic returns the key, so fallback not used)
    expect(
      screen.getByText("lineup.animation.preset.classicTv"),
    ).toBeInTheDocument();
    // Lineup animation start button
    expect(
      screen.getAllByText("lineup.animation.button").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders with tactics list when tactics are present", () => {
    const tacticsList = [
      {
        id: { value: "tactic-1" },
        icon: "T",
        isCustom: false,
        getDisplayName: () => "Test Tactic",
      },
      {
        id: { value: "tactic-2" },
        icon: "C",
        isCustom: true,
        getDisplayName: () => "Custom Tactic",
      },
    ];

    renderSidebarPanel({
      tactics: {
        tacticsForCurrentFormation: tacticsList as never[],
        hasCustomTactics: true,
      },
    });

    expect(screen.getByText("tactics.name.tactic-1")).toBeInTheDocument();
    expect(screen.getByText("Custom Tactic")).toBeInTheDocument();
  });

  it("renders loading state for tactics", () => {
    renderSidebarPanel({ tactics: { tacticsLoading: true } });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders set play type selector when playMode is setPlay", () => {
    renderSidebarPanel({ phase: { playMode: "setPlay" } });

    expect(screen.getByText("tactics.setPlayType")).toBeInTheDocument();
    expect(screen.getByText("phase.set_piece")).toBeInTheDocument();
    expect(screen.getByText("phase.throw_in")).toBeInTheDocument();
    expect(screen.getByText("phase.goal_kick")).toBeInTheDocument();
  });

  // ── Interaction tests ─────────────────────────────────

  describe("phase callbacks", () => {
    it("clicking reset button calls onResetState", () => {
      const { props } = renderSidebarPanel();

      fireEvent.click(screen.getByText("tactics.reset"));
      expect(props.phase.onResetState).toHaveBeenCalled();
    });

    it("hides reset button while creation mode is active", () => {
      renderSidebarPanel({
        tactics: { isCreating: true },
        creation: {
          creation: {
            nameJa: "新規戦術",
            nameEn: "New Tactic",
            icon: "⚽",
            gamePhase: "attack",
            formationId: "4-3-3",
            formationName: "4-3-3",
            wizardStep: "metadata",
            currentStepIndex: 0,
            steps: [],
            setPositions: new Map(),
            ballPosition: null,
            ballTrajectory: null,
            timelineOpen: false,
            movementDelays: {},
          },
        },
      });

      expect(screen.queryByText("tactics.reset")).not.toBeInTheDocument();
    });

    it("clicking a set play type button calls onSetPlayTypeChange and onResetTactic", () => {
      const { props } = renderSidebarPanel({ phase: { playMode: "setPlay" } });

      fireEvent.click(screen.getByText("phase.throw_in"));
      expect(props.phase.onSetPlayTypeChange).toHaveBeenCalledWith("throw_in");
      expect(props.phase.onResetTactic).toHaveBeenCalled();
    });
  });

  describe("tactics callbacks", () => {
    it("clicking a tactic button calls onTriggerTactic", () => {
      const tacticsList = [
        {
          id: { value: "tactic-1" },
          icon: "T",
          isCustom: false,
          supportsStepExecution: false,
          getDisplayName: () => "Test Tactic",
        },
      ];
      const { props } = renderSidebarPanel({
        tactics: { tacticsForCurrentFormation: tacticsList as never[] },
      });

      fireEvent.click(screen.getByText("tactics.name.tactic-1"));
      expect(props.tactics.onTriggerTactic).toHaveBeenCalledWith("tactic-1");
    });

    it("clicking delete button on custom tactic calls onDeleteTactic", () => {
      const tacticsList = [
        {
          id: { value: "tactic-custom" },
          icon: "C",
          isCustom: true,
          supportsStepExecution: false,
          getDisplayName: () => "Custom Tactic",
        },
      ];
      const { props } = renderSidebarPanel({
        tactics: {
          tacticsForCurrentFormation: tacticsList as never[],
          hasCustomTactics: true,
        },
      });

      const deleteBtn = screen.getByLabelText("tactics.creation.delete");
      fireEvent.click(deleteBtn);
      expect(props.tactics.onDeleteTactic).toHaveBeenCalledWith(
        "tactic-custom",
      );
    });

    it("clicking create button opens entry modal and selecting standard calls onStartCreation", () => {
      const { props } = renderSidebarPanel();

      fireEvent.click(screen.getByText("tactics.creation.create"));
      expect(props.phase.onResetTactic).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText("tactics.creation.entry.title"),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByText("tactics.creation.entry.standard"));
      expect(props.tactics.onStartCreation).toHaveBeenCalledWith("standard");
    });

    it("field モードではシチュエーション作成を選べる", () => {
      const { props } = renderSidebarPanel();

      fireEvent.click(screen.getByText("tactics.creation.create"));
      fireEvent.click(screen.getByText("tactics.creation.entry.situation"));

      expect(props.tactics.onStartCreation).toHaveBeenCalledWith("situation");
    });

    it("selecting create from existing shows source selection guidance", () => {
      renderSidebarPanel();

      fireEvent.click(screen.getByText("tactics.creation.create"));
      fireEvent.click(screen.getByText("tactics.creation.entry.fromExisting"));

      expect(
        screen.getByText("tactics.creation.entry.selectSource"),
      ).toBeInTheDocument();
    });

    it("source selection mode uses tactic click to call onStartCreationFromTactic", () => {
      const tacticsList = [
        {
          id: { value: "tactic-1" },
          icon: "T",
          isCustom: false,
          supportsStepExecution: false,
          hasSetupStepExecution: false,
          totalSteps: 1,
          getDisplayName: () => "Test Tactic",
        },
      ];
      const { props } = renderSidebarPanel({
        tactics: { tacticsForCurrentFormation: tacticsList as never[] },
      });

      fireEvent.click(screen.getByText("tactics.creation.create"));
      fireEvent.click(screen.getByText("tactics.creation.entry.fromExisting"));
      fireEvent.click(screen.getByText("tactics.name.tactic-1"));

      expect(props.tactics.onStartCreationFromTactic).toHaveBeenCalledWith(
        "tactic-1",
        1,
      );
    });

    it("clicking import button calls onImportTactics", () => {
      const { props } = renderSidebarPanel();

      fireEvent.click(screen.getByText("tactics.import"));
      expect(props.tactics.onImportTactics).toHaveBeenCalled();
    });

    it("clicking export button calls onExportTactics when custom tactics exist", () => {
      const { props } = renderSidebarPanel({
        tactics: { hasCustomTactics: true },
      });

      fireEvent.click(screen.getByText("tactics.export"));
      expect(props.tactics.onExportTactics).toHaveBeenCalled();
    });
  });

  describe("capture mode callbacks", () => {
    it("clicking toggle player names button calls onTogglePlayerNames", () => {
      const { props } = renderSidebarPanel({ capture: { captureMode: true } });

      fireEvent.click(screen.getByText("tactics.hideNames"));
      expect(props.capture.onTogglePlayerNames).toHaveBeenCalled();
    });

    it("clicking close capture button calls onExitCaptureMode", () => {
      const { props } = renderSidebarPanel({ capture: { captureMode: true } });

      fireEvent.click(screen.getByText("tactics.capture.close"));
      expect(props.capture.onExitCaptureMode).toHaveBeenCalled();
    });
  });
});
