/**
 * @module SketchOverlay
 * @description Canvas上のスケッチ描画オーバーレイコンポーネント。ポインターイベントを処理しフリーハンド描画を実現する。
 */
import { memo, useEffect, useCallback } from "react";

interface SketchOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  sketchMode: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  redraw: () => void;
}

/**
 * 3Dフィールド上に重ねるスケッチ用 Canvas。
 *
 * - `z-[5]`: 3Dキャンバス上、UIパネル(z-10)下
 * - `pointerEvents`: スケッチモードOFF時はイベント透過
 * - `ResizeObserver` でサイズ同期 → `redraw()`
 */
export const SketchOverlay = memo(function SketchOverlay({
  canvasRef,
  sketchMode,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  redraw,
}: SketchOverlayProps) {
  // キャンバスサイズを親要素に同期
  const syncSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const { width, height } = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // CSS サイズは親と同じ（absoluteで自動）
    // ピクセルバッファは DPR 倍
    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr)
    ) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      redraw();
    }
  }, [canvasRef, redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    syncSize();

    const observer = new ResizeObserver(() => {
      syncSize();
    });
    observer.observe(parent);

    return () => observer.disconnect();
  }, [canvasRef, syncSize]);

  // iPad/タッチデバイスでスケッチ中のスクロールを防止
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sketchMode) return;

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    canvas.addEventListener("touchstart", preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchmove", preventScroll);
      canvas.removeEventListener("touchstart", preventScroll);
    };
  }, [canvasRef, sketchMode]);

  return (
    <canvas
      ref={canvasRef as React.RefObject<HTMLCanvasElement>}
      id="sketch-canvas"
      className="absolute inset-0 z-[5]"
      style={{
        pointerEvents: sketchMode ? "auto" : "none",
        cursor: sketchMode ? "crosshair" : "default",
        touchAction: sketchMode ? "none" : "auto",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
});
