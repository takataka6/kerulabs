/**
 * @module useSketchOverlay
 * @description Canvas上でのスケッチ描画オーバーレイを管理するフック。
 * ペン・直線・矢印ツール、レイヤー管理、永続化を提供する。
 *
 * 責務ごとに分割された子フックを合成する構造:
 * - {@link useSketchDrawing} 描画ロジックとCanvasレンダリング
 * - {@link useSketchLayers} レイヤー管理
 * - {@link useSketchPersistence} IndexedDB永続化
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { DEFAULT_SKETCH_STROKE_COLOR } from "@shared/constants/colors";
import type { SketchTool, SketchLayer } from "./types";
import { useSketchDrawing } from "./useSketchDrawing";
import { useSketchLayers } from "./useSketchLayers";
import { useSketchPersistence } from "./useSketchPersistence";

/**
 * Canvas上でのスケッチ描画オーバーレイを管理する統合フック。
 *
 * 内部で useSketchDrawing, useSketchLayers, useSketchPersistence を合成し、
 * 描画・レイヤー管理・永続化の全機能を単一のインターフェースで提供する。
 */
export function useSketchOverlay() {
  // ── モード・ツール ──
  const [sketchMode, setSketchMode] = useState(false);
  const [activeTool, setActiveTool] = useState<SketchTool>("pen");
  const [strokeColor, setStrokeColor] = useState(DEFAULT_SKETCH_STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(4);

  // ── 永続化用 ref（子フック間の循環参照を回避） ──
  const persistenceRef = useRef<{
    scheduleSave: (layers: SketchLayer[]) => void;
  }>({
    scheduleSave: () => {},
  });

  // ── 子フック合成 ──
  const layerMgmt = useSketchLayers((updatedLayers) => {
    persistenceRef.current.scheduleSave(updatedLayers);
  });

  const persistence = useSketchPersistence(layerMgmt.activeLayerId);
  persistenceRef.current = persistence;

  // ── 最新値を ref で保持（stale closure 対策） ──
  const activeLayerIdRef = useRef(layerMgmt.activeLayerId);
  activeLayerIdRef.current = layerMgmt.activeLayerId;

  const drawing = useSketchDrawing(
    sketchMode,
    activeTool,
    strokeColor,
    strokeWidth,
    layerMgmt.layers,
  );

  // redraw を ref で保持（useEffect の過剰発火を防ぐ）
  const redrawRef = useRef(drawing.redraw);
  redrawRef.current = drawing.redraw;

  // ── マウント時にロード ──
  useEffect(() => {
    persistence.loadSketch().then((data) => {
      if (data) {
        layerMgmt.setLayers(data.layers);
        layerMgmt.setActiveLayerId(data.activeLayerId);
        drawing.nextStrokeIdRef.current = data.maxStrokeId + 1;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- マウント時に1回だけ実行
  }, []);

  // ── layers 変更時に再描画（layers が変わった時だけ発火） ──
  useEffect(() => {
    redrawRef.current();
  }, [layerMgmt.layers]);

  // ── PointerUp（ストロークをレイヤーに確定） ──
  const handlePointerUp = useCallback(() => {
    if (!drawing.isDrawingRef.current || !drawing.currentStrokeRef.current)
      return;
    drawing.isDrawingRef.current = false;

    const stroke = drawing.currentStrokeRef.current;
    drawing.currentStrokeRef.current = null;

    if (stroke.points.length < 2) {
      redrawRef.current();
      return;
    }

    const currentActiveId = activeLayerIdRef.current;
    layerMgmt.setLayers((prev) => {
      const next = prev.map((layer) =>
        layer.id === currentActiveId
          ? { ...layer, strokes: [...layer.strokes, stroke] }
          : layer,
      );
      persistenceRef.current.scheduleSave(next);
      return next;
    });
  }, [layerMgmt, drawing]);

  // ── スケッチモード切替 ──
  const toggleSketchMode = useCallback(() => {
    setSketchMode((prev) => {
      if (!prev && layerMgmt.layers.length > 0) {
        // 現在のactiveLayerIdが存在するレイヤーならそのまま維持、なければ一番上を選択
        const currentExists = layerMgmt.layers.some(
          (l) => l.id === layerMgmt.activeLayerId,
        );
        if (!currentExists) {
          layerMgmt.setActiveLayerId(
            layerMgmt.layers[layerMgmt.layers.length - 1].id,
          );
        }
      }
      return !prev;
    });
  }, [layerMgmt]);

  return {
    // 参照
    canvasRef: drawing.canvasRef,

    // モード
    sketchMode,
    setSketchMode,
    toggleSketchMode,

    // ツール設定
    activeTool,
    setActiveTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,

    // レイヤー
    layers: layerMgmt.layers,
    activeLayerId: layerMgmt.activeLayerId,
    setActiveLayerId: layerMgmt.setActiveLayerId,
    addLayer: layerMgmt.addLayer,
    removeLayer: layerMgmt.removeLayer,
    renameLayer: layerMgmt.renameLayer,
    reorderLayers: layerMgmt.reorderLayers,
    toggleLayerVisibility: layerMgmt.toggleLayerVisibility,

    // 描画ハンドラー
    handlePointerDown: drawing.handlePointerDown,
    handlePointerMove: drawing.handlePointerMove,
    handlePointerUp,

    // アクション
    undoLastStroke: layerMgmt.undoLastStroke,
    clearLayer: layerMgmt.clearLayer,
    clearAllStrokes: layerMgmt.clearAllStrokes,
    redraw: drawing.redraw,
  };
}
