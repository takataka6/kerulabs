/**
 * @module ErrorBoundary コンポーネント
 * @description エラーバウンダリの単体テスト
 *
 * テスト方針:
 * - console.error をvi.mockで抑制
 * - 子コンポーネントエラー時のフォールバックUIを検証
 * - エラーリカバリー（リトライ）の動作を検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockHandleError = vi.fn();
vi.mock("@shared/errors/handleError", () => ({
  handleError: (...args: unknown[]) => mockHandleError(...args),
}));

const mockPreferencesGet = vi.fn().mockReturnValue("ja");
vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    preferencesService: { get: mockPreferencesGet },
  }),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** レンダー時に必ずエラーを投げるコンポーネント */
function ThrowingChild({
  message = "Test error",
}: {
  message?: string;
}): never {
  throw new Error(message);
}

/** 正常にレンダーされるコンポーネント */
function GoodChild() {
  return <div data-testid="good-child">OK</div>;
}

/**
 * 初回はエラー、再レンダー時は正常になるコンポーネント。
 * retry テスト用。
 */
let shouldThrow = true;
function ConditionalThrowChild() {
  if (shouldThrow) {
    throw new Error("conditional");
  }
  return <div data-testid="recovered">Recovered</div>;
}

/** React の console.error を抑制するヘルパー */
function suppressReactErrorLogs() {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  return spy;
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shouldThrow = true;
    mockPreferencesGet.mockReturnValue("ja");
  });

  // ── 正常系 ──────────────────────────────────────────

  describe("正常レンダリング", () => {
    it("子コンポーネントがエラーなしで正常にレンダーされる", () => {
      render(
        <ErrorBoundary>
          <GoodChild />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("good-child")).toBeInTheDocument();
      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    it("複数の子コンポーネントを正常にレンダーする", () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">A</div>
          <div data-testid="child-2">B</div>
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });
  });

  // ── エラーキャッチ ────────────────────────────────────

  describe("エラーキャッチ", () => {
    it("子コンポーネントのエラーをキャッチしてフォールバック UI を表示する", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("問題が発生しました")).toBeInTheDocument();
      spy.mockRestore();
    });

    it("componentDidCatch で handleError を呼び出す", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild message="catch test" />
        </ErrorBoundary>,
      );

      expect(mockHandleError).toHaveBeenCalledTimes(1);
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "ui",
        "ErrorBoundary caught",
        expect.objectContaining({
          meta: expect.objectContaining({
            componentStack: expect.any(String),
          }),
        }),
      );
      spy.mockRestore();
    });

    it("エラー発生後、子コンポーネントは表示されない", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild />
          <GoodChild />
        </ErrorBoundary>,
      );

      expect(screen.queryByTestId("good-child")).not.toBeInTheDocument();
      spy.mockRestore();
    });
  });

  // ── フォールバック UI ─────────────────────────────────

  describe("フォールバック UI", () => {
    it("日本語のエラーメッセージが表示される", () => {
      const spy = suppressReactErrorLogs();
      mockPreferencesGet.mockReturnValue("ja");
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      expect(screen.getByText("問題が発生しました")).toBeInTheDocument();
      expect(
        screen.getByText(
          "このページの表示中にエラーが発生しました。再試行するか、ホームに戻ってください。",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("再試行")).toBeInTheDocument();
      expect(screen.getByText("ホームに戻る")).toBeInTheDocument();
      spy.mockRestore();
    });

    it("英語のエラーメッセージが表示される", () => {
      const spy = suppressReactErrorLogs();
      mockPreferencesGet.mockReturnValue("en");
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
      expect(screen.getByText("Go Home")).toBeInTheDocument();
      spy.mockRestore();
    });

    it("role='alert' がアクセシビリティのために設定される", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      spy.mockRestore();
    });

    it("ホームリンクが '/' を指している", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      const homeLink = screen.getByText("ホームに戻る");
      expect(homeLink.closest("a")).toHaveAttribute("href", "/");
      spy.mockRestore();
    });
  });

  // ── inline / full-screen モード ───────────────────────

  describe("表示モード", () => {
    it("デフォルト（full-screen）モードで min-h-screen クラスが適用される", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      const alertEl = screen.getByRole("alert");
      expect(alertEl.className).toContain("min-h-screen");
      expect(alertEl.className).not.toContain("flex-1");
      spy.mockRestore();
    });

    it("inline モードで flex-1 クラスが適用される", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary inline>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      const alertEl = screen.getByRole("alert");
      expect(alertEl.className).toContain("flex-1");
      expect(alertEl.className).not.toContain("min-h-screen");
      spy.mockRestore();
    });
  });

  // ── カスタムフォールバック ──────────────────────────────

  describe("カスタムフォールバック", () => {
    it("fallback prop が指定された場合、カスタム UI を表示する", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary
          fallback={<div data-testid="custom-fallback">Custom Error</div>}
        >
          <ThrowingChild />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(screen.getByText("Custom Error")).toBeInTheDocument();
      // デフォルトの ErrorFallback は表示されない
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      spy.mockRestore();
    });
  });

  // ── リトライ ──────────────────────────────────────────

  describe("リトライ", () => {
    it("再試行ボタンをクリックすると子コンポーネントの再レンダーを試みる", () => {
      const spy = suppressReactErrorLogs();

      render(
        <ErrorBoundary>
          <ConditionalThrowChild />
        </ErrorBoundary>,
      );

      // エラー状態であることを確認
      expect(screen.getByRole("alert")).toBeInTheDocument();

      // 次のレンダーではエラーを投げない
      shouldThrow = false;

      // リトライクリック
      fireEvent.click(screen.getByText("再試行"));

      // 復帰できたことを確認
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByTestId("recovered")).toBeInTheDocument();
      spy.mockRestore();
    });

    it("リトライ後も再度エラーが起きるとフォールバック UI に戻る", () => {
      const spy = suppressReactErrorLogs();

      render(
        <ErrorBoundary>
          <ConditionalThrowChild />
        </ErrorBoundary>,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();

      // shouldThrow を true のままリトライ → 再びエラー
      fireEvent.click(screen.getByText("再試行"));

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("問題が発生しました")).toBeInTheDocument();
      spy.mockRestore();
    });
  });

  // ── 開発モード: エラー詳細 ────────────────────────────

  describe("エラー詳細（開発モード）", () => {
    it("開発モードではエラー詳細トグルボタンが表示される", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/エラー詳細/)).toBeInTheDocument();
      spy.mockRestore();
    });

    it("エラー詳細ボタンをクリックすると詳細が展開される", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild message="detail test error" />
        </ErrorBoundary>,
      );

      // 初期状態では詳細は非表示
      expect(screen.queryByText(/detail test error/)).not.toBeInTheDocument();

      // 詳細を展開
      fireEvent.click(screen.getByText(/エラー詳細/));

      // エラーメッセージが表示される（<p> と <pre> の両方に出る）
      const matches = screen.getAllByText(/detail test error/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
      spy.mockRestore();
    });

    it("エラー詳細にエラー名とメッセージが含まれる", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild message="specific error msg" />
        </ErrorBoundary>,
      );

      fireEvent.click(screen.getByText(/エラー詳細/));

      // <p class="text-red-400"> にエラー名:メッセージが表示される
      const matches = screen.getAllByText(/Error: specific error msg/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
      // 最初のマッチは <p> タグ（エラー名表示）
      expect(matches[0].tagName).toBe("P");
      spy.mockRestore();
    });

    it("エラー詳細を再度クリックすると閉じる", () => {
      const spy = suppressReactErrorLogs();
      render(
        <ErrorBoundary>
          <ThrowingChild message="toggle test" />
        </ErrorBoundary>,
      );

      const detailsButton = screen.getByText(/エラー詳細/);

      // 開く
      fireEvent.click(detailsButton);
      const matches = screen.getAllByText(/toggle test/);
      expect(matches.length).toBeGreaterThanOrEqual(1);

      // 閉じる
      fireEvent.click(screen.getByText(/エラー詳細/));
      expect(screen.queryByText(/toggle test/)).not.toBeInTheDocument();

      spy.mockRestore();
    });
  });

  // ── getLanguage フォールバック ──────────────────────────

  describe("getLanguage フォールバック", () => {
    it("ServiceContainer が未初期化の場合、日本語にフォールバックする", () => {
      const spy = suppressReactErrorLogs();

      // getContainer() がエラーを投げるケースをシミュレート
      mockPreferencesGet.mockImplementation(() => {
        throw new Error("Container not configured");
      });

      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      // フォールバックとして日本語が使われる
      expect(screen.getByText("問題が発生しました")).toBeInTheDocument();
      spy.mockRestore();
    });
  });

  // ── 本番モード ────────────────────────────────────────

  describe("本番モード", () => {
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("本番モードではエラー詳細トグルが表示されない", () => {
      const spy = suppressReactErrorLogs();
      process.env.NODE_ENV = "production";

      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      expect(screen.queryByText(/エラー詳細/)).not.toBeInTheDocument();
      // 基本的なフォールバック UI は表示される
      expect(screen.getByText("問題が発生しました")).toBeInTheDocument();
      expect(screen.getByText("再試行")).toBeInTheDocument();
      spy.mockRestore();
    });
  });
});
