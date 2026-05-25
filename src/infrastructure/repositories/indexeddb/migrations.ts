import type { IDBPDatabase, IDBPTransaction, StoreNames } from "idb";
import type { TacticsDB } from "./schema";

/**
 * DBマイグレーション関数の型
 * 各バージョンアップ時に実行される処理を定義する
 *
 * @param db - IndexedDB データベースインスタンス
 * @param tx - バージョン変更トランザクション（既存データの移行に使用）
 *
 * @example
 * // バージョン2: players に note フィールドを追加（IndexedDBは柔軟なので新フィールドは自動対応）
 * // インデックスの追加のみ必要:
 * const v2: MigrationFn = (db, tx) => {
 *   const store = tx.objectStore("players");
 *   store.createIndex("by-status", "status");
 * };
 */
type MigrationFn = (
  db: IDBPDatabase<TacticsDB>,
  tx: IDBPTransaction<TacticsDB, StoreNames<TacticsDB>[], "versionchange">,
) => void;

/**
 * バージョン1: 初期スキーマ作成
 *
 * 7つのオブジェクトストアを作成:
 * - teams: チーム情報（選手を埋め込み）
 * - players: 選手情報（独立ストア、将来のクエリ用）
 * - formations: フォーメーション定義
 * - tactics: 戦術定義（移動・パス情報を含む）
 * - preferences: アプリ設定（キーバリュー）
 * - sketches: スケッチデータ
 * - glossaries: 用語集
 */
const v1: MigrationFn = (db) => {
  // チーム
  const teamStore = db.createObjectStore("teams", { keyPath: "id" });
  teamStore.createIndex("by-name", "name");
  teamStore.createIndex("by-created", "createdAt");

  // 選手
  const playerStore = db.createObjectStore("players", { keyPath: "id" });
  playerStore.createIndex("by-team", "teamId");
  playerStore.createIndex("by-team-number", ["teamId", "number"], {
    unique: true,
  });

  // フォーメーション
  const formationStore = db.createObjectStore("formations", {
    keyPath: "id",
  });
  formationStore.createIndex("by-type", "type");
  formationStore.createIndex("by-custom", "isCustom");

  // 戦術
  const tacticStore = db.createObjectStore("tactics", { keyPath: "id" });
  tacticStore.createIndex("by-phase", "phase");
  tacticStore.createIndex("by-custom", "isCustom");

  // 設定
  db.createObjectStore("preferences", { keyPath: "key" });

  // スケッチ
  db.createObjectStore("sketches", { keyPath: "id" });

  // 用語集
  db.createObjectStore("glossaries", { keyPath: "id" });

  // チームマニュアル
  db.createObjectStore("teamManuals", { keyPath: "id" });
};

/**
 * マイグレーション定義マップ
 * キーはターゲットバージョン番号（1-indexed）
 *
 * 新しいマイグレーションを追加する手順:
 * 1. このマップに新しいバージョン番号のエントリを追加
 * 2. IndexedDBClient.ts の DB_VERSION を新しいバージョンに更新
 * 3. テストを追加して migration が正しく動作することを確認
 */
/**
 * バージョン2: プラグインストア追加
 *
 * プラグインシステムのためのオブジェクトストアを追加:
 * - plugins: プラグインデータ（メタデータID・タイプでインデックス）
 */
const v2: MigrationFn = (db) => {
  const pluginStore = db.createObjectStore("plugins", { keyPath: "id" });
  pluginStore.createIndex("by-metadata-id", "metadata.id");
  pluginStore.createIndex("by-type", "type");
};

const migrations: Record<number, MigrationFn> = {
  1: v1,
  2: v2,
};

/**
 * 指定バージョン間のマイグレーションを順次実行する
 *
 * IndexedDB の upgrade コールバックから呼び出され、
 * oldVersion+1 から newVersion までのマイグレーション関数を順番に実行する。
 * これにより、例えば v1 → v3 のアップグレードでも v2, v3 が順次適用される。
 *
 * @param db - IndexedDB データベースインスタンス
 * @param oldVersion - 現在のDBバージョン（0 = 新規作成）
 * @param newVersion - ターゲットDBバージョン
 * @param tx - バージョン変更トランザクション
 */
export function runMigrations(
  db: IDBPDatabase<TacticsDB>,
  oldVersion: number,
  newVersion: number,
  tx: IDBPTransaction<TacticsDB, StoreNames<TacticsDB>[], "versionchange">,
): void {
  for (let version = oldVersion + 1; version <= newVersion; version++) {
    const migration = migrations[version];
    if (!migration) {
      throw new Error(
        `Migration for version ${version} not found. ` +
          `Ensure migrations[${version}] is defined in migrations.ts`,
      );
    }
    migration(db, tx);
  }
}

/** 現在定義されている最新のマイグレーションバージョン */
export const LATEST_VERSION = Math.max(...Object.keys(migrations).map(Number));
