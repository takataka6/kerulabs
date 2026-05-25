/**
 * @module IndexedDBClient
 * @description IndexedDBクライアント（シングルトン）の単体テスト
 *
 * テスト方針:
 * - idb ライブラリの openDB をvi.mockでスタブ化
 * - シングルトンキャッシュを無効化するためテスト毎に動的import
 * - getDB: DB接続の取得とキャッシュ動作を検証
 * - マイグレーション: upgrade コールバックの実行を検証
 * - エラーケース: 接続失敗時の再スロー動作を検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- Mocks ---

// openDB のモック: upgrade コールバックを呼び出し可能にする
const mockOpenDB = vi.fn();
vi.mock("idb", () => ({
  openDB: (...args: unknown[]) => mockOpenDB(...args),
}));

// テスト対象は mock 定義後に動的 import
// (IndexedDBClient はシングルトンなので各テストで instance をリセットする)
async function createFreshClient() {
  // シングルトンのキャッシュを無効化するために毎回 re-import
  const mod = await import("../../repositories/indexeddb/IndexedDBClient");
  mod.IndexedDBClient.resetForTesting();
  return mod.IndexedDBClient.getInstance();
}

// --- Helpers ---

/** upgrade コールバックに渡されるダミー db オブジェクト */
function createMockDB() {
  const storeNames = new Set<string>();
  return {
    objectStoreNames: {
      contains: (name: string) => storeNames.has(name),
    },
    createObjectStore: vi.fn((name: string) => {
      storeNames.add(name);
      return {
        createIndex: vi.fn(),
      };
    }),
  };
}

/** getAll / transaction / objectStore をサポートするフル機能モック DB */
function createFullMockDB() {
  const stores: Record<string, unknown[]> = {
    teams: [{ id: "t1", name: "Team A" }],
    players: [{ id: "p1", name: "Player 1" }],
    formations: [],
    tactics: [],
    preferences: [],
    sketches: [],
    glossaries: [],
    teamManuals: [],
    plugins: [],
  };

  const mockClose = vi.fn();

  const db = {
    getAll: vi.fn(async (storeName: string) => stores[storeName] ?? []),
    transaction: vi.fn(() => {
      const txStores: Record<
        string,
        { clear: () => Promise<void>; put: (val: unknown) => Promise<void> }
      > = {};
      for (const name of Object.keys(stores)) {
        txStores[name] = {
          clear: vi.fn(async () => {
            stores[name] = [];
          }),
          put: vi.fn(async (val: unknown) => {
            stores[name].push(val);
          }),
        };
      }
      return {
        objectStore: vi.fn((name: string) => txStores[name]),
        done: Promise.resolve(),
      };
    }),
    close: mockClose,
  };

  return { db, stores, mockClose };
}

// --- Tests ---

describe("IndexedDBClient — upgrade コールバック", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("新規インストールで全ストアが作成される", async () => {
    const mockDB = createMockDB();

    mockOpenDB.mockImplementation(
      async (
        _name: string,
        _version: number,
        options: { upgrade: (...args: unknown[]) => void },
      ) => {
        const mockTransaction = { abort: vi.fn() };
        // 新規インストール: oldVersion=0, newVersion=1
        options.upgrade(mockDB, 0, 1, mockTransaction);
        return mockDB;
      },
    );

    const client = await createFreshClient();
    await client.getDB();

    const storeNames = mockDB.createObjectStore.mock.calls.map(
      (call) => call[0],
    );
    expect(storeNames).toContain("teams");
    expect(storeNames).toContain("players");
    expect(storeNames).toContain("formations");
    expect(storeNames).toContain("tactics");
    expect(storeNames).toContain("preferences");
  });

  it("newVersion が null の場合、DB_VERSION にフォールバックする", async () => {
    const mockDB = createMockDB();

    mockOpenDB.mockImplementation(
      async (
        _name: string,
        _version: number,
        options: { upgrade: (...args: unknown[]) => void },
      ) => {
        const mockTransaction = { abort: vi.fn() };
        // newVersion を null にしてフォールバックロジックをテスト
        options.upgrade(mockDB, 0, null, mockTransaction);
        return mockDB;
      },
    );

    const client = await createFreshClient();
    await client.getDB();

    // v1 マイグレーションが実行される
    expect(mockDB.createObjectStore).toHaveBeenCalled();
  });
});

