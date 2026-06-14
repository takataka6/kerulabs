/**
 * @module OpponentSquadSelectorPopup
 * @description 相手チーム選択UIを右レール外の上位レイヤーポップアップとして表示する。
 */
import { memo, useCallback, useEffect, useRef } from "react";
import type { Team } from "@domain/entities/Team";
import type { useOpponents } from "@presentation/hooks/field";
import type { TranslationFn } from "../types";
import { OpponentSquadSelector } from "./OpponentSquadSelector";

interface OpponentSquadSelectorPopupProps {
  opponentsHook: ReturnType<typeof useOpponents>;
  teams: Team[] | undefined;
  selectedTeamId: string | null;
  t: TranslationFn;
}

export const OpponentSquadSelectorPopup = memo(
  function OpponentSquadSelectorPopup({
    opponentsHook,
    teams,
    selectedTeamId,
    t,
  }: OpponentSquadSelectorPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);
    const hasTeams = !!teams && teams.length > 0;
    const hasOpponents = opponentsHook.opponents.length > 0;
    const showInlineSelector =
      hasTeams &&
      (opponentsHook.opponentPlacementMode ||
        !!opponentsHook.selectedOpponentPlayerId) &&
      !opponentsHook.showOpponentFormationSelect &&
      !opponentsHook.showOpponentSquadBuilder;

    const handleClose = useCallback(() => {
      opponentsHook.setOpponentPlacementMode(false);
      opponentsHook.setSelectedOpponentPlayerId(null);
    }, [opponentsHook]);

    useEffect(() => {
      if (!showInlineSelector) return;

      const handleMouseDown = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest('[data-opponent-selector-trigger="true"]')) return;
        if (target.closest('[data-tactics-canvas-root="true"]')) return;
        if (popupRef.current?.contains(target)) return;
        handleClose();
      };

      document.addEventListener("mousedown", handleMouseDown);
      return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [handleClose, showInlineSelector]);

    if (!showInlineSelector) return null;

    return (
      <div
        ref={popupRef}
        data-testid="opponent-squad-selector-popup"
        className="absolute top-2 right-14 z-40 w-[320px] max-w-[calc(100vw-1rem)] sm:top-3 sm:right-[164px] xl:right-[176px]"
      >
        <OpponentSquadSelector
          opponentsHook={opponentsHook}
          teams={teams}
          selectedTeamId={selectedTeamId}
          t={t}
          className="w-full"
          headerActions={
            <>
              {hasOpponents && (
                <button
                  onClick={opponentsHook.clearOpponents}
                  className="flex h-8 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/85 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                  aria-label={t("tactics.opponents.clear")}
                >
                  {t("tactics.opponents.clear")}
                </button>
              )}
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/85 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                aria-label={t("a11y.closeModal")}
              >
                <span aria-hidden="true">✕</span>
              </button>
            </>
          }
        />
      </div>
    );
  },
);
