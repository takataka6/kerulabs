/**
 * @module PlayerAddForm コンポーネント
 * @description 選手追加フォームの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 名前・背番号・ポジション等の入力フォームを検証
 * - バリデーション（背番号重複等）とフォーム送信を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerAddForm } from "../PlayerAddForm";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";
import { Color } from "@domain/value-objects/Color";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockShowToast = vi.fn();

vi.mock("@presentation/components/ui", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("../PlayerFormFields", () => ({
  PlayerFormFields: (props: {
    name: string;
    onNameChange: (v: string) => void;
    number: string;
    onNumberChange: (v: string) => void;
  }) => (
    <div data-testid="player-form-fields">
      <input
        data-testid="name-input"
        value={props.name}
        onChange={(e) => props.onNameChange(e.target.value)}
      />
      <input
        data-testid="number-input"
        value={props.number}
        onChange={(e) => props.onNumberChange(e.target.value)}
      />
    </div>
  ),
}));

vi.mock("@shared/errors", () => ({
  handleError: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);
const teamId = new TeamId("team-1");

function createTeam(players: Player[] = []): Team {
  const team = new Team({
    id: teamId,
    name: "Test Team",
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

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof PlayerAddForm>> = {},
) {
  const defaultProps: React.ComponentProps<typeof PlayerAddForm> = {
    team: createTeam(),
    onUpdateTeam: vi.fn(),
    onClose: vi.fn(),
    language: "ja",
    t: mockT,
    ...overrides,
  };
  return { ...render(<PlayerAddForm {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("PlayerAddForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 基本レンダリング ──────────────────────────────────────

  describe("基本レンダリング", () => {
    it("タイトルを表示する", () => {
      renderComponent();
      expect(screen.getByText("player.newPlayer")).toBeInTheDocument();
    });

    it("PlayerFormFields を表示する", () => {
      renderComponent();
      expect(screen.getByTestId("player-form-fields")).toBeInTheDocument();
    });

    it("追加ボタンとキャンセルボタンを表示する", () => {
      renderComponent();
      expect(screen.getByText("player.add")).toBeInTheDocument();
      expect(screen.getByText("player.cancel")).toBeInTheDocument();
    });
  });

  // ── バリデーション ────────────────────────────────────────

  describe("バリデーション", () => {
    it("名前と番号が空のとき追加ボタンでエラートーストが表示される", () => {
      renderComponent();
      fireEvent.click(screen.getByText("player.add"));
      expect(mockShowToast).toHaveBeenCalledWith(
        "player.nameNumberRequired",
        "error",
      );
    });

    it("番号が不正なとき（0）エラートーストが表示される", () => {
      renderComponent();
      fireEvent.change(screen.getByTestId("name-input"), {
        target: { value: "Test Player" },
      });
      fireEvent.change(screen.getByTestId("number-input"), {
        target: { value: "0" },
      });
      fireEvent.click(screen.getByText("player.add"));
      expect(mockShowToast).toHaveBeenCalledWith("player.numberRange", "error");
    });

    it("番号が不正なとき（100）エラートーストが表示される", () => {
      renderComponent();
      fireEvent.change(screen.getByTestId("name-input"), {
        target: { value: "Test Player" },
      });
      fireEvent.change(screen.getByTestId("number-input"), {
        target: { value: "100" },
      });
      fireEvent.click(screen.getByText("player.add"));
      expect(mockShowToast).toHaveBeenCalledWith("player.numberRange", "error");
    });

    it("既存プレイヤーと番号が重複するときエラートーストが表示される", () => {
      const existingPlayer = Player.create({
        name: "Existing",
        number: 7,
        teamId,
        position: "mf",
      });
      const team = createTeam([existingPlayer]);
      renderComponent({ team });
      fireEvent.change(screen.getByTestId("name-input"), {
        target: { value: "New Player" },
      });
      fireEvent.change(screen.getByTestId("number-input"), {
        target: { value: "7" },
      });
      fireEvent.click(screen.getByText("player.add"));
      expect(mockShowToast).toHaveBeenCalledWith("player.numberInUse", "error");
    });
  });

  // ── 正常追加 ──────────────────────────────────────────────

  describe("正常追加", () => {
    it("有効な入力で追加ボタンを押すと onUpdateTeam と onClose が呼ばれる", () => {
      const onUpdateTeam = vi.fn();
      const onClose = vi.fn();
      renderComponent({ onUpdateTeam, onClose });
      fireEvent.change(screen.getByTestId("name-input"), {
        target: { value: "New Player" },
      });
      fireEvent.change(screen.getByTestId("number-input"), {
        target: { value: "11" },
      });
      fireEvent.click(screen.getByText("player.add"));
      expect(onUpdateTeam).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── キャンセル ────────────────────────────────────────────

  describe("キャンセル", () => {
    it("キャンセルボタンで onClose が呼ばれる", () => {
      const onClose = vi.fn();
      renderComponent({ onClose });
      fireEvent.click(screen.getByText("player.cancel"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
