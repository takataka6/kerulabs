/**
 * @module TacticsViewerPage ページコンポーネント
 * @description 戦術ビューワーページの結合テスト
 *
 * テスト方針:
 * - 全フック（tactic/field/team/ui/history/canvas/sketch）とサブコンポーネントをモック化
 * - データクエリフック（useTeams/useFormations/useTactics/useAllTactics）をモック化
 * - ローディング状態・メイン画面・サイドバー・main要素のレンダリングを検証
 * - 大量のモック定義によりページ単体の結合ロジックに集中
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TacticsViewerPage } from "../TacticsViewerPage";
import { DEFAULT_SCENE_BACKGROUND } from "@shared/constants";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    tDynamic: (key: string) => key,
  }),
}));

vi.mock("@presentation/components/ui", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

/* ---- Data query hooks ---- */
const mockUseTeams = vi.fn<() => { data: unknown; isLoading: boolean }>();
const mockUseFormations = vi.fn<() => { data: unknown; isLoading: boolean }>();
const mockUseTactics = vi.fn<() => { data: unknown; isLoading?: boolean }>();
const mockUseAllTactics = vi.fn<() => { data: unknown }>();

vi.mock("../../hooks/queries", () => ({
  useTeams: () => mockUseTeams(),
  useFormations: () => mockUseFormations(),
  useTactics: () => mockUseTactics(),
  useAllTactics: () => mockUseAllTactics(),
}));

/* ---- Tactic hooks ---- */
vi.mock("../../hooks/tactic", () => ({
  useTacticsOrchestration: () => ({
    activeTacticId: null,
    activeTactic: null,
    isExecuting: false,
    undoRedoEnabled: true,
    manualPlayerPositions: {},
    mergedPlayerPositions: {},
    mergedArrows: [],
    mergedBallTrajectories: [],
    effectiveBallPosition: null,
    effectiveBallPlacementMode: false,
    ballHighlightPosition: null,
    ballPassCreationMode: false,
    ballPassStartPos: null,
    ballPassTrajectoryType: "high",
    setBallPassCreationMode: vi.fn(),
    setBallPassStartPos: vi.fn(),
    setBallPassPendingEndPos: vi.fn(),
    setBallPassTrajectoryType: vi.fn(),
    tacticsForCurrentFormation: [],
    hasCustomTactics: false,
    triggerTactic: vi.fn(),
    triggerStepTactic: vi.fn(),
    stepExecution: {
      isStepMode: false,
      currentStep: 0,
      totalSteps: 1,
      isStepRunning: false,
      tactic: null,
    },
    executeNextStep: vi.fn(),
    exitStepMode: vi.fn(),
    resetTactic: vi.fn(),
    clearManualPositions: vi.fn(),
    setManualPlayerPositions: vi.fn(),
    handlePlayerDragEnd: vi.fn(),
    startTacticCreation: vi.fn(),
    cancelTacticCreation: vi.fn(),
    handleWizardStepChange: vi.fn(),
    handleSwitchStep: vi.fn(),
    handleAddStep: vi.fn(),
    handleResetStep: vi.fn(),
    handleResetPreview: vi.fn(),
    handlePreviewTactic: vi.fn(),
    handleSaveTactic: vi.fn(),
    handleImportTactics: vi.fn(),
    handleExportTactics: vi.fn(),
    deleteTacticMutation: { mutate: vi.fn() },
    tacticCreation: {
      creation: null,
      setNameJa: vi.fn(),
      setNameEn: vi.fn(),
      setIcon: vi.fn(),
      setGamePhase: vi.fn(),
      setTrajectoryType: vi.fn(),
      setTimelineOpen: vi.fn(),
      setMovementDelay: vi.fn(),
      setStepDuration: vi.fn(),
      removeBallPass: vi.fn(),
      updateBallPassTrajectoryType: vi.fn(),
      cancelCreation: vi.fn(),
      addBallPassByCoords: vi.fn(),
      setBallPosition: vi.fn(),
      setBallTrajectory: vi.fn(),
    },
  }),
  useFlowchartGenerator: () => ({
    generateFlowchart: vi.fn(() => ""),
  }),
}));

