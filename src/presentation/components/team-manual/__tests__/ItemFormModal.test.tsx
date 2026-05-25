/**
 * @module ItemFormModal コンポーネント
 * @description マニュアル項目作成・編集モーダルの単体テスト
 *
 * テスト方針:
 * - 新規作成/編集モードの切り替えを検証
 * - フォーム入力とバリデーションを検証
 * - 保存・キャンセル処理を検証
 * - Mermaidプレビュー表示を検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ItemFormModal } from "../ItemFormModal";
import type { ManualItem } from "@domain/entities/TeamManual";

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

const createInitialItem = (overrides?: Partial<ManualItem>): ManualItem => ({
  id: "item-1",
  title: "テスト項目",
  content: "テストコンテンツ",
  diagram: "graph TD; A-->B;",
  linkedTacticIds: ["tactic-1", "tactic-2"],
  ...overrides,
});

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("ItemFormModal", () => {
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockOnSave = vi.fn();
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("新規作成モードでレンダリングされる（initialなし → タイトルが manual.addItem）", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    expect(screen.getByText("manual.addItem")).toBeInTheDocument();
  });

  it("編集モードでレンダリングされる（initialあり → タイトルが manual.editItem、初期値が入力される）", () => {
    const initial = createInitialItem();

    render(
      <ItemFormModal
        initial={initial}
        onSave={mockOnSave}
        onClose={mockOnClose}
        t={t}
      />,
    );

    expect(screen.getByText("manual.editItem")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テスト項目")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストコンテンツ")).toBeInTheDocument();
    expect(screen.getByDisplayValue("graph TD; A-->B;")).toBeInTheDocument();
  });

  it("タイトルの入力", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const titleInput = screen.getByLabelText("manual.itemTitle");
    fireEvent.change(titleInput, { target: { value: "新しい項目" } });

    expect(titleInput).toHaveValue("新しい項目");
  });

  it("コンテンツの入力", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const contentInput = screen.getByLabelText("manual.itemContent");
    fireEvent.change(contentInput, { target: { value: "詳細な説明" } });

    expect(contentInput).toHaveValue("詳細な説明");
  });

  it("ダイアグラムの入力", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const diagramLabel = `manual.diagram (manual.diagramOptional)`;
    const diagramInput = screen.getByLabelText(diagramLabel);
    fireEvent.change(diagramInput, {
      target: { value: "graph LR; A-->B;" },
    });

    expect(diagramInput).toHaveValue("graph LR; A-->B;");
  });

  it("空のタイトルでは保存ボタンが無効", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const saveButton = screen.getByText("manual.save");
    expect(saveButton).toBeDisabled();
  });

  it("正常に保存: タイトル・コンテンツ・ダイアグラムが正しく渡される", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const titleInput = screen.getByLabelText("manual.itemTitle");
    fireEvent.change(titleInput, { target: { value: "攻撃パターン" } });

    const contentInput = screen.getByLabelText("manual.itemContent");
    fireEvent.change(contentInput, { target: { value: "詳細説明" } });

    const diagramLabel = `manual.diagram (manual.diagramOptional)`;
    const diagramInput = screen.getByLabelText(diagramLabel);
    fireEvent.change(diagramInput, {
      target: { value: "graph TD; A-->B;" },
    });

    const saveButton = screen.getByText("manual.save");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: "攻撃パターン",
      content: "詳細説明",
      diagram: "graph TD; A-->B;",
      linkedTacticIds: [],
    });
  });

  it("ダイアグラム空文字列の場合はundefinedが渡される", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const titleInput = screen.getByLabelText("manual.itemTitle");
    fireEvent.change(titleInput, { target: { value: "テスト" } });

    const contentInput = screen.getByLabelText("manual.itemContent");
    fireEvent.change(contentInput, { target: { value: "内容" } });

    const saveButton = screen.getByText("manual.save");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: "テスト",
      content: "内容",
      diagram: undefined,
      linkedTacticIds: [],
    });
  });

  it("編集モードでlinkedTacticIdsが保持される", () => {
    const initial = createInitialItem({
      linkedTacticIds: ["tactic-a", "tactic-b"],
    });

    render(
      <ItemFormModal
        initial={initial}
        onSave={mockOnSave}
        onClose={mockOnClose}
        t={t}
      />,
    );

    const saveButton = screen.getByText("manual.save");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedTacticIds: ["tactic-a", "tactic-b"],
      }),
    );
  });

  it("キャンセルでonCloseが呼ばれる", () => {
    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const cancelButton = screen.getByText("manual.cancel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("MermaidFlowchartプレビューが表示される（ダイアグラム入力時）", async () => {
    vi.useRealTimers();

    render(<ItemFormModal onSave={mockOnSave} onClose={mockOnClose} t={t} />);

    const diagramLabel = `manual.diagram (manual.diagramOptional)`;
    const diagramInput = screen.getByLabelText(diagramLabel);
    fireEvent.change(diagramInput, {
      target: { value: "graph TD; A-->B;" },
    });

    // デバウンス待ち（500ms）
    await waitFor(
      () => {
        const preview = screen.getByTestId("mermaid-flowchart");
        expect(preview).toBeInTheDocument();
        expect(preview).toHaveTextContent("graph TD; A-->B;");
      },
      { timeout: 2000 },
    );
  });
});
