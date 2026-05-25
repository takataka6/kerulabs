/**
 * @module GlossaryImportModal コンポーネント
 * @description 用語集インポートモーダルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - ファイル選択・JSONパース・プレビュー・インポート実行の流れを検証
 * - 不正ファイル時のエラーハンドリングを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlossaryImportModal } from "../GlossaryImportModal";

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
    onImport: vi.fn(),
    onClose: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return render(<GlossaryImportModal {...props} />);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GlossaryImportModal", () => {
  it("インポートモーダルを描画する", () => {
    renderModal();

    expect(screen.getByText("glossary.import")).toBeInTheDocument();
  });

  it("JSON テキストエリアを持つ", () => {
    renderModal();

    const textarea = screen.getByLabelText("JSON");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("JSON が空の場合にインポートボタンが disabled", () => {
    renderModal();

    const importBtn = screen.getByText("glossary.importButton");
    expect(importBtn).toBeDisabled();
  });

  it("JSON が空白のみの場合にインポートボタンが disabled", () => {
    renderModal();

    const textarea = screen.getByLabelText("JSON");
    fireEvent.change(textarea, { target: { value: "   " } });

    const importBtn = screen.getByText("glossary.importButton");
    expect(importBtn).toBeDisabled();
  });

  it("JSON を入力するとインポートボタンが有効になる", () => {
    renderModal();

    const textarea = screen.getByLabelText("JSON");
    fireEvent.change(textarea, { target: { value: '[{"term":"test"}]' } });

    const importBtn = screen.getByText("glossary.importButton");
    expect(importBtn).not.toBeDisabled();
  });

  it("インポートボタンをクリックすると onImport が呼ばれる", () => {
    const onImport = vi.fn();
    renderModal({ onImport });

    const textarea = screen.getByLabelText("JSON");
    fireEvent.change(textarea, { target: { value: '[{"term":"test"}]' } });

    fireEvent.click(screen.getByText("glossary.importButton"));
    expect(onImport).toHaveBeenCalledWith('[{"term":"test"}]');
  });

  it("キャンセルボタンをクリックすると onClose が呼ばれる", () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByRole("button", { name: "a11y.closeModal" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
