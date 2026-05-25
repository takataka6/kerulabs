/**
 * @module useUndoRedoKeyboard
 * @description Undo/Redoのキーボードショートカットを登録するEffect専用フック。Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Zに対応する。
 */
import { useEffect } from "react";

/**
 * Undo/Redo のキーボードショートカットを登録する Effect 専用フック。
 *
 * - Mac: Cmd+Z / Cmd+Shift+Z
 * - Windows/Linux: Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y)
 *
 * INPUT / TEXTAREA / contentEditable 要素にフォーカスがある場合はスキップする。
 *
 * @param params.enabled - `false` の場合、キーボードイベントを無視する。
 * @param params.onUndo - Undoショートカット時に呼ばれるコールバック。
 * @param params.onRedo - Redoショートカット時に呼ばれるコールバック。
 */
export function useUndoRedoKeyboard(params: {
  enabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  const { enabled, onUndo, onRedo } = params;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if (
        (modifier && e.key === "z" && e.shiftKey) ||
        (modifier && e.key === "y")
      ) {
        e.preventDefault();
        onRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo, enabled]);
}
