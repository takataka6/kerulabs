/**
 * @module CinematicReveal
 * @description 映画風のラインナップ表示アニメーションプリセット。選手を一人ずつ大きく紹介表示する。
 */
import { useState, useEffect, useRef, memo } from "react";
import type { LineupAnimationProps, LineupPlayer } from "../types";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";
import {
  CATEGORY_LABEL_FULL,
  getMainColor,
  getPlayerColor,
  useSortedPlayers,
} from "./shared";

type DisplayPhase = "intro" | "players" | "finale";

function LargePlayerCard({
  player,
  color,
  fromRight,
  teamName,
}: {
  player: LineupPlayer;
  color: string;
  fromRight: boolean;
  teamName: string;
}) {
  return (
    <div
      className={`w-full h-full flex ${fromRight ? "flex-row-reverse" : "flex-row"} items-center justify-center gap-8 px-12`}
      style={{
        animation: `${fromRight ? "lineup-cinematic-from-right" : "lineup-cinematic-from-left"} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      {/* 選手写真 / メインビジュアル */}
      <div className="flex-shrink-0">
        {player.mainVisualImageUrl ? (
          <div
            className="w-32 h-44 rounded-xl overflow-hidden shadow-2xl border-4"
            style={{
              borderColor: color,
              boxShadow: `0 0 40px ${color}40`,
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
            className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4"
            style={{
              borderColor: color,
              backgroundColor: player.imageUrl ? "#000" : color,
              boxShadow: `0 0 40px ${color}40`,
            }}
          >
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-4xl font-black">
                {player.number}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 情報 */}
      <div
        className={`flex flex-col ${fromRight ? "items-end text-right" : "items-start text-left"}`}
      >
        {/* ポジション */}
        <span
          className="text-[10px] font-bold tracking-[0.4em] uppercase mb-1"
          style={{ color }}
        >
          {CATEGORY_LABEL_FULL[player.category] || player.positionLabel}
        </span>

        {/* 背番号 */}
        <div className="flex items-baseline gap-3 mb-1">
          <span
            className="text-6xl font-black leading-none"
            style={{ color, opacity: 0.3 }}
          >
            {player.number}
          </span>
        </div>

        {/* 名前 */}
        <h2 className="text-white text-3xl font-black tracking-wide uppercase leading-tight">
          {player.name}
        </h2>

        {/* チーム */}
        <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase mt-1">
          {teamName}
        </span>
      </div>
    </div>
  );
}

function FinaleList({
  players,
  colors,
  teamName,
  formationName,
  mainColor,
}: {
  players: LineupPlayer[];
  colors: Record<string, string>;
  teamName: string;
  formationName: string;
  mainColor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 animate-lineup-zoom-in max-w-sm w-full px-6">
      {/* ヘッダー */}
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-white text-3xl font-black tracking-wider uppercase">
          {teamName}
        </h2>
        <span className="text-slate-400 text-base font-semibold tracking-[0.3em]">
          {formationName}
        </span>
      </div>

      {/* シンプルな選手リスト */}
      <div className="w-full flex flex-col gap-1">
        {players.map((player, i) => {
          const color =
            colors[player.category as keyof typeof colors] || mainColor;
          return (
            <div
              key={player.number}
              className="flex items-center gap-3 animate-lineup-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span
                className="text-lg font-black w-8 text-right flex-shrink-0"
                style={{ color }}
              >
                {player.number}
              </span>
              <span className="text-white text-sm font-semibold truncate">
                {player.name}
              </span>
              <span className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase ml-auto flex-shrink-0">
                {player.positionLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CinematicReveal = memo(function CinematicReveal({
  players,
  teamInfo,
  phase,
  onComplete,
}: LineupAnimationProps) {
  const [displayPhase, setDisplayPhase] = useState<DisplayPhase>("intro");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(-1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mainColor = getMainColor(teamInfo.colors);
  const sortedPlayers = useSortedPlayers(players);

  const colorOf = (player: LineupPlayer) =>
    getPlayerColor(player, teamInfo.colors, mainColor);

  useEffect(() => {
    if (phase !== "running") return;

    const speed = getPlaybackSpeed();
    const s = (ms: number) => (speed > 0 ? ms / speed : ms);
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 状態リセット（エフェクト内の同期的なsetStateを避けるため遅延実行）
    const t0 = setTimeout(() => {
      setDisplayPhase("intro");
      setCurrentPlayerIndex(-1);
    }, 0);
    timers.push(t0);

    const introDuration = 1800;
    const playerInterval = 1200;

    // 選手の表示開始
    const t1 = setTimeout(() => {
      setDisplayPhase("players");

      sortedPlayers.forEach((_p, i) => {
        const t = setTimeout(
          () => {
            setCurrentPlayerIndex(i);
          },
          s(i * playerInterval),
        );
        timers.push(t);
      });

      // フィナーレ
      const finaleDelay = sortedPlayers.length * playerInterval + 500;
      const t2 = setTimeout(() => {
        setDisplayPhase("finale");
      }, s(finaleDelay));
      timers.push(t2);

      // 完了
      const completeDelay = finaleDelay + 3000;
      const t3 = setTimeout(() => {
        onComplete();
      }, s(completeDelay));
      timers.push(t3);
    }, s(introDuration));
    timers.push(t1);

    timersRef.current = timers;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [phase, sortedPlayers, onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* グラデーション背景 */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{
          background: `linear-gradient(135deg, #000 0%, ${mainColor}15 50%, #000 100%)`,
        }}
      />

      {/* 斜めのアクセントライン */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            ${mainColor} 40px,
            ${mainColor} 41px
          )`,
        }}
      />

      {/* チームカラーのグロー効果 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full blur-[120px] opacity-10"
        style={{ backgroundColor: mainColor }}
      />

      {/* フェーズ: イントロ */}
      {displayPhase === "intro" && (
        <div className="relative z-10 flex flex-col items-center gap-3 animate-lineup-zoom-in">
          <div
            className="w-16 h-0.5 rounded-full mb-2"
            style={{ backgroundColor: mainColor }}
          />
          <h1 className="text-white text-5xl font-black tracking-[0.15em] uppercase">
            {teamInfo.teamName}
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-px w-16" style={{ backgroundColor: mainColor }} />
            <span
              className="text-lg font-bold tracking-[0.3em]"
              style={{ color: mainColor }}
            >
              {teamInfo.formationName}
            </span>
            <div className="h-px w-16" style={{ backgroundColor: mainColor }} />
          </div>
          {teamInfo.manager && (
            <span className="text-slate-400 text-sm mt-2 animate-lineup-slide-up">
              {teamInfo.manager}
            </span>
          )}
        </div>
      )}

      {/* フェーズ: 選手表示 */}
      {displayPhase === "players" && currentPlayerIndex >= 0 && (
        <div className="relative z-10 w-full h-full" key={currentPlayerIndex}>
          <LargePlayerCard
            player={sortedPlayers[currentPlayerIndex]}
            color={colorOf(sortedPlayers[currentPlayerIndex])}
            fromRight={currentPlayerIndex % 2 === 1}
            teamName={teamInfo.teamName}
          />

          {/* 進捗インジケーター */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sortedPlayers.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i <= currentPlayerIndex ? mainColor : "#334155",
                  transform:
                    i === currentPlayerIndex ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* フェーズ: フィナーレ */}
      {displayPhase === "finale" && (
        <div className="relative z-10">
          <FinaleList
            players={sortedPlayers}
            colors={teamInfo.colors}
            teamName={teamInfo.teamName}
            formationName={teamInfo.formationName}
            mainColor={mainColor}
          />
        </div>
      )}
    </div>
  );
});
