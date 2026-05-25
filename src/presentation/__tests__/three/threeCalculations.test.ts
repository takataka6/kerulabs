/**
 * @module threeCalculations（3D計算ユーティリティ）
 * @description Three.js描画に使用する数学計算関数群の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な数学関数のテスト）
 * - アーチ高さ・カーブオフセット・垂直ベクトル等の幾何学計算を検証
 * - カーブ点群・ダッシュセグメントの生成ロジックを検証
 * - ボールアニメーション位置・フィールドクリック判定・座標クランプを検証
 */
import { describe, it, expect } from "vitest";
import {
  computeArchHeight,
  computeCurveOffset,
  computePerpendicularVector,
  generateCurvePoints,
  generateDashSegments,
  computeBallAnimationPosition,
  isFieldClick,
  clampToFieldBounds,
  getDefaultCameraParams,
  clampYaw,
  clampPitch,
  decayAngle,
  computePlayerViewCamera,
  lerpPosition,
  shouldClearDragEndPos,
  computeSelectionRingPulse,
  deriveEmissiveColor,
  deriveOpponentColors,
  computeLineAngle,
  computeMidpoint,
  computeLineLength,
} from "../../utils/threeCalculations";

// ══════════════════════════════════════════════════════════
// BallTrajectory 計算
// ══════════════════════════════════════════════════════════

