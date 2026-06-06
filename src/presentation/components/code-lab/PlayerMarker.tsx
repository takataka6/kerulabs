/**
 * @module PlayerMarker
 * @description コードラボ用の簡易選手マーカー。円柱と名前/番号テキストを表示する。
 */
import { Text } from "@react-three/drei";

interface PlayerMarkerProps {
  position: [number, number, number];
  color: string;
  number?: number;
  name?: string;
  showName?: boolean;
}

export function PlayerMarker({
  position,
  color,
  number,
  name,
  showName = true,
}: PlayerMarkerProps) {
  return (
    <group position={position}>
      {/* ディスク本体 */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* 背番号 */}
      {number !== undefined && (
        <Text
          font="/fonts/Roboto-Regular.ttf"
          position={[0, 0.2, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI]}
          fontSize={0.28}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {number}
        </Text>
      )}

      {/* 名前 */}
      {showName && name && (
        <>
          <mesh position={[0, 0.02, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[name.length * 0.13 + 0.3, 0.28]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <Text
            font="/fonts/Roboto-Regular.ttf"
            position={[0, 0.03, -0.75]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
            fontSize={0.16}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {name}
          </Text>
        </>
      )}
    </group>
  );
}
