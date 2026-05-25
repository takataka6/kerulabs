/**
 * @module Pitch
 * @description ピッチの3Dコンポーネント。ゲームモードに応じてサッカー/フットサル/少人数制のピッチを切り替えてレンダリングする。
 */
import { memo } from "react";
import type { GameMode } from "@shared/types/GameMode";
import { FutsalPitch } from "./FutsalPitch";
import { SmallSidedPitch } from "./SmallSidedPitch";
import { PitchMarkings } from "./PitchMarkings";
import { LINE_Y, LINE_OPACITY, rectPoints } from "./pitchHelpers";
import {
  EIGHT_ASIDE_CONFIG,
  SOCIETY_CONFIG,
  FOOTBALL_CONFIG,
} from "@shared/constants/pitchConfig";

// ペナルティエリア: 40.32m幅 × 16.5m奥行き
const PA_HALF_W = (40.32 / 68) * 5; // ≈ 2.96
const PA_D = (16.5 / 105) * 12; // ≈ 1.89

// ゴールエリア: 18.32m幅 × 5.5m奥行き
const GA_HALF_W = (18.32 / 68) * 5; // ≈ 1.35
const GA_D = (5.5 / 105) * 12; // ≈ 0.63

// ペナルティスポット: ゴールから11m
const PK_SPOT_D = (11 / 105) * 12; // ≈ 1.26

/** サッカー用ピッチ（11人制） */
function FootballPitch({
  pitchColor,
  pitchOpacity,
}: {
  pitchColor?: string;
  pitchOpacity?: number;
}) {
  const { halfLength: hl } = FOOTBALL_CONFIG;

  return (
    <group>
      <PitchMarkings
        {...FOOTBALL_CONFIG}
        centerCircleRadius={1.2}
        centerSpotRadius={0.06}
        pitchColor={pitchColor}
        pitchOpacity={pitchOpacity}
      />

      {/* ===== +Z側（前方ゴール）===== */}

      {/* ペナルティエリア */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, PA_HALF_W, PA_D, hl, 1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* ゴールエリア */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, GA_HALF_W, GA_D, hl, 1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* ペナルティスポット */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, hl - PK_SPOT_D]}
      >
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>

      {/* ===== -Z側（後方ゴール）===== */}

      {/* ペナルティエリア */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, PA_HALF_W, PA_D, -hl, -1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* ゴールエリア */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={rectPoints(0, GA_HALF_W, GA_D, -hl, -1)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* ペナルティスポット */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, LINE_Y + 0.001, -(hl - PK_SPOT_D)]}
      >
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>
    </group>
  );
}

/** ゲームモードに応じたピッチを描画 */
export const Pitch = memo(function Pitch({
  gameMode,
  pitchColor,
  pitchOpacity,
}: {
  gameMode?: GameMode;
  pitchColor?: string;
  pitchOpacity?: number;
}) {
  if (gameMode === "futsal")
    return <FutsalPitch pitchColor={pitchColor} pitchOpacity={pitchOpacity} />;
  if (gameMode === "eight_aside")
    return (
      <SmallSidedPitch
        config={EIGHT_ASIDE_CONFIG}
        pitchColor={pitchColor}
        pitchOpacity={pitchOpacity}
      />
    );
  if (gameMode === "society")
    return (
      <SmallSidedPitch
        config={SOCIETY_CONFIG}
        pitchColor={pitchColor}
        pitchOpacity={pitchOpacity}
      />
    );
  return <FootballPitch pitchColor={pitchColor} pitchOpacity={pitchOpacity} />;
});
