/**
 * Three.js コンポーネントで使用する純粋計算関数。
 *
 * BallTrajectory / Scene / Player / OpponentMarker / Arrow / PlayerConnectionLines
 * からテスト可能なロジックを抽出し、一元管理する。
 */

import { Color, Vector3, type Camera } from "three";
import {
  ANIMATION,
  TRAJECTORY_ARCH,
  CURVE_GENERATION,
  PLAYER_VIEW_CAMERA,
  DEFAULT_CAMERA_PARAMS,
} from "@shared/constants/threeConstants";

// ── 型定義 ──────────────────────────────────────────────

export interface Point2D {
  x: number;
  z: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FieldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// ── BallTrajectory 計算 ─────────────────────────────────

/** 弾道タイプに応じたアーチ高さを算出 */
export function computeArchHeight(
  trajectoryType: string | undefined,
  distance: number,
): number {
  switch (trajectoryType) {
    case "low":
      return Math.max(
        distance * TRAJECTORY_ARCH.LOW.FACTOR,
        TRAJECTORY_ARCH.LOW.MIN,
      );
    case "high":
      return Math.max(
        distance * TRAJECTORY_ARCH.HIGH.FACTOR,
        TRAJECTORY_ARCH.HIGH.MIN,
      );
    case "curveLeft":
      return Math.max(
        distance * TRAJECTORY_ARCH.CURVE_LEFT.FACTOR,
        TRAJECTORY_ARCH.CURVE_LEFT.MIN,
      );
    case "curveRight":
      return Math.max(
        distance * TRAJECTORY_ARCH.CURVE_RIGHT.FACTOR,
        TRAJECTORY_ARCH.CURVE_RIGHT.MIN,
      );
    default:
      return Math.max(
        distance * TRAJECTORY_ARCH.DEFAULT.FACTOR,
        TRAJECTORY_ARCH.DEFAULT.MIN,
      );
  }
}

/** 弾道タイプに応じた横方向オフセットを算出 */
export function computeCurveOffset(
  trajectoryType: string | undefined,
  distance: number,
): number {
  switch (trajectoryType) {
    case "curveLeft":
      return -Math.max(
        distance * TRAJECTORY_ARCH.CURVE_OFFSET_FACTOR,
        TRAJECTORY_ARCH.CURVE_OFFSET_MIN,
      );
    case "curveRight":
      return Math.max(
        distance * TRAJECTORY_ARCH.CURVE_OFFSET_FACTOR,
        TRAJECTORY_ARCH.CURVE_OFFSET_MIN,
      );
    default:
      return 0;
  }
}

/** 移動方向に対する垂直ベクトル（XZ平面上）を算出 */
export function computePerpendicularVector(
  dx: number,
  dz: number,
  distance: number,
): { perpX: number; perpZ: number } {
  if (distance === 0) return { perpX: 0, perpZ: 0 };
  return { perpX: -dz / distance, perpZ: dx / distance };
}

/** 放物線カーブ上のポイントを生成（segments + 1 個） */
export function generateCurvePoints(
  start: Point2D,
  end: Point2D,
  archHeight: number,
  curveOffset: number,
  perpX: number,
  perpZ: number,
  segments: number = CURVE_GENERATION.DEFAULT_SEGMENTS,
): Point3D[] {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const points: Point3D[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let x = start.x + dx * t;
    let z = start.z + dz * t;
    const y =
      CURVE_GENERATION.PARABOLA_FACTOR * archHeight * t * (1 - t) +
      CURVE_GENERATION.BASE_Y;

    if (curveOffset !== 0) {
      const lateralDisp = curveOffset * Math.sin(Math.PI * t);
      x += perpX * lateralDisp;
      z += perpZ * lateralDisp;
    }

    points.push({ x, y, z });
  }
  return points;
}

/**
 * カーブポイント列をダッシュセグメント（破線）に分割。
 * 各セグメントは最低2ポイントを持つ。
 */
export function generateDashSegments(
  points: Point3D[],
  dashLength: number = CURVE_GENERATION.DASH_LENGTH,
  gapLength: number = CURVE_GENERATION.GAP_LENGTH,
): Point3D[][] {
  const totalPattern = dashLength + gapLength;
  const segments: Point3D[][] = [];
  let currentLength = 0;
  let currentDash: Point3D[] = [];

  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const dz = points[i].z - points[i - 1].z;
      currentLength += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    const patternPos = currentLength % totalPattern;
    const shouldBeDash = patternPos < dashLength;

    if (shouldBeDash) {
      currentDash.push({ ...points[i] });
    } else {
      if (currentDash.length >= 2) {
        segments.push(currentDash);
      }
      currentDash = [];
    }
  }

