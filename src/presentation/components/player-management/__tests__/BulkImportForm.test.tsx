/**
 * @module BulkImportForm コンポーネント
 * @description 選手一括インポートフォームの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - テキストエリアへの選手データ入力とパースを検証
 * - インポート実行・キャンセル・バリデーションエラーを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkImportForm } from "../BulkImportForm";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockShowToast = vi.fn();
const mockConfirm = vi.fn();

vi.mock("@presentation/components/ui", () => ({
  useToast: () => ({ showToast: mockShowToast }),
  useConfirm: () => ({ confirm: mockConfirm }),
}));

vi.mock("@shared/errors", () => ({
  handleError: vi.fn(),
}));

vi.mock("@shared/constants/positionColors", () => ({
  getPositionBgDark: () => "bg-slate-600",
  getPositionBorderDark: () => "border-slate-600",
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createMockTeam() {
  return {
    id: "team-1",
    players: [
      { number: 1, name: "GK Player" },
      { number: 10, name: "MF Player" },
    ],
    addPlayer: vi.fn(),
  } as never;
}

function defaultProps(
  overrides: Partial<React.ComponentProps<typeof BulkImportForm>> = {},
): React.ComponentProps<typeof BulkImportForm> {
  return {
    team: createMockTeam(),
    onUpdateTeam: vi.fn(),
    onClose: vi.fn(),
    t: mockT,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("BulkImportForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── レンダリング ──────────────────────────────────────

  describe("レンダリング", () => {
    it("タイトルが表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(screen.getByText("player.import.title")).toBeInTheDocument();
    });

    it("CSVフォーマット説明が表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(screen.getByText("player.import.csvFormat")).toBeInTheDocument();
    });

    it("JSONフォーマット説明が表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(screen.getByText("player.import.jsonFormat")).toBeInTheDocument();
    });

    it("テキストエリアが表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(
        screen.getByLabelText("player.import.dataLabel"),
      ).toBeInTheDocument();
    });

    it("インポートボタンが表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(screen.getByText("player.import.button")).toBeInTheDocument();
    });

    it("キャンセルボタンが表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(screen.getByText("player.cancel")).toBeInTheDocument();
    });
  });

  // ── テキストエリア入力 ────────────────────────────────

  describe("テキストエリア入力", () => {
    it("テキストエリアに値を入力できる", () => {
      render(<BulkImportForm {...defaultProps()} />);

      const textarea = screen.getByLabelText(
        "player.import.dataLabel",
      ) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Test,1,gk" } });

      expect(textarea.value).toBe("Test,1,gk");
    });
  });

  // ── 空データでインポート ──────────────────────────────

  describe("空データでインポート", () => {
    it("空のデータでインポートするとエラートーストが表示される", async () => {
      render(<BulkImportForm {...defaultProps()} />);

      const importButton = screen.getByText("player.import.button");
      fireEvent.click(importButton);

      expect(mockShowToast).toHaveBeenCalledWith(
        "player.import.noData",
        "error",
      );
    });
  });

  // ── キャンセル ────────────────────────────────────────

  describe("キャンセル", () => {
    it("キャンセルボタンをクリックするとonCloseが呼ばれる", () => {
      const onClose = vi.fn();
      render(<BulkImportForm {...defaultProps({ onClose })} />);

      const cancelButton = screen.getByText("player.cancel");
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  // ── CSV形式の説明要素 ─────────────────────────────────

  describe("説明表示", () => {
    it("CSV説明のインストラクションが表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      // テキストがbullet point "• " と別ノードに分割されるため正規表現で検索
      expect(
        screen.getByText(/player\.import\.csvInstruction1/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/player\.import\.csvPositionNote/),
      ).toBeInTheDocument();
    });

    it("JSON説明のインストラクションが表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(
        screen.getByText(/player\.import\.jsonInstruction/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/player\.import\.jsonFields/),
      ).toBeInTheDocument();
    });

    it("CSVサンプルコードが表示される", () => {
      render(<BulkImportForm {...defaultProps()} />);

      expect(screen.getByText(/Player A,1,gk/)).toBeInTheDocument();
    });
  });

  // ── スモークテスト ────────────────────────────────────

  describe("スモークテスト", () => {
    it("クラッシュせずにレンダリングされる", () => {
      const { container } = render(<BulkImportForm {...defaultProps()} />);

      expect(container.firstChild).not.toBeNull();
    });
  });
});