/* ---- Field hooks ---- */
vi.mock("../../hooks/field", () => ({
  useFormationManagement: () => ({
    currentFormation: {
      id: "fm-1",
      name: "4-3-3",
      positions: [],
      roleMap: new Map(),
      getPlayerIndexByRole: () => undefined,
      getPositionByIndex: () => undefined,
    },
    currentFormationId: "fm-1",
    formationData: [],
    gameModeFormations: [],
    showFormationEditor: false,
    changeFormation: vi.fn(),
    setCurrentFormationId: vi.fn(),
    setShowFormationEditor: vi.fn(),
  }),
  useOpponents: () => ({
    opponents: [],
    opponentPlacementMode: false,
    opponentTeamId: null,
    opponentTeam: null,
    opponentFormationId: null,
    showOpponentFormationSelect: false,
    showOpponentSquadBuilder: false,
    showOpponentNames: false,
    handleFieldClick: vi.fn(),
    handleOpponentDrag: vi.fn(),
    handleOpponentRemove: vi.fn(),
    handleOpponentSquadComplete: vi.fn(),
    placeSquadDirectly: vi.fn(),
    toggleOpponentPlacement: vi.fn(),
    setOpponents: vi.fn(),
    setOpponentPlacementMode: vi.fn(),
    setOpponentFormationId: vi.fn(),
    setShowOpponentFormationSelect: vi.fn(),
    setShowOpponentSquadBuilder: vi.fn(),
  }),
  useConnectionLines: () => ({
    connectionLines: [],
    lineDrawingMode: false,
    lineFromPlayerIndex: null,
    lineColor: "#ffffff",
    pendingLineEndPos: null,
    handlePlayerClickForLine: vi.fn(),
    handleConnectionLineRemove: vi.fn(),
    resetLineDrawingState: vi.fn(),
    setPendingLineEndPos: vi.fn(),
    setConnectionLines: vi.fn(),
  }),
  useBallPlacement: () => ({
    ballPosition: null,
    ballPlacementMode: false,
    handleBallPlace: vi.fn(),
    handleBallDrag: vi.fn(),
    handleBallRemove: vi.fn(),
    setBallPlacementMode: vi.fn(),
    setBallPosition: vi.fn(),
  }),
}));

/* ---- Team hooks ---- */
const mockTeamManagement = vi.fn();
vi.mock("../../hooks/team", () => ({
  useTeamManagement: () => mockTeamManagement(),
  useDisplayData: () => ({
    playersData: [],
    colorsData: { gk: "#ff0", df: "#00f", mf: "#0f0", fw: "#f00" },
    lineupPlayers: [],
    lineupTeamInfo: { name: "Test", shortName: "TST", colors: {} },
  }),
  useCardManagement: () => ({
    playerCards: {},
    managerCard: "none",
    showCards: false,
    setPlayerCards: vi.fn(),
    setManagerCard: vi.fn(),
    setShowCards: vi.fn(),
    cycleCard: vi.fn(() => "yellow"),
  }),
  useManagerEditor: () => ({
    editingManager: false,
    managerInput: "",
    startEditing: vi.fn(),
    setManagerInput: vi.fn(),
    cancelEditing: vi.fn(),
  }),
}));

/* ---- UI hooks ---- */
vi.mock("../../hooks/ui", () => ({
  useUIVisibility: () => ({
    sidebarOpen: true,
    sidebarAnimating: false,
    squadPanelOpen: false,
    showRightControls: true,
    showPlayerManagement: false,
    showSquadBuilder: false,
    captureMode: false,
    selectedImagePresetId: "none",
    showPlayerNames: true,
    showNameSettings: false,
    showFlowchart: false,
    hiddenPlayerIndices: new Set(),
    isDraggingObject: false,
    fieldLocked: false,
    touchlineLocked: false,
    cameraAction: null,
    playerMarkerScale: 1,
    headerVisible: true,
    toggleSidebar: vi.fn(),
    setSidebarAnimating: vi.fn(),
    setSquadPanelOpen: vi.fn(),
    setShowRightControls: vi.fn(),
    setShowPlayerManagement: vi.fn(),
    setShowSquadBuilder: vi.fn(),
    setCaptureMode: vi.fn(),
    setSelectedImagePresetId: vi.fn(),
    setShowPlayerNames: vi.fn(),
    setShowNameSettings: vi.fn(),
    setShowFlowchart: vi.fn(),
    setHiddenPlayerIndices: vi.fn(),
    setIsDraggingObject: vi.fn(),
    setFieldLocked: vi.fn(),
    setTouchlineLocked: vi.fn(),
    setCameraAction: vi.fn(),
    setPlayerMarkerScale: vi.fn(),
    setHeaderVisible: vi.fn(),
  }),
  usePlayModePhase: () => ({
    playMode: "open",
    gameMode: "football",
    selectedPhase: "attack",
    selectedSetPlayType: null,
    activePhaseForTactics: "attack",
    pitchConfig: {
      gameMode: "football",
      fieldWidth: 10,
      fieldLength: 12,
      halfWidth: 5,
      halfLength: 6,
      fieldBounds: { minX: -5, maxX: 5, minZ: -6, maxZ: 6 },
      playerCount: 11,
      maxOpponents: 11,
    },
    handlePlayModeChange: vi.fn(),
    handleGameModeChange: vi.fn(),
    setSelectedPhase: vi.fn(),
    setSelectedSetPlayType: vi.fn(),
    handleResetState: vi.fn(),
  }),
  usePlayerView: () => ({
    playerViewEnabled: false,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    setPlayerViewEnabled: vi.fn(),
    setSelectedPlayerIndex: vi.fn(),
    setSelectedOpponentViewId: vi.fn(),
    handlePlayerClickForView: vi.fn(),
    handleOpponentViewClick: vi.fn(),
    exitPlayerView: vi.fn(),
  }),
  useBackgroundSettings: () => ({
    sceneBackground: DEFAULT_SCENE_BACKGROUND,
    pitchColor: "#16a34a",
    pitchOpacity: 1,
    showSceneBgSettings: false,
    setShowSceneBgSettings: vi.fn(),
    setSceneBackgroundMode: vi.fn(),
    setSceneBackgroundSolidColor: vi.fn(),
    applyGradientPreset: vi.fn(),
    setGradientFrom: vi.fn(),
    setGradientMid: vi.fn(),
    setGradientMidPosition: vi.fn(),
    setGradientMidWidth: vi.fn(),
    setGradientTo: vi.fn(),
    setGradientAngle: vi.fn(),
    selectedGradientPreset: null,
    isGradientCustom: false,
    gradientPreviewCss:
      "linear-gradient(135deg, #09101c 0%, #dbe4f0 28%, #334155 100%)",
    canResetBackgroundSettings: false,
    handleResetAllBgSettings: vi.fn(),
  }),
  useMultiSelect: () => ({
    selectedPlayerIndices: new Set(),
    selectedOpponentIds: new Set(),
    toggleItem: vi.fn(),
    selectSingle: vi.fn(),
    clearSelection: vi.fn(),
    setSelectionFromRect: vi.fn(),
  }),
}));

