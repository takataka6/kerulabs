/** マーカー形状の識別子 */
export type MarkerShape = "circle" | "triangle" | "pentagon";

/** サポートするマーカー形状一覧 */
export const MARKER_SHAPES = ["circle", "triangle", "pentagon"] as const;

/** マーカー形状のデフォルト値 */
export const DEFAULT_MARKER_SHAPE: MarkerShape = "circle";
