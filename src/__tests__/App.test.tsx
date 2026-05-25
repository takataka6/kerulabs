/**
 * @module App ルートコンポーネント
 * @description アプリケーション全体の結合テスト
 *
 * テスト方針:
 * - 全外部依存（IndexedDB・リポジトリ・サービス・ページコンポーネント等）をvi.mockでスタブ化
 * - 初期化フロー（DB接続→PreferencesService→configureContainer→シードデータ）を検証
 * - ルーティング（各パスでの正しいページコンポーネント表示）を検証
 * - シードデータの冪等性（既存データの重複シード防止・カスタム戦術の保護）を検証
 * - エラーハンドリング（DB/Preferences/Formation初期化失敗時のhandleError呼び出し）を検証
 * - アクセシビリティ（SkipLink）とLogViewerのキーボードトグルを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/*  Mock 定義 — 全外部依存を置き換え                                      */
/* ------------------------------------------------------------------ */

// ── handleError ──
const mockHandleError = vi.fn();
vi.mock("@shared/errors/handleError", () => ({
  handleError: (...args: unknown[]) => mockHandleError(...args),
}));

// ── IndexedDBClient ──
const mockGetDB = vi.fn().mockResolvedValue({});
vi.mock("@infrastructure/repositories", () => ({
  IndexedDBClient: {
    getInstance: () => ({ getDB: mockGetDB }),
  },
}));

// ── IndexedDBPreferencesService ──
const mockPreferencesInitialize = vi.fn().mockResolvedValue(undefined);
const mockPreferencesGet = vi.fn().mockReturnValue("ja");
const mockPreferencesSet = vi.fn();
vi.mock("@infrastructure/services", () => ({
  IndexedDBPreferencesService: vi.fn().mockImplementation(() => ({
    initialize: mockPreferencesInitialize,
    get: mockPreferencesGet,
    set: mockPreferencesSet,
  })),
  BrowserFileService: vi.fn().mockImplementation(() => ({})),
}));

// ── RepositoryFactory ──
const mockFormationFindAll = vi.fn().mockResolvedValue([]);
const mockFormationSave = vi.fn().mockResolvedValue(undefined);
const mockTacticFindAll = vi.fn().mockResolvedValue([]);
const mockTacticSave = vi.fn().mockResolvedValue(undefined);
const mockTacticDelete = vi.fn().mockResolvedValue(undefined);

vi.mock("@infrastructure/factories", () => ({
  RepositoryFactory: {
    createTacticRepository: () => ({
      findAll: mockTacticFindAll,
      save: mockTacticSave,
      delete: mockTacticDelete,
      findById: vi.fn(),
    }),
    createTeamRepository: () => ({
      findAll: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    }),
    createFormationRepository: () => ({
      findAll: mockFormationFindAll,
      save: mockFormationSave,
      findById: vi.fn(),
      delete: vi.fn(),
    }),
    createGlossaryRepository: () => ({
      findAll: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    }),
    createTeamManualRepository: () => ({
      findAll: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    }),
    createPluginRepository: () => ({
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
      findByMetadataId: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      delete: vi.fn(),
    }),
  },
}));

// ── Seed データ ──
vi.mock("@infrastructure/seed", () => ({
  DEFAULT_FORMATIONS: [
    { id: "f1", name: "4-4-2", gameMode: "football" },
    { id: "f2", name: "4-3-3", gameMode: "football" },
  ],
  DEFAULT_FUTSAL_FORMATIONS: [
    { id: "futsal1", name: "2-2", gameMode: "futsal" },
  ],
  DEFAULT_EIGHT_ASIDE_FORMATIONS: [
    { id: "eight1", name: "3-3-1", gameMode: "eightAside" },
  ],
  DEFAULT_SOCIETY_FORMATIONS: [
    { id: "soc1", name: "2-3-2", gameMode: "society" },
  ],
  DEFAULT_TACTICS: [{ id: "t1", name: "Default Tactic", isCustom: false }],
}));

// ── configureContainer ──
const mockConfigureContainer = vi.fn();
vi.mock("@application/ServiceContainer", () => ({
  configureContainer: (...args: unknown[]) => mockConfigureContainer(...args),
  getContainer: () => ({
    preferencesService: {
      get: mockPreferencesGet,
      set: mockPreferencesSet,
    },
  }),
}));

