/**
 * @module SubstitutesPanel
 * @description 控え選手パネルコンポーネント。ベンチメンバーの一覧表示と入れ替え操作を提供する。
 */
import { useState, memo } from "react";
import type { Player } from "@domain/entities/Player";
import type { Formation } from "@domain/entities/Formation";
import type { TranslationFn } from "./types";
import { getPositionBg } from "@shared/constants/positionColors";

/** SquadPanel left + width + gap */

export interface SubstitutionRecord {
  inPlayer: Player;
  outPlayer: Player;
}

interface SubstitutesPanelProps {
  customSquad: (Player | null)[];
  currentFormation: Formation;
  captureMode: boolean;
  showSquadBuilder: boolean;
  squadPanelOpen: boolean;
  playerViewEnabled: boolean;
  selectedPlayerIndex: number | null;
  selectedOpponentViewId: number | null;
  substitutionRecords: SubstitutionRecord[];
  onResetSubstitutions?: () => void;
  t: TranslationFn;
}

export const SubstitutesPanel = memo(function SubstitutesPanel({
  customSquad,
  currentFormation,
  captureMode,
  showSquadBuilder,
  squadPanelOpen,
  playerViewEnabled,
  selectedPlayerIndex,
  selectedOpponentViewId,
  substitutionRecords,
  onResetSubstitutions,
  t,
}: SubstitutesPanelProps) {
  const [subsPanelOpen, setSubsPanelOpen] = useState(true);

  // originalIndex を保持してドラッグ時に使用
  const substitutes = customSquad
    .slice(currentFormation.positions.length)
    .map((player, i) => ({
      player,
      originalIndex: currentFormation.positions.length + i,
    }))
    .filter(
      (entry): entry is { player: Player; originalIndex: number } =>
        entry.player !== null,
    );

  const hasContent = substitutes.length > 0 || substitutionRecords.length > 0;

  if (
    captureMode ||
    showSquadBuilder ||
    !squadPanelOpen ||
    (playerViewEnabled &&
      (selectedPlayerIndex !== null || selectedOpponentViewId !== null)) ||
    !hasContent
  ) {
    return null;
  }

  return (
    <div className="absolute top-2 left-[160px] sm:left-[212px] z-10 w-36 sm:w-48 max-h-[calc(100vh-150px)] sm:max-h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          className="bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-2 border-b border-slate-700/50 cursor-pointer hover:from-slate-700 hover:to-slate-600 transition-all duration-200"
          onClick={() => setSubsPanelOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSubsPanelOpen((prev) => !prev);
            }
          }}
        >
          <div className="text-[10px] text-slate-300 font-bold tracking-widest uppercase flex items-center gap-1.5 h-5">
            <span className="w-1 h-3.5 bg-purple-400 rounded-full"></span>
            <span className="flex-1">
              {t("tactics.substitutes")} • {substitutes.length}
            </span>
            <span className="text-slate-400 text-[10px]">
              {subsPanelOpen ? "▲" : "▼"}
            </span>
          </div>
        </div>
        {subsPanelOpen && (
          <>
            {substitutes.length > 0 && (
              <div className="p-1.5">
                <div className="space-y-0.5">
                  {substitutes.map((entry) => {
                    const bgColor = getPositionBg(entry.player.position);

                    return (
                      <div
                        key={entry.player.id.value}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "text/plain",
                            String(entry.originalIndex),
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-slate-800/50 transition-all duration-200 group cursor-grab active:cursor-grabbing"
                      >
                        <div
                          className={`w-7 h-7 ${bgColor} rounded-md flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-110 transition-transform`}
                        >
                          {entry.player.number}
                        </div>
                        <span className="text-slate-300 text-xs font-medium flex-1 truncate tracking-wide">
                          {entry.player.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {substitutionRecords.length > 0 && (
              <div className="border-t border-slate-700/50">
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                    <span className="w-1 h-3.5 bg-red-500 rounded-full"></span>
                    {t("tactics.substitution.title")} •{" "}
                    {substitutionRecords.length}
                  </div>
                  {onResetSubstitutions && (
                    <button
                      onClick={onResetSubstitutions}
                      className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {t("tactics.substitution.reset")}
                    </button>
                  )}
                </div>
                <div className="p-1.5 pt-0 space-y-1">
                  {substitutionRecords.map((record, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/40 rounded-lg px-2 py-1.5 space-y-0.5"
                    >
                      {/* IN: 投入選手 */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-green-400 w-5 flex-shrink-0">
                          IN
                        </span>
                        <div
                          className={`w-5 h-5 ${getPositionBg(record.inPlayer.position)} rounded flex items-center justify-center text-white font-bold text-[9px] shadow-sm`}
                        >
                          {record.inPlayer.number}
                        </div>
                        <span className="text-slate-200 text-[10px] font-medium truncate">
                          {record.inPlayer.name}
                        </span>
                      </div>
                      {/* OUT: 交代選手 */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-red-400 w-5 flex-shrink-0">
                          OUT
                        </span>
                        <div
                          className={`w-5 h-5 ${getPositionBg(record.outPlayer.position)} rounded flex items-center justify-center text-white font-bold text-[9px] shadow-sm opacity-50`}
                        >
                          {record.outPlayer.number}
                        </div>
                        <span className="text-slate-400 text-[10px] font-medium truncate line-through">
                          {record.outPlayer.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
