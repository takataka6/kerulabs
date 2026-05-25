/**
 * @module useConnectionLines フック
 * @description 選手間の接続線（コネクションライン）管理フックの単体テスト
 *
 * テスト方針:
 * - requestAnimationFrame をモック化してスナップショット保存を検証
 * - ライン描画モードのトグル・排他制御を検証
 * - ライン追加・削除・クリアの状態変化を検証
 * - ペンディング線の座標管理を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConnectionLines } from "../useConnectionLines";

describe("useConnectionLines", () => {
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

  it("初期状態: ライン空、描画モード OFF、色は cyan", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    expect(result.current.connectionLines).toEqual([]);
    expect(result.current.lineDrawingMode).toBe(false);
    expect(result.current.lineColor).toBe("#22d3ee");
  });

  it("toggleLineDrawing で描画モードを ON/OFF できる", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.toggleLineDrawing());
    expect(result.current.lineDrawingMode).toBe(true);
    expect(onDisableOtherModes).toHaveBeenCalledOnce();

    act(() => result.current.toggleLineDrawing());
    expect(result.current.lineDrawingMode).toBe(false);
  });

  it("2選手をクリックするとラインが追加される", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.handlePlayerClickForLine(0));
    expect(result.current.lineFromPlayerIndex).toBe(0);

    act(() => result.current.handlePlayerClickForLine(3));
    expect(result.current.connectionLines).toHaveLength(1);
    expect(result.current.connectionLines[0]).toMatchObject({
      fromIndex: 0,
      toIndex: 3,
      color: "#22d3ee",
    });
    expect(onPushSnapshot).toHaveBeenCalled();
  });

  it("同じ選手を2回クリックしてもラインは追加されない", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.handlePlayerClickForLine(2));
    act(() => result.current.handlePlayerClickForLine(2));
    expect(result.current.connectionLines).toHaveLength(0);
    expect(result.current.lineFromPlayerIndex).toBeNull();
  });

  it("ライン色を変更して新しいラインに反映される", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.setLineColor("#ff0000"));
    act(() => result.current.handlePlayerClickForLine(0));
    act(() => result.current.handlePlayerClickForLine(1));
    expect(result.current.connectionLines[0].color).toBe("#ff0000");
  });

  it("handleConnectionLineRemove でラインを削除できる", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.handlePlayerClickForLine(0));
    act(() => result.current.handlePlayerClickForLine(1));
    const lineId = result.current.connectionLines[0].id;

    act(() => result.current.handleConnectionLineRemove(lineId));
    expect(result.current.connectionLines).toHaveLength(0);
  });

  it("clearConnectionLines で全ラインがクリアされる", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.handlePlayerClickForLine(0));
    act(() => result.current.handlePlayerClickForLine(1));
    act(() => result.current.handlePlayerClickForLine(2));
    act(() => result.current.handlePlayerClickForLine(3));
    expect(result.current.connectionLines).toHaveLength(2);

    act(() => result.current.clearConnectionLines());
    expect(result.current.connectionLines).toHaveLength(0);
  });

  it("resetLineDrawingState で描画状態のみリセットされる", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.toggleLineDrawing());
    act(() => result.current.handlePlayerClickForLine(0));
    act(() => result.current.resetLineDrawingState());
    expect(result.current.lineDrawingMode).toBe(false);
    expect(result.current.lineFromPlayerIndex).toBeNull();
  });

  it("ラインIDは順番にインクリメントされる", () => {
    const { result } = renderHook(() =>
      useConnectionLines(onPushSnapshot, onDisableOtherModes),
    );
    act(() => result.current.handlePlayerClickForLine(0));
    act(() => result.current.handlePlayerClickForLine(1));
    act(() => result.current.handlePlayerClickForLine(2));
    act(() => result.current.handlePlayerClickForLine(3));
    expect(result.current.connectionLines[0].id).toBe(1);
    expect(result.current.connectionLines[1].id).toBe(2);
  });
});
