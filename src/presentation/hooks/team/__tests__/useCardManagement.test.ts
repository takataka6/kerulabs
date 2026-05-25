/**
 * @module useCardManagement フック
 * @description カード（イエロー/レッド）管理フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な状態管理ロジック）
 * - 選手カード・監督カードのサイクル切替（none→yellow→red→none）を検証
 * - showCards フラグのトグルと初期状態を検証
 * - 外部からの状態セット（setPlayerCards / setManagerCard）を検証
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCardManagement } from "../useCardManagement";

describe("useCardManagement", () => {
  it("初期状態: playerCards 空、managerCard=none、showCards=true", () => {
    const { result } = renderHook(() => useCardManagement());
    expect(result.current.playerCards).toEqual({});
    expect(result.current.managerCard).toBe("none");
    expect(result.current.showCards).toBe(true);
  });

  it("cycleCard: none → yellow → double_yellow → red → none", () => {
    const { result } = renderHook(() => useCardManagement());
    expect(result.current.cycleCard("none")).toBe("yellow");
    expect(result.current.cycleCard("yellow")).toBe("double_yellow");
    expect(result.current.cycleCard("double_yellow")).toBe("red");
    expect(result.current.cycleCard("red")).toBe("none");
  });

  it("playerCards を更新できる", () => {
    const { result } = renderHook(() => useCardManagement());
    act(() => result.current.setPlayerCards({ 0: "yellow", 3: "red" }));
    expect(result.current.playerCards).toEqual({ 0: "yellow", 3: "red" });
  });

  it("managerCard を更新できる", () => {
    const { result } = renderHook(() => useCardManagement());
    act(() => result.current.setManagerCard("yellow"));
    expect(result.current.managerCard).toBe("yellow");
  });

  it("showCards をトグルできる", () => {
    const { result } = renderHook(() => useCardManagement());
    expect(result.current.showCards).toBe(true);
    act(() => result.current.setShowCards(false));
    expect(result.current.showCards).toBe(false);
  });
});
