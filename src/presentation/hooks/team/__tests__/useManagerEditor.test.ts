/**
 * @module useManagerEditor フック
 * @description 監督名編集フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な状態管理ロジック）
 * - 編集モードの開始・確定・キャンセルの状態遷移を検証
 * - 監督名入力値の管理と初期値設定を検証
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useManagerEditor } from "../useManagerEditor";

describe("useManagerEditor", () => {
  it("初期状態: editingManager=false、managerInput=空文字", () => {
    const { result } = renderHook(() => useManagerEditor());
    expect(result.current.editingManager).toBe(false);
    expect(result.current.managerInput).toBe("");
  });

  it("startEditing で編集モードに入り、入力値がセットされる", () => {
    const { result } = renderHook(() => useManagerEditor());
    act(() => result.current.startEditing("田中太郎"));
    expect(result.current.editingManager).toBe(true);
    expect(result.current.managerInput).toBe("田中太郎");
  });

  it("startEditing に空文字を渡すと managerInput も空文字", () => {
    const { result } = renderHook(() => useManagerEditor());
    act(() => result.current.startEditing(""));
    expect(result.current.editingManager).toBe(true);
    expect(result.current.managerInput).toBe("");
  });

  it("cancelEditing で編集モードを終了する", () => {
    const { result } = renderHook(() => useManagerEditor());
    act(() => result.current.startEditing("テスト"));
    act(() => result.current.cancelEditing());
    expect(result.current.editingManager).toBe(false);
  });

  it("setManagerInput で入力値を直接更新できる", () => {
    const { result } = renderHook(() => useManagerEditor());
    act(() => result.current.setManagerInput("新しい名前"));
    expect(result.current.managerInput).toBe("新しい名前");
  });
});
