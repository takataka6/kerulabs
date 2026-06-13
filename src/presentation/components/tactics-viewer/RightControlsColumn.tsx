/**
 * @module RightControlsColumn
 * @description タクティクスビューアー右側の操作パネル列コンポーネント。カメラ制御・背景設定・接続ライン・相手チーム操作をまとめる。
 */
import { memo } from "react";
import type { Formation } from "@domain/entities/Formation";
import type { Tactic } from "@domain/entities/Tactic";
import type { Team } from "@domain/entities/Team";
import type { GameMode } from "@shared/types/GameMode";
import type {
  usePlayerView,
  useBackgroundSettings,
} from "@presentation/hooks/ui";
import type {
  useOpponents,
  useBallPlacement,
  useConnectionLines,
} from "@presentation/hooks/field";
import { FormationEditor } from "@presentation/components/team";
import type { TranslationFn, PlayerData, FormationDataItem } from "./types";
import { getPositionBg } from "@shared/constants/positionColors";
import { getFormationOptionsWithDefault } from "@shared/constants/formations";
import {
  BackgroundSettingsPanel,
  ConnectionLinesButton,
  RightHistoryPanel,
} from "./right-controls";

const PRIMARY_PANEL_CLASS =
  "bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] backdrop-blur-xl rounded-[22px] border border-slate-500/50 shadow-[0_10px_24px_rgba(2,6,23,0.16),0_2px_6px_rgba(2,6,23,0.1)] overflow-hidden ring-1 ring-white/5";
const SECONDARY_PANEL_CLASS =
  "bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.9)_100%)] backdrop-blur-xl rounded-[20px] border border-slate-600/35 shadow-[0_6px_16px_rgba(2,6,23,0.12),0_1px_3px_rgba(2,6,23,0.08)] overflow-hidden ring-1 ring-white/5";
const SECONDARY_TOGGLE_BUTTON_CLASS =
  "relative min-h-[36px] py-1 px-1.5 sm:py-1.5 sm:px-2 xl:py-1.5 xl:px-2.5 rounded-[20px] border border-slate-600/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.9)_100%)] text-slate-300 shadow-[0_6px_16px_rgba(2,6,23,0.12),0_1px_3px_rgba(2,6,23,0.08)] ring-1 ring-white/5 transition-all duration-300 flex items-center justify-center gap-1.5 hover:-translate-y-[1px] hover:border-slate-500/50 hover:text-white";
const RAIL_BUTTON_CLASS =
  "relative w-full min-h-[36px] py-1 px-1.5 sm:py-1.5 sm:px-2 xl:py-1.5 xl:px-2.5 transition-all duration-300 flex items-center justify-center gap-1.5 text-slate-300 hover:bg-white/[0.06] hover:text-white";
const RAIL_BUTTON_INACTIVE_CLASS = "bg-transparent";
const SPLIT_ACTION_CLASS =
  "py-1 px-1.5 sm:py-1.5 sm:px-2 transition-all duration-300 text-slate-500 hover:text-white hover:bg-white/[0.06] border-l border-slate-700/50";
const PANEL_CAPTION_CLASS =
  "text-[10px] text-slate-300/90 font-bold tracking-[0.22em] uppercase flex items-center gap-1.5 h-5";
const COUNT_BADGE_CLASS =
  "text-[9px] bg-white/8 text-slate-200 px-1.5 py-0.5 rounded-full border border-white/10";
const HEADER_ACTION_CARD_HEIGHT_CLASS = "sm:h-[82px] xl:h-[86px]";
const RAIL_PANEL_WIDTH_CLASS = "w-full sm:w-[136px] xl:w-[148px]";
const RAIL_ROW_CLASS =
  "grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-1.5 items-start sm:justify-items-end w-full sm:w-[136px] xl:w-[148px]";

interface RightControlsColumnProps {
  // 表示切り替え
  showRightControls: boolean;
  onToggleRightControls: () => void;

  // フォーメーション
  gameModeFormations: Formation[];
  currentFormationId: string | null;
  selectedTeam: Team;
  showFormationEditor: boolean;
  gameMode: GameMode;
  allTactics: Tactic[];
  isExecuting: boolean;
  onChangeFormation: (id: string) => void;
  onToggleFormationEditor: () => void;
  onUpdateTeam: (team: Team) => void;

