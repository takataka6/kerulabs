/**
 * @module useManagerEditor
 * @description 監督名のインライン編集状態を管理するフック。編集開始・キャンセルの操作と入力値を保持する。
 */
import { useState, useCallback } from "react";

/**
 * 監督名のインライン編集状態を管理する。
 *
 * 編集開始・キャンセルの操作と入力値を保持する。
 *
 * @returns `editingManager` フラグ、`managerInput` 値、および編集開始・キャンセルのコールバック。
 */
export function useManagerEditor() {
  const [editingManager, setEditingManager] = useState(false);
  const [managerInput, setManagerInput] = useState("");

  const startEditing = useCallback((currentManager: string) => {
    setManagerInput(currentManager || "");
    setEditingManager(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingManager(false);
  }, []);

  return {
    editingManager,
    managerInput,
    setManagerInput,
    startEditing,
    cancelEditing,
  };
}
