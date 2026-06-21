/**
 * @module PlayerConnectionLines
 * @description 選手間の接続ラインを3Dシーン上にレンダリングするコンポーネント。ライン描画・クリック削除・ペンディングラインプレビューを表示する。
 */
import { memo, useRef, useCallback, useMemo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending, type Mesh } from "three";
import {
  computeLineAngle,
  computeMidpoint,
  computeLineLength,
} from "@presentation/utils/threeCalculations";

/** 選手インデックスベースのライン定義 */
export interface ConnectionLine {
  id: number;
  fromIndex: number;
  toIndex: number;
  color: string;
}

interface PlayerConnectionLinesProps {
  lines: ConnectionLine[];
  formation: Array<{ pos: string; x: number; z: number; cat: string }>;
  playerPositions: Record<number, { x: number; z: number }>;
  /** 描画中の仮ライン（始点の選手確定→マウス追従中の終点座標） */
  pendingLine?: {
    fromIndex: number;
    endPos: { x: number; z: number };
    color: string;
  } | null;
  onLineRemove?: (id: number) => void;
}

/**
 * 選手をクリックして2人の間にラインを引くコンポーネント
 * 選手の位置に追従する
 */
export const PlayerConnectionLines = memo(function PlayerConnectionLines({
  lines,
  formation,
  playerPositions,
  pendingLine,
  onLineRemove,
}: PlayerConnectionLinesProps) {
  const getPos = (index: number): { x: number; z: number } => {
    return (
      playerPositions[index] || {
        x: formation[index]?.x || 0,
        z: formation[index]?.z || 0,
      }
    );
  };

  return (
    <group>
      {lines.map((line) => (
        <DrawnLine
          key={line.id}
          start={getPos(line.fromIndex)}
          end={getPos(line.toIndex)}
          color={line.color}
          onRemove={() => onLineRemove?.(line.id)}
        />
      ))}
      {pendingLine && (
        <DrawnLine
          start={getPos(pendingLine.fromIndex)}
          end={pendingLine.endPos}
          color={pendingLine.color}
          isPending
        />
      )}
    </group>
  );
});

const VISIBLE_LINE_WIDTH = 0.045;
const VISIBLE_LINE_HEIGHT = 0.018;
const VISIBLE_LINE_Y = 0.16;
const MIN_LINE_LENGTH = 0.001;
const HIT_LINE_WIDTH = 0.36;
const HIT_LINE_HEIGHT = 0.12;
const MIN_HIT_LENGTH = 0.1;
const LINE_RENDER_ORDER = 40;

const DrawnLine = memo(function DrawnLine({
  start,
  end,
  color,
  isPending = false,
  onRemove,
}: {
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
  isPending?: boolean;
  onRemove?: () => void;
}) {
  const visibleLineRef = useRef<Mesh>(null);
  const hitRef = useRef<Mesh>(null);

  // 幾何計算をメモ化（座標値が変わらなければ再計算しない）
  // start/end はオブジェクト参照が毎フレーム変わるため、個別プロパティで比較（意図的な最適化）
  /* eslint-disable react-hooks/exhaustive-deps */
  const midpoint = useMemo(
    () => computeMidpoint(start, end),
    [start.x, start.z, end.x, end.z],
  );
  const angle = useMemo(
    () => computeLineAngle(start, end),
    [start.x, start.z, end.x, end.z],
  );
  const lineLength = useMemo(
    () => computeLineLength(start, end),
    [start.x, start.z, end.x, end.z],
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  useFrame(() => {
    const currentMidpoint = computeMidpoint(start, end);
    const currentAngle = computeLineAngle(start, end);
    const currentLength = Math.max(
      computeLineLength(start, end),
      MIN_LINE_LENGTH,
    );

    if (visibleLineRef.current) {
      visibleLineRef.current.position.set(
        currentMidpoint.x,
        VISIBLE_LINE_Y,
        currentMidpoint.z,
      );
      visibleLineRef.current.rotation.set(0, currentAngle, 0);
      visibleLineRef.current.scale.set(
        VISIBLE_LINE_WIDTH,
        VISIBLE_LINE_HEIGHT,
        currentLength,
      );
    }

    // 右クリック削除用ヒットエリアの位置・回転を更新
    if (hitRef.current) {
      hitRef.current.position.set(
        currentMidpoint.x,
        VISIBLE_LINE_Y,
        currentMidpoint.z,
      );
      hitRef.current.rotation.set(0, currentAngle, 0);
      hitRef.current.scale.set(
        HIT_LINE_WIDTH,
        HIT_LINE_HEIGHT,
        Math.max(currentLength, MIN_HIT_LENGTH),
      );
    }
  });

  const handleDoubleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove],
  );

  const handleContextMenu = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      e.nativeEvent.preventDefault();
      onRemove?.();
    },
    [onRemove],
  );

  return (
    <group>
      <mesh
        ref={visibleLineRef}
        position={[midpoint.x, VISIBLE_LINE_Y, midpoint.z]}
        rotation={[0, angle, 0]}
        scale={[
          VISIBLE_LINE_WIDTH,
          VISIBLE_LINE_HEIGHT,
          Math.max(lineLength, MIN_LINE_LENGTH),
        ]}
        frustumCulled={false}
        renderOrder={LINE_RENDER_ORDER}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isPending ? 0.45 : 0.72}
          depthTest={false}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* 右クリック削除用の透明ヒットエリア（確定済みラインのみ） */}
      {!isPending && onRemove && lineLength > 0.1 && (
        <mesh
          ref={hitRef}
          position={[midpoint.x, VISIBLE_LINE_Y, midpoint.z]}
          rotation={[0, angle, 0]}
          scale={[HIT_LINE_WIDTH, HIT_LINE_HEIGHT, Math.max(lineLength, 0.1)]}
          frustumCulled={false}
          renderOrder={LINE_RENDER_ORDER}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
});
