/**
 * @module OpponentMarker
 * @description 相手チームマーカーの3Dコンポーネント。ドラッグ移動・右クリック削除・名前/番号表示を提供する。
 */
import { memo, useRef, useCallback, useMemo, useEffect } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CanvasText as Text } from "./CanvasText";
import {
  Plane,
  Vector2,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import {
  DEFAULT_FIELD_BOUNDS,
  DISK_GEOMETRY,
  SELECTION_RING,
  TEXT_LABEL,
  ANIMATION,
  OPPONENT_OFFSETS,
  PLAYER_MATERIAL,
} from "@shared/constants/threeConstants";
import {
  deriveOpponentColors,
  clampToFieldBounds,
} from "@presentation/utils/threeCalculations";
import type { GroupDragState } from "./SceneTypes";

interface OpponentMarkerProps {
  position: { x: number; z: number };
  number: number;
  id: number;
  onDrag?: (id: number, pos: { x: number; z: number }) => void;
  onRemove?: (id: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onClick?: (id: number, event?: MouseEvent) => void;
  isSelected?: boolean;
  color?: string; // チームカラー (デフォルト: '#1e1e1e')
  name?: string; // 選手名
  showName?: boolean;
  showNumber?: boolean;
  labelFixed?: boolean;
  onGroupDragEnd?: (
    positions: Array<{
      type: "player" | "opponent";
      id: number;
      pos: { x: number; z: number };
    }>,
  ) => void;
  groupDragState?: React.MutableRefObject<GroupDragState>;
  fieldBounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  markerScale?: number;
}

export const OpponentMarker = memo(function OpponentMarker({
  position,
  number,
  id,
  onDrag,
  onRemove,
  onDragStart,
  onDragEnd,
  onClick,
  isSelected = false,
  color,
  name,
  showName = true,
  showNumber = true,
  labelFixed = false,
  onGroupDragEnd,
  groupDragState,
  fieldBounds,
  markerScale = 1,
}: OpponentMarkerProps) {
  const fieldBoundsResolved = useMemo(
    () => fieldBounds ?? DEFAULT_FIELD_BOUNDS,
    [fieldBounds],
  );

  const labelFixedRef = useRef(labelFixed);
  labelFixedRef.current = labelFixed;
  const labelGroupRef = useRef<Group>(null);

  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const selectedRingRef = useRef<Mesh>(null);
  const isDragging = useRef(false);
  const { camera, raycaster, gl } = useThree();
  const plane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  // ドラッグ中の GC 回避用プリアロケーション
  const cachedMouse = useRef(new Vector2());
  const cachedIntersection = useRef(new Vector3());
  const cachedRect = useRef<DOMRect | null>(null);

  const colors = useMemo(() => deriveOpponentColors(color), [color]);

  // ドラッグ中のフィールド座標を算出
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

  // グループドラッグ終了コールバック用Ref（古いクロージャを回避）
  const onGroupDragEndRef = useRef(onGroupDragEnd);
  useEffect(() => {
    onGroupDragEndRef.current = onGroupDragEnd;
  });

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      isDragging.current = true;
      cachedRect.current = gl.domElement.getBoundingClientRect();
      gl.domElement.style.cursor = "grabbing";
      onDragStart?.();

      // グループドラッグ初期化
      let isGroupDrag = false;
      if (groupDragState && isSelected) {
        const sp = groupDragState.current.selectionPositions;
        if (Object.keys(sp).length > 1) {
          isGroupDrag = true;
          groupDragState.current.active = true;
          groupDragState.current.startPositions = { ...sp };
          groupDragState.current.delta = { x: 0, z: 0 };
        }
      }

      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDragging.current) return;
        const pos = getFieldPosition(ev);
        if (!pos) return;

        if (isGroupDrag && groupDragState) {
          // グループドラッグ: initiator のメッシュを直接移動し差分を更新
          if (groupRef.current) {
            groupRef.current.position.x = pos.x;
            groupRef.current.position.z = pos.z;
          }
          const startPos =
            groupDragState.current.startPositions[`opponent_${id}`];
          if (startPos) {
            groupDragState.current.delta.x = pos.x - startPos.x;
            groupDragState.current.delta.z = pos.z - startPos.z;
          }
        } else if (onDrag) {
          onDrag(id, pos);
        }
      };

      const cleanup = () => {
        isDragging.current = false;
        cachedRect.current = null;
        gl.domElement.style.cursor = "auto";

        if (isGroupDrag && groupDragState) {
          const delta = groupDragState.current.delta;
          const positions = Object.entries(
            groupDragState.current.startPositions,
          ).map(([key, sp]) => {
            const clamped = clampToFieldBounds(
              { x: sp.x + delta.x, z: sp.z + delta.z },
              fieldBoundsResolved,
            );
            const [type, idStr] = key.split("_");
            return {
              type: type as "player" | "opponent",
              id: parseInt(idStr, 10),
              pos: clamped,
            };
          });
          groupDragState.current.active = false;
          groupDragState.current.delta = { x: 0, z: 0 };
          onGroupDragEndRef.current?.(positions);
        } else {
          onDragEnd?.();
        }

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
    [
      gl,
      id,
      onDrag,
      getFieldPosition,
      onDragStart,
      onDragEnd,
      isSelected,
      groupDragState,
      fieldBoundsResolved,
    ],
  );

  const handleContextMenu = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      // ブラウザのコンテキストメニューを防止
      e.nativeEvent.preventDefault();
      onRemove?.(id);
    },
    [id, onRemove],
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick?.(id, e.nativeEvent);
    },
    [id, onClick],
  );

  const handlePointerOver = useCallback(() => {
    gl.domElement.style.cursor = "grab";
  }, [gl]);

  const handlePointerOut = useCallback(() => {
    if (!isDragging.current) gl.domElement.style.cursor = "auto";
  }, [gl]);

  // スムーズなポジション更新
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // グループドラッグ follower: 他のマーカーがドラッグ中の場合、差分で追従
    if (groupDragState?.current.active && !isDragging.current) {
      const myKey = `opponent_${id}`;
      const startPos = groupDragState.current.startPositions[myKey];
      if (startPos) {
        const clamped = clampToFieldBounds(
          {
            x: startPos.x + groupDragState.current.delta.x,
            z: startPos.z + groupDragState.current.delta.z,
          },
          fieldBoundsResolved,
        );
        groupRef.current.position.x = clamped.x;
        groupRef.current.position.z = clamped.z;
      }
    } else if (!isDragging.current) {
      // 通常の位置の補間
      const dx = position.x - groupRef.current.position.x;
      const dz = position.z - groupRef.current.position.z;
      groupRef.current.position.x += dx * ANIMATION.LERP_STANDARD;
      groupRef.current.position.z += dz * ANIMATION.LERP_STANDARD;
    }

    // Billboard ラベルの追従
    if (labelGroupRef.current && groupRef.current && labelFixedRef.current) {
      labelGroupRef.current.position.x = groupRef.current.position.x;
      labelGroupRef.current.position.z = groupRef.current.position.z;
      labelGroupRef.current.quaternion.copy(state.camera.quaternion);
    }

    // 選択リングのアニメーション
    if (selectedRingRef.current) {
      selectedRingRef.current.rotation.z += ANIMATION.RING_ROTATION_SPEED;
      const pulse =
        1 +
        Math.sin(time * ANIMATION.PULSE_FREQUENCY) * ANIMATION.PULSE_AMPLITUDE;
      selectedRingRef.current.scale.setScalar(pulse);
      const mat = selectedRingRef.current.material as MeshBasicMaterial;
      mat.opacity =
        ANIMATION.OPACITY_BASE +
        Math.sin(time * ANIMATION.OPACITY_FREQUENCY) *
          ANIMATION.OPACITY_AMPLITUDE;
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        position={[position.x, 0, position.z]}
        scale={[markerScale, markerScale, markerScale]}
      >
        {/* 選択時のハイライトリング */}
        {isSelected && (
          <mesh
            ref={selectedRingRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, SELECTION_RING.Y_POSITION, 0]}
          >
            <ringGeometry
              args={[
                SELECTION_RING.INNER_RADIUS_SMALL,
                SELECTION_RING.OUTER_RADIUS_SMALL,
                SELECTION_RING.SEGMENTS,
              ]}
            />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={SELECTION_RING.OPACITY}
              fog={false}
            />
          </mesh>
        )}

        {/* メインディスク */}
        <mesh
          ref={meshRef}
          position={[0, DISK_GEOMETRY.Y_POSITION, 0]}
          onPointerDown={handlePointerDown}
          onClick={onClick ? handleClick : undefined}
          onContextMenu={handleContextMenu}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry
            args={[
              DISK_GEOMETRY.RADIUS,
              DISK_GEOMETRY.RADIUS,
              DISK_GEOMETRY.HEIGHT,
              DISK_GEOMETRY.SEGMENTS,
            ]}
          />
          <meshStandardMaterial
            color={colors.disk}
            emissive={colors.disk}
            emissiveIntensity={PLAYER_MATERIAL.EMISSIVE_INTENSITY}
            metalness={PLAYER_MATERIAL.METALNESS}
            roughness={0.4}
            fog={false}
          />
        </mesh>

        {/* 番号テキスト（相手チームは反転して相手側から読める向き） */}
        {showNumber && (
          <Text
            position={[0, OPPONENT_OFFSETS.NUMBER_Y, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={TEXT_LABEL.OPPONENT_NUMBER_FONT_SIZE}
            color={colors.text}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {number.toString()}
          </Text>
        )}

        {/* 名前ラベル（フラット表示） */}
        {name && showName && !labelFixed && (
          <>
            <mesh
              position={[
                0,
                OPPONENT_OFFSETS.NAME_BG_Y,
                OPPONENT_OFFSETS.NAME_Z,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry
                args={[
                  name.length * TEXT_LABEL.NAME_WIDTH_FACTOR +
                    TEXT_LABEL.NAME_WIDTH_PADDING,
                  TEXT_LABEL.NAME_HEIGHT,
                ]}
              />
              <meshBasicMaterial
                color={TEXT_LABEL.NAME_BG_COLOR}
                transparent={false}
                fog={true}
              />
            </mesh>
            <Text
              position={[
                0,
                OPPONENT_OFFSETS.NAME_TEXT_Y,
                OPPONENT_OFFSETS.NAME_Z,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={TEXT_LABEL.NAME_FONT_SIZE}
              color="white"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={TEXT_LABEL.OUTLINE_WIDTH}
              outlineColor="#000000"
            >
              {name}
            </Text>
          </>
        )}
      </group>

      {/* 名前ラベル（Billboard: 常にカメラ向き） */}
      {name && showName && labelFixed && (
        <group ref={labelGroupRef} position={[position.x, 0.3, position.z]}>
          <mesh position={[0, -0.18, 0]}>
            <planeGeometry
              args={[
                name.length * TEXT_LABEL.NAME_WIDTH_FACTOR +
                  TEXT_LABEL.NAME_WIDTH_PADDING,
                TEXT_LABEL.NAME_HEIGHT,
              ]}
            />
            <meshBasicMaterial color={TEXT_LABEL.NAME_BG_COLOR} />
          </mesh>
          <Text
            position={[0, -0.18, 0.001]}
            fontSize={TEXT_LABEL.NAME_FONT_SIZE}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={TEXT_LABEL.OUTLINE_WIDTH}
            outlineColor="#000000"
          >
            {name}
          </Text>
        </group>
      )}
    </>
  );
});
