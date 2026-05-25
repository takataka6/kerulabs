/**
 * @module useDraggable
 * @description 要素のドラッグ移動を管理する汎用フック。ポインターイベントによるオフセット計算を提供する。
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { rafThrottle } from "@shared/utils/rafThrottle";

interface Offset {
  x: number;
  y: number;
}

interface UseDraggableReturn {
  offset: Offset;
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
  resetOffset: () => void;
}

export function useDraggable(): UseDraggableReturn {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const startOffset = useRef<Offset>({ x: 0, y: 0 });
  const offsetRef = useRef<Offset>(offset);
  const listenersRef = useRef<{
    onPointerMove: ((ev: PointerEvent) => void) | null;
    onPointerUp: (() => void) | null;
  }>({ onPointerMove: null, onPointerUp: null });

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // アンマウント時にリスナーを確実に除去（メモリリーク防止）
  useEffect(() => {
    return () => {
      if (listenersRef.current.onPointerMove) {
        document.removeEventListener(
          "pointermove",
          listenersRef.current.onPointerMove,
        );
      }
      if (listenersRef.current.onPointerUp) {
        document.removeEventListener(
          "pointerup",
          listenersRef.current.onPointerUp,
        );
      }
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { ...offsetRef.current };
    setIsDragging(true);

    // RAF スロットル: ポインター移動ごとの setState を1フレームに1回に抑制
    const onPointerMove = rafThrottle((ev: PointerEvent) => {
      if (!startPos.current) return;
      const dx = ev.clientX - startPos.current.x;
      const dy = ev.clientY - startPos.current.y;
      setOffset({
        x: startOffset.current.x + dx,
        y: startOffset.current.y + dy,
      });
    });

    const onPointerUp = () => {
      onPointerMove.cancel();
      startPos.current = null;
      setIsDragging(false);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      listenersRef.current = { onPointerMove: null, onPointerUp: null };
    };

    listenersRef.current = { onPointerMove, onPointerUp };
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }, []);

  const resetOffset = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return { offset, isDragging, handlePointerDown, resetOffset };
}
