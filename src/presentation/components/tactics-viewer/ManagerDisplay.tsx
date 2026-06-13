/**
 * @module ManagerDisplay
 * @description 監督名の表示・編集コンポーネント。インライン編集とカード表示を提供する。
 */
import { memo, useState, useRef, useEffect } from "react";
import type { Team } from "@domain/entities/Team";
import type { CardStatus, TranslationFn } from "./types";

interface ManagerDisplayProps {
  selectedTeam: Team;
  teamColor: string;
  editingManager: boolean;
  managerInput: string;
  managerCard: CardStatus;
  captureMode: boolean;
  onStartEditing: () => void;
  onManagerInputChange: (value: string) => void;
  onSaveManager: (name: string) => void;
  onCancelEditing: () => void;
  onCycleManagerCard: () => void;
  t: TranslationFn;
}

export const ManagerDisplay = memo(function ManagerDisplay({
  selectedTeam,
  teamColor,
  editingManager,
  managerInput,
  managerCard,
  captureMode,
  onStartEditing,
  onManagerInputChange,
  onSaveManager,
  onCancelEditing,
  onCycleManagerCard,
  t,
}: ManagerDisplayProps) {
  const [expanded, setExpanded] = useState(true);
  const managerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingManager) {
      managerInputRef.current?.focus();
    }
  }, [editingManager]);

  if (captureMode) return null;

  return (
    <div className="fixed left-2 z-10 flex items-end gap-1 bottom-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] sm:bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:left-4 xl:bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] xl:left-6">
      {expanded && (
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2 border border-slate-700/50 shadow-2xl">
          {editingManager ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-sm sm:text-base shadow-md flex-shrink-0"
                style={{ backgroundColor: teamColor }}
              >
                👔
              </div>
              <input
                ref={managerInputRef}
                type="text"
                value={managerInput}
                onChange={(e) => onManagerInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSaveManager(managerInput.trim());
                  } else if (e.key === "Escape") {
                    onCancelEditing();
                  }
                }}
                onBlur={() => {
                  onSaveManager(managerInput.trim());
                }}
                placeholder={t("tactics.manager")}
                className="w-28 sm:w-40 bg-slate-800 border border-slate-600 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onStartEditing}
                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-sm sm:text-base shadow-md flex-shrink-0"
                  style={{ backgroundColor: teamColor }}
                >
                  👔
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase leading-tight">
                    {t("tactics.manager")}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 font-semibold truncate">
                    {selectedTeam.manager || t("tactics.manager.notSet")}
                  </div>
                </div>
                <span className="text-slate-500 text-xs ml-1">✏️</span>
              </button>
              <button
                onClick={onCycleManagerCard}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800/80 border border-slate-600/50 flex items-center justify-center hover:bg-slate-700/80 transition-colors flex-shrink-0"
                title={t("tactics.card")}
                aria-label={`${t("tactics.manager")} ${t("tactics.card")}: ${managerCard === "none" ? t("tactics.card.none") : managerCard === "yellow" ? t("tactics.card.yellow") : managerCard === "double_yellow" ? t("tactics.card.doubleYellow") : t("tactics.card.red")}`}
              >
                <span className="flex items-center gap-0.5">
                  {managerCard === "none" && (
                    <span className="text-slate-500 text-xs">−</span>
                  )}
                  {managerCard === "yellow" && (
                    <span className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />
                  )}
                  {managerCard === "double_yellow" && (
                    <>
                      <span className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />
                      <span className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />
                    </>
                  )}
                  {managerCard === "red" && (
                    <span className="w-2.5 h-3.5 rounded-[1px] bg-red-500" />
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] backdrop-blur-xl rounded-2xl border border-slate-600/45 ring-1 ring-white/5 shadow-[0_8px_18px_rgba(2,6,23,0.14),0_2px_4px_rgba(2,6,23,0.08)] transition-all duration-300 flex items-center justify-center py-2.5 px-2.5 ${
          expanded
            ? "text-white hover:-translate-y-[1px] hover:border-slate-400/60"
            : "text-slate-400 hover:-translate-y-[1px] hover:border-slate-500/60 hover:text-slate-200"
        }`}
        aria-label={
          expanded ? t("tactics.hideControls") : t("tactics.showControls")
        }
      >
        <span className="text-sm" aria-hidden="true">
          {expanded ? "▼" : "▲"}
        </span>
      </button>
    </div>
  );
});
