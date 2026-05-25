/**
 * @module ConfirmDialog コンポーネント
 * @description 確認ダイアログの単体テスト
 *
 * テスト方針:
 * - ConfirmProvider / useConfirm のコンテキスト動作を検証
 * - confirm / alert メソッドの呼び出しとPromise解決を検証
 * - OK / キャンセルボタンのクリック動作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ConfirmProvider, useConfirm } from "../ConfirmDialog";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
    (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    },
  );
});

/** useConfirm() を呼ぶテスト用コンポーネント */
function TestComponent() {
  const { confirm, alert } = useConfirm();

  return (
    <div>
      <button
        data-testid="trigger-confirm"
        onClick={async () => {
          const result = await confirm({
            title: "確認タイトル",
            message: "確認メッセージ",
            confirmLabel: "はい",
            cancelLabel: "いいえ",
          });
          // Store result for test assertions
          document.body.setAttribute("data-result", String(result));
        }}
      >
        Confirm
      </button>
      <button
        data-testid="trigger-confirm-red"
        onClick={() => {
          confirm({
            message: "削除しますか？",
            variant: "red",
          });
        }}
      >
        Confirm Red
      </button>
      <button
        data-testid="trigger-alert"
        onClick={async () => {
          await alert({
            title: "お知らせ",
            message: "アラートメッセージ",
            confirmLabel: "了解",
          });
          document.body.setAttribute("data-alert-done", "true");
        }}
      >
        Alert
      </button>
      <button
        data-testid="trigger-confirm-defaults"
        onClick={() => {
          confirm({ message: "デフォルトラベル" });
        }}
      >
        Default
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ConfirmProvider>
      <TestComponent />
    </ConfirmProvider>,
  );
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("ConfirmDialog", () => {
  // ── useConfirm outside provider ──────────────────────────

  describe("useConfirm without provider", () => {
    it("ConfirmProvider の外で useConfirm を使うとエラーが発生する", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      function BadComponent() {
        useConfirm();
        return null;
      }
      expect(() => render(<BadComponent />)).toThrow(
        "useConfirm must be used within a ConfirmProvider",
      );
      spy.mockRestore();
    });
  });

  // ── confirm ダイアログ ──────────────────────────────────────

  describe("confirm ダイアログ", () => {
    it("トリガーでダイアログが表示される", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-confirm"));
      });
      expect(screen.getByText("確認タイトル")).toBeInTheDocument();
      expect(screen.getByText("確認メッセージ")).toBeInTheDocument();
      expect(screen.getByText("はい")).toBeInTheDocument();
      expect(screen.getByText("いいえ")).toBeInTheDocument();
    });

    it("確認ボタンで true が返る", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-confirm"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("はい"));
      });
      expect(document.body.getAttribute("data-result")).toBe("true");
    });

    it("キャンセルボタンで false が返る", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-confirm"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("いいえ"));
      });
      expect(document.body.getAttribute("data-result")).toBe("false");
    });
  });

  // ── red variant ───────────────────────────────────────────

  describe("red variant", () => {
    it("variant=red で赤い確認ボタンが表示される", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-confirm-red"));
      });
      expect(screen.getByText("削除しますか？")).toBeInTheDocument();
      // OK button should have red class
      const okBtn = screen.getByText("OK");
      expect(okBtn.className).toContain("bg-red-600");
    });
  });

  // ── alert ダイアログ ─────────────────────────────────────────

  describe("alert ダイアログ", () => {
    it("alert でキャンセルボタンが表示されない", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-alert"));
      });
      expect(screen.getByText("お知らせ")).toBeInTheDocument();
      expect(screen.getByText("アラートメッセージ")).toBeInTheDocument();
      expect(screen.getByText("了解")).toBeInTheDocument();
      // Cancel button should NOT be present
      expect(screen.queryByText("キャンセル")).not.toBeInTheDocument();
    });

    it("OK ボタンで alert が解決される", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-alert"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("了解"));
      });
      expect(document.body.getAttribute("data-alert-done")).toBe("true");
    });
  });

  // ── デフォルトラベル ─────────────────────────────────────────

  describe("デフォルトラベル", () => {
    it("confirmLabel 未指定時にデフォルト OK が表示される", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-confirm-defaults"));
      });
      expect(screen.getByText("OK")).toBeInTheDocument();
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });
  });

  // ── タイトルなし ──────────────────────────────────────────

  describe("タイトルなし", () => {
    it("title 未指定時にタイトル要素が表示されない", async () => {
      renderWithProvider();
      await act(async () => {
        fireEvent.click(screen.getByTestId("trigger-confirm-defaults"));
      });
      // No h2 with title text
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });
});
