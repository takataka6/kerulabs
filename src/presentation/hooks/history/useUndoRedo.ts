/**
 * @module useUndoRedo
 * @description タクティクス編集のUndo/Redo履歴管理フック。スナップショットベースの線形履歴を保持する。
 */
import { useState, useCallback, useRef } from "react";
import type { CardStatus } from "../../components/three/SceneTypes";

export interface TacticsSnapshot {
  manualPlayerPositions: Record<number, { x: number; z: number }>;
  opponents: Array<{
    id: number;
    x: number;
    z: number;
    playerNumber?: number;
    playerName?: string;
    playerPosition?: string;
    color?: string;
    playerId?: string;
  }>;
  ballPosition: { x: number; z: number } | null;
  connectionLines: Array<{
    id: number;
    fromIndex: number;
    toIndex: number;
    color: string;
  }>;
  playerCards: Record<number, CardStatus>;
  managerCard: CardStatus;
}

const MAX_HISTORY = 50;

/**
 * タクティクス編集の Undo/Redo 履歴管理。
 *
 * スナップショットベースの線形履歴を保持し、最大 {@link MAX_HISTORY} 件まで遡れる。
 * 途中の操作後に新しいスナップショットを push すると、それ以降の Redo 履歴は破棄される。
 *
 * @returns 状態を記録する `pushSnapshot`、履歴を操作する `undo` / `redo`、
 *          `canUndo` / `canRedo` フラグ、および全エントリをクリアする `resetHistory`。
 */
export function useUndoRedo() {
  const historyRef = useRef<TacticsSnapshot[]>([]);
  const indexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  const pushSnapshot = useCallback(
    (snapshot: TacticsSnapshot) => {
      const history = historyRef.current;

      // 現在のインデックスより先の未来エントリを破棄
      if (indexRef.current < history.length - 1) {
        history.splice(indexRef.current + 1);
      }

      history.push(structuredClone(snapshot));

      // 最大履歴サイズを超えた場合、古いエントリを削除
      if (history.length > MAX_HISTORY) {
        history.shift();
      }

      indexRef.current = history.length - 1;
      updateFlags();
    },
    [updateFlags],
  );

  const undo = useCallback((): TacticsSnapshot | null => {
    if (indexRef.current <= 0) return null;
    indexRef.current -= 1;
    updateFlags();
    return structuredClone(historyRef.current[indexRef.current]);
  }, [updateFlags]);

  const redo = useCallback((): TacticsSnapshot | null => {
    if (indexRef.current >= historyRef.current.length - 1) return null;
    indexRef.current += 1;
    updateFlags();
    return structuredClone(historyRef.current[indexRef.current]);
  }, [updateFlags]);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
    indexRef.current = -1;
    updateFlags();
  }, [updateFlags]);

  return { pushSnapshot, undo, redo, canUndo, canRedo, resetHistory };
}
