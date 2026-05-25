/**
 * @module useClickOutside
 * @description 指定した要素の外側クリックを検知するカスタムフック。
 * ドロップダウンやモーダルの外側クリックで閉じるパターンを共通化する。
 */
import { useEffect, type RefObject } from "react";

/**
 * ref 要素の外側がクリックされたときにコールバックを実行するフック。
 *
 * @param ref - 監視対象の要素への参照
 * @param onClickOutside - 外側クリック時に呼ばれるコールバック
 *
 * @example
 * ```tsx
 * const panelRef = useRef<HTMLDivElement>(null);
 * useClickOutside(panelRef, () => setIsOpen(false));
 * ```
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [ref, onClickOutside, enabled]);
}
