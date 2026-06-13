/**
 * @module SquadBuilder
 * @description スカッドビルダーコンポーネント。フォーメーションのポジション枠に選手をドラッグ&ドロップで配置する。
 */
import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import { Team } from "@domain/entities/Team";
import { Formation } from "@domain/entities/Formation";
import { Player } from "@domain/entities/Player";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { AccessibleModal } from "@presentation/components/ui";
import {
  getPositionBg,
  getPositionBorder,
} from "@shared/constants/positionColors";

interface AvailablePlayerItemProps {
  player: Player;
  canAssign: boolean;
  onPlayerClick: (player: Player) => void;
  onAddSubstitute: (player: Player) => void;
  addToSubsLabel: string;
}

const AvailablePlayerItem = memo(function AvailablePlayerItem({
  player,
  canAssign,
  onPlayerClick,
  onAddSubstitute,
  addToSubsLabel,
}: AvailablePlayerItemProps) {
  return (
    <div
      className={`rounded-lg p-2 border transition-all duration-150 ${
        canAssign
          ? "border-amber-500/50 bg-slate-800/60 hover:bg-amber-900/30 cursor-pointer"
          : "border-slate-700/50 bg-slate-800/40"
      }`}
    >
      <div className="flex items-center gap-2">
        {/* クリックで割り当て（アクティブポジションがある時） */}
        <button
          type="button"
          onClick={() => canAssign && onPlayerClick(player)}
          disabled={!canAssign}
          aria-label={`${player.name} (#${player.number})`}
          className={`flex items-center gap-2 flex-1 min-w-0 bg-transparent border-none p-0 text-left ${canAssign ? "cursor-pointer" : ""}`}
        >
          {player.imageUrl ? (
            <img
              src={player.imageUrl}
              alt={player.name}
              loading="lazy"
              className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {player.number}
            </div>
          )}
          <span
            className="text-white text-sm font-medium truncate"
            title={player.name}
          >
            {player.name}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onAddSubstitute(player)}
          aria-label={`${addToSubsLabel}: ${player.name}`}
          className="py-1 px-2 bg-green-700 hover:bg-green-600 text-white rounded text-[10px] font-bold transition-all flex-shrink-0"
        >
          SUB
        </button>
      </div>
    </div>
  );
});

interface SubstituteItemProps {
  player: Player;
  onRemove: (playerId: string) => void;
  removeLabel: string;
}

