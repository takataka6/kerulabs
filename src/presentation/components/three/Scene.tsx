/**
 * @module Scene
 * @description Three.jsメインシーンコンポーネント。カメラ制御・ピッチ・選手・ボール・矢印・接続ラインを統合する3Dシーン全体を管理する。
 */
import { useRef, useEffect, useCallback, useMemo, memo } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Pitch } from "./Pitch";
import { Player } from "./Player";
import { OpponentMarker } from "./OpponentMarker";
import { BallMarker } from "./BallMarker";
import { Arrow } from "./Arrow";
import { PlayerConnectionLines } from "./PlayerConnectionLines";
import { BallTrajectory } from "./BallTrajectory";
import { BallHighlight } from "./BallHighlight";
import { CanvasTexture, Color, SRGBColorSpace } from "three";
import { FOOTBALL_CONFIG } from "@shared/constants/pitchConfig";
import { DEFAULT_SCENE_BG_COLOR } from "@shared/constants";
import {
  isFieldClick,
  clampToFieldBounds,
} from "@presentation/utils/threeCalculations";
import {
  SCENE_LIGHTING,
  FIELD_CLICK_PLANE,
} from "@shared/constants/threeConstants";

import { PlayerCameraController } from "./PlayerCameraController";
import type { GroupDragState, SceneProps } from "./SceneTypes";
export type { GroupDragState } from "./SceneTypes";

// ctx.filter はSafari < iOS 18 で未対応のため、ピクセル操作で彩度・明度を適用する
function applyColorAdjustment(
  ctx: CanvasRenderingContext2D,
  saturation: number,
  brightness: number,
): void {
  if (saturation === 100 && brightness === 100) return;
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const sat = saturation / 100;
  const bright = brightness / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] * bright;
    const g = data[i + 1] * bright;
    const b = data[i + 2] * bright;
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[i] = Math.min(255, Math.max(0, gray + sat * (r - gray)));
    data[i + 1] = Math.min(255, Math.max(0, gray + sat * (g - gray)));
    data[i + 2] = Math.min(255, Math.max(0, gray + sat * (b - gray)));
  }
  ctx.putImageData(imageData, 0, 0);
}

