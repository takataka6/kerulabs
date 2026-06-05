/**
 * @module useCanvasCallbacks フック
 * @description 3Dキャンバス上の各種操作コールバックを集約するフックの単体テスト
 *
 * テスト方針:
 * - 全依存（tOrch / ballHook / connLines / opponentsHook / ui）をモックオブジェクトで注入
 * - コールバック参照の安定性（useCallback/useRef）を再レンダリングで検証
 * - 各コールバックの条件分岐（通常モード / ballPassCreationMode / creationStep）を検証
 * - requestAnimationFrame をモック化してドラッグ終了時の非同期処理を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCanvasCallbacks } from "../useCanvasCallbacks";

/* ------------------------------------------------------------------ */
/*  Mock helpers                                                       */
/* ------------------------------------------------------------------ */

function createMockDeps() {
  return {
    tOrch: {
      ballPassCreationMode: false,
      ballPassStartPos: null as { x: number; z: number } | null,
      isCreationBallPositionStep: false,
      isCreationBallTrajectoryStep: false,
      ballPassTrajectoryType: "high" as const,
      setBallPassStartPos: vi.fn(),
      setBallPassPendingEndPos: vi.fn(),
      tacticCreation: {
        addBallPassByCoords: vi.fn(),
        setBallPosition: vi.fn(),
        setBallTrajectory: vi.fn(),
        creation: null as {
          ballTrajectory?: { trajectoryType?: string };
        } | null,
      },
      handlePlayerDragEnd: vi.fn(),
      handleGroupPlayerDragEnd: vi.fn(),
      setManualPlayerPositions: vi.fn(),
    },
    ballHook: {
      handleBallPlace: vi.fn(),
      handleBallDrag: vi.fn(),
      handleBallRemove: vi.fn(),
    },
    connLines: {
      lineDrawingMode: false,
      setPendingLineEndPos: vi.fn(),
    },
    opponentsHook: {
      handleFieldClick: vi.fn(),
      setOpponents: vi.fn(),
    },
    ui: {
      isDraggingObject: false,
      setIsDraggingObject: vi.fn(),
      setCameraAction: vi.fn(),
    },
    pushCurrentSnapshot: vi.fn(),
  };
}