const SubstituteItem = memo(function SubstituteItem({
  player,
  onRemove,
  removeLabel,
}: SubstituteItemProps) {
  const categoryColor = getPositionBg(player.position || "mf");
  return (
    <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50 transition-all duration-200">
      <div className="flex items-center gap-2">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            loading="lazy"
            className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0"
          />
        ) : (
          <div
            className={`w-7 h-7 ${categoryColor} rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}
          >
            {player.number}
          </div>
        )}
        <span
          className="text-white text-xs font-medium flex-1 truncate"
          title={player.name}
        >
          {player.name}
        </span>
        <button
          onClick={() => onRemove(player.id.value)}
          aria-label={removeLabel}
          className="text-slate-500 hover:text-red-400 transition-colors text-sm flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

interface SquadBuilderProps {
  team: Team;
  formation: Formation;
  selectedPlayers: (Player | null)[];
  onUpdateSquad: (players: (Player | null)[]) => void;
  onClose: () => void;
}

export function SquadBuilder({
  team,
  formation,
  selectedPlayers,
  onUpdateSquad,
  onClose,
}: SquadBuilderProps) {
  const { t } = useLanguage();
  const initialSquad = formation.positions.map(
    (_, index) => selectedPlayers[index] || null,
  );
  const initialEmptyPositionIndex = initialSquad.findIndex(
    (player) => player === null,
  );
  const positionButtonRefs = useRef<Array<HTMLDivElement | null>>([]);
  const initialFocusDoneRef = useRef(false);
  const [squad, setSquad] = useState<(Player | null)[]>(initialSquad);
  // スカッドに配置されていない選手をサブメンバーとして初期化
  const [substitutes, setSubstitutes] = useState<Player[]>(
    selectedPlayers
      .slice(formation.positions.length)
      .filter((p): p is Player => p !== null),
  );
  const [playerFilter, setPlayerFilter] = useState("");
  // 選択中のポジションインデックス（選手一覧からワンクリックで割り当て）
  const [activePositionIndex, setActivePositionIndex] = useState<number | null>(
    initialEmptyPositionIndex >= 0 ? initialEmptyPositionIndex : null,
  );
  const availablePlayers = useMemo(() => {
    const assignedPlayerIds = new Set(
      squad.filter((p) => p !== null).map((p) => p!.id.value),
    );
    const substituteIds = new Set(substitutes.map((p) => p.id.value));
    return team.players.filter(
      (p) =>
        !assignedPlayerIds.has(p.id.value) && !substituteIds.has(p.id.value),
    );
  }, [team.players, squad, substitutes]);

  const filteredAvailablePlayers = useMemo(() => {
    if (!playerFilter.trim()) return availablePlayers;
    const query = playerFilter.trim().toLowerCase();
    return availablePlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        String(p.number).includes(query),
    );
  }, [availablePlayers, playerFilter]);

  // ポジションをクリック → 選手をクリックのフロー
  const handlePositionClick = (index: number) => {
    if (squad[index] !== null) {
      // 既に割り当て済みなら解除
      setSquad((prev) => {
        const newSquad = [...prev];
        newSquad[index] = null;
        return newSquad;
      });
      setActivePositionIndex(index);
    } else {
      // 空きポジションを選択状態にする
      setActivePositionIndex(activePositionIndex === index ? null : index);
    }
  };

  // 選手をクリックでアクティブポジションに割り当て
  const handlePlayerClick = useCallback(
    (player: Player) => {
      if (activePositionIndex === null) return;

      setSquad((prev) => {
        if (prev[activePositionIndex] !== null) return prev;
        const newSquad = [...prev];
        newSquad[activePositionIndex] = player;

        // 次の空きポジションを自動選択（更新後の配列で検索）
        const nextEmpty = newSquad.findIndex(
          (p, i) => p === null && i !== activePositionIndex,
        );
        setActivePositionIndex(nextEmpty >= 0 ? nextEmpty : null);

        return newSquad;
      });
    },
    [activePositionIndex],
  );

  const handleRemoveSubstitute = useCallback((playerId: string) => {
    setSubstitutes((prev) => prev.filter((p) => p.id.value !== playerId));
  }, []);

  const handleAddSubstitute = useCallback((player: Player) => {
    setSubstitutes((prev) => [...prev, player]);
  }, []);

  const handleSave = () => {
    // nullスロットを保持してポジションインデックスを維持する
    // スカッドの選手（null含む）とサブメンバーを結合して保存
    const allPlayers: (Player | null)[] = [...squad, ...substitutes];
    onUpdateSquad(allPlayers);
    onClose();
  };

  useEffect(() => {
    if (initialFocusDoneRef.current) return;

    if (initialEmptyPositionIndex < 0) {
      initialFocusDoneRef.current = true;
      return;
    }

    initialFocusDoneRef.current = true;

    // Wait for the modal contents to paint before moving focus.
    requestAnimationFrame(() => {
      positionButtonRefs.current[initialEmptyPositionIndex]?.focus();
    });
  }, [initialEmptyPositionIndex]);

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="squad-builder-title"
      overlayClassName="fixed inset-0 flex items-center justify-center z-50 p-4"
      className="bg-slate-900/40 rounded-2xl border border-slate-700 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
    >
      {/* ヘッダー */}
      <div
        className={`bg-gradient-to-r ${team.headerGradient} px-6 py-3 border-b border-slate-700`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚽</span>
            <div>
              <h2
                id="squad-builder-title"
                className="text-xl font-bold text-white tracking-tight"
              >
                {t("tactics.squadBuilder.title")}
              </h2>
              <p className="text-white/80 text-xs">
                {team.name} • {formation.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("a11y.closeModal")}
            className="text-white/60 hover:text-white transition-all duration-300 text-2xl hover:rotate-90 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </div>

      {/* コンテンツ - 各カラム独立スクロール */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左側：フォーメーションポジション */}
        <div className="w-[240px] flex-shrink-0 border-r border-slate-700/50 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700/30">
            <div className="text-xs text-slate-400 font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
              {t("tactics.squadBuilder.positions")} ({formation.name})
            </div>
            {activePositionIndex !== null && (
              <div className="text-xs text-amber-400 mt-1 animate-pulse">
                ← {t("tactics.squadBuilder.selectPlayer")}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {formation.positions.map((position, index) => {
              const assignedPlayer = squad[index];
              const categoryColor = getPositionBg(position.category);
              const categoryBorder = getPositionBorder(position.category);
              const isActive = activePositionIndex === index;

              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  ref={(element) => {
                    positionButtonRefs.current[index] = element;
                  }}
                  onClick={() => handlePositionClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePositionClick(index);
                    }
                  }}
                  aria-label={`${position.pos}${assignedPlayer ? ` - ${assignedPlayer.name}` : ""}`}
                  aria-pressed={isActive}
                  className={`w-full text-left rounded-lg p-2 border-l-4 ${categoryBorder} cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-slate-700/80 ring-2 ring-amber-400 shadow-lg"
                      : assignedPlayer
                        ? "bg-slate-800 hover:bg-slate-700"
                        : "bg-slate-800/30 hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 ${categoryColor} rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}
                    >
                      {position.pos}
                    </div>
                    <div className="flex-1 min-w-0">
                      {assignedPlayer ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            {assignedPlayer.imageUrl ? (
                              <img
                                src={assignedPlayer.imageUrl}
                                alt={assignedPlayer.name}
                                loading="lazy"
                                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <span className="text-white text-xs font-bold">
                                {assignedPlayer.number}
                              </span>
                            )}
                            <span
                              className="text-slate-300 text-xs truncate"
                              title={assignedPlayer.name}
                            >
                              {assignedPlayer.name}
                            </span>
                            <span
                              aria-hidden="true"
                              className="text-slate-500 text-sm ml-auto flex-shrink-0"
                            >
                              ✕
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          {isActive ? "..." : "—"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 中央：利用可能な選手 */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400 font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                {t("tactics.squadBuilder.availablePlayers")} (
                {availablePlayers.length})
              </div>
              {availablePlayers.length > 0 && (
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={playerFilter}
                    onChange={(e) => setPlayerFilter(e.target.value)}
                    placeholder={t("tactics.squadBuilder.searchPlayers")}
                    className="w-full bg-slate-800/70 border border-slate-700 rounded-lg py-1.5 pl-8 pr-7 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {playerFilter && (
                    <button
                      onClick={() => setPlayerFilter("")}
                      aria-label={t("a11y.clearSearch")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {availablePlayers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-4xl mb-3 opacity-50">✓</div>
                <p className="font-light text-sm">
                  {t("tactics.squadBuilder.allAssigned")}
                </p>
              </div>
            ) : filteredAvailablePlayers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="text-3xl mb-2 opacity-50">🔍</div>
                <p className="font-light text-xs">
                  {t("tactics.squadBuilder.noSearchResults")}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAvailablePlayers.map((player) => {
                  const canAssign =
                    activePositionIndex !== null &&
                    squad[activePositionIndex] === null;
                  return (
                    <AvailablePlayerItem
                      key={player.id.value}
                      player={player}
                      canAssign={canAssign}
                      onPlayerClick={handlePlayerClick}
                      onAddSubstitute={handleAddSubstitute}
                      addToSubsLabel={t("tactics.squadBuilder.addToSubs")}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右側：サブメンバー */}
        <div className="w-[200px] flex-shrink-0 border-l border-slate-700/50 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700/30">
            <div className="text-xs text-slate-400 font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
              {t("tactics.substitutes")} ({substitutes.length})
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {substitutes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="text-3xl mb-2 opacity-50">🪑</div>
                <p className="font-light text-[10px]">
                  {t("tactics.substitutes")}{" "}
                  {t("tactics.squadBuilder.noSubsSelected")}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {substitutes.map((player) => (
                  <SubstituteItem
                    key={player.id.value}
                    player={player}
                    onRemove={handleRemoveSubstitute}
                    removeLabel={t("a11y.removePlayer").replace(
                      "{name}",
                      player.name,
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="border-t border-slate-700 px-6 py-3 bg-slate-900/50 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl font-semibold transition-all duration-300 text-sm"
        >
          {t("tactics.squadBuilder.cancel")}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
        >
          {t("tactics.squadBuilder.save")}
        </button>
      </div>
    </AccessibleModal>
  );
}
