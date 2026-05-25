/**
 * @module ManualImportModal コンポーネント
 * @description チームマニュアルJSONインポートモーダルの単体テスト
 *
 * テスト方針:
 * - モーダルのレンダリングを検証
 * - JSONテキスト入力とバリデーションを検証
 * - インポート・キャンセル・ファイル選択処理を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManualImportModal } from "../ManualImportModal";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockOpenFilePicker = vi.fn();

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

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    fileService: {
      openFilePicker: mockOpenFilePicker,
    },
  }),
}));

vi.mock("@shared/logger", () => ({
  getLogger: () => ({
    warn: vi.fn(),
  }),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const t = (key: string) => key;

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("ManualImportModal", () => {
  let mockOnImport: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnImport = vi.fn();
    mockOnClose = vi.fn();
  });

  it("モーダルが正しくレンダリングされる", () => {
    render(
      <ManualImportModal onImport={mockOnImport} onClose={mockOnClose} t={t} />,
    );

    expect(screen.getByTestId("accessible-modal")).toBeInTheDocument();
    expect(screen.getByText("manual.import")).toBeInTheDocument();
    expect(screen.getByText("manual.importButton")).toBeInTheDocument();
  });

  it("JSONテキストエリアの入力", () => {
    render(
      <ManualImportModal onImport={mockOnImport} onClose={mockOnClose} t={t} />,
    );

    const textarea = screen.getByLabelText("JSON");
    fireEvent.change(textarea, { target: { value: '{"name": "test"}' } });
    expect(textarea).toHaveValue('{"name": "test"}');
  });

  it("空のJSONではインポートボタンが無効", () => {
    render(
      <ManualImportModal onImport={mockOnImport} onClose={mockOnClose} t={t} />,
    );

    const importButton = screen.getByText("manual.importButton");
    expect(importButton).toBeDisabled();

    fireEvent.click(importButton);
    expect(mockOnImport).not.toHaveBeenCalled();
  });

  it("JSONを入力してインポートできる", () => {
    render(
      <ManualImportModal onImport={mockOnImport} onClose={mockOnClose} t={t} />,
    );

    const textarea = screen.getByLabelText("JSON");
    const jsonStr = '{"name": "Manual", "sections": []}';
    fireEvent.change(textarea, { target: { value: jsonStr } });

    const importButton = screen.getByText("manual.importButton");
    expect(importButton).not.toBeDisabled();

    fireEvent.click(importButton);
    expect(mockOnImport).toHaveBeenCalledWith(jsonStr);
  });

  it("キャンセルで閉じる", () => {
    render(
      <ManualImportModal onImport={mockOnImport} onClose={mockOnClose} t={t} />,
    );

    const cancelButton = screen.getByText("manual.cancel");
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("ファイル選択ボタンからインポート", async () => {
    const fileContent = '{"name": "From File"}';
    mockOpenFilePicker.mockResolvedValue(fileContent);

    render(
      <ManualImportModal onImport={mockOnImport} onClose={mockOnClose} t={t} />,
    );

    const fileButton = screen.getByText("manual.importFromFile");
    fireEvent.click(fileButton);

    await waitFor(() => {
      expect(mockOpenFilePicker).toHaveBeenCalledWith(".json");
    });

    await waitFor(() => {
      const textarea = screen.getByLabelText("JSON");
      expect(textarea).toHaveValue(fileContent);
    });
  });
});
