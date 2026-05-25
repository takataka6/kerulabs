/**
 * @module MiniPitch
 * @description コードラボ用の簡易3Dピッチ。レッスンのインタラクティブデモで使用するミニチュアフィールド。
 */
import { DEFAULT_PITCH_COLOR } from "@shared/constants/colors";

const LINE_Y = 0.01;

export function MiniPitch() {
  return (
    <group>
      {/* フィールド面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 14]} />
        <meshStandardMaterial color={DEFAULT_PITCH_COLOR} />
      </mesh>

      {/* タッチライン（外枠） */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={5}
            array={
              new Float32Array([
                -5,
                LINE_Y,
                -7,
                5,
                LINE_Y,
                -7,
                5,
                LINE_Y,
                7,
                -5,
                LINE_Y,
                7,
                -5,
                LINE_Y,
                -7,
              ])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" transparent opacity={0.6} />
      </line>

      {/* ハーフウェーライン */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-5, LINE_Y, 0, 5, LINE_Y, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" transparent opacity={0.6} />
      </line>

      {/* センターサークル */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LINE_Y, 0]}>
        <ringGeometry args={[1.1, 1.15, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.6} />
      </mesh>

      {/* センタースポット */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LINE_Y + 0.001, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color="white" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
