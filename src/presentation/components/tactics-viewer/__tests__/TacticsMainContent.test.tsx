/**
 * @module TacticsMainContent テスト
 * @description メインコンテンツコンポーネントのテスト。
 * サブコンポーネント群が正しくレンダリングされることを検証する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TacticsMainContent } from "../TacticsMainContent";
import { DEFAULT_SCENE_BACKGROUND } from "@shared/constants";

/* ---- Context mocks ---- */
let mockUIContext: ReturnType<typeof createMockUIContext>;
let mockTeamContext: ReturnType<typeof createMockTeamContext>;
let mockExecutionContext: ReturnType<typeof createMockExecutionContext>;
const mockPreferencesGet = vi.fn();
const mockPreferencesSet = vi.fn();

vi.mock("@presentation/contexts/TacticsUIContext", () => ({
  useTacticsUI: () => mockUIContext,
}));
vi.mock("@presentation/contexts/TacticsTeamContext", () => ({
  useTacticsTeam: () => mockTeamContext,
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
vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    preferencesService: {
      get: mockPreferencesGet,
      set: mockPreferencesSet,
    },
  }),
}));

/* ---- Sub-components (shallow render with prop capture) ---- */
let capturedRightControlsProps: Record<string, unknown> = {};
let capturedSquadPanelProps: Record<string, unknown> = {};
let capturedViewLockPanelProps: Record<string, unknown> = {};
let capturedTacticsCanvasProps: Record<string, unknown> = {};

vi.mock("../RightControlsColumn", () => ({
  RightControlsColumn: (props: Record<string, unknown>) => {
    capturedRightControlsProps = props;
    return <div data-testid="right-controls" />;
  },
}));
vi.mock("../TacticsCanvas", () => ({
  TacticsCanvas: (props: Record<string, unknown>) => {
    capturedTacticsCanvasProps = props;
    return <div data-testid="tactics-canvas" />;
  },
}));
vi.mock("../FlowchartPanel", () => ({
  FlowchartPanel: () => <div data-testid="flowchart-panel" />,
}));
vi.mock("../SquadPanel", () => ({
  SquadPanel: (props: Record<string, unknown>) => {
    capturedSquadPanelProps = props;
    return <div data-testid="squad-panel" />;
  },
}));
vi.mock("../SubstitutesPanel", () => ({
  SubstitutesPanel: () => <div data-testid="substitutes-panel" />,
}));
vi.mock("../PlayerViewHUD", () => ({
  PlayerViewHUD: () => <div data-testid="player-view-hud" />,
}));
vi.mock("../ManagerDisplay", () => ({
  ManagerDisplay: () => <div data-testid="manager-display" />,
}));
vi.mock("../TimelineEditor", () => ({
  TimelineEditor: () => <div data-testid="timeline-editor" />,
}));
vi.mock("../ViewLockPanel", () => ({
  ViewLockPanel: (props: Record<string, unknown>) => {
    capturedViewLockPanelProps = props;
    return <div data-testid="view-lock-panel" />;
  },
}));
vi.mock("../SketchOverlay", () => ({
  SketchOverlay: () => <div data-testid="sketch-overlay" />,
}));
vi.mock("../SketchToolbar", () => ({
  SketchToolbar: () => <div data-testid="sketch-toolbar" />,
}));
vi.mock("../right-controls/BackgroundSettingsPanelContent", () => ({
  BackgroundSettingsPanelContent: () => (
    <div data-testid="background-settings-panel-content" />
  ),
}));
vi.mock("../right-controls/OpponentSquadSelectorPopup", () => ({
  OpponentSquadSelectorPopup: () => (
    <div data-testid="opponent-squad-selector-popup" />
  ),
}));

vi.mock("../../lineup-animation", () => ({
  LineupAnimationOverlay: () => <div data-testid="lineup-animation" />,
}));

function createMockUIContext() {
  const noop = vi.fn();
  return {
    ui: {
      captureMode: false,
      showRightControls: true,
      squadPanelOpen: false,
      showSquadBuilder: false,
      showPlayerNames: true,
      showNameSettings: false,
      hiddenPlayerIndices: new Set<number>(),
      isDraggingObject: false,
      fieldLocked: false,
      touchlineLocked: false,
      cameraAction: null,
      playerMarkerScale: 1,
      showFlowchart: false,
      sidebarOpen: false,
      headerVisible: true,
      sidebarAnimating: false,
      setSquadPanelOpen: noop,
      setShowRightControls: noop,
      setShowPlayerNames: noop,
      setShowNameSettings: noop,
      setHiddenPlayerIndices: noop,
      setFieldLocked: noop,
      setTouchlineLocked: noop,
      setCameraAction: noop,
      setPlayerMarkerScale: noop,
      setShowFlowchart: noop,
      setCaptureMode: noop,
      toggleSidebar: noop,
      setShowCards: noop,
      setShowPlayerManagement: noop,
      setShowSquadBuilder: noop,
      setHeaderVisible: noop,
      setIsDraggingObject: noop,
      setSidebarAnimating: noop,
    },
    canUndo: false,
    canRedo: false,
    handleUndo: noop,
    handleRedo: noop,
  };
}

