/**
 * @module PlayerViewHUD コンポーネント
 * @description 選手視点HUDの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 選手情報オーバーレイの表示を検証
 * - 選手選択・解除操作のUIを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerViewHUD } from "../PlayerViewHUD";
import type { ColorsData, PlayerData, Opponent } from "../types";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

const defaultColors: ColorsData = {
  gk: "#FFFF00",
  df: "#1E90FF",
  mf: "#32CD32",
  fw: "#FF4500",
};

const defaultPlayers: PlayerData[] = [
  { name: "Player A", number: 10 },
  { name: "Player B", number: 7 },
  { name: "Player C", number: 11 },
];

const defaultOpponents: Opponent[] = [
  {
    id: 1,
    x: 0,
    z: 0,
    playerNumber: 9,
    playerName: "Player D",
    color: "#FF0000",
  },
];

function renderHUD(
  overrides: Partial<React.ComponentProps<typeof PlayerViewHUD>> = {},
) {
  const props = {
    playerViewEnabled: true,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    captureMode: false,
    playersData: defaultPlayers,
    colorsData: defaultColors,
    opponents: defaultOpponents,
    showPlayerNames: true,
    showPlayerNumbers: true,
    showOpponentNames: true,
    showOpponentNumbers: true,
    isFirstPerson: false,
    onExitPlayerView: vi.fn(),
    onRotateLeft: vi.fn(),
    onRotateRight: vi.fn(),
    onTogglePerspective: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return { ...render(<PlayerViewHUD {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("PlayerViewHUD", () => {
  // ── 非表示条件 ───────────────────────────────────────────

  describe("非表示条件", () => {
    it("captureMode の場合は非表示", () => {
      const { container } = renderHUD({ captureMode: true });
      expect(container.firstChild).toBeNull();
    });

    it("playerViewEnabled が false の場合は非表示", () => {
      const { container } = renderHUD({ playerViewEnabled: false });
      expect(container.firstChild).toBeNull();
    });
  });

  // ── 選手未選択プロンプト ──────────────────────────────────

  describe("選手未選択プロンプト", () => {
    it("playerView 有効・選手未選択時にプロンプトが表示される", () => {
      renderHUD({
        playerViewEnabled: true,
        selectedPlayerIndex: null,
        selectedOpponentViewId: null,
      });

      expect(
        screen.getByText("tactics.playerView.selectPrompt"),
      ).toBeInTheDocument();
    });

    it("カメラアイコン 📹 が表示される", () => {
      renderHUD();
      expect(screen.getByText("📹")).toBeInTheDocument();
    });
  });

  // ── 自チーム選手追跡 ─────────────────────────────────────

  describe("自チーム選手追跡", () => {
    it("選手名が表示される", () => {
      renderHUD({ selectedPlayerIndex: 0 });
      expect(screen.getByText("Player A")).toBeInTheDocument();
    });

    it("背番号が表示される", () => {
      renderHUD({ selectedPlayerIndex: 0 });
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("FOLLOWING ラベルが表示される", () => {
      renderHUD({ selectedPlayerIndex: 0 });
      expect(
        screen.getByText("tactics.playerView.following"),
      ).toBeInTheDocument();
    });

    it("Exit ボタンが表示され、クリックで onExitPlayerView が呼ばれる", () => {
      const { onExitPlayerView } = renderHUD({ selectedPlayerIndex: 0 });

      const exitButton = screen.getByText("tactics.playerView.exit");
      fireEvent.click(exitButton.closest("button")!);

      expect(onExitPlayerView).toHaveBeenCalledTimes(1);
    });

    it("存在しない playerIndex の場合、フォールバック表示になる", () => {
      renderHUD({ selectedPlayerIndex: 99 });
      // フォールバック: #100
      expect(screen.getByText("#100")).toBeInTheDocument();
    });

    it("showPlayerNames=false の場合、選手名を表示しない", () => {
      renderHUD({ selectedPlayerIndex: 0, showPlayerNames: false });
      expect(screen.queryByText("Player A")).not.toBeInTheDocument();
    });

    it("showPlayerNumbers=false の場合、背番号を表示しない", () => {
      renderHUD({ selectedPlayerIndex: 0, showPlayerNumbers: false });
      expect(screen.queryByText("10")).not.toBeInTheDocument();
    });
  });

  // ── 相手選手追跡 ─────────────────────────────────────────

  describe("相手選手追跡", () => {
    it("相手選手名が表示される", () => {
      renderHUD({ selectedOpponentViewId: 1 });
      expect(screen.getByText("Player D")).toBeInTheDocument();
    });

    it("相手選手の背番号が表示される", () => {
      renderHUD({ selectedOpponentViewId: 1 });
      expect(screen.getByText("9")).toBeInTheDocument();
    });

    it("FOLLOWING OPPONENT ラベルが表示される", () => {
      renderHUD({ selectedOpponentViewId: 1 });
      expect(
        screen.getByText("tactics.playerView.followingOpponent"),
      ).toBeInTheDocument();
    });

    it("Exit ボタンが表示され、クリックで onExitPlayerView が呼ばれる", () => {
      const { onExitPlayerView } = renderHUD({
        selectedOpponentViewId: 1,
      });

      const exitButton = screen.getByText("tactics.playerView.exit");
      fireEvent.click(exitButton.closest("button")!);

      expect(onExitPlayerView).toHaveBeenCalledTimes(1);
    });

    it("存在しない opponentId の場合は null を返す", () => {
      const { container } = renderHUD({ selectedOpponentViewId: 999 });
      expect(container.firstChild).toBeNull();
    });

    it("playerName がない相手選手はフォールバック表示", () => {
      const opponents: Opponent[] = [{ id: 2, x: 0, z: 0, playerNumber: 5 }];
      renderHUD({ opponents, selectedOpponentViewId: 2 });
      expect(screen.getByText("#5")).toBeInTheDocument();
    });

    it("showOpponentNames=false の場合、相手選手名を表示しない", () => {
      renderHUD({ selectedOpponentViewId: 1, showOpponentNames: false });
      expect(screen.queryByText("Player D")).not.toBeInTheDocument();
    });

    it("showOpponentNumbers=false の場合、相手選手の背番号を表示しない", () => {
      renderHUD({ selectedOpponentViewId: 1, showOpponentNumbers: false });
      expect(screen.queryByText("9")).not.toBeInTheDocument();
    });
  });
});
