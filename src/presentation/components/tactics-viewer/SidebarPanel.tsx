/**
 * @module SidebarPanel
 * @description タクティクスビューアーのサイドバーパネルコンポーネント。戦術一覧・フェーズフィルタ・戦術選択/実行操作を表示する。
 */
import { memo, useState, useSyncExternalStore } from "react";
import { PHASE_CONFIG, type PhaseKey } from "@shared/constants/phases";
import {
  SET_PLAY_TYPES,
  type SetPlayType,
} from "@shared/constants/setPlayTypes";
import type { GameMode } from "@shared/types/GameMode";
import type { Tactic } from "@domain/entities/Tactic";
import type { TranslationKey } from "@shared/i18n/translations";
import type { Language } from "@presentation/contexts/LanguageContext";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import type { StepExecutionState } from "@presentation/hooks/tactic/useTacticExecution";
import { getVisibleTacticStepCount } from "@presentation/hooks/tactic/restoreCreationStateFromTactic";
import { LINEUP_ANIMATION_PRESETS } from "@presentation/components/lineup-animation";
import { PhaseDiamond } from "./PhaseDiamond";
import { SidebarCreationContent } from "./tactic-creation";
import { TacticDuplicateModal } from "./TacticDuplicateModal";
import { TacticCreationEntryModal } from "./TacticCreationEntryModal";
import {
  getPlaybackSpeed,
  setPlaybackSpeed,
  subscribePlaybackSpeed,
  PLAYBACK_SPEED_OPTIONS,
} from "@shared/stores/playbackSpeedStore";

// ── Props グループ型 ────────────────────────────────────

/** サイドバーの表示制御 */
export interface SidebarLayoutProps {
  sidebarOpen: boolean;
  sidebarAnimating: boolean;
  onTransitionEnd: () => void;
  isActive: boolean;
  headerVisible: boolean;
}

/** ゲームモード選択 */
export interface GameModeProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
}

/** 再生モード＆フェーズ */
export interface PhaseProps {
  playMode: "field" | "setPlay";
  selectedPhase: PhaseKey;
  onPhaseChange: (phase: PhaseKey) => void;
  selectedSetPlayType: SetPlayType;
  onSetPlayTypeChange: (type: SetPlayType) => void;
  onResetState: () => void;
  onResetTactic: () => void;
}

/** 戦術の一覧表示・実行制御 */
export interface TacticListProps {
  tacticsLoading: boolean;
  tacticsForCurrentFormation: Tactic[];
  activeTacticId: string | null;
  isExecuting: boolean;
  isCreating: boolean;
  hasCustomTactics: boolean;
  onTriggerTactic: (id: string) => void;
  onTriggerStepTactic?: (id: string) => void;
  onStartCreationFromTactic?: (id: string, copyUntilStep: number) => void;
  onPreviewTacticCopyRange?: (id: string, copyUntilStep: number) => void;
  onClearTacticCopyPreview?: () => void;
  onDeleteTactic: (id: string) => void;
  stepExecution?: StepExecutionState;
  onExecuteNextStep?: () => void;
  onExitStepMode?: () => void;
  onStartCreation: (mode?: "standard" | "situation") => void;
  onImportTactics: () => void;
  onExportTactics: () => void;
}

/** 戦術作成ウィザード（isCreating が true の場合のみ使用） */
export interface TacticCreationProps {
  creation: CreationState | null;
  isSetPlayMode?: boolean;
  onNameJaChange: (name: string) => void;
  onNameEnChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onGamePhaseChange: (phase: PhaseKey) => void;
  onWizardStep: (step: WizardStep) => void;
  onSwitchStep: (index: number) => void;
  onAddStep: () => void;
  onResetStep: () => void;
  onResetPreview: () => void;
  onToggleTimeline: () => void;
  onTrajectoryTypeChange?: (type: TrajectoryType) => void;
  onPreview: () => void;
  onSave: () => void;
  onCancelCreation: () => void;
  ballPassCreationMode: boolean;
  ballPassStartPos: { x: number; z: number } | null;
  selectedBallPassTrajectoryType: TrajectoryType;
  onToggleBallPassMode?: () => void;
  onBallPassTrajectoryTypeChange?: (type: TrajectoryType) => void;
}