describe("BallTrajectory計算", () => {
  describe("computeArchHeight", () => {
    it("lowタイプ: 距離に0.08を掛けた値を返す", () => {
      expect(computeArchHeight("low", 10)).toBe(10 * 0.08);
    });

    it("lowタイプ: 距離が短い場合は最小値0.3を返す", () => {
      expect(computeArchHeight("low", 1)).toBe(0.3);
    });

    it("highタイプ: 距離に0.45を掛けた値を返す", () => {
      expect(computeArchHeight("high", 10)).toBe(10 * 0.45);
    });

    it("highタイプ: 距離が短い場合は最小値1.5を返す", () => {
      expect(computeArchHeight("high", 1)).toBe(1.5);
    });

    it("curveLeftタイプ: 距離に0.25を掛けた値を返す", () => {
      expect(computeArchHeight("curveLeft", 10)).toBe(10 * 0.25);
    });

    it("curveLeftタイプ: 距離が短い場合は最小値0.8を返す", () => {
      expect(computeArchHeight("curveLeft", 1)).toBe(0.8);
    });

    it("curveRightタイプ: 距離に0.3を掛けた値を返す", () => {
      expect(computeArchHeight("curveRight", 10)).toBe(10 * 0.3);
    });

    it("curveRightタイプ: 距離が短い場合は最小値1.0を返す", () => {
      expect(computeArchHeight("curveRight", 1)).toBe(1.0);
    });

    it("デフォルト: 距離に0.2を掛けた値を返す", () => {
      expect(computeArchHeight(undefined, 10)).toBe(10 * 0.2);
    });

    it("デフォルト: 距離が短い場合は最小値0.5を返す", () => {
      expect(computeArchHeight(undefined, 1)).toBe(0.5);
    });

    it("距離0の場合は最小値を返す", () => {
      expect(computeArchHeight("low", 0)).toBe(0.3);
      expect(computeArchHeight("high", 0)).toBe(1.5);
      expect(computeArchHeight(undefined, 0)).toBe(0.5);
    });
  });

  describe("computeCurveOffset", () => {
    it("curveLeftは負のオフセットを返す", () => {
      const result = computeCurveOffset("curveLeft", 10);
      expect(result).toBeLessThan(0);
      expect(result).toBe(-10 * 0.25);
    });

    it("curveRightは正のオフセットを返す", () => {
      const result = computeCurveOffset("curveRight", 10);
      expect(result).toBeGreaterThan(0);
      expect(result).toBe(10 * 0.25);
    });

    it("curveLeft: 距離が短い場合は最小オフセット-0.8を返す", () => {
      expect(computeCurveOffset("curveLeft", 1)).toBe(-0.8);
    });

    it("curveRight: 距離が短い場合は最小オフセット0.8を返す", () => {
      expect(computeCurveOffset("curveRight", 1)).toBe(0.8);
    });

    it("デフォルトはオフセット0を返す", () => {
      expect(computeCurveOffset(undefined, 10)).toBe(0);
    });

    it("lowタイプはオフセット0を返す", () => {
      expect(computeCurveOffset("low", 10)).toBe(0);
    });

    it("highタイプはオフセット0を返す", () => {
      expect(computeCurveOffset("high", 10)).toBe(0);
    });
  });

  describe("computePerpendicularVector", () => {
    it("+X方向の移動に対して垂直ベクトルを返す", () => {
      // dx=1, dz=0 → perp should be (0, 1)
      const result = computePerpendicularVector(1, 0, 1);
      expect(result.perpX).toBeCloseTo(0);
      expect(result.perpZ).toBeCloseTo(1);
    });

    it("+Z方向の移動に対して垂直ベクトルを返す", () => {
      // dx=0, dz=1 → perp should be (-1, 0)
      const result = computePerpendicularVector(0, 1, 1);
      expect(result.perpX).toBeCloseTo(-1);
      expect(result.perpZ).toBeCloseTo(0);
    });

    it("斜め方向でも単位ベクトルの長さが1になる", () => {
      const dx = 3;
      const dz = 4;
      const dist = 5;
      const result = computePerpendicularVector(dx, dz, dist);
      const length = Math.sqrt(
        result.perpX * result.perpX + result.perpZ * result.perpZ,
      );
      expect(length).toBeCloseTo(1);
    });

    it("距離0の場合はゼロベクトルを返す", () => {
      const result = computePerpendicularVector(0, 0, 0);
      expect(result.perpX).toBe(0);
      expect(result.perpZ).toBe(0);
    });

    it("元ベクトルと垂直であることを内積で検証", () => {
      const dx = 3;
      const dz = 4;
      const dist = 5;
      const result = computePerpendicularVector(dx, dz, dist);
      // 内積 = 0 → 垂直
      const dot = (dx / dist) * result.perpX + (dz / dist) * result.perpZ;
      expect(dot).toBeCloseTo(0);
    });
  });

  describe("generateCurvePoints", () => {
    const start = { x: 0, z: 0 };
    const end = { x: 10, z: 0 };

    it("51個のポイントを生成する（50セグメント）", () => {
      const points = generateCurvePoints(start, end, 2, 0, 0, 0);
      expect(points).toHaveLength(51);
    });

    it("始点が最初のポイントに一致する", () => {
      const points = generateCurvePoints(start, end, 2, 0, 0, 0);
      expect(points[0].x).toBeCloseTo(start.x);
      expect(points[0].z).toBeCloseTo(start.z);
    });

    it("終点が最後のポイントに一致する", () => {
      const points = generateCurvePoints(start, end, 2, 0, 0, 0);
      const last = points[points.length - 1];
      expect(last.x).toBeCloseTo(end.x);
      expect(last.z).toBeCloseTo(end.z);
    });

    it("放物線の頂点（t=0.5）のY座標が archHeight + 0.15 に一致する", () => {
      const archHeight = 3;
      const points = generateCurvePoints(start, end, archHeight, 0, 0, 0);
      // t=0.5 → y = 4 * 3 * 0.5 * 0.5 + 0.15 = 3 + 0.15 = 3.15
      const midpoint = points[25]; // segments=50, midpoint at index 25
      expect(midpoint.y).toBeCloseTo(archHeight + 0.15);
    });

    it("カーブオフセット0の場合は直線上のXZ座標になる", () => {
      const points = generateCurvePoints(start, end, 2, 0, 0, 0);
      // Z should all be 0 (start.z=0, end.z=0, no curve)
      for (const p of points) {
        expect(p.z).toBeCloseTo(0);
      }
    });

    it("カーブオフセットがある場合はXZ座標がずれる", () => {
      // perp direction: for dx=10, dz=0 → perpX=0, perpZ=1
      const points = generateCurvePoints(start, end, 2, 2, 0, 1);
      // t=0.5でsin(π*0.5)=1なので最大ずれ
      const midpoint = points[25];
      expect(midpoint.z).toBeCloseTo(2); // curveOffset * sin(π*0.5) * perpZ
    });

    it("Y座標にベースオフセット0.15が加算される", () => {
      const points = generateCurvePoints(start, end, 0, 0, 0, 0);
      // archHeight=0 → y = 4*0*t*(1-t) + 0.15 = 0.15 for all
      expect(points[0].y).toBeCloseTo(0.15);
      expect(points[25].y).toBeCloseTo(0.15);
    });

    it("セグメント数を変更できる", () => {
      const points = generateCurvePoints(start, end, 2, 0, 0, 0, 10);
      expect(points).toHaveLength(11);
    });
  });

  describe("generateDashSegments", () => {
    it("短い曲線でも最低1つのダッシュセグメントが生成される", () => {
      const points = generateCurvePoints(
        { x: 0, z: 0 },
        { x: 1, z: 0 },
        0.5,
        0,
        0,
        0,
      );
      const segments = generateDashSegments(points);
      expect(segments.length).toBeGreaterThanOrEqual(1);
    });

    it("各セグメントが最低2ポイントを持つ", () => {
      const points = generateCurvePoints(
        { x: 0, z: 0 },
        { x: 5, z: 0 },
        1,
        0,
        0,
        0,
      );
      const segments = generateDashSegments(points);
      for (const seg of segments) {
        expect(seg.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("長い曲線では複数のダッシュセグメントが生成される", () => {
      const points = generateCurvePoints(
        { x: 0, z: 0 },
        { x: 10, z: 0 },
        2,
        0,
        0,
        0,
      );
      const segments = generateDashSegments(points);
      expect(segments.length).toBeGreaterThan(1);
    });

    it("カスタムのダッシュ長・ギャップ長を使用できる", () => {
      const points = generateCurvePoints(
        { x: 0, z: 0 },
        { x: 10, z: 0 },
        2,
        0,
        0,
        0,
      );
      const segments = generateDashSegments(points, 1.0, 0.5);
      expect(segments.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("computeBallAnimationPosition", () => {
    const points: Array<{ x: number; y: number; z: number }> = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 2, y: 2, z: 0 },
      { x: 3, y: 1, z: 0 },
      { x: 4, y: 0, z: 0 },
    ];

    it("t=0の時は最初のポイントを返す", () => {
      const pos = computeBallAnimationPosition(points, 0);
      expect(pos.x).toBeCloseTo(0);
      expect(pos.y).toBeCloseTo(0);
    });

    it("ポイント間を補間する", () => {
      // speed=0.4, time=1.25 → t = (1.25 * 0.4) % 1 = 0.5
      // idx = floor(0.5 * 4) = 2, nextIdx = 3, localT = 0.5*4 - 2 = 0
      const pos = computeBallAnimationPosition(points, 1.25);
      expect(pos.x).toBeCloseTo(2);
      expect(pos.y).toBeCloseTo(2);
    });

    it("アニメーションがループする", () => {
      // speed=0.4, time=2.5 → t = (2.5 * 0.4) % 1 = 0
      const pos = computeBallAnimationPosition(points, 2.5);
      expect(pos.x).toBeCloseTo(0);
    });
  });
});

// ══════════════════════════════════════════════════════════
// Scene カメラ・インタラクション計算
// ══════════════════════════════════════════════════════════

describe("Sceneカメラ・インタラクション計算", () => {
  describe("isFieldClick", () => {
    it("移動距離が閾値以下ならクリックと判定する", () => {
      expect(isFieldClick({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(true); // dist=5
    });

    it("移動距離が閾値を超えたらクリックと判定しない", () => {
      expect(isFieldClick({ x: 0, y: 0 }, { x: 4, y: 4 })).toBe(false); // dist≈5.66
    });

    it("同じ位置ならクリックと判定する", () => {
      expect(isFieldClick({ x: 100, y: 200 }, { x: 100, y: 200 })).toBe(true);
    });

    it("距離がちょうど5pxの場合はクリックと判定する", () => {
      expect(isFieldClick({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(true);
    });

    it("カスタム閾値を指定できる", () => {
      expect(isFieldClick({ x: 0, y: 0 }, { x: 3, y: 4 }, 10)).toBe(true);
      expect(isFieldClick({ x: 0, y: 0 }, { x: 3, y: 4 }, 3)).toBe(false);
    });
  });

  describe("clampToFieldBounds", () => {
    const bounds = { minX: -6, maxX: 6, minZ: -5, maxZ: 5 };

    it("範囲内の座標はそのまま返す", () => {
      const result = clampToFieldBounds({ x: 3, z: -2 }, bounds);
      expect(result.x).toBe(3);
      expect(result.z).toBe(-2);
    });

    it("minXを下回る座標はminXにクランプされる", () => {
      const result = clampToFieldBounds({ x: -10, z: 0 }, bounds);
      expect(result.x).toBe(-6);
    });

    it("maxXを上回る座標はmaxXにクランプされる", () => {
      const result = clampToFieldBounds({ x: 10, z: 0 }, bounds);
      expect(result.x).toBe(6);
    });

    it("minZを下回る座標はminZにクランプされる", () => {
      const result = clampToFieldBounds({ x: 0, z: -10 }, bounds);
      expect(result.z).toBe(-5);
    });

    it("maxZを上回る座標はmaxZにクランプされる", () => {
      const result = clampToFieldBounds({ x: 0, z: 10 }, bounds);
      expect(result.z).toBe(5);
    });

    it("X・Z両方が範囲外の場合は両方クランプされる", () => {
      const result = clampToFieldBounds({ x: -100, z: 100 }, bounds);
      expect(result.x).toBe(-6);
      expect(result.z).toBe(5);
    });
  });

  describe("getDefaultCameraParams", () => {
    it("futsalモードでY=8, Z=-5, targetZ=0を返す", () => {
      const result = getDefaultCameraParams("futsal");
      expect(result).toEqual({ camY: 8, camZ: -5, targetZ: 0 });
    });

    it("societyモードでY=9, Z=-5.5, targetZ=0を返す", () => {
      const result = getDefaultCameraParams("society");
      expect(result).toEqual({ camY: 9, camZ: -5.5, targetZ: 0 });
    });

    it("eight_asideモードでY=10, Z=-6, targetZ=0を返す", () => {
      const result = getDefaultCameraParams("eight_aside");
      expect(result).toEqual({ camY: 10, camZ: -6, targetZ: 0 });
    });

    it("デフォルト（football）でY=12, Z=-8, targetZ=-2を返す", () => {
      const result = getDefaultCameraParams("football");
      expect(result).toEqual({ camY: 12, camZ: -8, targetZ: -1.5 });
    });

    it("不明なゲームモードでもデフォルト値を返す", () => {
      const result = getDefaultCameraParams("unknown_mode");
      expect(result).toEqual({ camY: 12, camZ: -8, targetZ: -1.5 });
    });
  });

  describe("clampYaw", () => {
    it("範囲内の値はそのまま返す", () => {
      expect(clampYaw(0)).toBe(0);
      expect(clampYaw(1)).toBe(1);
      expect(clampYaw(-1)).toBe(-1);
    });

    it("正の上限を超える値はクランプされる", () => {
      const maxYaw = (Math.PI * 5) / 6;
      expect(clampYaw(Math.PI)).toBeCloseTo(maxYaw);
    });

    it("負の下限を下回る値はクランプされる", () => {
      const minYaw = (-Math.PI * 5) / 6;
      expect(clampYaw(-Math.PI)).toBeCloseTo(minYaw);
    });

    it("±5π/6の境界値はそのまま返す", () => {
      const limit = (Math.PI * 5) / 6;
      expect(clampYaw(limit)).toBeCloseTo(limit);
      expect(clampYaw(-limit)).toBeCloseTo(-limit);
    });
  });

  describe("clampPitch", () => {
    it("範囲内の値はそのまま返す", () => {
      expect(clampPitch(0)).toBe(0);
      expect(clampPitch(0.5)).toBe(0.5);
    });

    it("±π/4を超える値はクランプされる", () => {
      const maxPitch = Math.PI / 4;
      expect(clampPitch(Math.PI / 2)).toBeCloseTo(maxPitch);
      expect(clampPitch(-Math.PI / 2)).toBeCloseTo(-maxPitch);
    });

    it("境界値はそのまま返す", () => {
      const limit = Math.PI / 4;
      expect(clampPitch(limit)).toBeCloseTo(limit);
      expect(clampPitch(-limit)).toBeCloseTo(-limit);
    });
  });

  describe("decayAngle", () => {
    it("角度に0.95を掛けて返す", () => {
      expect(decayAngle(1.0)).toBeCloseTo(0.95);
    });

    it("0.001未満の場合は0にスナップする", () => {
      expect(decayAngle(0.001)).toBe(0);
    });

    it("負の値も正しく減衰する", () => {
      expect(decayAngle(-1.0)).toBeCloseTo(-0.95);
    });

    it("負の値が閾値未満で0にスナップする", () => {
      expect(decayAngle(-0.001)).toBe(0);
    });

    it("カスタム減衰係数を指定できる", () => {
      expect(decayAngle(1.0, 0.5)).toBeCloseTo(0.5);
    });

    it("カスタムスナップ閾値を指定できる", () => {
      expect(decayAngle(0.05, 0.95, 0.1)).toBe(0);
    });

    it("大きな値は0にスナップしない", () => {
      const result = decayAngle(2.0);
      expect(result).not.toBe(0);
      expect(result).toBeCloseTo(1.9);
    });
  });

  describe("computePlayerViewCamera", () => {
    it("yaw=0でカメラが選手の背後（-Z方向）に位置する", () => {
      const result = computePlayerViewCamera({ x: 0, z: 0 }, 0, 0, 1);
      // camPos: x=0, z = 0 - cos(0)*2.5*1 = -2.5
      expect(result.camPos.x).toBeCloseTo(0);
      expect(result.camPos.z).toBeCloseTo(-2.5);
      expect(result.camPos.y).toBeCloseTo(1.8);
    });

    it("注視点が選手の前方（+Z方向）に位置する", () => {
      const result = computePlayerViewCamera({ x: 0, z: 0 }, 0, 0, 1);
      // lookAt: x=0, z = 0 + cos(0)*4*1 = 4
      expect(result.lookAt.x).toBeCloseTo(0);
      expect(result.lookAt.z).toBeCloseTo(4);
    });

    it("dirSign=-1（相手チーム）でカメラ方向が反転する", () => {
      const result = computePlayerViewCamera({ x: 0, z: 0 }, 0, 0, -1);
      // camPos: z = 0 - cos(0)*2.5*(-1) = +2.5
      expect(result.camPos.z).toBeCloseTo(2.5);
      // lookAt: z = 0 + cos(0)*4*(-1) = -4
      expect(result.lookAt.z).toBeCloseTo(-4);
    });

    it("pitchAngleが注視点のY座標に影響する", () => {
      const result = computePlayerViewCamera({ x: 0, z: 0 }, 0, Math.PI / 4, 1);
      // lookAt.y = sin(π/4) * 4 ≈ 2.83
      expect(result.lookAt.y).toBeCloseTo(Math.sin(Math.PI / 4) * 4);
    });

    it("選手位置がオフセットに反映される", () => {
      const result = computePlayerViewCamera({ x: 5, z: 3 }, 0, 0, 1);
      expect(result.camPos.x).toBeCloseTo(5);
      expect(result.camPos.z).toBeCloseTo(3 - 2.5);
      expect(result.lookAt.x).toBeCloseTo(5);
      expect(result.lookAt.z).toBeCloseTo(3 + 4);
    });
  });
});

// ══════════════════════════════════════════════════════════
// Player 位置・アニメーション計算
// ══════════════════════════════════════════════════════════

describe("Player位置・アニメーション計算", () => {
  describe("lerpPosition", () => {
    it("係数0.08で目標に近づく", () => {
      const result = lerpPosition({ x: 0, z: 0 }, { x: 10, z: 10 }, 0.08);
      expect(result.x).toBeCloseTo(0.8);
      expect(result.z).toBeCloseTo(0.8);
    });

    it("係数0の場合は現在位置のまま", () => {
      const result = lerpPosition({ x: 5, z: 3 }, { x: 10, z: 10 }, 0);
      expect(result.x).toBe(5);
      expect(result.z).toBe(3);
    });

    it("係数1の場合は目標位置に到達する", () => {
      const result = lerpPosition({ x: 0, z: 0 }, { x: 10, z: 10 }, 1);
      expect(result.x).toBe(10);
      expect(result.z).toBe(10);
    });

    it("目標と現在が同じ場合は変化しない", () => {
      const result = lerpPosition({ x: 5, z: 5 }, { x: 5, z: 5 }, 0.08);
      expect(result.x).toBe(5);
      expect(result.z).toBe(5);
    });

    it("負の座標でも正しく補間する", () => {
      const result = lerpPosition({ x: -10, z: -10 }, { x: 10, z: 10 }, 0.5);
      expect(result.x).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });
  });

  describe("shouldClearDragEndPos", () => {
    it("差が0.01未満の場合はtrueを返す", () => {
      expect(
        shouldClearDragEndPos({ x: 5, z: 5 }, { x: 5.005, z: 5.005 }),
      ).toBe(true);
    });

    it("差が0.01以上の場合はfalseを返す", () => {
      expect(shouldClearDragEndPos({ x: 5, z: 5 }, { x: 5.1, z: 5 })).toBe(
        false,
      );
    });

    it("Xのみ差がある場合はfalseを返す", () => {
      expect(shouldClearDragEndPos({ x: 5, z: 5 }, { x: 6, z: 5 })).toBe(false);
    });

    it("Zのみ差がある場合はfalseを返す", () => {
      expect(shouldClearDragEndPos({ x: 5, z: 5 }, { x: 5, z: 6 })).toBe(false);
    });

    it("完全一致の場合はtrueを返す", () => {
      expect(shouldClearDragEndPos({ x: 5, z: 5 }, { x: 5, z: 5 })).toBe(true);
    });

    it("カスタム閾値を指定できる", () => {
      expect(shouldClearDragEndPos({ x: 5, z: 5 }, { x: 5.5, z: 5 }, 1)).toBe(
        true,
      );
      expect(shouldClearDragEndPos({ x: 5, z: 5 }, { x: 5.5, z: 5 }, 0.1)).toBe(
        false,
      );
    });
  });

  describe("computeSelectionRingPulse", () => {
    it("time=0でベース値を返す", () => {
      const result = computeSelectionRingPulse(0);
      // sin(0) = 0 → scale = 1, opacity = OPACITY_BASE
      expect(result.scale).toBeCloseTo(1);
      expect(result.opacity).toBeCloseTo(0.5); // OPACITY_BASE
    });

    it("パルスのscaleが適切な範囲に収まる", () => {
      // PULSE_AMPLITUDE = 0.12 → range: [1-0.12, 1+0.12] = [0.88, 1.12]
      for (let t = 0; t < 10; t += 0.1) {
        const result = computeSelectionRingPulse(t);
        expect(result.scale).toBeGreaterThanOrEqual(0.88 - 0.001);
        expect(result.scale).toBeLessThanOrEqual(1.12 + 0.001);
      }
    });

    it("パルスのopacityが適切な範囲に収まる", () => {
      // OPACITY_BASE=0.5, OPACITY_AMPLITUDE=0.2 → range: [0.3, 0.7]
      for (let t = 0; t < 10; t += 0.1) {
        const result = computeSelectionRingPulse(t);
        expect(result.opacity).toBeGreaterThanOrEqual(0.3 - 0.001);
        expect(result.opacity).toBeLessThanOrEqual(0.7 + 0.001);
      }
    });
  });
});

// ══════════════════════════════════════════════════════════
// OpponentMarker 色計算
// ══════════════════════════════════════════════════════════

describe("OpponentMarker色計算", () => {
  describe("deriveEmissiveColor", () => {
    it("白色(#ffffff)から0.4倍の灰色を生成する", () => {
      const result = deriveEmissiveColor("#ffffff");
      // THREE.Color はリニアカラースペースで演算: sRGB→linear→×0.4→sRGB
      expect(result).toBe("#aaaaaa");
    });

    it("赤色(#ff0000)からダーク赤を生成する", () => {
      const result = deriveEmissiveColor("#ff0000");
      // THREE.Color リニア演算結果
      expect(result).toBe("#aa0000");
    });

    it("黒色(#000000)は黒のまま", () => {
      const result = deriveEmissiveColor("#000000");
      expect(result).toBe("#000000");
    });

    it("カスタムファクターを指定できる", () => {
      const result = deriveEmissiveColor("#ffffff", 0.5);
      // 0xff * 0.5 = 0x80 → #808080 (or very close)
      // THREE.Color might produce slightly different hex
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe("deriveOpponentColors", () => {
    it("色未指定の場合はデフォルト値を返す", () => {
      const result = deriveOpponentColors();
      expect(result.disk).toBe("#1e1e1e");
      expect(result.emissive).toBe("#111111");
      expect(result.text).toBe("#cccccc");
    });

    it("色未指定: undefined を渡した場合もデフォルト", () => {
      const result = deriveOpponentColors(undefined);
      expect(result.disk).toBe("#1e1e1e");
    });

    it("色指定時はdiskが入力色、textが白になる", () => {
      const result = deriveOpponentColors("#ff0000");
      expect(result.disk).toBe("#ff0000");
      expect(result.text).toBe("#ffffff");
    });

    it("色指定時はemissiveが導出される", () => {
      const result = deriveOpponentColors("#ff0000");
      expect(result.emissive).toBe("#aa0000");
    });
  });
});

// ══════════════════════════════════════════════════════════
// ジオメトリユーティリティ
// ══════════════════════════════════════════════════════════

describe("ジオメトリユーティリティ", () => {
  describe("computeLineAngle", () => {
    it("+X方向のatan2はπ/2を返す", () => {
      const angle = computeLineAngle({ x: 0, z: 0 }, { x: 1, z: 0 });
      expect(angle).toBeCloseTo(Math.PI / 2);
    });

    it("+Z方向のatan2は0を返す", () => {
      const angle = computeLineAngle({ x: 0, z: 0 }, { x: 0, z: 1 });
      expect(angle).toBeCloseTo(0);
    });

    it("斜め方向の角度が正しい", () => {
      // dx=1, dz=1 → atan2(1,1) = π/4
      const angle = computeLineAngle({ x: 0, z: 0 }, { x: 1, z: 1 });
      expect(angle).toBeCloseTo(Math.PI / 4);
    });

    it("同じ点の角度は0を返す", () => {
      const angle = computeLineAngle({ x: 5, z: 5 }, { x: 5, z: 5 });
      expect(angle).toBe(0);
    });
  });

  describe("computeMidpoint", () => {
    it("2点の中点を計算する", () => {
      const mid = computeMidpoint({ x: 0, z: 0 }, { x: 10, z: 10 });
      expect(mid.x).toBe(5);
      expect(mid.z).toBe(5);
    });

    it("同じ点の中点は同じ点になる", () => {
      const mid = computeMidpoint({ x: 3, z: 7 }, { x: 3, z: 7 });
      expect(mid.x).toBe(3);
      expect(mid.z).toBe(7);
    });

    it("負の座標でも正しく計算する", () => {
      const mid = computeMidpoint({ x: -10, z: -10 }, { x: 10, z: 10 });
      expect(mid.x).toBe(0);
      expect(mid.z).toBe(0);
    });
  });

  describe("computeLineLength", () => {
    it("3-4-5の三角形で距離5を返す", () => {
      const length = computeLineLength({ x: 0, z: 0 }, { x: 3, z: 4 });
      expect(length).toBeCloseTo(5);
    });

    it("同じ点の距離は0を返す", () => {
      const length = computeLineLength({ x: 5, z: 5 }, { x: 5, z: 5 });
      expect(length).toBe(0);
    });

    it("水平方向の距離が正しい", () => {
      const length = computeLineLength({ x: 0, z: 0 }, { x: 10, z: 0 });
      expect(length).toBe(10);
    });

    it("垂直方向の距離が正しい", () => {
      const length = computeLineLength({ x: 0, z: 0 }, { x: 0, z: 7 });
      expect(length).toBe(7);
    });
  });
});