  // 元に戻す/やり直し
  canUndo: boolean;
  canRedo: boolean;
  undoRedoEnabled: boolean;
  onUndo: () => void;
  onRedo: () => void;

  // プレイヤービュー
  playerView: ReturnType<typeof usePlayerView>;

  // 相手チーム
  opponentsHook: ReturnType<typeof useOpponents>;
  teams: Team[] | undefined;
  pitchConfig: { maxOpponents: number };

  // 選手名・番号表示
  showPlayerNames: boolean;
  onTogglePlayerNames: () => void;
  showPlayerNumbers: boolean;
  onTogglePlayerNumbers: () => void;
  showNameSettings: boolean;
  onToggleNameSettings: () => void;
  hiddenPlayerIndices: Set<number>;
  onTogglePlayerHidden: (index: number) => void;
  labelFixed: boolean;
  onToggleLabelFixed: () => void;
  playersData: PlayerData[];
  formationData: FormationDataItem[];

  // 背景
  bgSettings: ReturnType<typeof useBackgroundSettings>;

  // カード
  showCards: boolean;
  onToggleCards: () => void;

  // マーカー
  playerMarkerScale: number;
  onMarkerScaleChange: (scale: number) => void;

  // フローチャート
  activeTactic: Tactic | undefined;
  showFlowchart: boolean;
  onToggleFlowchart: () => void;

  // ボール
  ballHook: ReturnType<typeof useBallPlacement>;

  // コネクションライン
  connLines: ReturnType<typeof useConnectionLines>;

  // スケッチ
  sketchMode: boolean;
  onToggleSketchMode: () => void;

  // ヘッダー表示
  headerVisible: boolean;

  // i18n
  t: TranslationFn;
}

