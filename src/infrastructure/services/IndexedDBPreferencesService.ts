/**
 * @module IndexedDBPreferencesService
 * @description IndexedDBを使ったユーザー設定の永続化サービス。インメモリキャッシュとwrite-throughパターンにより高速な読み取りと永続化を両立する。
 */
import type {
  IPreferencesService,
  PreferenceMap,
} from "@application/ports/output/services/IPreferencesService";
import { IndexedDBClient } from "@infrastructure/repositories/indexeddb/IndexedDBClient";
import { z } from "zod";
import {
  DEFAULT_SCENE_BACKGROUND,
  DEFAULT_PITCH_COLOR,
} from "@shared/constants";
import { getLogger } from "@shared/logger";
import type { SceneBackgroundPreferenceV1 } from "@shared/types";

const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

const sceneBackgroundSchema: z.ZodType<
  SceneBackgroundPreferenceV1,
  z.ZodTypeDef,
  unknown
> = z.discriminatedUnion("mode", [
  z.object({
    version: z.literal(1),
    mode: z.literal("none"),
  }),
  z.object({
    version: z.literal(1),
    mode: z.literal("solid"),
    color: hexColorSchema,
  }),
  z.object({
    version: z.literal(1),
    mode: z.literal("gradient"),
    gradient: z.object({
      kind: z.literal("linear"),
      from: hexColorSchema,
      mid: hexColorSchema.nullable().default(null),
      midPosition: z.number().int().min(1).max(99).default(50),
      midWidth: z.number().min(0).max(98).default(0),
      to: hexColorSchema,
      angle: z.number().finite(),
      presetId: z.string().nullable(),
    }),
  }),
]);

/** 各設定キーのデフォルト値 */
const DEFAULTS: PreferenceMap = {
  language: "ja",
  sceneBackground: DEFAULT_SCENE_BACKGROUND,
  sceneBackgroundImageUrl: "",
  sceneBackgroundImageSaturation: 100,
  sceneBackgroundImageBrightness: 100,
  pitchColor: DEFAULT_PITCH_COLOR,
  pitchOpacity: 1,
};

/**
 * IndexedDB を使った IPreferencesService の具象実装。
 *
 * インメモリ Map キャッシュ + IndexedDB write-through パターン。
 * - `initialize()` を起動時に1回 await してキャッシュをロードする。
 * - `get()` はキャッシュから同期読み取り（既存コード変更不要）。
 * - `set()` / `remove()` はキャッシュ即時更新 + IndexedDB に fire-and-forget 書き込み。
 */
export class IndexedDBPreferencesService implements IPreferencesService {
  private cache = new Map<string, unknown>();
  private client = IndexedDBClient.getInstance();
  private initialized = false;

  /**
   * 起動時に1回呼び出す（await 必須）。
   * IndexedDB から全設定値をインメモリキャッシュにロードし、
   * 必要に応じて旧キーのマイグレーションを実行する。
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const db = await this.client.getDB();
    const all = await db.getAll("preferences");
    for (const record of all) {
      this.cache.set(record.key, record.value);
    }

    const parsedSceneBackground = sceneBackgroundSchema.safeParse(
      this.cache.get("sceneBackground"),
    );
    if (parsedSceneBackground.success) {
      this.cache.set("sceneBackground", parsedSceneBackground.data);
    } else {
      this.cache.set("sceneBackground", DEFAULT_SCENE_BACKGROUND);
      await db.put("preferences", {
        key: "sceneBackground",
        value: DEFAULT_SCENE_BACKGROUND,
      });
    }

    for (const legacyKey of [
      "sceneBgColor",
      "sceneBgImages",
      "sceneBgSelectedIndex",
      "sceneBgImageUrl",
    ]) {
      this.cache.delete(legacyKey);
      await db.delete("preferences", legacyKey);
    }

    this.initialized = true;
  }

  get<K extends keyof PreferenceMap>(key: K): PreferenceMap[K] {
    if (!this.cache.has(key)) return DEFAULTS[key];
    return this.cache.get(key) as PreferenceMap[K];
  }

  set<K extends keyof PreferenceMap>(key: K, value: PreferenceMap[K]): void {
    this.cache.set(key, value);
    // Fire-and-forget: IndexedDB に非同期で永続化
    this.client
      .getDB()
      .then((db) => db.put("preferences", { key, value }))
      .catch((err) => {
        getLogger().warn("database", "Preference write failed", {
          key,
          error: err,
        });
      });
  }

  remove(key: keyof PreferenceMap): void {
    this.cache.delete(key);
    this.client
      .getDB()
      .then((db) => db.delete("preferences", key))
      .catch((err) => {
        getLogger().warn("database", "Preference delete failed", {
          key,
          error: err,
        });
      });
  }
}
