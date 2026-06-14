/**
 * @module TacticsHeader コンポーネント
 * @description 戦術ビューヘッダーの単体テスト
 *
 * テスト方針:
 * - 分割済みContext（useTacticsUI / useTacticsTeam / useTacticsExecution）をモック化
 * - チーム名・フォーメーション表示を検証
 * - ヘッダーメニューボタンのクリックイベントを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TacticsHeader } from "../TacticsHeader";
import { Team } from "@domain/entities/Team";

/* ------------------------------------------------------------------ */
/*  Mock fns                                                           */
/* ------------------------------------------------------------------ */

const mockSetShowTeamSelection = vi.fn();
const mockSetCustomSquad = vi.fn();
const mockResetSubstitutions = vi.fn();
const mockSetShowPlayerManagement = vi.fn();
const mockSetShowSquadBuilder = vi.fn();
const mockSetCaptureMode = vi.fn();
const mockSetHeaderVisible = vi.fn();
const mockHandlePlayModeChange = vi.fn();
const mockClearManualPositions = vi.fn();
const mockResetTactic = vi.fn();
const mockClearConnectionLines = vi.fn();
const mockResetLineDrawingState = vi.fn();
const mockSetBallPosition = vi.fn();
const mockSetBallPlacementMode = vi.fn();
const mockClearOpponents = vi.fn();
const mockSetOpponentPlacementMode = vi.fn();
const mockSetOpponentTeamId = vi.fn();
const mockSetSelectedOpponentPlayerId = vi.fn();
const mockSetShowOpponentFormationSelect = vi.fn();
const mockSetOpponentFormationId = vi.fn();
const mockSetShowOpponentSquadBuilder = vi.fn();
const mockExitPlayerView = vi.fn();
const mockClearSelection = vi.fn();
const mockClearRect = vi.fn();

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: "team-1",
    name: "FC Test",
    subtitle: "Test Subtitle",
    country: "Japan",
    headerGradient: "from-red-500 to-blue-500",
    colors: {
      gk: { toHex: () => "#ff0" },
      main: { toHex: () => "#00f" },
    },
    ...overrides,
  } as unknown as Team;
}

function createFormation() {
  return { name: "4-3-3" } as never;
}

interface ContextOverrides {
  selectedTeam?: Team;
  currentFormation?: ReturnType<typeof createFormation>;
  ui?: Partial<{
    captureMode: boolean;
    headerVisible: boolean;
    setShowPlayerManagement: typeof vi.fn;
    setShowSquadBuilder: typeof vi.fn;
    setCaptureMode: typeof vi.fn;
    setHeaderVisible: typeof vi.fn;
    setSidebarOpen: typeof vi.fn;
    setRightSidebarOpen: typeof vi.fn;
  }>;
  playModePhase?: Partial<{
    playMode: "field" | "setPlay";
    handlePlayModeChange: typeof vi.fn;
  }>;
  teamMgmt?: Partial<{
    setShowTeamSelection: typeof vi.fn;
    setCustomSquad: typeof vi.fn;
    resetSubstitutions: typeof vi.fn;
  }>;
}

function createDefaultContexts(overrides: ContextOverrides = {}) {
  return {
    uiCtx: {
      ui: {
        captureMode: false,
        headerVisible: true,
        setShowPlayerManagement: mockSetShowPlayerManagement,
        setShowSquadBuilder: mockSetShowSquadBuilder,
        setCaptureMode: mockSetCaptureMode,
        setHeaderVisible: mockSetHeaderVisible,
        setSidebarOpen: vi.fn(),
        setRightSidebarOpen: vi.fn(),
        ...overrides.ui,
      },
    },
    teamCtx: {
      selectedTeam: overrides.selectedTeam ?? createTeam(),
      currentFormation: overrides.currentFormation ?? createFormation(),
      teamMgmt: {
        setShowTeamSelection: mockSetShowTeamSelection,
        setCustomSquad: mockSetCustomSquad,
        resetSubstitutions: mockResetSubstitutions,
        ...overrides.teamMgmt,
      },
    },
    execCtx: {
      tOrch: {
        clearManualPositions: mockClearManualPositions,
        resetTactic: mockResetTactic,
      },
      opponentsHook: {
        clearOpponents: mockClearOpponents,
        setOpponentPlacementMode: mockSetOpponentPlacementMode,
        setOpponentTeamId: mockSetOpponentTeamId,
        setSelectedOpponentPlayerId: mockSetSelectedOpponentPlayerId,
        setShowOpponentFormationSelect: mockSetShowOpponentFormationSelect,
        setOpponentFormationId: mockSetOpponentFormationId,
        setShowOpponentSquadBuilder: mockSetShowOpponentSquadBuilder,
      },
      ballHook: {
        setBallPosition: mockSetBallPosition,
        setBallPlacementMode: mockSetBallPlacementMode,
      },
      connLines: {
        clearConnectionLines: mockClearConnectionLines,
        resetLineDrawingState: mockResetLineDrawingState,
      },
      playerView: {
        exitPlayerView: mockExitPlayerView,
        setPlayerViewEnabled: vi.fn(),
        setSelectedPlayerIndex: vi.fn(),
        setSelectedOpponentViewId: vi.fn(),
      },
      multiSelect: {
        clearSelection: mockClearSelection,
        clearRect: mockClearRect,
      },
      playModePhase: {
        playMode: "field" as const,
        handlePlayModeChange: mockHandlePlayModeChange,
        ...overrides.playModePhase,
      },
    },
  };
}

