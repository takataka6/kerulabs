/**
 * @module PitchMarkings
 * @description ピッチマーキングの3Dコンポーネント。グラウンド面・外枠・センターライン・サークルなどの共通マーキングをレンダリングする。
 */
import { memo, useMemo } from "react";
import { CanvasTexture } from "three";
import { LINE_Y, LINE_OPACITY, circlePoints } from "./pitchHelpers";

/**
 * 全ピッチ共通の基本マーキング（グラウンド面・外枠・センターライン・サークル・スポット）。
 *
 * 各 Pitch コンポーネント (Football / SmallSided / Futsal) はこのコンポーネントを
 * 土台として描画し、ゴールエリア等の固有マーキングを追加する。
 *
 * @param props.fieldWidth - Total field width (3D units).
 * @param props.fieldLength - Total field length (3D units).
 * @param props.halfWidth - Half of field width.
 * @param props.halfLength - Half of field length.
 * @param props.centerCircleRadius - Center circle radius (3D units).
 * @param props.centerSpotRadius - Center spot radius (default 0.05).
 * @param props.pitchColor - Ground color (default "#16a34a").
 * @param props.pitchOpacity - Ground opacity (default 1).
 */
export const PitchMarkings = memo(function PitchMarkings({
  fieldWidth,
  fieldLength,
  halfWidth,
  halfLength,
  centerCircleRadius,
  centerSpotRadius = 0.05,
  pitchColor,
  pitchOpacity,
}: {
  fieldWidth: number;
  fieldLength: number;
  halfWidth: number;
  halfLength: number;
  centerCircleRadius: number;
  centerSpotRadius?: number;
  pitchColor?: string;
  pitchOpacity?: number;
}) {
  const pitchTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const radial = ctx.createRadialGradient(256, 250, 12, 256, 256, 256);
    radial.addColorStop(0, "rgba(255,255,255,0.05)");
    radial.addColorStop(0.55, "rgba(255,255,255,0.015)");
    radial.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const diagonal = ctx.createLinearGradient(0, 0, 280, 280);
    diagonal.addColorStop(0, "rgba(255,255,255,0.08)");
    diagonal.addColorStop(0.32, "rgba(255,255,255,0.02)");
    diagonal.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = diagonal;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new CanvasTexture(canvas);
  }, []);

  return (
    <>
      {/* グラウンド */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[fieldWidth, fieldLength]} />
        <meshStandardMaterial
          color={pitchColor || "#16a34a"}
          transparent
          opacity={pitchOpacity ?? 1}
          roughness={0.94}
          metalness={0.04}
          emissive={pitchColor || "#16a34a"}
          emissiveIntensity={0.03}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      {pitchTexture && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
          <planeGeometry args={[fieldWidth, fieldLength]} />
          <meshBasicMaterial
            map={pitchTexture}
            transparent
            opacity={Math.min(0.42, (pitchOpacity ?? 1) * 0.42)}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* タッチライン・ゴールライン（外枠） */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={5}
              array={
                new Float32Array([
                  -halfWidth,
                  0,
                  -halfLength,
                  -halfWidth,
                  0,
                  halfLength,
                  halfWidth,
                  0,
                  halfLength,
                  halfWidth,
                  0,
                  -halfLength,
                  -halfWidth,
                  0,
                  -halfLength,
                ])
              }
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* センターライン */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-halfWidth, 0, 0, halfWidth, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* センターサークル */}
      <group position={[0, LINE_Y, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={65}
              array={circlePoints(centerCircleRadius)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
        </line>
      </group>

      {/* センタースポット */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LINE_Y + 0.001, 0]}>
        <circleGeometry args={[centerSpotRadius, 16]} />
        <meshBasicMaterial color="white" transparent opacity={LINE_OPACITY} />
      </mesh>
    </>
  );
});
