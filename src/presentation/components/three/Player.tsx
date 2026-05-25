/**
 * @module Player
 * @description 選手の3Dコンポーネント。円錐メッシュ・名前/番号テキスト・ドラッグ移動・カード表示を含む選手マーカーをレンダリングする。
 */
import { memo, useRef, useCallback, useMemo, useEffect } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import {
  Plane,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
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
  index: number;
  card?: CardStatus;
  onClick?: (index: number, event?: MouseEvent) => void;
  isSelected?: boolean;
  markerScale?: number;
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
  index,
  card = "none",
  onClick,
  isSelected = false,
  markerScale = 1,
  draggable = false,
  onDragStart,
  onDragEnd,
  onGroupDragEnd,
  groupDragState,
  fieldBounds,
}: PlayerProps) {
  const fieldBoundsResolved = useMemo(
    () => fieldBounds ?? DEFAULT_FIELD_BOUNDS,
    [fieldBounds],
  );
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
        if (pos && meshRef.current) {
          // メッシュを直接移動 — Reactのstate更新なし
          meshRef.current.position.x = pos.x;
          meshRef.current.position.z = pos.z;
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
        const finalPos = dragPositionRef.current;
        dragPositionRef.current = null;
        cachedRect.current = null;
        gl.domElement.style.cursor = "auto";
        // React がtargetPositionを更新するまでlerp巻き戻しを防ぐためドラッグ終了位置を保持
        const endPos =
          finalPos ??
          (meshRef.current
            ? { x: meshRef.current.position.x, z: meshRef.current.position.z }
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
      meshRef.current
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
        meshRef.current.position.x = clamped.x;
        meshRef.current.position.z = clamped.z;
      }
    }

    // スムーズな移動アニメーション（ドラッグ中はスキップ: meshRef は直接更新される）
    if (meshRef.current && targetPosition && !isDragging.current) {
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
          meshRef.current.position.x = ep.x;
          meshRef.current.position.z = ep.z;
        }
      } else {
        const speed = getPlaybackSpeed();
        const lerp = 1 - Math.pow(1 - ANIMATION.LERP_PLAYER, speed);
        const dx = targetPosition.x - meshRef.current.position.x;
        const dz = targetPosition.z - meshRef.current.position.z;
        meshRef.current.position.x += dx * lerp;
        meshRef.current.position.z += dz * lerp;
      }
    }

    // 写真テクスチャの追従
    if (photoRef.current && meshRef.current) {
      photoRef.current.position.x = meshRef.current.position.x;
      photoRef.current.position.z = meshRef.current.position.z;
      photoRef.current.position.y =
        meshRef.current.position.y + PLAYER_OFFSETS.PHOTO_Y;
    }

    // テキストの追従
    if (textRef.current && meshRef.current) {
      textRef.current.position.x = meshRef.current.position.x;
      textRef.current.position.z = meshRef.current.position.z;
      textRef.current.position.y =
        meshRef.current.position.y + PLAYER_OFFSETS.TEXT_Y;
    }

    // 名前ラベルの追従
    if (meshRef.current) {
      if (nameBgRef.current) {
        nameBgRef.current.position.x = meshRef.current.position.x;
        nameBgRef.current.position.z =
          meshRef.current.position.z + PLAYER_OFFSETS.NAME_Z;
      }
      if (nameTextRef.current) {
        nameTextRef.current.position.x = meshRef.current.position.x;
        nameTextRef.current.position.z =
          meshRef.current.position.z + PLAYER_OFFSETS.NAME_Z;
      }
      // カード表示の追従
      if (cardRef.current) {
        cardRef.current.position.x =
          meshRef.current.position.x + CARD_DISPLAY.SINGLE_X;
        cardRef.current.position.z =
          meshRef.current.position.z + CARD_DISPLAY.Z_OFFSET;
      }
      if (cardRef2.current) {
        cardRef2.current.position.x =
          meshRef.current.position.x + CARD_DISPLAY.DOUBLE_X1;
        cardRef2.current.position.z =
          meshRef.current.position.z + CARD_DISPLAY.Z_OFFSET;
      }
    }

    // 選択リングのアニメーション
    if (selectedRingRef.current && meshRef.current) {
      selectedRingRef.current.position.x = meshRef.current.position.x;
      selectedRingRef.current.position.z = meshRef.current.position.z;
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

  const handlePointerOut = useCallback(() => {
    if (!isDragging.current) {
      document.body.style.cursor = "auto";
    }
  }, []);

  return (
    <group scale={[markerScale, markerScale, markerScale]}>
      {/* ディスク本体 */}
      <mesh
        ref={meshRef}
        position={[position.x, DISK_GEOMETRY.Y_POSITION, position.z]}
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
            DISK_GEOMETRY.SEGMENTS,
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
          position={[position.x, PLAYER_OFFSETS.PHOTO_Y, position.z]}
          rotation={[-Math.PI / 2, 0, Math.PI]}
        >
          <circleGeometry
            args={[DISK_GEOMETRY.RADIUS, DISK_GEOMETRY.SEGMENTS]}
          />
          <meshBasicMaterial
            map={texture}
            fog={false}
            polygonOffset
            polygonOffsetFactor={PLAYER_MATERIAL.POLYGON_OFFSET_FACTOR}
            polygonOffsetUnits={PLAYER_MATERIAL.POLYGON_OFFSET_UNITS}
          />
        </mesh>
      )}

      {/* 選択時のハイライトリング */}
      {isSelected && (
        <mesh
          ref={selectedRingRef}
          position={[position.x, SELECTION_RING.Y_POSITION, position.z]}
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
            color="#fbbf24"
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
          position={[position.x, PLAYER_OFFSETS.NUMBER_Y, position.z]}
          rotation={[-Math.PI / 2, 0, Math.PI]}
          fontSize={TEXT_LABEL.NUMBER_FONT_SIZE}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={TEXT_LABEL.OUTLINE_WIDTH}
          outlineColor="#000000"
        >
          {number}
        </Text>
      )}

      {/* 名前テキスト */}
      {showName && name && (
        <>
          {/* 名前の背景 */}
          <mesh
            ref={nameBgRef}
            position={[
              position.x,
              PLAYER_OFFSETS.NAME_BG_Y,
              position.z + PLAYER_OFFSETS.NAME_Z,
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

          {/* 名前テキスト */}
          <Text
            ref={nameTextRef}
            position={[
              position.x,
              PLAYER_OFFSETS.NAME_TEXT_Y,
              position.z + PLAYER_OFFSETS.NAME_Z,
            ]}
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

      {/* カード表示（右上） */}
      {card === "yellow" && (
        <mesh
          ref={cardRef}
          position={[
            position.x + CARD_DISPLAY.SINGLE_X,
            CARD_DISPLAY.Y_POSITION,
            position.z + CARD_DISPLAY.Z_OFFSET,
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
              position.x + CARD_DISPLAY.DOUBLE_X1,
              CARD_DISPLAY.Y_POSITION,
              position.z + CARD_DISPLAY.Z_OFFSET,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[CARD_DISPLAY.WIDTH, CARD_DISPLAY.HEIGHT]} />
            <meshBasicMaterial color="#facc15" fog={false} />
          </mesh>
          <mesh
            position={[
              position.x + CARD_DISPLAY.DOUBLE_X2,
              CARD_DISPLAY.Y_POSITION,
              position.z + CARD_DISPLAY.Z_OFFSET,
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
            position.x + CARD_DISPLAY.SINGLE_X,
            CARD_DISPLAY.Y_POSITION,
            position.z + CARD_DISPLAY.Z_OFFSET,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[CARD_DISPLAY.WIDTH, CARD_DISPLAY.HEIGHT]} />
          <meshBasicMaterial color="#ef4444" fog={false} />
        </mesh>
      )}
    </group>
  );
});
