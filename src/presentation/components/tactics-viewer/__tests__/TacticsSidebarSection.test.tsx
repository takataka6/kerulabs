/**
 * @module TacticsSidebarSection テスト
 * @description サイドバーセクションコンポーネントのテスト。
 * サイドバー開閉ボタン・オーバーレイ・SidebarPanel の描画を検証する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TacticsSidebarSection } from "../TacticsSidebarSection";

/* ---- Context mocks ---- */
let mockUIContext: ReturnType<typeof createMockUIContext>;
let mockExecutionContext: ReturnType<typeof createMockExecutionContext>;

vi.mock("@presentation/contexts/TacticsUIContext", () => ({
  useTacticsUI: () => mockUIContext,
}));
vi.mock("@presentation/contexts/TacticsExecutionContext", () => ({
  useTacticsExecution: () => mockExecutionContext,
}));
vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    t: (key: string) => key,
    tDynamic: (key: string) => key,
    setLanguage: vi.fn(),
  }),
}));

let capturedSidebarPanelProps: Record<string, unknown> = {};
vi.mock("../SidebarPanel", () => ({
  SidebarPanel: (props: Record<string, unknown>) => {
    capturedSidebarPanelProps = props;
    return <div data-testid="sidebar-panel" />;
  },
}));
vi.mock("../TacticImportModal", () => ({
  TacticImportModal: () => <div data-testid="tactic-import-modal" />,
}));
vi.mock("../TacticExportModal", () => ({
  TacticExportModal: () => <div data-testid="tactic-export-modal" />,
}));

function createMockUIContext() {
  return {
    ui: {
      sidebarOpen: true,
      sidebarAnimating: false,
      captureMode: false,
      selectedImagePresetId: "none",
      headerVisible: true,
      showPlayerNames: true,
      showPlayerNumbers: true,
      toggleSidebar: vi.fn(),
      setSidebarAnimating: vi.fn(),
      setShowPlayerNames: vi.fn(),
      setShowPlayerNumbers: vi.fn(),
      setHiddenPlayerIndices: vi.fn(),
      setCaptureMode: vi.fn(),
      setSelectedImagePresetId: vi.fn(),
      setCameraAction: vi.fn(),
      setRightSidebarOpen: vi.fn(),
    },
  };
}

function createMockExecutionContext() {
  return {
    playModePhase: {
      gameMode: "football",
      playMode: "open",
      selectedPhase: "attack",
      selectedSetPlayType: null,
      handleGameModeChange: vi.fn(),
      setSelectedPhase: vi.fn(),
      setSelectedSetPlayType: vi.fn(),
      handleResetState: vi.fn(),
      handlePlayModeChange: vi.fn(),
    },
    tOrch: {
      resetTactic: vi.fn(),
      tacticsForCurrentFormation: [],
      activeTacticId: null,
      isExecuting: false,
      hasCustomTactics: false,
      triggerTactic: vi.fn(),
      deleteTacticMutation: { mutate: vi.fn() },
      handleDeleteTactic: vi.fn(),
      startTacticCreation: vi.fn(),
      cancelTacticCreation: vi.fn(),
      handleImportTactics: vi.fn(),
      handleImportFromJson: vi.fn(),
      handleExportTactics: vi.fn(),
      customTactics: [],
      exportTacticsToJson: vi.fn(),
      downloadExportJson: vi.fn(),
      handleWizardStepChange: vi.fn(),
      handleSwitchStep: vi.fn(),
      handleAddStep: vi.fn(),
      handleResetStep: vi.fn(),
      handleResetPreview: vi.fn(),
      handlePreviewTactic: vi.fn(),
      handleSaveTactic: vi.fn(),
      ballPassCreationMode: false,
      ballPassStartPos: null,
      ballPassTrajectoryType: "high",
      setBallPassCreationMode: vi.fn(),
      setBallPassStartPos: vi.fn(),
      setBallPassPendingEndPos: vi.fn(),
      setBallPassTrajectoryType: vi.fn(),
      tacticCreation: {
        creation: null,
        setNameJa: vi.fn(),
        setNameEn: vi.fn(),
        setIcon: vi.fn(),
        setGamePhase: vi.fn(),
        setTrajectoryType: vi.fn(),
        setTimelineOpen: vi.fn(),
        updateBallPassTrajectoryType: vi.fn(),
        cancelCreation: vi.fn(),
      },
    },
    lineupAnimation: {
      isActive: false,
      selectedPresetId: "default",
      setSelectedPresetId: vi.fn(),
      start: vi.fn(),
    },
    sketch: {
      sketchMode: false,
    },
    tacticsLoading: false,
  };
}

