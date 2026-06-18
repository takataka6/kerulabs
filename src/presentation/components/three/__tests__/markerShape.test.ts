import { describe, expect, it } from "vitest";
import {
  getMarkerShapeRotationY,
  getMarkerShapeSegments,
} from "../markerShape";

describe("markerShape", () => {
  it("三角形と五角形は対応する分割数を返す", () => {
    expect(getMarkerShapeSegments("triangle")).toBe(3);
    expect(getMarkerShapeSegments("pentagon")).toBe(5);
  });

  it("相手マーカーの三角形と五角形は 180 度反転する", () => {
    expect(getMarkerShapeRotationY("triangle", true)).toBe(Math.PI);
    expect(getMarkerShapeRotationY("pentagon", true)).toBe(Math.PI);
  });

  it("円形と自チームマーカーは回転しない", () => {
    expect(getMarkerShapeRotationY("circle", true)).toBe(0);
    expect(getMarkerShapeRotationY("triangle", false)).toBe(0);
  });
});
