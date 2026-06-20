/**
 * @module OpponentSquadSelector
 * @description 相手チームスカッド選択コンポーネント。チーム・フォーメーション選択と選手配置操作を表示する。
 */
import { memo, type ReactNode } from "react";
import type { Team } from "@domain/entities/Team";
import type { useOpponents } from "@presentation/hooks/field";
import { TEAM_HEADER_GRADIENT_OPTIONS } from "@shared/constants/teamHeaderGradients";
import type { TranslationFn } from "../types";
import {
  RIGHT_RAIL_POPUP_HEADER_ACTIONS_CLASS,
  RIGHT_RAIL_POPUP_HEADER_CLASS,
  RIGHT_RAIL_POPUP_HEADER_SUBTITLE_CLASS,
  RIGHT_RAIL_POPUP_HEADER_TITLE_CLASS,
} from "../rightRailPopupLayout";

interface OpponentSquadSelectorProps {
  opponentsHook: ReturnType<typeof useOpponents>;
  teams: Team[] | undefined;
  selectedTeamId: string | null;
  t: TranslationFn;
  className?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  headerActions?: ReactNode;
}

export const OpponentSquadSelector = memo(function OpponentSquadSelector({
  opponentsHook,
  teams,
  selectedTeamId,
  t,
  className = "",
  headerTitle,
  headerSubtitle,
  headerActions,
}: OpponentSquadSelectorProps) {
  if (!teams || teams.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.94)_100%)] backdrop-blur-xl rounded-[24px] border border-slate-600/40 shadow-[0_18px_40px_rgba(2,6,23,0.32),0_4px_12px_rgba(2,6,23,0.16)] ring-1 ring-white/5 overflow-hidden ${className}`}
    >
      {(headerTitle || headerActions) && (
        <div className={RIGHT_RAIL_POPUP_HEADER_CLASS}>
          <div className="min-w-0">
            {headerTitle && (
              <div className={RIGHT_RAIL_POPUP_HEADER_TITLE_CLASS}>
                {headerTitle}
              </div>
            )}
            {headerSubtitle && (
              <div className={RIGHT_RAIL_POPUP_HEADER_SUBTITLE_CLASS}>
                {headerSubtitle}
              </div>
            )}
          </div>
          <div className={RIGHT_RAIL_POPUP_HEADER_ACTIONS_CLASS}>
            {headerActions}
          </div>
        </div>
      )}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <label className="text-[10px] text-slate-300/90 font-semibold uppercase tracking-[0.18em]">
          {t("tactics.opponents.team")}
        </label>
        <div className="relative mt-2">
          <select
            value={opponentsHook.opponentTeamId ?? ""}
            onChange={(e) => {
              const val = e.target.value || null;
              opponentsHook.setOpponentTeamId(val);
              opponentsHook.setSelectedOpponentPlayerId(null);
              opponentsHook.setShowOpponentFormationSelect(false);
              opponentsHook.setShowOpponentSquadBuilder(false);
              opponentsHook.setOpponentFormationId(null);
            }}
            className="w-full appearance-none bg-white/[0.05] text-slate-200 text-xs rounded-xl pl-3 pr-14 py-2.5 border border-white/8 focus:outline-none focus:border-red-500/50"
          >
            <option value="">{t("tactics.opponents.noTeam")}</option>
            {teams
              .filter((t2) => t2.id.value !== selectedTeamId)
              .map((t2) => (
                <option key={t2.id.value} value={t2.id.value}>
                  {t2.name}
                </option>
              ))}
          </select>
          <span
            className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-slate-300"
            aria-hidden="true"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.5 5.75L8 10.25L12.5 5.75"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
      {!opponentsHook.opponentTeam && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <label className="text-[10px] text-slate-300/90 font-semibold uppercase tracking-[0.18em]">
            {t("tactics.opponents.markerColor")}
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TEAM_HEADER_GRADIENT_OPTIONS.map((gradient) => (
              <button
                key={gradient.value}
                onClick={() =>
                  opponentsHook.setOpponentMarkerColor(gradient.markerColor)
                }
                className={`relative h-9 overflow-hidden rounded-xl border transition-all ${
                  opponentsHook.opponentMarkerColor === gradient.markerColor
                    ? "border-white scale-[1.03] ring-1 ring-white/70"
                    : "border-slate-600 hover:border-slate-400"
                }`}
                aria-label={t(gradient.labelKey)}
                title={t(gradient.labelKey)}
              >
                <span
                  className={`absolute inset-0 bg-gradient-to-r ${gradient.value}`}
                  aria-hidden="true"
                />
                <span className="absolute inset-0 bg-slate-950/10" />
              </button>
            ))}
          </div>
        </div>
      )}
      {opponentsHook.opponentTeam && (
        <div className="px-4 py-3 border-b border-slate-700/50 space-y-2">
          <button
            onClick={() => opponentsHook.setShowOpponentFormationSelect(true)}
            className="w-full py-2 px-3 bg-gradient-to-r from-red-600/22 to-red-500/16 hover:from-red-600/32 hover:to-red-500/24 text-red-100 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 border border-red-500/25"
          >
            <span>⚽</span>
            <span>{t("tactics.opponents.squad")}</span>
          </button>
          <p className="px-1 text-[11px] leading-relaxed text-slate-400">
            {t("tactics.opponents.editGuidance")}
          </p>
        </div>
      )}
      {opponentsHook.opponentTeam && (
        <div className="px-3 py-3">
          <label className="text-[10px] text-slate-300/90 font-semibold uppercase tracking-[0.18em] px-1">
            {t("tactics.opponents.selectPlayer")}
          </label>
          <div className="mt-2 max-h-[240px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {opponentsHook.opponentTeam.players
              .slice()
              .sort((a, b) => a.number - b.number)
              .map((player) => {
                const isPlaced = opponentsHook.opponents.some(
                  (o) => o.playerId === player.id.value,
                );
                const isSelected =
                  opponentsHook.selectedOpponentPlayerId === player.id.value;
                const posColor =
                  player.position === "gk"
                    ? opponentsHook.opponentTeam!.colors.gk.toHex()
                    : opponentsHook.opponentTeam!.colors.main.toHex();
                return (
                  <button
                    key={player.id.value}
                    onClick={() =>
                      !isPlaced &&
                      opponentsHook.setSelectedOpponentPlayerId(
                        isSelected ? null : player.id.value,
                      )
                    }
                    disabled={isPlaced}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-all ${isPlaced ? "opacity-30 cursor-not-allowed" : isSelected ? "bg-red-600/18 text-red-100 ring-1 ring-red-500/35" : "text-slate-300 hover:bg-white/[0.05]"}`}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: posColor }}
                    />
                    <span className="font-mono w-5 text-right flex-shrink-0 text-slate-500">
                      {player.number}
                    </span>
                    <span className="truncate">{player.name}</span>
                    {isPlaced && (
                      <span className="ml-auto text-[9px] text-slate-500">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
});
