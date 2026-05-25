/**
 * @module GlossaryFormModal コンポーネント
 * @description 用語集作成/編集モーダルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - フォーム入力・バリデーション・送信の動作を検証
 * - 新規作成モードと編集モードの切替を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlossaryFormModal } from "../GlossaryFormModal";

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
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function renderModal(overrides = {}) {
  const props = {
    onSave: vi.fn(),
    onClose: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return render(<GlossaryFormModal {...props} />);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GlossaryFormModal", () => {
  it("新規作成モードで表示する", () => {
    renderModal();

    expect(screen.getByText("glossary.create")).toBeInTheDocument();
  });

  it("編集モードで表示する", () => {
    renderModal({ initialName: "Test", initialDescription: "Desc" });

    expect(screen.getByText("glossary.editGlossary")).toBeInTheDocument();
  });

  it("編集モードで初期値がフィールドにセットされる", () => {
    renderModal({ initialName: "Test", initialDescription: "Desc" });

    expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
  });

  it("名前入力フィールドを持つ", () => {
    renderModal();

    const nameInput = screen.getByLabelText("glossary.nameLabel");
    expect(nameInput).toBeInTheDocument();
  });

  it("説明入力フィールドを持つ", () => {
    renderModal();

    const descInput = screen.getByLabelText("glossary.descriptionLabel");
    expect(descInput).toBeInTheDocument();
  });

  it("名前が空の場合に保存ボタンが disabled", () => {
    renderModal();

    const saveBtn = screen.getByText("glossary.save");
    expect(saveBtn).toBeDisabled();
  });

  it("名前が空白のみの場合も保存ボタンが disabled", () => {
    renderModal();

    const nameInput = screen.getByLabelText("glossary.nameLabel");
    fireEvent.change(nameInput, { target: { value: "   " } });

    const saveBtn = screen.getByText("glossary.save");
    expect(saveBtn).toBeDisabled();
  });

  it("名前を入力すると保存ボタンが有効になる", () => {
    renderModal();

    const nameInput = screen.getByLabelText("glossary.nameLabel");
    fireEvent.change(nameInput, { target: { value: "New Glossary" } });

    const saveBtn = screen.getByText("glossary.save");
    expect(saveBtn).not.toBeDisabled();
  });

  it("保存ボタンをクリックすると onSave が呼ばれる", () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    const nameInput = screen.getByLabelText("glossary.nameLabel");
    fireEvent.change(nameInput, { target: { value: "My Glossary" } });

    const descInput = screen.getByLabelText("glossary.descriptionLabel");
    fireEvent.change(descInput, { target: { value: "Description" } });

    fireEvent.click(screen.getByText("glossary.save"));
    expect(onSave).toHaveBeenCalledWith("My Glossary", "Description");
  });

  it("保存時に名前と説明の前後空白がトリムされる", () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    const nameInput = screen.getByLabelText("glossary.nameLabel");
    fireEvent.change(nameInput, { target: { value: "  Glossary  " } });

    const descInput = screen.getByLabelText("glossary.descriptionLabel");
    fireEvent.change(descInput, { target: { value: "  Desc  " } });

    fireEvent.click(screen.getByText("glossary.save"));
    expect(onSave).toHaveBeenCalledWith("Glossary", "Desc");
  });

  it("名前が空のとき保存ボタンをクリックしても onSave が呼ばれない", () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.click(screen.getByText("glossary.save"));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("キャンセルボタンをクリックすると onClose が呼ばれる", () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByRole("button", { name: "a11y.closeModal" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
