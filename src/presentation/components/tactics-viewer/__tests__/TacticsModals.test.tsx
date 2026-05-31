/**
 * @module TacticsModals コンポーネント
 * @description 戦術関連モーダル群の単体テスト
 *
 * テスト方針:
 * - 分割済みContext（useTacticsUI / useTacticsTeam / useTacticsExecution）をモック化
 * - 各種モーダル（選手管理・スカッド等）の表示/非表示を検証
 * - モーダル内操作のコールバック呼び出しを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TacticsModals } from "../TacticsModals";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";
import { Color } from "@domain/value-objects/Color";
import type { Formation } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import { FormationId } from "@domain/value-objects/FormationId";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

let mockUIContext: Record<string, unknown>;
let mockTeamContext: Record<string, unknown>;
let mockExecutionContext: Record<string, unknown>;

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

vi.mock("../../player-management/PlayerManagement", () => ({
  PlayerManagement: ({
    onClose,
  }: {
    onClose: () => void;
    team: Team;
    onUpdateTeam: (t: Team) => Promise<void>;
  }) => (
    <div data-testid="player-management">
      <button onClick={onClose}>close-pm</button>
    </div>
  ),
}));

vi.mock("@presentation/components/team", () => ({
  SquadBuilder: ({
    onClose,
  }: {
    onClose: () => void;
    team: Team;
    formation: Formation;
    selectedPlayers: (Player | null)[];
    onUpdateSquad: (p: (Player | null)[]) => void | Promise<void>;
  }) => (
    <div data-testid="squad-builder">
      <button onClick={onClose}>close-sb</button>
    </div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const teamId = new TeamId("team-1");
const opponentTeamId = new TeamId("opp-1");

function createTeam(
  id: TeamId,
  name: string,
  formations: string[] = ["4-4-2 Flat"],
) {
  return new Team({
    id,
    name,
    subtitle: "",
    colors: { gk: Color.fromHex("#00ff00"), main: Color.fromHex("#ff0000") },
    availableFormations: formations,
    players: [],
    flagType: "flag",
    headerGradient: "from-blue-600 to-blue-500",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function createFormation(id: string, name: string): Formation {
  const positions = Array.from({ length: 11 }, (_, i) => ({
    pos: `P${i}`,
    position: Position.create(0, i * 10),
    category: "mf" as const,
  }));
  const roleMap = new Map<string, number>();
  positions.forEach((p, i) => roleMap.set(p.pos, i));
  return {
    id: new FormationId(id),
    name,
    type: "football",
    positions,
    roleMap,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    gameMode: "football",
    getPlayerIndexByRole: (role: string) => roleMap.get(role),
    getPositionByIndex: (index: number) => positions[index],
  } as Formation;
}

const selectedTeam = createTeam(teamId, "My Team");
const opponentTeam = createTeam(opponentTeamId, "Opponent Team", [
  "4-4-2 Flat",
]);
const formation442 = createFormation("f-1", "4-4-2 Flat");
const futsalFormation22 = {
  ...createFormation("futsal-2-2", "2-2"),
  type: "futsal",
  gameMode: "futsal",
} as Formation;

/** 各Contextに値を分配するヘルパー */
function shallowMerge<T extends Record<string, unknown>>(
  defaults: T,
  overrides: Record<string, unknown>,
): T {
  const merged = { ...defaults } as Record<string, unknown>;
  for (const key of Object.keys(overrides)) {
    const overrideVal = overrides[key];
    const defaultVal = merged[key];
    if (
      typeof overrideVal === "object" &&
      overrideVal !== null &&
      !Array.isArray(overrideVal) &&
      typeof defaultVal === "object" &&
      defaultVal !== null
    ) {
      merged[key] = {
        ...(defaultVal as Record<string, unknown>),
        ...(overrideVal as Record<string, unknown>),
      };
    } else {
      merged[key] = overrideVal;
    }
  }
  return merged as T;
}

const defaultUI = {
  ui: {
    showPlayerManagement: false,
    showSquadBuilder: false,
    setShowPlayerManagement: vi.fn(),
    setShowSquadBuilder: vi.fn(),
  },
};

const defaultTeam = {
  selectedTeam,
  currentFormation: formation442,
  teamMgmt: {
    handleUpdateTeam: vi.fn(),
    handleUpdateSquad: vi.fn(),
    customSquad: [],
  },
  formationMgmt: {
    gameModeFormations: [formation442],
  },
};

const defaultExecution = {
  playModePhase: {
    gameMode: "football",
  },
  opponentsHook: {
    showOpponentFormationSelect: false,
    showOpponentSquadBuilder: false,
    opponentTeam: undefined as Team | undefined,
    opponentFormationId: null as string | null,
    setShowOpponentFormationSelect: vi.fn(),
    setShowOpponentSquadBuilder: vi.fn(),
    setOpponentFormationId: vi.fn(),
    handleOpponentSquadComplete: vi.fn(),
    placeSquadDirectly: vi.fn(),
  },
};

