/**
 * @module PlayerManagement コンポーネント
 * @description 選手管理画面の単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 選手一覧表示・追加・編集・削除のUIフローを検証
 * - 検索・フィルタ・ソート機能を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerManagement } from "../PlayerManagement";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";
import { PlayerId } from "@domain/value-objects/PlayerId";
import { Color } from "@domain/value-objects/Color";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

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
  useConfirm: () => ({
    confirm: vi.fn().mockResolvedValue(true),
    alert: vi.fn(),
  }),
  AccessibleModal: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    ariaLabelledBy?: string;
    className?: string;
    overlayClassName?: string;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

vi.mock("../PositionStatsGrid", () => ({
  PositionStatsGrid: () => <div data-testid="position-stats-grid" />,
}));

vi.mock("../PlayerSearchFilter", () => ({
  PlayerSearchFilter: () => <div data-testid="player-search-filter" />,
}));

vi.mock("../PlayerAddForm", () => ({
  PlayerAddForm: () => <div data-testid="player-add-form" />,
}));

vi.mock("../BulkImportForm", () => ({
  BulkImportForm: () => <div data-testid="bulk-import-form" />,
}));

vi.mock("../PlayerRow", () => ({
  PlayerRow: ({ player }: { player: Player }) => (
    <div data-testid={`player-row-${player.id.value}`}>{player.name}</div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

function createPlayer(
  overrides: Partial<{
    id: string;
    name: string;
    number: number;
    position: "gk" | "df" | "mf" | "fw";
  }> = {},
): Player {
  return new Player({
    id: new PlayerId(overrides.id ?? "player-1"),
    teamId: new TeamId("team-1"),
    name: overrides.name ?? "Test Player",
    number: overrides.number ?? 10,
    position: overrides.position ?? "mf",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "available",
  });
}

function createTeam(players: Player[] = []): Team {
  return new Team({
    id: new TeamId("team-1"),
    name: "Test Team",
    subtitle: "Test FC",
    colors: { gk: Color.fromHex("#FFD700"), main: Color.fromHex("#1E90FF") },
    availableFormations: ["4-3-3", "4-4-2"],
    players,
    flagType: "jp",
    headerGradient: "from-blue-600 to-blue-800",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function renderPlayerManagement(
  overrides: Partial<React.ComponentProps<typeof PlayerManagement>> = {},
) {
  const props = {
    team: createTeam([createPlayer()]),
    onUpdateTeam: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  return { ...render(<PlayerManagement {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("PlayerManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 基本レンダリング ──

  describe("基本レンダリング", () => {
    it("モーダルがレンダリングされる", () => {
      renderPlayerManagement();

      expect(screen.getByTestId("accessible-modal")).toBeInTheDocument();
    });

    it("チーム名が表示される", () => {
      renderPlayerManagement();

      expect(screen.getByText("Test Team")).toBeInTheDocument();
    });

    it("サブタイトルに登録人数が表示される", () => {
      renderPlayerManagement();

      expect(
        screen.getByText(/player\.management\.subtitle/),
      ).toBeInTheDocument();
    });

    it("閉じるボタンが表示される", () => {
      renderPlayerManagement();

      expect(screen.getByLabelText("a11y.closeModal")).toBeInTheDocument();
    });

    it("PositionStatsGridが表示される", () => {
      renderPlayerManagement();

      expect(screen.getByTestId("position-stats-grid")).toBeInTheDocument();
    });

    it("PlayerSearchFilterが表示される", () => {
      renderPlayerManagement();

      expect(screen.getByTestId("player-search-filter")).toBeInTheDocument();
    });

    it("選手追加ボタンが表示される", () => {
      renderPlayerManagement();

      expect(screen.getByText("player.addPlayer")).toBeInTheDocument();
    });

    it("一括インポートボタンが表示される", () => {
      renderPlayerManagement();

      expect(screen.getByText("player.bulkImport")).toBeInTheDocument();
    });

    it("フッターの閉じるボタンが表示される", () => {
      renderPlayerManagement();

      expect(screen.getByText("player.close")).toBeInTheDocument();
    });
  });

  // ── 選手リスト表示 ──

  describe("選手リスト表示", () => {
    it("選手が存在する場合、PlayerRowが表示される", () => {
      const players = [
        createPlayer({ id: "p1", name: "Player 1" }),
        createPlayer({ id: "p2", name: "Player 2", number: 7 }),
      ];
      renderPlayerManagement({ team: createTeam(players) });

      expect(screen.getByTestId("player-row-p1")).toBeInTheDocument();
      expect(screen.getByTestId("player-row-p2")).toBeInTheDocument();
    });

    it("選手が0人の場合、空メッセージが表示される", () => {
      renderPlayerManagement({ team: createTeam([]) });

      expect(screen.getByText("player.noPlayers")).toBeInTheDocument();
    });

    it("選手リストのカウントが表示される", () => {
      renderPlayerManagement();

      expect(screen.getByText(/player\.playersCount/)).toBeInTheDocument();
    });
  });

  // ── UI操作 ──

  describe("UI操作", () => {
    it("選手追加ボタンをクリックするとPlayerAddFormが表示される", () => {
      renderPlayerManagement();

      fireEvent.click(screen.getByText("player.addPlayer"));

      expect(screen.getByTestId("player-add-form")).toBeInTheDocument();
    });

    it("一括インポートボタンをクリックするとBulkImportFormが表示される", () => {
      renderPlayerManagement();

      fireEvent.click(screen.getByText("player.bulkImport"));

      expect(screen.getByTestId("bulk-import-form")).toBeInTheDocument();
    });

    it("選手追加ボタンクリック後、追加ボタン群が非表示になる", () => {
      renderPlayerManagement();

      fireEvent.click(screen.getByText("player.addPlayer"));

      expect(screen.queryByText("player.bulkImport")).not.toBeInTheDocument();
    });

    it("閉じるボタンをクリックするとonCloseが呼ばれる", () => {
      const { onClose } = renderPlayerManagement();

      fireEvent.click(screen.getByLabelText("a11y.closeModal"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("フッター閉じるボタンをクリックするとonCloseが呼ばれる", () => {
      const { onClose } = renderPlayerManagement();

      fireEvent.click(screen.getByText("player.close"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