export const RightControlsColumn = memo(function RightControlsColumn({
  showRightControls,
  onToggleRightControls,
  gameModeFormations,
  currentFormationId,
  selectedTeam,
  showFormationEditor,
  gameMode,
  allTactics,
  isExecuting,
  onChangeFormation,
  onToggleFormationEditor,
  onUpdateTeam,
  canUndo,
  canRedo,
  undoRedoEnabled,
  onUndo,
  onRedo,
  playerView,
  opponentsHook,
  teams,
  pitchConfig,
  showPlayerNames,
  onTogglePlayerNames,
  showPlayerNumbers,
  onTogglePlayerNumbers,
  showNameSettings,
  onToggleNameSettings,
  hiddenPlayerIndices,
  onTogglePlayerHidden,
  labelFixed,
  onToggleLabelFixed,
  playersData,
  formationData,
  bgSettings,
  showCards,
  onToggleCards,
  playerMarkerScale,
  onMarkerScaleChange,
  activeTactic,
  showFlowchart,
  onToggleFlowchart,
  ballHook,
  connLines,
  sketchMode,
  onToggleSketchMode,
  headerVisible,
  t,
}: RightControlsColumnProps) {
  const currentFormation = gameModeFormations.find(
    (f) => f.id.value === currentFormationId,
  );
  const availableFormationIds = new Set(
    getFormationOptionsWithDefault(selectedTeam.availableFormations, gameMode),
  );
  const showOpponentSelector =
    !!teams &&
    teams.length > 0 &&
    (opponentsHook.opponentPlacementMode ||
      !!opponentsHook.selectedOpponentPlayerId) &&
    !opponentsHook.showOpponentFormationSelect &&
    !opponentsHook.showOpponentSquadBuilder;
  const isOpponentSelectorActive =
    opponentsHook.opponentPlacementMode ||
    !!opponentsHook.selectedOpponentPlayerId ||
    opponentsHook.showOpponentFormationSelect ||
    opponentsHook.showOpponentSquadBuilder;

  return (
    <div
      className={`fixed ${headerVisible ? "top-[90px] sm:top-[106px]" : "top-2"} right-2 sm:right-3 z-10 flex flex-col gap-1 sm:gap-1.5 items-end max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] ${headerVisible ? "max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-160px)]" : "max-h-[calc(100vh-1rem)]"} overflow-y-auto overflow-x-hidden custom-scrollbar pointer-events-none [&>*]:pointer-events-auto`}
    >
      {/* フォーメーション選択 + Undo/Redo + 開閉トグル */}
      <div className="flex items-start gap-2 [&>*]:pointer-events-auto">
        {/* 右コントロール群の開閉トグル */}
        <button
          onClick={onToggleRightControls}
          className={`bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] backdrop-blur-xl rounded-[20px] border border-slate-500/45 ring-1 ring-white/5 shadow-[0_6px_16px_rgba(2,6,23,0.14),0_1px_3px_rgba(2,6,23,0.08)] transition-all duration-300 flex items-center justify-center h-[46px] w-[36px] ${showRightControls ? "text-white hover:-translate-y-[1px] hover:border-slate-400/60" : "text-slate-400 hover:-translate-y-[1px] hover:border-slate-500/60 hover:text-slate-200"}`}
          aria-label={
            showRightControls
              ? t("tactics.hideControls")
              : t("tactics.showControls")
          }
        >
          <span className="text-sm" aria-hidden="true">
            {showRightControls ? "▶" : "◀"}
          </span>
        </button>

        {showRightControls && (
          <div className="flex flex-col items-end gap-1 sm:gap-1.5">
            {/* フォーメーション編集ポップオーバー */}
            {showFormationEditor && (
              <FormationEditor
                team={selectedTeam}
                allTactics={allTactics || []}
                formations={gameModeFormations}
                gameMode={gameMode}
                onUpdateTeam={(updatedTeam) => {
                  onUpdateTeam(updatedTeam);
                  if (
                    currentFormation &&
                    !updatedTeam.availableFormations.includes(
                      currentFormation.id.value,
                    )
                  ) {
                    const newDefault =
                      updatedTeam.defaultFormation ||
                      updatedTeam.availableFormations[0];
                    const newFormation = gameModeFormations.find(
                      (f) => f.id.value === newDefault,
                    );
                    if (newFormation) onChangeFormation(newFormation.id.value);
                  }
                }}
                onClose={onToggleFormationEditor}
              />
            )}

            {/* フォーメーション + Undo/Redo(sm+のみ) */}
            <div className="flex w-full sm:w-auto items-stretch justify-end gap-2 self-end">
              {/* フォーメーション */}
              <div
                className={`${PRIMARY_PANEL_CLASS} ${HEADER_ACTION_CARD_HEIGHT_CLASS} flex w-full sm:w-[144px] xl:w-[156px] flex-col`}
              >
                <div className="bg-gradient-to-r from-slate-800/95 via-slate-800/90 to-slate-700/85 px-1.5 py-1 sm:px-2 sm:py-1.5 border-b border-slate-600/60 flex items-center justify-between gap-1">
                  <div className={PANEL_CAPTION_CLASS}>
                    <span className="w-1 h-3.5 bg-orange-500 rounded-full hidden sm:block"></span>
                    <span className="hidden sm:inline">
                      {t("tactics.formation")}
                    </span>
                  </div>
                  <button
                    onClick={onToggleFormationEditor}
                    className="text-slate-400 hover:text-white transition-all duration-300 w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/10 text-[10px]"
                    title={t("tactics.editFormations")}
                    aria-label={t("tactics.editFormations")}
                  >
                    <span aria-hidden="true">✏️</span>
                  </button>
                </div>
                <div className="flex flex-1 items-center rounded-b-[22px] bg-[linear-gradient(180deg,rgba(2,6,23,0.76)_0%,rgba(2,6,23,0.9)_100%)] p-0.5 sm:px-0.5 sm:py-1">
                  <div className="relative w-full">
                    <select
                      value={currentFormationId ?? ""}
                      onChange={(e) => onChangeFormation(e.target.value)}
                      disabled={isExecuting}
                      aria-label={t("a11y.formationSelector")}
                      className={`pointer-events-auto w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(37,99,235,0.98)_0%,rgba(29,78,216,0.98)_100%)] px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] outline-none transition-all duration-300 ${isExecuting ? "cursor-not-allowed opacity-40" : "hover:brightness-110 focus:border-blue-300/70 focus:ring-2 focus:ring-blue-400/30"}`}
                    >
                      {gameModeFormations
                        .filter((f) => availableFormationIds.has(f.id.value))
                        .map((f) => (
                          <option
                            key={f.id.value}
                            value={f.id.value}
                            className="bg-slate-900 text-slate-100"
                          >
                            {f.name}
                          </option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/80">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Undo / Redo - sm+のみ表示 (extracted in Phase 3) */}
              <RightHistoryPanel
                canUndo={canUndo}
                canRedo={canRedo}
                undoRedoEnabled={undoRedoEnabled}
                onUndo={onUndo}
                onRedo={onRedo}
                t={t}
              />
            </div>

            {/* トグルボタングリッド（モバイル: 2列、sm以上: 1列） */}
            <div className={RAIL_ROW_CLASS}>
              {/* 敵配置ボタン */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${
                  isOpponentSelectorActive
                    ? "border-red-400/60 ring-red-400/20 shadow-[0_10px_24px_rgba(127,29,29,0.28),0_2px_6px_rgba(2,6,23,0.12)]"
                    : "border-slate-700/45"
                }`}
              >
                <div className="flex items-center">
                  <button
                    onClick={opponentsHook.toggleOpponentPlacement}
                    data-opponent-selector-trigger="true"
                    className={`${RAIL_BUTTON_CLASS} ${
                      isOpponentSelectorActive
                        ? "bg-gradient-to-r from-red-600/28 to-red-500/16 text-red-100 hover:from-red-600/34 hover:to-red-500/20"
                        : RAIL_BUTTON_INACTIVE_CLASS
                    }`}
                    aria-label={t("tactics.opponents")}
                    aria-expanded={showOpponentSelector}
                  >
                    <span className="text-xs" aria-hidden="true">
                      👤
                    </span>
                    <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                      {t("tactics.opponents")}
                    </span>
                    {isOpponentSelectorActive && (
                      <span className="inline-block h-2 w-2 rounded-full bg-red-300 shadow-[0_0_10px_rgba(252,165,165,0.75)]" />
                    )}
                    {opponentsHook.opponents.length > 0 && (
                      <span className={COUNT_BADGE_CLASS}>
                        {opponentsHook.opponents.length}/
                        {pitchConfig.maxOpponents}
                      </span>
                    )}
                  </button>
                </div>
                <div className="border-t border-slate-700/50">
                  <button
                    onClick={() =>
                      opponentsHook.setShowOpponentNames(
                        !opponentsHook.showOpponentNames,
                      )
                    }
                    disabled={opponentsHook.opponents.length === 0}
                    className={`w-full min-h-[38px] py-1 px-1.5 sm:py-1.5 sm:px-2.5 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 text-xs ${opponentsHook.opponents.length === 0 ? "opacity-30 cursor-not-allowed" : opponentsHook.showOpponentNames ? "text-slate-200 hover:bg-white/[0.06]" : "text-slate-500 hover:bg-white/[0.04]"}`}
                  >
                    <span className="text-[10px] sm:text-xs">
                      {opponentsHook.showOpponentNames ? "👁️" : "👁️‍🗨️"}
                    </span>
                    <span className="font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                      {t("tactics.names.opponent")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Undo / Redo - モバイルのみ表示 */}
              <div
                className={`sm:hidden ${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} flex flex-col min-h-[36px] justify-center`}
              >
                <div className="py-0.5 px-1 flex items-center justify-center gap-2 flex-1">
                  <button
                    onClick={onUndo}
                    disabled={!canUndo || !undoRedoEnabled}
                    className={`flex-1 min-h-[26px] rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center ${
                      canUndo && undoRedoEnabled
                        ? "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5 hover:scale-105"
                        : "bg-white/[0.03] border border-white/5 opacity-25 cursor-not-allowed"
                    }`}
                    title={`${t("tactics.undo")} (${navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Z)`}
                    aria-label={t("tactics.undo")}
                  >
                    <span aria-hidden="true">↩️</span>
                  </button>
                  <button
                    onClick={onRedo}
                    disabled={!canRedo || !undoRedoEnabled}
                    className={`flex-1 min-h-[26px] rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center ${
                      canRedo && undoRedoEnabled
                        ? "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5 hover:scale-105"
                        : "bg-white/[0.03] border border-white/5 opacity-25 cursor-not-allowed"
                    }`}
                    title={`${t("tactics.redo")} (${navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Shift+Z)`}
                    aria-label={t("tactics.redo")}
                  >
                    <span aria-hidden="true">↪️</span>
                  </button>
                </div>
              </div>

              {/* 名前表示切り替え */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS}`}
              >
                <div className="flex items-stretch">
                  <button
                    onClick={onTogglePlayerNames}
                    className={`${RAIL_BUTTON_CLASS} ${showPlayerNames ? "bg-white/[0.08] text-white hover:bg-white/[0.12]" : RAIL_BUTTON_INACTIVE_CLASS}`}
                    aria-label={
                      showPlayerNames
                        ? t("tactics.hideNames")
                        : t("tactics.showNames")
                    }
                  >
                    <span className="text-xs" aria-hidden="true">
                      {showPlayerNames ? "👁️" : "👁️‍🗨️"}
                    </span>
                    <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                      {showPlayerNames
                        ? t("tactics.hideNames")
                        : t("tactics.showNames")}
                    </span>
                  </button>
                  <button
                    onClick={onToggleNameSettings}
                    className={`${SPLIT_ACTION_CLASS} flex items-center`}
                    aria-label={
                      showNameSettings
                        ? t("a11y.closePanel")
                        : t("tactics.showNames")
                    }
                    aria-expanded={showNameSettings}
                  >
                    <span className="text-[10px]" aria-hidden="true">
                      {showNameSettings ? "▲" : "▼"}
                    </span>
                  </button>
                </div>
                {showNameSettings && showPlayerNames && (
                  <div className="border-t border-slate-700/50">
                    {/* ラベル固定 */}
                    <div className="px-3 py-2 border-b border-slate-700/40">
                      <button
                        onClick={onToggleLabelFixed}
                        className={`w-full text-[10px] font-semibold py-1.5 rounded transition-all duration-150 flex items-center justify-center gap-1.5 ${
                          labelFixed
                            ? "bg-blue-500/70 text-white"
                            : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.10] hover:text-slate-200"
                        }`}
                      >
                        {t("tactics.labelFixed")}
                      </button>
                    </div>
                    {playersData.map((player, index) => {
                      const isHidden = hiddenPlayerIndices.has(index);
                      const pos = formationData[index];
                      const bgColor = getPositionBg(pos?.cat);
                      return (
                        <button
                          key={index}
                          onClick={() => onTogglePlayerHidden(index)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 transition-all duration-200 ${isHidden ? "text-slate-500 hover:bg-white/[0.03]" : "text-slate-300 hover:bg-white/[0.06]"}`}
                        >
                          <div
                            className={`w-5 h-5 ${bgColor} rounded flex items-center justify-center text-white text-[9px] font-bold ${isHidden ? "opacity-30" : ""}`}
                          >
                            {player.number}
                          </div>
                          <span
                            className={`text-xs truncate flex-1 text-left ${isHidden ? "line-through opacity-50" : ""}`}
                          >
                            {player.name}
                          </span>
                          <span className="text-xs">
                            {isHidden ? "👁️‍🗨️" : "👁️"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 番号表示切り替え */}
              <button
                onClick={onTogglePlayerNumbers}
                className={`${SECONDARY_TOGGLE_BUTTON_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${showPlayerNumbers ? "" : "border-orange-500/50 bg-[linear-gradient(180deg,rgba(154,52,18,0.30)_0%,rgba(120,40,14,0.30)_100%)] text-orange-300 hover:border-orange-400/60"}`}
                aria-label={
                  showPlayerNumbers
                    ? t("tactics.hideNumbers")
                    : t("tactics.showNumbers")
                }
              >
                <span className="text-xs" aria-hidden="true">
                  {showPlayerNumbers ? "🔢" : "🔤"}
                </span>
                <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                  {showPlayerNumbers
                    ? t("tactics.hideNumbers")
                    : t("tactics.showNumbers")}
                </span>
              </button>

              {/* 背景設定 */}
              <BackgroundSettingsPanel
                bgSettings={bgSettings}
                t={t}
                className={RAIL_PANEL_WIDTH_CLASS}
              />

              {/* カード表示切り替え */}
              <button
                onClick={onToggleCards}
                className={`${SECONDARY_TOGGLE_BUTTON_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${showCards ? "border-slate-400/55 bg-[linear-gradient(180deg,rgba(51,65,85,0.95)_0%,rgba(30,41,59,0.95)_100%)] text-white hover:border-slate-300/60" : ""}`}
                aria-label={
                  showCards ? t("tactics.hideCards") : t("tactics.showCards")
                }
              >
                <span className="text-xs" aria-hidden="true">
                  {showCards ? "🟨" : "🚫"}
                </span>
                <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                  {t("tactics.card")}
                </span>
              </button>

              {/* マーカーサイズ */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} flex items-center min-h-[36px] justify-between p-0.5`}
              >
                <span className="py-1 px-2 text-[10px] sm:text-[11px] font-semibold text-slate-400 border-r border-slate-700/50 tracking-[0.12em] uppercase whitespace-nowrap hidden sm:block">
                  {t("tactics.size")}
                </span>
                <div className="flex items-center gap-1 flex-1 h-full">
                  {([0.9, 1.0, 1.1] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onMarkerScaleChange(s)}
                      className={`flex-1 min-h-[26px] py-1 px-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center ${playerMarkerScale === s ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-300"}`}
                      aria-label={t("a11y.markerSize").replace(
                        "{size}",
                        s === 0.9 ? "S" : s === 1.0 ? "M" : "L",
                      )}
                    >
                      {s === 0.9 ? "S" : s === 1.0 ? "M" : "L"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 戦術フローボタン */}
              {activeTactic && (
                <div
                  className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS}`}
                >
                  <button
                    onClick={onToggleFlowchart}
                    className={`${RAIL_BUTTON_CLASS} ${showFlowchart ? "bg-white/[0.08] text-white hover:bg-white/[0.12]" : RAIL_BUTTON_INACTIVE_CLASS}`}
                    aria-label={t("tactics.tacticsFlow")}
                  >
                    <span className="text-xs" aria-hidden="true">
                      📊
                    </span>
                    <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                      {t("tactics.tacticsFlow")}
                    </span>
                  </button>
                </div>
              )}

              {/* プレイヤービューボタン */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${playerView.playerViewEnabled ? "!border-amber-500/50" : "border-slate-700/45"}`}
              >
                <button
                  onClick={playerView.togglePlayerView}
                  className={`${RAIL_BUTTON_CLASS} ${playerView.playerViewEnabled ? "!bg-amber-600/18 !text-amber-200 hover:!bg-amber-600/24" : RAIL_BUTTON_INACTIVE_CLASS}`}
                  aria-label={t("tactics.playerView")}
                  aria-pressed={playerView.playerViewEnabled}
                >
                  <span className="text-xs" aria-hidden="true">
                    📹
                  </span>
                  <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                    {t("tactics.playerView")}
                  </span>
                </button>
              </div>

              {/* ボール配置ボタン */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${ballHook.ballPlacementMode ? "border-yellow-500/50" : "border-slate-700/45"}`}
              >
                <div className="flex items-center">
                  <button
                    onClick={ballHook.toggleBallPlacement}
                    className={`${RAIL_BUTTON_CLASS} ${ballHook.ballPlacementMode ? "bg-yellow-600/18 text-yellow-200 hover:bg-yellow-600/24" : ballHook.ballPosition ? "bg-white/[0.08] text-slate-100 hover:bg-white/[0.12]" : RAIL_BUTTON_INACTIVE_CLASS}`}
                    aria-label={t("tactics.ball")}
                  >
                    <span className="text-xs" aria-hidden="true">
                      ⚽
                    </span>
                    <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                      {t("tactics.ball")}
                    </span>
                  </button>
                  {ballHook.ballPosition && (
                    <button
                      onClick={ballHook.handleBallRemove}
                      className={SPLIT_ACTION_CLASS}
                      title={t("tactics.ball.remove")}
                      aria-label={t("tactics.ball.remove")}
                    >
                      <span className="text-[10px]" aria-hidden="true">
                        ✕
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* ライン描画ボタン */}
              <ConnectionLinesButton
                connLines={connLines}
                t={t}
                className={RAIL_PANEL_WIDTH_CLASS}
              />

              {/* スケッチボタン */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${sketchMode ? "border-pink-500/50" : "border-slate-700/45"}`}
              >
                <button
                  onClick={onToggleSketchMode}
                  data-sketch-toggle="true"
                  className={`${RAIL_BUTTON_CLASS} ${sketchMode ? "bg-pink-600/18 text-pink-200 hover:bg-pink-600/24" : RAIL_BUTTON_INACTIVE_CLASS}`}
                  aria-label={t("tactics.sketch")}
                >
                  <span className="text-xs" aria-hidden="true">
                    🖊️
                  </span>
                  <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
                    {t("tactics.sketch")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
