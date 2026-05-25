/**
 * @module useTacticsOrchestration テストヘルパー
 * @description useTacticsOrchestration テストスイート共通のモック変数・ヘルパー関数・テストデータファクトリ。
 * vi.mock() は各テストファイルで直接呼び出すこと（Vitest のホイスト制約のため）。
 */
import { vi } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Formation, type FormationPosition } from "@domain/entities/Formation";
import { Tactic } from "@domain/entities/Tactic";
import { Phase } from "@domain/value-objects/Phase";
import { Position } from "@domain/value-objects/Position";
import { Movement } from "@domain/entities/Movement";
import { FormationId } from "@domain/value-objects/FormationId";
import { TacticId } from "@domain/value-objects/TacticId";
import type { TranslationKey } from "@shared/i18n/translations";
import { useTacticsOrchestration } from "../useTacticsOrchestration";

// ── Mock 変数（vi.mock のファクトリから参照される） ──

export const mockFileService = {
  downloadJson: vi.fn(),
  openFilePicker: vi.fn(),
};

export const mockConfirm = vi.fn().mockResolvedValue(true);

export const mockTacticShareExport = vi.fn();
export const mockTacticShareImport = vi.fn();

export const mockStartCreation = vi.fn();
export const mockCancelCreation = vi.fn();
export const mockBuildTactic = vi.fn();
export const mockSetPlayerTarget = vi.fn();
export const mockSetSetPosition = vi.fn();
export const mockSetWizardStep = vi.fn();
export const mockSwitchToStep = vi.fn();
export const mockAddStep = vi.fn();
export const mockResetCurrentStep = vi.fn();
export const mockGetPreviewArrows = vi.fn().mockReturnValue([]);
export const mockGetPreviewBallPasses = vi.fn().mockReturnValue([]);
export const mockGetStepStartPositions = vi.fn().mockReturnValue({});

export let mockCreationState: ReturnType<
  typeof import("../useTacticCreation").useTacticCreation
>["creation"] = null;

export function setMockCreationState(state: typeof mockCreationState): void {
  mockCreationState = state;
}

export const mockExecuteTactic = vi.fn();
export const mockResetTactic = vi.fn();
export let mockIsExecuting = false;
export let mockActiveTacticId: string | null = null;
export let mockExecutionPhase: string | null = null;
export let mockExecutingBallPosition: { x: number; z: number } | null = null;
export let mockPlayerPositions: Record<number, { x: number; z: number }> = {};
export let mockArrows: Array<{
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
}> = [];
export let mockBallTrajectories: Array<{
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
  trajectoryType?: string;
}> = [];

export function setMockExecutionState(state: {
  isExecuting?: boolean;
  activeTacticId?: string | null;
  executionPhase?: string | null;
  executingBallPosition?: { x: number; z: number } | null;
  playerPositions?: Record<number, { x: number; z: number }>;
  arrows?: typeof mockArrows;
  ballTrajectories?: typeof mockBallTrajectories;
}): void {
  if (state.isExecuting !== undefined) mockIsExecuting = state.isExecuting;
  if (state.activeTacticId !== undefined)
    mockActiveTacticId = state.activeTacticId;
  if (state.executionPhase !== undefined)
    mockExecutionPhase = state.executionPhase;
  if (state.executingBallPosition !== undefined)
    mockExecutingBallPosition = state.executingBallPosition;
  if (state.playerPositions !== undefined)
    mockPlayerPositions = state.playerPositions;
  if (state.arrows !== undefined) mockArrows = state.arrows;
  if (state.ballTrajectories !== undefined)
    mockBallTrajectories = state.ballTrajectories;
}

// ── テストデータファクトリ ──

export function createTestFormationPositions(): FormationPosition[] {
  const roles = [
    "GK",
    "CB1",
    "CB2",
    "SB1",
    "SB2",
    "CM1",
    "CM2",
    "CM3",
    "RW",
    "LW",
    "ST",
  ];
  const categories: Array<"gk" | "df" | "mf" | "fw"> = [
    "gk",
    "df",
    "df",
    "df",
    "df",
    "mf",
    "mf",
    "mf",
    "fw",
    "fw",
    "fw",
  ];
  return roles.map((role, i) => ({
    pos: role,
    position: Position.create(i * 0.5, i * 0.3),
    category: categories[i],
  }));
}

export function createTestFormation(name = "4-3-3"): Formation {
  return Formation.createDefault(
    new FormationId("f-1"),
    name,
    "standard",
    createTestFormationPositions(),
  );
}