let mockUIContext: ReturnType<typeof createDefaultContexts>["uiCtx"];
let mockTeamContext: ReturnType<typeof createDefaultContexts>["teamCtx"];
let mockExecutionContext: ReturnType<typeof createDefaultContexts>["execCtx"];

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/countries", () => ({
  getCountryInfo: (name: string) => ({
    flag: "🏴",
    name,
  }),
}));

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

/* ------------------------------------------------------------------ */
/*  Render helper                                                      */
/* ------------------------------------------------------------------ */

function renderHeader(overrides: ContextOverrides = {}) {
  const ctxs = createDefaultContexts(overrides);
  mockUIContext = ctxs.uiCtx;
  mockTeamContext = ctxs.teamCtx;
  mockExecutionContext = ctxs.execCtx;
  return render(<TacticsHeader />);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TacticsHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const ctxs = createDefaultContexts();
    mockUIContext = ctxs.uiCtx;
    mockTeamContext = ctxs.teamCtx;
    mockExecutionContext = ctxs.execCtx;
  });

  it("チーム名とフォーメーション名を表示する", () => {
    renderHeader();
    expect(screen.getByText("FC Test")).toBeInTheDocument();
    expect(screen.getByText(/Test Subtitle.*4-3-3/)).toBeInTheDocument();
  });

  it("相手チーム選択時はヘッダーに対戦カードを表示する", () => {
    renderHeader();

    mockExecutionContext.opponentsHook.opponentTeam = createTeam({
      id: "opp-1" as never,
      name: "Opponent FC",
    });

    render(<TacticsHeader />);

    expect(screen.getByText("FC Test vs Opponent FC")).toBeInTheDocument();
  });

  it("チーム選択ボタンをクリックすると setShowTeamSelection が呼ばれる", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.teamSelection" }),
    );
    expect(mockSetShowTeamSelection).toHaveBeenCalledWith(true);
    expect(mockClearManualPositions).toHaveBeenCalledOnce();
    expect(mockResetTactic).toHaveBeenCalledOnce();
    expect(mockClearConnectionLines).toHaveBeenCalledOnce();
    expect(mockSetBallPosition).toHaveBeenCalledWith(null);
    expect(mockClearOpponents).toHaveBeenCalledOnce();
  });

  it("選手管理ボタンをクリックすると setShowPlayerManagement が呼ばれる", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.playerManagement" }),
    );
    expect(mockSetShowPlayerManagement).toHaveBeenCalledWith(true);
  });

  it("スカッドビルダーボタンをクリックすると setShowSquadBuilder が呼ばれる", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.squadBuilder" }),
    );
    expect(mockSetShowSquadBuilder).toHaveBeenCalledWith(true);
  });

  it("キャプチャモードボタンをクリックすると setCaptureMode が呼ばれる", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.captureMode" }),
    );
    expect(mockSetCaptureMode).toHaveBeenCalledOnce();
  });

  it("プレーモード切替ボタンをクリックすると handlePlayModeChange が呼ばれる", () => {
    renderHeader();

    const buttons = screen.getAllByRole("button");
    const setPlayBtn = buttons.find(
      (btn) => btn.textContent === "tactics.mode.setPlay",
    );
    expect(setPlayBtn).toBeDefined();
    fireEvent.click(setPlayBtn!);
    expect(mockHandlePlayModeChange).toHaveBeenCalledWith("setPlay");
  });

  it("captureMode=true の場合 header が hidden クラスを持つ", () => {
    const { container } = renderHeader({ ui: { captureMode: true } });
    const header = container.querySelector("header");
    expect(header?.className).toContain("hidden");
  });

  it("国情報がない場合もクラッシュしない", () => {
    const team = createTeam({ country: undefined });
    renderHeader({ selectedTeam: team });
    expect(screen.getByText("FC Test")).toBeInTheDocument();
  });
});
