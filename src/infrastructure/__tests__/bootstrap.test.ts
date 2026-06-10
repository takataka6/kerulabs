/**
 * @module bootstrap.test
 * @description initializeApp() の詳細な単体テスト
 *
 * 目的:
 * - Clean Architecture 違反を修正した後の bootstrap 処理が、以前と完全に同じ外部効果を持つことを保証する。
 * - シードロジック（フォーメーションの初回/差分投入、戦術の非カスタム再シード）の全分岐をカバー。
 * - エラー発生時の振る舞いとログ記録を検証。
 * - sketchStorage が Container に正しく供給されることを検証（Phase 1 の重要修正点）。
 *
 * テスト戦略:
 * - 全ての重い依存（DB, Factory, seed 定数, services, configureContainer）を vi.mock で隔離。
 * - 各テストで vi.resetModules() + モックリセットを行い、モジュールシングルトン（configureContainer, IndexedDBClient）の影響を排除。
 * - 実際のシード分岐は、モックされたリポジトリの findAll/save/delete の戻り値で制御。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── モック定義（テスト間で共有） ────────────────────────────────
const mockGetDB = vi.fn().mockResolvedValue({});
const mockPreferencesInitialize = vi.fn().mockResolvedValue(undefined);

const mockFormationFindAll = vi.fn().mockResolvedValue([]);
const mockFormationSave = vi.fn().mockResolvedValue(undefined);

const mockTacticFindAll = vi.fn().mockResolvedValue([]);
const mockTacticSave = vi.fn().mockResolvedValue(undefined);
const mockTacticDelete = vi.fn().mockResolvedValue(undefined);

const mockConfigureContainer = vi.fn();

const mockLoggerWarn = vi.fn();

// モジュールを動的に import するため、beforeEach で毎回リセット
vi.mock("@infrastructure/repositories/indexeddb/IndexedDBClient", () => ({
  IndexedDBClient: {
    getInstance: () => ({ getDB: mockGetDB }),
  },
}));

vi.mock("@infrastructure/services", () => ({
  IndexedDBPreferencesService: vi.fn().mockImplementation(() => ({
    initialize: mockPreferencesInitialize,
  })),
  BrowserFileService: vi.fn().mockImplementation(() => ({})),
}));

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
      save: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    }),
  },
}));

vi.mock("@infrastructure/seed", () => ({
  DEFAULT_FORMATIONS: [
    { id: "f1", name: "4-3-3", gameMode: "football" },
    { id: "4-4-2-flat", name: "4-4-2 Flat", gameMode: "football" },
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
  DEFAULT_TACTICS: [
    { id: "t1", name: "Default Tactic", isCustom: false },
    { id: "t2", name: "Another Default", isCustom: false },
  ],
}));

vi.mock("@application/ServiceContainer", () => ({
  configureContainer: (...args: unknown[]) => mockConfigureContainer(...args),
}));

vi.mock("@shared/logger", () => ({
  getLogger: () => ({
    warn: mockLoggerWarn,
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

// インタラクタと AppBackupService は configure 時に new されるのでモック
vi.mock("@application/use-cases", () => ({
  TacticInteractor: vi.fn().mockImplementation(() => ({})),
  TeamInteractor: vi.fn().mockImplementation(() => ({})),
  FormationInteractor: vi.fn().mockImplementation(() => ({})),
  GlossaryInteractor: vi.fn().mockImplementation(() => ({})),
  TeamManualInteractor: vi.fn().mockImplementation(() => ({})),
  PluginInteractor: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@application/services/AppBackupService", () => ({
  AppBackupService: vi.fn().mockImplementation(() => ({})),
}));

describe("infrastructure/bootstrap - initializeApp", () => {
  beforeEach(async () => {
    // モジュールキャッシュとシングルトン状態を完全にリセット
    vi.resetModules();
    vi.clearAllMocks();

    // デフォルトの成功モックを再設定（resetModules 後に必要）
    mockGetDB.mockResolvedValue({});
    mockPreferencesInitialize.mockResolvedValue(undefined);
    mockFormationFindAll.mockResolvedValue([]);
    mockTacticFindAll.mockResolvedValue([]);
    mockFormationSave.mockResolvedValue(undefined);
    mockTacticSave.mockResolvedValue(undefined);
    mockTacticDelete.mockResolvedValue(undefined);
    mockLoggerWarn.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("正常系: DBオープン → Preferences初期化 → configureContainer → シード が順に実行される", async () => {
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    expect(mockGetDB).toHaveBeenCalledTimes(1);
    expect(mockPreferencesInitialize).toHaveBeenCalledTimes(1);
    expect(mockConfigureContainer).toHaveBeenCalledTimes(1);

    const container = mockConfigureContainer.mock.calls[0][0];
    expect(container).toHaveProperty("teamRepository");
    expect(container).toHaveProperty("formationRepository");
    expect(container).toHaveProperty("tacticRepository");
    expect(container).toHaveProperty("sketchStorage"); // Phase 1 重要: ここで供給される
    expect(container).toHaveProperty("preferencesService");
    expect(container).toHaveProperty("fileService");
    expect(container).toHaveProperty("appBackupService");
    expect(container).toHaveProperty("tacticInteractor");
  });

  it("sketchStorage が Container に正しいインスタンス（モックされた挙動）で供給される", async () => {
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    const container = mockConfigureContainer.mock.calls[0][0];
    expect(container.sketchStorage).toBeDefined();
    // 実装は bootstrap 内で new SketchStorage() しているため、オブジェクトとして存在
    expect(typeof container.sketchStorage.loadSketch).toBe("function");
    expect(typeof container.sketchStorage.saveSketch).toBe("function");
    expect(typeof container.sketchStorage.clearSketch).toBe("function");
  });

  // ── フォーメーションシード分岐 ────────────────────────────────

  it("フォーメーション: 初回（空配列）の場合は全デフォルトを投入（football + 他モード）", async () => {
    mockFormationFindAll.mockResolvedValue([]);
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    // テスト用シードデータ: football 2 + futsal1 + eight1 + soc1 = 5
    expect(mockFormationSave).toHaveBeenCalledTimes(5);
  });

  it("フォーメーション: 既存データがある場合は不足分のみ投入", async () => {
    mockFormationFindAll.mockResolvedValue([
      { id: "f1", name: "4-3-3", gameMode: "football" },
    ]);
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    // 不足: football 残り1 + futsal + eight + soc = 4
    expect(mockFormationSave).toHaveBeenCalledTimes(4);
    expect(mockFormationSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "4-4-2-flat" }),
    );
    expect(mockFormationSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "futsal1" }),
    );
  });

  it("フォーメーション: 全デフォルトが既に存在する場合は save を呼ばない", async () => {
    mockFormationFindAll.mockResolvedValue([
      { id: "f1" },
      { id: "4-4-2-flat" },
      { id: "futsal1" },
      { id: "eight1" },
      { id: "soc1" },
    ]);
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    expect(mockFormationSave).not.toHaveBeenCalled();
  });

  // ── 戦術再シード分岐 ────────────────────────────────────────

  it("戦術: 非カスタム戦術は削除され、デフォルトが再投入される", async () => {
    mockTacticFindAll.mockResolvedValue([
      { id: "old-t1", isCustom: false },
      { id: "old-t2", isCustom: false },
    ]);
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    expect(mockTacticDelete).toHaveBeenCalledWith("old-t1");
    expect(mockTacticDelete).toHaveBeenCalledWith("old-t2");
    expect(mockTacticSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t1" }),
    );
    expect(mockTacticSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t2" }),
    );
  });

  it("戦術: カスタム戦術は削除されず、保持される", async () => {
    mockTacticFindAll.mockResolvedValue([
      { id: "custom-1", isCustom: true },
      { id: "default-old", isCustom: false },
    ]);
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    expect(mockTacticDelete).toHaveBeenCalledWith("default-old");
    expect(mockTacticDelete).not.toHaveBeenCalledWith("custom-1");
  });

  it("戦術: カスタムしか存在しない場合でもデフォルトは投入される（削除対象なし）", async () => {
    mockTacticFindAll.mockResolvedValue([{ id: "my-custom", isCustom: true }]);
    const { initializeApp } = await import("../bootstrap");

    await initializeApp();

    expect(mockTacticDelete).not.toHaveBeenCalled();
    expect(mockTacticSave).toHaveBeenCalled();
  });

  // ── エラー伝播 ─────────────────────────────────────────────

  it("DBオープン失敗時はエラーを投げ、configureContainer は呼ばれない", async () => {
    mockGetDB.mockRejectedValue(new Error("IndexedDB blocked"));
    const { initializeApp } = await import("../bootstrap");

    await expect(initializeApp()).rejects.toThrow("IndexedDB blocked");
    expect(mockConfigureContainer).not.toHaveBeenCalled();
  });

  it("Preferences initialize 失敗時はエラーを投げる", async () => {
    mockPreferencesInitialize.mockRejectedValue(
      new Error("Preferences store corrupted"),
    );
    const { initializeApp } = await import("../bootstrap");

    await expect(initializeApp()).rejects.toThrow(
      "Preferences store corrupted",
    );
  });

  it("フォーメーションシード中の findAll 失敗時もエラーを伝播する", async () => {
    mockFormationFindAll.mockRejectedValue(new Error("Formation table locked"));
    const { initializeApp } = await import("../bootstrap");

    await expect(initializeApp()).rejects.toThrow("Formation table locked");
  });

  it("失敗したシード操作は logSettledFailures 経由で logger.warn が呼ばれる（処理は継続）", async () => {
    // 一部失敗をシミュレート（Promise.allSettled なので全体は成功扱い）
    mockFormationSave
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("partial write fail"));

    const { initializeApp } = await import("../bootstrap");

    // 現在の実装では seed 内の失敗は握りつぶして warn するだけなので、initializeApp 自体は成功する
    await expect(initializeApp()).resolves.toBeUndefined();
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "database",
      expect.stringContaining("formation seed"),
      expect.any(Object),
    );
  });
});