function createMockTeamContext() {
  const noop = vi.fn();
  return {
    selectedTeam: {
      id: { value: "team-1" },
      name: "Test Team",
      manager: "Manager",
    },
    currentFormation: { id: "fm-1", name: "4-3-3" },
    teams: [],
    teamMgmt: {
      selectedTeamId: "team-1",
      customSquad: [],
      handleUpdateTeam: noop,
      handleSubstitution: noop,
      substitutionRecords: [],
      resetSubstitutions: noop,
      setSelectedTeamId: noop,
    },
    formationMgmt: {
      formationData: [],
      gameModeFormations: [],
      currentFormationId: "fm-1",
      showFormationEditor: false,
      changeFormation: noop,
      setShowFormationEditor: noop,
    },
    displayData: {
      playersData: [],
      colorsData: { gk: "#ff0", df: "#00f", mf: "#0f0", fw: "#f00" },
      lineupPlayers: [],
      lineupTeamInfo: { name: "Test", shortName: "TST", colors: {} },
    },
    cardMgmt: {
      playerCards: {},
      managerCard: "none",
      showCards: false,
      setShowCards: noop,
    },
    managerEditor: {
      editingManager: false,
      managerInput: "",
      startEditing: noop,
      setManagerInput: noop,
      cancelEditing: noop,
    },
    handleSquadCardCycle: noop,
    handleSaveManager: noop,
    handleCycleManagerCard: noop,
  };
}

function createMockExecutionContext() {
  const noop = vi.fn();
  return {
    playModePhase: {
      gameMode: "football",
      pitchConfig: {
        maxOpponents: 11,
        fieldWidth: 10,
        fieldLength: 12,
      },
    },
    tOrch: {
      isExecuting: false,
      executionPhase: null,
      undoRedoEnabled: true,
      mergedPlayerPositions: {},
      mergedArrows: [],
      mergedBallTrajectories: [],
      effectiveBallPosition: null,
      effectiveBallPlacementMode: false,
      ballHighlightPosition: null,
      activeTactic: null,
      activeTacticId: null,
      tacticsForCurrentFormation: [],
      ballPassCreationMode: false,
      tacticCreation: { creation: null },
      stepExecution: {
        isStepMode: false,
        currentStep: 0,
        totalSteps: 1,
        isStepRunning: false,
        tactic: null,
      },
    },
    opponentsHook: {
      opponents: [],
      opponentPlacementMode: false,
      opponentTeamId: null,
      opponentTeam: null,
      showOpponentNames: false,
      handleOpponentDrag: noop,
      handleOpponentRemove: noop,
      toggleOpponentPlacement: noop,
    },
    ballHook: { ballPlacementMode: false },
    connLines: {
      connectionLines: [],
      lineDrawingMode: false,
      handleConnectionLineRemove: noop,
    },
    playerView: {
      playerViewEnabled: false,
      selectedPlayerIndex: null,
      selectedOpponentViewId: null,
      exitPlayerView: noop,
    },
    multiSelect: {
      selectedPlayerIndices: new Set<number>(),
      selectedOpponentIds: new Set<number>(),
      clearSelection: noop,
      setSelectionFromRect: noop,
    },
    bgSettings: {
      sceneBackground: DEFAULT_SCENE_BACKGROUND,
      showSceneBgSettings: false,
      setShowSceneBgSettings: noop,
      setSceneBackgroundMode: noop,
      setSceneBackgroundSolidColor: noop,
      applyGradientPreset: noop,
      setGradientFrom: noop,
      setGradientMid: noop,
      setGradientMidPosition: noop,
      setGradientMidWidth: noop,
      setGradientTo: noop,
      setGradientAngle: noop,
      selectedGradientPreset: null,
      isGradientCustom: false,
      gradientPreviewCss:
        "linear-gradient(135deg, #09101c 0%, #dbe4f0 28%, #334155 100%)",
      pitchColor: "#16a34a",
      pitchOpacity: 1,
      setPitchColor: noop,
      setPitchOpacity: noop,
      canResetBackgroundSettings: false,
      handleResetAllBgSettings: noop,
    },
    lineupAnimation: {
      isActive: false,
      phase: "idle",
      selectedPresetId: "default",
      onAnimationComplete: noop,
      skip: noop,
      cancel: noop,
    },
    sketch: {
      canvasRef: { current: null },
      sketchMode: false,
      setSketchMode: noop,
      activeTool: "pen",
      strokeColor: "#fff",
      strokeWidth: 2,
      layers: [],
      activeLayerId: 0,
      toggleSketchMode: noop,
      setActiveTool: noop,
      setStrokeColor: noop,
      setStrokeWidth: noop,
      setActiveLayerId: noop,
      toggleLayerVisibility: noop,
      addLayer: noop,
      removeLayer: noop,
      renameLayer: noop,
      reorderLayers: noop,
      undoLastStroke: noop,
      clearLayer: noop,
      clearAllStrokes: noop,
      handlePointerDown: noop,
      handlePointerMove: noop,
      handlePointerUp: noop,
      redraw: noop,
    },
    canvasMemo: {
      canvasPlayerCards: {},
      canvasSelectedPlayerIndex: null,
      canvasIsPlayerView: false,
      canvasPlayerDraggable: true,
      canvasLineTrackingActive: false,
      canvasPendingConnectionLine: null,
    },
    canvasCallbacks: {
      handleFieldClick: noop,
      handleBallPlace: noop,
      handleBallDrag: noop,
      handleBallRemove: noop,
      handleDragStart: noop,
      handleDragEnd: noop,
      handlePlayerDragEnd: noop,
      handleGroupDragEnd: noop,
      handleLinePointerMove: noop,
      handleCameraActionDone: noop,
    },
    handlePlayerClick: noop,
    handleOpponentClick: noop,
    handleSavePng: noop,
    generateFlowchart: () => "",
    tacticsLoading: false,
  };
}

