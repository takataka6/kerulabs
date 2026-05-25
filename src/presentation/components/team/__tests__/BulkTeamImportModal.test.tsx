/**
 * @module BulkTeamImportModal コンポーネント
 * @description チーム一括インポートモーダルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - JSONファイル読込・バリデーション・インポート実行を検証
 * - エラーメッセージの表示を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BulkTeamImportModal } from "../BulkTeamImportModal";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    tDynamic: (key: string) => key,
  }),
}));

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
    overlayClassName?: string;
  }) => (isOpen ? <div data-testid="accessible-modal">{children}</div> : null),
}));

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

function renderModal(
  overrides: Partial<React.ComponentProps<typeof BulkTeamImportModal>> = {},
) {
  const props = {
    onImport: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
    ...overrides,
  };
  return { ...render(<BulkTeamImportModal {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("BulkTeamImportModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 基本レンダリング ──

  describe("基本レンダリング", () => {
    it("モーダルがレンダリングされる", () => {
      renderModal();

      expect(screen.getByTestId("accessible-modal")).toBeInTheDocument();
    });

    it("タイトルが表示される", () => {
      renderModal();

      expect(screen.getByText(/team\.import\.title/)).toBeInTheDocument();
    });

    it("閉じるボタンが表示される", () => {
      renderModal();

      expect(screen.getByLabelText("a11y.closeModal")).toBeInTheDocument();
    });

    it("説明セクションが表示される", () => {
      renderModal();

      expect(
        screen.getByText(/team\.import\.instructions/),
      ).toBeInTheDocument();
    });

    it("JSONデータ入力ラベルが表示される", () => {
      renderModal();

      expect(screen.getByText("team.import.jsonData")).toBeInTheDocument();
    });

    it("テキストエリアが表示される", () => {
      renderModal();

      expect(
        screen.getByPlaceholderText("team.import.placeholder"),
      ).toBeInTheDocument();
    });

    it("キャンセルボタンが表示される", () => {
      renderModal();

      expect(screen.getByText("player.cancel")).toBeInTheDocument();
    });

    it("インポートボタンが表示される", () => {
      renderModal();

      expect(screen.getByText("player.import.button")).toBeInTheDocument();
    });

    it("フィールド説明が表示される", () => {
      renderModal();

      // strong要素の中にフィールド名が表示される
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("players")).toBeInTheDocument();
    });

    it("サンプル表示トグルが存在する", () => {
      renderModal();

      expect(screen.getByText("team.import.showExample")).toBeInTheDocument();
    });
  });

  // ── ボタン状態 ──

  describe("ボタン状態", () => {
    it("テキストエリアが空の場合、インポートボタンが無効化される", () => {
      renderModal();

      const importButton = screen.getByText("player.import.button");
      expect(importButton).toBeDisabled();
    });

    it("テキストエリアに入力がある場合、インポートボタンが有効になる", () => {
      renderModal();

      const textarea = screen.getByPlaceholderText("team.import.placeholder");
      fireEvent.change(textarea, { target: { value: "[]" } });

      const importButton = screen.getByText("player.import.button");
      expect(importButton).not.toBeDisabled();
    });
  });

  // ── 閉じる操作 ──

  describe("閉じる操作", () => {
    it("閉じるボタンをクリックするとonCloseが呼ばれる", () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByLabelText("a11y.closeModal"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("キャンセルボタンをクリックするとonCloseが呼ばれる", () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByText("player.cancel"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── インポート処理 ──

  describe("インポート処理", () => {
    it("無効なJSONで空白のみの入力はボタンが無効化される", () => {
      renderModal();

      const textarea = screen.getByPlaceholderText("team.import.placeholder");
      fireEvent.change(textarea, { target: { value: "   " } });

      const importButton = screen.getByText("player.import.button");
      expect(importButton).toBeDisabled();
    });

    it("無効なJSONでインポートするとエラーが表示される", () => {
      renderModal();

      const textarea = screen.getByPlaceholderText("team.import.placeholder");
      fireEvent.change(textarea, { target: { value: "invalid json" } });
      fireEvent.click(screen.getByText("player.import.button"));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("team.import.invalidJson")).toBeInTheDocument();
    });

    it("有効なJSONでインポートするとonImportが呼ばれる", async () => {
      const { onImport } = renderModal();

      const jsonData = JSON.stringify([{ name: "Team" }]);
      const textarea = screen.getByPlaceholderText("team.import.placeholder");
      fireEvent.change(textarea, { target: { value: jsonData } });
      fireEvent.click(screen.getByText("player.import.button"));

      await waitFor(() => {
        expect(onImport).toHaveBeenCalledWith(jsonData);
      });
    });

    it("インポート成功後にonCloseが呼ばれる", async () => {
      const { onClose } = renderModal();

      const jsonData = JSON.stringify([{ name: "Team" }]);
      const textarea = screen.getByPlaceholderText("team.import.placeholder");
      fireEvent.change(textarea, { target: { value: jsonData } });
      fireEvent.click(screen.getByText("player.import.button"));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it("インポート失敗時にエラーが表示される", async () => {
      const onImport = vi.fn().mockRejectedValue(new Error("Import failed"));
      renderModal({ onImport });

      const jsonData = JSON.stringify([{ name: "Team" }]);
      const textarea = screen.getByPlaceholderText("team.import.placeholder");
      fireEvent.change(textarea, { target: { value: jsonData } });
      fireEvent.click(screen.getByText("player.import.button"));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("テキストエリア入力時にエラーがクリアされる", () => {
      renderModal();

      // まず無効なJSONでエラーを発生させる
      const textarea = screen.getByPlaceholderText("team.import.placeholder");
      fireEvent.change(textarea, { target: { value: "invalid json" } });
      fireEvent.click(screen.getByText("player.import.button"));
      expect(screen.getByRole("alert")).toBeInTheDocument();

      // テキストを入力するとエラーがクリアされる
      fireEvent.change(textarea, { target: { value: "[]" } });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
