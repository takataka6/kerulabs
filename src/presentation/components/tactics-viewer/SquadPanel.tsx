/**
 * @module SquadPanel
 * @description スカッドパネルコンポーネント。スターティングメンバーの選択・並べ替え・選手管理を表示する。
 */
import { useState, useRef, memo } from "react";
import type { Player } from "@domain/entities/Player";
import type { Formation } from "@domain/entities/Formation";
import type { CardStatus, TranslationFn } from "./types";
import { getPositionBg } from "@shared/constants/positionColors";

interface SquadPanelProps {
  customSquad: (Player | null)[];
  currentFormation: Formation;
  playerCards: Record<number, CardStatus>;
  squadPanelOpen: boolean;
  captureMode: boolean;
  showSquadBuilder: boolean;
  playerViewEnabled: boolean;
  selectedPlayerIndex: number | null;
  selectedOpponentViewId: number | null;
  onToggleSquadPanel: () => void;
  onCycleCard: (index: number) => void;
  onSubstitute?: (subOriginalIndex: number, starterIndex: number) => void;
  onSwapPositions?: (fromIndex: number, toIndex: number) => void;
  t: TranslationFn;
}

export const SquadPanel = memo(function SquadPanel({
  customSquad,
  currentFormation,
  playerCards,
  squadPanelOpen,
  captureMode,
  showSquadBuilder,
  playerViewEnabled,
  selectedPlayerIndex,
  selectedOpponentViewId,
  onToggleSquadPanel,
  onCycleCard,
  onSubstitute,
  onSwapPositions,
  t,
}: SquadPanelProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragSourceIndexRef = useRef<number | null>(null);

  if (
    captureMode ||
    showSquadBuilder ||
    (playerViewEnabled &&
      (selectedPlayerIndex !== null || selectedOpponentViewId !== null)) ||
    !customSquad.some((p) => p !== null)
  ) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 sm:left-3 z-10 w-36 sm:w-48 max-h-[calc(100vh-150px)] sm:max-h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          className="bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-2 border-b border-slate-700/50 cursor-pointer hover:from-slate-700 hover:to-slate-600 transition-all duration-200"
          onClick={onToggleSquadPanel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleSquadPanel();
            }
          }}
        >
          <div className="text-[10px] text-slate-300 font-bold tracking-widest uppercase flex items-center gap-1.5 h-5">
            <span className="w-1 h-3.5 bg-green-500 rounded-full"></span>
            <span className="flex-1">
              {t("tactics.squad")} • {currentFormation.name}
            </span>
            <span className="text-slate-400 text-[10px]">
              {squadPanelOpen ? "▲" : "▼"}
            </span>
          </div>
        </div>
        {squadPanelOpen && (
          <div className="p-1.5">
            <div className="space-y-0.5">
              {customSquad
                .slice(0, currentFormation.positions.length)
                .map((player, index) => {
                  if (!player) return null;
                  const pos = currentFormation.positions[index];
                  const bgColor = getPositionBg(pos?.category);
                  const card = playerCards[index] || "none";
                  const isDragOver = dragOverIndex === index;

                  return (
                    <div
                      key={player.id.value}
                      role="button"
                      tabIndex={0}
                      draggable
                      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-slate-800/50 transition-all duration-200 group cursor-grab active:cursor-grabbing ${
                        isDragOver
                          ? "ring-2 ring-green-500/50 bg-green-900/20"
                          : ""
                      }`}
                      onClick={() => onCycleCard(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onCycleCard(index);
                        }
                      }}
                      onDragStart={(e) => {
                        dragSourceIndexRef.current = index;
                        e.dataTransfer.setData("squad-index", String(index));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        dragSourceIndexRef.current = null;
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDragOverIndex(index);
                      }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverIndex(null);
                        const squadFrom = e.dataTransfer.getData("squad-index");
                        if (squadFrom !== "") {
                          const fromIndex = parseInt(squadFrom, 10);
                          if (
                            !isNaN(fromIndex) &&
                            fromIndex !== index &&
                            onSwapPositions
                          ) {
                            onSwapPositions(fromIndex, index);
                          }
                          return;
                        }
                        const subIndex = parseInt(
                          e.dataTransfer.getData("text/plain"),
                          10,
                        );
                        if (!isNaN(subIndex) && onSubstitute) {
                          onSubstitute(subIndex, index);
                        }
                      }}
                    >
                      <div
                        className={`w-7 h-7 ${bgColor} rounded-md flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-110 transition-transform`}
                      >
                        {player.number}
                      </div>
                      <span className="text-slate-300 text-xs font-medium flex-1 truncate tracking-wide">
                        {player.name}
                      </span>
                      {card !== "none" && (
                        <span className="flex items-center gap-0.5">
                          {card === "yellow" && (
                            <span className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />
                          )}
                          {card === "double_yellow" && (
                            <>
                              <span className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />
                              <span className="w-2.5 h-3.5 rounded-[1px] bg-yellow-400" />
                            </>
                          )}
                          {card === "red" && (
                            <span className="w-2.5 h-3.5 rounded-[1px] bg-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
