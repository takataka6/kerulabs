/** ライン描画の Y 座標（グラウンドの微小上方） */
export const LINE_Y = 0.01;

/** ライン描画の透明度 */
export const LINE_OPACITY = 0.85;

/**
 * 矩形ラインの座標を生成（ペナルティエリア・ゴールエリア用）。
 *
 * @param cx - Center X of the rectangle.
 * @param halfW - Half-width of the rectangle.
 * @param depth - Depth from the goal line inward.
 * @param goalLineZ - Z coordinate of the goal line.
 * @param side - +1 for the +Z goal, -1 for the -Z goal.
 * @returns Float32Array of 4 vertices (open rectangle, 3 sides).
 */
export function rectPoints(
  cx: number,
  halfW: number,
  depth: number,
  goalLineZ: number,
  side: 1 | -1,
): Float32Array {
  const zBase = goalLineZ;
  const zInner = zBase - side * depth;
  return new Float32Array([
    cx - halfW,
    0,
    zBase,
    cx - halfW,
    0,
    zInner,
    cx + halfW,
    0,
    zInner,
    cx + halfW,
    0,
    zBase,
  ]);
}

/**
 * 半円弧の座標を生成（フットサルのゴールエリア用）。
 *
 * @param cx - Center X of the arc.
 * @param goalLineZ - Z coordinate of the goal line (arc center).
 * @param radiusX - Horizontal radius.
 * @param radiusZ - Vertical radius.
 * @param side - +1 for the +Z goal, -1 for the -Z goal.
 * @param segments - Number of arc segments (default 32).
 * @returns Float32Array of arc vertices.
 */
export function arcPoints(
  cx: number,
  goalLineZ: number,
  radiusX: number,
  radiusZ: number,
  side: 1 | -1,
  segments: number = 32,
): Float32Array {
  const points: number[] = [];
  const startAngle = side === 1 ? Math.PI : 0;
  const endAngle = side === 1 ? 0 : Math.PI;
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments);
    points.push(
      cx + Math.cos(angle) * radiusX,
      0,
      goalLineZ + Math.sin(angle) * radiusZ * -side,
    );
  }
  return new Float32Array(points);
}

/**
 * 円の座標を生成（センターサークル用）。
 *
 * @param radius - Circle radius.
 * @param segments - Number of segments (default 64).
 * @returns Float32Array of circle vertices (segments+1 points, closed).
 */
export function circlePoints(
  radius: number,
  segments: number = 64,
): Float32Array {
  const points: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }
  return new Float32Array(points);
}
