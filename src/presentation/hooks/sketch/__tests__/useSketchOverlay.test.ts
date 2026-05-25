/**
 * @module useSketchOverlay フック
 * @description スケッチオーバーレイ（手書き描画）フックの単体テスト
 *
 * テスト方針:
 * - Canvas 2D コンテキストをモックオブジェクトで代用
 * - SketchStorage をvi.mockでスタブ化し、永続化を分離
 * - ストローク描画（開始・継続・終了）の状態変化とCanvas API呼び出しを検証
 * - レイヤー管理（追加・削除・表示/非表示・アクティブ切替）を検証
 * - Undo/Redo操作とスケッチデータの保存/復元を検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ── Canvas 2D コンテキストモック ────────────────────────────
function createMockContext(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    clearRect: vi.fn(),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    lineCap: "butt",
    lineJoin: "miter",
  } as unknown as CanvasRenderingContext2D;
}

function createMockCanvas(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
  return {
    width: 800,
    height: 600,
    getContext: vi.fn().mockReturnValue(ctx),
    getBoundingClientRect: vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    }),
  } as unknown as HTMLCanvasElement;
}

// ── PointerEvent ヘルパー ────────────────────────────────────
function createPointerEvent(
  clientX: number,
  clientY: number,
): React.PointerEvent {
  return {
    clientX,
    clientY,
    pointerId: 1,
    target: {
      setPointerCapture: vi.fn(),
    } as unknown as HTMLElement,
  } as unknown as React.PointerEvent;
}

// ── SketchStorage モック ─────────────────────────────────────
const mockLoadSketch = vi.fn().mockResolvedValue(null);
const mockSaveSketch = vi.fn().mockResolvedValue(undefined);
const mockClearSketch = vi.fn().mockResolvedValue(undefined);

vi.mock("@infrastructure/repositories/indexeddb/SketchStorage", () => ({
  SketchStorage: vi.fn().mockImplementation(() => ({
    loadSketch: mockLoadSketch,
    saveSketch: mockSaveSketch,
    clearSketch: mockClearSketch,
  })),
}));

import { useSketchOverlay } from "../useSketchOverlay";

describe("useSketchOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLoadSketch.mockResolvedValue(null);
    mockSaveSketch.mockResolvedValue(undefined);
    mockClearSketch.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── 初期状態 ─────────────────────────────────────────

  it("初期状態: sketchMode が false である", () => {
    const { result } = renderHook(() => useSketchOverlay());
    expect(result.current.sketchMode).toBe(false);
  });

  it("初期状態: activeTool が 'pen' である", () => {
    const { result } = renderHook(() => useSketchOverlay());
    expect(result.current.activeTool).toBe("pen");
  });

  it("初期状態: strokeColor が '#ef4444' である", () => {
    const { result } = renderHook(() => useSketchOverlay());
    expect(result.current.strokeColor).toBe("#ef4444");
  });

  it("初期状態: strokeWidth が 4 である", () => {
    const { result } = renderHook(() => useSketchOverlay());
    expect(result.current.strokeWidth).toBe(4);
  });

  // ── モード切替 ───────────────────────────────────────

  it("toggleSketchMode でスケッチモードを切り替える", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.toggleSketchMode());
    expect(result.current.sketchMode).toBe(true);

    act(() => result.current.toggleSketchMode());
    expect(result.current.sketchMode).toBe(false);
  });

  it("setSketchMode で直接スケッチモードを設定する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.setSketchMode(true));
    expect(result.current.sketchMode).toBe(true);

    act(() => result.current.setSketchMode(false));
    expect(result.current.sketchMode).toBe(false);
  });

  // ── ツール設定 ───────────────────────────────────────

  it("setActiveTool でツールを変更する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.setActiveTool("line"));
    expect(result.current.activeTool).toBe("line");

    act(() => result.current.setActiveTool("arrow"));
    expect(result.current.activeTool).toBe("arrow");
  });

  it("setStrokeColor で色を変更する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.setStrokeColor("#3b82f6"));
    expect(result.current.strokeColor).toBe("#3b82f6");
  });

  it("setStrokeWidth で幅を変更する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.setStrokeWidth(8));
    expect(result.current.strokeWidth).toBe(8);
  });

  // ── レイヤー初期状態 ─────────────────────────────────

  it("レイヤー初期状態: 1つのレイヤーが存在する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]).toEqual({
      id: 1,
      strokes: [],
      visible: true,
      name: "Layer 1",
    });
    expect(result.current.activeLayerId).toBe(1);
  });

  // ── レイヤー追加 ─────────────────────────────────────

  it("addLayer でレイヤーを追加する（最大3枚まで）", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    expect(result.current.layers).toHaveLength(2);

    act(() => result.current.addLayer());
    expect(result.current.layers).toHaveLength(3);
  });

  it("addLayer で3枚を超えると追加されない", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    act(() => result.current.addLayer());
    act(() => result.current.addLayer());

    expect(result.current.layers).toHaveLength(3);
  });

  it("addLayer で追加されたレイヤーがアクティブになる", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    const newLayer = result.current.layers[1];
    expect(result.current.activeLayerId).toBe(newLayer.id);
  });

  it("addLayer で欠番のIDが再利用される", () => {
    const { result } = renderHook(() => useSketchOverlay());

    // Layer 1 + Layer 2 を作成
    act(() => result.current.addLayer());
    expect(result.current.layers).toHaveLength(2);

    // Layer 1 を削除 → Layer 2 のみ
    act(() => result.current.removeLayer(1));
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0].id).toBe(2);

    // 新しいレイヤーを追加 → id=1 が再利用される
    act(() => result.current.addLayer());
    expect(result.current.layers).toHaveLength(2);
    const ids = result.current.layers.map((l) => l.id);
    expect(ids).toContain(1);
  });

  // ── レイヤー削除 ─────────────────────────────────────

  it("removeLayer でレイヤーを削除する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    expect(result.current.layers).toHaveLength(2);

    const firstLayerId = result.current.layers[0].id;
    act(() => result.current.removeLayer(firstLayerId));
    expect(result.current.layers).toHaveLength(1);
  });

  it("removeLayer で最後の1枚は削除できない", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.removeLayer(1));
    expect(result.current.layers).toHaveLength(1);
  });

  it("removeLayer でアクティブレイヤーを削除すると別のレイヤーに切り替わる", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    const activeId = result.current.activeLayerId;
    const otherId = result.current.layers.find((l) => l.id !== activeId)!.id;

    act(() => result.current.removeLayer(activeId));
    expect(result.current.activeLayerId).not.toBe(activeId);
    expect(result.current.activeLayerId).toBe(otherId);
  });

  it("removeLayer でアクティブでないレイヤーを削除してもアクティブレイヤーは変わらない", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    const activeId = result.current.activeLayerId;
    const otherId = result.current.layers.find((l) => l.id !== activeId)!.id;

    act(() => result.current.removeLayer(otherId));
    expect(result.current.activeLayerId).toBe(activeId);
  });

  // ── レイヤー名変更 ───────────────────────────────────

  it("renameLayer でレイヤー名を変更する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.renameLayer(1, "攻撃パターン"));
    expect(result.current.layers[0].name).toBe("攻撃パターン");
  });

  it("renameLayer で空文字は無視する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.renameLayer(1, ""));
    expect(result.current.layers[0].name).toBe("Layer 1");

    act(() => result.current.renameLayer(1, "   "));
    expect(result.current.layers[0].name).toBe("Layer 1");
  });

  it("renameLayer で複数レイヤーがある場合、対象以外のレイヤー名は変わらない", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    // Layer 1 のみリネーム
    act(() => result.current.renameLayer(1, "新しい名前"));

    const layer1 = result.current.layers.find((l) => l.id === 1)!;
    const layer2 = result.current.layers.find((l) => l.id !== 1)!;
    expect(layer1.name).toBe("新しい名前");
    expect(layer2.name).not.toBe("新しい名前");
  });

  // ── レイヤー表示/非表示 ──────────────────────────────

  it("toggleLayerVisibility でレイヤーの表示/非表示を切り替える", () => {
    const { result } = renderHook(() => useSketchOverlay());

    expect(result.current.layers[0].visible).toBe(true);

    act(() => result.current.toggleLayerVisibility(1));
    expect(result.current.layers[0].visible).toBe(false);

    act(() => result.current.toggleLayerVisibility(1));
    expect(result.current.layers[0].visible).toBe(true);
  });

  it("toggleLayerVisibility で複数レイヤーがある場合、対象以外のレイヤーの表示状態は変わらない", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    const layer2Id = result.current.layers[1].id;

    // Layer 2 のみ非表示に
    act(() => result.current.toggleLayerVisibility(layer2Id));

    const layer1 = result.current.layers.find((l) => l.id === 1)!;
    const layer2 = result.current.layers.find((l) => l.id === layer2Id)!;
    expect(layer1.visible).toBe(true);
    expect(layer2.visible).toBe(false);
  });

  // ── レイヤー並び替え ─────────────────────────────────

  it("reorderLayers でレイヤーの順序を変更する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    act(() => result.current.addLayer());
    // layers: [Layer 1, Layer 2, Layer 3]
    const ids = result.current.layers.map((l) => l.id);
    expect(ids).toHaveLength(3);

    // Layer 1 を Layer 3 の位置へ移動
    const firstId = result.current.layers[0].id;
    const lastId = result.current.layers[2].id;
    act(() => result.current.reorderLayers(firstId, lastId));

    const reorderedIds = result.current.layers.map((l) => l.id);
    // firstId は lastId の位置に挿入される
    expect(reorderedIds.indexOf(firstId)).toBeGreaterThan(0);
  });

  it("reorderLayers で同じ位置への移動は無視される", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    const before = result.current.layers.map((l) => l.id);

    act(() => result.current.reorderLayers(before[0], before[0]));
    const after = result.current.layers.map((l) => l.id);
    expect(after).toEqual(before);
  });

  it("reorderLayers で存在しないIDを指定すると無視される", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    const before = result.current.layers.map((l) => l.id);

    act(() => result.current.reorderLayers(999, before[0]));
    const after = result.current.layers.map((l) => l.id);
    expect(after).toEqual(before);
  });

  // ── undoLastStroke ────────────────────────────────────

  it("undoLastStroke でアクティブレイヤーの最後のストロークを取り消す", () => {
    const { result } = renderHook(() => useSketchOverlay());

    const ctx = createMockContext();
    const canvas = createMockCanvas(ctx);

    // canvasRef を設定
    act(() => {
      (
        result.current
          .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
      ).current = canvas;
    });

    // スケッチモードON
    act(() => result.current.setSketchMode(true));

    // penツールでストロークを描画
    const down = createPointerEvent(100, 100);
    act(() => result.current.handlePointerDown(down));

    const move = createPointerEvent(200, 200);
    act(() => result.current.handlePointerMove(move));

    act(() => result.current.handlePointerUp());

    // ストロークが追加されている
    expect(result.current.layers[0].strokes).toHaveLength(1);

    // undo
    act(() => result.current.undoLastStroke());
    expect(result.current.layers[0].strokes).toHaveLength(0);
  });

  it("undoLastStroke はアクティブレイヤー以外のストロークに影響しない", () => {
    const { result } = renderHook(() => useSketchOverlay());

    const ctx = createMockContext();
    const canvas = createMockCanvas(ctx);
    act(() => {
      (
        result.current
          .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
      ).current = canvas;
    });

    // スケッチモードONでLayer 1にストローク描画
    act(() => result.current.setSketchMode(true));

    const down = createPointerEvent(100, 100);
    act(() => result.current.handlePointerDown(down));
    const move = createPointerEvent(200, 200);
    act(() => result.current.handlePointerMove(move));
    act(() => result.current.handlePointerUp());

    // Layer 2を追加してアクティブにする
    act(() => result.current.addLayer());
    const layer2Id = result.current.activeLayerId;
    expect(layer2Id).not.toBe(1);

    // Layer 2でundo → Layer 1のストロークには影響しない
    act(() => result.current.undoLastStroke());
    const layer1 = result.current.layers.find((l) => l.id === 1)!;
    expect(layer1.strokes).toHaveLength(1);
  });

  // ── clearLayer ───────────────────────────────────────

  it("clearLayer でアクティブレイヤーのストロークのみクリアする", () => {
    const { result } = renderHook(() => useSketchOverlay());

    const ctx = createMockContext();
    const canvas = createMockCanvas(ctx);
    act(() => {
      (
        result.current
          .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
      ).current = canvas;
    });

    // スケッチモードONでストロークを描画
    act(() => result.current.setSketchMode(true));

    const down = createPointerEvent(100, 100);
    act(() => result.current.handlePointerDown(down));
    const move = createPointerEvent(200, 200);
    act(() => result.current.handlePointerMove(move));
    act(() => result.current.handlePointerUp());

    expect(result.current.layers[0].strokes).toHaveLength(1);

    // Layer 2追加してストローク描画
    act(() => result.current.addLayer());
    const down2 = createPointerEvent(300, 300);
    act(() => result.current.handlePointerDown(down2));
    const move2 = createPointerEvent(400, 400);
    act(() => result.current.handlePointerMove(move2));
    act(() => result.current.handlePointerUp());

    // clearLayer はアクティブレイヤー（Layer 2）のみクリア
    act(() => result.current.clearLayer());
    const layer2 = result.current.layers.find(
      (l) => l.id === result.current.activeLayerId,
    )!;
    expect(layer2.strokes).toHaveLength(0);

    // Layer 1のストロークは残っている
    const layer1 = result.current.layers.find((l) => l.id === 1)!;
    expect(layer1.strokes).toHaveLength(1);
  });

  // ── 全レイヤークリア ─────────────────────────────────

  it("clearAllStrokes で全レイヤーのストロークをクリアする", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.clearAllStrokes());

    for (const layer of result.current.layers) {
      expect(layer.strokes).toEqual([]);
    }
  });

  // ── setActiveLayerId ─────────────────────────────────

  it("setActiveLayerId でアクティブレイヤーを直接変更する", () => {
    const { result } = renderHook(() => useSketchOverlay());

    act(() => result.current.addLayer());
    act(() => result.current.setActiveLayerId(1));
    expect(result.current.activeLayerId).toBe(1);
  });

  // ── ポインターイベント（描画フロー） ──────────────────

  describe("ポインターイベント（描画フロー）", () => {
    it("sketchMode が false のときは handlePointerDown で描画が開始されない", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      // sketchMode = false（初期状態）
      const ev = createPointerEvent(100, 100);
      act(() => result.current.handlePointerDown(ev));

      // pointerUp しても何も追加されない
      act(() => result.current.handlePointerUp());
      expect(result.current.layers[0].strokes).toHaveLength(0);
    });

    it("canvasRef が null のときは handlePointerDown で描画が開始されない", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.setSketchMode(true));

      // canvasRef = null（初期状態）
      const ev = createPointerEvent(100, 100);
      act(() => result.current.handlePointerDown(ev));
      act(() => result.current.handlePointerUp());

      expect(result.current.layers[0].strokes).toHaveLength(0);
    });

    it("pen ツールで描画すると全ポイントが蓄積される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));
      act(() => result.current.setActiveTool("pen"));

      const down = createPointerEvent(100, 100);
      act(() => result.current.handlePointerDown(down));

      // 複数のmoveイベント
      act(() => result.current.handlePointerMove(createPointerEvent(150, 150)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerMove(createPointerEvent(250, 300)));

      act(() => result.current.handlePointerUp());

      const stroke = result.current.layers[0].strokes[0];
      expect(stroke.tool).toBe("pen");
      // 始点 + 3 move = 4 points
      expect(stroke.points).toHaveLength(4);
      expect(stroke.color).toBe("#ef4444");
      expect(stroke.width).toBe(4);
    });

    it("line ツールでは始点と最新のポイントのみ保持される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));
      act(() => result.current.setActiveTool("line"));

      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerMove(createPointerEvent(300, 300)));
      act(() => result.current.handlePointerMove(createPointerEvent(400, 400)));
      act(() => result.current.handlePointerUp());

      const stroke = result.current.layers[0].strokes[0];
      expect(stroke.tool).toBe("line");
      // line は始点+最新 = 2 ポイント
      expect(stroke.points).toHaveLength(2);
      // 始点は (100/800, 100/600) = (0.125, 0.1667)
      expect(stroke.points[0].x).toBeCloseTo(100 / 800);
      expect(stroke.points[0].y).toBeCloseTo(100 / 600);
      // 最終ポイント
      expect(stroke.points[1].x).toBeCloseTo(400 / 800);
      expect(stroke.points[1].y).toBeCloseTo(400 / 600);
    });

    it("arrow ツールでは始点と最新のポイントのみ保持される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));
      act(() => result.current.setActiveTool("arrow"));

      act(() => result.current.handlePointerDown(createPointerEvent(50, 50)));
      act(() => result.current.handlePointerMove(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 300)));
      act(() => result.current.handlePointerUp());

      const stroke = result.current.layers[0].strokes[0];
      expect(stroke.tool).toBe("arrow");
      expect(stroke.points).toHaveLength(2);
    });

    it("ポイントが1つだけの極端に短いストロークは無視される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));

      // pointerDown のみで pointerMove なしに pointerUp
      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerUp());

      expect(result.current.layers[0].strokes).toHaveLength(0);
    });

    it("handlePointerMove で canvasRef が途中で null になっても安全", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));

      // 描画開始
      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));

      // canvasRef を null に設定（まれなケース）
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = null;
      });

      // move → toNormalized が null を返す → 早期リターン
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));

      // canvasRef を戻して pointerUp
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });
      act(() => result.current.handlePointerUp());

      // ポイントが1つしかないので短いストロークとして無視される
      expect(result.current.layers[0].strokes).toHaveLength(0);
    });

    it("handlePointerMove は描画中でないとき何もしない", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      // 描画開始せずに move
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));

      // 何も起きない（エラーにならない）
      expect(result.current.layers[0].strokes).toHaveLength(0);
    });

    it("handlePointerUp は描画中でないとき何もしない", () => {
      const { result } = renderHook(() => useSketchOverlay());

      // 描画開始せずに up
      act(() => result.current.handlePointerUp());

      // 何も起きない（エラーにならない）
      expect(result.current.layers[0].strokes).toHaveLength(0);
    });

    it("描画時に setPointerCapture が呼ばれる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));

      const ev = createPointerEvent(100, 100);
      const mockSetPointerCapture = (ev.target as HTMLElement)
        .setPointerCapture as ReturnType<typeof vi.fn>;

      act(() => result.current.handlePointerDown(ev));
      expect(mockSetPointerCapture).toHaveBeenCalledWith(1);
    });

    it("描画時にカスタムの strokeColor と strokeWidth が使用される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));
      act(() => result.current.setStrokeColor("#00ff00"));
      act(() => result.current.setStrokeWidth(10));

      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerUp());

      const stroke = result.current.layers[0].strokes[0];
      expect(stroke.color).toBe("#00ff00");
      expect(stroke.width).toBe(10);
    });

    it("複数のストロークを連続で描画できる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));

      // ストローク1
      act(() => result.current.handlePointerDown(createPointerEvent(10, 10)));
      act(() => result.current.handlePointerMove(createPointerEvent(20, 20)));
      act(() => result.current.handlePointerUp());

      // ストローク2
      act(() => result.current.handlePointerDown(createPointerEvent(50, 50)));
      act(() => result.current.handlePointerMove(createPointerEvent(60, 60)));
      act(() => result.current.handlePointerUp());

      expect(result.current.layers[0].strokes).toHaveLength(2);
      // ストロークIDは連番
      expect(result.current.layers[0].strokes[0].id).toBe(1);
      expect(result.current.layers[0].strokes[1].id).toBe(2);
    });

    it("ストロークはアクティブレイヤーに追加される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));

      // Layer 2を追加してアクティブにする
      act(() => result.current.addLayer());
      const layer2Id = result.current.activeLayerId;

      // 描画
      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerUp());

      // Layer 2にストロークが追加される
      const layer2 = result.current.layers.find((l) => l.id === layer2Id)!;
      expect(layer2.strokes).toHaveLength(1);

      // Layer 1は空のまま
      const layer1 = result.current.layers.find((l) => l.id === 1)!;
      expect(layer1.strokes).toHaveLength(0);
    });
  });

  // ── redraw（Canvas描画） ─────────────────────────────

  describe("redraw（Canvas描画）", () => {
    it("redraw は canvasRef が null のとき何もしない", () => {
      const { result } = renderHook(() => useSketchOverlay());

      // canvasRef = null（初期状態）→ エラーにならない
      act(() => result.current.redraw());
    });

    it("redraw は getContext が null のとき何もしない", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const canvas = {
        width: 800,
        height: 600,
        getContext: vi.fn().mockReturnValue(null),
      } as unknown as HTMLCanvasElement;

      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      // エラーにならない
      act(() => result.current.redraw());
    });

    it("redraw でレイヤー内のストロークが描画される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      // ストロークを描画
      act(() => result.current.setSketchMode(true));
      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerUp());

      // redraw を明示的に呼ぶ
      vi.clearAllMocks();
      act(() => result.current.redraw());

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it("redraw で非表示レイヤーのストロークはスキップされる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      // ストロークを描画
      act(() => result.current.setSketchMode(true));
      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerUp());

      // レイヤーを非表示
      act(() => result.current.toggleLayerVisibility(1));

      vi.clearAllMocks();
      act(() => result.current.redraw());

      // clearRect は呼ばれるが、stroke は呼ばれない
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it("redraw に layerData 引数を渡すとそのデータで描画される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      const customLayers = [
        {
          id: 1,
          strokes: [
            {
              id: 1,
              tool: "pen" as const,
              points: [
                { x: 0.1, y: 0.1 },
                { x: 0.5, y: 0.5 },
              ],
              color: "#ff0000",
              width: 2,
            },
          ],
          visible: true,
          name: "Custom",
        },
      ];

      vi.clearAllMocks();
      act(() => result.current.redraw(customLayers));

      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it("redraw で line ツールのストロークが描画される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      const lineLayer = [
        {
          id: 1,
          strokes: [
            {
              id: 1,
              tool: "line" as const,
              points: [
                { x: 0.1, y: 0.1 },
                { x: 0.9, y: 0.9 },
              ],
              color: "#0000ff",
              width: 3,
            },
          ],
          visible: true,
          name: "Line Layer",
        },
      ];

      vi.clearAllMocks();
      act(() => result.current.redraw(lineLayer));

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledWith(0.1 * 800, 0.1 * 600);
      expect(ctx.lineTo).toHaveBeenCalledWith(0.9 * 800, 0.9 * 600);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it("redraw で arrow ツールのストロークが矢印付きで描画される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      const arrowLayer = [
        {
          id: 1,
          strokes: [
            {
              id: 1,
              tool: "arrow" as const,
              points: [
                { x: 0.1, y: 0.1 },
                { x: 0.9, y: 0.9 },
              ],
              color: "#ff00ff",
              width: 5,
            },
          ],
          visible: true,
          name: "Arrow Layer",
        },
      ];

      vi.clearAllMocks();
      act(() => result.current.redraw(arrowLayer));

      // stroke で線を引き、fill で矢印の頭を描画
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it("redraw で空のポイント配列のストロークはスキップされる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      const emptyLayer = [
        {
          id: 1,
          strokes: [
            {
              id: 1,
              tool: "pen" as const,
              points: [],
              color: "#ff0000",
              width: 2,
            },
          ],
          visible: true,
          name: "Empty",
        },
      ];

      vi.clearAllMocks();
      act(() => result.current.redraw(emptyLayer));

      expect(ctx.clearRect).toHaveBeenCalled();
      // 空のポイントなので stroke は呼ばれない
      expect(ctx.beginPath).not.toHaveBeenCalled();
    });

    it("redraw で line ツールのポイントが1つだけの場合はスキップされる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      const singlePointLine = [
        {
          id: 1,
          strokes: [
            {
              id: 1,
              tool: "line" as const,
              points: [{ x: 0.5, y: 0.5 }],
              color: "#ff0000",
              width: 2,
            },
          ],
          visible: true,
          name: "Single",
        },
      ];

      vi.clearAllMocks();
      act(() => result.current.redraw(singlePointLine));

      // 1ポイントしかないので描画されない
      expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it("redraw で arrow ツールのポイントが1つだけの場合はスキップされる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      const singlePointArrow = [
        {
          id: 1,
          strokes: [
            {
              id: 1,
              tool: "arrow" as const,
              points: [{ x: 0.5, y: 0.5 }],
              color: "#ff0000",
              width: 2,
            },
          ],
          visible: true,
          name: "Single Arrow",
        },
      ];

      vi.clearAllMocks();
      act(() => result.current.redraw(singlePointArrow));

      expect(ctx.stroke).not.toHaveBeenCalled();
      expect(ctx.fill).not.toHaveBeenCalled();
    });
  });

  // ── 永続化（デバウンス保存） ─────────────────────────

  describe("永続化（デバウンス保存）", () => {
    it("レイヤー操作後にデバウンスで saveSketch が呼ばれる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.addLayer());

      // デバウンス前は呼ばれていない
      expect(mockSaveSketch).not.toHaveBeenCalled();

      // 1000ms 経過後に保存が実行される
      act(() => vi.advanceTimersByTime(1000));
      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("デバウンス中に操作を繰り返すとタイマーがリセットされる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.renameLayer(1, "名前1"));
      act(() => vi.advanceTimersByTime(500));

      act(() => result.current.renameLayer(1, "名前2"));
      act(() => vi.advanceTimersByTime(500));

      // まだ最初の1000msは経過していないが、2回目のリセット後500msなので呼ばれない
      expect(mockSaveSketch).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(500));
      // 2回目のリセットから1000ms経過
      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("saveSketch に正しいレコード形式で保存される", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.renameLayer(1, "テスト"));
      act(() => vi.advanceTimersByTime(1000));

      expect(mockSaveSketch).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "current",
          activeLayerId: 1,
          layers: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              name: "テスト",
            }),
          ]),
          updatedAt: expect.any(Number),
        }),
      );
    });

    it("ストローク描画完了後にデバウンス保存がスケジュールされる", () => {
      const { result } = renderHook(() => useSketchOverlay());

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      act(() => result.current.setSketchMode(true));

      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerUp());

      expect(mockSaveSketch).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1000));
      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("各レイヤー操作で saveSketch が呼ばれる（toggleLayerVisibility）", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.toggleLayerVisibility(1));
      act(() => vi.advanceTimersByTime(1000));

      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("各レイヤー操作で saveSketch が呼ばれる（undoLastStroke）", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.undoLastStroke());
      act(() => vi.advanceTimersByTime(1000));

      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("各レイヤー操作で saveSketch が呼ばれる（clearLayer）", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.clearLayer());
      act(() => vi.advanceTimersByTime(1000));

      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("各レイヤー操作で saveSketch が呼ばれる（clearAllStrokes）", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.clearAllStrokes());
      act(() => vi.advanceTimersByTime(1000));

      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("各レイヤー操作で saveSketch が呼ばれる（removeLayer）", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.addLayer());
      act(() => vi.advanceTimersByTime(1000));
      vi.clearAllMocks();

      act(() => result.current.removeLayer(1));
      act(() => vi.advanceTimersByTime(1000));

      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });

    it("各レイヤー操作で saveSketch が呼ばれる（reorderLayers）", () => {
      const { result } = renderHook(() => useSketchOverlay());

      act(() => result.current.addLayer());
      act(() => vi.advanceTimersByTime(1000));
      vi.clearAllMocks();

      const ids = result.current.layers.map((l) => l.id);
      act(() => result.current.reorderLayers(ids[0], ids[1]));
      act(() => vi.advanceTimersByTime(1000));

      expect(mockSaveSketch).toHaveBeenCalledTimes(1);
    });
  });

  // ── マウント時のロード ───────────────────────────────

  describe("マウント時のロード", () => {
    it("保存済みデータがある場合、マウント時にレイヤーが復元される", async () => {
      const savedRecord = {
        id: "current",
        layers: [
          {
            id: 1,
            strokes: [
              {
                id: 1,
                tool: "pen" as const,
                points: [
                  { x: 0.1, y: 0.1 },
                  { x: 0.5, y: 0.5 },
                ],
                color: "#ff0000",
                width: 3,
              },
            ],
            visible: true,
            name: "Saved Layer",
          },
          {
            id: 2,
            strokes: [
              {
                id: 5,
                tool: "line" as const,
                points: [
                  { x: 0.2, y: 0.2 },
                  { x: 0.8, y: 0.8 },
                ],
                color: "#0000ff",
                width: 2,
              },
            ],
            visible: false,
            name: "Layer 2",
          },
        ],
        activeLayerId: 2,
        updatedAt: Date.now(),
      };

      mockLoadSketch.mockResolvedValue(savedRecord);

      const { result } = renderHook(() => useSketchOverlay());

      // loadSketch の非同期処理を待つ
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.layers).toHaveLength(2);
      expect(result.current.layers[0].name).toBe("Saved Layer");
      expect(result.current.layers[0].strokes).toHaveLength(1);
      expect(result.current.layers[1].name).toBe("Layer 2");
      expect(result.current.layers[1].visible).toBe(false);
      expect(result.current.activeLayerId).toBe(2);
    });

    it("保存済みデータが null の場合、デフォルトレイヤーが使用される", async () => {
      mockLoadSketch.mockResolvedValue(null);

      const { result } = renderHook(() => useSketchOverlay());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.layers).toHaveLength(1);
      expect(result.current.layers[0].name).toBe("Layer 1");
      expect(result.current.activeLayerId).toBe(1);
    });

    it("保存済みデータの layers が空配列の場合、デフォルトレイヤーが使用される", async () => {
      mockLoadSketch.mockResolvedValue({
        id: "current",
        layers: [],
        activeLayerId: 1,
        updatedAt: Date.now(),
      });

      const { result } = renderHook(() => useSketchOverlay());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.layers).toHaveLength(1);
      expect(result.current.layers[0].name).toBe("Layer 1");
    });

    it("復元時に nextStrokeId がレコード内の最大IDに基づいて設定される", async () => {
      const savedRecord = {
        id: "current",
        layers: [
          {
            id: 1,
            strokes: [
              {
                id: 10,
                tool: "pen" as const,
                points: [
                  { x: 0.1, y: 0.1 },
                  { x: 0.5, y: 0.5 },
                ],
                color: "#ff0000",
                width: 3,
              },
              {
                id: 20,
                tool: "line" as const,
                points: [
                  { x: 0.2, y: 0.2 },
                  { x: 0.8, y: 0.8 },
                ],
                color: "#0000ff",
                width: 2,
              },
            ],
            visible: true,
            name: "Layer 1",
          },
        ],
        activeLayerId: 1,
        updatedAt: Date.now(),
      };

      mockLoadSketch.mockResolvedValue(savedRecord);

      const { result } = renderHook(() => useSketchOverlay());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const ctx = createMockContext();
      const canvas = createMockCanvas(ctx);
      act(() => {
        (
          result.current
            .canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
        ).current = canvas;
      });

      // 新しいストロークを描画 → id は 21 以上になるはず
      act(() => result.current.setSketchMode(true));
      act(() => result.current.handlePointerDown(createPointerEvent(100, 100)));
      act(() => result.current.handlePointerMove(createPointerEvent(200, 200)));
      act(() => result.current.handlePointerUp());

      const newStroke =
        result.current.layers[0].strokes[
          result.current.layers[0].strokes.length - 1
        ];
      expect(newStroke.id).toBe(21);
    });
  });

  // ── canvasRef ────────────────────────────────────────

  it("canvasRef が返される", () => {
    const { result } = renderHook(() => useSketchOverlay());
    expect(result.current.canvasRef).toBeDefined();
    expect(result.current.canvasRef.current).toBeNull();
  });
});
