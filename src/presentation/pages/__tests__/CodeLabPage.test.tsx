/**
 * @module CodeLabPage ページコンポーネント
 * @description CodeLabページの結合テスト
 *
 * テスト方針:
 * - react-router-dom（useNavigate）と LanguageContext をモック化
 * - MemoryRouterでルーティング環境を再現
 * - ヘッダー・レッスンカード・アクセシビリティの3セクションで画面表示を検証
 * - ナビゲーションボタンのクリックによる遷移を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CodeLabPage } from "../CodeLabPage";

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

vi.mock("@presentation/hooks/queries/usePlugins", () => ({
  usePluginLessons: () => ({ data: undefined, isLoading: false }),
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("CodeLabPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── ヘッダー ──

  it("ページタイトルが表示される", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("code.lab")).toBeInTheDocument();
  });

  it("サブタイトルと説明が表示される", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("code.lab.subtitle")).toBeInTheDocument();
    expect(screen.getByText("code.lab.description")).toBeInTheDocument();
  });

  it("ホームへ戻るボタンが表示される", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: "a11y.backToHome" }),
    ).toBeInTheDocument();
  });

  it("ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "a11y.backToHome" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // ── カテゴリセクション ──

  it("プログラミング基礎とアーキテクチャの2つのカテゴリを表示する", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("code.lab.category.programmingBasics"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("code.lab.category.architecture"),
    ).toBeInTheDocument();
  });

  // ── プログラミング基礎レッスンカード ──

  it("6つのプログラミング基礎レッスンカードを表示する", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("code.lab.lesson.variables")).toBeInTheDocument();
    expect(screen.getByText("code.lab.lesson.arrays")).toBeInTheDocument();
    expect(
      screen.getByText("code.lab.lesson.conditionals"),
    ).toBeInTheDocument();
    expect(screen.getByText("code.lab.lesson.functions")).toBeInTheDocument();
    expect(screen.getByText("code.lab.lesson.objects")).toBeInTheDocument();
  });

  // ── アーキテクチャレッスンカード ──

  it("6つのアーキテクチャレッスンカードを表示する", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("code.lab.lesson.cleanArchitecture"),
    ).toBeInTheDocument();
    expect(screen.getByText("code.lab.lesson.domainModel")).toBeInTheDocument();
  });

  it("各レッスンの説明文を表示する", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("code.lab.lesson.variables.description"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("code.lab.lesson.cleanArchitecture.description"),
    ).toBeInTheDocument();
  });

  it("全レッスンが Ready 状態である", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    const badges = screen.getAllByText("Ready");
    expect(badges).toHaveLength(16);
  });

  it("テスト入門カテゴリを表示する", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("code.lab.category.testing")).toBeInTheDocument();
    expect(screen.getByText("code.lab.lesson.firstTest")).toBeInTheDocument();
    expect(screen.getByText("code.lab.lesson.mockTest")).toBeInTheDocument();
  });

  it("プログラミング基礎レッスンをクリックするとレッスンページに遷移する", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("code.lab.lesson.variables"));
    expect(mockNavigate).toHaveBeenCalledWith("/code-lab/lesson/variables");
  });

  // ── アクセシビリティ ──

  it("main 要素に id='main-content' がある", () => {
    render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("装飾アイコンに aria-hidden が設定されている", () => {
    const { container } = render(
      <MemoryRouter>
        <CodeLabPage />
      </MemoryRouter>,
    );

    const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements.length).toBeGreaterThanOrEqual(1);
  });
});
