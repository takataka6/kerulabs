/**
 * @module useSnapshotManagement
 * @description スナップショットの記録・同期・復元・Undo/Redo操作を統合するフック。
 * TacticsViewerPageからスナップショット管理ロジックを抽出。
 *
 * ref ベースのパターンにより、pushCurrentSnapshot / resetHistory は
 * フック呼び出し直後から利用可能。sources / setters は毎レンダーで ref に同期される。
 */
import { useCallback, useRef } from "react";
import { useUndoRedo, type TacticsSnapshot } from "./useUndoRedo";
import { useUndoRedoKeyboard } from "./useUndoRedoKeyboard";

interface SnapshotSetters {
  setManualPlayerPositions: (
    positions: Record<number, { x: number; z: number }>,
  ) => void;
  setOpponents: (opponents: TacticsSnapshot["opponents"]) => void;
  setBallPosition: (pos: { x: number; z: number } | null) => void;
  setConnectionLines: (lines: TacticsSnapshot["connectionLines"]) => void;
  setPlayerCards: (cards: TacticsSnapshot["playerCards"]) => void;
  setManagerCard: (card: TacticsSnapshot["managerCard"]) => void;
}

/**
 * スナップショットの記録・同期・復元・Undo/Redo を統合管理するフック。
 *
 * 呼び出し直後から pushCurrentSnapshot / resetHistory が利用可能。
 * syncSources() を毎レンダーで呼び出して snapshotRef を最新に保つ。
 * syncSetters() を毎レンダーで呼び出して復元先を最新に保つ。
 */
export function useSnapshotManagement() {
  const { pushSnapshot, undo, redo, canUndo, canRedo, resetHistory } =
    useUndoRedo();

  const snapshotRef = useRef<TacticsSnapshot>({
    manualPlayerPositions: {},
    opponents: [],
    ballPosition: null,
    connectionLines: [],
    playerCards: {},
    managerCard: "none",
  });

  const settersRef = useRef<SnapshotSetters | null>(null);
  const undoRedoEnabledRef = useRef(true);

  const pushCurrentSnapshot = useCallback(() => {
    pushSnapshot(snapshotRef.current);
  }, [pushSnapshot]);

  /** 毎レンダーで呼び出し、snapshotRef を最新状態に同期する */
  const syncSources = useCallback((sources: TacticsSnapshot) => {
    snapshotRef.current = sources;
  }, []);

  /** 毎レンダーで呼び出し、復元先 setters を最新に保つ */
  const syncSetters = useCallback(
    (setters: SnapshotSetters, undoRedoEnabled: boolean) => {
      settersRef.current = setters;
      undoRedoEnabledRef.current = undoRedoEnabled;
    },
    [],
  );

  const restoreSnapshot = useCallback((snapshot: TacticsSnapshot) => {
    if (!settersRef.current) return;
    settersRef.current.setManualPlayerPositions(snapshot.manualPlayerPositions);
    settersRef.current.setOpponents(snapshot.opponents);
    settersRef.current.setBallPosition(snapshot.ballPosition);
    settersRef.current.setConnectionLines(snapshot.connectionLines);
    settersRef.current.setPlayerCards(snapshot.playerCards);
    settersRef.current.setManagerCard(snapshot.managerCard);
  }, []);

  const handleUndo = useCallback(() => {
    if (!undoRedoEnabledRef.current) return;
    const snapshot = undo();
    if (snapshot) restoreSnapshot(snapshot);
  }, [undo, restoreSnapshot]);

  const handleRedo = useCallback(() => {
    if (!undoRedoEnabledRef.current) return;
    const snapshot = redo();
    if (snapshot) restoreSnapshot(snapshot);
  }, [redo, restoreSnapshot]);

  // handleUndo / handleRedo 内で undoRedoEnabledRef を参照するため、
  // キーボードショートカット自体は常に有効にしておく
  useUndoRedoKeyboard({
    enabled: true,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  return {
    pushCurrentSnapshot,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    resetHistory,
    syncSources,
    syncSetters,
  };
}
