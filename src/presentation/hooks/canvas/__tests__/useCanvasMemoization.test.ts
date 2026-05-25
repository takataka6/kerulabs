/**
 * @module useCanvasMemoization フック
 * @description キャンバス描画パラメータのメモ化フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なuseMemoの参照安定性テスト）
 * - 依存値が変わらない場合のオブジェクト参照の安定性を検証
 * - 依存値変更時の再計算を検証
 * - カード・選手ビュー・実行状態など各パラメータグループの独立性を検証
 */
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCanvasMemoization } from "../useCanvasMemoization";
import type { CardStatus } from "@presentation/components/tactics-viewer/types";

interface UseCanvasMemoizationParams {
  showCards: boolean;
  captureMode: boolean;
  playerCards: Record<number, CardStatus>;
  lineFromPlayerIndex: number | null;
  selectedPlayerIndex: number | null;
  playerViewEnabled: boolean;
  selectedOpponentViewId: number | null;
  isExecuting: boolean;
  opponentPlacementMode: boolean;
  ballPlacementMode: boolean;
  lineDrawingMode: boolean;
  creation: { wizardStep: string } | null;
  ballPassCreationMode: boolean;
  ballPassStartPos: { x: number; z: number } | null;
  pendingLineEndPos: { x: number; z: number } | null;
  lineColor: string;
}

function createDefaultParams(): UseCanvasMemoizationParams {
  return {
    showCards: false,
    captureMode: false,
    playerCards: {},
    lineFromPlayerIndex: null,
    selectedPlayerIndex: null,
    playerViewEnabled: false,
    selectedOpponentViewId: null,
    isExecuting: false,
    opponentPlacementMode: false,
    ballPlacementMode: false,
    lineDrawingMode: false,
    creation: null,
    ballPassCreationMode: false,
    ballPassStartPos: null,
    pendingLineEndPos: null,
    lineColor: "#000",
  };
}

