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
} from "./right-controls";

const SECONDARY_PANEL_CLASS =
  "bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.9)_100%)] backdrop-blur-xl rounded-[20px] border border-slate-600/35 shadow-[0_6px_16px_rgba(2,6,23,0.12),0_1px_3px_rgba(2,6,23,0.08)] overflow-hidden ring-1 ring-white/5";
const SECONDARY_TOGGLE_BUTTON_CLASS =
  "relative min-h-[32px] py-0.5 px-1 sm:min-h-[30px] sm:py-0.5 sm:px-1.25 xl:min-h-[36px] xl:py-1.5 xl:px-2.5 rounded-[20px] border border-slate-600/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.9)_100%)] text-slate-300 shadow-[0_6px_16px_rgba(2,6,23,0.12),0_1px_3px_rgba(2,6,23,0.08)] ring-1 ring-white/5 transition-all duration-300 flex items-center justify-center gap-1.5 hover:-translate-y-[1px] hover:border-slate-500/50 hover:text-white";
const RAIL_BUTTON_CLASS =
  "relative w-full min-h-[32px] py-0.5 px-1 sm:min-h-[30px] sm:py-0.5 sm:px-1.25 xl:min-h-[36px] xl:py-1.5 xl:px-2.5 transition-all duration-300 flex items-center justify-center gap-1.5 text-slate-300 hover:bg-white/[0.06] hover:text-white";
const RAIL_BUTTON_INACTIVE_CLASS = "bg-transparent";
const SPLIT_ACTION_CLASS =
  "pl-2 pr-3.5 sm:pl-2.5 sm:pr-4.5 xl:pl-3.5 xl:pr-5.5 transition-all duration-300 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 border-l border-slate-700/50 flex items-center justify-center font-bold text-xs self-stretch";
const COUNT_BADGE_CLASS =
  "text-[9px] bg-white/8 text-slate-200 px-1.5 py-0.5 rounded-full border border-white/10";
const RAIL_LABEL_CLASS =
  "hidden sm:inline text-[11px] xl:text-xs font-semibold tracking-wide whitespace-nowrap";
