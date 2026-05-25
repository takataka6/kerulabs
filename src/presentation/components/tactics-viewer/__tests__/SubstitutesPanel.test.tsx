/**
 * @module SubstitutesPanel コンポーネント
 * @description 交代選手パネルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 交代選手一覧の表示を検証
 * - 交代記録の追加・削除を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SubstitutesPanel } from "../SubstitutesPanel";
import type { SubstitutionRecord } from "../SubstitutesPanel";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/positionColors", () => ({
  getPositionBg: (pos: string) => `bg-${pos}`,
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);
const teamId = new TeamId("team-1");

function createPlayer(name: string, number: number, position = "fw"): Player {
  return Player.create({ name, number, teamId, position: position as "fw" });
}

/** positions プロパティだけを持つ最小限の Formation モック */
function createMockFormation(positionCount = 11) {
  const positions = Array.from({ length: positionCount }, (_, i) => ({
    pos: `P${i}`,
    position: { x: 0, z: i * 10, y: 0 },
    category: "mf" as const,
  }));
  return { positions } as {
    positions: {
      pos: string;
      position: { x: number; z: number; y: number };
      category: string;
    }[];
  };
}

function renderPanel(
  overrides: Partial<React.ComponentProps<typeof SubstitutesPanel>> = {},
) {
  const formation = createMockFormation(11);
  // 15 players: 11 starters + 4 subs
  const players: (Player | null)[] = Array.from({ length: 15 }, (_, i) =>
    createPlayer(`Player ${i + 1}`, i + 1),
  );

  const props = {
    customSquad: players,
    currentFormation: formation as never,
    captureMode: false,
    showSquadBuilder: false,
    squadPanelOpen: true,
    playerViewEnabled: false,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    substitutionRecords: [] as SubstitutionRecord[],
    onResetSubstitutions: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return { ...render(<SubstitutesPanel {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("SubstitutesPanel", () => {
  // ── 表示条件 ─────────────────────────────────────────────

  describe("表示条件", () => {
    it("サブがいる場合にパネルが表示される", () => {
      renderPanel();
      expect(screen.getByText(/tactics\.substitutes/)).toBeInTheDocument();
    });

    it("captureMode の場合は表示されない", () => {
      const { container } = renderPanel({ captureMode: true });
      expect(container.firstChild).toBeNull();
    });

    it("showSquadBuilder の場合は表示されない", () => {
      const { container } = renderPanel({ showSquadBuilder: true });
      expect(container.firstChild).toBeNull();
    });

    it("squadPanelOpen が false の場合は表示されない", () => {
      const { container } = renderPanel({ squadPanelOpen: false });
      expect(container.firstChild).toBeNull();
    });

    it("playerView が有効で選手選択中の場合は表示されない", () => {
      const { container } = renderPanel({
        playerViewEnabled: true,
        selectedPlayerIndex: 0,
      });
      expect(container.firstChild).toBeNull();
    });

    it("playerView が有効で相手選手選択中の場合は表示されない", () => {
      const { container } = renderPanel({
        playerViewEnabled: true,
        selectedOpponentViewId: 1,
      });
      expect(container.firstChild).toBeNull();
    });

    it("サブも交代記録もない場合は表示されない", () => {
      const formation = createMockFormation(11);
      const players = Array.from({ length: 11 }, (_, i) =>
        createPlayer(`Player ${i + 1}`, i + 1),
      );
      const { container } = renderPanel({
        customSquad: players,
        currentFormation: formation as never,
      });
      expect(container.firstChild).toBeNull();
    });
  });

  // ── サブ選手一覧 ─────────────────────────────────────────

  describe("サブ選手一覧", () => {
    it("サブ選手の名前が表示される", () => {
      renderPanel();

      expect(screen.getByText("Player 12")).toBeInTheDocument();
      expect(screen.getByText("Player 13")).toBeInTheDocument();
      expect(screen.getByText("Player 14")).toBeInTheDocument();
      expect(screen.getByText("Player 15")).toBeInTheDocument();
    });

    it("サブ選手の背番号が表示される", () => {
      renderPanel();

      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("13")).toBeInTheDocument();
    });

    it("サブ選手数がヘッダーに表示される", () => {
      renderPanel();

      expect(screen.getByText(/• 4/)).toBeInTheDocument();
    });
  });

  // ── 折りたたみ ───────────────────────────────────────────

  describe("折りたたみ", () => {
    it("ヘッダークリックでパネルを閉じる", () => {
      renderPanel();

      expect(screen.getByText("Player 12")).toBeInTheDocument();

      // ヘッダーをクリック
      fireEvent.click(screen.getByText(/tactics\.substitutes/));

      // サブ選手が非表示になる
      expect(screen.queryByText("Player 12")).not.toBeInTheDocument();
    });

    it("再クリックでパネルを開く", () => {
      renderPanel();

      // 閉じる
      fireEvent.click(screen.getByText(/tactics\.substitutes/));
      expect(screen.queryByText("Player 12")).not.toBeInTheDocument();

      // 開く
      fireEvent.click(screen.getByText(/tactics\.substitutes/));
      expect(screen.getByText("Player 12")).toBeInTheDocument();
    });

    it("折りたたみインジケーター '▲'/'▼' が切り替わる", () => {
      renderPanel();

      // 開いた状態: ▲
      expect(screen.getByText("▲")).toBeInTheDocument();

      // 閉じる
      fireEvent.click(screen.getByText(/tactics\.substitutes/));
      expect(screen.getByText("▼")).toBeInTheDocument();
    });
  });

  // ── 交代記録 ─────────────────────────────────────────────

  describe("交代記録", () => {
    it("交代記録が表示される", () => {
      const inPlayer = createPlayer("Sub Player", 12);
      const outPlayer = createPlayer("Starter Player", 1);

      renderPanel({
        substitutionRecords: [{ inPlayer, outPlayer }],
      });

      expect(screen.getByText("IN")).toBeInTheDocument();
      expect(screen.getByText("OUT")).toBeInTheDocument();
      expect(screen.getByText("Sub Player")).toBeInTheDocument();
      expect(screen.getByText("Starter Player")).toBeInTheDocument();
    });

    it("交代記録数がヘッダーに表示される", () => {
      const records: SubstitutionRecord[] = [
        {
          inPlayer: createPlayer("Sub 1", 12),
          outPlayer: createPlayer("Starter 1", 1),
        },
        {
          inPlayer: createPlayer("Sub 2", 13),
          outPlayer: createPlayer("Starter 2", 2),
        },
      ];

      renderPanel({ substitutionRecords: records });

      // 交代セクションヘッダーに件数
      expect(screen.getByText(/• 2/)).toBeInTheDocument();
    });

    it("リセットボタンが表示され、クリックで onResetSubstitutions が呼ばれる", () => {
      const onResetSubstitutions = vi.fn();
      const records: SubstitutionRecord[] = [
        {
          inPlayer: createPlayer("Sub 1", 12),
          outPlayer: createPlayer("Starter 1", 1),
        },
      ];

      renderPanel({
        substitutionRecords: records,
        onResetSubstitutions,
      });

      const resetButton = screen.getByText("tactics.substitution.reset");
      fireEvent.click(resetButton);

      expect(onResetSubstitutions).toHaveBeenCalledTimes(1);
    });

    it("onResetSubstitutions が未設定の場合、リセットボタンは表示されない", () => {
      const records: SubstitutionRecord[] = [
        {
          inPlayer: createPlayer("Sub 1", 12),
          outPlayer: createPlayer("Starter 1", 1),
        },
      ];

      renderPanel({
        substitutionRecords: records,
        onResetSubstitutions: undefined,
      });

      expect(
        screen.queryByText("tactics.substitution.reset"),
      ).not.toBeInTheDocument();
    });
  });

  // ── ドラッグ ─────────────────────────────────────────────

  describe("ドラッグ", () => {
    it("サブ選手が draggable 属性を持つ", () => {
      renderPanel();

      const subEntry = screen.getByText("Player 12").closest("[draggable]");
      expect(subEntry).toHaveAttribute("draggable", "true");
    });
  });
});
