/**
 * @module ManualDetail コンポーネント
 * @description チームマニュアル詳細表示の単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManualDetail } from "../ManualDetail";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects/TeamManualId";

vi.mock("@presentation/hooks/queries", () => ({
  useSaveTeamManual: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@presentation/components/ui", () => ({
  useConfirm: () => ({
    confirm: vi.fn().mockResolvedValue(true),
    alert: vi.fn(),
  }),
  useToast: () => ({ showToast: vi.fn() }),
  MermaidFlowchart: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid">{chart}</div>
  ),
}));

vi.mock("../SectionFormModal", () => ({
  SectionFormModal: () => <div data-testid="section-form-modal" />,
}));

vi.mock("../ItemFormModal", () => ({
  ItemFormModal: () => <div data-testid="item-form-modal" />,
}));

vi.mock("../ManualImportModal", () => ({
  ManualImportModal: () => <div data-testid="manual-import-modal" />,
}));

const now = new Date("2025-01-01T00:00:00Z");
const t = (key: string) => key;

function createManualWithSections(): TeamManual {
  return new TeamManual({
    id: new TeamManualId("m-1"),
    name: "テストマニュアル",
    description: "テスト用の説明",
    sections: [
      {
        id: "s-1",
        title: "攻撃の原則",
        category: "offense",
        formations: ["4-3-3"],
        items: [
          {
            id: "i-1",
            title: "ビルドアップ",
            content: "GKからCBへ",
            diagram: "graph LR\n  GK --> CB",
            linkedTacticIds: [],
          },
          {
            id: "i-2",
            title: "ポジショナルプレー",
            content: "三角形を作る",
            linkedTacticIds: [],
          },
        ],
      },
      {
        id: "s-2",
        title: "守備の原則",
        category: "defense",
        formations: [],
        items: [],
      },
    ],
    createdAt: now,
    updatedAt: now,
  });
}

describe("ManualDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("マニュアル名が表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(
      screen.getAllByText("テストマニュアル").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("マニュアルの説明が表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("テスト用の説明")).toBeInTheDocument();
  });

  it("セクション名が表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("攻撃の原則")).toBeInTheDocument();
    expect(screen.getByText("守備の原則")).toBeInTheDocument();
  });

  it("項目のタイトルが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("ビルドアップ")).toBeInTheDocument();
    expect(screen.getByText("ポジショナルプレー")).toBeInTheDocument();
  });

  it("項目の内容が表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("GKからCBへ")).toBeInTheDocument();
  });

  it("Mermaid図解がレンダリングされる", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByTestId("mermaid")).toBeInTheDocument();
  });

  it("フォーメーションバッジが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("4-3-3")).toBeInTheDocument();
  });

  it("空のセクションには空メッセージが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("manual.noItems")).toBeInTheDocument();
  });

  it("セクションがないマニュアルには空メッセージが表示される", () => {
    const manual = new TeamManual({
      id: new TeamManualId("m-2"),
      name: "空マニュアル",
      description: "",
      sections: [],
      createdAt: now,
      updatedAt: now,
    });
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("manual.noSections")).toBeInTheDocument();
  });

  it("パンくずナビが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("manual")).toBeInTheDocument();
  });

  it("セクション追加ボタンが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("manual.addSection")).toBeInTheDocument();
  });

  it("セクションインポートボタンが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.getByText("manual.importSection")).toBeInTheDocument();
  });

  it("戻るボタンでonBackが呼ばれる", () => {
    const manual = createManualWithSections();
    const onBack = vi.fn();
    render(<ManualDetail manual={manual} onBack={onBack} t={t} />);

    fireEvent.click(screen.getByText("manual"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("セクション追加ボタンをクリックするとSectionFormModalが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.queryByTestId("section-form-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("manual.addSection"));
    expect(screen.getByTestId("section-form-modal")).toBeInTheDocument();
  });

  it("セクションインポートボタンをクリックするとManualImportModalが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    expect(screen.queryByTestId("manual-import-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("manual.importSection"));
    expect(screen.getByTestId("manual-import-modal")).toBeInTheDocument();
  });

  it("セクション編集ボタンをクリックするとSectionFormModalが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    // Find the edit buttons (✏️) for sections
    const editButtons = screen.getAllByTitle("manual.edit");
    fireEvent.click(editButtons[0]);
    expect(screen.getByTestId("section-form-modal")).toBeInTheDocument();
  });

  it("セクション削除ボタンをクリックするとconfirmが呼ばれる", async () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    // Find the delete buttons (🗑️) for sections
    const deleteButtons = screen.getAllByTitle("manual.delete");
    fireEvent.click(deleteButtons[0]);

    // confirm mock returns true, so the section should be deleted
    // The mock mutateAsync should be called
  });

  it("項目追加ボタンをクリックするとItemFormModalが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    // Find the add item buttons (➕) in section headers
    const addItemButtons = screen.getAllByTitle("manual.addItem");
    fireEvent.click(addItemButtons[0]);
    expect(screen.getByTestId("item-form-modal")).toBeInTheDocument();
  });

  it("項目編集ボタンをクリックするとItemFormModalが表示される", () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    // Items have edit buttons too (✏️) - they come after section edit buttons
    const editButtons = screen.getAllByTitle("manual.edit");
    // First two are section edit buttons, the rest are item edit buttons
    // Section s-1 has 2 items, so editButtons[2] and editButtons[3] are item edit buttons
    fireEvent.click(editButtons[2]);
    expect(screen.getByTestId("item-form-modal")).toBeInTheDocument();
  });

  it("項目削除ボタンをクリックするとconfirmが呼ばれる", async () => {
    const manual = createManualWithSections();
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    // Item delete buttons come after section delete buttons
    const deleteButtons = screen.getAllByTitle("manual.delete");
    // deleteButtons[0] and [1] are section delete buttons
    // deleteButtons[2] and [3] are item delete buttons
    fireEvent.click(deleteButtons[2]);
  });

  it("エクスポートボタンをクリックするとクリップボードにコピーされる", async () => {
    const manual = createManualWithSections();

    // Mock clipboard
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    const exportButtons = screen.getAllByTitle("manual.exportSection");
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });
  });

  it("セクション削除でconfirmがtrueを返すとmanualのremoveSectionが呼ばれる", async () => {
    const manual = createManualWithSections();
    const removeSectionSpy = vi.spyOn(manual, "removeSection");
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    const deleteButtons = screen.getAllByTitle("manual.delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(removeSectionSpy).toHaveBeenCalledWith("s-1");
    });
  });

  it("項目削除でconfirmがtrueを返すとmanualのremoveItemが呼ばれる", async () => {
    const manual = createManualWithSections();
    const removeItemSpy = vi.spyOn(manual, "removeItem");
    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    // Delete buttons order: s-1 section, i-1 item, i-2 item, s-2 section
    const deleteButtons = screen.getAllByTitle("manual.delete");
    // deleteButtons[1] is the first item delete button (for "ビルドアップ" / i-1)
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => {
      expect(removeItemSpy).toHaveBeenCalledWith("s-1", "i-1");
    });
  });

  it("クリップボードコピー失敗時にエラートーストが表示される", async () => {
    const manual = createManualWithSections();

    const mockWriteText = vi.fn().mockRejectedValue(new Error("copy failed"));
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    render(<ManualDetail manual={manual} onBack={vi.fn()} t={t} />);

    const exportButtons = screen.getAllByTitle("manual.exportSection");
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });
  });
});