const HEADER_ACTION_CARD_HEIGHT_CLASS = "h-[54px] sm:h-[54px] xl:h-[72px]";
const RAIL_PANEL_WIDTH_CLASS = "w-full sm:w-[128px] xl:w-[148px]";
const RAIL_ROW_CLASS =
  "grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-1.5 items-start sm:justify-items-end w-full sm:w-[128px] xl:w-[148px]";

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
  t,
}: RightControlsColumnProps) {
  const currentFormation = gameModeFormations.find(
    (f) => f.id.value === currentFormationId,
  );
  const currentFormationLabel = currentFormation?.name ?? "4-3-3";
  const formationSelectWidthCh = Math.max(
    9,
    Math.min(currentFormationLabel.length + 5, 14),
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
      data-testid="right-controls-rail"
      className="absolute top-2 right-2 z-10 flex flex-col gap-1 sm:top-3 sm:right-3 sm:gap-1.5 items-end max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] pointer-events-none [&>*]:pointer-events-auto"
    >
      {/* フォーメーション選択 + Undo/Redo + 開閉トグル */}
      <div className="flex items-start gap-2 [&>*]:pointer-events-auto">
        {/* 右コントロール群の開閉トグル */}
        <button
          onClick={onToggleRightControls}
          className={`bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] backdrop-blur-xl rounded-[20px] border border-slate-500/45 ring-1 ring-white/5 shadow-[0_6px_16px_rgba(2,6,23,0.14),0_1px_3px_rgba(2,6,23,0.08)] transition-all duration-300 flex items-center justify-center h-[38px] w-[32px] sm:h-[36px] sm:w-[30px] xl:h-[46px] xl:w-[36px] ${showRightControls ? "text-white hover:-translate-y-[1px] hover:border-slate-400/60" : "text-slate-400 hover:-translate-y-[1px] hover:border-slate-500/60 hover:text-slate-200"}`}
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
          <div
            data-testid="right-controls-scroll-area"
            className="flex max-h-[calc(100vh-8.5rem-env(safe-area-inset-bottom,0px))] flex-col items-end gap-1 overflow-y-auto overflow-x-hidden pr-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] custom-scrollbar sm:max-h-[calc(100vh-9.5rem-env(safe-area-inset-bottom,0px))] sm:gap-1.5 sm:pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]"
          >
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

            {/* フォーメーション */}
            <div className="flex w-full sm:w-auto items-stretch justify-end gap-2 self-end">
              {/* フォーメーション */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${HEADER_ACTION_CARD_HEIGHT_CLASS} flex w-auto shrink-0 items-center gap-0.5 bg-[linear-gradient(180deg,rgba(2,6,23,0.76)_0%,rgba(2,6,23,0.9)_100%)] px-[3px] py-[3px] sm:px-[3px] sm:py-[3px] xl:px-0.5 xl:py-0.5`}
              >
                <button
                  onClick={onToggleFormationEditor}
                  className="flex h-[46px] w-[24px] sm:h-[46px] sm:w-[24px] xl:h-[62px] xl:w-[28px] items-center justify-center rounded-[18px] text-[9px] text-slate-500 transition-all duration-300 hover:bg-white/10 hover:text-slate-300"
                  title={t("tactics.editFormations")}
                  aria-label={t("tactics.editFormations")}
                >
                  <span aria-hidden="true">✏️</span>
                </button>
                <div className="relative">
                  <select
                    value={currentFormationId ?? ""}
                    onChange={(e) => onChangeFormation(e.target.value)}
                    disabled={isExecuting}
                    aria-label={t("a11y.formationSelector")}
                    className={`pointer-events-auto h-[46px] sm:h-[46px] xl:h-[62px] cursor-pointer appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(37,99,235,0.98)_0%,rgba(29,78,216,0.98)_100%)] pl-3 pr-8 py-0.5 text-center text-xs sm:text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] outline-none transition-all duration-300 ${isExecuting ? "cursor-not-allowed opacity-40" : "hover:brightness-110 focus:border-blue-300/70 focus:ring-2 focus:ring-blue-400/30"}`}
                    style={{ width: `${formationSelectWidthCh}ch` }}
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

            {/* トグルボタングリッド（モバイル: 2列、sm以上: 1列） */}
            <div className={RAIL_ROW_CLASS}>
              {/* 敵配置ボタン */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${
                  isOpponentSelectorActive
                    ? "border-red-400/60 ring-red-400/20 shadow-[0_10px_24px_rgba(127,29,29,0.28),0_2px_6px_rgba(2,6,23,0.12)]"
                    : "border-slate-700/45"
                } flex items-stretch sm:block`}
              >
                <div className="flex flex-1 items-center sm:flex-none">
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
                    <span className={RAIL_LABEL_CLASS}>
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
                <div className="flex flex-1 items-stretch border-l border-slate-700/50 sm:border-l-0 sm:border-t">
                  {/* 相手名前表示切り替え */}
                  <button
                    onClick={() =>
                      opponentsHook.setShowOpponentNames(
                        !opponentsHook.showOpponentNames,
                      )
                    }
                    disabled={opponentsHook.opponents.length === 0}
                    className={`flex-1 min-h-[32px] py-1 px-1 sm:min-h-[30px] sm:px-1.25 transition-all duration-300 flex items-center justify-center gap-1 text-xs border-r border-slate-700/50 ${opponentsHook.opponents.length === 0 ? "opacity-30 cursor-not-allowed" : opponentsHook.showOpponentNames ? "text-slate-200 hover:bg-white/[0.06]" : "text-slate-500 hover:bg-white/[0.04]"}`}
                  >
                    <span
                      className="sm:hidden text-[11px] font-bold font-mono leading-none"
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                    <span className={RAIL_LABEL_CLASS}>
                      {t("tactics.names.label")}
                    </span>
                  </button>
                  {/* 相手番号表示切り替え */}
                  <button
                    onClick={() =>
                      opponentsHook.setShowOpponentNumbers(
                        !opponentsHook.showOpponentNumbers,
                      )
                    }
                    disabled={opponentsHook.opponents.length === 0}
                    className={`flex-1 min-h-[32px] py-1 px-1 sm:min-h-[30px] sm:px-1.25 transition-all duration-300 flex items-center justify-center gap-1 text-xs ${opponentsHook.opponents.length === 0 ? "opacity-30 cursor-not-allowed" : opponentsHook.showOpponentNumbers ? "text-slate-200 hover:bg-white/[0.06]" : "text-slate-500 hover:bg-white/[0.04]"}`}
                  >
                    <span
                      className="sm:hidden text-[11px] font-bold font-mono leading-none"
                      aria-hidden="true"
                    >
                      123
                    </span>
                    <span className={RAIL_LABEL_CLASS}>
                      {t("tactics.numbers.label")}
                    </span>
                  </button>
                </div>
              </div>

              {/* 名前/番号表示切り替え - 横並び */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS}`}
              >
                <div className="flex items-stretch">
                  {/* 名前表示切り替え */}
                  <button
                    onClick={onTogglePlayerNames}
                    className={`flex-1 min-h-[32px] py-1 px-1 sm:min-h-[30px] sm:px-1.25 transition-all duration-300 flex items-center justify-center gap-1 ${showPlayerNames ? "text-slate-200 hover:bg-white/[0.06] hover:text-white" : "text-slate-500 hover:bg-white/[0.06] hover:text-white"}`}
                    aria-label={
                      showPlayerNames
                        ? t("tactics.hideNames")
                        : t("tactics.showNames")
                    }
                  >
                    <span
                      className="sm:hidden text-[11px] font-bold font-mono leading-none"
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                    <span className={RAIL_LABEL_CLASS}>
                      {t("tactics.names.label")}
                    </span>
                  </button>

                  {/* 設定ボタン（中央） */}
                  <button
                    onClick={onToggleNameSettings}
                    className="py-1 px-1.25 sm:px-1.5 transition-all duration-300 text-slate-500 hover:text-white hover:bg-white/[0.06] border-x border-slate-700/50 flex items-center justify-center"
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

                  {/* 番号表示切り替え */}
                  <button
                    onClick={onTogglePlayerNumbers}
                    className={`flex-1 min-h-[32px] py-1 px-1 sm:min-h-[30px] sm:px-1.25 transition-all duration-300 flex items-center justify-center gap-1 ${showPlayerNumbers ? "text-slate-200 hover:bg-white/[0.06] hover:text-white" : "text-slate-500 hover:bg-white/[0.06] hover:text-white"}`}
                    aria-label={
                      showPlayerNumbers
                        ? t("tactics.hideNumbers")
                        : t("tactics.showNumbers")
                    }
                  >
                    <span
                      className="sm:hidden text-[11px] font-bold font-mono leading-none"
                      aria-hidden="true"
                    >
                      123
                    </span>
                    <span className={RAIL_LABEL_CLASS}>
                      {t("tactics.numbers.label")}
                    </span>
                  </button>
                </div>

                {showNameSettings && (
                  <div className="border-t border-slate-700/50">
                    {/* ラベル固定（名前表示中のみ） */}
                    {showPlayerNames && (
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
                    )}
                    {playersData.map((player, index) => {
                      const isException = hiddenPlayerIndices.has(index);
                      const isVisible = showPlayerNames
                        ? !isException
                        : isException;
                      const pos = formationData[index];
                      const bgColor = getPositionBg(pos?.cat);
                      return (
                        <button
                          key={index}
                          onClick={() => onTogglePlayerHidden(index)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 transition-all duration-200 ${isVisible ? "text-slate-300 hover:bg-white/[0.06]" : "text-slate-500 hover:bg-white/[0.03]"}`}
                        >
                          <div
                            className={`w-5 h-5 ${bgColor} rounded flex items-center justify-center text-white text-[9px] font-bold ${isVisible ? "" : "opacity-30"}`}
                          >
                            {player.number}
                          </div>
                          <span
                            className={`text-[11px] xl:text-xs truncate flex-1 text-left ${isVisible ? "" : "line-through opacity-50"}`}
                          >
                            {player.name}
                          </span>
                          <span className="text-xs">
                            {isVisible ? "👁️" : "👁️‍🗨️"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

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
                <span className={RAIL_LABEL_CLASS}>{t("tactics.card")}</span>
              </button>

              {/* マーカーサイズ */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} flex items-center min-h-[32px] sm:min-h-[30px] xl:min-h-[36px] p-[3px] sm:p-[3px] xl:p-0.5`}
              >
                <div className="flex items-center gap-1 flex-1 h-full">
                  {([0.9, 1.0, 1.1] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onMarkerScaleChange(s)}
                      className={`flex-1 min-h-[26px] py-1 px-1.5 text-[10px] sm:text-[11px] xl:text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center ${playerMarkerScale === s ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-300"}`}
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
                    <span className={RAIL_LABEL_CLASS}>
                      {t("tactics.tacticsFlow")}
                    </span>
                  </button>
                </div>
              )}

              {/* プレイヤービューボタン */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${playerView.playerViewEnabled ? "!border-amber-500/45" : "border-slate-700/45"}`}
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
                  <span className={RAIL_LABEL_CLASS}>
                    {t("tactics.playerView")}
                  </span>
                </button>
              </div>

              {/* ボール配置ボタン */}
              <div
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${ballHook.ballPlacementMode ? "!border-yellow-500/45" : "border-slate-700/45"} ${ballHook.ballPosition ? "bg-white/[0.08]" : ""}`}
              >
                <div className="flex items-stretch">
                  <button
                    onClick={ballHook.toggleBallPlacement}
                    className={`${RAIL_BUTTON_CLASS} ${ballHook.ballPlacementMode ? "bg-yellow-600/18 text-yellow-200 hover:bg-yellow-600/24" : ballHook.ballPosition ? "text-slate-100 hover:bg-white/[0.06]" : RAIL_BUTTON_INACTIVE_CLASS}`}
                    aria-label={t("tactics.ball")}
                  >
                    <span className="text-xs" aria-hidden="true">
                      ⚽
                    </span>
                    <span className={RAIL_LABEL_CLASS}>
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
                      ✕
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
                className={`${SECONDARY_PANEL_CLASS} ${RAIL_PANEL_WIDTH_CLASS} ${sketchMode ? "!border-pink-500/45" : "border-slate-700/45"}`}
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
                  <span className={RAIL_LABEL_CLASS}>
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
