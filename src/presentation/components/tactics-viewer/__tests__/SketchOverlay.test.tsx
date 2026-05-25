/**
 * @module SketchOverlay コンポーネント
 * @description スケッチオーバーレイ（Canvas描画層）の単体テスト
 *
 * テスト方針:
 * - Canvas要素のref設定をモック化
 * - オーバーレイの表示/非表示とサイズ設定を検証
 * - Canvas要素の正しいマウントを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SketchOverlay } from "../SketchOverlay";
import { createRef } from "react";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

// ResizeObserver がブラウザ API のためモック
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
vi.stubGlobal(
  "ResizeObserver",
  vi.fn(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
  })),
);

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SketchOverlay", () => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const onPointerDown = vi.fn();
  const onPointerMove = vi.fn();
  const onPointerUp = vi.fn();
  const redraw = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
      setTransform: vi.fn(),
      lineCap: "round",
      lineJoin: "round",
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  function renderOverlay(sketchMode = false) {
    return render(
      <SketchOverlay
        canvasRef={canvasRef}
        sketchMode={sketchMode}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        redraw={redraw}
      />,
    );
  }

  it("canvas 要素を描画する", () => {
    const { container } = renderOverlay();
    const canvas = container.querySelector("canvas#sketch-canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("sketchMode=false の場合 pointerEvents=none", () => {
    const { container } = renderOverlay(false);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.style.pointerEvents).toBe("none");
  });

  it("sketchMode=true の場合 pointerEvents=auto", () => {
    const { container } = renderOverlay(true);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.style.pointerEvents).toBe("auto");
  });

  it("sketchMode=true の場合 cursor=crosshair", () => {
    const { container } = renderOverlay(true);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.style.cursor).toBe("crosshair");
  });
});
