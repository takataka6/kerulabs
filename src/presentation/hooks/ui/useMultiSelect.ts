/**
 * @module useMultiSelect
 * @description 選手・相手マーカーの複数選択を管理するフック。矩形選択やEscキーによる選択解除を提供する。
 */
import { useState, useCallback, useEffect, useMemo, useRef } from "react";

export type SelectableItem =
  | { type: "player"; index: number }
  | { type: "opponent"; id: number };

function itemKey(item: SelectableItem): string {
  return item.type === "player" ? `p_${item.index}` : `o_${item.id}`;
}

export function useMultiSelect() {
  const [selectedItems, setSelectedItems] = useState<SelectableItem[]>([]);
  const [isRectSelecting, setIsRectSelecting] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [rectEnd, setRectEnd] = useState<{ x: number; y: number } | null>(null);

  const toggleItem = useCallback((item: SelectableItem) => {
    setSelectedItems((prev) => {
      const key = itemKey(item);
      const exists = prev.some((i) => itemKey(i) === key);
      if (exists) {
        return prev.filter((i) => itemKey(i) !== key);
      }
      return [...prev, item];
    });
  }, []);

  const selectSingle = useCallback((item: SelectableItem) => {
    setSelectedItems([item]);
  }, []);

  const setSelectionFromRect = useCallback((items: SelectableItem[]) => {
    setSelectedItems(items);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const selectedPlayerIndices = useMemo(
    () =>
      new Set(
        selectedItems
          .filter(
            (i): i is { type: "player"; index: number } => i.type === "player",
          )
          .map((i) => i.index),
      ),
    [selectedItems],
  );

  const selectedOpponentIds = useMemo(
    () =>
      new Set(
        selectedItems
          .filter(
            (i): i is { type: "opponent"; id: number } => i.type === "opponent",
          )
          .map((i) => i.id),
      ),
    [selectedItems],
  );

  const hasSelection = selectedItems.length > 1;

  // Escape キーで選択解除（ref 経由で最新の selectedItems を参照し、deps を空に保つ）
  const selectedItemsRef = useRef(selectedItems);
  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItemsRef.current.length === 0) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedItems([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const startRectSelect = useCallback((pos: { x: number; y: number }) => {
    setIsRectSelecting(true);
    setRectStart(pos);
    setRectEnd(pos);
  }, []);

  const updateRectSelect = useCallback(
    (pos: { x: number; y: number }) => {
      if (isRectSelecting) setRectEnd(pos);
    },
    [isRectSelecting],
  );

  const endRectSelect = useCallback(() => {
    setIsRectSelecting(false);
  }, []);

  const clearRect = useCallback(() => {
    setRectStart(null);
    setRectEnd(null);
  }, []);

  return {
    selectedItems,
    selectedPlayerIndices,
    selectedOpponentIds,
    hasSelection,
    toggleItem,
    selectSingle,
    setSelectionFromRect,
    clearSelection,
    isRectSelecting,
    rectStart,
    rectEnd,
    startRectSelect,
    updateRectSelect,
    endRectSelect,
    clearRect,
  };
}
