/**
 * @module TacticsSidebarSection
 * @description サイドバー領域（開閉ボタン・オーバーレイ・サイドパネル）を統合するレイアウトコンポーネント。
 *
 * 使用するContext:
 * - TacticsUIContext: サイドバー表示状態
 * - TacticsExecutionContext: 戦術操作・プレーモード・アニメーション
 */
import { useState } from "react";
import { useTacticsUI } from "@presentation/contexts/TacticsUIContext";
import { useTacticsExecution } from "@presentation/contexts/TacticsExecutionContext";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import type { TrajectoryType } from "@domain/entities/BallPass";
import { SidebarPanel } from "./SidebarPanel";
import { TacticImportModal } from "./TacticImportModal";
import { TacticExportModal } from "./TacticExportModal";

export function TacticsSidebarSection() {
  const { ui } = useTacticsUI();
  const { playModePhase, tOrch, lineupAnimation, tacticsLoading } =
    useTacticsExecution();
  const { t, tDynamic, language } = useLanguage();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      {/* サイドバー開閉ボタン */}
      <button
        onClick={ui.toggleSidebar}
        aria-label={
          ui.sidebarOpen ? t("a11y.closeSidebar") : t("a11y.openSidebar")
        }
        aria-expanded={ui.sidebarOpen}
        className={`sidebar-toggle fixed z-40 ${
          ui.sidebarOpen
            ? ui.captureMode || !ui.headerVisible
              ? "top-2"
              : "top-[88px] sm:top-[104px]"
            : ui.captureMode
              ? "top-auto bottom-4 sm:bottom-6"
              : "top-auto bottom-12 sm:bottom-14"
        } w-7 sm:w-8 h-9 sm:h-10 bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] backdrop-blur-xl border border-slate-600/45 rounded-r-2xl flex items-center justify-center transition-all duration-300 ease-in-out shadow-[0_8px_18px_rgba(2,6,23,0.14),0_2px_4px_rgba(2,6,23,0.08)] ring-1 ring-white/5 ${
          ui.sidebarOpen ? "left-60 xl:left-72" : "left-0"
        } ${ui.sidebarOpen ? "text-white hover:-translate-y-[1px] hover:border-slate-400/60" : "text-slate-400 hover:-translate-y-[1px] hover:border-slate-500/60 hover:text-slate-200"} ${ui.captureMode && tOrch.isExecuting ? "opacity-0 pointer-events-none" : ""}`}
        style={lineupAnimation.isActive ? { display: "none" } : undefined}
      >
        <span className="text-xs" aria-hidden="true">
          {ui.sidebarOpen ? "◀" : "▶"}
        </span>
      </button>

      {/* モバイル: サイドバー背景オーバーレイ（タップで閉じる） */}
      {ui.sidebarOpen && !lineupAnimation.isActive && (
        <div
          className="fixed inset-0 bg-black/40 z-20 sm:hidden"
          onClick={ui.toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* サイドパネル */}
      {/* 撮影モード中の戦術実行時は透明化（transition で滑らかにフェード） */}
      <div
        className={`transition-opacity duration-300 ${
          ui.captureMode && tOrch.isExecuting
            ? "opacity-0 pointer-events-none"
            : ""
        }`}
      >
        <SidebarPanel
          layout={{
            sidebarOpen: ui.sidebarOpen,
            sidebarAnimating: ui.sidebarAnimating,
            onTransitionEnd: () => ui.setSidebarAnimating(false),
            isActive: lineupAnimation.isActive,
            headerVisible: ui.headerVisible,
          }}
          phase={{
            playMode: playModePhase.playMode,
            selectedPhase: playModePhase.selectedPhase,
            onPhaseChange: playModePhase.setSelectedPhase,
            selectedSetPlayType: playModePhase.selectedSetPlayType,
            onSetPlayTypeChange: playModePhase.setSelectedSetPlayType,
            onResetState: playModePhase.handleResetState,
            onResetTactic: tOrch.resetTactic,
          }}
          tactics={{
            tacticsLoading,
            tacticsForCurrentFormation: tOrch.tacticsForCurrentFormation,
            activeTacticId: tOrch.activeTacticId,
            isExecuting: tOrch.isExecuting,
            isCreating: !!tOrch.tacticCreation.creation,
            hasCustomTactics: tOrch.hasCustomTactics,
            onTriggerTactic: tOrch.triggerTactic,
            onTriggerStepTactic: tOrch.triggerStepTactic,
            onStartCreationFromTactic: tOrch.startTacticCreationFromCopy,
            onPreviewTacticCopyRange: tOrch.previewTacticCopyRange,
            onClearTacticCopyPreview: tOrch.clearTacticCopyPreview,
            onDeleteTactic: tOrch.handleDeleteTactic,
            stepExecution: tOrch.stepExecution,
            onExecuteNextStep: tOrch.executeNextStep,
            onExitStepMode: tOrch.exitStepMode,
            onStartCreation: tOrch.startTacticCreation,
            onImportTactics: () => setIsImportModalOpen(true),
            onExportTactics: () => setIsExportModalOpen(true),
          }}
          creation={
            tOrch.tacticCreation.creation
              ? {
                  creation: tOrch.tacticCreation.creation,
                  onNameJaChange: tOrch.tacticCreation.setNameJa,
                  onNameEnChange: tOrch.tacticCreation.setNameEn,
                  onIconChange: tOrch.tacticCreation.setIcon,
                  onGamePhaseChange: tOrch.tacticCreation.setGamePhase,
                  onWizardStep: tOrch.handleWizardStepChange,
                  onSwitchStep: tOrch.handleSwitchStep,
                  onAddStep: tOrch.handleAddStep,
                  onResetStep: tOrch.handleResetStep,
                  onResetPreview: tOrch.handleResetPreview,
                  onToggleTimeline: () =>
                    tOrch.tacticCreation.setTimelineOpen(
                      !tOrch.tacticCreation.creation!.timelineOpen,
                    ),
                  onTrajectoryTypeChange:
                    tOrch.tacticCreation.setTrajectoryType,
                  onPreview: tOrch.handlePreviewTactic,
                  onSave: tOrch.handleSaveTactic,
                  onCancelCreation: tOrch.cancelTacticCreation,
                  ballPassCreationMode: tOrch.ballPassCreationMode,
                  ballPassStartPos: tOrch.ballPassStartPos,
                  selectedBallPassTrajectoryType: tOrch.ballPassTrajectoryType,
                  onToggleBallPassMode: () => {
                    tOrch.setBallPassCreationMode((prev) => !prev);
                    tOrch.setBallPassStartPos(null);
                    tOrch.setBallPassPendingEndPos(null);
                  },
                  onBallPassTrajectoryTypeChange: (type: TrajectoryType) => {
                    tOrch.setBallPassTrajectoryType(type);
                    if (
                      tOrch.ballPassStartPos === null &&
                      tOrch.tacticCreation.creation
                    ) {
                      const step =
                        tOrch.tacticCreation.creation.steps[
                          tOrch.tacticCreation.creation.currentStepIndex
                        ];
                      if (step && step.ballPasses.length > 0) {
                        tOrch.tacticCreation.updateBallPassTrajectoryType(
                          step.ballPasses.length - 1,
                          type,
                        );
                      }
                    }
                  },
                }
              : undefined
          }
          capture={{
            captureMode: ui.captureMode,
            selectedImagePresetId: ui.selectedImagePresetId,
            onSelectImagePreset: (presetId) => {
              ui.setSelectedImagePresetId(presetId);
            },
            lineupAnimation,
            showPlayerNames: ui.showPlayerNames,
            onTogglePlayerNames: () => {
              const next = !ui.showPlayerNames;
              ui.setShowPlayerNames(next);
              if (next) ui.setHiddenPlayerIndices(new Set());
            },
            showPlayerNumbers: ui.showPlayerNumbers,
            onTogglePlayerNumbers: () => {
              ui.setShowPlayerNumbers((prev) => !prev);
            },
            onExitCaptureMode: () => {
              ui.setCaptureMode(false);
              ui.setSelectedImagePresetId("none");
              ui.setRightSidebarOpen(true);
            },
          }}
          i18n={{ language, t, tDynamic }}
        />
      </div>

      {isImportModalOpen && (
        <TacticImportModal
          onImport={tOrch.handleImportFromJson}
          onClose={() => setIsImportModalOpen(false)}
          t={t}
          gameMode={playModePhase.gameMode}
        />
      )}
      {isExportModalOpen && (
        <TacticExportModal
          customTactics={tOrch.customTactics}
          language={language}
          t={t}
          onClose={() => setIsExportModalOpen(false)}
          buildExportJson={tOrch.exportTacticsToJson}
          downloadExportJson={tOrch.downloadExportJson}
        />
      )}
    </>
  );
}