type MockDeps = ReturnType<typeof createMockDeps>;

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("useCanvasCallbacks", () => {
  let deps: MockDeps;

  beforeEach(() => {
    vi.clearAllMocks();
    // rafThrottle 内の RAF を即時実行にスタブ化
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      cb();
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    deps = createMockDeps();
  });

  // ── コールバック参照の安定性 ──

  it("依存が変わってもコールバック参照が安定している", () => {
    const { result, rerender } = renderHook(
      (d) => useCanvasCallbacks(d as never),
      { initialProps: deps },
    );

    const first = { ...result.current };

    // deps を新しいオブジェクトで再描画
    const newDeps = createMockDeps();
    rerender(newDeps as never);

    // コールバックの参照が同一であること
    expect(result.current.handleFieldClick).toBe(first.handleFieldClick);
    expect(result.current.handleBallPlace).toBe(first.handleBallPlace);
    expect(result.current.handleBallDrag).toBe(first.handleBallDrag);
    expect(result.current.handleBallRemove).toBe(first.handleBallRemove);
    expect(result.current.handleDragStart).toBe(first.handleDragStart);
    expect(result.current.handleDragEnd).toBe(first.handleDragEnd);
    expect(result.current.handlePlayerDragEnd).toBe(first.handlePlayerDragEnd);
    expect(result.current.handleGroupDragEnd).toBe(first.handleGroupDragEnd);
    expect(result.current.handleLinePointerMove).toBe(
      first.handleLinePointerMove,
    );
    expect(result.current.handleCameraActionDone).toBe(
      first.handleCameraActionDone,
    );
  });

  // ── handleFieldClick ──

  describe("handleFieldClick", () => {
    it("opponentsHook.handleFieldClick に委譲する", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 1, z: 2 };
      act(() => result.current.handleFieldClick(pos));

      expect(deps.opponentsHook.handleFieldClick).toHaveBeenCalledWith(
        pos,
        deps.ui.isDraggingObject,
      );
    });
  });

  // ── handleBallPlace ──

  describe("handleBallPlace", () => {
    it("通常モードでは ballHook.handleBallPlace に委譲する", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 3, z: 4 };
      act(() => result.current.handleBallPlace(pos));

      expect(deps.ballHook.handleBallPlace).toHaveBeenCalledWith(pos);
    });

    it("ballPassCreationMode で開始位置未設定の場合、setBallPassStartPos を呼ぶ", () => {
      deps.tOrch.ballPassCreationMode = true;
      deps.tOrch.ballPassStartPos = null;

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 5, z: 6 };
      act(() => result.current.handleBallPlace(pos));

      expect(deps.tOrch.setBallPassStartPos).toHaveBeenCalledWith(pos);
    });

    it("ballPassCreationMode で開始位置がある場合、addBallPassByCoords を呼んでリセットする", () => {
      deps.tOrch.ballPassCreationMode = true;
      deps.tOrch.ballPassStartPos = { x: 1, z: 2 };

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 5, z: 6 };
      act(() => result.current.handleBallPlace(pos));

      expect(
        deps.tOrch.tacticCreation.addBallPassByCoords,
      ).toHaveBeenCalledWith(1, 2, 5, 6, "#facc15", "high");
      expect(deps.tOrch.setBallPassStartPos).toHaveBeenCalledWith(null);
      expect(deps.tOrch.setBallPassPendingEndPos).toHaveBeenCalledWith(null);
    });

    it("isCreationBallPositionStep の場合、setBallPosition を呼ぶ", () => {
      deps.tOrch.isCreationBallPositionStep = true;

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 7, z: 8 };
      act(() => result.current.handleBallPlace(pos));

      expect(deps.tOrch.tacticCreation.setBallPosition).toHaveBeenCalledWith(
        pos,
      );
    });

    it("isCreationBallTrajectoryStep の場合、setBallTrajectory を呼ぶ", () => {
      deps.tOrch.isCreationBallTrajectoryStep = true;
      deps.tOrch.tacticCreation.creation = {
        ballTrajectory: { trajectoryType: "low" },
      };

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 9, z: 10 };
      act(() => result.current.handleBallPlace(pos));

      expect(deps.tOrch.tacticCreation.setBallTrajectory).toHaveBeenCalledWith({
        endX: 9,
        endZ: 10,
        color: "#facc15",
        trajectoryType: "low",
      });
    });
  });

  // ── handleBallDrag ──

  describe("handleBallDrag", () => {
    it("通常モードでは ballHook.handleBallDrag に委譲する", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 1, z: 2 };
      act(() => result.current.handleBallDrag(pos));

      expect(deps.ballHook.handleBallDrag).toHaveBeenCalledWith(pos);
    });

    it("isCreationBallPositionStep の場合、setBallPosition を呼ぶ", () => {
      deps.tOrch.isCreationBallPositionStep = true;

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 3, z: 4 };
      act(() => result.current.handleBallDrag(pos));

      expect(deps.tOrch.tacticCreation.setBallPosition).toHaveBeenCalledWith(
        pos,
      );
      expect(deps.ballHook.handleBallDrag).not.toHaveBeenCalled();
    });
  });

  // ── handleBallRemove ──

  describe("handleBallRemove", () => {
    it("通常モードでは ballHook.handleBallRemove に委譲する", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      act(() => result.current.handleBallRemove());

      expect(deps.ballHook.handleBallRemove).toHaveBeenCalled();
    });

    it("isCreationBallPositionStep の場合、setBallPosition(null) を呼ぶ", () => {
      deps.tOrch.isCreationBallPositionStep = true;

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      act(() => result.current.handleBallRemove());

      expect(deps.tOrch.tacticCreation.setBallPosition).toHaveBeenCalledWith(
        null,
      );
      expect(deps.ballHook.handleBallRemove).not.toHaveBeenCalled();
    });
  });

  // ── handleDragStart / handleDragEnd ──

  describe("handleDragStart", () => {
    it("setIsDraggingObject(true) を呼ぶ", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      act(() => result.current.handleDragStart());

      expect(deps.ui.setIsDraggingObject).toHaveBeenCalledWith(true);
    });
  });

  describe("handleDragEnd", () => {
    it("setIsDraggingObject(false) を呼び、rAF 後に pushCurrentSnapshot を呼ぶ", async () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      // requestAnimationFrame をモック
      const rAF = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      act(() => result.current.handleDragEnd());

      expect(deps.ui.setIsDraggingObject).toHaveBeenCalledWith(false);
      expect(deps.pushCurrentSnapshot).toHaveBeenCalled();

      rAF.mockRestore();
    });
  });

  // ── handlePlayerDragEnd ──

  describe("handlePlayerDragEnd", () => {
    it("setIsDraggingObject(false) + tOrch.handlePlayerDragEnd を呼ぶ", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 1, z: 2 };
      act(() => result.current.handlePlayerDragEnd(3, pos));

      expect(deps.ui.setIsDraggingObject).toHaveBeenCalledWith(false);
      expect(deps.tOrch.handlePlayerDragEnd).toHaveBeenCalledWith(3, pos);
    });
  });

  // ── handleGroupDragEnd ──

  describe("handleGroupDragEnd", () => {
    it("プレイヤーの位置を一括コミットする", () => {
      const rAF = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const positions = [
        { type: "player" as const, id: 0, pos: { x: 1, z: 2 } },
        { type: "player" as const, id: 1, pos: { x: 3, z: 4 } },
      ];

      act(() => result.current.handleGroupDragEnd(positions));

      expect(deps.ui.setIsDraggingObject).toHaveBeenCalledWith(false);
      expect(deps.tOrch.handleGroupPlayerDragEnd).toHaveBeenCalledWith([
        { index: 0, pos: { x: 1, z: 2 } },
        { index: 1, pos: { x: 3, z: 4 } },
      ]);
      expect(deps.pushCurrentSnapshot).not.toHaveBeenCalled();

      rAF.mockRestore();
    });

    it("相手マーカーの位置を一括コミットする", () => {
      const rAF = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const positions = [
        { type: "opponent" as const, id: 10, pos: { x: 5, z: 6 } },
      ];

      act(() => result.current.handleGroupDragEnd(positions));

      expect(deps.opponentsHook.setOpponents).toHaveBeenCalled();
      expect(deps.pushCurrentSnapshot).toHaveBeenCalled();

      rAF.mockRestore();
    });

    it("プレイヤーも相手もない場合、位置コミットは呼ばれない", () => {
      const rAF = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => {
          cb(0);
          return 0;
        });

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      act(() => result.current.handleGroupDragEnd([]));

      expect(deps.tOrch.handleGroupPlayerDragEnd).not.toHaveBeenCalled();
      expect(deps.opponentsHook.setOpponents).not.toHaveBeenCalled();
      // pushCurrentSnapshot はドラッグ終了時に常に呼ばれる
      expect(deps.pushCurrentSnapshot).toHaveBeenCalled();

      rAF.mockRestore();
    });
  });

  // ── handleLinePointerMove ──

  describe("handleLinePointerMove", () => {
    it("lineDrawingMode 時に setPendingLineEndPos を呼ぶ", () => {
      deps.connLines.lineDrawingMode = true;

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 10, z: 20 };
      act(() => result.current.handleLinePointerMove(pos));

      expect(deps.connLines.setPendingLineEndPos).toHaveBeenCalledWith(pos);
    });

    it("ballPassCreationMode + ballPassStartPos 時に setBallPassPendingEndPos を呼ぶ", () => {
      deps.tOrch.ballPassCreationMode = true;
      deps.tOrch.ballPassStartPos = { x: 0, z: 0 };

      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      const pos = { x: 10, z: 20 };
      act(() => result.current.handleLinePointerMove(pos));

      expect(deps.tOrch.setBallPassPendingEndPos).toHaveBeenCalledWith(pos);
    });

    it("どちらのモードでもない場合、何も呼ばれない", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      act(() => result.current.handleLinePointerMove({ x: 1, z: 2 }));

      expect(deps.connLines.setPendingLineEndPos).not.toHaveBeenCalled();
      expect(deps.tOrch.setBallPassPendingEndPos).not.toHaveBeenCalled();
    });
  });

  // ── handleCameraActionDone ──

  describe("handleCameraActionDone", () => {
    it("setCameraAction(null) を呼ぶ", () => {
      const { result } = renderHook(() => useCanvasCallbacks(deps as never));

      act(() => result.current.handleCameraActionDone());

      expect(deps.ui.setCameraAction).toHaveBeenCalledWith(null);
    });
  });
});
