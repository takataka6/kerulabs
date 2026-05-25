/**
 * @module ClassicTvReveal
 * @description クラシックTV風のラインナップ表示アニメーションプリセット。選手名を順にフェードイン表示する。
 */
import { useState, useEffect, useRef, memo } from "react";
import type { LineupAnimationProps, LineupPlayer } from "../types";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";
import {
  CATEGORY_LABEL_SHORT,
  getMainColor,
  getPlayerColor as getPlayerColorShared,
  useSortedPlayers,
} from "./shared";

type DisplayPhase = "title" | "players" | "full";

/** 一人ずつ表示する際の選手カード */
function PlayerCard({
  player,
  color,
  isActive,
  index,
}: {
  player: LineupPlayer;
  color: string;
  isActive: boolean;
  index: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 transition-all duration-500 ${
        isActive
          ? "animate-lineup-card-enter opacity-100"
          : "opacity-0 translate-x-[-60px]"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 選手写真 / メインビジュアル */}
      {player.mainVisualImageUrl ? (
        <div
          className="w-16 h-22 rounded-lg overflow-hidden shadow-lg flex-shrink-0 border-2"
          style={{
            borderColor: color,
          }}
        >
          <img
            src={player.mainVisualImageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0 border-2"
          style={{
            borderColor: color,
            backgroundColor: player.imageUrl ? "transparent" : color,
          }}
        >
          {player.imageUrl ? (
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-2xl font-black">
              {player.number}
            </span>
          )}
        </div>
      )}

      {/* 名前、背番号、ポジション */}
      <div className="flex flex-col min-w-0">
        <span className="text-white text-lg font-bold tracking-wide truncate">
          {player.name}
        </span>
        <div className="flex items-center gap-2">
          <span style={{ color }} className="text-sm font-black">
            No.{player.number}
          </span>
          <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase">
            {player.positionLabel ||
              CATEGORY_LABEL_SHORT[player.category] ||
              ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/** 表示済みリストのコンパクトな選手エントリ */
function RevealedPlayerRow({
  player,
  color,
}: {
  player: LineupPlayer;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 animate-lineup-slide-up">
      <div
        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {player.number}
      </div>
      <span className="text-slate-300 text-xs font-medium truncate">
        {player.name}
      </span>
    </div>
  );
}

/** チーム全体リスト（シンプルな番号付きリスト） */
function FullTeamList({
  players,
  colors,
}: {
  players: LineupPlayer[];
  colors: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1.5 animate-lineup-zoom-in">
      {players.map((player, i) => {
        const color =
          colors[player.category as keyof typeof colors] || colors.mf;
        return (
          <div
            key={player.number}
            className="flex items-center gap-3 animate-lineup-slide-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {player.number}
            </div>
            <span className="text-white text-sm font-semibold truncate">
              {player.name}
            </span>
            <span className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase ml-auto">
              {player.positionLabel ||
                CATEGORY_LABEL_SHORT[player.category] ||
                ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const ClassicTvReveal = memo(function ClassicTvReveal({
  players,
  teamInfo,
  phase,
  onComplete,
}: LineupAnimationProps) {
  const [displayPhase, setDisplayPhase] = useState<DisplayPhase>("title");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(-1);
  const [revealedPlayers, setRevealedPlayers] = useState<LineupPlayer[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sortedPlayers = useSortedPlayers(players);
  const mainColor = getMainColor(teamInfo.colors);

  const colorOf = (player: LineupPlayer) =>
    getPlayerColorShared(player, teamInfo.colors, mainColor);

  // アニメーションタイムライン
  useEffect(() => {
    if (phase !== "running") return;

    const speed = getPlaybackSpeed();
    const s = (ms: number) => (speed > 0 ? ms / speed : ms);
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 状態リセット（エフェクト内の同期的なsetStateを避けるため遅延実行）
    const t0 = setTimeout(() => {
      setDisplayPhase("title");
      setCurrentPlayerIndex(-1);
      setRevealedPlayers([]);
    }, 0);
    timers.push(t0);

    // フェーズ1: タイトルカードを2秒間表示
    const titleDuration = 2000;
    const playerInterval = 1000;

    // フェーズ2: 選手を一人ずつ表示
    const t1 = setTimeout(() => {
      setDisplayPhase("players");

      sortedPlayers.forEach((player, i) => {
        const t = setTimeout(
          () => {
            setCurrentPlayerIndex(i);
            setRevealedPlayers((prev) => [...prev, player]);
          },
          s(i * playerInterval),
        );
        timers.push(t);
      });

      // フェーズ3: チーム全体リスト
      const fullTeamDelay = sortedPlayers.length * playerInterval + 500;
      const t2 = setTimeout(() => {
        setDisplayPhase("full");
      }, s(fullTeamDelay));
      timers.push(t2);

      // 完了を通知
      const completeDelay = fullTeamDelay + 2500;
      const t3 = setTimeout(() => {
        onComplete();
      }, s(completeDelay));
      timers.push(t3);
    }, s(titleDuration));
    timers.push(t1);

    timersRef.current = timers;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [phase, sortedPlayers, onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 暗い背景 */}
      <div className="absolute inset-0 bg-black/85 animate-fade-in" />

      {/* チームカラーのアクセントライン（左端） */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: mainColor }}
      />

      {/* フェーズ1: タイトルカード */}
      {displayPhase === "title" && (
        <div className="relative z-10 flex flex-col items-center gap-4 animate-lineup-zoom-in">
          {/* チームカラーバー */}
          <div
            className="w-24 h-1 rounded-full"
            style={{ backgroundColor: mainColor }}
          />
          <h1 className="text-white text-4xl font-black tracking-wider uppercase">
            {teamInfo.teamName}
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-px w-12" style={{ backgroundColor: mainColor }} />
            <span className="text-slate-400 text-lg font-semibold tracking-widest">
              {teamInfo.formationName}
            </span>
            <div className="h-px w-12" style={{ backgroundColor: mainColor }} />
          </div>
          {teamInfo.manager && (
            <span className="text-slate-500 text-sm font-medium mt-2 animate-lineup-slide-up">
              {teamInfo.manager}
            </span>
          )}
        </div>
      )}

      {/* フェーズ2: 選手を一人ずつ表示 */}
      {displayPhase === "players" && (
        <div className="relative z-10 flex w-full h-full">
          {/* 現在の選手スポットライト（左/中央） */}
          <div className="flex-1 flex items-center justify-center px-8">
            {currentPlayerIndex >= 0 && sortedPlayers[currentPlayerIndex] && (
              <div key={currentPlayerIndex} className="flex flex-col gap-6">
                {/* ポジショングループラベル */}
                <span
                  className="text-xs font-bold tracking-[0.3em] uppercase animate-lineup-slide-up"
                  style={{ color: mainColor }}
                >
                  {CATEGORY_LABEL_SHORT[
                    sortedPlayers[currentPlayerIndex].category
                  ] || ""}
                </span>

                <PlayerCard
                  player={sortedPlayers[currentPlayerIndex]}
                  color={colorOf(sortedPlayers[currentPlayerIndex])}
                  isActive={true}
                  index={0}
                />
              </div>
            )}
          </div>

          {/* 表示済み選手リスト（右側） */}
          <div className="w-48 flex flex-col justify-center gap-1.5 pr-6 py-8">
            <div className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase mb-2">
              {teamInfo.teamName}
            </div>
            {revealedPlayers.map((player) => (
              <RevealedPlayerRow
                key={player.number}
                player={player}
                color={colorOf(player)}
              />
            ))}
          </div>
        </div>
      )}

      {/* フェーズ3: チーム全体リスト */}
      {displayPhase === "full" && (
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-white text-2xl font-black tracking-wider uppercase animate-lineup-slide-up">
              {teamInfo.teamName}
            </h2>
            <span className="text-slate-400 text-sm font-semibold tracking-widest animate-lineup-slide-up">
              {teamInfo.formationName}
            </span>
          </div>
          <FullTeamList players={sortedPlayers} colors={teamInfo.colors} />
        </div>
      )}

      {/* 下部アクセントライン */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: mainColor }}
      />
    </div>
  );
});