export function createTestTactic(overrides?: {
  id?: string;
  name?: Record<string, string>;
  isCustom?: boolean;
  formationName?: string;
}): Tactic {
  const formationName = overrides?.formationName ?? "4-3-3";
  const movements = new Map<string, Movement[]>();
  movements.set(formationName, [Movement.create("CB1", 1, 2, 0, "#3b82f6")]);

  if (overrides?.isCustom === false) {
    return Tactic.createDefault(
      new TacticId(overrides?.id ?? "tac-default-1"),
      {
        name: overrides?.name ?? { ja: "Default", en: "Default" },
        icon: "⚽",
        phase: Phase.fromString("attack"),
        movements,
      },
    );
  }

  const tactic = Tactic.create({
    name: overrides?.name ?? { ja: "Custom", en: "Custom" },
    icon: "⚽",
    phase: Phase.fromString("attack"),
    movements,
  });

  if (overrides?.id) {
    Object.defineProperty(tactic, "id", { value: new TacticId(overrides.id) });
  }

  return tactic;
}

export function createDefaultParams(
  overrides?: Partial<Parameters<typeof useTacticsOrchestration>[0]>,
) {
  return {
    currentFormation: createTestFormation(),
    selectedTeam: undefined,
    tactics: [] as Tactic[],
    playMode: "field" as const,
    selectedPhase: "attack" as const,
    selectedSetPlayType: "set_piece" as const,
    ballHook: {
      ballPosition: null,
      setBallPosition: vi.fn(),
      ballPlacementMode: false,
      setBallPlacementMode: vi.fn(),
      handleBallPlace: vi.fn(),
      handleBallDrag: vi.fn(),
      handleBallRemove: vi.fn(),
      toggleBallPlacement: vi.fn(),
    },
    connLines: {
      connectionLines: [],
      setConnectionLines: vi.fn(),
      lineDrawingMode: false,
      setLineDrawingMode: vi.fn(),
      lineFromPlayerIndex: null,
      pendingLineEndPos: null,
      setPendingLineEndPos: vi.fn(),
      lineColor: "#ffffff",
      setLineColor: vi.fn(),
      handlePlayerClickForLine: vi.fn(),
      toggleLineDrawing: vi.fn(),
      handleConnectionLineRemove: vi.fn(),
      clearConnectionLines: vi.fn(),
      resetLineDrawingState: vi.fn(),
    },
    opponentsHook: {
      setOpponentPlacementMode: vi.fn(),
      opponents: [],
    },
    playerView: {
      playerViewEnabled: false,
      setPlayerViewEnabled: vi.fn(),
      selectedPlayerIndex: null,
      setSelectedPlayerIndex: vi.fn(),
      selectedOpponentViewId: null,
      setSelectedOpponentViewId: vi.fn(),
      handlePlayerClickForView: vi.fn(),
      handleOpponentViewClick: vi.fn(),
      exitPlayerView: vi.fn(),
      togglePlayerView: vi.fn(),
      yawNudgeRef: { current: 0 },
      isFirstPerson: false,
      togglePerspective: vi.fn(),
      rotateLeft: vi.fn(),
      rotateRight: vi.fn(),
    },
    pushCurrentSnapshot: vi.fn(),
    showToast: vi.fn(),
    t: vi.fn((key: string) => key) as unknown as (
      key: TranslationKey,
    ) => string,
    ...overrides,
  };
}

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

/** 共通の creationState テンプレート */
export function createMockCreationState(
  overrides?: Partial<NonNullable<typeof mockCreationState>>,
): NonNullable<typeof mockCreationState> {
  return {
    nameJa: "",
    nameEn: "",
    icon: "⚽",
    gamePhase: "attack",
    formationName: "4-3-3",
    currentStepIndex: 0,
    steps: [{ id: 1, movements: new Map(), ballPasses: [], duration: 1000 }],
    timelineOpen: false,
    movementDelays: {},
    wizardStep: "editing",
    ballPosition: null,
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

/**
 * 各テストファイルの beforeEach で呼ぶ共通リセット処理
 */
export function resetAllMocks(): void {
  vi.clearAllMocks();
  mockConfirm.mockResolvedValue(true);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: () => void) => {
      cb();
      return 0;
    }),
  );

  // Reset mutable mock state
  mockCreationState = null;
  mockIsExecuting = false;
  mockActiveTacticId = null;
  mockExecutionPhase = null;
  mockExecutingBallPosition = null;
  mockPlayerPositions = {};
  mockArrows = [];
  mockBallTrajectories = [];

  // Reset mock implementations
  mockGetPreviewArrows.mockReturnValue([]);
  mockGetPreviewBallPasses.mockReturnValue([]);
  mockGetStepStartPositions.mockReturnValue({});
  mockBuildTactic.mockImplementation(() => createTestTactic());
  mockTacticShareExport.mockReturnValue('{"tactics":[]}');
  mockTacticShareImport.mockReturnValue([]);
}
