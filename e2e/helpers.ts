import { Page } from "@playwright/test";

// ── デフォルトチームデータ ─────────────────────────────

const now = Date.now();

function createPlayer(index: number) {
  return {
    id: `test-player-${index}`,
    name: `選手${index}`,
    number: index,
    position: index === 1 ? "gk" : index <= 4 ? "df" : index <= 7 ? "mf" : "fw",
    createdAt: now,
    updatedAt: now,
  };
}

const players = Array.from({ length: 11 }, (_, i) => createPlayer(i + 1));

const DEFAULT_TEAM_A = {
  id: "test-team-a",
  name: "テストチームA",
  subtitle: "テスト用チーム",
  colors: { gk: "#fbbf24", main: "#3b82f6" },
  availableFormations: ["4-3-3", "4-4-2"],
  players,
  flagType: "japan",
  headerGradient: "from-blue-600 to-blue-400",
  createdAt: now,
  updatedAt: now,
  country: "japan",
  defaultFormation: "4-3-3",
  selectedSquad: players.map((p) => p.id),
  manager: "テスト監督",
};

const DEFAULT_TEAM_B = {
  ...DEFAULT_TEAM_A,
  id: "test-team-b",
  name: "テストチームB",
  subtitle: "対戦相手",
  colors: { gk: "#f59e0b", main: "#ef4444" },
  headerGradient: "from-red-600 to-red-400",
  players: players.map((p) => ({
    ...p,
    id: p.id.replace("test-player-", "test-b-player-"),
  })),
  selectedSquad: players.map((p) =>
    p.id.replace("test-player-", "test-b-player-"),
  ),
};

type SeedTactic = {
  id: string;
  name: Record<string, string>;
  icon?: string;
  phase?: string;
  movements?: Record<
    string,
    Array<{
      role: string;
      targetX: number;
      targetZ: number;
      delay: number;
      arrowColor: string;
    }>
  >;
  ballPasses?: Record<
    string,
    Array<{
      startRole: string;
      endRole: string;
      delay: number;
      color: string;
      endX?: number;
      endZ?: number;
      startX?: number;
      startZ?: number;
      trajectoryType?: "low" | "high" | "curveLeft" | "curveRight";
    }>
  >;
  ballPosition?: { x: number; z: number };
  stepBoundaries?: number[];
};

// ── IndexedDB ヘルパー ────────────────────────────────

/**
 * DB 初期化を待つ。
 * App.tsx の initializeDatabase() が完了するまで待機する。
 * 「データベース初期化中...」テキストが消えたら完了。
 */
export async function waitForDBInit(page: Page) {
  await page.goto("/");
  await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
  // 初期化完了を待つ（「データベース初期化中...」テキストが消えるまで）
  await page.waitForFunction(
    () => !document.body.textContent?.includes("データベース初期化中"),
    { timeout: 30000 },
  );
}

/** teams ストアにチームを1つ挿入 */
export async function seedTeam(
  page: Page,
  overrides?: Partial<typeof DEFAULT_TEAM_A>,
) {
  const team = { ...DEFAULT_TEAM_A, ...overrides };
  await page.evaluate(async (teamData) => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("tactics_simulator_db");
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("teams", "readwrite");
        tx.objectStore("teams").put(teamData);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
      req.onerror = () => reject(req.error);
    });
  }, team);
}

/** ホーム＆アウェイの2チームをシード */
export async function seedTwoTeams(page: Page) {
  await seedTeam(page);
  await seedTeam(page, DEFAULT_TEAM_B);
}

/** teams ストアを全クリア */
export async function clearTeams(page: Page) {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("tactics_simulator_db");
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("teams", "readwrite");
        tx.objectStore("teams").clear();
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
      req.onerror = () => reject(req.error);
    });
  });
}

/** tactics ストアに戦術を1つ挿入 */
export async function seedTactic(page: Page, tactic: SeedTactic) {
  const timestamp = Date.now();
  await page.evaluate(
    async ({ tacticData, now }) => {
      return new Promise<void>((resolve, reject) => {
        const req = indexedDB.open("tactics_simulator_db");
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("tactics", "readwrite");
          tx.objectStore("tactics").put({
            icon: "🎯",
            phase: "attack",
            movements: {},
            isCustom: true,
            createdAt: now,
            updatedAt: now,
            ...tacticData,
          });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
        req.onerror = () => reject(req.error);
      });
    },
    { tacticData: tactic, now: timestamp },
  );
}

/** tactics ストアを全クリア */
export async function clearTactics(page: Page) {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("tactics_simulator_db");
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("tactics", "readwrite");
        tx.objectStore("tactics").clear();
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
      req.onerror = () => reject(req.error);
    });
  });
}

/** preferences ストアもクリア（選択済みチームの記憶を消す） */
export async function clearPreferences(page: Page) {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("tactics_simulator_db");
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("preferences")) {
          db.close();
          resolve();
          return;
        }
        const tx = db.transaction("preferences", "readwrite");
        tx.objectStore("preferences").clear();
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
      req.onerror = () => reject(req.error);
    });
  });
}
