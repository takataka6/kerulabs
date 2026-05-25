/**
 * @module usePlayModePhase フック
 * @description プレイモード時のフェーズ管理フックの単体テスト
 *
 * テスト方針:
 * - getPitchConfig をvi.mockでスタブ化
 * - フェーズ切替時の表示位置計算とアクション呼び出しを検証
 * - ゲームモードごとのピッチ設定への依存を検証
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayModePhase } from "../usePlayModePhase";

vi.mock("@shared/constants/pitchConfig", () => ({
  getPitchConfig: vi.fn((mode: string) => ({ mode, width: 105, height: 68 })),
}));

function createMockParams() {
  const mockActions = {
    hasCreation: false,
    cancelCreation: vi.fn(),
    clearManualPositions: vi.fn(),
    resetTactic: vi.fn(),
    resetOpponents: vi.fn(),
    resetFormationId: vi.fn(),
    isExecuting: false,
  };
  const actionsRef = { current: mockActions };
  const setSquadPanelOpen = vi.fn();

  return { actionsRef, setSquadPanelOpen, mockActions };
}

describe("usePlayModePhase", () => {
  it("初期状態: selectedPhase='attack', gameMode='football', playMode='field'", () => {
    const { actionsRef, setSquadPanelOpen } = createMockParams();
    const { result } = renderHook(() =>
      usePlayModePhase({ actionsRef, setSquadPanelOpen }),
    );

    expect(result.current.selectedPhase).toBe("attack");
    expect(result.current.gameMode).toBe("football");
    expect(result.current.playMode).toBe("field");
    expect(result.current.selectedSetPlayType).toBe("set_piece");
  });

  it("activePhaseForTactics: field モードでは selectedPhase を返す", () => {
    const { actionsRef, setSquadPanelOpen } = createMockParams();
    const { result } = renderHook(() =>
      usePlayModePhase({ actionsRef, setSquadPanelOpen }),
    );

    expect(result.current.activePhaseForTactics).toBe("attack");

    act(() => result.current.setSelectedPhase("defense"));
    expect(result.current.activePhaseForTactics).toBe("defense");
  });

  it("handlePlayModeChange: setPlay に切り替わる", () => {
    const { actionsRef, setSquadPanelOpen, mockActions } = createMockParams();
    const { result } = renderHook(() =>
      usePlayModePhase({ actionsRef, setSquadPanelOpen }),
    );

    act(() => result.current.handlePlayModeChange("setPlay"));

    expect(result.current.playMode).toBe("setPlay");
    expect(mockActions.resetTactic).toHaveBeenCalled();
    expect(setSquadPanelOpen).toHaveBeenCalledWith(false);
  });

  it("handlePlayModeChange: 同じモードの場合は何も起きない", () => {
    const { actionsRef, setSquadPanelOpen, mockActions } = createMockParams();
    const { result } = renderHook(() =>
      usePlayModePhase({ actionsRef, setSquadPanelOpen }),
    );

    act(() => result.current.handlePlayModeChange("field"));

    expect(mockActions.resetTactic).not.toHaveBeenCalled();
    expect(result.current.playMode).toBe("field");
  });

  it("handleResetState: リセットする", () => {
    const { actionsRef, setSquadPanelOpen, mockActions } = createMockParams();
    const { result } = renderHook(() =>
      usePlayModePhase({ actionsRef, setSquadPanelOpen }),
    );

    act(() => result.current.handleResetState());
    expect(mockActions.resetTactic).toHaveBeenCalled();
    expect(mockActions.clearManualPositions).toHaveBeenCalled();
  });

  it("handleGameModeChange: ゲームモードを変更し States / opponents / formationId をリセット", () => {
    const { actionsRef, setSquadPanelOpen, mockActions } = createMockParams();
    const { result } = renderHook(() =>
      usePlayModePhase({ actionsRef, setSquadPanelOpen }),
    );

    act(() => result.current.handleGameModeChange("futsal"));

    expect(result.current.gameMode).toBe("futsal");
    expect(mockActions.resetTactic).toHaveBeenCalled();
    expect(mockActions.clearManualPositions).toHaveBeenCalled();
    expect(mockActions.resetOpponents).toHaveBeenCalled();
    expect(mockActions.resetFormationId).toHaveBeenCalled();
  });
});
