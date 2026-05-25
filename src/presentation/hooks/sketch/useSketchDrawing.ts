/**
 * @module useSketchDrawing
 * @description Canvas上でのポインタ操作によるストローク描画を管理するフック。
 * ペン・直線・矢印ツールの描画ロジックとレンダリングを提供する。
 */
import { useRef, useCallback } from "react";
import type {
  SketchTool,
  SketchPoint,
  SketchStroke,
  SketchLayer,
} from "./types";

// ── 矢印描画ヘルパー ──
function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLen: number,
) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
}

// ── ストローク描画 ──
function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: SketchStroke,
  w: number,
  h: number,
) {
  if (stroke.points.length === 0) return;

  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const pts = stroke.points;

  if (stroke.tool === "pen") {
    ctx.beginPath();
    ctx.moveTo(pts[0].x * w, pts[0].y * h);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x * w, pts[i].y * h);
    }
    ctx.stroke();
  } else if (stroke.tool === "line") {
    if (pts.length < 2) return;
    const start = pts[0];
    const end = pts[pts.length - 1];
    ctx.beginPath();
    ctx.moveTo(start.x * w, start.y * h);
    ctx.lineTo(end.x * w, end.y * h);
    ctx.stroke();
  } else if (stroke.tool === "arrow") {
    if (pts.length < 2) return;
    const start = pts[0];
    const end = pts[pts.length - 1];
    ctx.beginPath();
    ctx.moveTo(start.x * w, start.y * h);
    ctx.lineTo(end.x * w, end.y * h);
    ctx.stroke();
    drawArrowhead(
      ctx,
      start.x * w,
      start.y * h,
      end.x * w,
      end.y * h,
      Math.max(stroke.width * 3, 10),
    );
  }
}

export interface UseSketchDrawingReturn {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  isDrawingRef: React.MutableRefObject<boolean>;
  currentStrokeRef: React.MutableRefObject<SketchStroke | null>;
  nextStrokeIdRef: React.MutableRefObject<number>;
  redraw: (layerData?: SketchLayer[]) => void;
  toNormalized: (e: React.PointerEvent) => SketchPoint | null;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
}

/**
 * Canvas上でのストローク描画を管理する。
 *
 * PointerDown → PointerMove → PointerUp の描画サイクルにおける
 * 一時ストローク管理とCanvas再描画を提供する。
 *
 * @param sketchMode - スケッチモードが有効かどうか
 * @param activeTool - 現在のツール（pen/line/arrow）
 * @param strokeColor - ストロークの色
 * @param strokeWidth - ストロークの太さ
 * @param layers - 現在のレイヤーデータ（再描画用）
 */
export function useSketchDrawing(
  sketchMode: boolean,
  activeTool: SketchTool,
  strokeColor: string,
  strokeWidth: number,
  layers: SketchLayer[],
): UseSketchDrawingReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<SketchStroke | null>(null);
  const nextStrokeIdRef = useRef(1);

  const redraw = useCallback(
    (layerData?: SketchLayer[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const data = layerData ?? layers;
      for (const layer of data) {
        if (!layer.visible) continue;
        for (const stroke of layer.strokes) {
          renderStroke(ctx, stroke, w, h);
        }
      }

      const cur = currentStrokeRef.current;
      if (cur) {
        renderStroke(ctx, cur, w, h);
      }
    },
    [layers],
  );

  const toNormalized = useCallback(
    (e: React.PointerEvent): SketchPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!sketchMode) return;
      const pt = toNormalized(e);
      if (!pt) return;

      isDrawingRef.current = true;
      const id = nextStrokeIdRef.current++;
      currentStrokeRef.current = {
        id,
        tool: activeTool,
        points: [pt],
        color: strokeColor,
        width: strokeWidth,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [sketchMode, activeTool, strokeColor, strokeWidth, toNormalized],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return;
      const pt = toNormalized(e);
      if (!pt) return;

      const cur = currentStrokeRef.current;

      if (cur.tool === "pen") {
        // ペン: 前のポイントから新しいポイントへの線分だけ追記描画（高速）
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            const prev = cur.points[cur.points.length - 1];
            ctx.strokeStyle = cur.color;
            ctx.lineWidth = cur.width;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(prev.x * w, prev.y * h);
            ctx.lineTo(pt.x * w, pt.y * h);
            ctx.stroke();
          }
        }
        cur.points.push(pt);
      } else {
        // 直線・矢印: 全体再描画が必要
        cur.points = [cur.points[0], pt];
        redraw();
      }
    },
    [toNormalized, redraw],
  );

  return {
    canvasRef,
    isDrawingRef,
    currentStrokeRef,
    nextStrokeIdRef,
    redraw,
    toNormalized,
    handlePointerDown,
    handlePointerMove,
  };
}
