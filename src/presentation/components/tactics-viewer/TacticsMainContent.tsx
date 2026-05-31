/**
 * @module TacticsMainContent
 * @description メインコンテンツ領域（3Dキャンバス・右コントロール・スケッチ・アニメーション等）を統合するレイアウトコンポーネント。
 *
 * 使用するContext（全3つ）:
 * - TacticsUIContext: UI表示状態・Undo/Redo
 * - TacticsTeamContext: チーム・フォーメーション・表示データ
 * - TacticsExecutionContext: 戦術実行・フィールド操作・キャンバス
 */
import { lazy, Suspense, useEffect } from "react";
import { useTacticsUI } from "@presentation/contexts/TacticsUIContext";
import { useTacticsTeam } from "@presentation/contexts/TacticsTeamContext";
import { useTacticsExecution } from "@presentation/contexts/TacticsExecutionContext";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LineupAnimationOverlay } from "../lineup-animation";
import { RightControlsColumn } from "./RightControlsColumn";
import { FlowchartPanel } from "./FlowchartPanel";
import { SquadPanel } from "./SquadPanel";
import { SubstitutesPanel } from "./SubstitutesPanel";
import { PlayerViewHUD } from "./PlayerViewHUD";
import { ManagerDisplay } from "./ManagerDisplay";
import { TimelineEditor } from "./TimelineEditor";
import { ViewLockPanel } from "./ViewLockPanel";
import { SketchOverlay } from "./SketchOverlay";
import { SketchToolbar } from "./SketchToolbar";
import { BackgroundSettingsPanelContent } from "./right-controls/BackgroundSettingsPanelContent";
import { OpponentSquadSelectorPopup } from "./right-controls/OpponentSquadSelectorPopup";

const TacticsCanvas = lazy(() =>
  import("./TacticsCanvas").then(({ TacticsCanvas: Component }) => ({
    default: Component,
  })),
);

function CanvasLoader() {
  return (
    <div
      className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-300"
      role="status"
      aria-live="polite"
    >
      Loading tactics canvas...
    </div>
  );
}