/** キャプチャモード */
export interface CaptureModeProps {
  captureMode: boolean;
  selectedImagePresetId: string;
  onSelectImagePreset: (presetId: string) => void;
  lineupAnimation: {
    isActive: boolean;
    selectedPresetId: string;
    setSelectedPresetId: (id: string) => void;
    start: () => void;
  };
  showPlayerNames: boolean;
  onTogglePlayerNames: () => void;
  showPlayerNumbers: boolean;
  onTogglePlayerNumbers: () => void;
  onExitCaptureMode: () => void;
}

/** 国際化 */
export interface I18nProps {
  language: Language;
  t: (key: TranslationKey) => string;
  tDynamic: (key: string) => string;
}

interface SidebarPanelProps {
  layout: SidebarLayoutProps;
  phase: PhaseProps;
  tactics: TacticListProps;
  creation?: TacticCreationProps;
  capture: CaptureModeProps;
  i18n: I18nProps;
}

// ── 定数 ────────────────────────────────────────────────

const SIDEBAR_SECTION_CLASS =
  "mx-2.5 mt-2 rounded-[18px] border border-slate-700/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.42)_0%,rgba(15,23,42,0.26)_100%)] shadow-[0_8px_20px_rgba(2,6,23,0.16)] ring-1 ring-white/5";
const SIDEBAR_SECTION_FIRST_CLASS =
  "mx-2.5 mt-0 rounded-[18px] border border-slate-700/30 bg-[linear-gradient(180deg,rgba(15,23,42,0.42)_0%,rgba(15,23,42,0.26)_100%)] shadow-[0_8px_20px_rgba(2,6,23,0.16)] ring-1 ring-white/5";
const SIDEBAR_SECTION_HEADER_CLASS =
  "text-[10px] text-slate-300/90 mb-1.5 font-bold tracking-[0.22em] uppercase flex items-center gap-1.5";
const SIDEBAR_SECTION_BODY_CLASS = "px-2.5 pb-2.5";
const SIDEBAR_PILL_BUTTON_CLASS =
  "w-full rounded-xl border border-slate-700/35 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:bg-white/[0.07] hover:text-white";
const SIDEBAR_SECONDARY_BUTTON_CLASS =
  "rounded-xl border border-slate-700/35 bg-white/[0.04] text-slate-400 transition-all duration-200 hover:bg-white/[0.07] hover:text-slate-200";
const EMPTY_STEP_EXECUTION: StepExecutionState = {
  isStepMode: false,
  currentStep: 0,
  totalSteps: 1,
  isStepRunning: false,
  tactic: null,
};

const IMAGE_PRESETS: { id: string; nameKey: TranslationKey }[] = [
  { id: "field-only", nameKey: "tactics.capture.preset.field-only" },
  { id: "squad-and-sub", nameKey: "tactics.capture.preset.squad-and-sub" },
  {
    id: "split-field-squad",
    nameKey: "tactics.capture.preset.split-field-squad",
  },
  { id: "cinematic-all", nameKey: "tactics.capture.preset.cinematic-all" },
  {
    id: "magazine-showcase",
    nameKey: "tactics.capture.preset.magazine-showcase",
  },
];

// ── サブコンポーネント ──────────────────────────────────

