/**
 * @module TacticsViewerPage
 * @description タクティクスビューアーのメインページコンポーネント。3Dフィールド・フォーメーション・戦術編集・実行を統合する。
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  useFormations,
  useTactics,
  useAllTactics,
  useTeams,
} from "../hooks/queries";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { useToast } from "@presentation/components/ui";
import type { OrchestratorActions } from "@presentation/components/tactics-viewer";

// 抽出済みフック
import {
  useTacticsOrchestration,
  useFlowchartGenerator,
} from "../hooks/tactic";
import {
  useFormationManagement,
  useOpponents,
  useConnectionLines,
  useBallPlacement,
} from "../hooks/field";
import {
  useTeamManagement,
  useDisplayData,
  useCardManagement,
  useManagerEditor,
} from "../hooks/team";
import {
  useUIVisibility,
  usePlayModePhase,
  usePlayerView,
  useBackgroundSettings,
  useMultiSelect,
} from "../hooks/ui";
import { useSnapshotManagement } from "../hooks/history";
import {
  useCanvasMemoization,
  useCanvasCallbacks,
  useBridgeCallbacks,
} from "../hooks/canvas";
import { useLineupAnimation } from "@presentation/components/lineup-animation";
import { useSketchOverlay } from "@presentation/hooks/sketch";

// Context
import {
  TacticsViewerProvider,
  type TacticsViewerContextType,
} from "@presentation/contexts/TacticsViewerContext";

// 抽出済みコンポーネント
import {
  LoadingScreen,
  TeamSelectionScreen,
  TacticsHeader,
  TacticsMainContent,
  TacticsSidebarSection,
  TacticsModals,
} from "../components/tactics-viewer";
import { TacticsRightSidebar } from "../components/tactics-viewer/TacticsRightSidebar";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

/**
 * 戦術ビューアーページ（オーケストレーター）。
 *
 * 各カスタムフックを呼び出し、サブコンポーネントへ props を渡す薄い組み立て層。
 * ビジネスロジック・UI描画は抽出先のフック / コンポーネントに委譲する。
 */
