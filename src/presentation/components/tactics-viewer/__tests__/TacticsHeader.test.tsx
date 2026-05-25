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
const mockSetShowPlayerManagement = vi.fn();
const mockSetShowSquadBuilder = vi.fn();
const mockSetCaptureMode = vi.fn();
const mockSetHeaderVisible = vi.fn();
const mockHandlePlayModeChange = vi.fn();

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
  }>;
  playModePhase?: Partial<{
    playMode: "field" | "setPlay";
    handlePlayModeChange: typeof vi.fn;
  }>;
  teamMgmt?: Partial<{
    setShowTeamSelection: typeof vi.fn;
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
        ...overrides.ui,
      },
    },
    teamCtx: {
      selectedTeam: overrides.selectedTeam ?? createTeam(),
      currentFormation: overrides.currentFormation ?? createFormation(),
      teamMgmt: {
        setShowTeamSelection: mockSetShowTeamSelection,
        ...overrides.teamMgmt,
      },
    },
    execCtx: {
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

  it("チーム選択ボタンをクリックすると setShowTeamSelection が呼ばれる", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.teamSelection" }),
    );
    expect(mockSetShowTeamSelection).toHaveBeenCalledWith(true);
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
