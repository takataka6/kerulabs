/**
 * @module useTacticsModeReset テスト
 * @description インタラクティブモード一括リセットフックの単体テスト
 *
 * テスト方針:
 * - すべてのリセット対象セッターが正しい値で呼ばれることを検証
 * - 複数回呼び出しでも正しく動作すること
 * - 依存の安定性を前提としたコールバックであること
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTacticsModeReset } from "../useTacticsModeReset";

describe("useTacticsModeReset", () => {
  const mockSetOpponentPlacementMode = vi.fn();
  const mockSetBallPlacementMode = vi.fn();
  const mockResetLineDrawingState = vi.fn();
  const mockSetPlayerViewEnabled = vi.fn();
  const mockSetSelectedPlayerIndex = vi.fn();
  const mockSetSelectedOpponentViewId = vi.fn();
  const mockClearManualPositions = vi.fn();
  const mockResetTactic = vi.fn();

  const defaultDeps = {
    opponentsHook: {
      setOpponentPlacementMode: mockSetOpponentPlacementMode,
    },
    ballHook: {
      setBallPlacementMode: mockSetBallPlacementMode,
    },
    connLines: {
      resetLineDrawingState: mockResetLineDrawingState,
    },
    playerView: {
      setPlayerViewEnabled: mockSetPlayerViewEnabled,
      setSelectedPlayerIndex: mockSetSelectedPlayerIndex,
      setSelectedOpponentViewId: mockSetSelectedOpponentViewId,
    },
    clearManualPositions: mockClearManualPositions,
    resetTactic: mockResetTactic,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resetInteractionModes を呼ぶとすべてのインタラクティブモードがリセットされる", () => {
    const { result } = renderHook(() => useTacticsModeReset(defaultDeps));

    result.current.resetInteractionModes();

    expect(mockSetOpponentPlacementMode).toHaveBeenCalledWith(false);
    expect(mockSetBallPlacementMode).toHaveBeenCalledWith(false);
    expect(mockResetLineDrawingState).toHaveBeenCalledTimes(1);
    expect(mockSetPlayerViewEnabled).toHaveBeenCalledWith(false);
    expect(mockSetSelectedPlayerIndex).toHaveBeenCalledWith(null);
    expect(mockSetSelectedOpponentViewId).toHaveBeenCalledWith(null);
    expect(mockClearManualPositions).toHaveBeenCalledTimes(1);
    expect(mockResetTactic).toHaveBeenCalledTimes(1);
  });

  it("複数回呼び出しても各セッターが正しく呼ばれる", () => {
    const { result } = renderHook(() => useTacticsModeReset(defaultDeps));

    result.current.resetInteractionModes();
    result.current.resetInteractionModes();

    expect(mockSetOpponentPlacementMode).toHaveBeenCalledTimes(2);
    expect(mockResetTactic).toHaveBeenCalledTimes(2);
  });

  it("依存が変化しても最新のセッターが使われる", () => {
    const firstMockResetTactic = vi.fn();
    const secondMockResetTactic = vi.fn();

    const { result, rerender } = renderHook(
      ({ resetTactic }) =>
        useTacticsModeReset({
          ...defaultDeps,
          resetTactic,
        }),
      { initialProps: { resetTactic: firstMockResetTactic } },
    );

    result.current.resetInteractionModes();
    expect(firstMockResetTactic).toHaveBeenCalledTimes(1);

    rerender({ resetTactic: secondMockResetTactic });
    result.current.resetInteractionModes();
    expect(secondMockResetTactic).toHaveBeenCalledTimes(1);
    expect(firstMockResetTactic).toHaveBeenCalledTimes(1); // 古いのは増えない
  });
});
