/**
 * @module PageHeader コンポーネント
 * @description ページ共通ヘッダーの単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageHeader } from "../PageHeader";

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

vi.mock("@shared/constants", () => ({ IS_ELECTRON: false }));

describe("PageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タイトルが表示される", () => {
    render(
      <MemoryRouter>
        <PageHeader icon="📖" titleKey="glossary" />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "glossary" }),
    ).toBeInTheDocument();
  });

  it("アイコンが aria-hidden で表示される", () => {
    const { container } = render(
      <MemoryRouter>
        <PageHeader icon="📖" titleKey="glossary" />
      </MemoryRouter>,
    );
    const iconEl = container.querySelector('[aria-hidden="true"]');
    expect(iconEl?.textContent).toBe("📖");
  });

  it("サブタイトルが表示される", () => {
    render(
      <MemoryRouter>
        <PageHeader
          icon="📖"
          titleKey="glossary"
          subtitleKey="glossary.subtitle"
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("glossary.subtitle")).toBeInTheDocument();
  });

  it("説明が表示される", () => {
    render(
      <MemoryRouter>
        <PageHeader
          icon="📖"
          titleKey="glossary"
          descriptionKey="glossary.description"
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("glossary.description")).toBeInTheDocument();
  });

  it("サブタイトル/説明が省略可能", () => {
    render(
      <MemoryRouter>
        <PageHeader icon="📖" titleKey="glossary" />
      </MemoryRouter>,
    );
    expect(screen.queryByText("glossary.subtitle")).not.toBeInTheDocument();
    expect(screen.queryByText("glossary.description")).not.toBeInTheDocument();
  });

  it("ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる", () => {
    render(
      <MemoryRouter>
        <PageHeader icon="📖" titleKey="glossary" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "a11y.backToHome" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
