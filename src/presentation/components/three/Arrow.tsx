/**
 * @module Arrow
 * @description 3Dシーン上の矢印メッシュコンポーネント。選手の移動方向を示す矢印をレンダリングする。
 */
import { memo, useMemo } from "react";
import { computeLineAngle } from "@presentation/utils/threeCalculations";
import { ARROW_GEOMETRY } from "@shared/constants/threeConstants";

interface ArrowProps {
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
}

export const Arrow = memo(function Arrow({ start, end, color }: ArrowProps) {
  const angle = useMemo(() => computeLineAngle(start, end), [start, end]);

  const linePositions = useMemo(
    () =>
      new Float32Array([
        start.x,
        ARROW_GEOMETRY.LINE_Y,
        start.z,
        end.x,
        ARROW_GEOMETRY.LINE_Y,
        end.z,
      ]),
    [start, end],
  );

  return (
    <group>
      {/* ライン */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={ARROW_GEOMETRY.LINE_OPACITY}
        />
      </line>

      {/* 矢印の頭 */}
      <mesh
        position={[end.x, ARROW_GEOMETRY.HEAD_Y, end.z]}
        rotation={[Math.PI / 2, 0, -angle]}
      >
        <coneGeometry
          args={[
            ARROW_GEOMETRY.CONE_RADIUS,
            ARROW_GEOMETRY.CONE_HEIGHT,
            ARROW_GEOMETRY.CONE_SEGMENTS,
          ]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={ARROW_GEOMETRY.HEAD_OPACITY}
        />
      </mesh>
    </group>
  );
});