export function TacticsMainContent() {
  const { ui, canUndo, canRedo, handleUndo, handleRedo } = useTacticsUI();
  const {
    selectedTeam,
    currentFormation,
    teams,
    teamMgmt,
    formationMgmt,
    displayData,
    cardMgmt,
    managerEditor,
    handleSquadCardCycle,
    handleSaveManager,
    handleCycleManagerCard,
  } = useTacticsTeam();
  const {
    playModePhase,
    tOrch,
    opponentsHook,
    ballHook,
    connLines,
    playerView,
    multiSelect,
    bgSettings,
    lineupAnimation,
    sketch,
    canvasMemo,
    canvasCallbacks,
    handlePlayerClick,
    handleOpponentClick,
    generateFlowchart,
  } = useTacticsExecution();
  const { t, tDynamic, language } = useLanguage();

  const { playersData, colorsData, lineupPlayers, lineupTeamInfo } =
    displayData;

  useEffect(() => {
    if (!sketch.sketchMode) return;

    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const clickedButton = target.closest("button");
      if (!clickedButton) return;
      if (
        clickedButton.closest('[data-sketch-toolbar="true"]') ||
        clickedButton.closest('[data-sketch-toggle="true"]')
      ) {
        return;
      }

      sketch.setSketchMode(false);
    };

    document.addEventListener("click", handleButtonClick, true);

    return () => {
      document.removeEventListener("click", handleButtonClick, true);
    };
  }, [sketch]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 outline-none"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.035) 7%, rgba(15,23,42,0) 14%), radial-gradient(120% 85% at 50% 46%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 28%, rgba(15,23,42,0) 54%), radial-gradient(120% 100% at 50% 100%, rgba(2,6,23,0.26) 0%, rgba(2,6,23,0.12) 34%, rgba(2,6,23,0) 62%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-12 sm:h-14"
        style={{
          background:
            "linear-gradient(180deg, rgba(148,163,184,0.05) 0%, rgba(148,163,184,0.016) 38%, rgba(148,163,184,0) 100%)",
        }}
      />

      {/* スカッドパネル */}
      <SquadPanel
        customSquad={teamMgmt.customSquad}
        currentFormation={currentFormation}
        playerCards={cardMgmt.playerCards}
        squadPanelOpen={ui.squadPanelOpen}
        captureMode={ui.captureMode}
        showSquadBuilder={ui.showSquadBuilder}
        playerViewEnabled={playerView.playerViewEnabled}
        selectedPlayerIndex={playerView.selectedPlayerIndex}
        selectedOpponentViewId={playerView.selectedOpponentViewId}
        onToggleSquadPanel={() => ui.setSquadPanelOpen((prev) => !prev)}
        onCycleCard={handleSquadCardCycle}
        onSubstitute={teamMgmt.handleSubstitution}
        onSwapPositions={teamMgmt.handleSwapPositions}
        t={t}
      />

      {/* サブメンバー */}
      <SubstitutesPanel
        customSquad={teamMgmt.customSquad}
        currentFormation={currentFormation}
        captureMode={ui.captureMode}
        showSquadBuilder={ui.showSquadBuilder}
        squadPanelOpen={ui.squadPanelOpen}
        playerViewEnabled={playerView.playerViewEnabled}
        selectedPlayerIndex={playerView.selectedPlayerIndex}
        selectedOpponentViewId={playerView.selectedOpponentViewId}
        substitutionRecords={teamMgmt.substitutionRecords}
        onResetSubstitutions={teamMgmt.resetSubstitutions}
        t={t}
      />

      {/* 右コントロール群 */}
      {!ui.captureMode && (
        <RightControlsColumn
          showRightControls={ui.showRightControls}
          onToggleRightControls={() => ui.setShowRightControls((prev) => !prev)}
          gameModeFormations={formationMgmt.gameModeFormations}
          currentFormationId={formationMgmt.currentFormationId}
          selectedTeam={selectedTeam}
          showFormationEditor={formationMgmt.showFormationEditor}
          gameMode={playModePhase.gameMode}
          allTactics={tOrch.tacticsForCurrentFormation}
          isExecuting={tOrch.isExecuting}
          onChangeFormation={formationMgmt.changeFormation}
          onToggleFormationEditor={() =>
            formationMgmt.setShowFormationEditor((prev) => !prev)
          }
          onUpdateTeam={teamMgmt.handleUpdateTeam}
          canUndo={canUndo}
          canRedo={canRedo}
          undoRedoEnabled={tOrch.undoRedoEnabled}
          onUndo={handleUndo}
          onRedo={handleRedo}
          playerView={playerView}
          opponentsHook={opponentsHook}
          teams={teams}
          pitchConfig={playModePhase.pitchConfig}
          showPlayerNames={ui.showPlayerNames}
          onTogglePlayerNames={() => ui.setShowPlayerNames((prev) => !prev)}
          showNameSettings={ui.showNameSettings}
          onToggleNameSettings={() => ui.setShowNameSettings((prev) => !prev)}
          hiddenPlayerIndices={ui.hiddenPlayerIndices}
          labelFixed={ui.labelFixed}
          onToggleLabelFixed={() => ui.setLabelFixed((prev) => !prev)}
          onTogglePlayerHidden={(index) => {
            ui.setHiddenPlayerIndices((prev) => {
              const next = new Set(prev);
              if (next.has(index)) next.delete(index);
              else next.add(index);
              return next;
            });
          }}
          playersData={playersData}
          formationData={formationMgmt.formationData}
          bgSettings={bgSettings}
          showCards={cardMgmt.showCards}
          onToggleCards={() => cardMgmt.setShowCards((prev) => !prev)}
          playerMarkerScale={ui.playerMarkerScale}
          onMarkerScaleChange={ui.setPlayerMarkerScale}
          activeTactic={tOrch.activeTactic}
          showFlowchart={ui.showFlowchart}
          onToggleFlowchart={() => ui.setShowFlowchart((prev) => !prev)}
          ballHook={ballHook}
          connLines={connLines}
          sketchMode={sketch.sketchMode}
          onToggleSketchMode={() => {
            const willEnterSketch = !sketch.sketchMode;
            sketch.toggleSketchMode();
            if (willEnterSketch && ui.sidebarOpen) {
              ui.toggleSidebar();
            }
          }}
          headerVisible={ui.headerVisible}
          t={t}
        />
      )}

      {!ui.captureMode && (
        <BackgroundSettingsPanelContent
          bgSettings={bgSettings}
          headerVisible={ui.headerVisible}
          t={t}
        />
      )}

      {!ui.captureMode && (
        <OpponentSquadSelectorPopup
          opponentsHook={opponentsHook}
          teams={teams}
          selectedTeamId={teamMgmt.selectedTeamId}
          onEditTeam={() => {
            const oppTeamId = opponentsHook.opponentTeamId;
            if (oppTeamId) {
              teamMgmt.setSelectedTeamId(oppTeamId);
              opponentsHook.toggleOpponentPlacement();
            }
          }}
          headerVisible={ui.headerVisible}
          t={t}
        />
      )}

      {/* 3Dキャンバス */}
      <Suspense fallback={<CanvasLoader />}>
        <TacticsCanvas
          playersData={playersData}
          colorsData={colorsData}
          formationData={formationMgmt.formationData}
          pitchConfig={playModePhase.pitchConfig}
          mergedPlayerPositions={tOrch.mergedPlayerPositions}
          mergedArrows={tOrch.mergedArrows}
          mergedBallTrajectories={tOrch.mergedBallTrajectories}
          showPlayerNames={ui.showPlayerNames && !lineupAnimation.isActive}
          showPlayerNumbers={!lineupAnimation.isActive}
          showPlayerPhotos={!lineupAnimation.isActive}
          showOpponentNames={opponentsHook.showOpponentNames}
          hiddenPlayerIndices={ui.hiddenPlayerIndices}
          labelFixed={ui.labelFixed}
          playerMarkerScale={ui.playerMarkerScale}
          playerCards={canvasMemo.canvasPlayerCards}
          teamName={selectedTeam.name}
          opponentTeamName={opponentsHook.opponentTeam?.name || ""}
          onPlayerClick={handlePlayerClick}
          selectedPlayerIndex={canvasMemo.canvasSelectedPlayerIndex}
          selectedPlayerIndices={multiSelect.selectedPlayerIndices}
          isPlayerView={canvasMemo.canvasIsPlayerView}
          opponents={opponentsHook.opponents}
          selectedOpponentId={playerView.selectedOpponentViewId}
          selectedOpponentIds={multiSelect.selectedOpponentIds}
          onOpponentClick={handleOpponentClick}
          opponentPlacementMode={opponentsHook.opponentPlacementMode}
          onFieldClick={canvasCallbacks.handleFieldClick}
          onOpponentDrag={opponentsHook.handleOpponentDrag}
          onOpponentRemove={opponentsHook.handleOpponentRemove}
          ballPosition={tOrch.effectiveBallPosition}
          ballHighlightPosition={tOrch.ballHighlightPosition}
          ballPlacementMode={tOrch.effectiveBallPlacementMode}
          onBallPlace={canvasCallbacks.handleBallPlace}
          onBallDrag={canvasCallbacks.handleBallDrag}
          onBallRemove={canvasCallbacks.handleBallRemove}
          isDraggingObject={ui.isDraggingObject}
          onDragStart={canvasCallbacks.handleDragStart}
          onDragEnd={canvasCallbacks.handleDragEnd}
          playerDraggable={canvasMemo.canvasPlayerDraggable}
          onPlayerDragEnd={canvasCallbacks.handlePlayerDragEnd}
          onGroupDragEnd={canvasCallbacks.handleGroupDragEnd}
          connectionLines={connLines.connectionLines}
          pendingConnectionLine={canvasMemo.canvasPendingConnectionLine}
          onConnectionLineRemove={connLines.handleConnectionLineRemove}
          lineTrackingActive={canvasMemo.canvasLineTrackingActive}
          onLinePointerMove={canvasCallbacks.handleLinePointerMove}
          fieldLocked={ui.fieldLocked}
          touchlineLocked={ui.touchlineLocked}
          sceneBackground={bgSettings.sceneBackground}
          sceneBackgroundImageUrl={bgSettings.sceneBackgroundImageUrl}
          sceneBackgroundImageSaturation={
            bgSettings.sceneBackgroundImageSaturation
          }
          sceneBackgroundImageBrightness={
            bgSettings.sceneBackgroundImageBrightness
          }
          pitchColor={bgSettings.pitchColor}
          pitchOpacity={bgSettings.pitchOpacity}
          cameraAction={ui.cameraAction}
          onCameraActionDone={canvasCallbacks.handleCameraActionDone}
          yawNudgeRef={playerView.yawNudgeRef}
          isFirstPerson={playerView.isFirstPerson}
          onRectSelectResult={multiSelect.setSelectionFromRect}
          onEmptyFieldClick={multiSelect.clearSelection}
          selectedTeam={selectedTeam}
          currentFormation={currentFormation}
          activeTactic={tOrch.activeTactic}
          language={language}
          t={t}
          tDynamic={tDynamic}
        />
      </Suspense>

      {/* 実行フェーズラベル */}
      {!ui.captureMode && tOrch.isExecuting && tOrch.executionPhase && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
            <span
              className={`text-xs font-semibold ${
                tOrch.executionPhase === "highlight"
                  ? "text-yellow-300"
                  : tOrch.executionPhase === "set"
                    ? "text-sky-300"
                    : "text-emerald-300"
              }`}
            >
              {tDynamic(`tactics.execution.phase.${tOrch.executionPhase}`)}
            </span>
          </div>
        </div>
      )}

      {/* スケッチオーバーレイ */}
      <SketchOverlay
        canvasRef={sketch.canvasRef}
        sketchMode={sketch.sketchMode}
        onPointerDown={sketch.handlePointerDown}
        onPointerMove={sketch.handlePointerMove}
        onPointerUp={sketch.handlePointerUp}
        redraw={sketch.redraw}
      />

      {/* スケッチツールバー */}
      {sketch.sketchMode && !ui.captureMode && (
        <SketchToolbar
          activeTool={sketch.activeTool}
          onToolChange={sketch.setActiveTool}
          strokeColor={sketch.strokeColor}
          onColorChange={sketch.setStrokeColor}
          strokeWidth={sketch.strokeWidth}
          onWidthChange={sketch.setStrokeWidth}
          layers={sketch.layers}
          activeLayerId={sketch.activeLayerId}
          onLayerSelect={sketch.setActiveLayerId}
          onToggleLayerVisibility={sketch.toggleLayerVisibility}
          onAddLayer={sketch.addLayer}
          onRemoveLayer={sketch.removeLayer}
          onRenameLayer={sketch.renameLayer}
          onReorderLayers={sketch.reorderLayers}
          onUndo={sketch.undoLastStroke}
          onClear={sketch.clearLayer}
          onClearAll={sketch.clearAllStrokes}
          t={t}
        />
      )}

      {/* スタメン発表アニメーション */}
      {lineupAnimation.isActive && (
        <LineupAnimationOverlay
          players={lineupPlayers}
          teamInfo={lineupTeamInfo}
          phase={lineupAnimation.phase}
          presetId={lineupAnimation.selectedPresetId}
          onComplete={lineupAnimation.onAnimationComplete}
          onSkip={lineupAnimation.skip}
          onCancel={lineupAnimation.cancel}
        />
      )}

      {/* タイムラインエディタ */}
      {!ui.captureMode &&
        tOrch.tacticCreation.creation?.timelineOpen &&
        currentFormation && (
          <TimelineEditor
            steps={tOrch.tacticCreation.creation.steps}
            movementDelays={tOrch.tacticCreation.creation.movementDelays}
            formation={currentFormation}
            t={t}
            onMovementDelayChange={tOrch.tacticCreation.setMovementDelay}
            onStepDurationChange={tOrch.tacticCreation.setStepDuration}
            onRemoveBallPass={(bpIdx) =>
              tOrch.tacticCreation.removeBallPass(bpIdx)
            }
            onBallPassTrajectoryChange={(bpIdx, type) =>
              tOrch.tacticCreation.updateBallPassTrajectoryType(bpIdx, type)
            }
            onClose={() => tOrch.tacticCreation.setTimelineOpen(false)}
          />
        )}

      {/* フローチャートパネル */}
      {!ui.captureMode && ui.showFlowchart && tOrch.activeTactic && (
        <FlowchartPanel
          chartContent={generateFlowchart()}
          onClose={() => ui.setShowFlowchart(false)}
          t={t}
        />
      )}

      {/* 監督表示 */}
      <ManagerDisplay
        selectedTeam={selectedTeam}
        teamColor={colorsData.df}
        editingManager={managerEditor.editingManager}
        managerInput={managerEditor.managerInput}
        managerCard={cardMgmt.managerCard}
        captureMode={ui.captureMode}
        onStartEditing={() =>
          managerEditor.startEditing(selectedTeam.manager || "")
        }
        onManagerInputChange={managerEditor.setManagerInput}
        onSaveManager={handleSaveManager}
        onCancelEditing={managerEditor.cancelEditing}
        onCycleManagerCard={handleCycleManagerCard}
        t={t}
      />

      {/* ビューコントロール */}
      {!ui.captureMode && !playerView.playerViewEnabled && (
        <ViewLockPanel
          onCameraAction={ui.setCameraAction}
          fieldLocked={ui.fieldLocked}
          onToggleFieldLock={() => ui.setFieldLocked((prev) => !prev)}
          touchlineLocked={ui.touchlineLocked}
          onToggleTouchlineLock={() => ui.setTouchlineLocked((prev) => !prev)}
          disabled={false}
          t={t}
        />
      )}

      {/* プレイヤービューHUD */}
      <PlayerViewHUD
        playerViewEnabled={playerView.playerViewEnabled}
        selectedPlayerIndex={playerView.selectedPlayerIndex}
        selectedOpponentViewId={playerView.selectedOpponentViewId}
        captureMode={ui.captureMode}
        playersData={playersData}
        colorsData={colorsData}
        opponents={opponentsHook.opponents}
        isFirstPerson={playerView.isFirstPerson}
        onExitPlayerView={playerView.exitPlayerView}
        onRotateLeft={playerView.rotateLeft}
        onRotateRight={playerView.rotateRight}
        onTogglePerspective={playerView.togglePerspective}
        t={t}
      />
    </main>
  );
}
