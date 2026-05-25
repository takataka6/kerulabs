/**
 * @module useTacticsOrchestration 実行制御テスト
 * @description 戦術実行・ドラッグ操作・ウィザードステップ・ステップ管理の単体テスト
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
  mockExecuteTactic,
  mockResetTactic,
  mockSetPlayerTarget,
  mockSetSetPosition,
  mockSetWizardStep,
  mockSwitchToStep,
  mockAddStep,
  mockResetCurrentStep,
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
  mockGetPreviewArrows,
  mockGetPreviewBallPasses,
  mockGetStepStartPositions,
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
    reset: mockResetTactic,
    isExecuting: mockIsExecuting,
    activeTacticId: mockActiveTacticId,
    executionPhase: mockExecutionPhase,
    executingBallPosition: mockExecutingBallPosition,
    playerPositions: mockPlayerPositions,
    arrows: mockArrows,
    ballTrajectories: mockBallTrajectories,
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

describe("useTacticsOrchestration — 実行制御・操作", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  // ==========================================================================
  // triggerTactic
  // ==========================================================================
  describe("triggerTactic", () => {
    it("isExecuting が true のとき何もしない", () => {
      setMockExecutionState({ isExecuting: true });
      const tactic = createTestTactic({ id: "t-1" });
      const params = createDefaultParams({ tactics: [tactic] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.triggerTactic("t-1");
      });
      expect(mockExecuteTactic).not.toHaveBeenCalled();
    });

    it("currentFormation が undefined のとき何もしない", () => {
      const tactic = createTestTactic({ id: "t-1" });
      const params = createDefaultParams({
        currentFormation: undefined,
        tactics: [tactic],
      });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.triggerTactic("t-1");
      });
      expect(mockExecuteTactic).not.toHaveBeenCalled();
    });

    it("指定IDの戦術が見つからないとき何もしない", () => {
      const params = createDefaultParams({ tactics: [] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.triggerTactic("nonexistent");
      });
      expect(mockExecuteTactic).not.toHaveBeenCalled();
    });

    it("正常時: executeTactic を呼ぶ", () => {
      const tactic = createTestTactic({ id: "t-1" });
      const formation = createTestFormation();
      const params = createDefaultParams({
        tactics: [tactic],
        currentFormation: formation,
      });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.triggerTactic("t-1");
      });
      expect(mockExecuteTactic).toHaveBeenCalledWith(tactic, formation);
    });
  });

  // ==========================================================================
  // handlePlayerDragEnd
  // ==========================================================================
  describe("handlePlayerDragEnd", () => {
    it("manualPlayerPositions を更新し pushCurrentSnapshot を呼ぶ", () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 5, z: 10 });
      });
      expect(result.current.manualPlayerPositions).toEqual({
        0: { x: 5, z: 10 },
      });
      expect(params.pushCurrentSnapshot).toHaveBeenCalled();
    });

    it("creation 中の setPosition ステップでは setSetPosition を呼ぶ", () => {
      setMockCreationState(
        createMockCreationState({ wizardStep: "setPosition" }),
      );

      const formation = createTestFormation();
      const params = createDefaultParams({ currentFormation: formation });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });

      // GK is index 0, role "GK"
      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 2, z: 3 });
      });
      expect(mockSetSetPosition).toHaveBeenCalledWith("GK", 2, 3);
    });

    it("creation 中の editing ステップでは setPlayerTarget を呼ぶ", () => {
      setMockCreationState(createMockCreationState({ wizardStep: "editing" }));

      const formation = createTestFormation();
      const params = createDefaultParams({ currentFormation: formation });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });

      // CB1 is index 1, role "CB1", category "df"
      act(() => {
        result.current.handlePlayerDragEnd(1, { x: 4, z: 5 });
      });
      // df → POSITION_HEX_COLORS.df = "#3b82f6"
      expect(mockSetPlayerTarget).toHaveBeenCalledWith("CB1", 4, 5, "#3b82f6");
    });
  });

  // ==========================================================================
  // handleWizardStepChange
  // ==========================================================================
  describe("handleWizardStepChange", () => {
    it("setWizardStep を呼び ballPass 関連をリセットする", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      act(() => {
        result.current.handleWizardStepChange("ballPosition");
      });
      expect(mockSetWizardStep).toHaveBeenCalledWith("ballPosition");
      expect(result.current.ballPassCreationMode).toBe(false);
    });

    it("前のステップが setPosition のとき manualPositions をリセット", () => {
      setMockCreationState(
        createMockCreationState({ wizardStep: "setPosition" }),
      );

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );

      // Set some manual positions first
      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 1, z: 2 });
      });
      expect(result.current.manualPlayerPositions).toEqual({
        0: { x: 1, z: 2 },
      });

      // Change wizard step from setPosition → editing should clear positions
      act(() => {
        result.current.handleWizardStepChange("editing");
      });
      expect(result.current.manualPlayerPositions).toEqual({});
    });
  });

  // ==========================================================================
  // handleSwitchStep / handleAddStep / handleResetStep / handleResetPreview
  // ==========================================================================
  describe("ステップ管理ハンドラー", () => {
    it("handleSwitchStep: switchToStep + resetTactic + manualPositions クリア", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 1, z: 1 });
      });

      act(() => {
        result.current.handleSwitchStep(2);
      });
      expect(mockSwitchToStep).toHaveBeenCalledWith(2);
      expect(mockResetTactic).toHaveBeenCalled();
      expect(result.current.manualPlayerPositions).toEqual({});
    });

    it("handleAddStep: addStep + resetTactic + manualPositions クリア", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 1, z: 1 });
      });

      act(() => {
        result.current.handleAddStep();
      });
      expect(mockAddStep).toHaveBeenCalled();
      expect(mockResetTactic).toHaveBeenCalled();
      expect(result.current.manualPlayerPositions).toEqual({});
    });

    it("handleResetStep: resetCurrentStep + manualPositions クリア", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 1, z: 1 });
      });

      act(() => {
        result.current.handleResetStep();
      });
      expect(mockResetCurrentStep).toHaveBeenCalled();
      expect(result.current.manualPlayerPositions).toEqual({});
    });

    it("handleResetPreview: resetTactic + manualPositions クリア", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.handlePlayerDragEnd(0, { x: 1, z: 1 });
      });

      act(() => {
        result.current.handleResetPreview();
      });
      expect(mockResetTactic).toHaveBeenCalled();
      expect(result.current.manualPlayerPositions).toEqual({});
    });
  });
});