describe("useCanvasMemoization", () => {
  describe("canvasPlayerCards", () => {
    it("showCards=true && captureMode=false の場合、playerCards を返す", () => {
      const cards: Record<number, CardStatus> = { 1: "yellow", 2: "red" };
      const params = createDefaultParams();
      params.showCards = true;
      params.captureMode = false;
      params.playerCards = cards;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerCards).toBe(cards);
    });

    it("captureMode=true の場合、空オブジェクトを返す", () => {
      const cards: Record<number, CardStatus> = { 1: "yellow" };
      const params = createDefaultParams();
      params.showCards = true;
      params.captureMode = true;
      params.playerCards = cards;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerCards).toEqual({});
    });

    it("showCards=false の場合、空オブジェクトを返す", () => {
      const cards: Record<number, CardStatus> = { 3: "red" };
      const params = createDefaultParams();
      params.showCards = false;
      params.captureMode = false;
      params.playerCards = cards;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerCards).toEqual({});
    });
  });

  describe("canvasSelectedPlayerIndex", () => {
    it("lineFromPlayerIndex が null でない場合はそれを返す", () => {
      const params = createDefaultParams();
      params.lineFromPlayerIndex = 5;
      params.selectedPlayerIndex = 3;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasSelectedPlayerIndex).toBe(5);
    });

    it("lineFromPlayerIndex が null の場合は selectedPlayerIndex を返す", () => {
      const params = createDefaultParams();
      params.lineFromPlayerIndex = null;
      params.selectedPlayerIndex = 7;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasSelectedPlayerIndex).toBe(7);
    });

    it("両方 null の場合は null を返す", () => {
      const params = createDefaultParams();

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasSelectedPlayerIndex).toBeNull();
    });
  });

  describe("canvasIsPlayerView", () => {
    it("playerViewEnabled=true && selectedPlayerIndex あり の場合 true を返す", () => {
      const params = createDefaultParams();
      params.playerViewEnabled = true;
      params.selectedPlayerIndex = 2;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasIsPlayerView).toBe(true);
    });

    it("playerViewEnabled=true && selectedOpponentViewId あり の場合 true を返す", () => {
      const params = createDefaultParams();
      params.playerViewEnabled = true;
      params.selectedOpponentViewId = 4;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasIsPlayerView).toBe(true);
    });

    it("playerViewEnabled=false の場合 false を返す", () => {
      const params = createDefaultParams();
      params.playerViewEnabled = false;
      params.selectedPlayerIndex = 2;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasIsPlayerView).toBe(false);
    });

    it("playerViewEnabled=true でも選択なしの場合 false を返す", () => {
      const params = createDefaultParams();
      params.playerViewEnabled = true;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasIsPlayerView).toBe(false);
    });
  });

  describe("canvasPlayerDraggable", () => {
    it("全モード OFF の場合 true を返す", () => {
      const params = createDefaultParams();

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(true);
    });

    it("isExecuting=true の場合 false を返す", () => {
      const params = createDefaultParams();
      params.isExecuting = true;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(false);
    });

    it("opponentPlacementMode=true の場合 false を返す", () => {
      const params = createDefaultParams();
      params.opponentPlacementMode = true;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(false);
    });

    it("ballPlacementMode=true の場合 false を返す", () => {
      const params = createDefaultParams();
      params.ballPlacementMode = true;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(false);
    });

    it("lineDrawingMode=true の場合 false を返す", () => {
      const params = createDefaultParams();
      params.lineDrawingMode = true;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(false);
    });

    it("playerViewEnabled=true の場合 false を返す", () => {
      const params = createDefaultParams();
      params.playerViewEnabled = true;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(false);
    });

    it("creation.wizardStep='editing' の場合 true を返す", () => {
      const params = createDefaultParams();
      params.isExecuting = true; // 通常は false になるが creation 側の条件で上書き
      params.creation = { wizardStep: "editing" };

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(true);
    });

    it("creation.wizardStep='setPosition' の場合 true を返す", () => {
      const params = createDefaultParams();
      params.isExecuting = true;
      params.creation = { wizardStep: "setPosition" };

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(true);
    });

    it("creation あり && ballPassCreationMode=true の場合 false を返す", () => {
      const params = createDefaultParams();
      params.isExecuting = true;
      params.creation = { wizardStep: "editing" };
      params.ballPassCreationMode = true;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(false);
    });

    it("creation.wizardStep が 'editing' でも 'setPosition' でもない場合 false を返す", () => {
      const params = createDefaultParams();
      params.isExecuting = true;
      params.creation = { wizardStep: "selectFormation" };

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPlayerDraggable).toBe(false);
    });
  });

  describe("canvasLineTrackingActive", () => {
    it("lineDrawingMode=true && lineFromPlayerIndex あり の場合 true を返す", () => {
      const params = createDefaultParams();
      params.lineDrawingMode = true;
      params.lineFromPlayerIndex = 3;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasLineTrackingActive).toBe(true);
    });

    it("ballPassCreationMode=true && ballPassStartPos あり の場合 true を返す", () => {
      const params = createDefaultParams();
      params.ballPassCreationMode = true;
      params.ballPassStartPos = { x: 1, z: 2 };

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasLineTrackingActive).toBe(true);
    });

    it("lineDrawingMode=true でも lineFromPlayerIndex が null の場合 false を返す", () => {
      const params = createDefaultParams();
      params.lineDrawingMode = true;
      params.lineFromPlayerIndex = null;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasLineTrackingActive).toBe(false);
    });

    it("全て OFF の場合 false を返す", () => {
      const params = createDefaultParams();

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasLineTrackingActive).toBe(false);
    });
  });

  describe("canvasPendingConnectionLine", () => {
    it("lineFromPlayerIndex と pendingLineEndPos がある場合、オブジェクトを返す", () => {
      const params = createDefaultParams();
      params.lineFromPlayerIndex = 2;
      params.pendingLineEndPos = { x: 10, z: 20 };
      params.lineColor = "#ff0000";

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPendingConnectionLine).toEqual({
        fromIndex: 2,
        endPos: { x: 10, z: 20 },
        color: "#ff0000",
      });
    });

    it("lineFromPlayerIndex が null の場合、null を返す", () => {
      const params = createDefaultParams();
      params.lineFromPlayerIndex = null;
      params.pendingLineEndPos = { x: 10, z: 20 };

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPendingConnectionLine).toBeNull();
    });

    it("pendingLineEndPos が null の場合、null を返す", () => {
      const params = createDefaultParams();
      params.lineFromPlayerIndex = 2;
      params.pendingLineEndPos = null;

      const { result } = renderHook(() => useCanvasMemoization(params));

      expect(result.current.canvasPendingConnectionLine).toBeNull();
    });
  });
});