function renderComponent(overrides: Record<string, unknown> = {}) {
  mockUIContext = shallowMerge(defaultUI, overrides);
  mockTeamContext = shallowMerge(defaultTeam, overrides);
  mockExecutionContext = shallowMerge(defaultExecution, overrides);
  return {
    ...render(<TacticsModals />),
    uiCtx: mockUIContext,
    teamCtx: mockTeamContext,
    execCtx: mockExecutionContext,
  };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("TacticsModals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── PlayerManagement モーダル ──────────────────────────────

  describe("PlayerManagement モーダル", () => {
    it("showPlayerManagement が false のとき表示しない", () => {
      renderComponent({ ui: { showPlayerManagement: false } });
      expect(screen.queryByTestId("player-management")).not.toBeInTheDocument();
    });

    it("showPlayerManagement が true のとき表示する", () => {
      renderComponent({ ui: { showPlayerManagement: true } });
      expect(screen.getByTestId("player-management")).toBeInTheDocument();
    });
  });

  // ── SquadBuilder モーダル ──────────────────────────────────

  describe("SquadBuilder モーダル", () => {
    it("showSquadBuilder が false のとき表示しない", () => {
      renderComponent({ ui: { showSquadBuilder: false } });
      expect(screen.queryByTestId("squad-builder")).not.toBeInTheDocument();
    });

    it("showSquadBuilder が true のとき表示する", () => {
      renderComponent({ ui: { showSquadBuilder: true } });
      expect(screen.getByTestId("squad-builder")).toBeInTheDocument();
    });
  });

  // ── 相手チームフォーメーション選択 ──────────────────────────

  describe("相手チームフォーメーション選択", () => {
    it("showOpponentFormationSelect が false のとき表示しない", () => {
      renderComponent({
        opponentsHook: { showOpponentFormationSelect: false },
      });
      expect(
        screen.queryByText("tactics.opponents.selectFormation"),
      ).not.toBeInTheDocument();
    });

    it("opponentTeam がない場合は表示しない", () => {
      renderComponent({
        opponentsHook: {
          showOpponentFormationSelect: true,
          opponentTeam: undefined,
        },
      });
      expect(
        screen.queryByText("tactics.opponents.selectFormation"),
      ).not.toBeInTheDocument();
    });

    it("両方設定されていればフォーメーション選択を表示する", () => {
      renderComponent({
        opponentsHook: {
          showOpponentFormationSelect: true,
          opponentTeam,
        },
      });
      expect(
        screen.getByText("tactics.opponents.selectFormation"),
      ).toBeInTheDocument();
      expect(screen.getByText("Opponent Team")).toBeInTheDocument();
    });

    it("利用可能なフォーメーションのボタンが表示される", () => {
      renderComponent({
        opponentsHook: {
          showOpponentFormationSelect: true,
          opponentTeam,
        },
      });
      expect(screen.getByText("4-4-2 Flat")).toBeInTheDocument();
    });

    it("相手チームに現在ゲームモードの設定がない場合はデフォルトフォーメーションを表示する", () => {
      renderComponent({
        playModePhase: {
          gameMode: "futsal",
        },
        opponentsHook: {
          showOpponentFormationSelect: true,
          opponentTeam,
        },
        formationMgmt: {
          gameModeFormations: [futsalFormation22],
        },
      });

      expect(screen.getByText("2-2")).toBeInTheDocument();
    });

    it("フォーメーションボタンをクリックすると opponentsHook の状態遷移が呼ばれる", () => {
      const setOpponentFormationId = vi.fn();
      const setShowOpponentFormationSelect = vi.fn();
      const setShowOpponentSquadBuilder = vi.fn();
      renderComponent({
        opponentsHook: {
          showOpponentFormationSelect: true,
          opponentTeam,
          setOpponentFormationId,
          setShowOpponentFormationSelect,
          setShowOpponentSquadBuilder,
        },
      });
      fireEvent.click(screen.getByText("4-4-2 Flat"));
      // When opponentTeam has no selectedSquad, it should transition to squad builder
      expect(setOpponentFormationId).toHaveBeenCalledWith("f-1");
      expect(setShowOpponentFormationSelect).toHaveBeenCalledWith(false);
      expect(setShowOpponentSquadBuilder).toHaveBeenCalledWith(true);
    });

    it("閉じるボタンをクリックすると setShowOpponentFormationSelect(false) が呼ばれる", () => {
      const setShowOpponentFormationSelect = vi.fn();
      const setOpponentFormationId = vi.fn();
      renderComponent({
        opponentsHook: {
          showOpponentFormationSelect: true,
          opponentTeam,
          setShowOpponentFormationSelect,
          setOpponentFormationId,
        },
      });
      fireEvent.click(screen.getByLabelText("a11y.closeModal"));
      expect(setShowOpponentFormationSelect).toHaveBeenCalledWith(false);
      expect(setOpponentFormationId).toHaveBeenCalledWith(null);
    });

    it("オーバーレイクリックで setShowOpponentFormationSelect(false) が呼ばれる", () => {
      const setShowOpponentFormationSelect = vi.fn();
      const setOpponentFormationId = vi.fn();
      renderComponent({
        opponentsHook: {
          showOpponentFormationSelect: true,
          opponentTeam,
          setShowOpponentFormationSelect,
          setOpponentFormationId,
        },
      });
      // portal により document.body 直下にレンダリングされる
      const overlay = screen.getByRole("dialog").parentElement as HTMLElement;
      fireEvent.click(overlay);
      expect(setShowOpponentFormationSelect).toHaveBeenCalledWith(false);
      expect(setOpponentFormationId).toHaveBeenCalledWith(null);
    });
  });

  // ── 相手チーム SquadBuilder ────────────────────────────────

  describe("相手チーム SquadBuilder", () => {
    it("条件が揃っていないとき表示しない", () => {
      renderComponent({
        opponentsHook: {
          showOpponentSquadBuilder: true,
          opponentFormationId: null,
        },
      });
      // No squad-builder for opponents since opponentFormation is undefined
      expect(screen.queryByTestId("squad-builder")).not.toBeInTheDocument();
    });

    it("条件が揃っているとき SquadBuilder を表示する", () => {
      renderComponent({
        opponentsHook: {
          showOpponentSquadBuilder: true,
          opponentTeam,
          opponentFormationId: "f-1",
        },
        formationMgmt: {
          gameModeFormations: [formation442],
        },
      });
      expect(screen.getByTestId("squad-builder")).toBeInTheDocument();
    });
  });
});
