/**
 * @module useUndoRedo フック
 * @description Undo/Redo 履歴管理フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な状態管理ロジック）
 * - スナップショットのpush / undo / redo 操作と履歴スタック管理を検証
 * - 最大履歴数制限と古いスナップショットの自動破棄を検証
 * - canUndo / canRedo の状態遷移を検証
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUndoRedo, TacticsSnapshot } from "../useUndoRedo";

function createSnapshot(overrides?: Partial<TacticsSnapshot>): TacticsSnapshot {
  return {
    manualPlayerPositions: {},
    opponents: [],
    ballPosition: null,
    connectionLines: [],
    playerCards: {},
    managerCard: "none",
    ...overrides,
  };
}

describe("useUndoRedo", () => {
  it("初期状態では canUndo/canRedo が false", () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("1つ push すると canUndo は false のまま（1件目は起点）", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.pushSnapshot(createSnapshot()));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("2つ push すると canUndo が true になる", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.pushSnapshot(createSnapshot()));
    act(() =>
      result.current.pushSnapshot(
        createSnapshot({ ballPosition: { x: 1, z: 2 } }),
      ),
    );
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo で前のスナップショットが返る", () => {
    const { result } = renderHook(() => useUndoRedo());
    const s1 = createSnapshot();
    const s2 = createSnapshot({ ballPosition: { x: 1, z: 2 } });
    act(() => result.current.pushSnapshot(s1));
    act(() => result.current.pushSnapshot(s2));

    let undone: TacticsSnapshot | null = null;
    act(() => {
      undone = result.current.undo();
    });
    expect(undone).not.toBeNull();
    expect(undone!.ballPosition).toBeNull();
    expect(result.current.canRedo).toBe(true);
  });

  it("redo で次のスナップショットが返る", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.pushSnapshot(createSnapshot()));
    act(() =>
      result.current.pushSnapshot(
        createSnapshot({ ballPosition: { x: 5, z: 5 } }),
      ),
    );
    act(() => {
      result.current.undo();
    });

    let redone: TacticsSnapshot | null = null;
    act(() => {
      redone = result.current.redo();
    });
    expect(redone).not.toBeNull();
    expect(redone!.ballPosition).toEqual({ x: 5, z: 5 });
    expect(result.current.canRedo).toBe(false);
  });

  it("undo 後に push すると redo 履歴が破棄される", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.pushSnapshot(createSnapshot()));
    act(() =>
      result.current.pushSnapshot(
        createSnapshot({ ballPosition: { x: 1, z: 1 } }),
      ),
    );
    act(() =>
      result.current.pushSnapshot(
        createSnapshot({ ballPosition: { x: 2, z: 2 } }),
      ),
    );
    // undo to s2
    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    // push new → redo should be gone
    act(() =>
      result.current.pushSnapshot(
        createSnapshot({ ballPosition: { x: 9, z: 9 } }),
      ),
    );
    expect(result.current.canRedo).toBe(false);
  });

  it("MAX_HISTORY (50) を超えると古い履歴が捨てられる", () => {
    const { result } = renderHook(() => useUndoRedo());
    for (let i = 0; i < 55; i++) {
      act(() =>
        result.current.pushSnapshot(
          createSnapshot({ manualPlayerPositions: { [i]: { x: i, z: i } } }),
        ),
      );
    }
    // Should still be able to undo 49 times (50 entries, index at 49)
    let undoCount = 0;
    let snapshot: TacticsSnapshot | null = null;
    do {
      act(() => {
        snapshot = result.current.undo();
      });
      if (snapshot) undoCount++;
    } while (snapshot);
    expect(undoCount).toBe(49);
  });

  it("undo が不可能な状態では null を返す", () => {
    const { result } = renderHook(() => useUndoRedo());
    let undone: TacticsSnapshot | null = null;
    act(() => {
      undone = result.current.undo();
    });
    expect(undone).toBeNull();
  });

  it("redo が不可能な状態では null を返す", () => {
    const { result } = renderHook(() => useUndoRedo());
    let redone: TacticsSnapshot | null = null;
    act(() => {
      redone = result.current.redo();
    });
    expect(redone).toBeNull();
  });

  it("resetHistory で全履歴がクリアされる", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.pushSnapshot(createSnapshot()));
    act(() =>
      result.current.pushSnapshot(
        createSnapshot({ ballPosition: { x: 1, z: 1 } }),
      ),
    );
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.resetHistory());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("返されるスナップショットは deep clone（元と独立）", () => {
    const { result } = renderHook(() => useUndoRedo());
    const original = createSnapshot({
      manualPlayerPositions: { 0: { x: 1, z: 1 } },
    });
    act(() => result.current.pushSnapshot(original));
    act(() => result.current.pushSnapshot(createSnapshot()));

    let undone: TacticsSnapshot | null = null;
    act(() => {
      undone = result.current.undo();
    });
    // Mutate the returned object
    undone!.manualPlayerPositions[0] = { x: 99, z: 99 };

    // Original should be unaffected
    expect(original.manualPlayerPositions[0]).toEqual({ x: 1, z: 1 });
  });
});
