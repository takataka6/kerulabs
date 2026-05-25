/**
 * @module PlayerConnectionLines
 * @description 選手間の接続ラインを3Dシーン上にレンダリングするコンポーネント。ライン描画・クリック削除・ペンディングラインプレビューを表示する。
 */
import { memo, useRef, useCallback, useEffect, useMemo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  type BufferGeometry,
  type Mesh,
} from "three";
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
  const lineRef = useRef<BufferGeometry>(null);
  const hitRef = useRef<Mesh>(null);
  const posArray = useRef(new Float32Array([0, 0.06, 0, 0, 0.06, 0]));

  // bufferAttribute の初期設定（render 中の ref アクセスを回避）
  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.setAttribute(
        "position",
        new BufferAttribute(posArray.current, 3),
      );
    }
  }, []);

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
    // ライン頂点を毎フレーム更新
    const arr = posArray.current;
    arr[0] = start.x;
    arr[2] = start.z;
    arr[3] = end.x;
    arr[5] = end.z;

    if (lineRef.current) {
      const attr = lineRef.current.getAttribute("position") as BufferAttribute;
      if (attr) {
        attr.needsUpdate = true;
      }
    }

    // 右クリック削除用ヒットエリアの位置・回転を更新
    if (hitRef.current) {
      hitRef.current.position.x = midpoint.x;
      hitRef.current.position.z = midpoint.z;
      hitRef.current.rotation.set(-Math.PI / 2, 0, -angle);
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
      <line>
        <bufferGeometry ref={lineRef} />
        <lineBasicMaterial
          color={color}
          transparent
          opacity={isPending ? 0.4 : 0.7}
          depthWrite={false}
          blending={AdditiveBlending}
          linewidth={1}
        />
      </line>

      {/* 右クリック削除用の透明ヒットエリア（確定済みラインのみ） */}
      {!isPending && onRemove && lineLength > 0.1 && (
        <mesh
          ref={hitRef}
          position={[midpoint.x, 0.07, midpoint.z]}
          rotation={[-Math.PI / 2, 0, -angle]}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
        >
          <planeGeometry args={[0.3, Math.max(lineLength, 0.1)]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
});
