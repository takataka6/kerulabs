/**
 * @module DemoCanvas
 * @description コードラボ用の3Dデモキャンバス。レッスンのインタラクティブデモを囲むCanvasラッパー。
 */
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface DemoCanvasProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  enableRotate?: boolean;
  compact?: boolean;
}

export function DemoCanvas({
  children,
  cameraPosition = [0, 12, -8],
  enableRotate = true,
  compact = false,
}: DemoCanvasProps) {
  return (
    <div
      className={`w-full ${compact ? "h-[200px]" : "h-[350px] sm:h-[420px]"} rounded-xl overflow-hidden border border-slate-700 bg-slate-950`}
    >
      <Canvas camera={{ position: cameraPosition, fov: 45 }}>
        <color attach="background" args={["#0f172a"]} />
        <ambientLight intensity={0.6} />
        <spotLight
          position={[0, 15, 0]}
          angle={Math.PI / 3}
          penumbra={0.5}
          intensity={1.2}
          castShadow
        />
        <pointLight position={[5, 5, 5]} intensity={0.3} color="#60a5fa" />
        {children}
        <OrbitControls
          enableRotate={enableRotate}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