describe("TacticsSidebarSection", () => {
  beforeEach(() => {
    mockUIContext = createMockUIContext();
    mockExecutionContext = createMockExecutionContext();
  });

  it("サイドバートグルボタンが表示される", () => {
    render(<TacticsSidebarSection />);

    const btn = screen.getByRole("button", { name: "a11y.closeSidebar" });
    expect(btn).toBeInTheDocument();
  });

  it("サイドバーが閉じている場合は openSidebar ラベルが表示される", () => {
    mockUIContext.ui.sidebarOpen = false;
    render(<TacticsSidebarSection />);

    expect(
      screen.getByRole("button", { name: "a11y.openSidebar" }),
    ).toBeInTheDocument();
  });

  it("サイドバーが閉じている場合はトグルボタンを監督表示より上に配置する", () => {
    mockUIContext.ui.sidebarOpen = false;
    render(<TacticsSidebarSection />);

    expect(
      screen.getByRole("button", { name: "a11y.openSidebar" }),
    ).toHaveClass(
      "bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)]",
      "sm:bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)]",
      "xl:bottom-[calc(env(safe-area-inset-bottom,0px)+6.75rem)]",
    );
  });

  it("トグルボタンクリックで toggleSidebar が呼ばれる", () => {
    render(<TacticsSidebarSection />);

    fireEvent.click(screen.getByRole("button", { name: "a11y.closeSidebar" }));
    expect(mockUIContext.ui.toggleSidebar).toHaveBeenCalled();
  });

  it("SidebarPanel がレンダリングされる", () => {
    render(<TacticsSidebarSection />);

    expect(screen.getByTestId("sidebar-panel")).toBeInTheDocument();
  });

  it("モバイルオーバーレイはサイドバーが開いているときに表示される", () => {
    const { container } = render(<TacticsSidebarSection />);

    const overlay = container.querySelector(".bg-black\\/40");
    expect(overlay).toBeInTheDocument();
  });

  it("lineupAnimation がアクティブな場合、トグルボタンは非表示", () => {
    mockExecutionContext.lineupAnimation.isActive = true;
    const { container } = render(<TacticsSidebarSection />);

    const btn = container.querySelector(".sidebar-toggle");
    expect(btn).toHaveStyle({ display: "none" });
  });

  it("スケッチモード中はサイドバートグルボタンを表示しない", () => {
    mockExecutionContext.sketch.sketchMode = true;
    render(<TacticsSidebarSection />);

    expect(screen.queryByRole("button", { name: /a11y\./ })).toBeNull();
  });

  // ── Callback delegation tests ─────────────────────────

  describe("callback delegation to SidebarPanel", () => {
    it("layout.onTransitionEnd calls setSidebarAnimating(false)", () => {
      render(<TacticsSidebarSection />);

      const layout = capturedSidebarPanelProps.layout as {
        onTransitionEnd: () => void;
      };
      layout.onTransitionEnd();
      expect(mockUIContext.ui.setSidebarAnimating).toHaveBeenCalledWith(false);
    });

    it("phase.onPhaseChange delegates to playModePhase.setSelectedPhase", () => {
      render(<TacticsSidebarSection />);

      const phase = capturedSidebarPanelProps.phase as {
        onPhaseChange: (p: string) => void;
      };
      phase.onPhaseChange("defense");
      expect(
        mockExecutionContext.playModePhase.setSelectedPhase,
      ).toHaveBeenCalledWith("defense");
    });

    it("phase.onSetPlayTypeChange delegates to playModePhase.setSelectedSetPlayType", () => {
      render(<TacticsSidebarSection />);

      const phase = capturedSidebarPanelProps.phase as {
        onSetPlayTypeChange: (t: string) => void;
      };
      phase.onSetPlayTypeChange("throw_in");
      expect(
        mockExecutionContext.playModePhase.setSelectedSetPlayType,
      ).toHaveBeenCalledWith("throw_in");
    });

    it("phase.onResetState delegates to playModePhase.handleResetState", () => {
      render(<TacticsSidebarSection />);

      const phase = capturedSidebarPanelProps.phase as {
        onResetState: () => void;
      };
      phase.onResetState();
      expect(
        mockExecutionContext.playModePhase.handleResetState,
      ).toHaveBeenCalled();
    });

    it("phase.onResetTactic delegates to tOrch.resetTactic", () => {
      render(<TacticsSidebarSection />);

      const phase = capturedSidebarPanelProps.phase as {
        onResetTactic: () => void;
      };
      phase.onResetTactic();
      expect(mockExecutionContext.tOrch.resetTactic).toHaveBeenCalled();
    });

    it("tactics.onTriggerTactic delegates to tOrch.triggerTactic", () => {
      render(<TacticsSidebarSection />);

      const tactics = capturedSidebarPanelProps.tactics as {
        onTriggerTactic: (id: string) => void;
      };
      tactics.onTriggerTactic("tactic-1");
      expect(mockExecutionContext.tOrch.triggerTactic).toHaveBeenCalledWith(
        "tactic-1",
      );
    });

    it("tactics.onDeleteTactic delegates to tOrch.handleDeleteTactic", () => {
      render(<TacticsSidebarSection />);

      const tactics = capturedSidebarPanelProps.tactics as {
        onDeleteTactic: (id: string) => void;
      };
      tactics.onDeleteTactic("tactic-2");
      expect(
        mockExecutionContext.tOrch.handleDeleteTactic,
      ).toHaveBeenCalledWith("tactic-2");
    });

    it("tactics.onStartCreation delegates to tOrch.startTacticCreation", () => {
      render(<TacticsSidebarSection />);

      const tactics = capturedSidebarPanelProps.tactics as {
        onStartCreation: () => void;
      };
      tactics.onStartCreation();
      expect(mockExecutionContext.tOrch.startTacticCreation).toHaveBeenCalled();
    });

    it("tactics.onImportTactics がモーダルを開く", () => {
      const { queryByTestId } = render(<TacticsSidebarSection />);
      expect(queryByTestId("tactic-import-modal")).toBeNull();

      const tactics = capturedSidebarPanelProps.tactics as {
        onImportTactics: () => void;
      };
      act(() => {
        tactics.onImportTactics();
      });
      expect(screen.getByTestId("tactic-import-modal")).toBeTruthy();
    });

    it("tactics.onExportTactics がモーダルを開く", () => {
      const { queryByTestId } = render(<TacticsSidebarSection />);
      expect(queryByTestId("tactic-export-modal")).toBeNull();

      const tactics = capturedSidebarPanelProps.tactics as {
        onExportTactics: () => void;
      };
      act(() => {
        tactics.onExportTactics();
      });
      expect(screen.getByTestId("tactic-export-modal")).toBeTruthy();
    });

    it("capture.onExitCaptureMode calls setCaptureMode(false) and setSelectedImagePresetId('none')", () => {
      render(<TacticsSidebarSection />);

      const capture = capturedSidebarPanelProps.capture as {
        onExitCaptureMode: () => void;
      };
      capture.onExitCaptureMode();
      expect(mockUIContext.ui.setCaptureMode).toHaveBeenCalledWith(false);
      expect(mockUIContext.ui.setSelectedImagePresetId).toHaveBeenCalledWith(
        "none",
      );
    });

    it("capture.onSelectImagePreset updates preset", () => {
      render(<TacticsSidebarSection />);

      const capture = capturedSidebarPanelProps.capture as {
        onSelectImagePreset: (id: string) => void;
      };

      capture.onSelectImagePreset("split-field-squad");
      expect(mockUIContext.ui.setSelectedImagePresetId).toHaveBeenCalledWith(
        "split-field-squad",
      );

      capture.onSelectImagePreset("field-only");
      expect(mockUIContext.ui.setSelectedImagePresetId).toHaveBeenCalledWith(
        "field-only",
      );
    });

    it("capture.onTogglePlayerNames toggles showPlayerNames and resets hiddenPlayerIndices when enabling", () => {
      mockUIContext.ui.showPlayerNames = false;
      render(<TacticsSidebarSection />);

      const capture = capturedSidebarPanelProps.capture as {
        onTogglePlayerNames: () => void;
      };
      capture.onTogglePlayerNames();
      expect(mockUIContext.ui.setShowPlayerNames).toHaveBeenCalled();
      // next = !false = true, so hiddenPlayerIndices should be reset
      expect(mockUIContext.ui.setHiddenPlayerIndices).toHaveBeenCalled();
    });

    it("capture.onTogglePlayerNames does not reset hiddenPlayerIndices when disabling", () => {
      mockUIContext.ui.showPlayerNames = true;
      render(<TacticsSidebarSection />);

      const capture = capturedSidebarPanelProps.capture as {
        onTogglePlayerNames: () => void;
      };
      capture.onTogglePlayerNames();
      expect(mockUIContext.ui.setShowPlayerNames).toHaveBeenCalled();
      // next = !true = false, so hiddenPlayerIndices should NOT be reset
      expect(mockUIContext.ui.setHiddenPlayerIndices).not.toHaveBeenCalled();
    });

    it("capture.onTogglePlayerNumbers toggles showPlayerNumbers", () => {
      render(<TacticsSidebarSection />);

      const capture = capturedSidebarPanelProps.capture as {
        onTogglePlayerNumbers: () => void;
      };
      capture.onTogglePlayerNumbers();
      expect(mockUIContext.ui.setShowPlayerNumbers).toHaveBeenCalled();
    });

    it("モバイルオーバーレイクリックで toggleSidebar が呼ばれる", () => {
      const { container } = render(<TacticsSidebarSection />);

      const overlay = container.querySelector(".bg-black\\/40");
      expect(overlay).toBeInTheDocument();
      fireEvent.click(overlay!);
      expect(mockUIContext.ui.toggleSidebar).toHaveBeenCalled();
    });

    it("スケッチモード中は SidebarPanel に閉じた状態を渡す", () => {
      mockExecutionContext.sketch.sketchMode = true;
      render(<TacticsSidebarSection />);

      const layout = capturedSidebarPanelProps.layout as {
        sidebarOpen: boolean;
      };
      expect(layout.sidebarOpen).toBe(false);
    });
  });
});
