/**
 * @module useMultiSelect フック
 * @description 複数選択（矩形選択）フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な状態管理ロジック）
 * - 矩形選択の開始・更新・確定・キャンセルの状態遷移を検証
 * - 個別選択（toggle）とクリアの動作を検証
 * - hasSelection / isRectSelecting の派生状態を検証
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMultiSelect } from "../useMultiSelect";

describe("useMultiSelect", () => {
  it("初期状態: selectedItems が空配列", () => {
    const { result } = renderHook(() => useMultiSelect());
    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.isRectSelecting).toBe(false);
    expect(result.current.rectStart).toBeNull();
    expect(result.current.rectEnd).toBeNull();
  });

  it("toggleItem: プレイヤーを追加できる", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 3 }));
    expect(result.current.selectedItems).toEqual([
      { type: "player", index: 3 },
    ]);
  });

  it("toggleItem: 同じプレイヤーを再度トグルすると解除される", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 3 }));
    act(() => result.current.toggleItem({ type: "player", index: 3 }));
    expect(result.current.selectedItems).toEqual([]);
  });

  it("selectSingle: 単一選択に切り替わる", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 1 }));
    act(() => result.current.toggleItem({ type: "player", index: 2 }));
    expect(result.current.selectedItems).toHaveLength(2);

    act(() => result.current.selectSingle({ type: "player", index: 5 }));
    expect(result.current.selectedItems).toEqual([
      { type: "player", index: 5 },
    ]);
  });

  it("clearSelection: 選択がクリアされる", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 1 }));
    act(() => result.current.toggleItem({ type: "opponent", id: 10 }));
    expect(result.current.selectedItems).toHaveLength(2);

    act(() => result.current.clearSelection());
    expect(result.current.selectedItems).toEqual([]);
  });

  it("selectedPlayerIndices: プレイヤーのインデックスのみの Set", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 1 }));
    act(() => result.current.toggleItem({ type: "opponent", id: 10 }));
    act(() => result.current.toggleItem({ type: "player", index: 5 }));

    expect(result.current.selectedPlayerIndices).toEqual(new Set([1, 5]));
  });

  it("selectedOpponentIds: 対戦相手の ID のみの Set", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 1 }));
    act(() => result.current.toggleItem({ type: "opponent", id: 10 }));
    act(() => result.current.toggleItem({ type: "opponent", id: 20 }));

    expect(result.current.selectedOpponentIds).toEqual(new Set([10, 20]));
  });

  it("hasSelection: 2つ以上選択時に true", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 1 }));
    expect(result.current.hasSelection).toBe(false);

    act(() => result.current.toggleItem({ type: "player", index: 2 }));
    expect(result.current.hasSelection).toBe(true);
  });

  it("Escape キーで選択がクリアされる", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.toggleItem({ type: "player", index: 1 }));
    act(() => result.current.toggleItem({ type: "player", index: 2 }));
    expect(result.current.selectedItems).toHaveLength(2);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.selectedItems).toEqual([]);
  });

  it("startRectSelect: 矩形選択を開始する", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.startRectSelect({ x: 10, y: 20 }));
    expect(result.current.isRectSelecting).toBe(true);
    expect(result.current.rectStart).toEqual({ x: 10, y: 20 });
    expect(result.current.rectEnd).toEqual({ x: 10, y: 20 });
  });

  it("updateRectSelect: 矩形選択中でない場合は rectEnd を更新しない", () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => result.current.updateRectSelect({ x: 50, y: 60 }));
    expect(result.current.rectEnd).toBeNull();
  });
});
