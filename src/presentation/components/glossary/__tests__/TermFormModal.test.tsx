/**
 * @module TermFormModal コンポーネント
 * @description 用語追加/編集モーダルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 用語名・説明・キーワードのフォーム入力を検証
 * - 新規追加モードと編集モードの表示切替を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TermFormModal } from "../TermFormModal";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@presentation/components/ui", () => ({
  AccessibleModal: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof TermFormModal>> = {},
) {
  const defaultProps: React.ComponentProps<typeof TermFormModal> = {
    allKeywords: [],
    onSave: vi.fn(),
    onClose: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return { ...render(<TermFormModal {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("TermFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 基本レンダリング ──────────────────────────────────────

  describe("基本レンダリング（新規追加モード）", () => {
    it("モーダルを表示する", () => {
      renderComponent();
      expect(screen.getByTestId("accessible-modal")).toBeInTheDocument();
    });

    it("新規追加時のタイトルを表示する", () => {
      renderComponent();
      expect(screen.getByText("glossary.addTerm")).toBeInTheDocument();
    });

    it("用語名・読み仮名・キーワード・説明のフィールドを表示する", () => {
      renderComponent();
      expect(screen.getByText(/glossary.termLabel/)).toBeInTheDocument();
      expect(screen.getByText("glossary.readingLabel")).toBeInTheDocument();
      expect(screen.getByText("glossary.keywordLabel")).toBeInTheDocument();
      expect(screen.getByText("glossary.descriptionLabel")).toBeInTheDocument();
    });

    it("保存ボタンとキャンセルボタンを表示する", () => {
      renderComponent();
      expect(screen.getByText("glossary.save")).toBeInTheDocument();
      expect(screen.getByText("glossary.cancel")).toBeInTheDocument();
    });
  });

  // ── 編集モード ────────────────────────────────────────────

  describe("編集モード", () => {
    it("編集時のタイトルを表示する", () => {
      renderComponent({
        initial: {
          id: "term-1",
          term: "Test",
          reading: "テスト",
          description: "A test term",
          keywords: ["kw1"],
        },
      });
      expect(screen.getByText("glossary.editTerm")).toBeInTheDocument();
    });

    it("初期値がフィールドにセットされる", () => {
      renderComponent({
        initial: {
          id: "term-2",
          term: "Test Term",
          reading: "テスト",
          description: "Desc",
          keywords: [],
        },
      });
      expect(screen.getByDisplayValue("Test Term")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テスト")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
    });
  });

  // ── バリデーション ────────────────────────────────────────

  describe("バリデーション", () => {
    it("用語名が空のとき保存ボタンが無効になる", () => {
      renderComponent();
      expect(
        screen.getByText("glossary.save").closest("button"),
      ).toBeDisabled();
    });

    it("用語名が空のとき保存ボタンをクリックしても onSave が呼ばれない", () => {
      const onSave = vi.fn();
      renderComponent({ onSave });
      fireEvent.click(screen.getByText("glossary.save"));
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  // ── 保存 ──────────────────────────────────────────────────

  describe("保存", () => {
    it("有効な入力で保存ボタンをクリックすると onSave が呼ばれる", () => {
      const onSave = vi.fn();
      renderComponent({ onSave });
      const termInput = screen.getByPlaceholderText("glossary.termPlaceholder");
      fireEvent.change(termInput, { target: { value: "New Term" } });
      fireEvent.click(screen.getByText("glossary.save"));
      expect(onSave).toHaveBeenCalledWith({
        term: "New Term",
        reading: undefined,
        description: "",
        keywords: [],
      });
    });

    it("前後空白がトリムされ、空読みは undefined になる", () => {
      const onSave = vi.fn();
      renderComponent({ onSave });
      const termInput = screen.getByPlaceholderText("glossary.termPlaceholder");
      fireEvent.change(termInput, { target: { value: "  Term  " } });
      fireEvent.click(screen.getByText("glossary.save"));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ term: "Term", reading: undefined }),
      );
    });
  });

  // ── キーワード操作 ──────────────────────────────────────────

  describe("キーワード操作", () => {
    it("既存キーワードがチップとして表示される", () => {
      renderComponent({ allKeywords: ["attack", "defense"] });
      expect(screen.getByText("attack")).toBeInTheDocument();
      expect(screen.getByText("defense")).toBeInTheDocument();
    });

    it("キーワードチップをクリックして選択・解除できる", () => {
      const onSave = vi.fn();
      renderComponent({ allKeywords: ["attack"], onSave });

      // 選択
      fireEvent.click(screen.getByText("attack"));

      // 用語名を入力して保存
      const termInput = screen.getByPlaceholderText("glossary.termPlaceholder");
      fireEvent.change(termInput, { target: { value: "Term" } });
      fireEvent.click(screen.getByText("glossary.save"));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ keywords: ["attack"] }),
      );
    });

    it("新規キーワードを追加できる", () => {
      const onSave = vi.fn();
      renderComponent({ onSave });

      const kwInput = screen.getByLabelText("glossary.newKeywordPlaceholder");
      fireEvent.change(kwInput, { target: { value: "new-kw" } });
      fireEvent.click(screen.getByText("+"));

      // 用語名を入力して保存
      const termInput = screen.getByPlaceholderText("glossary.termPlaceholder");
      fireEvent.change(termInput, { target: { value: "Term" } });
      fireEvent.click(screen.getByText("glossary.save"));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ keywords: ["new-kw"] }),
      );
    });

    it("Enter キーで新規キーワードを追加できる", () => {
      const onSave = vi.fn();
      renderComponent({ onSave });

      const kwInput = screen.getByLabelText("glossary.newKeywordPlaceholder");
      fireEvent.change(kwInput, { target: { value: "enter-kw" } });
      fireEvent.keyDown(kwInput, { key: "Enter" });

      const termInput = screen.getByPlaceholderText("glossary.termPlaceholder");
      fireEvent.change(termInput, { target: { value: "Term" } });
      fireEvent.click(screen.getByText("glossary.save"));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ keywords: ["enter-kw"] }),
      );
    });

    it("空のキーワードは追加されない", () => {
      renderComponent();

      const kwInput = screen.getByLabelText("glossary.newKeywordPlaceholder");
      fireEvent.change(kwInput, { target: { value: "  " } });
      fireEvent.click(screen.getByText("+"));

      // + button should be disabled for empty input
      expect(screen.getByText("+").closest("button")).toBeDisabled();
    });

    it("重複キーワードは追加されない", () => {
      const onSave = vi.fn();
      renderComponent({ onSave });

      const kwInput = screen.getByLabelText("glossary.newKeywordPlaceholder");

      // Add "kw" twice
      fireEvent.change(kwInput, { target: { value: "kw" } });
      fireEvent.click(screen.getByText("+"));
      fireEvent.change(kwInput, { target: { value: "kw" } });
      fireEvent.click(screen.getByText("+"));

      const termInput = screen.getByPlaceholderText("glossary.termPlaceholder");
      fireEvent.change(termInput, { target: { value: "Term" } });
      fireEvent.click(screen.getByText("glossary.save"));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ keywords: ["kw"] }),
      );
    });
  });

  // ── キャンセル ────────────────────────────────────────────

  describe("キャンセル", () => {
    it("キャンセルボタンで onClose が呼ばれる", () => {
      const onClose = vi.fn();
      renderComponent({ onClose });
      fireEvent.click(screen.getByText("glossary.cancel"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
