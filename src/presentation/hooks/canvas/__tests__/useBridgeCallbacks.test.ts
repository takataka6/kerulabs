/**
 * @module useBridgeCallbacks テスト
 * @description ブリッジコールバックフックの単体テスト。
 * 各クリックハンドラのモード分岐ロジックを検証する。
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBridgeCallbacks } from "../useBridgeCallbacks";

function createMockDeps(overrides: Record<string, unknown> = {}) {
  return {
    connLines: {
      lineDrawingMode: false,
      handlePlayerClickForLine: vi.fn(),
      resetLineDrawingState: vi.fn(),
      ...((overrides.connLines as Record<string, unknown>) || {}),
    },
    playerView: {
      playerViewEnabled: false,
      handlePlayerClickForView: vi.fn(),
      handleOpponentViewClick: vi.fn(),
      ...((overrides.playerView as Record<string, unknown>) || {}),
    },
    multiSelect: {
      toggleItem: vi.fn(),
      selectSingle: vi.fn(),
      ...((overrides.multiSelect as Record<string, unknown>) || {}),
    },
    cardMgmt: {
      playerCards: {},
      managerCard: "none",
      setPlayerCards: vi.fn(
        (fn: (prev: Record<string, unknown>) => Record<string, unknown>) =>
          fn({}),
      ),
      setManagerCard: vi.fn(),
      cycleCard: vi.fn(() => "yellow"),
      ...((overrides.cardMgmt as Record<string, unknown>) || {}),
    },
    teamMgmt: {
      selectedTeamId: "team-1",
      selectedTeam: {
        id: { value: "team-1" },
        name: "Test",
        updatePlayerCards: vi.fn(),
        updateManager: vi.fn(),
        updateManagerCard: vi.fn(),
      },
      handleUpdateTeam: vi.fn(),
      ...((overrides.teamMgmt as Record<string, unknown>) || {}),
    },
    managerEditor: {
      cancelEditing: vi.fn(),
      ...((overrides.managerEditor as Record<string, unknown>) || {}),
    },
    pushCurrentSnapshot: vi.fn(),
    teams: [{ id: { value: "team-1" }, name: "Test Team" }],
  } as unknown as Parameters<typeof useBridgeCallbacks>[0];
}

describe("useBridgeCallbacks", () => {
  describe("handlePlayerClick", () => {
    it("ラインドローイングモード時は handlePlayerClickForLine を呼ぶ", () => {
      const deps = createMockDeps({
        connLines: { lineDrawingMode: true, handlePlayerClickForLine: vi.fn() },
      });
      const { result } = renderHook(() => useBridgeCallbacks(deps));

      act(() => result.current.handlePlayerClick(3));

      expect(deps.connLines.handlePlayerClickForLine).toHaveBeenCalledWith(3);
      expect(deps.multiSelect.selectSingle).not.toHaveBeenCalled();
    });

    it("プレイヤービューモード時は handlePlayerClickForView を呼ぶ", () => {
      const deps = createMockDeps({
        playerView: {
          playerViewEnabled: true,
          handlePlayerClickForView: vi.fn(),
        },
      });
      const { result } = renderHook(() => useBridgeCallbacks(deps));

      act(() => result.current.handlePlayerClick(5));

      expect(deps.playerView.handlePlayerClickForView).toHaveBeenCalledWith(5);
    });

    it("通常モードでは selectSingle を呼ぶ", () => {
      const deps = createMockDeps();
      const { result } = renderHook(() => useBridgeCallbacks(deps));

      act(() => result.current.handlePlayerClick(2));

      expect(deps.multiSelect.selectSingle).toHaveBeenCalledWith({
        type: "player",
        index: 2,
      });
    });

    it("Cmd/Ctrl + クリックでは toggleItem を呼ぶ", () => {
      const deps = createMockDeps();
      const { result } = renderHook(() => useBridgeCallbacks(deps));

      act(() =>
        result.current.handlePlayerClick(1, { metaKey: true } as MouseEvent),
      );

      expect(deps.multiSelect.toggleItem).toHaveBeenCalledWith({
        type: "player",
        index: 1,
      });
    });
  });

  describe("handleOpponentClick", () => {
    it("プレイヤービューモード時は handleOpponentViewClick を呼ぶ", () => {
      const deps = createMockDeps({
        playerView: {
          playerViewEnabled: true,
          handleOpponentViewClick: vi.fn(),
        },
      });
      const { result } = renderHook(() => useBridgeCallbacks(deps));

      act(() => result.current.handleOpponentClick(10));

      expect(deps.playerView.handleOpponentViewClick).toHaveBeenCalledWith(10);
    });

    it("通常モードでは selectSingle を呼ぶ", () => {
      const deps = createMockDeps();
      const { result } = renderHook(() => useBridgeCallbacks(deps));

      act(() => result.current.handleOpponentClick(7));

      expect(deps.multiSelect.selectSingle).toHaveBeenCalledWith({
        type: "opponent",
        id: 7,
      });
    });
  });

  describe("handleSaveManager", () => {
    it("チームの監督名を更新し編集モードを終了する", () => {
      const deps = createMockDeps();
      const { result } = renderHook(() => useBridgeCallbacks(deps));

      act(() => result.current.handleSaveManager("New Manager"));

      expect(deps.teamMgmt.selectedTeam!.updateManager).toHaveBeenCalledWith(
        "New Manager",
      );
      expect(deps.teamMgmt.handleUpdateTeam).toHaveBeenCalled();
      expect(deps.managerEditor.cancelEditing).toHaveBeenCalled();
    });
  });
});
