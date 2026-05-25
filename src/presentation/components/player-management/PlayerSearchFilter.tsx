/**
 * @module PlayerSearchFilter
 * @description 選手一覧の検索・ポジションフィルタ・ソート操作コンポーネント。
 */
import type { PositionCategory } from "@domain/types";
import type { TranslationKey } from "@shared/i18n/translations";
import { POSITION_CONFIG, type SortBy, type FilterPosition } from "./constants";

interface PlayerSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterPosition: FilterPosition;
  onFilterChange: (filter: FilterPosition) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  t: (key: TranslationKey) => string;
}

export function PlayerSearchFilter({
  searchQuery,
  onSearchChange,
  filterPosition,
  onFilterChange,
  sortBy,
  onSortChange,
  t,
}: PlayerSearchFilterProps) {
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden mb-5">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50">
        <div className="text-[10px] text-slate-300 font-bold tracking-widest uppercase flex items-center gap-2">
          <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
          {t("player.searchPlaceholder")}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3">
        <input
          id="player-search"
          type="text"
          placeholder={`🔍 ${t("player.searchPlaceholder")}`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t("player.searchPlaceholder")}
          className="px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <select
          value={filterPosition}
          onChange={(e) => onFilterChange(e.target.value as FilterPosition)}
          aria-label={t("player.positionFilter")}
          className="px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
        >
          <option value="all">{t("player.allPositions")}</option>
          {(Object.keys(POSITION_CONFIG) as PositionCategory[]).map((pos) => (
            <option key={pos} value={pos}>
              {POSITION_CONFIG[pos].icon} {POSITION_CONFIG[pos].label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          aria-label={t("player.sortLabel")}
          className="px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
        >
          <option value="number">{t("player.sortByNumber")}</option>
          <option value="name">{t("player.sortByName")}</option>
          <option value="position">{t("player.sortByPosition")}</option>
        </select>
      </div>
    </div>
  );
}