export const Scene = memo(function Scene({
  players,
  colors,
  formation,
  playerPositions,
  arrows,
  ballTrajectories,
  showPlayerNames = true,
  showPlayerNumbers = true,
  showPlayerPhotos = true,
  showOpponentNames = true,
  hiddenPlayerIndices = new Set(),
  labelFixed = false,
  playerMarkerScale = 1,
  playerCards = {},
  teamName = "",
  opponentTeamName = "",
  onPlayerClick,
  selectedPlayerIndex = null,
  selectedPlayerIndices,
  isPlayerView = false,
  opponents = [],
  selectedOpponentId = null,
  selectedOpponentIds,
  onOpponentClick,
  opponentPlacementMode = false,
  onFieldClick,
  onOpponentDrag,
  onOpponentRemove,
  ballPosition = null,
  ballHighlightPosition = null,
  ballPlacementMode = false,
  onBallPlace,
  onBallDrag,
  onBallRemove,
  isDraggingObject = false,
  onDragStart,
  onDragEnd,
  playerDraggable = false,
  onPlayerDragEnd,
  onGroupDragEnd,
  connectionLines = [],
  pendingConnectionLine = null,
  onConnectionLineRemove,
  lineTrackingActive = false,
  onLinePointerMove,
  pitchConfig,
  fieldLocked = false,
  touchlineLocked = false,
  sceneBackground,
  sceneBackgroundImageUrl,
  sceneBackgroundImageSaturation = 100,
  sceneBackgroundImageBrightness = 100,
  pitchColor,
  pitchOpacity,
  cameraAction,
  onCameraActionDone,
  yawNudgeRef,
  isFirstPerson,
  onEmptyFieldClick,
}: SceneProps) {
  const pc = pitchConfig || FOOTBALL_CONFIG;
  const bounds = pc.fieldBounds;
  const bgColor =
    !sceneBackground || sceneBackground.mode === "none"
      ? DEFAULT_SCENE_BG_COLOR
      : sceneBackground.mode === "solid"
        ? sceneBackground.color
        : DEFAULT_SCENE_BG_COLOR;

  // ── Group drag state ──
  const groupDragRef = useRef<GroupDragState>({
    active: false,
    delta: { x: 0, z: 0 },
    startPositions: {},
    selectionPositions: {},
  });
  // 選択マーカーの現在位置を毎レンダーで更新
  const selPos: Record<string, { x: number; z: number }> = {};
  if (selectedPlayerIndices && selectedPlayerIndices.size > 0) {
    for (const idx of selectedPlayerIndices) {
      selPos[`player_${idx}`] = playerPositions[idx] || {
        x: formation[idx].x,
        z: formation[idx].z,
      };
    }
  }
  if (selectedOpponentIds && selectedOpponentIds.size > 0) {
    for (const opp of opponents) {
      if (selectedOpponentIds.has(opp.id)) {
        selPos[`opponent_${opp.id}`] = { x: opp.x, z: opp.z };
      }
    }
  }
  groupDragRef.current.selectionPositions = selPos;

  // ── Field click detection (distinguish from camera drag) ──
  const fieldPointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const handleFieldPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    fieldPointerDownRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleFieldPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!fieldPointerDownRef.current) return;
      const downPos = fieldPointerDownRef.current;
      fieldPointerDownRef.current = null;
      // ドラッグ距離が5px以上ならクリックではなくカメラ操作とみなす
      if (!isFieldClick(downPos, { x: e.clientX, y: e.clientY })) return;

      e.stopPropagation();
      const clamped = clampToFieldBounds(
        { x: e.point.x, z: e.point.z },
        bounds,
      );
      const { x, z } = clamped;
      if (opponentPlacementMode) {
        onFieldClick?.({ x, z });
      } else if (ballPlacementMode) {
        onBallPlace?.({ x, z });
      }
    },
    [
      bounds,
      opponentPlacementMode,
      ballPlacementMode,
      onFieldClick,
      onBallPlace,
    ],
  );

  const handleFieldPointerOver = useCallback(() => {
    document.body.style.cursor = "crosshair";
  }, []);

  const handleFieldPointerOut = useCallback(() => {
    document.body.style.cursor = "auto";
  }, []);

  const handleLinePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const point = e.point;
      const x = Math.max(bounds.minX, Math.min(bounds.maxX, point.x));
      const z = Math.max(bounds.minZ, Math.min(bounds.maxZ, point.z));
      onLinePointerMove?.({ x, z });
    },
    [bounds, onLinePointerMove],
  );

  // ── 空フィールドクリック（選択解除） ──
  const emptyClickDownRef = useRef<{ x: number; y: number } | null>(null);
  const handleEmptyFieldPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      emptyClickDownRef.current = { x: e.clientX, y: e.clientY };
    },
    [],
  );
  const handleEmptyFieldPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!emptyClickDownRef.current) return;
      const downPos = emptyClickDownRef.current;
      emptyClickDownRef.current = null;
      if (!isFieldClick(downPos, { x: e.clientX, y: e.clientY })) return;
      onEmptyFieldClick?.();
    },
    [onEmptyFieldClick],
  );

  // シーングラデーション背景テクスチャ
  const bgTexture = useMemo(() => {
    if (!sceneBackground || sceneBackground.mode !== "gradient") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // CSS linear-gradient uses clockwise-from-north convention.
    // Canvas y-axis is inverted (increases downward), so convert accordingly:
    //   canvas_dx = sin(cssAngle), canvas_dy = -cos(cssAngle)
    const cssAngleRad = (sceneBackground.gradient.angle * Math.PI) / 180;
    const dx = Math.sin(cssAngleRad);
    const dy = -Math.cos(cssAngleRad);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const length = Math.abs(dx) * canvas.width + Math.abs(dy) * canvas.height;
    const half = length / 2;

    const gradient = ctx.createLinearGradient(
      centerX - dx * half,
      centerY - dy * half,
      centerX + dx * half,
      centerY + dy * half,
    );
    gradient.addColorStop(0, sceneBackground.gradient.from);
    const { mid, midPosition = 50, midWidth = 0 } = sceneBackground.gradient;
    if (mid) {
      const half = midWidth / 2;
      const start = Math.max(0, midPosition - half) / 100;
      const end = Math.min(100, midPosition + half) / 100;
      gradient.addColorStop(start, mid);
      if (midWidth > 0) gradient.addColorStop(end, mid);
    }
    gradient.addColorStop(1, sceneBackground.gradient.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new CanvasTexture(canvas);
  }, [sceneBackground]);

  const { scene } = useThree();
  useEffect(() => {
    if (bgTexture) {
      scene.background = bgTexture;
      return () => {
        bgTexture.dispose();
      };
    }
    if (sceneBackground?.mode === "image" && sceneBackgroundImageUrl) {
      let disposed = false;
      const img = new Image();
      img.onload = () => {
        if (disposed) return;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        applyColorAdjustment(
          ctx,
          sceneBackgroundImageSaturation,
          sceneBackgroundImageBrightness,
        );
        const tex = new CanvasTexture(canvas);
        tex.colorSpace = SRGBColorSpace;
        scene.background = tex;
      };
      img.src = sceneBackgroundImageUrl;
      return () => {
        disposed = true;
      };
    }
    scene.background = new Color(bgColor);
    return undefined;
  }, [
    bgTexture,
    bgColor,
    sceneBackground,
    sceneBackgroundImageUrl,
    sceneBackgroundImageSaturation,
    sceneBackgroundImageBrightness,
    scene,
  ]);

  return (
    <>
      {/* Scene background color (録画時にも反映) — gradient 以外で使用 */}
      {!bgTexture && <color attach="background" args={[bgColor]} />}

      {/* Enhanced Lighting */}
      <ambientLight
        intensity={SCENE_LIGHTING.AMBIENT_INTENSITY}
        color={SCENE_LIGHTING.AMBIENT_COLOR}
      />

      {/* Main spotlight from above */}
      <spotLight
        position={[0, SCENE_LIGHTING.MAIN_SPOT.Y, 0]}
        angle={SCENE_LIGHTING.MAIN_SPOT.ANGLE}
        penumbra={SCENE_LIGHTING.MAIN_SPOT.PENUMBRA}
        intensity={SCENE_LIGHTING.MAIN_SPOT.INTENSITY}
        castShadow
        color="#ffffff"
      />

      {/* Side fill lights */}
      <spotLight
        position={[10, 12, 8]}
        angle={SCENE_LIGHTING.SIDE_FILL.ANGLE}
        penumbra={SCENE_LIGHTING.SIDE_FILL.PENUMBRA}
        intensity={SCENE_LIGHTING.SIDE_FILL.INTENSITY}
        color={SCENE_LIGHTING.SIDE_FILL.COLOR}
      />
      <spotLight
        position={[-10, 12, 8]}
        angle={SCENE_LIGHTING.SIDE_FILL.ANGLE}
        penumbra={SCENE_LIGHTING.SIDE_FILL.PENUMBRA}
        intensity={SCENE_LIGHTING.SIDE_FILL.INTENSITY}
        color={SCENE_LIGHTING.SIDE_FILL.COLOR}
      />

      {/* Accent point lights for dramatic effect */}
      <pointLight
        position={[0, 5, 5]}
        intensity={0.5}
        color="#60a5fa"
        distance={15}
      />
      <pointLight
        position={[5, 3, 0]}
        intensity={0.3}
        color="#818cf8"
        distance={10}
      />
      <pointLight
        position={[-5, 3, 0]}
        intensity={0.3}
        color="#818cf8"
        distance={10}
      />

      {/* Rim light from behind */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.5}
        color="#3b82f6"
      />

      {/* Main pitch */}
      <Pitch
        gameMode={pc.gameMode}
        pitchColor={pitchColor}
        pitchOpacity={pitchOpacity}
      />

      {/* 空フィールドクリックで選択解除（配置モード時は不要） */}
      {onEmptyFieldClick &&
        !opponentPlacementMode &&
        !ballPlacementMode &&
        !lineTrackingActive && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, 0]}
            onPointerDown={handleEmptyFieldPointerDown}
            onPointerUp={handleEmptyFieldPointerUp}
          >
            <planeGeometry args={[pc.fieldWidth + 4, pc.fieldLength + 4]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}

      {/* フィールドクリック検出用の透明プレーン（配置モード時有効） */}
      {(opponentPlacementMode || ballPlacementMode) && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, FIELD_CLICK_PLANE.Y_POSITION, 0]}
          onPointerDown={handleFieldPointerDown}
          onPointerUp={handleFieldPointerUp}
          onPointerOver={handleFieldPointerOver}
          onPointerOut={handleFieldPointerOut}
        >
          <planeGeometry args={[pc.fieldWidth, pc.fieldLength]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* ライン描画中のマウス追従プレーン（始点選手選択済み時） */}
      {lineTrackingActive && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          onPointerMove={handleLinePointerMove}
        >
          <planeGeometry args={[pc.fieldWidth, pc.fieldLength]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Ball Highlight (set phase) */}
      {ballHighlightPosition && (
        <BallHighlight position={ballHighlightPosition} />
      )}

      {/* Ball Marker */}
      {ballPosition && (
        <BallMarker
          position={ballPosition}
          onDrag={onBallDrag}
          onRemove={onBallRemove}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          fieldBounds={bounds}
        />
      )}

      {/* Opponent Markers */}
      {opponents.map((opp, index) => (
        <OpponentMarker
          key={opp.id}
          id={opp.id}
          position={opp}
          number={opp.playerNumber ?? index + 1}
          name={opp.playerName}
          color={opp.color}
          onDrag={onOpponentDrag}
          onRemove={onOpponentRemove}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onClick={onOpponentClick}
          isSelected={
            selectedOpponentIds
              ? selectedOpponentIds.has(opp.id)
              : opp.id === selectedOpponentId
          }
          showName={showOpponentNames}
          labelFixed={labelFixed}
          onGroupDragEnd={onGroupDragEnd}
          groupDragState={groupDragRef}
          fieldBounds={bounds}
          markerScale={playerMarkerScale}
        />
      ))}

      {/* Player Connection Lines */}
      {(connectionLines.length > 0 || pendingConnectionLine) && (
        <PlayerConnectionLines
          lines={connectionLines}
          formation={formation}
          playerPositions={playerPositions}
          pendingLine={pendingConnectionLine}
          onLineRemove={onConnectionLineRemove}
        />
      )}

      {/* Players */}
      {formation.map((pos, index) => (
        <Player
          key={index}
          position={pos}
          targetPosition={playerPositions[index]}
          color={colors[pos.cat]}
          number={players[index]?.number || index + 1}
          name={players[index]?.name}
          imageUrl={players[index]?.imageUrl}
          showName={showPlayerNames && !hiddenPlayerIndices.has(index)}
          showNumber={showPlayerNumbers}
          showPhoto={showPlayerPhotos}
          labelFixed={labelFixed}
          index={index}
          card={playerCards[index] || "none"}
          onClick={onPlayerClick}
          isSelected={
            selectedPlayerIndices
              ? selectedPlayerIndices.has(index)
              : index === selectedPlayerIndex
          }
          markerScale={playerMarkerScale}
          draggable={playerDraggable}
          onDragStart={onDragStart}
          onDragEnd={onPlayerDragEnd}
          onGroupDragEnd={onGroupDragEnd}
          groupDragState={groupDragRef}
          fieldBounds={bounds}
        />
      ))}

      {/* Arrows */}
      {arrows.map((arrow, index) => (
        <Arrow
          key={`a${index}_${arrow.start.x}_${arrow.start.z}_${arrow.end.x}_${arrow.end.z}`}
          start={arrow.start}
          end={arrow.end}
          color={arrow.color}
        />
      ))}

      {/* Ball Trajectories */}
      {ballTrajectories.map((trajectory, index) => (
        <BallTrajectory
          key={`t${index}_${trajectory.start.x}_${trajectory.start.z}_${trajectory.end.x}_${trajectory.end.z}`}
          start={trajectory.start}
          end={trajectory.end}
          color={trajectory.color}
          trajectoryType={trajectory.trajectoryType}
        />
      ))}

      {/* Team Name - bottom left of field */}
      {teamName && (
        <group position={[5.7, 0.02, -4.5]}>
          {/* Accent line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.12, 0.001, 0]}>
            <planeGeometry args={[0.04, 0.3]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
            fontSize={0.18}
            color="#e2e8f0"
            anchorX="left"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.08}
          >
            {teamName.toUpperCase()}
          </Text>
        </group>
      )}

      {/* Opponent Team Name - top right of field (diagonal from own team) */}
      {opponentTeamName && opponents.length > 0 && (
        <group position={[-5.7, 0.02, 4.5]}>
          {/* Accent line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.12, 0.001, 0]}>
            <planeGeometry args={[0.04, 0.3]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <Text
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="left"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.08}
          >
            {opponentTeamName.toUpperCase()}
          </Text>
        </group>
      )}

      {/* Camera controls + プレイヤー視点追跡 */}
      <PlayerCameraController
        selectedPlayerIndex={selectedPlayerIndex}
        playerPositions={playerPositions}
        isPlayerView={isPlayerView}
        isDraggingObject={isDraggingObject}
        selectedOpponentId={selectedOpponentId}
        opponentPositions={opponents}
        pitchConfig={pc}
        fieldLocked={fieldLocked}
        touchlineLocked={touchlineLocked}
        cameraAction={cameraAction}
        onCameraActionDone={onCameraActionDone}
        yawNudgeRef={yawNudgeRef}
        isFirstPerson={isFirstPerson}
      />
    </>
  );
});
