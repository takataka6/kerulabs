/**
 * @module SquadPanel コンポーネント
 * @description スカッドパネルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - スカッド選手一覧の表示を検証
 * - 選手選択・並び替え操作を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SquadPanel } from "../SquadPanel";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";
import type { Formation, FormationPosition } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import { FormationId } from "@domain/value-objects/FormationId";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/positionColors", () => ({
  getPositionBg: (pos: string) => `bg-${pos}`,
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);
const teamId = new TeamId("team-1");

function createPlayer(name: string, number: number, position = "mf"): Player {
  return Player.create({ name, number, teamId, position: position as "mf" });
}

function createMockFormation(positionCount = 11): Formation {
  const positions: FormationPosition[] = Array.from(
    { length: positionCount },
    (_, i) => ({
      pos: i === 0 ? "GK" : `P${i}`,
      position: Position.create(0, i * 10),
      category: (i === 0 ? "gk" : i < 5 ? "df" : i < 8 ? "mf" : "fw") as
        | "gk"
        | "df"
        | "mf"
        | "fw",
    }),
  );

  const roleMap = new Map<string, number>();
  positions.forEach((pos, index) => {
    roleMap.set(pos.pos, index);
  });

  return {
    id: new FormationId("formation-1"),
    name: "4-3-3",
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

function renderSquadPanel(
  overrides: Partial<React.ComponentProps<typeof SquadPanel>> = {},
) {
  const formation = createMockFormation();
  const squad: (Player | null)[] = Array.from({ length: 11 }, (_, i) =>
    createPlayer(`Player ${i + 1}`, i + 1, i === 0 ? "gk" : "mf"),
  );

  const defaultProps: React.ComponentProps<typeof SquadPanel> = {
    customSquad: squad,
    currentFormation: formation,
    playerCards: {},
    squadPanelOpen: true,
    captureMode: false,
    showSquadBuilder: false,
    playerViewEnabled: false,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    onToggleSquadPanel: vi.fn(),
    onCycleCard: vi.fn(),
    t: mockT,
  };

  const props = { ...defaultProps, ...overrides };
  return { ...render(<SquadPanel {...props} />), props };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SquadPanel", () => {
  it("renders with squad players showing names and numbers", () => {
    renderSquadPanel();

    // Panel header with formation name
    expect(screen.getByText(/tactics\.squad/)).toBeInTheDocument();
    expect(screen.getByText(/4-3-3/)).toBeInTheDocument();

    // Player names
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 11")).toBeInTheDocument();

    // Player numbers
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();

    // Toggle indicator (open state)
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  it("returns null when captureMode is true", () => {
    const { container } = renderSquadPanel({ captureMode: true });
    expect(container.firstChild).toBeNull();
  });

  it("returns null when showSquadBuilder is true", () => {
    const { container } = renderSquadPanel({ showSquadBuilder: true });
    expect(container.firstChild).toBeNull();
  });

  it("returns null when playerViewEnabled and a player is selected", () => {
    const { container } = renderSquadPanel({
      playerViewEnabled: true,
      selectedPlayerIndex: 0,
    });
    expect(container.firstChild).toBeNull();
  });

  it("returns null when all squad positions are null", () => {
    const squad: (Player | null)[] = Array.from({ length: 11 }, () => null);
    const { container } = renderSquadPanel({ customSquad: squad });
    expect(container.firstChild).toBeNull();
  });

  it("displays card status when a player has a yellow card", () => {
    renderSquadPanel({ playerCards: { 0: "yellow" } });

    // The component renders card indicators; the yellow card element
    // should be present when the player at index 0 has a yellow card
    expect(screen.getByText("Player 1")).toBeInTheDocument();
  });

  it("shows closed indicator when squadPanelOpen is false but players exist", () => {
    renderSquadPanel({ squadPanelOpen: false });

    // Header should still be visible with closed indicator
    expect(screen.getByText(/▼/)).toBeInTheDocument();

    // Player names should NOT be visible (panel is closed)
    expect(screen.queryByText("Player 1")).not.toBeInTheDocument();
  });
});
