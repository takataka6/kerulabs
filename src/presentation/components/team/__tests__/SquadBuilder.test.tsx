/**
 * @module SquadBuilder コンポーネント
 * @description スカッドビルダーの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - スカッドへの選手追加・削除・並び替えを検証
 * - ポジション別のスロット表示を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SquadBuilder } from "../SquadBuilder";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";
import { Color } from "@domain/value-objects/Color";
import { Position } from "@domain/value-objects/Position";
import type { Formation, FormationPosition } from "@domain/entities/Formation";
import { FormationId } from "@domain/value-objects/FormationId";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({ language: "ja" as const, t: (k: string) => k }),
}));

vi.mock("@presentation/components/ui", () => ({
  AccessibleModal: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

vi.mock("@shared/constants/positionColors", () => ({
  getPositionBg: (pos: string) => `bg-${pos}`,
  getPositionBorder: (pos: string) => `border-${pos}`,
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const teamId = new TeamId("team-1");

function createPlayer(name: string, number: number, position = "mf"): Player {
  return Player.create({ name, number, teamId, position: position as "mf" });
}

function createMockFormation(): Formation {
  const positions: FormationPosition[] = Array.from({ length: 11 }, (_, i) => ({
    pos: i === 0 ? "GK" : `P${i}`,
    position: Position.create(0, i * 10),
    category: (i === 0 ? "gk" : i < 5 ? "df" : i < 8 ? "mf" : "fw") as
      | "gk"
      | "df"
      | "mf"
      | "fw",
  }));

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

function createMockTeam(): Team {
  const team = new Team({
    id: teamId,
    name: "Test Team",
    subtitle: "Test Subtitle",
    colors: { gk: Color.fromHex("#ff0000"), main: Color.fromHex("#0000ff") },
    availableFormations: ["4-3-3"],
    players: [],
    flagType: "flag",
    headerGradient: "from-blue-600 to-blue-500",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  // Add players to team
  for (let i = 1; i <= 15; i++) {
    team.addPlayer(createPlayer(`Player ${i}`, i));
  }
  return team;
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SquadBuilder", () => {
  it("renders with a mock team", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Modal title
    expect(screen.getByText("tactics.squadBuilder.title")).toBeInTheDocument();

    // Team name and formation shown in subtitle (both "4-3-3" appear in subtitle and positions header)
    expect(screen.getByText(/Test Team/)).toBeInTheDocument();
    expect(screen.getAllByText(/4-3-3/).length).toBeGreaterThanOrEqual(1);

    // Positions section
    expect(
      screen.getByText(/tactics.squadBuilder.positions/),
    ).toBeInTheDocument();

    // Available players section
    expect(
      screen.getByText(/tactics.squadBuilder.availablePlayers/),
    ).toBeInTheDocument();

    // Save and cancel buttons
    expect(screen.getByText("tactics.squadBuilder.save")).toBeInTheDocument();
    expect(screen.getByText("tactics.squadBuilder.cancel")).toBeInTheDocument();

    // Player names in available list
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 15")).toBeInTheDocument();
  });

  it("ポジションをクリックするとアクティブ状態になる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Click on the GK position slot
    const gkSlot = screen.getByLabelText("GK");
    fireEvent.click(gkSlot);

    // Should show "select player" hint when a position is active
    expect(
      screen.getByText(/tactics.squadBuilder.selectPlayer/),
    ).toBeInTheDocument();
  });

  it("ポップアップ表示時に最初の空きポジションへフォーカスする", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      (_, index) => (index === 0 ? createPlayer("Assigned GK", 1, "gk") : null),
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const firstEmptySlot = screen.getByLabelText("P1");
    expect(firstEmptySlot).toHaveFocus();
    expect(
      screen.getByText(/tactics.squadBuilder.selectPlayer/),
    ).toBeInTheDocument();
  });

  it("選手検索フィルターで選手を絞り込める", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "tactics.squadBuilder.searchPlayers",
    );
    fireEvent.change(searchInput, { target: { value: "Player 1" } });

    // Player 1, Player 10-15 should match "Player 1"
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    // Player 2 should not be visible
    expect(screen.queryByText("Player 2")).not.toBeInTheDocument();
  });

  it("保存ボタンでonUpdateSquadとonCloseが呼ばれる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const onUpdateSquad = vi.fn();
    const onClose = vi.fn();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={onUpdateSquad}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("tactics.squadBuilder.save"));
    expect(onUpdateSquad).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンでonCloseが呼ばれる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const onClose = vi.fn();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("tactics.squadBuilder.cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("選手一覧にSUBボタンを表示できる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getAllByText("SUB").length).toBeGreaterThan(0);
  });

  it("SUBボタンで選手をサブに追加できる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByText("SUB")[0]);

    expect(screen.getByLabelText(/a11y.removePlayer/)).toBeInTheDocument();
  });

  it("ポジションスロットの選手をクリックすると割り当てが解除される", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    // Assign Player 1 to GK position
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      (_, i) => (i === 0 ? team.players[0] : null),
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Click on the GK position which has Player 1 assigned - should unassign
    const gkSlot = screen.getByLabelText(/GK - Player 1/);
    fireEvent.click(gkSlot);

    // After unassigning, Player 1 should appear in available players list
    expect(screen.getByText("Player 1")).toBeInTheDocument();
  });

  it("アクティブポジションがある時に選手をクリックすると割り当てられる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // First, click on GK position to activate it
    const gkSlot = screen.getByLabelText("GK");
    fireEvent.click(gkSlot);

    // Then click on Player 1 to assign them
    const playerButton = screen.getByLabelText("Player 1 (#1)");
    fireEvent.click(playerButton);

    // Player 1 should now be assigned to GK position
    expect(screen.getByLabelText(/GK - Player 1/)).toBeInTheDocument();
  });

  it("サブメンバーを削除できる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = [
      ...Array.from({ length: 11 }, () => null),
      team.players[0],
    ];

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Remove the substitute using the remove button
    const removeButton = screen.getByLabelText(/a11y.removePlayer/);
    fireEvent.click(removeButton);

    expect(
      screen.queryByLabelText(/a11y.removePlayer/),
    ).not.toBeInTheDocument();
  });

  it("ポジションボタンを表示せず左のポジション選択から割り当てる", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByTitle(/tactics.squadBuilder.assignTo GK/),
    ).not.toBeInTheDocument();

    const gkSlot = screen.getByLabelText("GK");
    fireEvent.click(gkSlot);
    fireEvent.click(screen.getByLabelText("Player 1 (#1)"));

    expect(screen.getByLabelText(/GK - Player 1/)).toBeInTheDocument();
  });

  it("保存ボタンで初期サブメンバーも含めてonUpdateSquadに渡される", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const onUpdateSquad = vi.fn();
    const onClose = vi.fn();
    const selectedPlayers: (Player | null)[] = [
      ...Array.from({ length: 11 }, () => null),
      team.players[0],
    ];

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={onUpdateSquad}
        onClose={onClose}
      />,
    );

    // Save
    fireEvent.click(screen.getByText("tactics.squadBuilder.save"));

    expect(onUpdateSquad).toHaveBeenCalledTimes(1);
    // The saved array should contain 11 position slots + 1 substitute
    const savedPlayers = onUpdateSquad.mock.calls[0][0];
    expect(savedPlayers.length).toBe(12);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("同じポジションを再度クリックするとアクティブ状態が解除される", () => {
    const team = createMockTeam();
    const formation = createMockFormation();
    const selectedPlayers: (Player | null)[] = Array.from(
      { length: 11 },
      () => null,
    );

    render(
      <SquadBuilder
        team={team}
        formation={formation}
        selectedPlayers={selectedPlayers}
        onUpdateSquad={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Click GK position to activate
    const gkSlot = screen.getByLabelText("GK");
    fireEvent.click(gkSlot);
    expect(
      screen.getByText(/tactics.squadBuilder.selectPlayer/),
    ).toBeInTheDocument();

    // Click GK position again to deactivate
    fireEvent.click(gkSlot);
    expect(
      screen.queryByText(/tactics.squadBuilder.selectPlayer/),
    ).not.toBeInTheDocument();
  });
});
