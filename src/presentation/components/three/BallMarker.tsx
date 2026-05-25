/**
 * @module BallMarker
 * @description 3Dシーン上のボールマーカーコンポーネント。ドラッグによるボール配置と右クリック削除を提供する。
 */
import { memo, useRef, useCallback, useMemo } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Plane, Vector2, Vector3, type Group } from "three";
import {
  DEFAULT_FIELD_BOUNDS,
  DISK_GEOMETRY,
  ANIMATION,
  BALL_GEOMETRY,
} from "@shared/constants/threeConstants";
import { clampToFieldBounds } from "@presentation/utils/threeCalculations";

interface BallMarkerProps {
  position: { x: number; z: number };
  onDrag?: (pos: { x: number; z: number }) => void;
  onRemove?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  fieldBounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
}

/** シェーダーユニフォーム（静的な値なのでモジュールレベルで1回だけ生成） */
const BALL_UNIFORMS = {
  lightDir: { value: new Vector3(0.3, 1.0, 0.2).normalize() },
};

export const BallMarker = memo(function BallMarker({
  position,
  onDrag,
  onRemove,
  onDragStart,
  onDragEnd,
  fieldBounds,
}: BallMarkerProps) {
  const fieldBoundsResolved = useMemo(
    () => fieldBounds ?? DEFAULT_FIELD_BOUNDS,
    [fieldBounds],
  );
  const groupRef = useRef<Group>(null);
  const isDragging = useRef(false);
  const { camera, raycaster, gl } = useThree();
  const plane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  // ドラッグ中の GC 回避用プリアロケーション
  const cachedMouse = useRef(new Vector2());
  const cachedIntersection = useRef(new Vector3());
  const cachedRect = useRef<DOMRect | null>(null);

  const getFieldPosition = useCallback(
    (e: PointerEvent): { x: number; z: number } | null => {
      const rect = cachedRect.current ?? gl.domElement.getBoundingClientRect();
      cachedMouse.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(cachedMouse.current, camera);
      if (
        raycaster.ray.intersectPlane(plane.current, cachedIntersection.current)
      ) {
        return clampToFieldBounds(
          cachedIntersection.current,
          fieldBoundsResolved,
        );
      }
      return null;
    },
    [camera, raycaster, gl, fieldBoundsResolved],
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      isDragging.current = true;
      cachedRect.current = gl.domElement.getBoundingClientRect();
      gl.domElement.style.cursor = "grabbing";
      onDragStart?.();

      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDragging.current) return;
        const pos = getFieldPosition(ev);
        if (pos && onDrag) {
          onDrag(pos);
        }
      };

      const cleanup = () => {
        isDragging.current = false;
        cachedRect.current = null;
        gl.domElement.style.cursor = "auto";
        onDragEnd?.();
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", cleanup);
        window.removeEventListener("pointercancel", cleanup);
        window.removeEventListener("blur", cleanup);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", cleanup);
      window.addEventListener("pointercancel", cleanup);
      window.addEventListener("blur", cleanup);
    },
    [gl, onDrag, getFieldPosition, onDragStart, onDragEnd],
  );

  const handleContextMenu = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      e.nativeEvent.preventDefault();
      onRemove?.();
    },
    [onRemove],
  );

  const handlePointerOver = useCallback(() => {
    gl.domElement.style.cursor = "grab";
  }, [gl]);

  const handlePointerOut = useCallback(() => {
    if (!isDragging.current) gl.domElement.style.cursor = "auto";
  }, [gl]);

  useFrame(() => {
    if (!groupRef.current) return;
    // 位置の補間
    const dx = position.x - groupRef.current.position.x;
    const dz = position.z - groupRef.current.position.z;
    groupRef.current.position.x += dx * ANIMATION.LERP_STANDARD;
    groupRef.current.position.z += dz * ANIMATION.LERP_STANDARD;

    groupRef.current.position.y = BALL_GEOMETRY.Y_POSITION;
  });

  return (
    <group
      ref={groupRef}
      position={[position.x, BALL_GEOMETRY.Y_POSITION, position.z]}
    >
      {/* 地面の影 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, BALL_GEOMETRY.SHADOW_Y, 0]}
      >
        <circleGeometry
          args={[BALL_GEOMETRY.SHADOW_RADIUS, DISK_GEOMETRY.SEGMENTS]}
        />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* サッカーボール - シェーダーで五角形パターンを描画 */}
      <mesh
        onPointerDown={handlePointerDown}
        onContextMenu={handleContextMenu}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <icosahedronGeometry
          args={[BALL_GEOMETRY.RADIUS, BALL_GEOMETRY.DETAIL]}
        />
        <shaderMaterial
          uniforms={BALL_UNIFORMS}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = normalize(position);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 lightDir;

            // 正二十面体の12頂点（黒い五角形の中心）
            // 黄金比 phi = (1+sqrt(5))/2
            const float phi = 1.618033988749895;

            vec3 centers[12];

            void initCenters() {
              float s = 1.0 / sqrt(1.0 + phi * phi);
              float p = phi * s;
              centers[0]  = normalize(vec3( 0.0,  s,  p));
              centers[1]  = normalize(vec3( 0.0,  s, -p));
              centers[2]  = normalize(vec3( 0.0, -s,  p));
              centers[3]  = normalize(vec3( 0.0, -s, -p));
              centers[4]  = normalize(vec3( s,  p, 0.0));
              centers[5]  = normalize(vec3( s, -p, 0.0));
              centers[6]  = normalize(vec3(-s,  p, 0.0));
              centers[7]  = normalize(vec3(-s, -p, 0.0));
              centers[8]  = normalize(vec3( p, 0.0,  s));
              centers[9]  = normalize(vec3( p, 0.0, -s));
              centers[10] = normalize(vec3(-p, 0.0,  s));
              centers[11] = normalize(vec3(-p, 0.0, -s));
            }

            void main() {
              initCenters();
              vec3 n = normalize(vPosition);

              // 最も近い頂点との角度距離を求める
              float minDist = 999.0;
              for (int i = 0; i < 12; i++) {
                float d = acos(clamp(dot(n, centers[i]), -1.0, 1.0));
                minDist = min(minDist, d);
              }

              // 五角形パッチの半径（角度で約0.35ラジアン）
              float patchRadius = 0.35;
              // 縫い目の太さ
              float seamWidth = 0.04;

              vec3 baseColor;
              if (minDist < patchRadius) {
                // 黒い五角形パッチ
                baseColor = vec3(0.08, 0.08, 0.08);
              } else if (minDist < patchRadius + seamWidth) {
                // 縫い目（灰色のライン）
                baseColor = vec3(0.55, 0.55, 0.55);
              } else {
                // 白いパネル
                baseColor = vec3(0.95, 0.95, 0.95);
              }

              // 簡易ライティング
              float diffuse = max(dot(vNormal, lightDir), 0.0);
              float ambient = 0.4;
              float light = ambient + diffuse * 0.6;

              // フレネルで縁を少し暗く
              float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
              light -= fresnel * 0.15;

              gl_FragColor = vec4(baseColor * light, 1.0);
            }
          `}
        />
      </mesh>
    </group>
  );
});