// ── Use-case Interactors ──
vi.mock("@application/use-cases", () => ({
  TacticInteractor: vi.fn().mockImplementation(() => ({})),
  TeamInteractor: vi.fn().mockImplementation(() => ({})),
  FormationInteractor: vi.fn().mockImplementation(() => ({})),
  GlossaryInteractor: vi.fn().mockImplementation(() => ({})),
  TeamManualInteractor: vi.fn().mockImplementation(() => ({})),
  PluginInteractor: vi.fn().mockImplementation(() => ({})),
}));

// ── AppBackupService ──
vi.mock("@application/services/AppBackupService", () => ({
  AppBackupService: vi.fn().mockImplementation(() => ({
    export: vi.fn(),
    import: vi.fn(),
    resetAll: vi.fn(),
  })),
}));

// ── 遅延ロードページをスタブ化 ──
vi.mock("@presentation/pages/TacticsViewerPage", () => ({
  TacticsViewerPage: () => (
    <div data-testid="tactics-viewer-page">TacticsViewerPage</div>
  ),
}));
vi.mock("@presentation/pages/GlossaryPage", () => ({
  GlossaryPage: () => <div data-testid="glossary-page">GlossaryPage</div>,
}));
vi.mock("@presentation/pages/CodeLabPage", () => ({
  CodeLabPage: () => <div data-testid="code-lab-page">CodeLabPage</div>,
}));
vi.mock("@presentation/pages/HomePage", () => ({
  HomePage: () => <div data-testid="home-page">HomePage</div>,
}));

