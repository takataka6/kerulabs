/**
 * @module FutsalPitch
 * @description フットサルピッチの3Dジオメトリコンポーネント。フットサルコート規格のライン・エリアマーキングをレンダリングする。
 */
import { memo } from "react";
import { FUTSAL_CONFIG } from "@shared/constants/pitchConfig";
import { PitchMarkings } from "./PitchMarkings";
import { LINE_Y, LINE_OPACITY, arcPoints } from "./pitchHelpers";

// フットサルコート: X -4〜+4 (幅 25m), Z -3〜+3 (長さ 40m)
// スケール: X = 8/25 = 0.32/m, Z = 6/40 = 0.15/m

// ゴールエリア（半円弧）: 半径 6m → 6 * 0.15 = 0.9 (Z方向スケール)
const GOAL_AREA_RADIUS_X = (6 / 25) * 8; // ≈ 1.92
const GOAL_AREA_RADIUS_Z = (6 / 40) * 6; // ≈ 0.9

// ペナルティスポット: ゴールから 6m
const PK_SPOT_D = (6 / 40) * 6; // ≈ 0.9

// セカンドペナルティスポット: ゴールから 10m
const PK2_SPOT_D = (10 / 40) * 6; // ≈ 1.5

export const FutsalPitch = memo(function FutsalPitch({
  pitchColor,
  pitchOpacity,
}: {
  pitchColor?: string;
  pitchOpacity?: number;
}) {
  const { halfLength: hl } = FUTSAL_CONFIG;

  return (
    <group>
      <PitchMarkings
        {...FUTSAL_CONFIG}
        centerCircleRadius={0.8}
        pitchColor={pitchColor}
        pitchOpacity={pitchOpacity}
      />

      {/* ===== +Z側（前方ゴール）===== */}

      {/* ゴールエリア（半円弧） */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={33}
              array={arcPoints(
                0,
                hl,
                GOAL_AREA_RADIUS_X,
                GOAL_AREA_RADIUS_Z,
                1,
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* ペナルティスポット（第1） */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, hl - PK_SPOT_D]}
      >
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>

      {/* ペナルティスポット（第2） */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, hl - PK2_SPOT_D]}
      >
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>

      {/* ===== -Z側（後方ゴール）===== */}

      {/* ゴールエリア（半円弧） */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={33}
              array={arcPoints(
                0,
                -hl,
                GOAL_AREA_RADIUS_X,
                GOAL_AREA_RADIUS_Z,
                -1,
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* ペナルティスポット（第1） */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, -(hl - PK_SPOT_D)]}
      >
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>

      {/* ペナルティスポット（第2） */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, -(hl - PK2_SPOT_D)]}
      >
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>
    </group>
  );
});