  if (currentDash.length >= 2) {
    segments.push(currentDash);
  }

  return segments;
}

/** アニメーションボールの位置を算出 */
export function computeBallAnimationPosition(
  curvePoints: Point3D[],
  elapsedTime: number,
  speed: number = CURVE_GENERATION.BALL_SPEED,
  playbackMultiplier: number = 1,
): Point3D {
  const t = (elapsedTime * speed * playbackMultiplier) % 1;
  const idx = Math.floor(t * (curvePoints.length - 1));
  const nextIdx = Math.min(idx + 1, curvePoints.length - 1);
  const localT = t * (curvePoints.length - 1) - idx;

  const p0 = curvePoints[idx];
  const p1 = curvePoints[nextIdx];
  return {
    x: p0.x + (p1.x - p0.x) * localT,
    y: p0.y + (p1.y - p0.y) * localT,
    z: p0.z + (p1.z - p0.z) * localT,
  };
}

// ── Scene カメラ計算 ────────────────────────────────────

/** ポインタ移動距離がフィールドクリック閾値以内か判定 */
export function isFieldClick(
  downPos: { x: number; y: number },
  upPos: { x: number; y: number },
  threshold: number = 5,
): boolean {
  const dx = upPos.x - downPos.x;
  const dy = upPos.y - downPos.y;
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
}

/** 座標をフィールド境界にクランプ */
export function clampToFieldBounds(
  point: Point2D,
  bounds: FieldBounds,
): Point2D {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, point.x)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, point.z)),
  };
}

/** ゲームモード別のデフォルトカメラパラメータ */
export function getDefaultCameraParams(gameMode: string): {
  camY: number;
  camZ: number;
  targetZ: number;
} {
  return DEFAULT_CAMERA_PARAMS[gameMode] ?? DEFAULT_CAMERA_PARAMS.football;
}

/** 水平回転角度を ±YAW_MAX にクランプ */
export function clampYaw(yaw: number): number {
  return Math.max(
    -PLAYER_VIEW_CAMERA.YAW_MAX,
    Math.min(PLAYER_VIEW_CAMERA.YAW_MAX, yaw),
  );
}

/** 垂直回転角度を ±PITCH_MAX にクランプ */
export function clampPitch(pitch: number): number {
  return Math.max(
    -PLAYER_VIEW_CAMERA.PITCH_MAX,
    Math.min(PLAYER_VIEW_CAMERA.PITCH_MAX, pitch),
  );
}

/** 角度を減衰させ、閾値未満でゼロにスナップ */
export function decayAngle(
  angle: number,
  factor: number = PLAYER_VIEW_CAMERA.DECAY_FACTOR,
  snapThreshold: number = PLAYER_VIEW_CAMERA.SNAP_THRESHOLD,
): number {
  const decayed = angle * factor;
  return Math.abs(decayed) < snapThreshold ? 0 : decayed;
}

