/**
 * @module Toast コンポーネント
 * @description トースト通知の単体テスト
 *
 * テスト方針:
 * - ToastProvider / useToast のコンテキスト動作を検証
 * - トーストの表示・自動消去タイマーを検証
 * - success / error / info 等のバリアント表示を検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../Toast";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants", () => ({
  Z_INDEX: { TOAST: 9999 },
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

/** useToast を呼び出すテスト用コンポーネント */
function TestConsumer() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("Success!", "success")}>
        show-success
      </button>
      <button onClick={() => showToast("Error!", "error")}>show-error</button>
      <button onClick={() => showToast("Info!")}>show-info</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // requestAnimationFrame stub
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── ToastProvider ────────────────────────────────────────

  describe("ToastProvider", () => {
    it("children を正常にレンダーする", () => {
      render(
        <ToastProvider>
          <div data-testid="child">Hello</div>
        </ToastProvider>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("aria-live='polite' のコンテナが存在する", () => {
      render(
        <ToastProvider>
          <div>child</div>
        </ToastProvider>,
      );

      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toBeInTheDocument();
    });
  });

  // ── useToast ─────────────────────────────────────────────

  describe("useToast", () => {
    it("Provider 外で使用するとエラーを投げる", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow("useToast must be used within <ToastProvider>");

      spy.mockRestore();
    });
  });

  // ── トースト表示 ─────────────────────────────────────────

  describe("トースト表示", () => {
    it("success トーストを表示する", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-success").click();
      });

      expect(screen.getByText("Success!")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("error トーストを表示する", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-error").click();
      });

      expect(screen.getByText("Error!")).toBeInTheDocument();
    });

    it("デフォルト type は info", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-info").click();
      });

      expect(screen.getByText("Info!")).toBeInTheDocument();
    });

    it("success アイコン '✓' が表示される", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-success").click();
      });

      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("error アイコン '✕' が表示される", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-error").click();
      });

      expect(screen.getByText("✕")).toBeInTheDocument();
    });

    it("info アイコン 'ℹ' が表示される", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-info").click();
      });

      expect(screen.getByText("ℹ")).toBeInTheDocument();
    });

    it("複数のトーストを同時に表示できる", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-success").click();
        screen.getByText("show-error").click();
      });

      expect(screen.getByText("Success!")).toBeInTheDocument();
      expect(screen.getByText("Error!")).toBeInTheDocument();
    });
  });

  // ── 自動消去 ─────────────────────────────────────────────

  describe("自動消去", () => {
    it("3500ms + 300ms 後にトーストが消える", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-success").click();
      });

      expect(screen.getByText("Success!")).toBeInTheDocument();

      // 3500ms 後にフェードアウト開始
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // 300ms のフェードアウトアニメーション後に削除
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByText("Success!")).not.toBeInTheDocument();
    });

    it("3500ms 未満ではトーストが残っている", () => {
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      act(() => {
        screen.getByText("show-success").click();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByText("Success!")).toBeInTheDocument();
    });
  });
});
