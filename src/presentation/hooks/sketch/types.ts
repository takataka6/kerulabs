/**
 * スケッチオーバーレイで使用する型定義。
 *
 * ドメイン層の型を re-export する。
 * 既存の presentation 層コードの import パスを壊さないための互換レイヤー。
 */
export type {
  SketchTool,
  SketchPoint,
  SketchStroke,
  SketchLayer,
  SketchRecord,
} from "@domain/types/Sketch";
