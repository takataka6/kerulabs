/**
 * @module useUndoRedoKeyboard フック
 * @description Undo/Redoキーボードショートカットフックの単体テスト
 *
 * テスト方針:
 * - window.dispatchEvent でKeyboardEventを発火し、undo/redo コールバックの呼び出しを検証
 * - Ctrl+Z / Cmd+Z（Undo）、Ctrl+Shift+Z / Cmd+Shift+Z（Redo）の検証
 * - input/textarea フォーカス時のショートカット無効化を検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUndoRedoKeyboard } from "../useUndoRedoKeyboard";

function fireKeyDown(options: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", { bubbles: true, ...options });
  window.dispatchEvent(event);
}

describe("useUndoRedoKeyboard", () => {
  let onUndo: ReturnType<typeof vi.fn>;
  let onRedo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onUndo = vi.fn();
    onRedo = vi.fn();
    // Use non-Mac userAgent for simpler Ctrl-based tests
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Ctrl+Z で onUndo が呼ばれる", () => {
    renderHook(() => useUndoRedoKeyboard({ enabled: true, onUndo, onRedo }));
    fireKeyDown({ key: "z", ctrlKey: true });
    expect(onUndo).toHaveBeenCalledOnce();
    expect(onRedo).not.toHaveBeenCalled();
  });

  it("Ctrl+Shift+Z で onRedo が呼ばれる", () => {
    renderHook(() => useUndoRedoKeyboard({ enabled: true, onUndo, onRedo }));
    fireKeyDown({ key: "z", ctrlKey: true, shiftKey: true });
    expect(onRedo).toHaveBeenCalledOnce();
    expect(onUndo).not.toHaveBeenCalled();
  });

  it("Ctrl+Y で onRedo が呼ばれる", () => {
    renderHook(() => useUndoRedoKeyboard({ enabled: true, onUndo, onRedo }));
    fireKeyDown({ key: "y", ctrlKey: true });
    expect(onRedo).toHaveBeenCalledOnce();
  });

  it("enabled=false のときはキーイベントが無視される", () => {
    renderHook(() => useUndoRedoKeyboard({ enabled: false, onUndo, onRedo }));
    fireKeyDown({ key: "z", ctrlKey: true });
    fireKeyDown({ key: "z", ctrlKey: true, shiftKey: true });
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
  });

  it("INPUT 要素にフォーカスしているときはスキップされる", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useUndoRedoKeyboard({ enabled: true, onUndo, onRedo }));

    const event = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      bubbles: true,
    });
    input.dispatchEvent(event);

    expect(onUndo).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("TEXTAREA 要素にフォーカスしているときはスキップされる", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();

    renderHook(() => useUndoRedoKeyboard({ enabled: true, onUndo, onRedo }));

    const event = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      bubbles: true,
    });
    textarea.dispatchEvent(event);

    expect(onUndo).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it("Mac プラットフォームでは metaKey が使われる", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    });

    renderHook(() => useUndoRedoKeyboard({ enabled: true, onUndo, onRedo }));

    // Ctrl+Z should NOT trigger on Mac
    fireKeyDown({ key: "z", ctrlKey: true });
    expect(onUndo).not.toHaveBeenCalled();

    // Cmd+Z should trigger on Mac
    fireKeyDown({ key: "z", metaKey: true });
    expect(onUndo).toHaveBeenCalledOnce();
  });
});