export function TacticsViewerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, tDynamic, language } = useLanguage();
  const { showToast } = useToast();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: formations, isLoading: formationsLoading } = useFormations();

  // ── UI Visibility ──
  const ui = useUIVisibility();

  // ── Multi-select ──
  const multiSelect = useMultiSelect();

  // ── Self-contained hooks ──
  const bgSettings = useBackgroundSettings();
  const managerEditor = useManagerEditor();
  const cardMgmt = useCardManagement();
  const lineupAnimation = useLineupAnimation();
  const sketch = useSketchOverlay();

  // ── Snapshot management (undo/redo) ──
  // ref ベースなので pushCurrentSnapshot / resetHistory はフック呼び出し直後から利用可能
  const {
    pushCurrentSnapshot,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    resetHistory,
    syncSources,
    syncSetters,
  } = useSnapshotManagement();

  // ── Orchestrator actions ref ──
  const actionsRef = useRef<OrchestratorActions>({
    resetTactic: () => {},
    clearManualPositions: () => {},
    isExecuting: false,
    hasCreation: false,
    cancelCreation: () => {},
    resetOpponents: () => {},
    resetFormationId: () => {},
  });

  // ── Forward-reference refs ──
  const opponentsRef = useRef<{
    setOpponentPlacementMode: (v: boolean) => void;
  }>({ setOpponentPlacementMode: () => {} });
  const ballRef = useRef<{ setBallPlacementMode: (v: boolean) => void }>({
    setBallPlacementMode: () => {},
  });

  // ── Mode hooks ──
  const playerView = usePlayerView(() => ui.setIsDraggingObject(false));
  const connLines = useConnectionLines(pushCurrentSnapshot, () => {
    opponentsRef.current.setOpponentPlacementMode(false);
    ballRef.current.setBallPlacementMode(false);
    playerView.setPlayerViewEnabled(false);
    playerView.setSelectedPlayerIndex(null);
    playerView.setSelectedOpponentViewId(null);
  });
  const ballHook = useBallPlacement(pushCurrentSnapshot, () => {
    opponentsRef.current.setOpponentPlacementMode(false);
    connLines.resetLineDrawingState();
  });

  // ── Play Mode & Phase ──
  const playModePhase = usePlayModePhase({
    actionsRef,
    setSquadPanelOpen: ui.setSquadPanelOpen,
  });

  // ── Team Management ──
  const teamMgmt = useTeamManagement({
    teams,
    queryClient,
    showToast,
    cardMgmt,
    resetHistory,
    pushCurrentSnapshot,
    t,
  });

  // ── Formation Management ──
  const formationMgmt = useFormationManagement({
    formations,
    gameMode: playModePhase.gameMode,
    selectedTeam: teamMgmt.selectedTeam,
    actionsRef,
    resetHistory,
    pushCurrentSnapshot,
  });

  // ── Opponents ──
  const opponentsHook = useOpponents(
    teams,
    formationMgmt.gameModeFormations,
    playModePhase.pitchConfig.maxOpponents,
    pushCurrentSnapshot,
    () => {
      ballHook.setBallPlacementMode(false);
      connLines.resetLineDrawingState();
    },
    showToast,
    t,
  );

  // ── Tactics data ──
  const { data: tactics, isLoading: tacticsLoading } = useTactics(
    playModePhase.activePhaseForTactics,
  );
  const { data: allTactics } = useAllTactics();

  // ── Tactics Orchestration (core) ──
  const tOrch = useTacticsOrchestration({
    currentFormation: formationMgmt.currentFormation,
    selectedTeam: teamMgmt.selectedTeam,
    tactics,
    allTactics,
    playMode: playModePhase.playMode,
    selectedPhase: playModePhase.selectedPhase,
    selectedSetPlayType: playModePhase.selectedSetPlayType,
    ballHook,
    connLines,
    opponentsHook,
    playerView,
    pushCurrentSnapshot,
    showToast,
    t,
  });

  // ── Update refs (commit phase) ──
  useEffect(() => {
    actionsRef.current = {
      resetTactic: tOrch.resetTactic,
      clearManualPositions: tOrch.clearManualPositions,
      isExecuting: tOrch.isExecuting,
      hasCreation: !!tOrch.tacticCreation.creation,
      cancelCreation: tOrch.tacticCreation.cancelCreation,
      resetOpponents: () => opponentsHook.setOpponents([]),
      resetFormationId: () => formationMgmt.setCurrentFormationId(null),
    };
    opponentsRef.current = opponentsHook;
    ballRef.current = ballHook;
  });

  // ── Sync snapshot sources & setters (every render) ──
  syncSources({
    manualPlayerPositions: tOrch.manualPlayerPositions,
    opponents: opponentsHook.opponents,
    ballPosition: ballHook.ballPosition,
    connectionLines: connLines.connectionLines,
    playerCards: cardMgmt.playerCards,
    managerCard: cardMgmt.managerCard,
  });
  syncSetters(
    {
      setManualPlayerPositions: tOrch.setManualPlayerPositions,
      setOpponents: opponentsHook.setOpponents,
      setBallPosition: ballHook.setBallPosition,
      setConnectionLines: connLines.setConnectionLines,
      setPlayerCards: cardMgmt.setPlayerCards,
      setManagerCard: cardMgmt.setManagerCard,
    },
    tOrch.undoRedoEnabled,
  );

  // ── Display data ──
  const displayData = useDisplayData({
    selectedTeam: teamMgmt.selectedTeam,
    currentFormation: formationMgmt.currentFormation,
    customSquad: teamMgmt.customSquad,
    showSquadBuilder: ui.showSquadBuilder,
    formationData: formationMgmt.formationData,
    managerInput: managerEditor.managerInput,
  });

  // ── Flowchart ──
  const { generateFlowchart } = useFlowchartGenerator({
    activeTactic: tOrch.activeTactic,
    currentFormation: formationMgmt.currentFormation,
    t,
    tDynamic,
    language,
  });

  // ── Bridge callbacks ──
  const {
    handlePlayerClick,
    handleOpponentClick,
    handleSquadCardCycle,
    handleSaveManager,
    handleCycleManagerCard,
  } = useBridgeCallbacks({
    connLines,
    playerView,
    multiSelect,
    cardMgmt,
    teamMgmt,
    managerEditor,
    pushCurrentSnapshot,
  });

  // ── Canvas memoized computed values ──
  const canvasMemo = useCanvasMemoization({
    showCards: cardMgmt.showCards,
    captureMode: ui.captureMode,
    playerCards: cardMgmt.playerCards,
    lineFromPlayerIndex: connLines.lineFromPlayerIndex,
    selectedPlayerIndex: playerView.selectedPlayerIndex,
    playerViewEnabled: playerView.playerViewEnabled,
    selectedOpponentViewId: playerView.selectedOpponentViewId,
    isExecuting: tOrch.isExecuting,
    opponentPlacementMode: opponentsHook.opponentPlacementMode,
    ballPlacementMode: ballHook.ballPlacementMode,
    lineDrawingMode: connLines.lineDrawingMode,
    creation: tOrch.tacticCreation.creation,
    ballPassCreationMode: tOrch.ballPassCreationMode,
    ballPassStartPos: tOrch.ballPassStartPos,
    pendingLineEndPos: connLines.pendingLineEndPos,
    lineColor: connLines.lineColor,
  });

  // ── Canvas stable callbacks ──
  const canvasCallbacks = useCanvasCallbacks({
    tOrch,
    ballHook,
    connLines,
    opponentsHook,
    ui,
    pushCurrentSnapshot,
  });

  // ── Convenience aliases ──
  const { selectedTeam } = teamMgmt;
  const { currentFormation } = formationMgmt;

  // ── Loading screens ──
  if (teamsLoading || formationsLoading) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  if (
    teamMgmt.showTeamSelection ||
    (!selectedTeam && !teamMgmt.selectedTeamId)
  ) {
    return (
      <TeamSelectionScreen
        teams={teams}
        language={language}
        showTeamCreator={teamMgmt.showTeamCreator}
        showBulkTeamImport={teamMgmt.showBulkTeamImport}
        onSelectTeam={(teamId) => {
          teamMgmt.setSelectedTeamId(teamId);
          teamMgmt.setShowTeamSelection(false);
        }}
        onDeleteTeam={teamMgmt.handleDeleteTeam}
        onNavigateHome={() => navigate("/")}
        onShowTeamCreator={() => teamMgmt.setShowTeamCreator(true)}
        onCloseTeamCreator={() => teamMgmt.setShowTeamCreator(false)}
        onShowBulkTeamImport={() => teamMgmt.setShowBulkTeamImport(true)}
        onCloseBulkTeamImport={() => teamMgmt.setShowBulkTeamImport(false)}
        onCreateTeam={teamMgmt.handleCreateTeam}
        onBulkImport={teamMgmt.handleBulkTeamImport}
        editingTeam={teamMgmt.editingTeam}
        onEditTeam={(teamId, event) => {
          event.stopPropagation();
          teamMgmt.setEditingTeamId(teamId);
        }}
        onCloseEditTeam={() => teamMgmt.setEditingTeamId(null)}
        onUpdateTeam={async (team) => {
          await teamMgmt.handleUpdateTeam(team);
          teamMgmt.setEditingTeamId(null);
        }}
        t={t}
      />
    );
  }

  if (teamMgmt.selectedTeamId && !selectedTeam) {
    return <LoadingScreen message={t("common.updating")} />;
  }

  if (!currentFormation || !selectedTeam) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  // ── Context value ──
  // TacticsViewerProvider 内部で各サブコンテキストごとに useMemo で安定化されるため、
  // ここでのメモ化は不要（early return の後にフックを置けない制約もある）
  const contextValue: TacticsViewerContextType = {
    ui,
    playModePhase,
    tOrch,
    formationMgmt,
    opponentsHook,
    ballHook,
    connLines,
    playerView,
    multiSelect,
    bgSettings,
    cardMgmt,
    teamMgmt,
    managerEditor,
    lineupAnimation,
    sketch,
    canvasMemo,
    canvasCallbacks,
    displayData,
    selectedTeam,
    currentFormation,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handlePlayerClick,
    handleOpponentClick,
    handleSquadCardCycle,
    handleSaveManager,
    handleCycleManagerCard,
    generateFlowchart,
    teams,
    tacticsLoading,
  };

  // ── Main Screen ──
  return (
    <TacticsViewerProvider value={contextValue}>
      <div className="w-full h-screen bg-slate-900 flex flex-col overflow-hidden">
        <ErrorBoundary inline>
          <TacticsHeader />
        </ErrorBoundary>

        <div className="flex-1 flex min-h-0 relative">
          <ErrorBoundary inline>
            <TacticsSidebarSection />
          </ErrorBoundary>
          <ErrorBoundary inline>
            <TacticsMainContent />
          </ErrorBoundary>
          <ErrorBoundary inline>
            <TacticsRightSidebar />
          </ErrorBoundary>
        </div>

        <ErrorBoundary inline>
          <TacticsModals />
        </ErrorBoundary>
      </div>
    </TacticsViewerProvider>
  );
}
