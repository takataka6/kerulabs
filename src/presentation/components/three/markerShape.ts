import type { MarkerShape } from "@shared/types/MarkerShape";
import { DISK_GEOMETRY } from "@shared/constants/threeConstants";

const MARKER_SHAPE_SEGMENTS: Record<MarkerShape, number> = {
  circle: DISK_GEOMETRY.SEGMENTS,
  triangle: 3,
  pentagon: 5,
};

export function getMarkerShapeSegments(shape: MarkerShape): number {
  return MARKER_SHAPE_SEGMENTS[shape];
}

export function getMarkerShapeRotationY(
  shape: MarkerShape,
  isOpponent = false,
): number {
  if (shape === "circle") return 0;
  return isOpponent ? Math.PI : 0;
}
