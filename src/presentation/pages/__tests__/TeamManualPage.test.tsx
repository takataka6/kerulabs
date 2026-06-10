/**
 * @module TeamManualPage ページコンポーネント
 * @description チームマニュアルページの結合テスト
 *
 * テスト方針:
 * - react-router-dom・LanguageContext・Toast/Confirm・クエリフックをモック化
 * - 子コンポーネントをスタブ化してページ単体の表示ロジックに集中
 * - 空のマニュアル一覧とマニュアルが存在する場合の2状態を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TeamManualPage } from "../TeamManualPage";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects/TeamManualId";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    tDynamic: (key: string) => key,
  }),
}));

const mockShowToast = vi.fn();
const mockConfirm = vi.fn().mockResolvedValue(true);

vi.mock("@presentation/components/ui", () => ({
  useToast: () => ({ showToast: mockShowToast }),
  useConfirm: () => ({
    confirm: mockConfirm,
    alert: vi.fn(),
  }),
  CardListSkeleton: () => <div data-testid="card-list-skeleton" />,
}));

const mockUseTeamManuals = vi.fn();
const mockSaveManual = { mutateAsync: vi.fn() };
const mockDeleteManual = { mutateAsync: vi.fn() };

vi.mock("@presentation/hooks/queries", () => ({
  useTeamManuals: () => mockUseTeamManuals(),
  useSaveTeamManual: () => mockSaveManual,
  useDeleteTeamManual: () => mockDeleteManual,
}));

vi.mock("@presentation/hooks/useSeedSampleData", () => ({
  useSeedSampleData: () => ({ handleSeed: vi.fn(), isSeeding: false }),
}));

vi.mock("@presentation/components/team-manual", () => ({
  ManualDetail: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="manual-detail">
      <button onClick={onBack}>back</button>
    </div>
  ),
  ManualFormModal: ({
    onSave,
    onClose,
  }: {
    onSave: (name: string, desc: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="manual-form-modal">
      <button onClick={() => onSave("New Manual", "desc")}>save</button>
      <button onClick={onClose}>close</button>
    </div>
  ),
  ManualImportModal: ({
    onImport,
    onClose,
  }: {
    onImport: (json: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="manual-import-modal">
      <button
        onClick={() =>
          onImport('{"name":"Test","description":"d","sections":[]}')
        }
      >
        import
      </button>
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

vi.mock("@shared/errors", () => ({
  handleError: vi.fn(),
}));

vi.mock("@application/schemas", () => ({
  teamManualImportSchema: {
    parse: (v: unknown) => v,
  },
}));

vi.mock("zod", () => ({
  z: {
    array: () => ({
      parse: (v: unknown) => (Array.isArray(v) ? v : [v]),
    }),
  },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const now = new Date("2025-01-01T00:00:00Z");

function createTestManual(
  id: string,
  name: string,
  sectionCount = 0,
): TeamManual {
  const sections = Array.from({ length: sectionCount }, (_, i) => ({
    id: `s-${i}`,
    title: `Section ${i}`,
    category: "offense" as const,
    formations: [],
    items: [],
  }));
  return new TeamManual({
    id: new TeamManualId(id),
    name,
    description: `${name}の説明`,
    sections,
    createdAt: now,
    updatedAt: now,
  });
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TeamManualPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("空のマニュアル一覧", () => {
    beforeEach(() => {
      mockUseTeamManuals.mockReturnValue({ data: [] });
    });

    it("マニュアルが空のとき空メッセージが表示される", () => {
      render(<TeamManualPage />);

      expect(screen.getByText("manual.empty")).toBeInTheDocument();
    });

    it("ページタイトルが表示される", () => {
      render(<TeamManualPage />);

      expect(screen.getByText("manual")).toBeInTheDocument();
    });

    it("作成ボタンが表示される", () => {
      render(<TeamManualPage />);

      expect(screen.getByText(/manual\.create/)).toBeInTheDocument();
    });

    it("インポートボタンが表示される", () => {
      render(<TeamManualPage />);

      expect(screen.getByText(/manual\.import/)).toBeInTheDocument();
    });

    it("ホームへ戻るボタンが表示される", () => {
      render(<TeamManualPage />);

      expect(screen.getByText(/tactics.home/)).toBeInTheDocument();
    });
  });

  describe("マニュアルが存在する場合", () => {
    const manuals = [
      createTestManual("m-1", "攻撃マニュアル", 3),
      createTestManual("m-2", "守備マニュアル", 1),
    ];

    beforeEach(() => {
      mockUseTeamManuals.mockReturnValue({ data: manuals });
    });

    it("マニュアル名が表示される", () => {
      render(<TeamManualPage />);

      expect(screen.getByText("攻撃マニュアル")).toBeInTheDocument();
      expect(screen.getByText("守備マニュアル")).toBeInTheDocument();
    });

    it("マニュアルの説明が表示される", () => {
      render(<TeamManualPage />);

      expect(screen.getByText("攻撃マニュアルの説明")).toBeInTheDocument();
      expect(screen.getByText("守備マニュアルの説明")).toBeInTheDocument();
    });

    it("セクション数バッジが表示される", () => {
      render(<TeamManualPage />);

      const badges = screen.getAllByText(/manual.sectionsCount/);
      expect(badges.length).toBe(2);
    });

    it("空メッセージは表示されない", () => {
      render(<TeamManualPage />);

      expect(screen.queryByText("manual.empty")).not.toBeInTheDocument();
    });

    it("マニュアルをクリックすると詳細画面が表示される", () => {
      render(<TeamManualPage />);

      fireEvent.click(screen.getByText("攻撃マニュアル"));
      expect(screen.getByTestId("manual-detail")).toBeInTheDocument();
    });

    it("詳細画面から戻るボタンで一覧に戻る", () => {
      render(<TeamManualPage />);

      fireEvent.click(screen.getByText("攻撃マニュアル"));
      expect(screen.getByTestId("manual-detail")).toBeInTheDocument();

      fireEvent.click(screen.getByText("back"));
      expect(screen.queryByTestId("manual-detail")).not.toBeInTheDocument();
    });

    it("削除ボタンをクリックすると確認ダイアログを表示して削除する", async () => {
      render(<TeamManualPage />);

      const deleteButtons = screen.getAllByTitle("manual.delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockDeleteManual.mutateAsync).toHaveBeenCalledWith("m-1");
      });
    });

    it("エクスポートボタンをクリックするとクリップボードにコピーする", async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });

      render(<TeamManualPage />);

      const exportButtons = screen.getAllByTitle("manual.export");
      fireEvent.click(exportButtons[0]);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it("編集ボタンをクリックするとフォームモーダルが表示される", () => {
      render(<TeamManualPage />);

      const editButtons = screen.getAllByTitle("manual.edit");
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId("manual-form-modal")).toBeInTheDocument();
    });
  });

  // ── 作成フロー ────────────────────────────────────────────

  describe("作成フロー", () => {
    beforeEach(() => {
      mockUseTeamManuals.mockReturnValue({ data: [] });
    });

    it("作成ボタンでモーダルが開き保存できる", async () => {
      render(<TeamManualPage />);

      fireEvent.click(screen.getByText(/manual\.create/));
      expect(screen.getByTestId("manual-form-modal")).toBeInTheDocument();

      fireEvent.click(screen.getByText("save"));

      await waitFor(() => {
        expect(mockSaveManual.mutateAsync).toHaveBeenCalled();
      });
    });

    it("インポートボタンでモーダルが開く", () => {
      render(<TeamManualPage />);

      fireEvent.click(screen.getByText(/manual\.import/));
      expect(screen.getByTestId("manual-import-modal")).toBeInTheDocument();
    });

    it("インポートモーダルからインポートを実行する", async () => {
      render(<TeamManualPage />);

      fireEvent.click(screen.getByText(/manual\.import/));
      fireEvent.click(screen.getByText("import"));

      await waitFor(() => {
        expect(mockSaveManual.mutateAsync).toHaveBeenCalled();
      });
    });
  });

  // ── ローディング状態 ──────────────────────────────────────

  describe("ローディング状態", () => {
    it("isLoading 時にスケルトンを表示する", () => {
      mockUseTeamManuals.mockReturnValue({ data: [], isLoading: true });
      render(<TeamManualPage />);

      expect(screen.getByTestId("card-list-skeleton")).toBeInTheDocument();
    });
  });

  // ── ナビゲーション ────────────────────────────────────────

  describe("ナビゲーション", () => {
    beforeEach(() => {
      mockUseTeamManuals.mockReturnValue({ data: [] });
    });

    it("ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる", () => {
      render(<TeamManualPage />);

      fireEvent.click(screen.getByText(/tactics\.home/));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
