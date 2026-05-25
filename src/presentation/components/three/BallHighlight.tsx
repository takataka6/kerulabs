/**
 * @module BallHighlight
 * @description ボール位置のハイライトエフェクトコンポーネント。パルスアニメーションで注目位置を強調する。
 */
import { useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Mesh, type MeshBasicMaterial } from "three";

interface BallHighlightProps {
  position: { x: number; z: number };
}

/**
 * ボール開始位置のハイライトエフェクト
 * セットフェーズ中にボールのキック位置を強調表示する
 */
export const BallHighlight = memo(function BallHighlight({
  position,
}: BallHighlightProps) {
  const ringRef = useRef<Mesh>(null);
  const outerRingRef = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 内側リング: パルスアニメーション
    if (ringRef.current) {
      const scale = 1 + Math.sin(time * 4) * 0.15;
      ringRef.current.scale.set(scale, scale, 1);
      (ringRef.current.material as MeshBasicMaterial).opacity =
        0.6 + Math.sin(time * 4) * 0.2;
    }

    // 外側リング: 拡大＋フェードアウトの繰り返し
    if (outerRingRef.current) {
      const cycle = (time * 1.5) % 1; // 0→1 を繰り返し
      const scale = 1 + cycle * 1.2;
      outerRingRef.current.scale.set(scale, scale, 1);
      (outerRingRef.current.material as MeshBasicMaterial).opacity =
        (1 - cycle) * 0.4;
    }
  });

  return (
    <group position={[position.x, 0.02, position.z]}>
      {/* 内側リング: 常時パルス */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.32, 32]} />
        <meshBasicMaterial
          color="#facc15"
          transparent
          opacity={0.7}
          side={DoubleSide}
        />
      </mesh>

      {/* 外側リング: 拡大しながらフェードアウト */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial
          color="#facc15"
          transparent
          opacity={0.4}
          side={DoubleSide}
        />
      </mesh>

      {/* 中心のグロー */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.15} />
      </mesh>
    </group>
  );
});
