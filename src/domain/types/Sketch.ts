/**
 * スケッチ関連のドメイン型定義。
 *
 * SketchStorage（infrastructure 層）と useSketchOverlay（presentation 層）の
 * 両方から参照される共有型をドメイン層に配置し、レイヤー間の依存方向を正す。
 */

/** 描画ツール種別 */
export type SketchTool = "pen" | "line" | "arrow";

/** 正規化座標（0-1） — キャンバスリサイズに依存しない */
export interface SketchPoint {
  x: number;
  y: number;
}

/** 1本のストローク */
export interface SketchStroke {
  id: number;
  tool: SketchTool;
  points: SketchPoint[];
  color: string;
  width: number;
}

/** レイヤー（最大3枚） */
export interface SketchLayer {
  id: number;
  strokes: SketchStroke[];
  visible: boolean;
  name: string;
}

/** IndexedDB に永続保存するレコード */
export interface SketchRecord {
  id: string;
  layers: SketchLayer[];
  activeLayerId: number;
  updatedAt: number;
}