// ── LogViewer ──
vi.mock("@presentation/components/ui/LogViewer", () => ({
  LogViewer: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="log-viewer">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function renderApp(initialRoute = "/") {
  const queryClient = createQueryClient();
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <QueryClientProvider client={queryClient}>
        <AppUnderTest />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

// vi.mock が効いた状態の App を静的インポートで取得
import { App as AppUnderTest } from "../App";

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // clearAllMocks で実装がリセットされるため、全 mock のデフォルトを再適用
    mockGetDB.mockResolvedValue({});
    mockPreferencesInitialize.mockResolvedValue(undefined);
    mockPreferencesGet.mockReturnValue("ja");
    mockPreferencesSet.mockReturnValue(undefined);
    mockFormationFindAll.mockResolvedValue([]);
    mockFormationSave.mockResolvedValue(undefined);
    mockTacticFindAll.mockResolvedValue([]);
    mockTacticSave.mockResolvedValue(undefined);
    mockTacticDelete.mockResolvedValue(undefined);
  });

  // ── 初期化 ─────────────────────────────────────────────

  describe("初期化フロー", () => {
    it("初期化中はローディング画面を表示する", async () => {
      // getDB を遅延 resolve にして初期化を一時的に止める
      let resolveDB!: (v: unknown) => void;
      mockGetDB.mockReturnValue(
        new Promise((r) => {
          resolveDB = r;
        }),
      );

      renderApp();

      expect(
        screen.getByRole("status", { name: /initializing database/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("KeruLabs")).toBeInTheDocument();
      expect(
        screen.getByText("Football Tactics & Code Lab"),
      ).toBeInTheDocument();

      // テスト後にクリーンアップ: Promise を resolve して初期化を完了させる
      resolveDB({});
      await waitFor(() => {
        expect(
          screen.queryByRole("status", { name: /initializing database/i }),
        ).not.toBeInTheDocument();
      });
    });

    it("日本語ブラウザではローディング文言が日本語で表示される", async () => {
      let resolveDB!: (v: unknown) => void;
      mockGetDB.mockReturnValue(
        new Promise((r) => {
          resolveDB = r;
        }),
      );

      const langSpy = vi
        .spyOn(navigator, "language", "get")
        .mockReturnValue("ja-JP");

      renderApp();

      expect(screen.getByText("データベース初期化中...")).toBeInTheDocument();
      langSpy.mockRestore();

      resolveDB({});
      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });
    });

    it("英語ブラウザではローディング文言が英語で表示される", async () => {
      let resolveDB!: (v: unknown) => void;
      mockGetDB.mockReturnValue(
        new Promise((r) => {
          resolveDB = r;
        }),
      );

      const langSpy = vi
        .spyOn(navigator, "language", "get")
        .mockReturnValue("en-US");

      renderApp();

      expect(screen.getByText("Initializing database...")).toBeInTheDocument();
      langSpy.mockRestore();

      resolveDB({});
      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });
    });

    it("初期化完了後にメインコンテンツが表示される", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });
    });

    it("IndexedDB スキーマ初期化（getDB）が呼ばれる", async () => {
      renderApp();

      await waitFor(() => {
        expect(mockGetDB).toHaveBeenCalledTimes(1);
      });
    });

    it("PreferencesService の initialize が呼ばれる", async () => {
      renderApp();

      await waitFor(() => {
        expect(mockPreferencesInitialize).toHaveBeenCalledTimes(1);
      });
    });

    it("configureContainer が全依存で呼ばれる", async () => {
      renderApp();

      await waitFor(() => {
        expect(mockConfigureContainer).toHaveBeenCalledTimes(1);
      });

      const containerArg = mockConfigureContainer.mock.calls[0][0];
      expect(containerArg).toHaveProperty("teamRepository");
      expect(containerArg).toHaveProperty("formationRepository");
      expect(containerArg).toHaveProperty("tacticRepository");
      expect(containerArg).toHaveProperty("glossaryRepository");
      expect(containerArg).toHaveProperty("backupService");
      expect(containerArg).toHaveProperty("fileService");
      expect(containerArg).toHaveProperty("preferencesService");
      expect(containerArg).toHaveProperty("tacticInteractor");
      expect(containerArg).toHaveProperty("teamInteractor");
      expect(containerArg).toHaveProperty("formationInteractor");
      expect(containerArg).toHaveProperty("glossaryInteractor");
      expect(containerArg).toHaveProperty("appBackupService");
    });
  });

  // ── シードデータ ────────────────────────────────────────

  describe("シードデータ", () => {
    it("初回起動: 全デフォルトフォーメーションがシードされる", async () => {
      mockFormationFindAll.mockResolvedValue([]);

      renderApp();

      await waitFor(() => {
        // football(2) + futsal(1) + eightAside(1) + society(1) = 5
        expect(mockFormationSave).toHaveBeenCalledTimes(5);
      });
    });

    it("既存データあり: 不足フォーメーションのみ追加される", async () => {
      // football のフォーメーションは既存、他ゲームモードは未シード
      mockFormationFindAll.mockResolvedValue([
        { id: "f1", name: "4-4-2", gameMode: "football" },
        { id: "f2", name: "4-3-3", gameMode: "football" },
      ]);

      renderApp();

      await waitFor(() => {
        expect(mockFormationSave).toHaveBeenCalled();
      });

      // 不足している futsal(1) + eightAside(1) + society(1) = 3
      expect(mockFormationSave).toHaveBeenCalledTimes(3);
      expect(mockFormationSave).toHaveBeenCalledWith(
        expect.objectContaining({ id: "futsal1" }),
      );
      expect(mockFormationSave).toHaveBeenCalledWith(
        expect.objectContaining({ id: "eight1" }),
      );
      expect(mockFormationSave).toHaveBeenCalledWith(
        expect.objectContaining({ id: "soc1" }),
      );
    });

    it("全フォーメーションが既に存在する場合は追加しない", async () => {
      mockFormationFindAll.mockResolvedValue([
        { id: "f1" },
        { id: "f2" },
        { id: "futsal1" },
        { id: "eight1" },
        { id: "soc1" },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      expect(mockFormationSave).not.toHaveBeenCalled();
    });

    it("デフォルト戦術（非カスタム）は削除して再シードされる", async () => {
      mockTacticFindAll.mockResolvedValue([
        { id: "old-t1", name: "Old", isCustom: false },
      ]);

      renderApp();

      await waitFor(() => {
        expect(mockTacticDelete).toHaveBeenCalledWith("old-t1");
      });
      expect(mockTacticSave).toHaveBeenCalledWith(
        expect.objectContaining({ id: "t1" }),
      );
    });

    it("カスタム戦術は削除されない", async () => {
      mockTacticFindAll.mockResolvedValue([
        { id: "custom-1", name: "My Custom", isCustom: true },
        { id: "default-1", name: "Default", isCustom: false },
      ]);

      renderApp();

      await waitFor(() => {
        expect(mockTacticDelete).toHaveBeenCalledWith("default-1");
      });
      // カスタム戦術の ID で delete が呼ばれていないことを確認
      expect(mockTacticDelete).not.toHaveBeenCalledWith("custom-1");
    });
  });

  // ── エラーハンドリング ──────────────────────────────────

  describe("初期化エラーハンドリング", () => {
    it("DB 初期化失敗時に handleError が呼ばれ、エラー画面が表示される", async () => {
      mockGetDB.mockRejectedValue(new Error("IndexedDB not available"));

      renderApp();

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(
          expect.any(Error),
          "database",
          "Failed to initialize database",
        );
      });

      // エラー画面が表示される（role="alert"）
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
      expect(screen.getByText("IndexedDB not available")).toBeInTheDocument();
    });

    it("PreferencesService 初期化失敗時にも handleError が呼ばれる", async () => {
      mockPreferencesInitialize.mockRejectedValue(
        new Error("Preferences init failed"),
      );

      renderApp();

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledTimes(1);
      });
    });

    it("フォーメーションシード失敗時にも handleError が呼ばれる", async () => {
      mockFormationFindAll.mockRejectedValue(
        new Error("Formation read failed"),
      );

      renderApp();

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ── ルーティング ─────────────────────────────────────────

  describe("ルーティング", () => {
    it("'/' で HomePage が表示される", async () => {
      renderApp("/");

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });
    });

    it("'/tactics-simulator' で TacticsViewerPage が表示される", async () => {
      renderApp("/tactics-simulator");

      await waitFor(() => {
        expect(screen.getByTestId("tactics-viewer-page")).toBeInTheDocument();
      });
    });

    it("'/glossary' で GlossaryPage が表示される", async () => {
      renderApp("/glossary");

      await waitFor(() => {
        expect(screen.getByTestId("glossary-page")).toBeInTheDocument();
      });
    });

    it("'/code-lab' で CodeLabPage が表示される", async () => {
      renderApp("/code-lab");

      await waitFor(() => {
        expect(screen.getByTestId("code-lab-page")).toBeInTheDocument();
      });
    });

    it("未定義パスは '/' にリダイレクトされる", async () => {
      renderApp("/unknown-route");

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });
    });
  });

  // ── SkipLink ──────────────────────────────────────────────

  describe("SkipLink（アクセシビリティ）", () => {
    it("スキップリンクがレンダーされる", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      const skipLink = screen.getByText("メインコンテンツにスキップ");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink.closest("a")).toHaveAttribute("href", "#main-content");
    });
  });

  // ── LogViewer トグル ────────────────────────────────────

  describe("LogViewer トグル", () => {
    it("初期状態では LogViewer は非表示", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("log-viewer")).not.toBeInTheDocument();
    });

    it("Ctrl+Shift+L で LogViewer が表示される", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, {
        key: "L",
        ctrlKey: true,
        shiftKey: true,
      });

      expect(screen.getByTestId("log-viewer")).toBeInTheDocument();
    });

    it("Ctrl+Shift+L を再度押すと LogViewer が非表示になる", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      // 表示
      fireEvent.keyDown(window, {
        key: "L",
        ctrlKey: true,
        shiftKey: true,
      });
      expect(screen.getByTestId("log-viewer")).toBeInTheDocument();

      // 非表示
      fireEvent.keyDown(window, {
        key: "L",
        ctrlKey: true,
        shiftKey: true,
      });
      expect(screen.queryByTestId("log-viewer")).not.toBeInTheDocument();
    });

    it("Ctrl+L（Shift なし）では LogViewer は表示されない", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, {
        key: "L",
        ctrlKey: true,
        shiftKey: false,
      });

      expect(screen.queryByTestId("log-viewer")).not.toBeInTheDocument();
    });

    it("Shift+L（Ctrl なし）では LogViewer は表示されない", async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, {
        key: "L",
        ctrlKey: false,
        shiftKey: true,
      });

      expect(screen.queryByTestId("log-viewer")).not.toBeInTheDocument();
    });
  });

  // ── PageLoader（Suspense） ────────────────────────────

  describe("PageLoader", () => {
    it("ローディング中に aria-hidden のスピナーが表示される", async () => {
      let resolveDB!: (v: unknown) => void;
      mockGetDB.mockReturnValue(
        new Promise((r) => {
          resolveDB = r;
        }),
      );

      renderApp();

      // 初期化ローディング中のスピナー
      const spinner = screen.getByRole("status", {
        name: /initializing database/i,
      });
      expect(spinner).toBeInTheDocument();
      expect(spinner.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

      resolveDB({});
      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });
    });
  });

  // ── クリーンアップ ──────────────────────────────────────

  describe("クリーンアップ", () => {
    it("アンマウント時にキーボードリスナーが削除される", async () => {
      const removeEventSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderApp();

      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });

      unmount();

      expect(removeEventSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
      removeEventSpy.mockRestore();
    });
  });
});
