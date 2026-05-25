/**
 * @module SmallSidedPitch
 * @description 少人数制ピッチの3Dジオメトリコンポーネント。小規模コート規格のライン・エリアマーキングをレンダリングする。
 */
import { memo } from "react";
import type { PitchConfig } from "@shared/constants/pitchConfig";
import { PitchMarkings } from "./PitchMarkings";
import { LINE_Y, LINE_OPACITY, rectPoints } from "./pitchHelpers";

interface SmallSidedPitchProps {
  config: PitchConfig;
  pitchColor?: string;
  pitchOpacity?: number;
}

export const SmallSidedPitch = memo(function SmallSidedPitch({
  config,
  pitchColor,
  pitchOpacity,
}: SmallSidedPitchProps) {
  const { halfWidth: hw, halfLength: hl, fieldLength: fl } = config;

  // ペナルティエリア比率（11人制基準: 40.32/68幅, 16.5/105奥行き）
  const paHalfW = (40.32 / 68) * hw;
  const paD = (16.5 / 105) * fl;

  // ゴールエリア比率
  const gaHalfW = (18.32 / 68) * hw;
  const gaD = (5.5 / 105) * fl;

  // PKスポット
  const pkSpotD = (11 / 105) * fl;

  // センターサークル半径
  const centerR = Math.min(hw, hl) * 0.2;

  return (
    <group>
      <PitchMarkings
        {...config}
        centerCircleRadius={centerR}
        pitchColor={pitchColor}
        pitchOpacity={pitchOpacity}
      />

      {/* ===== +Z側（前方ゴール）===== */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, paHalfW, paD, hl, 1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, gaHalfW, gaD, hl, 1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, hl - pkSpotD]}
      >
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>

      {/* ===== -Z側（後方ゴール）===== */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, paHalfW, paD, -hl, -1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, gaHalfW, gaD, -hl, -1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, -(hl - pkSpotD)]}
      >
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>
    </group>
  );
});
