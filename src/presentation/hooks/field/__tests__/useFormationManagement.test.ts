/**
 * @module useFormationManagement フック
 * @description フォーメーション切替管理フックの単体テスト
 *
 * テスト方針:
 * - OrchestratorActions のモックオブジェクトを注入
 * - フォーメーション選択・切替時のアクション呼び出しと選手位置リセットを検証
 * - ゲームモード変更時のフォーメーション再選択ロジックを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFormationManagement } from "../useFormationManagement";
import type { Formation } from "@domain/entities/Formation";
import type { OrchestratorActions } from "@presentation/components/tactics-viewer";

/* ── Mock formations ── */

const mockFormation1 = {
  id: { value: "f-1" },
  name: "4-4-2",
  gameMode: "football",
  positions: [
    { pos: "GK", position: { x: 0, z: -40 }, category: "gk" },
    { pos: "CB", position: { x: -5, z: -25 }, category: "df" },
  ],
  roleMap: new Map([
    ["GK", 0],
    ["CB", 1],
  ]),
} as unknown as Formation;

const mockFormation2 = {
  id: { value: "f-2" },
  name: "3-5-2",
  gameMode: "football",
  positions: [{ pos: "GK", position: { x: 0, z: -40 }, category: "gk" }],
  roleMap: new Map([["GK", 0]]),
} as unknown as Formation;

const mockFutsalFormation = {
  id: { value: "f-3" },
  name: "2-2",
  gameMode: "futsal",
  positions: [],
  roleMap: new Map(),
} as unknown as Formation;

/* ── Mock actions ref ── */

function createMockActions(): OrchestratorActions {
  return {
    isExecuting: false,
    clearManualPositions: vi.fn(),
    resetTactic: vi.fn(),
    hasCreation: false,
    cancelCreation: vi.fn(),
    resetOpponents: vi.fn(),
    resetFormationId: vi.fn(),
  };
}

/* ── Helper ── */

function renderFormationHook(
  overrides: Partial<Parameters<typeof useFormationManagement>[0]> = {},
) {
  const mockActions = createMockActions();
  const resetHistory = vi.fn();
  const pushCurrentSnapshot = vi.fn();

  const defaultParams: Parameters<typeof useFormationManagement>[0] = {
    formations: [mockFormation1, mockFormation2, mockFutsalFormation],
    gameMode: "football",
    selectedTeam: undefined,
    actionsRef: { current: mockActions },
    resetHistory,
    pushCurrentSnapshot,
    ...overrides,
  };

  const hookResult = renderHook(() => useFormationManagement(defaultParams));

  return { ...hookResult, mockActions, resetHistory, pushCurrentSnapshot };
}

/* ── Tests ── */

describe("useFormationManagement", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  it("初期状態: currentFormationId が null", () => {
    const { result } = renderFormationHook();
    expect(result.current.currentFormationId).toBeNull();
  });

  it("gameModeFormations: football のフォーメーションのみフィルタリングする", () => {
    const { result } = renderFormationHook();
    expect(result.current.gameModeFormations).toHaveLength(2);
    expect(result.current.gameModeFormations.map((f) => f.id.value)).toEqual([
      "f-1",
      "f-2",
    ]);
  });

  it("gameModeFormations: formations が undefined の場合は空配列", () => {
    const { result } = renderFormationHook({ formations: undefined });
    expect(result.current.gameModeFormations).toEqual([]);
  });

  it("チームに現在ゲームモードの設定がない場合はモード別デフォルトを自動選択する", async () => {
    const { result } = renderFormationHook({
      gameMode: "futsal",
      selectedTeam: {
        availableFormations: ["4-4-2"],
        defaultFormation: "4-4-2",
      } as never,
    });

    await waitFor(() => {
      expect(result.current.currentFormationId).toBe("f-3");
    });
  });

  it("changeFormation: フォーメーション ID を変更しリセットする", () => {
    const { result, mockActions, resetHistory, pushCurrentSnapshot } =
      renderFormationHook();

    act(() => result.current.changeFormation("f-1"));

    expect(result.current.currentFormationId).toBe("f-1");
    expect(mockActions.clearManualPositions).toHaveBeenCalledOnce();
    expect(mockActions.resetTactic).toHaveBeenCalledOnce();
    expect(resetHistory).toHaveBeenCalledOnce();
    expect(pushCurrentSnapshot).toHaveBeenCalledOnce();
  });

  it("changeFormation: isExecuting の場合は何も起きない", () => {
    const mockActions = createMockActions();
    mockActions.isExecuting = true;

    const { result, resetHistory } = renderFormationHook({
      actionsRef: { current: mockActions },
    });

    act(() => result.current.changeFormation("f-1"));

    expect(result.current.currentFormationId).toBeNull();
    expect(mockActions.clearManualPositions).not.toHaveBeenCalled();
    expect(resetHistory).not.toHaveBeenCalled();
  });

  it("changeFormation: 存在しないフォーメーション ID は無視する", () => {
    const { result, mockActions, resetHistory } = renderFormationHook();

    act(() => result.current.changeFormation("non-existent"));

    expect(result.current.currentFormationId).toBeNull();
    expect(mockActions.clearManualPositions).not.toHaveBeenCalled();
    expect(resetHistory).not.toHaveBeenCalled();
  });
});
