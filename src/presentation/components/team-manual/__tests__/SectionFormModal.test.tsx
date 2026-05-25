/**
 * @module SectionFormModal コンポーネント
 * @description マニュアルセクション作成・編集モーダルの単体テスト
 *
 * テスト方針:
 * - 新規作成/編集モードの切り替えを検証
 * - フォーム入力とバリデーションを検証
 * - 保存・キャンセル処理を検証
 * - 全カテゴリの表示を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionFormModal } from "../SectionFormModal";
import type { ManualSection } from "@domain/entities/TeamManual";

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
  MermaidFlowchart: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid-flowchart">{chart}</div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const t = (key: string) => key;

const createInitialSection = (
  overrides?: Partial<ManualSection>,
): ManualSection => ({
  id: "section-1",
  title: "テストセクション",
  category: "defense",
  formations: ["4-4-2", "4-3-3"],
  items: [],
  ...overrides,
});

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SectionFormModal", () => {
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave = vi.fn();
    mockOnClose = vi.fn();
  });

  it("新規作成モードでレンダリングされる（initialなし → タイトルが manual.addSection）", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    expect(screen.getByText("manual.addSection")).toBeInTheDocument();
  });

  it("編集モードでレンダリングされる（initialあり → タイトルが manual.editSection）", () => {
    const initial = createInitialSection();

    render(
      <SectionFormModal
        initial={initial}
        onSave={mockOnSave}
        onClose={mockOnClose}
        t={t}
      />,
    );

    expect(screen.getByText("manual.editSection")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストセクション")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4-4-2, 4-3-3")).toBeInTheDocument();
  });

  it("タイトルの入力", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const titleInput = screen.getByLabelText("manual.sectionTitle");
    fireEvent.change(titleInput, { target: { value: "新しいセクション" } });

    expect(titleInput).toHaveValue("新しいセクション");
  });

  it("カテゴリの選択変更", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const categorySelect = screen.getByLabelText("manual.category");
    fireEvent.change(categorySelect, { target: { value: "defense" } });

    expect(categorySelect).toHaveValue("defense");
  });

  it("フォーメーション入力（カンマ区切り）", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const formationsInput = screen.getByLabelText("manual.formations");
    fireEvent.change(formationsInput, {
      target: { value: "4-4-2, 3-5-2, 4-3-3" },
    });

    expect(formationsInput).toHaveValue("4-4-2, 3-5-2, 4-3-3");
  });

  it("空のタイトルでは保存ボタンが無効", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const saveButton = screen.getByText("manual.save");
    expect(saveButton).toBeDisabled();
  });

  it("空のタイトルで保存クリックしてもonSaveが呼ばれない", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const saveButton = screen.getByText("manual.save");
    fireEvent.click(saveButton);

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("正常に保存: onSaveが正しいデータで呼ばれる（formations がカンマ区切りで分割される）", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const titleInput = screen.getByLabelText("manual.sectionTitle");
    fireEvent.change(titleInput, { target: { value: "攻撃パターン" } });

    const categorySelect = screen.getByLabelText("manual.category");
    fireEvent.change(categorySelect, { target: { value: "offense" } });

    const formationsInput = screen.getByLabelText("manual.formations");
    fireEvent.change(formationsInput, {
      target: { value: "4-4-2, 3-5-2" },
    });

    const saveButton = screen.getByText("manual.save");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: "攻撃パターン",
      category: "offense",
      formations: ["4-4-2", "3-5-2"],
    });
  });

  it("キャンセルでonCloseが呼ばれる", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const cancelButton = screen.getByText("manual.cancel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("全カテゴリがselect optionとして表示される", () => {
    render(
      <SectionFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />,
    );

    const expectedCategories = [
      "offense",
      "defense",
      "positive_transition",
      "negative_transition",
      "set_piece",
      "position_task",
      "free_note",
    ];

    const categorySelect = screen.getByLabelText("manual.category");
    const options = categorySelect.querySelectorAll("option");

    expect(options).toHaveLength(expectedCategories.length);

    expectedCategories.forEach((cat) => {
      expect(screen.getByText(`manual.category.${cat}`)).toBeInTheDocument();
    });
  });
});
