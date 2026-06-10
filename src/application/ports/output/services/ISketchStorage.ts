/**
 * スケッチデータの永続化を抽象化するポートインターフェース。
 *
 * プレゼンテーション層が infrastructure の SketchStorage 具象クラスに直接依存するのを防ぎ、
 * Clean Architecture の依存ルール（Presentation → Application）を維持する。
 *
 * 実装は infrastructure 層の SketchStorage が担う。
 */
import type { SketchRecord } from "@domain/types/Sketch";

export interface ISketchStorage {
  /** 保存済みスケッチを読み込む（未保存なら null） */
  loadSketch(): Promise<SketchRecord | null>;

  /** スケッチを保存（upsert） */
  saveSketch(record: SketchRecord): Promise<void>;

  /** スケッチを削除 */
  clearSketch(): Promise<void>;
}
