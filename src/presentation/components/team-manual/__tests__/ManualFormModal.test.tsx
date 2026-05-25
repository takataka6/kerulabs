/**
 * @module ManualFormModal コンポーネント
 * @description チームマニュアル作成・編集モーダルの単体テスト
 *
 * テスト方針:
 * - 新規作成/編集モードの切り替えを検証
 * - フォーム入力とバリデーションを検証
 * - 保存・キャンセル処理を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ManualFormModal } from "../ManualFormModal";

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
    onClose: () => void;
    ariaLabelledBy?: string;
    className?: string;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const t = (key: string) => key;

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("ManualFormModal", () => {
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave = vi.fn();
    mockOnClose = vi.fn();
  });

  it("新規作成モードでレンダリングされる (initialNameなし → タイトルが manual.create)", () => {
    render(<ManualFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    expect(screen.getByText("manual.create")).toBeInTheDocument();
    expect(screen.queryByText("manual.editManual")).not.toBeInTheDocument();
  });

  it("編集モードでレンダリングされる (initialNameあり → タイトルが manual.editManual)", () => {
    render(
      <ManualFormModal
        initialName="Existing Manual"
        initialDescription="Existing Description"
        onSave={mockOnSave}
        onClose={mockOnClose}
        t={t}
      />,
    );

    expect(screen.getByText("manual.editManual")).toBeInTheDocument();
    expect(screen.queryByText("manual.create")).not.toBeInTheDocument();
  });

  it("名前の入力", () => {
    render(<ManualFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const nameInput = screen.getByLabelText("manual.nameLabel");
    fireEvent.change(nameInput, { target: { value: "New Manual" } });
    expect(nameInput).toHaveValue("New Manual");
  });

  it("説明の入力", () => {
    render(<ManualFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const descInput = screen.getByLabelText("manual.descriptionLabel");
    fireEvent.change(descInput, { target: { value: "A description" } });
    expect(descInput).toHaveValue("A description");
  });

  it("空の名前では保存ボタンが無効", () => {
    render(<ManualFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const saveButton = screen.getByText("manual.save");
    expect(saveButton).toBeDisabled();

    // Clicking disabled button should not call onSave
    fireEvent.click(saveButton);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("正常に保存できる", () => {
    render(<ManualFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const nameInput = screen.getByLabelText("manual.nameLabel");
    const descInput = screen.getByLabelText("manual.descriptionLabel");

    fireEvent.change(nameInput, { target: { value: "My Manual" } });
    fireEvent.change(descInput, { target: { value: "My Description" } });

    const saveButton = screen.getByText("manual.save");
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);
    expect(mockOnSave).toHaveBeenCalledWith("My Manual", "My Description");
  });

  it("キャンセルで閉じる", () => {
    render(<ManualFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const cancelButton = screen.getByText("manual.cancel");
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
