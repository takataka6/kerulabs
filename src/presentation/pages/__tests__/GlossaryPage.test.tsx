/**
 * @module GlossaryPage ページコンポーネント
 * @description 用語集ページの結合テスト
 *
 * テスト方針:
 * - react-router-dom・LanguageContext・Toast/Confirm・クエリフックをモック化
 * - 子コンポーネント（GlossaryDetail等）をスタブ化してページ単体の表示ロジックに集中
 * - 空の用語集一覧と用語集が存在する場合の2状態を検証
 * - 用語集名・説明・用語数バッジ・作成/インポートボタンの表示を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GlossaryPage } from "../GlossaryPage";
import { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects/GlossaryId";

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

const mockUseGlossaries = vi.fn();
const mockSaveGlossary = { mutateAsync: vi.fn() };
const mockDeleteGlossary = { mutateAsync: vi.fn() };

vi.mock("@presentation/hooks/queries", () => ({
  useGlossaries: () => mockUseGlossaries(),
  useSaveGlossary: () => mockSaveGlossary,
  useDeleteGlossary: () => mockDeleteGlossary,
}));

vi.mock("@presentation/hooks/useSeedSampleData", () => ({
  useSeedSampleData: () => ({ handleSeed: vi.fn(), isSeeding: false }),
}));

vi.mock("@presentation/components/glossary", () => ({
  GlossaryDetail: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="glossary-detail">
      <button onClick={onBack}>back</button>
    </div>
  ),
  GlossaryFormModal: ({
    onSave,
    onClose,
  }: {
    onSave: (name: string, desc: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="glossary-form-modal">
      <button onClick={() => onSave("New Glossary", "desc")}>save</button>
      <button onClick={onClose}>close</button>
    </div>
  ),
  GlossaryImportModal: ({
    onImport,
    onClose,
  }: {
    onImport: (json: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="glossary-import-modal">
      <button
        onClick={() => onImport('{"name":"Test","description":"d","terms":[]}')}
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
  glossaryImportSchema: {
    parse: (v: unknown) => v,
  },
}));

// zod mock - allow z.array().parse() to pass through
vi.mock("zod", () => ({
  z: {
    array: () => ({
      parse: (v: unknown) => (Array.isArray(v) ? v : [v]),
    }),
  },
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GlossaryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 空の用語集一覧 ─────────────────────────────────────

  describe("空の用語集一覧", () => {
    beforeEach(() => {
      mockUseGlossaries.mockReturnValue({ data: [] });
    });

    it("用語集が空のとき空メッセージが表示される", () => {
      render(<GlossaryPage />);

      expect(screen.getByText("glossary.empty")).toBeInTheDocument();
    });

    it("ページタイトルが表示される", () => {
      render(<GlossaryPage />);

      expect(screen.getByText("glossary")).toBeInTheDocument();
    });

    it("作成ボタンが表示される", () => {
      render(<GlossaryPage />);

      expect(screen.getByText(/glossary\.create/)).toBeInTheDocument();
    });

    it("インポートボタンが表示される", () => {
      render(<GlossaryPage />);

      expect(screen.getByText(/glossary\.import/)).toBeInTheDocument();
    });
  });

  // ── 用語集が存在する場合 ────────────────────────────────

  describe("用語集が存在する場合", () => {
    const glossaries = [
      new Glossary({
        id: new GlossaryId("g1"),
        name: "サッカー用語集",
        description: "サッカーの基本用語",
        terms: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Glossary({
        id: new GlossaryId("g2"),
        name: "戦術用語集",
        description: "戦術に関する用語",
        terms: [
          {
            id: "t1",
            term: "プレス",
            reading: "ぷれす",
            description: "前からの守備",
            keywords: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    beforeEach(() => {
      mockUseGlossaries.mockReturnValue({ data: glossaries });
    });

    it("用語集名が表示される", () => {
      render(<GlossaryPage />);

      expect(screen.getByText("サッカー用語集")).toBeInTheDocument();
      expect(screen.getByText("戦術用語集")).toBeInTheDocument();
    });

    it("用語集の説明が表示される", () => {
      render(<GlossaryPage />);

      expect(screen.getByText("サッカーの基本用語")).toBeInTheDocument();
      expect(screen.getByText("戦術に関する用語")).toBeInTheDocument();
    });

    it("用語数バッジが表示される", () => {
      render(<GlossaryPage />);

      expect(screen.getByText(/0 glossary\.termsCount/)).toBeInTheDocument();
      expect(screen.getByText(/1 glossary\.termsCount/)).toBeInTheDocument();
    });

    it("空メッセージが表示されない", () => {
      render(<GlossaryPage />);

      expect(screen.queryByText("glossary.empty")).not.toBeInTheDocument();
    });

    it("用語集をクリックすると詳細画面が表示される", async () => {
      render(<GlossaryPage />);

      fireEvent.click(screen.getByText("サッカー用語集"));

      expect(screen.getByTestId("glossary-detail")).toBeInTheDocument();
    });

    it("詳細画面から戻るボタンで一覧に戻る", async () => {
      render(<GlossaryPage />);

      fireEvent.click(screen.getByText("サッカー用語集"));
      expect(screen.getByTestId("glossary-detail")).toBeInTheDocument();

      fireEvent.click(screen.getByText("back"));
      expect(screen.queryByTestId("glossary-detail")).not.toBeInTheDocument();
    });

    it("削除ボタンをクリックすると確認ダイアログを表示して削除する", async () => {
      render(<GlossaryPage />);

      const deleteButtons = screen.getAllByTitle("glossary.delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockDeleteGlossary.mutateAsync).toHaveBeenCalledWith("g1");
      });
    });

    it("エクスポートボタンをクリックするとクリップボードにコピーする", async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });

      render(<GlossaryPage />);

      const exportButtons = screen.getAllByTitle("glossary.export");
      fireEvent.click(exportButtons[0]);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it("編集ボタンをクリックするとフォームモーダルが表示される", () => {
      render(<GlossaryPage />);

      const editButtons = screen.getAllByTitle("glossary.edit");
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId("glossary-form-modal")).toBeInTheDocument();
    });
  });

  // ── 作成フロー ────────────────────────────────────────────

  describe("作成フロー", () => {
    beforeEach(() => {
      mockUseGlossaries.mockReturnValue({ data: [] });
    });

    it("作成ボタンでモーダルが開き保存できる", async () => {
      render(<GlossaryPage />);

      fireEvent.click(screen.getByText(/glossary\.create/));
      expect(screen.getByTestId("glossary-form-modal")).toBeInTheDocument();

      fireEvent.click(screen.getByText("save"));

      await waitFor(() => {
        expect(mockSaveGlossary.mutateAsync).toHaveBeenCalled();
      });
    });

    it("インポートボタンでモーダルが開く", () => {
      render(<GlossaryPage />);

      fireEvent.click(screen.getByText(/glossary\.import/));
      expect(screen.getByTestId("glossary-import-modal")).toBeInTheDocument();
    });

    it("インポートモーダルからインポートを実行する", async () => {
      render(<GlossaryPage />);

      fireEvent.click(screen.getByText(/glossary\.import/));
      fireEvent.click(screen.getByText("import"));

      await waitFor(() => {
        expect(mockSaveGlossary.mutateAsync).toHaveBeenCalled();
      });
    });
  });

  // ── ローディング状態 ──────────────────────────────────────

  describe("ローディング状態", () => {
    it("isLoading 時にスケルトンを表示する", () => {
      mockUseGlossaries.mockReturnValue({ data: [], isLoading: true });
      render(<GlossaryPage />);

      expect(screen.getByTestId("card-list-skeleton")).toBeInTheDocument();
    });
  });

  // ── ナビゲーション ────────────────────────────────────────

  describe("ナビゲーション", () => {
    beforeEach(() => {
      mockUseGlossaries.mockReturnValue({ data: [] });
    });

    it("ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる", () => {
      render(<GlossaryPage />);

      fireEvent.click(screen.getByText(/tactics\.home/));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