/* ---- History hooks ---- */
vi.mock("../../hooks/history", () => ({
  useSnapshotManagement: () => ({
    pushCurrentSnapshot: vi.fn(),
    handleUndo: vi.fn(),
    handleRedo: vi.fn(),
    canUndo: false,
    canRedo: false,
    resetHistory: vi.fn(),
    syncSources: vi.fn(),
    syncSetters: vi.fn(),
  }),
}));

/* ---- Canvas hooks ---- */
vi.mock("../../hooks/canvas", () => ({
  useCanvasMemoization: () => ({
    canvasPlayerCards: {},
    canvasSelectedPlayerIndex: null,
    canvasIsPlayerView: false,
    canvasPlayerDraggable: true,
    canvasLineTrackingActive: false,
    canvasPendingConnectionLine: null,
  }),
  useCanvasCallbacks: () => ({
    handleFieldClick: vi.fn(),
    handleBallPlace: vi.fn(),
    handleBallDrag: vi.fn(),
    handleBallRemove: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    handlePlayerDragEnd: vi.fn(),
    handleGroupDragEnd: vi.fn(),
    handleLinePointerMove: vi.fn(),
    handleCameraActionDone: vi.fn(),
  }),
  useBridgeCallbacks: () => ({
    handlePlayerClick: vi.fn(),
    handleOpponentClick: vi.fn(),
    handleSquadCardCycle: vi.fn(),
    handleSaveManager: vi.fn(),
    handleCycleManagerCard: vi.fn(),
  }),
}));

/* ---- Lineup animation ---- */
vi.mock("@presentation/components/lineup-animation", () => ({
  LineupAnimationOverlay: () => null,
  useLineupAnimation: () => ({
    isActive: false,
    phase: "idle",
    selectedPresetId: null,
    start: vi.fn(),
    skip: vi.fn(),
    cancel: vi.fn(),
    onAnimationComplete: vi.fn(),
  }),
}));

/* ---- Sketch ---- */
vi.mock("@presentation/hooks/sketch", () => ({
  useSketchOverlay: () => ({
    canvasRef: { current: null },
    sketchMode: false,
    activeTool: "pen",
    strokeColor: "#ffffff",
    strokeWidth: 2,
    layers: [],
    activeLayerId: 0,
    toggleSketchMode: vi.fn(),
    setActiveTool: vi.fn(),
    setStrokeColor: vi.fn(),
    setStrokeWidth: vi.fn(),
    setActiveLayerId: vi.fn(),
    toggleLayerVisibility: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    renameLayer: vi.fn(),
    reorderLayers: vi.fn(),
    undoLastStroke: vi.fn(),
    clearLayer: vi.fn(),
    clearAllStrokes: vi.fn(),
    handlePointerDown: vi.fn(),
    handlePointerMove: vi.fn(),
    handlePointerUp: vi.fn(),
    redraw: vi.fn(),
  }),
}));

