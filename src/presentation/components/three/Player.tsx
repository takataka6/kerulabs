/**
 * @module Player
 * @description 選手の3Dコンポーネント。円錐メッシュ・名前/番号テキスト・ドラッグ移動・カード表示を含む選手マーカーをレンダリングする。
 */
import { memo, useRef, useCallback, useMemo, useEffect, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CanvasText as Text } from "./CanvasText";
import {
  Plane,
  SRGBColorSpace,
  TextureLoader,
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
  CARD_DISPLAY,
  ANIMATION,
  PLAYER_OFFSETS,
  PLAYER_MATERIAL,
} from "@shared/constants/threeConstants";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";
import {
  shouldClearDragEndPos,
  computeSelectionRingPulse,
  clampToFieldBounds,
} from "@presentation/utils/threeCalculations";
import type { GroupDragState, CardStatus } from "./SceneTypes";
import type { MarkerShape } from "@shared/types";
import { getMarkerShapeSegments } from "./markerShape";

interface PlayerProps {
  position: { x: number; z: number };
  targetPosition?: { x: number; z: number } | null;
  color: string;
  number: number;
  name?: string;
  imageUrl?: string;
  showName?: boolean;
  showNumber?: boolean;
  showPhoto?: boolean;
  labelFixed?: boolean;
  index: number;
  card?: CardStatus;
  onClick?: (index: number, event?: MouseEvent) => void;
  isSelected?: boolean;
  selectedRingColor?: string;
  markerScale?: number;
  markerShape?: MarkerShape;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (index: number, pos: { x: number; z: number }) => void;
  onGroupDragEnd?: (
    positions: Array<{
      type: "player" | "opponent";
      id: number;
      pos: { x: number; z: number };
    }>,
  ) => void;
  groupDragState?: React.MutableRefObject<GroupDragState>;
  fieldBounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export const Player = memo(function Player({
  position,
  targetPosition,
  color,
  number,
  name,
  imageUrl,
  showName = true,
  showNumber = true,
  showPhoto = true,
  labelFixed = false,
  index,
  card = "none",
  onClick,
  isSelected = false,
  selectedRingColor,
  markerScale = 1,
  markerShape = "circle",
  draggable = false,
  onDragStart,
  onDragEnd,
  onGroupDragEnd,
  groupDragState,
  fieldBounds,
}: PlayerProps) {
  const [isDraggingState, setIsDraggingState] = useState(false);
  const fieldBoundsResolved = useMemo(
    () => fieldBounds ?? DEFAULT_FIELD_BOUNDS,
    [fieldBounds],
  );

  const labelFixedRef = useRef(labelFixed);
  labelFixedRef.current = labelFixed;
  const labelGroupRef = useRef<Group>(null);

  const photoRef = useRef<Mesh>(null);

  const texture = useMemo(() => {
    if (!imageUrl) return null;
    const loader = new TextureLoader();
    const tex = loader.load(imageUrl);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  // アンマウント時にドラッグ中のwindowイベントリスナーをクリーンアップ
  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const textRef = useRef<Mesh>(null);
  const selectedRingRef = useRef<Mesh>(null);
  const nameBgRef = useRef<Mesh>(null);
  const nameTextRef = useRef<Mesh>(null);
  const cardRef = useRef<Mesh>(null);
  const cardRef2 = useRef<Mesh>(null);
  const isDragging = useRef(false);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const { camera, raycaster, gl } = useThree();
  const planeRef = useRef(new Plane(new Vector3(0, 1, 0), 0));

  // フレーム毎のGC負荷を避けるため事前確保
  const cachedMouse = useRef(new Vector2());
  const cachedIntersection = useRef(new Vector3());
  const cachedRect = useRef<DOMRect | null>(null);
  const dragPositionRef = useRef<{ x: number; z: number } | null>(null);
  // React再レンダーがtargetPositionに追いつくまでドラッグ終了位置を保持
  const dragEndPosRef = useRef<{ x: number; z: number } | null>(null);

  const getFieldPosition = useCallback(
    (e: PointerEvent): { x: number; z: number } | null => {
      const rect = cachedRect.current;
      if (!rect) return null;
      cachedMouse.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(cachedMouse.current, camera);
      if (
        raycaster.ray.intersectPlane(
          planeRef.current,
          cachedIntersection.current,
        )
      ) {
        return clampToFieldBounds(
          cachedIntersection.current,
          fieldBoundsResolved,
        );
      }
      return null;
    },
    [camera, raycaster, fieldBoundsResolved],
  );

  // グループドラッグ終了コールバック用Ref（windowイベントリスナーの古いクロージャを回避）
  const onGroupDragEndRef = useRef(onGroupDragEnd);
  useEffect(() => {
    onGroupDragEndRef.current = onGroupDragEnd;
  });

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!draggable) return;
      e.stopPropagation();
      isDragging.current = true;
      setIsDraggingState(true);
      // ドラッグ開始時にバウンディング矩形を一度キャッシュ
      cachedRect.current = gl.domElement.getBoundingClientRect();
      gl.domElement.style.cursor = "grabbing";
      onDragStart?.();

      // グループドラッグ初期化（複数選択かつ自身が選択中の場合）
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
        if (pos && groupRef.current) {
          // メッシュを直接移動 — Reactのstate更新なし
          groupRef.current.position.x = pos.x;
          groupRef.current.position.z = pos.z;
          dragPositionRef.current = pos;
          // グループドラッグ差分を更新
          if (isGroupDrag && groupDragState) {
            const startPos =
              groupDragState.current.startPositions[`player_${index}`];
            if (startPos) {
              groupDragState.current.delta.x = pos.x - startPos.x;
              groupDragState.current.delta.z = pos.z - startPos.z;
            }
          }
        }
      };

      const cleanup = () => {
        dragCleanupRef.current = null;
        if (!isDragging.current) return; // guard against double-fire
        isDragging.current = false;
        setIsDraggingState(false);
        const finalPos = dragPositionRef.current;
        dragPositionRef.current = null;
        cachedRect.current = null;
        gl.domElement.style.cursor = "auto";
        // React がtargetPositionを更新するまでlerp巻き戻しを防ぐためドラッグ終了位置を保持
        const endPos =
          finalPos ??
          (groupRef.current
            ? { x: groupRef.current.position.x, z: groupRef.current.position.z }
            : null);
        dragEndPosRef.current = endPos;

        if (isGroupDrag && groupDragState) {
          // グループドラッグ終了: 全選択マーカーの最終位置を一括コミット
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
        } else if (endPos) {
          // 通常の単一ドラッグ
          onDragEnd?.(index, endPos);
        }

        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", cleanup);
        window.removeEventListener("pointercancel", cleanup);
        window.removeEventListener("blur", cleanup);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", cleanup);
      // pointercancel（タッチ操作中断等）やウィンドウフォーカス喪失時もクリーンアップ
      window.addEventListener("pointercancel", cleanup);
      window.addEventListener("blur", cleanup);
      dragCleanupRef.current = cleanup;
    },
    [
      draggable,
      gl,
      index,
      getFieldPosition,
      onDragStart,
      onDragEnd,
      isSelected,
      groupDragState,
      fieldBoundsResolved,
    ],
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // グループドラッグ follower: 他のマーカーがドラッグ中の場合、差分で追従
    if (
      groupDragState?.current.active &&
      !isDragging.current &&
      groupRef.current
    ) {
      const myKey = `player_${index}`;
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
    }

    // スムーズな移動アニメーション（ドラッグ中はスキップ: groupRef は直接更新される）
    if (groupRef.current && targetPosition && !isDragging.current) {
      // グループドラッグ follower 中はスキップ（上で直接設定済み）
      if (groupDragState?.current.active) {
        // lerpをスキップ
      } else if (dragEndPosRef.current) {
        const ep = dragEndPosRef.current;
        // targetPosition がドラッグ終了位置に十分近づいたら解除
        if (shouldClearDragEndPos(targetPosition, ep)) {
          dragEndPosRef.current = null;
        } else {
          // targetPosition が古い値のままなので、メッシュをドラッグ終了位置に固定
          groupRef.current.position.x = ep.x;
          groupRef.current.position.z = ep.z;
        }
      } else {
        const speed = getPlaybackSpeed();
        const lerp = 1 - Math.pow(1 - ANIMATION.LERP_PLAYER, speed);
        const dx = targetPosition.x - groupRef.current.position.x;
        const dz = targetPosition.z - groupRef.current.position.z;
        groupRef.current.position.x += dx * lerp;
        groupRef.current.position.z += dz * lerp;
      }
    }

    // 名前ラベルの追従 (Billboard)
    if (labelFixedRef.current && labelGroupRef.current) {
      // Billboard: カメラ方向に向ける
      labelGroupRef.current.quaternion.copy(state.camera.quaternion);
    }

    // 選択リングのアニメーション
    if (selectedRingRef.current) {
      selectedRingRef.current.rotation.z += ANIMATION.RING_ROTATION_SPEED;
      const { scale: pulse, opacity } = computeSelectionRingPulse(time);
      selectedRingRef.current.scale.setScalar(pulse);
      const mat = selectedRingRef.current.material as MeshBasicMaterial;
      mat.opacity = opacity;
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick?.(index, e.nativeEvent);
    },
    [onClick, index],
  );

  const handlePointerOver = useCallback(() => {
    if (draggable) {
      document.body.style.cursor = "grab";
    } else if (onClick) {
      document.body.style.cursor = "pointer";
    }
  }, [draggable, onClick]);

  const markerSegments = getMarkerShapeSegments(markerShape);

  const handlePointerOut = useCallback(() => {
    if (!isDragging.current) {
      document.body.style.cursor = "auto";
    }
  }, []);

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      <group scale={[markerScale, markerScale, markerScale]}>
        {/* ディスク本体 */}
        <mesh
          ref={meshRef}
          position={[0, DISK_GEOMETRY.Y_POSITION, 0]}
          castShadow
          onClick={onClick ? handleClick : undefined}
          onPointerDown={draggable ? handlePointerDown : undefined}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry
            args={[
              DISK_GEOMETRY.RADIUS,
              DISK_GEOMETRY.RADIUS,
              DISK_GEOMETRY.HEIGHT,
              markerSegments,
            ]}
          />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={PLAYER_MATERIAL.EMISSIVE_INTENSITY}
            metalness={PLAYER_MATERIAL.METALNESS}
            roughness={PLAYER_MATERIAL.ROUGHNESS}
            fog={false}
          />
        </mesh>

        {/* 写真テクスチャ（シリンダー上面） */}
        {texture && showPhoto && (
          <mesh
            ref={photoRef}
            position={[0, PLAYER_OFFSETS.PHOTO_Y, 0]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
          >
            <circleGeometry args={[DISK_GEOMETRY.RADIUS, markerSegments]} />
            <meshBasicMaterial
              map={texture}
              fog={false}
              polygonOffset
              polygonOffsetFactor={PLAYER_MATERIAL.POLYGON_OFFSET_FACTOR}
              polygonOffsetUnits={PLAYER_MATERIAL.POLYGON_OFFSET_UNITS}
            />
          </mesh>
        )}

        {/* 選択時またはドラッグ時のハイライトリング */}
        {(isSelected || isDraggingState) && (
          <mesh
            ref={selectedRingRef}
            position={[0, SELECTION_RING.Y_POSITION, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry
              args={[
                SELECTION_RING.INNER_RADIUS,
                SELECTION_RING.OUTER_RADIUS,
                SELECTION_RING.SEGMENTS,
              ]}
            />
            <meshBasicMaterial
              color={selectedRingColor || "#fbbf24"}
              transparent
              opacity={SELECTION_RING.OPACITY}
              fog={false}
            />
          </mesh>
        )}

        {/* 番号テキスト（写真がない場合のみ表示） */}
        {!texture && showNumber && (
          <Text
            ref={textRef}
            position={[0, PLAYER_OFFSETS.NUMBER_Y, 0]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
            fontSize={TEXT_LABEL.NUMBER_FONT_SIZE}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={TEXT_LABEL.NUMBER_OUTLINE_WIDTH}
            outlineColor="#000000"
          >
            {number}
          </Text>
        )}

        {/* 名前テキスト（フラット表示） */}
        {showName && name && !labelFixed && (
          <>
            <mesh
              ref={nameBgRef}
              position={[0, PLAYER_OFFSETS.NAME_BG_Y, PLAYER_OFFSETS.NAME_Z]}
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
              ref={nameTextRef}
              position={[0, PLAYER_OFFSETS.NAME_TEXT_Y, PLAYER_OFFSETS.NAME_Z]}
              rotation={[-Math.PI / 2, 0, Math.PI]}
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

        {/* 名前テキスト（Billboard: 常にカメラ向き） */}
        {showName && name && labelFixed && (
          <group ref={labelGroupRef} position={[0, 0.3, 0]}>
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

        {/* カード表示（右上） */}
        {card === "yellow" && (
          <mesh
            ref={cardRef}
            position={[
              CARD_DISPLAY.SINGLE_X,
              CARD_DISPLAY.Y_POSITION,
              CARD_DISPLAY.Z_OFFSET,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[CARD_DISPLAY.WIDTH, CARD_DISPLAY.HEIGHT]} />
            <meshBasicMaterial color="#facc15" fog={false} />
          </mesh>
        )}
        {card === "double_yellow" && (
          <group>
            <mesh
              ref={cardRef2}
              position={[
                CARD_DISPLAY.DOUBLE_X1,
                CARD_DISPLAY.Y_POSITION,
                CARD_DISPLAY.Z_OFFSET,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[CARD_DISPLAY.WIDTH, CARD_DISPLAY.HEIGHT]} />
              <meshBasicMaterial color="#facc15" fog={false} />
            </mesh>
            <mesh
              position={[
                CARD_DISPLAY.DOUBLE_X2,
                CARD_DISPLAY.Y_POSITION,
                CARD_DISPLAY.Z_OFFSET,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[CARD_DISPLAY.WIDTH, CARD_DISPLAY.HEIGHT]} />
              <meshBasicMaterial color="#facc15" fog={false} />
            </mesh>
          </group>
        )}
        {card === "red" && (
          <mesh
            ref={cardRef}
            position={[
              CARD_DISPLAY.SINGLE_X,
              CARD_DISPLAY.Y_POSITION,
              CARD_DISPLAY.Z_OFFSET,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[CARD_DISPLAY.WIDTH, CARD_DISPLAY.HEIGHT]} />
            <meshBasicMaterial color="#ef4444" fog={false} />
          </mesh>
        )}
      </group>
    </group>
  );
});
