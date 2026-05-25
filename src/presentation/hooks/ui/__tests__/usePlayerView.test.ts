/**
 * @module usePlayerView フック
 * @description 選手視点カメラモードの管理フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な状態管理ロジック）
 * - playerViewEnabled のトグルと選手/相手の選択・解除を検証
 * - 選手ビューモード解除時の選択状態クリアを検証
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayerView } from "../usePlayerView";

describe("usePlayerView", () => {
  it("初期状態: playerViewEnabled=false、選択なし", () => {
    const { result } = renderHook(() => usePlayerView());
    expect(result.current.playerViewEnabled).toBe(false);
    expect(result.current.selectedPlayerIndex).toBeNull();
    expect(result.current.selectedOpponentViewId).toBeNull();
  });

  it("togglePlayerView で ON にできる", () => {
    const { result } = renderHook(() => usePlayerView());
    act(() => result.current.togglePlayerView());
    expect(result.current.playerViewEnabled).toBe(true);
  });

  it("togglePlayerView で OFF にできる", () => {
    const { result } = renderHook(() => usePlayerView());
    act(() => result.current.togglePlayerView()); // ON
    act(() => result.current.togglePlayerView()); // OFF
    expect(result.current.playerViewEnabled).toBe(false);
  });

  it("ON 時に onResetDragging が呼ばれる", () => {
    const onResetDragging = vi.fn();
    const { result } = renderHook(() => usePlayerView(onResetDragging));
    act(() => result.current.togglePlayerView());
    expect(onResetDragging).toHaveBeenCalledOnce();
  });

  it("playerViewEnabled=true のとき選手クリックで選択される", () => {
    const { result } = renderHook(() => usePlayerView());
    act(() => result.current.togglePlayerView());
    act(() => result.current.handlePlayerClickForView(3));
    expect(result.current.selectedPlayerIndex).toBe(3);
    expect(result.current.selectedOpponentViewId).toBeNull();
  });

  it("playerViewEnabled=false のとき選手クリックは無視される", () => {
    const { result } = renderHook(() => usePlayerView());
    act(() => result.current.handlePlayerClickForView(3));
    expect(result.current.selectedPlayerIndex).toBeNull();
  });

  it("相手クリックで opponent が選択され、player がクリアされる", () => {
    const { result } = renderHook(() => usePlayerView());
    act(() => result.current.togglePlayerView());
    act(() => result.current.handlePlayerClickForView(2));
    act(() => result.current.handleOpponentViewClick(5));
    expect(result.current.selectedOpponentViewId).toBe(5);
    expect(result.current.selectedPlayerIndex).toBeNull();
  });

  it("playerViewEnabled=false のとき相手クリックは無視される", () => {
    const { result } = renderHook(() => usePlayerView());
    act(() => result.current.handleOpponentViewClick(5));
    expect(result.current.selectedOpponentViewId).toBeNull();
  });

  it("exitPlayerView で全状態がリセットされる", () => {
    const { result } = renderHook(() => usePlayerView());
    act(() => result.current.togglePlayerView());
    act(() => result.current.handlePlayerClickForView(2));
    act(() => result.current.exitPlayerView());
    expect(result.current.playerViewEnabled).toBe(false);
    expect(result.current.selectedPlayerIndex).toBeNull();
    expect(result.current.selectedOpponentViewId).toBeNull();
  });
});