/* ---- Sub-components (shallow render) ---- */
vi.mock("../../components/tactics-viewer", () => ({
  LoadingScreen: ({ message }: { message: string }) => (
    <div data-testid="loading-screen">{message}</div>
  ),
  TeamSelectionScreen: () => <div data-testid="team-selection-screen" />,
  TacticsHeader: () => <div data-testid="tactics-header" />,
  TacticsSidebarSection: () => <div data-testid="sidebar-section" />,
  TacticsMainContent: () => <div data-testid="main-content" />,
  TacticsModals: () => <div data-testid="tactics-modals" />,
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function defaultTeamManagement(overrides = {}) {
  return {
    selectedTeamId: "team-1",
    selectedTeam: {
      id: { value: "team-1" },
      name: "Test Team",
      shortName: "TST",
      manager: "Test Manager",
      players: [],
      selectedSquad: [],
      updatePlayerCards: vi.fn(),
      updateManager: vi.fn(),
      updateManagerCard: vi.fn(),
    },
    editingTeam: null,
    customSquad: null,
    showTeamSelection: false,
    showTeamCreator: false,
    showBulkTeamImport: false,
    substitutionRecords: [],
    setSelectedTeamId: vi.fn(),
    setShowTeamSelection: vi.fn(),
    setShowTeamCreator: vi.fn(),
    setShowBulkTeamImport: vi.fn(),
    setEditingTeamId: vi.fn(),
    handleCreateTeam: vi.fn(),
    handleUpdateTeam: vi.fn(),
    handleDeleteTeam: vi.fn(),
    handleBulkTeamImport: vi.fn(),
    handleSubstitution: vi.fn(),
    handleUpdateSquad: vi.fn(),
    resetSubstitutions: vi.fn(),
    ...overrides,
  };
}

function setQueryDefaults() {
  mockUseTeams.mockReturnValue({
    data: [
      {
        id: { value: "team-1" },
        name: "Test Team",
        shortName: "TST",
      },
    ],
    isLoading: false,
  });
  mockUseFormations.mockReturnValue({
    data: [],
    isLoading: false,
  });
  mockUseTactics.mockReturnValue({
    data: [],
    isLoading: false,
  });
  mockUseAllTactics.mockReturnValue({
    data: [],
  });
  mockTeamManagement.mockReturnValue(defaultTeamManagement());
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TacticsViewerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setQueryDefaults();
  });

  // ── ローディング状態 ──

  it("チームロード中はローディング画面を表示する", () => {
    mockUseTeams.mockReturnValue({ data: undefined, isLoading: true });
    mockUseFormations.mockReturnValue({ data: [], isLoading: false });

    render(<TacticsViewerPage />);

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });

  it("フォーメーションロード中はローディング画面を表示する", () => {
    mockUseTeams.mockReturnValue({ data: [], isLoading: false });
    mockUseFormations.mockReturnValue({ data: undefined, isLoading: true });

    render(<TacticsViewerPage />);

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
  });

  // ── メイン画面 ──

  it("チーム選択済みの場合、メイン画面を描画する", () => {
    render(<TacticsViewerPage />);

    expect(screen.getByTestId("tactics-header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-section")).toBeInTheDocument();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
    expect(screen.getByTestId("tactics-modals")).toBeInTheDocument();
  });

  it("TacticsSidebarSection が表示される", () => {
    render(<TacticsViewerPage />);

    expect(screen.getByTestId("sidebar-section")).toBeInTheDocument();
  });

  it("TacticsMainContent が表示される", () => {
    render(<TacticsViewerPage />);

    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  });

  // ── チーム未選択時の分岐 ──

  it("チーム未選択かつ selectedTeamId がない場合、チーム選択画面を表示する", () => {
    mockTeamManagement.mockReturnValue(
      defaultTeamManagement({
        selectedTeamId: null,
        selectedTeam: null,
        showTeamSelection: false,
      }),
    );

    render(<TacticsViewerPage />);

    expect(screen.getByTestId("team-selection-screen")).toBeInTheDocument();
  });

  it("showTeamSelection が true の場合、チーム選択画面を表示する", () => {
    mockTeamManagement.mockReturnValue(
      defaultTeamManagement({
        showTeamSelection: true,
      }),
    );

    render(<TacticsViewerPage />);

    expect(screen.getByTestId("team-selection-screen")).toBeInTheDocument();
  });

  it("selectedTeamId はあるが selectedTeam が null の場合、更新中ローディングを表示する", () => {
    mockTeamManagement.mockReturnValue(
      defaultTeamManagement({
        selectedTeamId: "team-1",
        selectedTeam: null,
      }),
    );

    render(<TacticsViewerPage />);

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    expect(screen.getByText("common.updating")).toBeInTheDocument();
  });
});
