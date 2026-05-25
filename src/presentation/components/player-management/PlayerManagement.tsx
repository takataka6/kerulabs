/**
 * @module PlayerManagement
 * @description 選手管理のメインコンポーネント。選手一覧・追加・編集・削除・一括インポート・検索/フィルタ機能を統合する。
 */
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Team } from "@domain/entities/Team";
import type { PositionCategory } from "@domain/types";
import type { PlayerStatus } from "@shared/types/PlayerStatus";
import { handleError } from "@shared/errors";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import {
  AccessibleModal,
  useToast,
  useConfirm,
} from "@presentation/components/ui";
import { PositionStatsGrid } from "./PositionStatsGrid";
import { PlayerSearchFilter } from "./PlayerSearchFilter";
import { PlayerAddForm } from "./PlayerAddForm";
import { BulkImportForm } from "./BulkImportForm";
import { PlayerRow } from "./PlayerRow";
import type { SortBy, FilterPosition } from "./constants";

const PLAYERS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 200;

interface PlayerManagementProps {
  team: Team;
  onUpdateTeam: (team: Team) => void;
  onClose: () => void;
}

export function PlayerManagement({
  team,
  onUpdateTeam,
  onClose,
}: PlayerManagementProps) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // ── UI 表示状態 ──
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // ── 検索・フィルタ・ソート ──
  const [sortBy, setSortBy] = useState<SortBy>("number");
  const [filterPosition, setFilterPosition] = useState<FilterPosition>("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PLAYERS_PER_PAGE);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // 検索入力は即時表示、フィルタリングはデバウンス
  const handleSearchChange = useCallback((query: string) => {
    setSearchInput(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(query);
      setVisibleCount(PLAYERS_PER_PAGE);
    }, SEARCH_DEBOUNCE_MS);
  }, []);
  const handleFilterChange = useCallback((filter: FilterPosition) => {
    setFilterPosition(filter);
    setVisibleCount(PLAYERS_PER_PAGE);
  }, []);

  // ── ハンドラ ──
  const handleStartEdit = useCallback((playerId: string) => {
    setEditingPlayerId(playerId);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingPlayerId(null);
  }, []);

  const handleRemovePlayer = useCallback(
    async (playerId: string) => {
      if (
        !(await confirm({ message: t("player.deleteConfirm"), variant: "red" }))
      ) {
        return;
      }

      const player = team.players.find((p) => p.id.value === playerId);
      if (player) {
        team.removePlayer(player.id);
        onUpdateTeam(team);
      }
    },
    [team, onUpdateTeam, t, confirm],
  );

  const handleUpdatePlayer = useCallback(
    (
      playerId: string,
      name: string,
      number: number,
      position: PositionCategory,
      nationality?: string,
      club?: string,
      leagueCountry?: string,
      imageUrl?: string,
      mainVisualImageUrl?: string,
      note?: string,
      status?: PlayerStatus,
    ) => {
      const player = team.players.find((p) => p.id.value === playerId);
      if (!player) return;

      if (
        team.players.some((p) => p.number === number && p.id.value !== playerId)
      ) {
        showToast(
          t("player.numberInUse").replace("{number}", String(number)),
          "error",
        );
        return;
      }

      try {
        player.updateName(name);
        player.updateNumber(number);
        player.updatePosition(position);
        if (nationality !== undefined) player.updateNationality(nationality);
        if (club !== undefined) player.updateClub(club);
        if (leagueCountry !== undefined)
          player.updateLeagueCountry(leagueCountry);
        player.updateImageUrl(imageUrl);
        player.updateMainVisualImageUrl(mainVisualImageUrl);
        player.updateNote(note);
        if (status) player.updateStatus(status);
        onUpdateTeam(team);
      } catch (error) {
        handleError(error, "ui", "Failed to update player", {
          toast: {
            show: showToast,
            message:
              error instanceof Error ? error.message : t("player.updateFailed"),
          },
        });
      }
    },
    [team, onUpdateTeam, showToast, t],
  );

  // ── フィルタリングとソート ──
  const filteredAndSortedPlayers = useMemo(
    () =>
      team.players
        .filter((p) => {
          if (filterPosition !== "all" && p.position !== filterPosition)
            return false;
          if (
            debouncedSearch &&
            !p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
            !p.number.toString().includes(debouncedSearch)
          )
            return false;
          return true;
        })
        .sort((a, b) => {
          if (sortBy === "number") return a.number - b.number;
          if (sortBy === "name") return a.name.localeCompare(b.name);
          if (sortBy === "position") {
            const order = ["gk", "df", "mf", "fw"];
            return order.indexOf(a.position) - order.indexOf(b.position);
          }
          return 0;
        }),
    [team.players, filterPosition, debouncedSearch, sortBy],
  );

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="player-mgmt-title"
      overlayClassName="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4"
      className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col"
    >
      {/* ヘッダー */}
      <div
        className={`bg-gradient-to-r ${team.headerGradient} px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-700/50`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black/20 border border-white/15 flex items-center justify-center shadow-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2
                id="player-mgmt-title"
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                {team.name}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
                {t("player.management.subtitle")} •{" "}
                {t("player.management.registered").replace(
                  "{count}",
                  String(team.players.length),
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("a11y.closeModal")}
            className="text-white/60 hover:text-white transition-all duration-300 text-2xl sm:text-3xl hover:rotate-90 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-gradient-to-b from-slate-900/80 via-slate-900 to-slate-950/90">
        <PositionStatsGrid players={team.players} t={t} />

        <PlayerSearchFilter
          searchQuery={searchInput}
          onSearchChange={handleSearchChange}
          filterPosition={filterPosition}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          t={t}
        />

        {/* 選手追加ボタン */}
        {!isAddingPlayer && !showBulkImport && (
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden mb-5">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50">
              <div className="text-[10px] text-slate-300 font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                Player Tools
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
              <button
                onClick={() => setIsAddingPlayer(true)}
                className="py-3 px-4 bg-slate-800/70 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-300 border border-slate-700/50 flex items-center justify-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs">
                  ➕
                </span>
                {t("player.addPlayer")}
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="py-3 px-4 bg-slate-800/70 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-300 border border-slate-700/50 flex items-center justify-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs">
                  📋
                </span>
                {t("player.bulkImport")}
              </button>
            </div>
          </div>
        )}

        {isAddingPlayer && (
          <PlayerAddForm
            team={team}
            onUpdateTeam={onUpdateTeam}
            onClose={() => setIsAddingPlayer(false)}
            language={language}
            t={t}
          />
        )}

        {showBulkImport && (
          <BulkImportForm
            team={team}
            onUpdateTeam={onUpdateTeam}
            onClose={() => setShowBulkImport(false)}
            t={t}
          />
        )}

        {/* 選手リスト */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50">
            <div className="text-[10px] sm:text-xs text-slate-300 font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1 h-4 bg-green-500 rounded-full"></span>
              <span className="flex-1">
                {t("player.playerList")} (
                {t("player.playersCount").replace(
                  "{count}",
                  String(filteredAndSortedPlayers.length),
                )}
                )
              </span>
            </div>
          </div>

          <div className="p-2 sm:p-3">
            {filteredAndSortedPlayers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-5xl mb-4 opacity-50">👥</div>
                <p className="font-light">
                  {team.players.length === 0
                    ? t("player.noPlayers")
                    : t("player.noMatchingPlayers")}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {filteredAndSortedPlayers
                    .slice(0, visibleCount)
                    .map((player) => (
                      <PlayerRow
                        key={player.id.value}
                        player={player}
                        isEditing={editingPlayerId === player.id.value}
                        onStartEdit={handleStartEdit}
                        onCancelEdit={handleCancelEdit}
                        onUpdate={handleUpdatePlayer}
                        onRemove={handleRemovePlayer}
                        language={language}
                        t={t}
                      />
                    ))}
                </div>
                {visibleCount < filteredAndSortedPlayers.length && (
                  <button
                    onClick={() =>
                      setVisibleCount((prev) => prev + PLAYERS_PER_PAGE)
                    }
                    className="w-full mt-3 py-3 text-sm text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700 rounded-xl border border-slate-700/50 transition-colors font-medium"
                  >
                    {t("common.showMore").replace(
                      "{count}",
                      String(filteredAndSortedPlayers.length - visibleCount),
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="border-t border-slate-700/50 px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/80">
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-semibold transition-all duration-300 border border-slate-700/50"
        >
          {t("player.close")}
        </button>
      </div>
    </AccessibleModal>
  );
}
