/**
 * @module TacticsHeader
 * @description タクティクスビューアーのヘッダーコンポーネント。チーム名・フォーメーション名・ナビゲーションを表示する。
 *
 * 使用するContext:
 * - TacticsUIContext: ヘッダー表示/非表示、キャプチャモード
 * - TacticsTeamContext: チーム名・フォーメーション名・チーム選択
 * - TacticsExecutionContext: プレーモード切替
 */
import { memo } from "react";
import { getCountryInfo, IS_ELECTRON } from "@shared/constants";
import { GAME_MODES, type GameMode } from "@shared/types/GameMode";
import { useTacticsUI } from "@presentation/contexts/TacticsUIContext";
import { useTacticsTeam } from "@presentation/contexts/TacticsTeamContext";
import { useTacticsExecution } from "@presentation/contexts/TacticsExecutionContext";
import { useLanguage } from "@presentation/contexts/LanguageContext";

export const TacticsHeader = memo(function TacticsHeader() {
  const { ui } = useTacticsUI();
  const { selectedTeam, currentFormation, teamMgmt } = useTacticsTeam();
  const {
    playModePhase,
    tOrch,
    opponentsHook,
    ballHook,
    connLines,
    playerView,
    multiSelect,
  } = useTacticsExecution();
  const { t, tDynamic, language } = useLanguage();

  const { captureMode, headerVisible } = ui;
  const isHidden = captureMode || !headerVisible;

  const handleBackToTeamSelection = () => {
    tOrch.clearManualPositions();
    tOrch.resetTactic();
    connLines.clearConnectionLines();
    connLines.resetLineDrawingState();
    ballHook.setBallPosition(null);
    ballHook.setBallPlacementMode(false);
    opponentsHook.clearOpponents();
    opponentsHook.setOpponentPlacementMode(false);
    opponentsHook.setOpponentTeamId(null);
    opponentsHook.setSelectedOpponentPlayerId(null);
    opponentsHook.setShowOpponentFormationSelect(false);
    opponentsHook.setOpponentFormationId(null);
    opponentsHook.setShowOpponentSquadBuilder(false);
    playerView.exitPlayerView();
    multiSelect.clearSelection();
    multiSelect.clearRect();
    teamMgmt.setCustomSquad([]);
    teamMgmt.resetSubstitutions();
    teamMgmt.setShowTeamSelection(true);
  };

  return (
    <>
      {/* ヘッダー非表示時の表示ボタン */}
      {isHidden && !captureMode && (
        <button
          onClick={() => ui.setHeaderVisible((prev) => !prev)}
          className="fixed top-1 left-1/2 -translate-x-1/2 z-50 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-b-xl px-3 py-0.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 shadow-lg"
          aria-label="Show header"
        >
          <span className="text-xs" aria-hidden="true">
            ▼
          </span>
        </button>
      )}
      <header
        className={`py-2 sm:py-2.5 px-3 sm:px-6 ${IS_ELECTRON ? "pl-14 sm:pl-20" : "pl-10 sm:pl-6"} bg-slate-950/90 backdrop-blur-md border-b border-slate-700/50 shadow-lg relative overflow-hidden ${isHidden ? "hidden" : ""}`}
        {...(IS_ELECTRON && {
          style: { WebkitAppRegion: "drag" } as React.CSSProperties,
        })}
      >
        {/* チームカラーのアクセントライン */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${selectedTeam.headerGradient}`}
        ></div>

        {/* 左側ボタン群 */}
        <div
          className={`absolute ${IS_ELECTRON ? "left-10 sm:left-16 xl:left-20" : "left-2 sm:left-4 xl:left-6"} top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 sm:gap-3`}
          {...(IS_ELECTRON && {
            style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
          })}
        >
          <button
            onClick={handleBackToTeamSelection}
            className="px-2 xl:px-3 py-1.5 hover:bg-slate-800 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5"
            aria-label={t("tactics.teamSelection")}
          >
            <span aria-hidden="true">←</span>
            <span className="hidden xl:inline tracking-wide">
              {t("tactics.teamSelection")}
            </span>
          </button>
          <div className="w-px h-5 bg-slate-700/50" />
          <div className="relative">
            <select
              value={playModePhase.gameMode}
              onChange={(e) =>
                playModePhase.handleGameModeChange(e.target.value as GameMode)
              }
              aria-label={t("a11y.gameModeSelector")}
              className="appearance-none bg-slate-800/60 border border-slate-700/50 rounded-lg text-[10px] font-bold tracking-wider uppercase text-slate-200 pl-2.5 pr-6 py-1.5 cursor-pointer focus:outline-none hover:bg-slate-700/60 transition-colors duration-200"
            >
              {GAME_MODES.map((mode) => (
                <option
                  key={mode}
                  value={mode}
                  className="bg-slate-900 normal-case"
                >
                  {tDynamic(`tactics.gameMode.${mode}`)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">
              ▼
            </span>
          </div>
        </div>

        {/* 右側ボタン群 */}
        <div
          className="absolute right-2 sm:right-4 xl:right-6 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 sm:gap-1.5"
          {...(IS_ELECTRON && {
            style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
          })}
        >
          <button
            onClick={() => ui.setShowPlayerManagement(true)}
            className="px-2 xl:px-3 py-1.5 hover:bg-slate-800 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5"
            aria-label={t("tactics.playerManagement")}
          >
            <span aria-hidden="true">👥</span>
            <span className="hidden xl:inline tracking-wide">
              {t("tactics.playerManagement")}
            </span>
          </button>
          <button
            onClick={() => ui.setShowSquadBuilder(true)}
            className="px-2 xl:px-3 py-1.5 hover:bg-slate-800 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5"
            aria-label={t("tactics.squadBuilder")}
          >
            <span aria-hidden="true">⚽</span>
            <span className="hidden xl:inline tracking-wide">
              {t("tactics.squadBuilder")}
            </span>
          </button>
          <div className="w-px h-5 bg-slate-700/50"></div>
          <button
            onClick={() => ui.setCaptureMode((prev) => !prev)}
            className={`px-2 xl:px-3 py-1.5 rounded-lg transition-all duration-200 text-sm flex items-center gap-1.5 ${
              captureMode
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title={t("tactics.captureMode")}
            aria-label={t("tactics.captureMode")}
          >
            <span aria-hidden="true">📸</span>
            <span className="hidden xl:inline tracking-wide">
              {t("tactics.captureMode")}
            </span>
          </button>
          <div className="w-px h-5 bg-slate-700/50"></div>
          <button
            onClick={() => ui.setHeaderVisible((prev) => !prev)}
            className="px-2 xl:px-3 py-1.5 hover:bg-slate-800 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5"
            aria-label="Hide header"
          >
            <span aria-hidden="true">▲</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1">
          {/* プレーモード切替タブ */}
          <div
            className="flex items-center gap-0.5 bg-slate-800/60 rounded-lg p-0.5 border border-slate-700/50"
            {...(IS_ELECTRON && {
              style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
            })}
          >
            <button
              onClick={() => playModePhase.handlePlayModeChange("field")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${
                playModePhase.playMode === "field"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {t("tactics.mode.fieldPlay")}
            </button>
            <button
              onClick={() => playModePhase.handlePlayModeChange("setPlay")}
              className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${
                playModePhase.playMode === "setPlay"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {t("tactics.mode.setPlay")}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {selectedTeam.country && (
              <div className="text-xl sm:text-2xl hidden sm:block">
                {getCountryInfo(selectedTeam.country, language).flag}
              </div>
            )}
            <div className="text-center">
              <h1 className="text-sm sm:text-lg font-bold text-slate-100 tracking-tight truncate max-w-[140px] sm:max-w-none">
                {selectedTeam.name}
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-light tracking-wide truncate max-w-[140px] sm:max-w-none">
                {selectedTeam.subtitle} • {currentFormation.name}
              </p>
            </div>
            {selectedTeam.country && (
              <div className="text-xl sm:text-2xl hidden sm:block">
                {getCountryInfo(selectedTeam.country, language).flag}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
});