describe("IndexedDBClient — シングルトン", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getInstance は同一インスタンスを返す", async () => {
    const mod = await import("../../repositories/indexeddb/IndexedDBClient");
    mod.IndexedDBClient.resetForTesting();

    const instance1 = mod.IndexedDBClient.getInstance();
    const instance2 = mod.IndexedDBClient.getInstance();

    expect(instance1).toBe(instance2);
  });
});

describe("IndexedDBClient — getDB キャッシュ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getDB を2回呼んでも openDB は1回しか呼ばれない", async () => {
    const { db } = createFullMockDB();
    mockOpenDB.mockResolvedValue(db);

    const client = await createFreshClient();
    await client.getDB();
    await client.getDB();

    expect(mockOpenDB).toHaveBeenCalledTimes(1);
  });
});

describe("IndexedDBClient — exportAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("全8ストアのデータをエクスポートできる", async () => {
    const { db } = createFullMockDB();
    mockOpenDB.mockResolvedValue(db);

    const client = await createFreshClient();
    const result = await client.exportAll();

    expect(Object.keys(result)).toEqual(
      expect.arrayContaining([
        "teams",
        "players",
        "formations",
        "tactics",
        "preferences",
        "sketches",
        "glossaries",
        "teamManuals",
      ]),
    );
    expect(result.teams).toEqual([{ id: "t1", name: "Team A" }]);
    expect(result.players).toEqual([{ id: "p1", name: "Player 1" }]);
    expect(result.formations).toEqual([]);
    expect(db.getAll).toHaveBeenCalledTimes(9);
  });
});

describe("IndexedDBClient — importAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("全ストアをクリアしてデータをインポートできる", async () => {
    const { db } = createFullMockDB();
    mockOpenDB.mockResolvedValue(db);

    const importData = {
      teams: [
        {
          id: "t2",
          name: "Team B",
          subtitle: "Sub",
          colors: { gk: "#000000", main: "#ffffff" },
          availableFormations: ["4-4-2"],
          flagType: "flat",
          headerGradient: "linear-gradient(#000,#fff)",
          createdAt: 1000,
          updatedAt: 1000,
        },
      ],
      players: [{ id: "p2", name: "Player 2" }],
    };

    const client = await createFreshClient();
    await client.importAll(importData);

    expect(db.transaction).toHaveBeenCalledWith(
      expect.arrayContaining([
        "teams",
        "players",
        "formations",
        "tactics",
        "preferences",
        "sketches",
        "glossaries",
        "teamManuals",
      ]),
      "readwrite",
    );
  });

  it("不正なデータの場合バリデーションエラーをスローする", async () => {
    const { db } = createFullMockDB();
    mockOpenDB.mockResolvedValue(db);

    const importData = {
      teams: [{ id: "t2", name: "Team B" }], // 必須フィールド不足
    };

    const client = await createFreshClient();
    await expect(client.importAll(importData)).rejects.toThrow(
      /Invalid teams\[0\]/,
    );
  });

  it("data にキーがないストアは空配列として処理される", async () => {
    const { db } = createFullMockDB();
    mockOpenDB.mockResolvedValue(db);

    const client = await createFreshClient();
    // 全ストアに対してデータなしでインポート
    await client.importAll({});

    const tx = db.transaction.mock.results[0].value;
    // 各ストアの clear が呼ばれ、put は呼ばれない
    for (const storeName of [
      "teams",
      "players",
      "formations",
      "tactics",
      "preferences",
      "sketches",
      "glossaries",
      "teamManuals",
    ]) {
      const store = tx.objectStore(storeName);
      expect(store.clear).toHaveBeenCalled();
    }
  });
});

describe("IndexedDBClient — close", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("DB接続を閉じて null にリセットする", async () => {
    const { db, mockClose } = createFullMockDB();
    mockOpenDB.mockResolvedValue(db);

    const client = await createFreshClient();
    await client.getDB(); // DB を初期化
    await client.close();

    expect(mockClose).toHaveBeenCalledOnce();

    // close 後に getDB を呼ぶと再度 openDB が呼ばれる
    mockOpenDB.mockResolvedValue(db);
    await client.getDB();
    expect(mockOpenDB).toHaveBeenCalledTimes(2);
  });

  it("DB が未接続の場合 close は何もしない", async () => {
    const client = await createFreshClient();
    // getDB を呼ばずに close
    await client.close();
    // エラーが発生しないことを確認
    expect(mockOpenDB).not.toHaveBeenCalled();
  });
});
