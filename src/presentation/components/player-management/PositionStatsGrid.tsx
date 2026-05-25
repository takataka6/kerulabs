/**
 * @module PositionStatsGrid
 * @description ポジション別の選手数統計グリッドコンポーネント。各ポジションの登録選手数を可視化する。
 */
import type { Player } from "@domain/entities/Player";
import type { PositionCategory } from "@domain/types";
import type { TranslationKey } from "@shared/i18n/translations";
import { POSITION_CONFIG } from "./constants";

const POSITIONS: PositionCategory[] = ["gk", "df", "mf", "fw"];

interface PositionStatsGridProps {
  players: readonly Player[];
  t: (key: TranslationKey) => string;
}

export function PositionStatsGrid({ players, t }: PositionStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {POSITIONS.map((pos) => (
        <div
          key={pos}
          className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-3 py-2 border-b border-slate-700/50 flex items-center gap-2">
            <span className="text-lg">{POSITION_CONFIG[pos].icon}</span>
            <span className="text-[10px] text-slate-200 font-bold tracking-widest uppercase">
              {POSITION_CONFIG[pos].label}
            </span>
          </div>
          <div className="p-3">
            <div
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${POSITION_CONFIG[pos].color} border ${POSITION_CONFIG[pos].borderColor}`}
            >
              <div className="text-2xl font-bold text-white">
                {players.filter((p) => p.position === pos).length}
              </div>
              <div className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">
                {t("player.count")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
