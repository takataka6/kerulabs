/**
 * @module useUIVisibility フック
 * @description UI表示/非表示フラグ管理フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な状態管理ロジック）
 * - 各パネル（選手管理・スカッド・凡例・サイドバー等）の表示フラグトグルを検証
 * - 排他的表示制御（他パネルの自動閉じ）を検証
 * - 初期状態のデフォルト値を検証
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUIVisibility } from "../useUIVisibility";

describe("useUIVisibility", () => {
  it("初期状態: 各フラグのデフォルト値が正しい", () => {
    const { result } = renderHook(() => useUIVisibility());

    expect(result.current.showPlayerManagement).toBe(false);
    expect(result.current.showSquadBuilder).toBe(false);
    expect(result.current.showFlowchart).toBe(false);
    expect(result.current.showPlayerNames).toBe(true);
    expect(result.current.showPlayerNumbers).toBe(true);
    expect(result.current.showNameSettings).toBe(false);
    expect(result.current.hiddenPlayerIndices).toEqual(new Set());
    expect(result.current.showRightControls).toBe(true);
    expect(result.current.sidebarOpen).toBe(true);
    expect(result.current.sidebarAnimating).toBe(false);
    expect(result.current.squadPanelOpen).toBe(true);
    expect(result.current.captureMode).toBe(false);
    expect(result.current.cameraAction).toBeNull();
    expect(result.current.fieldLocked).toBe(false);
    expect(result.current.touchlineLocked).toBe(false);
    expect(result.current.isDraggingObject).toBe(false);
  });

  it("setShowPlayerManagement でモーダルを開閉できる", () => {
    const { result } = renderHook(() => useUIVisibility());

    act(() => result.current.setShowPlayerManagement(true));
    expect(result.current.showPlayerManagement).toBe(true);

    act(() => result.current.setShowPlayerManagement(false));
    expect(result.current.showPlayerManagement).toBe(false);
  });

  it("toggleSidebar でサイドバーを開閉できる", () => {
    const { result } = renderHook(() => useUIVisibility());

    // デフォルトで開いているので、最初のトグルで閉じる
    act(() => result.current.toggleSidebar());
    expect(result.current.sidebarOpen).toBe(false);

    act(() => result.current.toggleSidebar());
    expect(result.current.sidebarOpen).toBe(true);
  });

  it("toggleSidebar で sidebarAnimating が true になる", () => {
    const { result } = renderHook(() => useUIVisibility());

    act(() => result.current.toggleSidebar());
    expect(result.current.sidebarAnimating).toBe(true);
  });

  it("playerMarkerScale のデフォルトが 1 である", () => {
    const { result } = renderHook(() => useUIVisibility());
    expect(result.current.playerMarkerScale).toBe(1);
  });

  it("playerMarkerShape のデフォルトが circle である", () => {
    const { result } = renderHook(() => useUIVisibility());
    expect(result.current.playerMarkerShape).toBe("circle");
  });

  it("selectedImagePresetId の初期値は none である", () => {
    const { result } = renderHook(() => useUIVisibility());
    expect(result.current.selectedImagePresetId).toBe("none");
  });

  it("setSelectedImagePresetId でプリセットを更新できる", () => {
    const { result } = renderHook(() => useUIVisibility());
    act(() => result.current.setSelectedImagePresetId("split-field-squad"));
    expect(result.current.selectedImagePresetId).toBe("split-field-squad");
  });

  it("setShowPlayerNumbers で背番号表示フラグを更新できる", () => {
    const { result } = renderHook(() => useUIVisibility());
    act(() => result.current.setShowPlayerNumbers(false));
    expect(result.current.showPlayerNumbers).toBe(false);
  });
});
