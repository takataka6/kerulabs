/**
 * @module TeamSelectionScreen コンポーネント
 * @description チーム選択画面の単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - チーム一覧表示と選択操作を検証
 * - チーム作成への遷移を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamSelectionScreen } from "../TeamSelectionScreen";
import { Team } from "@domain/entities/Team";
import { TeamId } from "@domain/value-objects";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/countries", () => ({
  getCountryInfo: (code: string) => ({
    flag: `🏴 ${code}`,
    name: code,
  }),
}));

vi.mock("@presentation/components/team", () => ({
  TeamCreator: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="team-creator">
      <button onClick={onClose}>close-creator</button>
    </div>
  ),
  BulkTeamImportModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="bulk-import-modal">
      <button onClick={onClose}>close-import</button>
    </div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createTeam(id: string, name: string, country?: string): Team {
  return new Team({
    id: new TeamId(id),
    name,
    subtitle: "Subtitle",
    colors: {
      gk: { hex: "#FFFF00" } as never,
      main: { hex: "#1E90FF" } as never,
    },
    availableFormations: ["4-4-2", "4-3-3"],
    players: [],
    flagType: "rect",
    headerGradient: "linear-gradient(135deg, #1e3a5f, #2d5a87)",
    createdAt: new Date(),
    updatedAt: new Date(),
    country,
  });
}

function renderScreen(
  overrides: Partial<React.ComponentProps<typeof TeamSelectionScreen>> = {},
) {
  const props = {
    teams: [createTeam("t1", "Team Alpha"), createTeam("t2", "Team Beta")],
    language: "ja" as const,
    showTeamCreator: false,
    showBulkTeamImport: false,
    onSelectTeam: vi.fn(),
    onDeleteTeam: vi.fn(),
    onNavigateHome: vi.fn(),
    onShowTeamCreator: vi.fn(),
    onCloseTeamCreator: vi.fn(),
    onShowBulkTeamImport: vi.fn(),
    onCloseBulkTeamImport: vi.fn(),
    onCreateTeam: vi.fn().mockResolvedValue(undefined),
    onBulkImport: vi.fn().mockResolvedValue(undefined),
    onEditTeam: vi.fn(),
    onCloseEditTeam: vi.fn(),
    onUpdateTeam: vi.fn().mockResolvedValue(undefined),
    t: mockT,
    ...overrides,
  };
  return { ...render(<TeamSelectionScreen {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("TeamSelectionScreen", () => {
  // ── ヘッダー ─────────────────────────────────────────────

  describe("ヘッダー", () => {
    it("タイトルが表示される", () => {
      renderScreen();
      expect(screen.getByText("tactics.title")).toBeInTheDocument();
    });

    it("サブタイトルが表示される", () => {
      renderScreen();
      expect(
        screen.getByText("tactics.simulator.subtitle"),
      ).toBeInTheDocument();
    });

    it("ホームボタンクリックで onNavigateHome が呼ばれる", () => {
      const { onNavigateHome } = renderScreen();

      const homeButton = screen.getByText(/tactics\.home/);
      fireEvent.click(homeButton);

      expect(onNavigateHome).toHaveBeenCalledTimes(1);
    });
  });

  // ── チーム一覧 ──────────────────────────────────────────

  describe("チーム一覧", () => {
    it("チーム名が表示される", () => {
      renderScreen();
      expect(screen.getByText("Team Alpha")).toBeInTheDocument();
      expect(screen.getByText("Team Beta")).toBeInTheDocument();
    });

    it("フォーメーションバッジが表示される", () => {
      renderScreen();
      const badges = screen.getAllByText("4-4-2");
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it("チームクリックで onSelectTeam が呼ばれる", () => {
      const { onSelectTeam } = renderScreen();

      const teamButton = screen.getByText("Team Alpha").closest("button");
      fireEvent.click(teamButton!);

      expect(onSelectTeam).toHaveBeenCalledWith("t1");
    });

    it("チーム名の昇順で表示される", () => {
      const teams = [
        createTeam("t2", "[Sample] Team 02"),
        createTeam("t1", "[Sample] Team 01"),
      ];
      renderScreen({ teams });

      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.map((heading) => heading.textContent)).toEqual([
        "[Sample] Team 01",
        "[Sample] Team 02",
      ]);
    });

    it("teams が undefined の場合、チーム一覧は空", () => {
      renderScreen({ teams: undefined });
      expect(screen.queryByText("Team Alpha")).not.toBeInTheDocument();
    });

    it("国旗が設定されたチームは国旗が表示される", () => {
      const teams = [createTeam("t1", "Japan FC", "JP")];
      renderScreen({ teams });

      expect(screen.getByText("🏴 JP")).toBeInTheDocument();
    });
  });

  // ── 削除 ────────────────────────────────────────────────

  describe("削除", () => {
    it("削除ボタンに適切な aria-label が設定される", () => {
      renderScreen();

      const deleteButtons = screen.getAllByTitle("team.deleteTeam");
      expect(deleteButtons.length).toBe(2);
    });

    it("削除ボタンクリックで onDeleteTeam が呼ばれる", () => {
      const { onDeleteTeam } = renderScreen();

      const deleteButton = screen.getAllByTitle("team.deleteTeam")[0];
      fireEvent.click(deleteButton);

      expect(onDeleteTeam).toHaveBeenCalledWith(
        "t1",
        "Team Alpha",
        expect.any(Object),
      );
    });
  });

  // ── アクションボタン ────────────────────────────────────

  describe("アクションボタン", () => {
    it("一括インポートボタンクリックで onShowBulkTeamImport が呼ばれる", () => {
      const { onShowBulkTeamImport } = renderScreen();

      const importButton = screen.getByText(/team\.bulkImport/);
      fireEvent.click(importButton);

      expect(onShowBulkTeamImport).toHaveBeenCalledTimes(1);
    });

    it("チーム作成ボタンクリックで onShowTeamCreator が呼ばれる", () => {
      const { onShowTeamCreator } = renderScreen();

      const createButton = screen.getByText(/tactics\.createTeam/);
      fireEvent.click(createButton);

      expect(onShowTeamCreator).toHaveBeenCalledTimes(1);
    });
  });

  // ── モーダル ────────────────────────────────────────────

  describe("モーダル", () => {
    it("showTeamCreator が true のとき TeamCreator が表示される", () => {
      renderScreen({ showTeamCreator: true });
      expect(screen.getByTestId("team-creator")).toBeInTheDocument();
    });

    it("showTeamCreator が false のとき TeamCreator が非表示", () => {
      renderScreen({ showTeamCreator: false });
      expect(screen.queryByTestId("team-creator")).not.toBeInTheDocument();
    });

    it("showBulkTeamImport が true のとき BulkTeamImportModal が表示される", () => {
      renderScreen({ showBulkTeamImport: true });
      expect(screen.getByTestId("bulk-import-modal")).toBeInTheDocument();
    });

    it("showBulkTeamImport が false のとき BulkTeamImportModal が非表示", () => {
      renderScreen({ showBulkTeamImport: false });
      expect(screen.queryByTestId("bulk-import-modal")).not.toBeInTheDocument();
    });
  });
});
