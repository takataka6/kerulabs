/**
 * @module useTacticsOrchestration 派生状態テスト
 * @description 派生状態・マージ計算・フィルタリング・ステートsetterの単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  resetAllMocks,
  createDefaultParams,
  createWrapper,
  createTestTactic,
  createTestFormation,
  createMockCreationState,
  setMockCreationState,
  setMockExecutionState,
  mockGetPreviewArrows,
  mockGetStepStartPositions,
  mockFileService,
  mockConfirm,
  mockTacticShareExport,
  mockTacticShareImport,
  mockCreationState,
  mockIsExecuting,
  mockActiveTacticId,
  mockExecutionPhase,
  mockExecutingBallPosition,
  mockPlayerPositions,
  mockArrows,
  mockBallTrajectories,
  mockStartCreation,
  mockCancelCreation,
  mockBuildTactic,
  mockExecuteTactic,
  mockResetTactic,
  mockSetPlayerTarget,
  mockSetSetPosition,
  mockSetWizardStep,
  mockSwitchToStep,
  mockAddStep,
  mockResetCurrentStep,
  mockGetPreviewBallPasses,
} from "./useTacticsOrchestration.testHelpers";
import { useTacticsOrchestration } from "../useTacticsOrchestration";

// ── vi.mock 宣言（ホイスト対象） ──

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    fileService: mockFileService,
    tacticInteractor: {
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  }),
}));
vi.mock("@shared/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));
vi.mock("@shared/errors/handleError", () => ({ handleError: vi.fn() }));
vi.mock("@presentation/components/ui", () => ({
  useConfirm: () => ({ confirm: mockConfirm, alert: vi.fn() }),
}));
vi.mock("@application/services/TacticShareService", () => ({
  TacticShareService: {
    export: (...args: unknown[]) => mockTacticShareExport(...args),
    import: (...args: unknown[]) => mockTacticShareImport(...args),
  },
}));
vi.mock("../useTacticCreation", () => ({
  useTacticCreation: () => ({
    creation: mockCreationState,
    startCreation: mockStartCreation,
    cancelCreation: mockCancelCreation,
    buildTactic: mockBuildTactic,
    setPlayerTarget: mockSetPlayerTarget,
    setSetPosition: mockSetSetPosition,
    setWizardStep: mockSetWizardStep,
    switchToStep: mockSwitchToStep,
    addStep: mockAddStep,
    resetCurrentStep: mockResetCurrentStep,
    getPreviewArrows: mockGetPreviewArrows,
    getPreviewBallPasses: mockGetPreviewBallPasses,
    getStepStartPositions: mockGetStepStartPositions,
    setNameJa: vi.fn(),
    setNameEn: vi.fn(),
    setIcon: vi.fn(),
    setGamePhase: vi.fn(),
    removePlayerTarget: vi.fn(),
    addBallPass: vi.fn(),
    addBallPassByCoords: vi.fn(),
    removeBallPass: vi.fn(),
    updateBallPassTrajectoryType: vi.fn(),
    setTimelineOpen: vi.fn(),
    setMovementDelay: vi.fn(),
    setStepDuration: vi.fn(),
    setBallPosition: vi.fn(),
    setBallTrajectory: vi.fn(),
    setTrajectoryType: vi.fn(),
    resetSetPositions: vi.fn(),
  }),
}));
vi.mock("../useTacticExecution", () => ({
  useTacticExecution: () => ({
    execute: mockExecuteTactic,
    startStepExecution: vi.fn(),
    executeNextStep: vi.fn(),
    exitStepMode: vi.fn(),
    reset: mockResetTactic,
    isExecuting: mockIsExecuting,
    activeTacticId: mockActiveTacticId,
    executionPhase: mockExecutionPhase,
    executingBallPosition: mockExecutingBallPosition,
    playerPositions: mockPlayerPositions,
    arrows: mockArrows,
    ballTrajectories: mockBallTrajectories,
    stepExecution: {
      isStepMode: false,
      currentStep: 0,
      totalSteps: 1,
      isStepRunning: false,
      tactic: null,
    },
  }),
}));
vi.mock("../queries/useSaveTactic", () => ({
  useSaveTactic: () => ({ mutateAsync: vi.fn().mockResolvedValue(undefined) }),
}));
vi.mock("../queries/useDeleteTactic", () => ({
  useDeleteTactic: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("useTacticsOrchestration — 派生状態", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  // ==========================================================================
  // derived state
  // ==========================================================================
  describe("派生状態", () => {
    it("undoRedoEnabled: creation がある場合 false", () => {
      setMockCreationState(createMockCreationState({ wizardStep: "metadata" }));
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.undoRedoEnabled).toBe(false);
    });

    it("isCreationBallPositionStep: wizardStep が ballPosition のとき true", () => {
      setMockCreationState(
        createMockCreationState({ wizardStep: "ballPosition" }),
      );
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.isCreationBallPositionStep).toBe(true);
      expect(result.current.isCreationBallTrajectoryStep).toBe(false);
    });

    it("isCreationBallTrajectoryStep: wizardStep が ballTrajectory のとき true", () => {
      setMockCreationState(
        createMockCreationState({ wizardStep: "ballTrajectory" }),
      );
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.isCreationBallTrajectoryStep).toBe(true);
    });

    it("effectiveBallPosition: creation 中は creation.ballPosition を返す", () => {
      setMockCreationState(
        createMockCreationState({ ballPosition: { x: 10, z: 20 } }),
      );

      const params = createDefaultParams();
      params.ballHook.ballPosition = { x: 99, z: 99 };

      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.effectiveBallPosition).toEqual({ x: 10, z: 20 });
    });

    it("effectiveBallPosition: creation が null のとき ballHook.ballPosition を返す", () => {
      const params = createDefaultParams();
      params.ballHook.ballPosition = { x: 99, z: 99 };

      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.effectiveBallPosition).toEqual({ x: 99, z: 99 });
    });

    it("effectiveBallPlacementMode: ballPassCreationMode が true のとき true", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      act(() => {
        result.current.setBallPassCreationMode(true);
      });
      expect(result.current.effectiveBallPlacementMode).toBe(true);
    });

    it("activeTactic: activeTacticId に一致する戦術を返す", () => {
      const tactic = createTestTactic({ id: "t-match" });
      setMockExecutionState({ activeTacticId: "t-match" });

      const params = createDefaultParams({ tactics: [tactic] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.activeTactic).toBe(tactic);
    });

    it("activeTactic: 一致する戦術がないとき undefined", () => {
      setMockExecutionState({ activeTacticId: "nonexistent" });
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.activeTactic).toBeUndefined();
    });
  });

  // ==========================================================================
  // mergedPlayerPositions
  // ==========================================================================
  describe("mergedPlayerPositions", () => {
    it("execution の playerPositions を含む", () => {
      setMockExecutionState({ playerPositions: { 0: { x: 1, z: 2 } } });
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedPlayerPositions[0]).toEqual({ x: 1, z: 2 });
    });

    it("manualPlayerPositions が execution を上書きする", () => {
      setMockExecutionState({ playerPositions: { 0: { x: 1, z: 2 } } });
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 10, z: 20 });
      });
      expect(result.current.mergedPlayerPositions[0]).toEqual({ x: 10, z: 20 });
    });

    it("creation 中 (executing でない) は getStepStartPositions をマージする", () => {
      mockGetStepStartPositions.mockReturnValue({ 0: { x: 5, z: 5 } });
      setMockCreationState(createMockCreationState());

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedPlayerPositions[0]).toEqual({ x: 5, z: 5 });
    });
  });

  // ==========================================================================
  // mergedArrows
  // ==========================================================================
  describe("mergedArrows", () => {
    it("execution arrows と creationArrows をマージする", () => {
      setMockExecutionState({
        arrows: [{ start: { x: 0, z: 0 }, end: { x: 1, z: 1 }, color: "#000" }],
      });
      mockGetPreviewArrows.mockReturnValue([
        { start: { x: 2, z: 2 }, end: { x: 3, z: 3 }, color: "#fff" },
      ]);
      setMockCreationState(createMockCreationState());

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedArrows).toHaveLength(2);
    });

    it("isExecuting のとき creationArrows は空", () => {
      setMockExecutionState({
        isExecuting: true,
        arrows: [{ start: { x: 0, z: 0 }, end: { x: 1, z: 1 }, color: "#000" }],
      });
      setMockCreationState(createMockCreationState());

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      // creationArrows is skipped when executing, so only execution arrows
      expect(result.current.mergedArrows).toHaveLength(1);
      expect(mockGetPreviewArrows).not.toHaveBeenCalled();
    });

    it("setPosition ステップ中は creationArrows を表示しない", () => {
      setMockExecutionState({
        arrows: [{ start: { x: 0, z: 0 }, end: { x: 1, z: 1 }, color: "#000" }],
      });
      mockGetPreviewArrows.mockReturnValue([
        { start: { x: 2, z: 2 }, end: { x: 3, z: 3 }, color: "#fff" },
      ]);
      setMockCreationState(
        createMockCreationState({ wizardStep: "setPosition" }),
      );

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedArrows).toHaveLength(1);
      expect(mockGetPreviewArrows).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // mergedBallTrajectories
  // ==========================================================================
  describe("mergedBallTrajectories", () => {
    it("execution フェーズが highlight のとき execution trajectories を非表示", () => {
      setMockExecutionState({
        executionPhase: "highlight",
        ballTrajectories: [
          { start: { x: 0, z: 0 }, end: { x: 1, z: 1 }, color: "#000" },
        ],
      });

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedBallTrajectories).toHaveLength(0);
    });

    it("execution フェーズが set のとき execution trajectories を非表示", () => {
      setMockExecutionState({
        executionPhase: "set",
        ballTrajectories: [
          { start: { x: 0, z: 0 }, end: { x: 1, z: 1 }, color: "#000" },
        ],
      });

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedBallTrajectories).toHaveLength(0);
    });

    it("execution フェーズが run のとき execution trajectories を表示", () => {
      setMockExecutionState({
        executionPhase: "run",
        ballTrajectories: [
          { start: { x: 0, z: 0 }, end: { x: 1, z: 1 }, color: "#000" },
        ],
      });

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedBallTrajectories).toHaveLength(1);
    });

    it("creation の ballPosition + ballTrajectory がある場合マージされる", () => {
      setMockCreationState(
        createMockCreationState({
          ballPosition: { x: 5, z: 5 },
          ballTrajectory: {
            endX: 10,
            endZ: 10,
            color: "#f00",
            trajectoryType: "high",
          },
        }),
      );

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.mergedBallTrajectories).toHaveLength(1);
      expect(result.current.mergedBallTrajectories[0]).toEqual({
        start: { x: 5, z: 5 },
        end: { x: 10, z: 10 },
        color: "#f00",
        trajectoryType: "high",
      });
    });

    it("pendingBallPassPreview: startPos と endPos が両方あるとき含まれる", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.setBallPassStartPos({ x: 1, z: 1 });
        result.current.setBallPassPendingEndPos({ x: 2, z: 2 });
      });

      expect(result.current.mergedBallTrajectories).toHaveLength(1);
      expect(result.current.mergedBallTrajectories[0]).toEqual({
        start: { x: 1, z: 1 },
        end: { x: 2, z: 2 },
        color: "#facc15",
        trajectoryType: "low",
      });
    });
  });

  // ==========================================================================
  // ballHighlightPosition
  // ==========================================================================
  describe("ballHighlightPosition", () => {
    it("ballPassStartPos があるときは開始位置をハイライトする", () => {
      const params = createDefaultParams();
      params.ballHook.ballPosition = null;

      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setBallPassStartPos({ x: 12, z: 6 });
      });

      expect(result.current.ballHighlightPosition).toEqual({ x: 12, z: 6 });
    });

    it("executionPhase が highlight でないとき null", () => {
      setMockExecutionState({ executionPhase: "run" });
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.ballHighlightPosition).toBeNull();
    });

    it("highlight フェーズで creation.ballPosition がある場合それを返す", () => {
      setMockExecutionState({ executionPhase: "highlight" });
      setMockCreationState(
        createMockCreationState({ ballPosition: { x: 7, z: 8 } }),
      );

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.ballHighlightPosition).toEqual({ x: 7, z: 8 });
    });

    it("highlight フェーズで executingBallPosition がある場合それを返す", () => {
      setMockExecutionState({
        executionPhase: "highlight",
        executingBallPosition: { x: 3, z: 4 },
      });

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.ballHighlightPosition).toEqual({ x: 3, z: 4 });
    });

    it("highlight フェーズでどちらもないとき null", () => {
      setMockExecutionState({ executionPhase: "highlight" });

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.ballHighlightPosition).toBeNull();
    });
  });

  // ==========================================================================
  // tacticsForCurrentFormation
  // ==========================================================================
  describe("tacticsForCurrentFormation", () => {
    it("tactics が undefined のとき空配列", () => {
      const params = createDefaultParams({ tactics: undefined });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.tacticsForCurrentFormation).toEqual([]);
    });

    it("currentFormation が undefined のとき空配列", () => {
      const params = createDefaultParams({ currentFormation: undefined });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.tacticsForCurrentFormation).toEqual([]);
    });

    it("フォーメーション名に一致する戦術のみフィルタする", () => {
      const matching = createTestTactic({ id: "t-1", formationName: "4-3-3" });
      const nonMatching = createTestTactic({
        id: "t-2",
        formationName: "4-4-2",
      });

      const params = createDefaultParams({
        tactics: [matching, nonMatching],
        currentFormation: createTestFormation("4-3-3"),
      });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.tacticsForCurrentFormation).toEqual([matching]);
    });
  });

  // ==========================================================================
  // hasCustomTactics
  // ==========================================================================
  describe("hasCustomTactics", () => {
    it("カスタム戦術がある場合 true", () => {
      const custom = createTestTactic({ isCustom: true });
      const params = createDefaultParams({ tactics: [custom] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.hasCustomTactics).toBe(true);
    });

    it("カスタム戦術がない場合 false", () => {
      const defaultT = createTestTactic({ isCustom: false });
      const params = createDefaultParams({ tactics: [defaultT] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.hasCustomTactics).toBe(false);
    });

    it("tactics が空配列の場合 false", () => {
      const params = createDefaultParams({ tactics: [] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      expect(result.current.hasCustomTactics).toBe(false);
    });
  });

  // ==========================================================================
  // clearManualPositions
  // ==========================================================================
  describe("clearManualPositions", () => {
    it("manualPlayerPositions を空にリセットする", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 5, z: 5 });
      });
      expect(result.current.manualPlayerPositions).toEqual({
        0: { x: 5, z: 5 },
      });

      act(() => {
        result.current.clearManualPositions();
      });
      expect(result.current.manualPlayerPositions).toEqual({});
    });
  });

  // ==========================================================================
  // ballPass state setters
  // ==========================================================================
  describe("ballPass ステート setter", () => {
    it("setBallPassCreationMode で ballPassCreationMode を切り替える", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      act(() => {
        result.current.setBallPassCreationMode(true);
      });
      expect(result.current.ballPassCreationMode).toBe(true);
    });

    it("setBallPassTrajectoryType で trajectoryType を切り替える", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      act(() => {
        result.current.setBallPassTrajectoryType("high");
      });
      expect(result.current.ballPassTrajectoryType).toBe("high");
    });
  });
});
