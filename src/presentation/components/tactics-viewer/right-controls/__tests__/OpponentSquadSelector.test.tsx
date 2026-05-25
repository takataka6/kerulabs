/**
 * @module OpponentSquadSelector コンポーネント
 * @description 相手チームスカッド選択の単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 相手チーム一覧表示と選択を検証
 * - フォーメーション選択による選手配置を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OpponentSquadSelector } from "../OpponentSquadSelector";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";
import { Color } from "@domain/value-objects/Color";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createTeam(id: string, name: string, players: Player[] = []): Team {
  const team = new Team({
    id: new TeamId(id),
    name,
    subtitle: "",
    colors: { gk: Color.fromHex("#00ff00"), main: Color.fromHex("#ff0000") },
    availableFormations: ["4-4-2"],
    players: [],
    flagType: "flag",
    headerGradient: "from-blue-600 to-blue-500",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  players.forEach((p) => team.addPlayer(p));
  return team;
}

function createPlayer(
  _id: string,
  name: string,
  number: number,
  position: "gk" | "df" | "mf" | "fw" = "mf",
): Player {
  return Player.create({
    name,
    number,
    teamId: new TeamId("team-1"),
    position,
  });
}

function createOpponentsHook(
  overrides: Partial<ReturnType<typeof createDefaultHook>> = {},
) {
  return { ...createDefaultHook(), ...overrides };
}

function createDefaultHook() {
  return {
    opponents: [] as { id: number; x: number; z: number; playerId?: string }[],
    setOpponents: vi.fn(),
    nextOpponentId: 1,
    opponentPlacementMode: true,
    setOpponentPlacementMode: vi.fn(),
    opponentTeamId: null as string | null,
    setOpponentTeamId: vi.fn(),
    opponentTeam: undefined as Team | undefined,
    selectedOpponentPlayerId: null as string | null,
    setSelectedOpponentPlayerId: vi.fn(),
    showOpponentFormationSelect: false,
    setShowOpponentFormationSelect: vi.fn(),
    opponentFormationId: null as string | null,
    setOpponentFormationId: vi.fn(),
    showOpponentSquadBuilder: false,
    setShowOpponentSquadBuilder: vi.fn(),
    showOpponentNames: true,
    setShowOpponentNames: vi.fn(),
    handleFieldClick: vi.fn(),
    handleOpponentDrag: vi.fn(),
    handleOpponentRemove: vi.fn(),
    handleRemoveOpponent: vi.fn(),
    handleDragOpponent: vi.fn(),
    handleSelectFormation: vi.fn(),
    handleResetOpponents: vi.fn(),
    handleOpponentSquadComplete: vi.fn(),
    toggleOpponentPlacementMode: vi.fn(),
    placeSquadDirectly: vi.fn(),
    opponentMarkerColor: "#e74c3c",
    setOpponentMarkerColor: vi.fn(),
    clearOpponents: vi.fn(),
    toggleOpponentPlacement: vi.fn(),
    resetAll: vi.fn(),
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof OpponentSquadSelector>> = {},
) {
  const defaultProps: React.ComponentProps<typeof OpponentSquadSelector> = {
    opponentsHook: createOpponentsHook(),
    teams: [createTeam("team-1", "My Team"), createTeam("opp-1", "Opponent")],
    selectedTeamId: "team-1",
    onEditTeam: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return {
    ...render(<OpponentSquadSelector {...defaultProps} />),
    ...defaultProps,
  };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("OpponentSquadSelector", () => {
  // ── 非表示条件 ────────────────────────────────────────────

  describe("非表示条件", () => {
    it("teams が undefined のとき何も表示しない", () => {
      const { container } = renderComponent({ teams: undefined });
      expect(container.firstChild).toBeNull();
    });

    it("teams が空配列のとき何も表示しない", () => {
      const { container } = renderComponent({ teams: [] });
      expect(container.firstChild).toBeNull();
    });
  });

  // ── チーム選択 ────────────────────────────────────────────

  describe("チーム選択", () => {
    it("チーム選択ラベルを表示する", () => {
      renderComponent();
      expect(screen.getByText("tactics.opponents.team")).toBeInTheDocument();
    });

    it("チーム選択プルダウンに自チーム以外が表示される", () => {
      renderComponent();
      // "My Team" (selectedTeamId = "team-1") should NOT appear as option
      // "Opponent" should appear
      expect(screen.getByText("Opponent")).toBeInTheDocument();
    });

    it("プルダウンの先頭に「なし」オプションがある", () => {
      renderComponent();
      expect(screen.getByText("tactics.opponents.noTeam")).toBeInTheDocument();
    });

    it("チーム変更時に関連ステートがリセットされる", () => {
      const hook = createOpponentsHook();
      renderComponent({ opponentsHook: hook });
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "opp-1" } });
      expect(hook.setOpponentTeamId).toHaveBeenCalledWith("opp-1");
      expect(hook.setSelectedOpponentPlayerId).toHaveBeenCalledWith(null);
      expect(hook.setShowOpponentFormationSelect).toHaveBeenCalledWith(false);
      expect(hook.setShowOpponentSquadBuilder).toHaveBeenCalledWith(false);
      expect(hook.setOpponentFormationId).toHaveBeenCalledWith(null);
    });

    it("空文字選択時に null をセットする", () => {
      const hook = createOpponentsHook();
      renderComponent({ opponentsHook: hook });
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "" } });
      expect(hook.setOpponentTeamId).toHaveBeenCalledWith(null);
    });
  });

  // ── opponentTeam 選択後のアクション ──────────────────────

  describe("opponentTeam 選択後のアクション", () => {
    const oppTeam = createTeam("opp-1", "Opponent", [
      createPlayer("p1", "Player 1", 7),
      createPlayer("p2", "Player 2", 10),
    ]);

    it("スカッドボタンを表示する", () => {
      renderComponent({
        opponentsHook: createOpponentsHook({ opponentTeam: oppTeam }),
      });
      expect(screen.getByText("tactics.opponents.squad")).toBeInTheDocument();
    });

    it("スカッドボタンをクリックすると setShowOpponentFormationSelect が呼ばれる", () => {
      const hook = createOpponentsHook({ opponentTeam: oppTeam });
      renderComponent({ opponentsHook: hook });
      fireEvent.click(screen.getByText("tactics.opponents.squad"));
      expect(hook.setShowOpponentFormationSelect).toHaveBeenCalledWith(true);
    });

    it("onEditTeam があれば編集ボタンを表示する", () => {
      renderComponent({
        opponentsHook: createOpponentsHook({ opponentTeam: oppTeam }),
        onEditTeam: vi.fn(),
      });
      expect(
        screen.getByText("tactics.opponents.editTeam"),
      ).toBeInTheDocument();
    });

    it("onEditTeam がなければ編集ボタンを表示しない", () => {
      renderComponent({
        opponentsHook: createOpponentsHook({ opponentTeam: oppTeam }),
        onEditTeam: undefined,
      });
      expect(
        screen.queryByText("tactics.opponents.editTeam"),
      ).not.toBeInTheDocument();
    });

    it("プレイヤーリストを表示する", () => {
      renderComponent({
        opponentsHook: createOpponentsHook({ opponentTeam: oppTeam }),
      });
      expect(
        screen.getByText("tactics.opponents.selectPlayer"),
      ).toBeInTheDocument();
      expect(screen.getByText("Player 1")).toBeInTheDocument();
      expect(screen.getByText("Player 2")).toBeInTheDocument();
    });

    it("配置済みプレイヤーは無効化される", () => {
      renderComponent({
        opponentsHook: createOpponentsHook({
          opponentTeam: oppTeam,
          opponents: [
            { id: 1, x: 0, z: 0, playerId: oppTeam.players[0].id.value },
          ],
        }),
      });
      const player1Btn = screen.getByText("Player 1").closest("button");
      expect(player1Btn).toBeDisabled();
    });

    it("未配置プレイヤーをクリックすると setSelectedOpponentPlayerId が呼ばれる", () => {
      const hook = createOpponentsHook({ opponentTeam: oppTeam });
      renderComponent({ opponentsHook: hook });
      fireEvent.click(screen.getByText("Player 1"));
      expect(hook.setSelectedOpponentPlayerId).toHaveBeenCalled();
    });
  });
});
