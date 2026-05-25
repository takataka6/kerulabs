/**
 * @module ManagerDisplay コンポーネント
 * @description 監督名表示コンポーネントの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 監督名の表示・編集モード切替を検証
 * - 監督名未設定時のフォールバック表示を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ManagerDisplay } from "../ManagerDisplay";
import { Team } from "@domain/entities/Team";
import { TeamId } from "@domain/value-objects";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createTeam(manager?: string): Team {
  return new Team({
    id: new TeamId("team-1"),
    name: "Test Team",
    subtitle: "Subtitle",
    colors: {
      gk: { hex: "#FFFF00" } as never,
      main: { hex: "#1E90FF" } as never,
    },
    availableFormations: ["4-4-2"],
    players: [],
    flagType: "rect",
    headerGradient: "linear-gradient(135deg, #1e3a5f, #2d5a87)",
    createdAt: new Date(),
    updatedAt: new Date(),
    defaultFormation: "4-4-2",
    manager,
  });
}

function renderManagerDisplay(
  overrides: Partial<React.ComponentProps<typeof ManagerDisplay>> = {},
) {
  const props = {
    selectedTeam: createTeam("Pep Guardiola"),
    teamColor: "#1E90FF",
    editingManager: false,
    managerInput: "",
    managerCard: "none" as const,
    captureMode: false,
    onStartEditing: vi.fn(),
    onManagerInputChange: vi.fn(),
    onSaveManager: vi.fn(),
    onCancelEditing: vi.fn(),
    onCycleManagerCard: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return { ...render(<ManagerDisplay {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("ManagerDisplay", () => {
  // ── 表示条件 ─────────────────────────────────────────────

  describe("表示条件", () => {
    it("captureMode の場合は非表示", () => {
      const { container } = renderManagerDisplay({ captureMode: true });
      expect(container.firstChild).toBeNull();
    });

    it("通常モードで監督名が表示される", () => {
      renderManagerDisplay();
      expect(screen.getByText("Pep Guardiola")).toBeInTheDocument();
    });
  });

  // ── 監督名表示 ──────────────────────────────────────────

  describe("監督名表示", () => {
    it("監督ラベルが表示される", () => {
      renderManagerDisplay();
      expect(screen.getByText("tactics.manager")).toBeInTheDocument();
    });

    it("監督名未設定の場合にプレースホルダーが表示される", () => {
      renderManagerDisplay({ selectedTeam: createTeam(undefined) });
      expect(screen.getByText("tactics.manager.notSet")).toBeInTheDocument();
    });

    it("編集ボタンクリックで onStartEditing が呼ばれる", () => {
      const { onStartEditing } = renderManagerDisplay();

      const editButton = screen.getByText("Pep Guardiola").closest("button");
      fireEvent.click(editButton!);

      expect(onStartEditing).toHaveBeenCalledTimes(1);
    });
  });

  // ── 編集モード ──────────────────────────────────────────

  describe("編集モード", () => {
    it("編集中にテキスト入力が表示される", () => {
      renderManagerDisplay({
        editingManager: true,
        managerInput: "Ancelotti",
      });

      const input = screen.getByDisplayValue("Ancelotti");
      expect(input).toBeInTheDocument();
    });

    it("入力値変更で onManagerInputChange が呼ばれる", () => {
      const { onManagerInputChange } = renderManagerDisplay({
        editingManager: true,
        managerInput: "",
      });

      const input = screen.getByPlaceholderText("tactics.manager");
      fireEvent.change(input, { target: { value: "Klopp" } });

      expect(onManagerInputChange).toHaveBeenCalledWith("Klopp");
    });

    it("Enter キーで onSaveManager が呼ばれる", () => {
      const { onSaveManager } = renderManagerDisplay({
        editingManager: true,
        managerInput: "New Manager",
      });

      const input = screen.getByDisplayValue("New Manager");
      fireEvent.keyDown(input, { key: "Enter" });

      expect(onSaveManager).toHaveBeenCalledWith("New Manager");
    });

    it("Escape キーで onCancelEditing が呼ばれる", () => {
      const { onCancelEditing } = renderManagerDisplay({
        editingManager: true,
        managerInput: "test",
      });

      const input = screen.getByDisplayValue("test");
      fireEvent.keyDown(input, { key: "Escape" });

      expect(onCancelEditing).toHaveBeenCalledTimes(1);
    });

    it("blur で onSaveManager が呼ばれる", () => {
      const { onSaveManager } = renderManagerDisplay({
        editingManager: true,
        managerInput: "Zidane",
      });

      const input = screen.getByDisplayValue("Zidane");
      fireEvent.blur(input);

      expect(onSaveManager).toHaveBeenCalledWith("Zidane");
    });
  });

  // ── カード表示 ──────────────────────────────────────────

  describe("カード表示", () => {
    it("none 状態で '−' が表示される", () => {
      renderManagerDisplay({ managerCard: "none" });
      expect(screen.getByText("−")).toBeInTheDocument();
    });

    it("カードボタンクリックで onCycleManagerCard が呼ばれる", () => {
      const { onCycleManagerCard } = renderManagerDisplay();

      const cardButton = screen.getByTitle("tactics.card");
      fireEvent.click(cardButton);

      expect(onCycleManagerCard).toHaveBeenCalledTimes(1);
    });

    it("カードボタンに適切な aria-label が設定される", () => {
      renderManagerDisplay({ managerCard: "none" });
      const button = screen.getByTitle("tactics.card");
      expect(button).toHaveAttribute("aria-label");
    });
  });

  // ── 折りたたみ ───────────────────────────────────────────

  describe("折りたたみ", () => {
    it("展開/折りたたみボタンが表示される", () => {
      renderManagerDisplay();

      const toggleButton = screen.getByLabelText("tactics.hideControls");
      expect(toggleButton).toBeInTheDocument();
    });

    it("折りたたみボタンクリックでコンテンツが非表示になる", () => {
      renderManagerDisplay();

      const toggleButton = screen.getByLabelText("tactics.hideControls");
      fireEvent.click(toggleButton);

      expect(screen.queryByText("Pep Guardiola")).not.toBeInTheDocument();
    });

    it("再クリックでコンテンツが再表示される", () => {
      renderManagerDisplay();

      const toggleButton = screen.getByLabelText("tactics.hideControls");
      fireEvent.click(toggleButton);
      expect(screen.queryByText("Pep Guardiola")).not.toBeInTheDocument();

      const showButton = screen.getByLabelText("tactics.showControls");
      fireEvent.click(showButton);
      expect(screen.getByText("Pep Guardiola")).toBeInTheDocument();
    });
  });
});