function StepExecutionPanel({
  stepExecution,
  onExecuteNextStep,
  onExitStepMode,
  t,
}: {
  stepExecution: StepExecutionState;
  onExecuteNextStep: () => void;
  onExitStepMode: () => void;
  t: (key: TranslationKey) => string;
}) {
  const hasSetupStep = stepExecution.tactic?.hasSetupStepExecution ?? false;
  const displayCurrent = hasSetupStep
    ? stepExecution.currentStep
    : stepExecution.currentStep + 1;
  const displayTotal = hasSetupStep
    ? stepExecution.totalSteps - 1
    : stepExecution.totalSteps;

  return (
    <div className="mb-2 rounded-lg border border-amber-700/40 bg-gradient-to-r from-amber-900/30 to-amber-800/20 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
          {t("tactics.stepExecution")}
        </span>
        <span className="text-[10px] font-medium text-amber-300/80">
          {t("tactics.stepExecution.progress")
            .replace("{current}", String(displayCurrent))
            .replace("{total}", String(displayTotal))}
        </span>
      </div>
      <div className="mb-2 flex gap-1">
        {Array.from({ length: displayTotal }, (_, index) => {
          const actualIndex = hasSetupStep ? index + 1 : index;
          return (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                actualIndex < stepExecution.currentStep
                  ? "bg-amber-400"
                  : actualIndex === stepExecution.currentStep
                    ? stepExecution.isStepRunning
                      ? "animate-pulse bg-amber-400"
                      : "bg-amber-500"
                    : "bg-slate-700"
              }`}
            />
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={onExecuteNextStep}
          disabled={
            stepExecution.isStepRunning ||
            stepExecution.currentStep >= stepExecution.totalSteps - 1
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-2 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500"
        >
          {stepExecution.isStepRunning ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>{t("tactics.stepExecution.running")}</span>
            </>
          ) : stepExecution.currentStep >= stepExecution.totalSteps - 1 ? (
            <span>{t("tactics.stepExecution.completed")}</span>
          ) : (
            <>
              <span>▶</span>
              <span>{t("tactics.stepExecution.next")}</span>
            </>
          )}
        </button>
        <button
          onClick={onExitStepMode}
          className="rounded-lg bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600"
        >
          {t("tactics.stepExecution.exit")}
        </button>
      </div>
    </div>
  );
}

// TacticDuplicateModal and TacticCreationEntryModal have been extracted
// to their own files as part of Phase 3 component splitting.

// ── メインコンポーネント ────────────────────────────────

/**
 * 左サイドバー。ゲームモード選択、フェーズ選択、戦術リスト、作成/Import/Export を含む。
 * 戦術作成中はSTATESセクション + 作成ウィザードに切り替わる。
 */
export const SidebarPanel = memo(function SidebarPanel(
  props: SidebarPanelProps,
) {
  const { layout, phase, tactics, creation, capture, i18n } = props;
  const { t, tDynamic, language } = i18n;
  const stepExecution = tactics.stepExecution ?? EMPTY_STEP_EXECUTION;
  const onTriggerStepTactic = tactics.onTriggerStepTactic ?? (() => {});
  const onStartCreationFromTactic =
    tactics.onStartCreationFromTactic ?? (() => {});
  const onPreviewTacticCopyRange =
    tactics.onPreviewTacticCopyRange ?? (() => {});
  const onClearTacticCopyPreview =
    tactics.onClearTacticCopyPreview ?? (() => {});
  const onExecuteNextStep = tactics.onExecuteNextStep ?? (() => {});
  const onExitStepMode = tactics.onExitStepMode ?? (() => {});
  const [duplicateTarget, setDuplicateTarget] = useState<Tactic | null>(null);
  const [creationEntryOpen, setCreationEntryOpen] = useState(false);
  const [sourceSelectionMode, setSourceSelectionMode] = useState(false);

  const playbackSpeed = useSyncExternalStore(
    subscribePlaybackSpeed,
    getPlaybackSpeed,
  );
  const showCreationMode = tactics.isCreating && creation?.creation != null;

  const handleSelectSourceTactic = (tactic: Tactic) => {
    const totalSteps = getVisibleTacticStepCount(tactic);
    if (totalSteps <= 1) {
      onStartCreationFromTactic(tactic.id.value, 1);
      setSourceSelectionMode(false);
      return;
    }
    setDuplicateTarget(tactic);
  };

  return (
    <aside
      aria-label={t("a11y.formationSelector")}
      className={`sidebar-panel custom-scrollbar ${layout.sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${layout.sidebarAnimating ? "sidebar-animating" : ""} transition-opacity duration-300 ${tactics.isExecuting && !stepExecution.isStepMode && !capture.captureMode ? "opacity-40" : ""}`}
      onTransitionEnd={layout.onTransitionEnd}
      style={layout.isActive ? { display: "none" } : undefined}
    >
      {/* ── 撮影モード ── */}
      {capture.captureMode && !capture.lineupAnimation.isActive ? (
        <div className="custom-scrollbar min-h-full pt-2 pb-3">
          {/* 撮影終了ボタン（最上部） */}
          <div className={SIDEBAR_SECTION_FIRST_CLASS}>
            <div className={SIDEBAR_SECTION_BODY_CLASS}>
              <button
                onClick={capture.onExitCaptureMode}
                className="w-full mt-2.5 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold hover:scale-[1.02]"
              >
                <span>✕</span>
                <span>{t("tactics.capture.close")}</span>
              </button>
            </div>
          </div>

          {/* セクション: 撮影 */}
          <div className={SIDEBAR_SECTION_CLASS}>
            <div className="px-2.5 pt-2.5">
              <div className={SIDEBAR_SECTION_HEADER_CLASS}>
                <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                {t("tactics.capture.options")}
              </div>
            </div>
            <div className={SIDEBAR_SECTION_BODY_CLASS}>
              <div className="space-y-1.5">
                <button
                  onClick={capture.onTogglePlayerNames}
                  className={`w-full py-2.5 px-3 ${
                    capture.showPlayerNames
                      ? "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] border border-slate-700/35"
                      : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg"
                  } rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold hover:scale-[1.02]`}
                >
                  <span>{capture.showPlayerNames ? "👁️" : "👁️‍🗨️"}</span>
                  <span>
                    {capture.showPlayerNames
                      ? t("tactics.hideNames")
                      : t("tactics.showNames")}
                  </span>
                </button>

                <button
                  onClick={capture.onTogglePlayerNumbers}
                  className={`w-full py-2.5 px-3 ${
                    capture.showPlayerNumbers
                      ? "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] border border-slate-700/35"
                      : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg"
                  } rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold hover:scale-[1.02]`}
                >
                  <span>{capture.showPlayerNumbers ? "🔢" : "🔤"}</span>
                  <span>
                    {capture.showPlayerNumbers
                      ? t("tactics.hideNumbers")
                      : t("tactics.showNumbers")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* セクション: 画像撮影レイアウト */}
          <div className={SIDEBAR_SECTION_CLASS}>
            <div className="px-2.5 pt-2.5">
              <div className={SIDEBAR_SECTION_HEADER_CLASS}>
                <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                {t("tactics.capture.imageLayouts")}
              </div>
            </div>
            <div className={SIDEBAR_SECTION_BODY_CLASS}>
              <div className="space-y-1.5">
                {IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => capture.onSelectImagePreset(preset.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 text-left ${
                      capture.selectedImagePresetId === preset.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] border border-slate-700/35"
                    }`}
                  >
                    {t(preset.nameKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* セクション: スタメン発表 */}
          <div className={SIDEBAR_SECTION_CLASS}>
            <div className="px-2.5 pt-2.5">
              <div className={SIDEBAR_SECTION_HEADER_CLASS}>
                <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                {t("lineup.animation.button")}
              </div>
            </div>
            <div className={SIDEBAR_SECTION_BODY_CLASS}>
              <div className="space-y-1.5">
                {/* 再生速度セレクター */}
                <div className="flex gap-0.5 justify-end pb-0.5">
                  {PLAYBACK_SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all duration-200 ${
                        playbackSpeed === speed
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white/[0.04] text-slate-500 hover:text-slate-300 hover:bg-white/[0.07]"
                      }`}
                    >
                      {speed === 1 ? "1x" : `${speed}x`}
                    </button>
                  ))}
                </div>
                {/* モード選択（タップで即実行） */}
                {LINEUP_ANIMATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      capture.lineupAnimation.setSelectedPresetId(preset.id);
                      capture.lineupAnimation.start();
                    }}
                    disabled={capture.lineupAnimation.isActive}
                    className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                      capture.lineupAnimation.selectedPresetId === preset.id
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] border border-slate-700/35"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {tDynamic(preset.nameKey) || preset.fallbackName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : /* ── 戦術作成モード ── */
      showCreationMode ? (
        <>
          {/* 作成ウィザード */}
          <div className="custom-scrollbar">
            <SidebarCreationContent
              creation={creation!.creation!}
              language={language}
              isExecuting={tactics.isExecuting}
              t={t}
              onNameJaChange={creation!.onNameJaChange}
              onNameEnChange={creation!.onNameEnChange}
              onIconChange={creation!.onIconChange}
              onGamePhaseChange={creation!.onGamePhaseChange}
              onWizardStep={creation!.onWizardStep}
              onSwitchStep={creation!.onSwitchStep}
              onAddStep={creation!.onAddStep}
              onResetStep={creation!.onResetStep}
              onResetPreview={creation!.onResetPreview}
              onToggleTimeline={creation!.onToggleTimeline}
              onTrajectoryTypeChange={creation!.onTrajectoryTypeChange}
              onPreview={creation!.onPreview}
              onSave={creation!.onSave}
              onCancel={creation!.onCancelCreation}
              ballPassCreationMode={creation!.ballPassCreationMode}
              ballPassStartPos={creation!.ballPassStartPos}
              selectedBallPassTrajectoryType={
                creation!.selectedBallPassTrajectoryType
              }
              onToggleBallPassMode={creation!.onToggleBallPassMode}
              onBallPassTrajectoryTypeChange={
                creation!.onBallPassTrajectoryTypeChange
              }
            />
          </div>
        </>
      ) : (
        <>
          {/* ── 通常モード ── */}

          {/* リセットボタン */}
          <div className={SIDEBAR_SECTION_CLASS}>
            <div className={SIDEBAR_SECTION_BODY_CLASS}>
              <button
                onClick={phase.onResetState}
                className={`${SIDEBAR_PILL_BUTTON_CLASS} mt-2.5 py-1 flex items-center justify-center gap-1.5 text-xs font-medium`}
              >
                <span className="text-sm">🔄</span>
                <span className="tracking-wide">{t("tactics.reset")}</span>
              </button>
            </div>
          </div>

          {/* セットプレータイプ選択 */}
          {phase.playMode === "setPlay" && (
            <div className={SIDEBAR_SECTION_CLASS}>
              <div className="px-2.5 pt-2.5">
                <div className={SIDEBAR_SECTION_HEADER_CLASS}>
                  <span className="w-1 h-3 bg-teal-500 rounded-full"></span>
                  {t("tactics.setPlayType")}
                </div>
              </div>
              <div
                className={`${SIDEBAR_SECTION_BODY_CLASS} grid grid-cols-2 gap-1.5`}
              >
                {SET_PLAY_TYPES.map((type) => {
                  const cfg = PHASE_CONFIG[type];
                  const isActiveType = phase.selectedSetPlayType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        phase.onSetPlayTypeChange(type);
                        phase.onResetTactic();
                      }}
                      className={`py-2 px-2 rounded-xl text-center transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        isActiveType
                          ? `${cfg.bgColor} text-white shadow-lg scale-[1.02]`
                          : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:scale-[1.01] border border-slate-700/35"
                      }`}
                    >
                      <span className="text-sm">{cfg.icon}</span>
                      <span className="text-xs font-bold tracking-wide">
                        {tDynamic(`phase.${type}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* フェーズ選択 - 菱形レイアウト */}
          {phase.playMode === "field" && (
            <div className={SIDEBAR_SECTION_CLASS}>
              <div className="px-2.5 pt-2.5">
                <div className={SIDEBAR_SECTION_HEADER_CLASS}>
                  <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                  {t("tactics.phase")}
                </div>
              </div>
              <div className={`${SIDEBAR_SECTION_BODY_CLASS} pt-1`}>
                <PhaseDiamond
                  selectedPhase={phase.selectedPhase}
                  onPhaseChange={phase.onPhaseChange}
                  t={t}
                />
              </div>
            </div>
          )}

          {/* 戦術リスト */}
          <div className="pb-3 custom-scrollbar">
            <div className={`${SIDEBAR_SECTION_CLASS} mt-2`}>
              <div className="px-2.5 pt-2.5">
                <div className={SIDEBAR_SECTION_HEADER_CLASS}>
                  <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
                  Tactics
                </div>
              </div>
              <div className={SIDEBAR_SECTION_BODY_CLASS}>
                <div className="flex gap-0.5 justify-end mb-2">
                  {PLAYBACK_SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold transition-all duration-200 ${
                        playbackSpeed === speed
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white/[0.04] text-slate-500 hover:text-slate-300 hover:bg-white/[0.07]"
                      }`}
                    >
                      {speed === 1 ? "1x" : `${speed}x`}
                    </button>
                  ))}
                </div>
                {sourceSelectionMode && (
                  <div className="mb-2 rounded-lg border border-emerald-700/40 bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                          {t("tactics.creation.entry.fromExisting")}
                        </p>
                        <p className="mt-1 text-xs text-emerald-100/90">
                          {t("tactics.creation.entry.selectSource")}
                        </p>
                      </div>
                      <button
                        onClick={() => setSourceSelectionMode(false)}
                        className="rounded-md bg-slate-800/70 px-2 py-1 text-[11px] text-slate-300 transition hover:bg-slate-700"
                      >
                        {t("tactics.creation.cancel")}
                      </button>
                    </div>
                  </div>
                )}
                {tactics.tacticsLoading ? (
                  <div className="text-slate-400 text-sm text-center py-12 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="font-light">Loading...</span>
                  </div>
                ) : tactics.tacticsForCurrentFormation.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center py-12 flex flex-col items-center gap-3">
                    <span className="text-3xl opacity-50">🚫</span>
                    <span className="font-light">
                      {t("tactics.noMatchingTactics")}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {stepExecution.isStepMode && (
                      <StepExecutionPanel
                        stepExecution={stepExecution}
                        onExecuteNextStep={onExecuteNextStep}
                        onExitStepMode={onExitStepMode}
                        t={t}
                      />
                    )}

                    {tactics.tacticsForCurrentFormation.map((tactic) => (
                      <div
                        key={tactic.id.value}
                        className="flex items-center gap-1"
                      >
                        <button
                          onClick={() => {
                            if (sourceSelectionMode) {
                              handleSelectSourceTactic(tactic);
                              return;
                            }
                            tactics.onTriggerTactic(tactic.id.value);
                          }}
                          disabled={
                            tactics.isExecuting || stepExecution.isStepMode
                          }
                          className={`flex-1 py-1.5 px-2.5 rounded-xl text-left transition-all duration-300 ${
                            tactics.activeTacticId === tactic.id.value
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.01]"
                              : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:scale-[1.005] border border-slate-700/35"
                          } ${(tactics.isExecuting || stepExecution.isStepMode) && tactics.activeTacticId !== tactic.id.value ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{tactic.icon}</span>
                            <span className="text-xs font-medium tracking-wide">
                              {tactic.isCustom
                                ? tactic.getDisplayName(language)
                                : tDynamic(`tactics.name.${tactic.id.value}`)}
                            </span>
                          </div>
                        </button>
                        {tactic.supportsStepExecution && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onTriggerStepTactic(tactic.id.value);
                            }}
                            disabled={
                              tactics.isExecuting || stepExecution.isStepMode
                            }
                            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-400"
                            title={t("tactics.stepExecution.start")}
                            aria-label={t("tactics.stepExecution.start")}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                        {tactic.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              tactics.onDeleteTactic(tactic.id.value);
                            }}
                            disabled={
                              tactics.isExecuting || stepExecution.isStepMode
                            }
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 shrink-0"
                            title={t("tactics.creation.delete")}
                            aria-label={t("tactics.creation.delete")}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 h-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 戦術作成/インポート/エクスポート */}
                <div className="mt-3 pt-3 border-t border-slate-800/40 space-y-1.5">
                  <button
                    onClick={() => {
                      phase.onResetTactic();
                      setCreationEntryOpen(true);
                    }}
                    disabled={tactics.isCreating || tactics.isExecuting}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      tactics.isCreating
                        ? "bg-emerald-600/20 text-emerald-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    }`}
                  >
                    <span>✨</span>
                    <span className="tracking-wide">
                      {t("tactics.creation.create")}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={tactics.onImportTactics}
                      disabled={tactics.isExecuting}
                      className={`flex-1 min-h-[34px] px-2 text-[10px] font-medium flex items-center justify-center gap-1.5 ${SIDEBAR_SECONDARY_BUTTON_CLASS}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{t("tactics.import")}</span>
                    </button>
                    <button
                      onClick={tactics.onExportTactics}
                      disabled={
                        tactics.isExecuting || !tactics.hasCustomTactics
                      }
                      className={`flex-1 min-h-[34px] px-2 text-[10px] font-medium border flex items-center justify-center gap-1.5 ${
                        tactics.hasCustomTactics
                          ? SIDEBAR_SECONDARY_BUTTON_CLASS
                          : "rounded-xl border-slate-700/25 bg-white/[0.03] text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{t("tactics.export")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {duplicateTarget && (
        <TacticDuplicateModal
          tactic={duplicateTarget}
          language={language}
          t={t}
          tDynamic={tDynamic}
          onClose={() => setDuplicateTarget(null)}
          onConfirm={(copyUntilStep) => {
            onStartCreationFromTactic(duplicateTarget.id.value, copyUntilStep);
            setSourceSelectionMode(false);
            setDuplicateTarget(null);
          }}
          onPreview={(copyUntilStep) =>
            onPreviewTacticCopyRange(duplicateTarget.id.value, copyUntilStep)
          }
          onClearPreview={onClearTacticCopyPreview}
        />
      )}
      {creationEntryOpen && (
        <TacticCreationEntryModal
          t={t}
          isSetPlayMode={phase.playMode === "setPlay"}
          onClose={() => setCreationEntryOpen(false)}
          onCreateStandard={() => {
            setCreationEntryOpen(false);
            setSourceSelectionMode(false);
            tactics.onStartCreation("standard");
          }}
          onCreateSituation={() => {
            setCreationEntryOpen(false);
            setSourceSelectionMode(false);
            tactics.onStartCreation("situation");
          }}
          onCreateFromExisting={() => {
            setCreationEntryOpen(false);
            setSourceSelectionMode(true);
          }}
        />
      )}
    </aside>
  );
});
