/**
 * @module useTacticsOrchestration CRUD テスト
 * @description 戦術の作成・キャンセル・保存・プレビュー・エクスポート・インポート操作の単体テスト
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
  mockStartCreation,
  mockCancelCreation,
  mockBuildTactic,
  mockResetTactic,
  mockConfirm,
  mockTacticShareExport,
  mockTacticShareImport,
  mockFileService,
  mockExecuteTactic,
  mockCreationState,
  mockIsExecuting,
  mockActiveTacticId,
  mockExecutionPhase,
  mockExecutingBallPosition,
  mockPlayerPositions,
  mockArrows,
  mockBallTrajectories,
  mockGetPreviewArrows,
  mockGetPreviewBallPasses,
  mockGetStepStartPositions,
  mockSetPlayerTarget,
  mockSetSetPosition,
  mockSetWizardStep,
  mockSwitchToStep,
  mockAddStep,
  mockResetCurrentStep,
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

describe("useTacticsOrchestration — CRUD操作", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  // ==========================================================================
  // 初期状態
  // ==========================================================================
  describe("初期状態", () => {
    it("manualPlayerPositions が空オブジェクト", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.manualPlayerPositions).toEqual({});
    });

    it("ballPassCreationMode が false", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.ballPassCreationMode).toBe(false);
    });

    it("ballPassStartPos / ballPassPendingEndPos が null", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.ballPassStartPos).toBeNull();
      expect(result.current.ballPassPendingEndPos).toBeNull();
    });

    it("ballPassTrajectoryType のデフォルトが 'low'", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.ballPassTrajectoryType).toBe("low");
    });

    it("isExecuting が false", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.isExecuting).toBe(false);
    });

    it("activeTacticId が null", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.activeTacticId).toBeNull();
    });

    it("undoRedoEnabled: creation が null のとき true", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      expect(result.current.undoRedoEnabled).toBe(true);
    });
  });

  // ==========================================================================
  // startTacticCreation
  // ==========================================================================
  describe("startTacticCreation", () => {
    it("currentFormation が undefined のとき何もしない", () => {
      const params = createDefaultParams({ currentFormation: undefined });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.startTacticCreation();
      });
      expect(mockStartCreation).not.toHaveBeenCalled();
    });

    it("field モードで selectedPhase を渡して startCreation を呼ぶ", () => {
      const params = createDefaultParams({
        playMode: "field",
        selectedPhase: "defense",
      });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.startTacticCreation();
      });
      expect(mockStartCreation).toHaveBeenCalledWith(
        "4-3-3",
        "defense",
        "4-3-3",
      );
    });

    it("setPlay モードで selectedSetPlayType を渡して startCreation を呼ぶ", () => {
      const params = createDefaultParams({
        playMode: "setPlay",
        selectedSetPlayType: "throw_in",
      });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.startTacticCreation();
      });
      expect(mockStartCreation).toHaveBeenCalledWith(
        "4-3-3",
        "throw_in",
        "4-3-3",
      );
    });

    it("開始時に各モードをリセットする", () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.startTacticCreation();
      });
      expect(
        params.opponentsHook.setOpponentPlacementMode,
      ).toHaveBeenCalledWith(false);
      expect(params.ballHook.setBallPlacementMode).toHaveBeenCalledWith(false);
      expect(params.connLines.resetLineDrawingState).toHaveBeenCalled();
      expect(params.playerView.setPlayerViewEnabled).toHaveBeenCalledWith(
        false,
      );
      expect(params.playerView.setSelectedPlayerIndex).toHaveBeenCalledWith(
        null,
      );
      expect(params.playerView.setSelectedOpponentViewId).toHaveBeenCalledWith(
        null,
      );
      expect(mockResetTactic).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // cancelTacticCreation
  // ==========================================================================
  describe("cancelTacticCreation", () => {
    it("creation が null のとき confirm を表示せず cancelCreation を呼ぶ", async () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      await act(async () => {
        await result.current.cancelTacticCreation();
      });
      expect(mockConfirm).not.toHaveBeenCalled();
      expect(mockCancelCreation).toHaveBeenCalled();
    });

    it("creation がある場合 confirm で確認する", async () => {
      setMockCreationState(createMockCreationState());

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      await act(async () => {
        await result.current.cancelTacticCreation();
      });
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ message: "tactics.creation.confirmCancel" }),
      );
      expect(mockCancelCreation).toHaveBeenCalled();
    });

    it("confirm をキャンセルしたら cancelCreation を呼ばない", async () => {
      mockConfirm.mockResolvedValueOnce(false);
      setMockCreationState(createMockCreationState());

      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      await act(async () => {
        await result.current.cancelTacticCreation();
      });
      expect(mockCancelCreation).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // handleSaveTactic
  // ==========================================================================
  describe("handleSaveTactic", () => {
    it("creation が null のとき何もしない", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleSaveTactic();
      });
      expect(mockBuildTactic).not.toHaveBeenCalled();
      expect(params.showToast).not.toHaveBeenCalled();
    });

    it("currentFormation が undefined のとき何もしない", async () => {
      setMockCreationState(
        createMockCreationState({
          steps: [
            {
              id: 1,
              movements: new Map([
                ["CB1", { targetX: 1, targetZ: 2, color: "#000" }],
              ]),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      );
      const params = createDefaultParams({ currentFormation: undefined });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleSaveTactic();
      });
      expect(mockBuildTactic).not.toHaveBeenCalled();
    });

    it("movements も ballPasses もないとき error トーストを表示", async () => {
      setMockCreationState(createMockCreationState());
      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleSaveTactic();
      });
      expect(params.showToast).toHaveBeenCalledWith(
        "tactics.creation.noMovements",
        "error",
      );
      expect(mockBuildTactic).not.toHaveBeenCalled();
    });

    it("成功時: buildTactic → mutateAsync → cancelCreation → success トースト", async () => {
      const builtTactic = createTestTactic({
        name: { ja: "Built", en: "Built" },
      });
      mockBuildTactic.mockReturnValue(builtTactic);

      setMockCreationState(
        createMockCreationState({
          nameJa: "Built",
          nameEn: "Built",
          steps: [
            {
              id: 1,
              movements: new Map([
                ["CB1", { targetX: 1, targetZ: 2, color: "#000" }],
              ]),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      );

      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleSaveTactic();
      });

      expect(mockBuildTactic).toHaveBeenCalled();
      expect(mockCancelCreation).toHaveBeenCalled();
      expect(mockResetTactic).toHaveBeenCalled();
      expect(params.showToast).toHaveBeenCalledWith(
        "tactics.creation.saved",
        "success",
      );
    });

    it("setPlay モードで名称未入力ならセットプレー種別ごとの既定名を補完する", async () => {
      const builtTactic = {
        name: { ja: "", en: "" },
        updateName(nextName: { ja: string; en: string }) {
          this.name = nextName;
        },
      };
      mockBuildTactic.mockReturnValue(builtTactic);

      setMockCreationState(
        createMockCreationState({
          gamePhase: "throw_in",
          steps: [
            {
              id: 1,
              movements: new Map([
                ["CB1", { targetX: 1, targetZ: 2, color: "#000" }],
              ]),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      );

      const params = createDefaultParams({
        playMode: "setPlay",
        selectedSetPlayType: "throw_in",
      });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSaveTactic();
      });

      expect(builtTactic.name.ja).toBe("スローイン1");
      expect(builtTactic.name.en).toBe("Throw In 1");
    });

    it("保存失敗時: handleError を呼ぶ", async () => {
      const { handleError } = await import("@shared/errors/handleError");
      mockBuildTactic.mockImplementation(() => {
        throw new Error("Build failed");
      });

      setMockCreationState(
        createMockCreationState({
          steps: [
            {
              id: 1,
              movements: new Map([
                ["CB1", { targetX: 1, targetZ: 2, color: "#000" }],
              ]),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      );

      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleSaveTactic();
      });
      expect(handleError).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // handlePreviewTactic
  // ==========================================================================
  describe("handlePreviewTactic", () => {
    it("creation が null のとき何もしない", () => {
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      act(() => {
        result.current.handlePreviewTactic();
      });
      expect(mockBuildTactic).not.toHaveBeenCalled();
      expect(mockExecuteTactic).not.toHaveBeenCalled();
    });

    it("currentFormation が undefined のとき何もしない", () => {
      setMockCreationState(
        createMockCreationState({
          steps: [
            {
              id: 1,
              movements: new Map([
                ["CB1", { targetX: 1, targetZ: 2, color: "#000" }],
              ]),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      );
      const params = createDefaultParams({ currentFormation: undefined });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.handlePreviewTactic();
      });
      expect(mockBuildTactic).not.toHaveBeenCalled();
    });

    it("コンテンツがない場合は何もしない", () => {
      setMockCreationState(createMockCreationState());
      const { result } = renderHook(
        () => useTacticsOrchestration(createDefaultParams()),
        { wrapper: createWrapper() },
      );
      act(() => {
        result.current.handlePreviewTactic();
      });
      expect(mockBuildTactic).not.toHaveBeenCalled();
    });

    it("コンテンツがある場合 buildTactic → executeTactic を呼ぶ", () => {
      const builtTactic = createTestTactic();
      mockBuildTactic.mockReturnValue(builtTactic);

      setMockCreationState(
        createMockCreationState({
          steps: [
            {
              id: 1,
              movements: new Map([
                ["CB1", { targetX: 1, targetZ: 2, color: "#000" }],
              ]),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      );

      const formation = createTestFormation();
      const params = createDefaultParams({ currentFormation: formation });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.handlePreviewTactic();
      });

      expect(mockResetTactic).toHaveBeenCalled();
      expect(mockBuildTactic).toHaveBeenCalledWith(formation);
      expect(mockExecuteTactic).toHaveBeenCalledWith(builtTactic, formation);
    });
  });

  // ==========================================================================
  // handleExportTactics
  // ==========================================================================
  describe("handleExportTactics", () => {
    it("カスタム戦術がない場合は何もしない", () => {
      const defaultTactic = createTestTactic({ isCustom: false });
      const params = createDefaultParams({ tactics: [defaultTactic] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.handleExportTactics();
      });
      expect(mockTacticShareExport).not.toHaveBeenCalled();
      expect(mockFileService.downloadJson).not.toHaveBeenCalled();
    });

    it("カスタム戦術がある場合 export → downloadJson を呼ぶ", () => {
      const customTactic = createTestTactic({ isCustom: true });
      mockTacticShareExport.mockReturnValue('{"version":1,"tactics":[]}');

      const params = createDefaultParams({ tactics: [customTactic] });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.handleExportTactics();
      });

      expect(mockTacticShareExport).toHaveBeenCalledWith([customTactic]);
      expect(mockFileService.downloadJson).toHaveBeenCalledWith(
        '{"version":1,"tactics":[]}',
        expect.stringMatching(/^tactics-\d{4}-\d{2}-\d{2}\.json$/),
      );
    });

    it("デフォルト戦術はエクスポート対象外", () => {
      const defaultTactic = createTestTactic({ isCustom: false });
      const customTactic = createTestTactic({ isCustom: true });
      const params = createDefaultParams({
        tactics: [defaultTactic, customTactic],
      });
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      act(() => {
        result.current.handleExportTactics();
      });
      expect(mockTacticShareExport).toHaveBeenCalledWith([customTactic]);
    });
  });

  // ==========================================================================
  // handleImportTactics
  // ==========================================================================
  describe("handleImportTactics", () => {
    it("成功時: openFilePicker → import → mutateAsync → success トースト", async () => {
      const imported = [createTestTactic()];
      mockFileService.openFilePicker.mockResolvedValue(
        '{"version":1,"tactics":[]}',
      );
      mockTacticShareImport.mockReturnValue(imported);

      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleImportTactics();
      });

      expect(mockFileService.openFilePicker).toHaveBeenCalledWith(".json");
      expect(mockTacticShareImport).toHaveBeenCalled();
      expect(params.showToast).toHaveBeenCalledWith(
        expect.stringContaining("tactics.importSuccess"),
        "success",
      );
    });

    it("インポート結果が空の場合 error トーストを表示", async () => {
      mockFileService.openFilePicker.mockResolvedValue("{}");
      mockTacticShareImport.mockReturnValue([]);

      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleImportTactics();
      });

      expect(params.showToast).toHaveBeenCalledWith(
        "tactics.importEmpty",
        "error",
      );
    });

    it("失敗時: handleError を呼ぶ", async () => {
      const { handleError } = await import("@shared/errors/handleError");
      mockFileService.openFilePicker.mockRejectedValue(new Error("cancelled"));

      const params = createDefaultParams();
      const { result } = renderHook(() => useTacticsOrchestration(params), {
        wrapper: createWrapper(),
      });
      await act(async () => {
        await result.current.handleImportTactics();
      });

      expect(handleError).toHaveBeenCalled();
    });
  });
});