/** プレイヤービューのカメラ位置と注視点を算出 */
export function computePlayerViewCamera(
  viewPos: Point2D,
  yaw: number,
  pitch: number,
  dirSign: number,
  isFirstPerson = false,
): {
  camPos: Point3D;
  lookAt: Point3D;
} {
  const camY = isFirstPerson
    ? PLAYER_VIEW_CAMERA.FIRST_PERSON_CAM_Y
    : PLAYER_VIEW_CAMERA.CAM_Y;
  // 3人称: 背後に配置（正の値）、1人称: 前方にオフセットしてマーカーを映さない（負の値）
  const camDistance = isFirstPerson
    ? -PLAYER_VIEW_CAMERA.FIRST_PERSON_FORWARD_OFFSET
    : PLAYER_VIEW_CAMERA.CAM_DISTANCE;

  return {
    camPos: {
      x: viewPos.x - Math.sin(yaw) * camDistance * dirSign,
      y: camY,
      z: viewPos.z - Math.cos(yaw) * camDistance * dirSign,
    },
    lookAt: {
      x: viewPos.x + Math.sin(yaw) * PLAYER_VIEW_CAMERA.LOOK_DISTANCE * dirSign,
      y: isFirstPerson
        ? camY + Math.sin(pitch) * PLAYER_VIEW_CAMERA.LOOK_DISTANCE
        : Math.sin(pitch) * PLAYER_VIEW_CAMERA.LOOK_DISTANCE,
      z: viewPos.z + Math.cos(yaw) * PLAYER_VIEW_CAMERA.LOOK_DISTANCE * dirSign,
    },
  };
}

// ── Player / Marker 位置計算 ────────────────────────────

/** 2D 位置の線形補間 */
export function lerpPosition(
  current: Point2D,
  target: Point2D,
  coefficient: number,
): Point2D {
  return {
    x: current.x + (target.x - current.x) * coefficient,
    z: current.z + (target.z - current.z) * coefficient,
  };
}

/** ドラッグ終了位置をクリアすべきかを判定 */
export function shouldClearDragEndPos(
  targetPos: Point2D,
  dragEndPos: Point2D,
  threshold: number = 0.01,
): boolean {
  return (
    Math.abs(targetPos.x - dragEndPos.x) < threshold &&
    Math.abs(targetPos.z - dragEndPos.z) < threshold
  );
}

/** 選択リングのパルスアニメーション値を算出 */
export function computeSelectionRingPulse(time: number): {
  scale: number;
  opacity: number;
} {
  return {
    scale:
      1 +
      Math.sin(time * ANIMATION.PULSE_FREQUENCY) * ANIMATION.PULSE_AMPLITUDE,
    opacity:
      ANIMATION.OPACITY_BASE +
      Math.sin(time * ANIMATION.OPACITY_FREQUENCY) *
        ANIMATION.OPACITY_AMPLITUDE,
  };
}

// ── OpponentMarker 色計算 ───────────────────────────────

/** ベースカラーから emissive 色を導出 (RGB × factor) */
export function deriveEmissiveColor(
  hexColor: string,
  factor: number = 0.4,
): string {
  const c = new Color(hexColor);
  const emissiveC = c.clone().multiplyScalar(factor);
  return `#${emissiveC.getHexString()}`;
}

/** ベースカラーから disk / emissive / text 色セットを導出 */
export function deriveOpponentColors(base?: string): {
  disk: string;
  emissive: string;
  text: string;
} {
  if (!base) {
    return { disk: "#1e1e1e", emissive: "#111111", text: "#cccccc" };
  }
  return {
    disk: base,
    emissive: deriveEmissiveColor(base),
    text: "#ffffff",
  };
}

// ── ジオメトリユーティリティ ────────────────────────────

/** 2点間の角度を算出 (atan2(dx, dz)) */
export function computeLineAngle(start: Point2D, end: Point2D): number {
  return Math.atan2(end.x - start.x, end.z - start.z);
}

/** 2点の中点を算出 */
export function computeMidpoint(start: Point2D, end: Point2D): Point2D {
  return {
    x: (start.x + end.x) / 2,
    z: (start.z + end.z) / 2,
  };
}

/** 2点間の距離を算出 */
export function computeLineLength(start: Point2D, end: Point2D): number {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// ── Multi-select utilities ──

const _projectVec = new Vector3();

/**
 * ワールド座標を Canvas 上のピクセル座標 (CSS px) に射影する。
 * 返り値は Canvas 要素の左上を原点とした { x, y }。
 */
export function projectWorldToScreen(
  worldX: number,
  worldZ: number,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number } {
  _projectVec.set(worldX, 0, worldZ);
  _projectVec.project(camera);
  return {
    x: ((_projectVec.x + 1) / 2) * canvasWidth,
    y: ((-_projectVec.y + 1) / 2) * canvasHeight,
  };
}
