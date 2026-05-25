/**
 * @module useSnapshotManagement テスト
 * @description スナップショット管理フックの単体テスト。
 * pushCurrentSnapshot / syncSources / syncSetters / handleUndo / handleRedo の動作を検証する。
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSnapshotManagement } from "../useSnapshotManagement";

describe("useSnapshotManagement", () => {
  const createSetters = () => ({
    setManualPlayerPositions: vi.fn(),
    setOpponents: vi.fn(),
    setBallPosition: vi.fn(),
    setConnectionLines: vi.fn(),
    setPlayerCards: vi.fn(),
    setManagerCard: vi.fn(),
  });

  const createSources = (overrides = {}) => ({
    manualPlayerPositions: {},
    opponents: [],
    ballPosition: null,
    connectionLines: [],
    playerCards: {},
    managerCard: "none" as const,
    ...overrides,
  });

  it("pushCurrentSnapshot / resetHistory を即座に返す", () => {
    const { result } = renderHook(() => useSnapshotManagement());

    expect(result.current.pushCurrentSnapshot).toBeInstanceOf(Function);
    expect(result.current.resetHistory).toBeInstanceOf(Function);
  });

  it("syncSources で同期した状態を pushCurrentSnapshot で記録し、undo で復元できる", () => {
    const setters = createSetters();
    const { result } = renderHook(() => useSnapshotManagement());

    // 初期状態を記録
    act(() => {
      result.current.syncSources(createSources());
      result.current.syncSetters(setters, true);
      result.current.pushCurrentSnapshot();
    });

    // 変更後の状態を記録
    const changedSources = createSources({
      manualPlayerPositions: { 0: { x: 1, z: 2 } },
    });
    act(() => {
      result.current.syncSources(changedSources);
      result.current.pushCurrentSnapshot();
    });

    // undo で初期状態に復元
    act(() => {
      result.current.handleUndo();
    });

    expect(setters.setManualPlayerPositions).toHaveBeenCalledWith({});
  });

  it("undoRedoEnabled が false のとき undo/redo は実行されない", () => {
    const setters = createSetters();
    const { result } = renderHook(() => useSnapshotManagement());

    act(() => {
      result.current.syncSources(createSources());
      result.current.syncSetters(setters, false);
      result.current.pushCurrentSnapshot();
    });

    act(() => {
      result.current.syncSources(
        createSources({ manualPlayerPositions: { 0: { x: 1, z: 2 } } }),
      );
      result.current.pushCurrentSnapshot();
    });

    act(() => {
      result.current.handleUndo();
    });

    // setters は呼ばれない
    expect(setters.setManualPlayerPositions).not.toHaveBeenCalled();
  });

  it("canUndo / canRedo が正しく更新される", () => {
    const { result } = renderHook(() => useSnapshotManagement());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.syncSources(createSources());
      result.current.syncSetters(createSetters(), true);
      result.current.pushCurrentSnapshot();
    });

    // 1件だけではundoできない
    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.pushCurrentSnapshot();
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.handleUndo();
    });

    expect(result.current.canRedo).toBe(true);
  });
});
