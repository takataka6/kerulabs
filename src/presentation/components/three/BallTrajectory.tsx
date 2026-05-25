/**
 * @module BallTrajectory
 * @description ボールの飛行軌道を表示する3Dコンポーネント。曲線パスとアニメーションでパス軌跡を可視化する。
 */
import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  DoubleSide,
  Vector3,
  type Mesh,
} from "three";
import {
  computeArchHeight,
  computeCurveOffset,
  computePerpendicularVector,
  generateCurvePoints as generateCurvePointsRaw,
  generateDashSegments as generateDashSegmentsRaw,
  computeBallAnimationPosition,
} from "@presentation/utils/threeCalculations";
import { TRAJECTORY } from "@shared/constants/threeConstants";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";

interface BallTrajectoryProps {
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
  trajectoryType?: string;
}

export const BallTrajectory = memo(function BallTrajectory({
  start,
  end,
  color,
  trajectoryType,
}: BallTrajectoryProps) {
  const ballRef = useRef<Mesh>(null);
  // フレーム毎のGC負荷を避けるため事前確保
  const lerpPosRef = useRef(new Vector3());

  const { dx, dz, distance } = useMemo(() => {
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    return { dx, dz, distance: Math.sqrt(dx * dx + dz * dz) };
  }, [start.x, start.z, end.x, end.z]);

  // 弾道タイプに応じたアーチ高さ
  const archHeight = useMemo(
    () => computeArchHeight(trajectoryType, distance),
    [trajectoryType, distance],
  );

  // カーブの横方向オフセット量
  const curveOffset = useMemo(
    () => computeCurveOffset(trajectoryType, distance),
    [trajectoryType, distance],
  );

  // 移動方向に垂直なベクトル（XZ平面上）
  const { perpX, perpZ } = useMemo(
    () => computePerpendicularVector(dx, dz, distance),
    [dx, dz, distance],
  );

  // 放物線カーブ上のポイントを生成
  const curvePoints = useMemo(() => {
    const rawPoints = generateCurvePointsRaw(
      start,
      end,
      archHeight,
      curveOffset,
      perpX,
      perpZ,
    );
    return rawPoints.map((p) => new Vector3(p.x, p.y, p.z));
  }, [start, end, archHeight, curveOffset, perpX, perpZ]);

  // チューブ状の破線セグメント
  const dashTubes = useMemo(() => {
    const rawPoints = curvePoints.map((v) => ({ x: v.x, y: v.y, z: v.z }));
    const segments = generateDashSegmentsRaw(rawPoints);
    return segments.map((seg) => ({
      curve: new CatmullRomCurve3(seg.map((p) => new Vector3(p.x, p.y, p.z))),
    }));
  }, [curvePoints]);

  // ガイドラインの頂点データ（curvePoints 変更時のみ再生成）
  const guidelinePositions = useMemo(
    () => new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z])),
    [curvePoints],
  );

  // ボールのアニメーション（始点→終点の一方向ループ）
  useFrame((state) => {
    if (ballRef.current) {
      const time = state.clock.getElapsedTime();
      const speed = getPlaybackSpeed();
      const rawPoints = curvePoints.map((v) => ({ x: v.x, y: v.y, z: v.z }));
      const pos = computeBallAnimationPosition(
        rawPoints,
        time,
        undefined,
        speed,
      );
      lerpPosRef.current.set(pos.x, pos.y, pos.z);
      ballRef.current.position.copy(lerpPosRef.current);
    }
  });

  return (
    <group>
      {/* チューブ状の破線（放物線アーチ） */}
      {dashTubes.map((tube, i) => (
        <mesh key={i}>
          <tubeGeometry
            args={[
              tube.curve,
              TRAJECTORY.TUBE_SEGMENTS,
              TRAJECTORY.TUBE_RADIUS,
              TRAJECTORY.TUBE_RADIAL_SEGMENTS,
              false,
            ]}
          />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={TRAJECTORY.EMISSIVE_INTENSITY}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* カーブ全体の薄いガイドライン */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={curvePoints.length}
            array={guidelinePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={TRAJECTORY.GUIDELINE_OPACITY}
        />
      </line>

      {/* 始点リング + グロー */}
      <mesh
        position={[start.x, TRAJECTORY.RING_Y, start.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            TRAJECTORY.START_INNER,
            TRAJECTORY.START_OUTER,
            TRAJECTORY.RING_SEGMENTS,
          ]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        position={[start.x, TRAJECTORY.GLOW_Y, start.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry
          args={[TRAJECTORY.GLOW_RADIUS, TRAJECTORY.RING_SEGMENTS]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={TRAJECTORY.GUIDELINE_OPACITY}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* アニメーションボール（カーブ上を移動） */}
      <mesh
        ref={ballRef}
        position={[start.x, TRAJECTORY.BALL_INITIAL_Y, start.z]}
      >
        <sphereGeometry
          args={[
            TRAJECTORY.BALL_RADIUS,
            TRAJECTORY.BALL_SEGMENTS,
            TRAJECTORY.BALL_SEGMENTS,
          ]}
        />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={TRAJECTORY.BALL_EMISSIVE}
          metalness={TRAJECTORY.BALL_METALNESS}
          roughness={TRAJECTORY.BALL_ROUGHNESS}
        />
      </mesh>

      {/* 終点ターゲット（二重リング） */}
      <mesh
        position={[end.x, TRAJECTORY.RING_Y, end.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            TRAJECTORY.END_INNER_1,
            TRAJECTORY.END_OUTER_1,
            TRAJECTORY.RING_SEGMENTS,
          ]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        position={[end.x, TRAJECTORY.END_RING2_Y, end.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            TRAJECTORY.END_INNER_2,
            TRAJECTORY.END_OUTER_2,
            TRAJECTORY.RING_SEGMENTS,
          ]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={TRAJECTORY.END_RING2_OPACITY}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        position={[end.x, TRAJECTORY.GLOW_Y, end.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry
          args={[TRAJECTORY.END_GLOW_RADIUS, TRAJECTORY.RING_SEGMENTS]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={TRAJECTORY.GUIDELINE_OPACITY}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
});