describe("TacticsMainContent", () => {
  beforeEach(() => {
    mockUIContext = createMockUIContext();
    mockTeamContext = createMockTeamContext();
    mockExecutionContext = createMockExecutionContext();
    mockPreferencesGet.mockReset();
    mockPreferencesSet.mockReset();
    mockPreferencesGet.mockImplementation((key: string) => {
      if (key === "tacticsViewerGuideDismissed") return false;
      return undefined;
    });
  });

  it("main 要素が id='main-content' で描画される", async () => {
    render(<TacticsMainContent />);

    const main = document.getElementById("main-content");
    expect(main).not.toBeNull();
    expect(main?.tagName).toBe("MAIN");
    expect(await screen.findByTestId("tactics-canvas")).toBeInTheDocument();
  });

  it("主要なサブコンポーネントが描画される", async () => {
    render(<TacticsMainContent />);

    expect(screen.getByTestId("squad-panel")).toBeInTheDocument();
    expect(screen.getByTestId("substitutes-panel")).toBeInTheDocument();
    expect(screen.getByTestId("right-controls")).toBeInTheDocument();
    expect(await screen.findByTestId("tactics-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("sketch-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("manager-display")).toBeInTheDocument();
    expect(screen.getByTestId("view-lock-panel")).toBeInTheDocument();
    expect(screen.getByTestId("player-view-hud")).toBeInTheDocument();
  });

  it("初回ガイドを表示する", () => {
    render(<TacticsMainContent />);

    expect(screen.getByText("tactics.guide.title")).toBeInTheDocument();
    expect(screen.getByText("tactics.guide.stepDrag")).toBeInTheDocument();
    expect(screen.getByText("tactics.guide.dismiss")).toBeInTheDocument();
  });

  it("ガイドを閉じると非表示にし、設定へ保存する", () => {
    render(<TacticsMainContent />);

    fireEvent.click(screen.getByText("tactics.guide.dismiss"));

    expect(screen.queryByText("tactics.guide.title")).not.toBeInTheDocument();
    expect(mockPreferencesSet).toHaveBeenCalledWith(
      "tacticsViewerGuideDismissed",
      true,
    );
  });

  it("captureMode 時は RightControlsColumn が非表示", () => {
    mockUIContext.ui.captureMode = true;
    render(<TacticsMainContent />);

    expect(screen.queryByTestId("right-controls")).not.toBeInTheDocument();
  });

  it("ガイドを閉じている場合は表示しない", () => {
    mockPreferencesGet.mockImplementation((key: string) => {
      if (key === "tacticsViewerGuideDismissed") return true;
      return undefined;
    });

    render(<TacticsMainContent />);

    expect(screen.queryByText("tactics.guide.title")).not.toBeInTheDocument();
  });

  // ── Callback delegation tests ─────────────────────────

  describe("callback delegation to sub-components", () => {
    it("onToggleRightControls toggles showRightControls via context", () => {
      render(<TacticsMainContent />);

      const toggle =
        capturedRightControlsProps.onToggleRightControls as () => void;
      toggle();
      expect(mockUIContext.ui.setShowRightControls).toHaveBeenCalled();
    });

    it("onUndo calls handleUndo from context", () => {
      render(<TacticsMainContent />);

      const onUndo = capturedRightControlsProps.onUndo as () => void;
      onUndo();
      expect(mockUIContext.handleUndo).toHaveBeenCalled();
    });

    it("onRedo calls handleRedo from context", () => {
      render(<TacticsMainContent />);

      const onRedo = capturedRightControlsProps.onRedo as () => void;
      onRedo();
      expect(mockUIContext.handleRedo).toHaveBeenCalled();
    });

    it("onTogglePlayerNames toggles showPlayerNames via context", () => {
      render(<TacticsMainContent />);

      const toggle =
        capturedRightControlsProps.onTogglePlayerNames as () => void;
      toggle();
      expect(mockUIContext.ui.setShowPlayerNames).toHaveBeenCalled();
    });

    it("onToggleNameSettings toggles showNameSettings via context", () => {
      render(<TacticsMainContent />);

      const toggle =
        capturedRightControlsProps.onToggleNameSettings as () => void;
      toggle();
      expect(mockUIContext.ui.setShowNameSettings).toHaveBeenCalled();
    });

    it("onToggleCards toggles showCards via context", () => {
      render(<TacticsMainContent />);

      const toggle = capturedRightControlsProps.onToggleCards as () => void;
      toggle();
      expect(mockTeamContext.cardMgmt.setShowCards).toHaveBeenCalled();
    });

    it("onToggleFlowchart toggles showFlowchart via context", () => {
      render(<TacticsMainContent />);

      const toggle = capturedRightControlsProps.onToggleFlowchart as () => void;
      toggle();
      expect(mockUIContext.ui.setShowFlowchart).toHaveBeenCalled();
    });

    it("onToggleFormationEditor toggles showFormationEditor via context", () => {
      render(<TacticsMainContent />);

      const toggle =
        capturedRightControlsProps.onToggleFormationEditor as () => void;
      toggle();
      expect(
        mockTeamContext.formationMgmt.setShowFormationEditor,
      ).toHaveBeenCalled();
    });

    it("onToggleSketchMode toggles sketch mode via context", () => {
      render(<TacticsMainContent />);

      const toggle =
        capturedRightControlsProps.onToggleSketchMode as () => void;
      toggle();
      expect(mockExecutionContext.sketch.toggleSketchMode).toHaveBeenCalled();
    });

    it("onTogglePlayerHidden toggles hidden player indices via context", () => {
      render(<TacticsMainContent />);

      const toggle = capturedRightControlsProps.onTogglePlayerHidden as (
        index: number,
      ) => void;
      toggle(3);
      expect(mockUIContext.ui.setHiddenPlayerIndices).toHaveBeenCalled();
    });

    it("onMarkerScaleChange delegates to context", () => {
      render(<TacticsMainContent />);

      const change = capturedRightControlsProps.onMarkerScaleChange as (
        scale: number,
      ) => void;
      change(1.1);
      expect(mockUIContext.ui.setPlayerMarkerScale).toHaveBeenCalledWith(1.1);
    });

    it("onToggleSquadPanel toggles squadPanelOpen via SquadPanel props", () => {
      render(<TacticsMainContent />);

      const toggle = capturedSquadPanelProps.onToggleSquadPanel as () => void;
      toggle();
      expect(mockUIContext.ui.setSquadPanelOpen).toHaveBeenCalled();
    });

    it("ViewLockPanel onCameraAction delegates to context", () => {
      render(<TacticsMainContent />);

      const onCameraAction = capturedViewLockPanelProps.onCameraAction as (
        action: string,
      ) => void;
      onCameraAction("topDown");
      expect(mockUIContext.ui.setCameraAction).toHaveBeenCalledWith("topDown");
    });

    it("ViewLockPanel onToggleFieldLock toggles fieldLocked via context", () => {
      render(<TacticsMainContent />);

      const toggle = capturedViewLockPanelProps.onToggleFieldLock as () => void;
      toggle();
      expect(mockUIContext.ui.setFieldLocked).toHaveBeenCalled();
    });

    it("ViewLockPanel onToggleTouchlineLock toggles touchlineLocked via context", () => {
      render(<TacticsMainContent />);

      const toggle =
        capturedViewLockPanelProps.onToggleTouchlineLock as () => void;
      toggle();
      expect(mockUIContext.ui.setTouchlineLocked).toHaveBeenCalled();
    });

    it("TacticsCanvas にフィールド固定トグルが渡される", () => {
      render(<TacticsMainContent />);

      const toggle = capturedTacticsCanvasProps.onToggleFieldLock as () => void;
      toggle();
      expect(mockUIContext.ui.setFieldLocked).toHaveBeenCalled();
    });

    it("onChangeFormation delegates to formationMgmt.changeFormation", () => {
      render(<TacticsMainContent />);

      const change = capturedRightControlsProps.onChangeFormation as (
        id: string,
      ) => void;
      change("fm-2");
      expect(
        mockTeamContext.formationMgmt.changeFormation,
      ).toHaveBeenCalledWith("fm-2");
    });

    it("onUpdateTeam delegates to teamMgmt.handleUpdateTeam", () => {
      render(<TacticsMainContent />);

      const update = capturedRightControlsProps.onUpdateTeam as (
        team: unknown,
      ) => void;
      const fakeTeam = { id: "t", name: "X" };
      update(fakeTeam);
      expect(mockTeamContext.teamMgmt.handleUpdateTeam).toHaveBeenCalledWith(
        fakeTeam,
      );
    });

    it("onToggleSketchMode closes sidebar when entering sketch mode with sidebar open", () => {
      mockUIContext.ui.sidebarOpen = true;
      render(<TacticsMainContent />);

      const toggle =
        capturedRightControlsProps.onToggleSketchMode as () => void;
      toggle();
      expect(mockExecutionContext.sketch.toggleSketchMode).toHaveBeenCalled();
      expect(mockUIContext.ui.toggleSidebar).toHaveBeenCalled();
    });

    it("onToggleSketchMode does not close sidebar when exiting sketch mode", () => {
      mockExecutionContext.sketch.sketchMode = true;
      mockUIContext.ui.sidebarOpen = true;
      render(<TacticsMainContent />);

      const toggle =
        capturedRightControlsProps.onToggleSketchMode as () => void;
      toggle();
      expect(mockExecutionContext.sketch.toggleSketchMode).toHaveBeenCalled();
      // willEnterSketch is false (since sketchMode was true), so sidebar should NOT be toggled
      expect(mockUIContext.ui.toggleSidebar).not.toHaveBeenCalled();
    });

    it("スケッチモード中に他のボタンを押すとスケッチモードを解除する", () => {
      mockExecutionContext.sketch.sketchMode = true;
      render(<TacticsMainContent />);

      const button = document.createElement("button");
      document.body.appendChild(button);

      fireEvent.click(button);

      expect(mockExecutionContext.sketch.setSketchMode).toHaveBeenCalledWith(
        false,
      );
      button.remove();
    });

    it("スケッチモード中でもスケッチ用ボタンではスケッチモードを維持する", () => {
      mockExecutionContext.sketch.sketchMode = true;
      render(<TacticsMainContent />);

      const sketchButton = document.createElement("button");
      sketchButton.setAttribute("data-sketch-toggle", "true");
      document.body.appendChild(sketchButton);

      fireEvent.click(sketchButton);

      expect(mockExecutionContext.sketch.setSketchMode).not.toHaveBeenCalled();
      sketchButton.remove();
    });

    it("SquadPanel onCycleCard delegates to handleSquadCardCycle", () => {
      render(<TacticsMainContent />);

      const cycle = capturedSquadPanelProps.onCycleCard as (
        index: number,
      ) => void;
      cycle(3);
      expect(mockTeamContext.handleSquadCardCycle).toHaveBeenCalledWith(3);
    });

    it("SquadPanel onSubstitute delegates to teamMgmt.handleSubstitution", () => {
      render(<TacticsMainContent />);

      const sub = capturedSquadPanelProps.onSubstitute as (
        a: number,
        b: number,
      ) => void;
      sub(1, 2);
      expect(mockTeamContext.teamMgmt.handleSubstitution).toHaveBeenCalledWith(
        1,
        2,
      );
    });
  });
});
