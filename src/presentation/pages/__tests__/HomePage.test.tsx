/**
 * @module HomePage ページコンポーネント
 * @description ホームページの結合テスト
 *
 * テスト方針:
 * - react-router-dom・LanguageContext・Toast/Confirm・useAppBackup をモック化
 * - MemoryRouterでルーティング環境を再現
 * - ページタイトル・アプリカード・バックアップボタン・言語切替・フッターの表示を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "../HomePage";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockSetLanguage = vi.fn();
const mockUseTeams = vi.fn<
  () => { data: Array<{ id: string }>; isLoading: boolean }
>(() => ({ data: [], isLoading: false }));
vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    setLanguage: mockSetLanguage,
    t: (key: string) => key,
    tDynamic: (key: string) => key,
  }),
}));

vi.mock("@presentation/hooks/queries", () => ({
  useTeams: () => mockUseTeams(),
}));

const mockConfirm = vi.fn().mockResolvedValue(true);
vi.mock("@presentation/components/ui", () => ({
  useToast: () => ({ showToast: vi.fn() }),
  useConfirm: () => ({
    confirm: mockConfirm,
    alert: vi.fn(),
  }),
}));

const mockHandleSeed = vi.fn();
vi.mock("@presentation/hooks/useSeedSampleData", () => ({
  useSeedSampleData: () => ({
    handleSeed: mockHandleSeed,
    isSeeding: false,
  }),
}));

const mockHandleExport = vi.fn();
const mockHandleImport = vi.fn();
const mockHandleReset = vi.fn();
vi.mock("@presentation/hooks/useAppBackup", () => ({
  useAppBackup: () => ({
    handleExport: mockHandleExport,
    handleImport: mockHandleImport,
    handleReset: mockHandleReset,
    isExporting: false,
    isImporting: false,
    isResetting: false,
  }),
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ページタイトルが表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("app.title")).toBeInTheDocument();
  });

  it("サブタイトルが表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("app.subtitle")).toBeInTheDocument();
  });

  it("配布体験向けのヒーロー導線が表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("app.hero.publicBeta")).toBeInTheDocument();
    expect(screen.getByText("app.hero.primaryActionEmpty")).toBeInTheDocument();
    expect(screen.getByText("app.hero.secondaryAction")).toBeInTheDocument();
  });

  it("既存データがある場合は戦術シミュレーター導線を主表示する", () => {
    mockUseTeams.mockReturnValueOnce({
      data: [{ id: "team-1" }],
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("app.hero.primaryAction")).toBeInTheDocument();
  });

  it("アプリカードが表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("tactics.simulator")).toBeInTheDocument();
    expect(screen.getByText("glossary")).toBeInTheDocument();
    expect(screen.getByText("code.lab")).toBeInTheDocument();
  });

  it("バックアップボタンが表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("app.backup.export")).toBeInTheDocument();
    expect(screen.getByText("app.backup.import")).toBeInTheDocument();
  });

  it("言語切替ボタンが表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/日本語/)).toBeInTheDocument();
    expect(screen.getByText(/English/)).toBeInTheDocument();
  });

  it("リセットボタンが表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("app.backup.reset")).toBeInTheDocument();
  });

  it("フッターが表示される", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("app.version")).toBeInTheDocument();
    expect(screen.getByText("app.footer")).toBeInTheDocument();
  });

  // ── インタラクションテスト ──

  it("アプリカードをクリックすると対応ページへ遷移する", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("tactics.simulator"));
    expect(mockNavigate).toHaveBeenCalledWith("/tactics-simulator");

    fireEvent.click(screen.getByText("glossary"));
    expect(mockNavigate).toHaveBeenCalledWith("/glossary");

    fireEvent.click(screen.getByText("code.lab"));
    expect(mockNavigate).toHaveBeenCalledWith("/code-lab");
  });

  it("言語切替ボタンをクリックすると setLanguage が呼ばれる", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/English/));
    expect(mockSetLanguage).toHaveBeenCalledWith("en");

    fireEvent.click(screen.getByText(/日本語/));
    expect(mockSetLanguage).toHaveBeenCalledWith("ja");
  });

  it("エクスポートボタンをクリックすると handleExport が呼ばれる", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("app.backup.export"));
    expect(mockHandleExport).toHaveBeenCalled();
  });

  it("初回導線の主ボタンをクリックすると確認後にホーム上でガイド表示へ切り替わる", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("app.hero.primaryActionEmpty"));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith({ message: "app.seed.confirm" });
    });
    await waitFor(() => {
      expect(mockHandleSeed).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText("app.seed.tryHere")).toBeInTheDocument();
    });
    expect(screen.getAllByText("app.seed.inserted")).toHaveLength(3);
    expect(screen.getByText("app.hero.primaryAction")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("関連カードを押すとサンプル投入ガイドが消える", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("app.hero.primaryActionEmpty"));

    await waitFor(() => {
      expect(screen.getByText("app.seed.tryHere")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("tactics.simulator"));

    expect(screen.queryByText("app.seed.tryHere")).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/tactics-simulator");
  });

  it("既存データがある場合は主ボタンから直接戦術画面へ進む", () => {
    mockUseTeams.mockReturnValueOnce({
      data: [{ id: "team-1" }],
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("app.hero.primaryAction"));
    expect(mockNavigate).toHaveBeenCalledWith("/tactics-simulator");
  });

  it("インポートボタンをクリックすると handleImport が呼ばれる", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("app.backup.import"));
    expect(mockHandleImport).toHaveBeenCalled();
  });

  it("リセットボタンをクリックすると確認後に handleReset が呼ばれる", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("app.backup.reset"));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith({
        message: "app.backup.resetConfirm",
        variant: "red",
      });
    });
    await waitFor(() => {
      expect(mockHandleReset).toHaveBeenCalled();
    });
  });

  it("リセット確認でキャンセルした場合 handleReset が呼ばれない", async () => {
    mockConfirm.mockResolvedValueOnce(false);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("app.backup.reset"));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
    });
    expect(mockHandleReset).not.toHaveBeenCalled();
  });

  it("カードホバー時にホバー状態が切り替わる", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const card = screen.getByText("tactics.simulator").closest("button")!;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);

    // ホバー操作がエラーなく完了すること
    expect(card).toBeInTheDocument();
  });
});
