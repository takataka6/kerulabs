/**
 * @module SketchStorage
 * @description スケッチデータのIndexedDB永続化ユーティリティ。シングルトンキーで1レコードのみを管理し、手書きスケッチの保存・読込・削除を提供する。
 */
import { IndexedDBClient } from "./IndexedDBClient";
import { withDB } from "./withDB";
import type { SketchRecord } from "@domain/types/Sketch";
import type { ISketchStorage } from "@application/ports/output/services/ISketchStorage";

const SKETCH_KEY = "current";

/**
 * スケッチデータの IndexedDB 永続化ユーティリティ。
 *
 * シングルトンキー `"current"` で1レコードのみ管理する。
 */
export class SketchStorage implements ISketchStorage {
  private client = IndexedDBClient.getInstance();

  /** 保存済みスケッチを読み込む（未保存なら null） */
  async loadSketch(): Promise<SketchRecord | null> {
    return withDB(
      this.client,
      async (db) => {
        const raw = await db.get("sketches", SKETCH_KEY);
        if (!raw) return null;
        if (
          typeof raw === "object" &&
          "layers" in raw &&
          Array.isArray(raw.layers)
        ) {
          return raw as SketchRecord;
        }
        return null;
      },
      "Failed to load sketch",
    );
  }

  /** スケッチを保存（upsert） */
  async saveSketch(record: SketchRecord): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.put("sketches", { ...record, id: SKETCH_KEY });
      },
      "Failed to save sketch",
    );
  }

  /** スケッチを削除 */
  async clearSketch(): Promise<void> {
    return withDB(
      this.client,
      async (db) => {
        await db.delete("sketches", SKETCH_KEY);
      },
      "Failed to clear sketch",
    );
  }
}
