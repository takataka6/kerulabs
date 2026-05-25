/**
 * @module useBallPlacement フック
 * @description ボール配置操作のフックの単体テスト
 *
 * テスト方針:
 * - requestAnimationFrame をモック化してスナップショット保存のタイミングを検証
 * - handleBallPlace / handleBallDrag / handleBallRemove の状態変化を検証
 * - ballPlacementMode のトグルと排他制御（onDisableOtherModes）を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBallPlacement } from "../useBallPlacement";

describe("useBallPlacement", () => {
  let onPushSnapshot: ReturnType<typeof vi.fn>;
  let onDisableOtherModes: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onPushSnapshot = vi.fn();
    onDisableOtherModes = vi.fn();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  it("初期状態: ballPosition=null、ballPlacementMode=false", () => {
    const { result } = renderHook(() =>
      useBallPlacement(onPushSnapshot, onDisableOtherModes),
    );
    expect(result.current.ballPosition).toBeNull();
    expect(result.current.ballPlacementMode).toBe(false);
  });

  it("toggleBallPlacement でモードを ON/OFF できる", () => {
    const { result } = renderHook(() =>
      useBallPlacement(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.toggleBallPlacement());
    expect(result.current.ballPlacementMode).toBe(true);
    expect(onDisableOtherModes).toHaveBeenCalledOnce();
  });

  it("handleBallPlace でボールを配置し、モードが OFF になる", () => {
    const { result } = renderHook(() =>
      useBallPlacement(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.toggleBallPlacement());
    act(() => result.current.handleBallPlace({ x: 3, z: 4 }));
    expect(result.current.ballPosition).toEqual({ x: 3, z: 4 });
    expect(result.current.ballPlacementMode).toBe(false);
    expect(onPushSnapshot).toHaveBeenCalled();
  });

  it("handleBallDrag でボール位置を更新する（snapshot なし）", () => {
    const { result } = renderHook(() =>
      useBallPlacement(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.handleBallDrag({ x: 1, z: 2 }));
    expect(result.current.ballPosition).toEqual({ x: 1, z: 2 });
    expect(onPushSnapshot).not.toHaveBeenCalled();
  });

  it("handleBallRemove でボール位置を null にし snapshot を push", () => {
    const { result } = renderHook(() =>
      useBallPlacement(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.handleBallPlace({ x: 1, z: 1 }));
    onPushSnapshot.mockClear();

    act(() => result.current.handleBallRemove());
    expect(result.current.ballPosition).toBeNull();
    expect(onPushSnapshot).toHaveBeenCalled();
  });
});
