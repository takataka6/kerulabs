/**
 * @module PlayerCardReveal
 * @description 選手カード風のラインナップ表示アニメーションプリセット。背番号を左下、名前を下部中央に配置したカードで選手を表示する。
 */
import { useState, useEffect, useRef, memo } from "react";
import type { LineupAnimationProps, LineupPlayer } from "../types";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";
import {
  CATEGORY_LABEL_SHORT,
  getMainColor,
  getPlayerColor,
  useSortedPlayers,
} from "./shared";

type DisplayPhase = "intro" | "players" | "finale";

/** 選手カード: 背番号を左下、名前を下部中央に表示 */
function SinglePlayerCard({
  player,
  color,
}: {
  player: LineupPlayer;
  color: string;
}) {
  const hasMainVisual = !!player.mainVisualImageUrl;
  const hasImage = !!player.imageUrl;

  return (
    <div
      className="w-72 h-[420px] rounded-2xl overflow-hidden shadow-2xl relative"
      style={{
        boxShadow: `0 0 80px ${color}40, 0 0 120px ${color}20, 0 25px 50px rgba(0,0,0,0.7)`,
        animation: "lineup-playercard-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* 上部のポジションカラーバー */}
      <div
        className="absolute top-0 left-0 right-0 h-2 z-20"
        style={{ backgroundColor: color }}
      />

      {/* カード本体の画像/プレースホルダー */}
      {hasMainVisual ? (
        <>
          <img
            src={player.mainVisualImageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        </>
      ) : hasImage ? (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-40 h-40 rounded-full object-cover border-4"
            style={{ borderColor: color }}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `linear-gradient(160deg, ${color}15 0%, #0f172a 50%, ${color}10 100%)`,
          }}
        >
          <span className="text-9xl font-black opacity-10" style={{ color }}>
            {player.number}
          </span>
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      )}

      {/* カード下部: 背番号（左下）+ 名前（中央下） */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-10">
        {/* ポジションラベル */}
        <span
          className="text-[10px] font-bold tracking-[0.3em] uppercase block mb-1.5"
          style={{ color }}
        >
          {player.positionLabel || CATEGORY_LABEL_SHORT[player.category] || ""}
        </span>

        <div className="flex items-end gap-3">
          {/* 背番号（左下） */}
          <span
            className="text-5xl font-black leading-none flex-shrink-0"
            style={{ color }}
          >
            {player.number}
          </span>

          {/* 名前（中央） */}
          <span className="text-white text-lg font-bold truncate flex-1 text-center pb-1">
            {player.name}
          </span>
        </div>
      </div>
    </div>
  );
}

/** フィナーレ用のミニカード */
function MiniPlayerCard({
  player,
  color,
  delay,
}: {
  player: LineupPlayer;
  color: string;
  delay: number;
}) {
  const hasMainVisual = !!player.mainVisualImageUrl;
  const hasImage = !!player.imageUrl;

  return (
    <div
      className="animate-lineup-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="rounded-lg overflow-hidden border relative"
        style={{ borderColor: `${color}50` }}
      >
        {/* 上部カラーバー */}
        <div className="h-0.5" style={{ backgroundColor: color }} />

        {/* 画像エリア */}
        <div className="aspect-[3/4] relative">
          {hasMainVisual ? (
            <img
              src={player.mainVisualImageUrl}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          ) : hasImage ? (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <span className="text-xl font-black opacity-20" style={{ color }}>
                {player.number}
              </span>
            </div>
          )}

          {/* 下部オーバーレイ: 背番号（左下）+ 名前（中央） */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-1.5 pb-1 pt-4">
            <div className="flex items-end gap-1">
              <span
                className="text-[10px] font-black leading-none flex-shrink-0"
                style={{ color }}
              >
                {player.number}
              </span>
              <span className="text-white text-[8px] font-semibold truncate flex-1 text-center">
                {player.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PlayerCardReveal = memo(function PlayerCardReveal({
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

    // 状態リセット
    const t0 = setTimeout(() => {
      setDisplayPhase("intro");
      setCurrentPlayerIndex(-1);
    }, 0);
    timers.push(t0);

    const introDuration = 2000;
    const playerInterval = 1500;

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
    <div className="absolute inset-0 overflow-hidden bg-black/80">
      {/* 背景グラデーション */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${mainColor}20 0%, transparent 70%)`,
        }}
      />

      {/* フェーズ: イントロ */}
      {displayPhase === "intro" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center gap-4 animate-lineup-zoom-in">
            <span
              className="text-[10px] font-bold tracking-[0.6em] uppercase"
              style={{ color: mainColor }}
            >
              STARTING XI
            </span>

            <div
              className="w-20 h-1 rounded-full"
              style={{ backgroundColor: mainColor }}
            />

            <h1 className="text-white text-4xl font-black tracking-[0.12em] uppercase">
              {teamInfo.teamName}
            </h1>

            <div className="flex items-center gap-3">
              <div
                className="h-px w-12"
                style={{ backgroundColor: mainColor }}
              />
              <span
                className="text-lg font-bold tracking-[0.2em]"
                style={{ color: mainColor }}
              >
                {teamInfo.formationName}
              </span>
              <div
                className="h-px w-12"
                style={{ backgroundColor: mainColor }}
              />
            </div>

            {teamInfo.manager && (
              <span className="text-slate-400 text-sm mt-2 animate-lineup-slide-up">
                {teamInfo.manager}
              </span>
            )}
          </div>
        </div>
      )}

      {/* フェーズ: 選手カードを一枚ずつ表示 */}
      {displayPhase === "players" && currentPlayerIndex >= 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          key={currentPlayerIndex}
        >
          <div className="relative z-10 flex flex-col items-center gap-4">
            <SinglePlayerCard
              player={sortedPlayers[currentPlayerIndex]}
              color={colorOf(sortedPlayers[currentPlayerIndex])}
            />

            {/* カウンター */}
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-white text-2xl font-black">
                {currentPlayerIndex + 1}
              </span>
              <span className="text-slate-600 text-sm font-bold">
                / {sortedPlayers.length}
              </span>
            </div>
          </div>

          {/* 下部の進捗ドット */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {sortedPlayers.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    i <= currentPlayerIndex ? mainColor : "#334155",
                  transform:
                    i === currentPlayerIndex ? "scale(1.5)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* フェーズ: フィナーレ - 全選手ミニカード */}
      {displayPhase === "finale" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center gap-4 animate-lineup-zoom-in w-full max-w-xl px-4">
            {/* ヘッダー */}
            <div className="flex flex-col items-center gap-1 mb-1">
              <h2 className="text-white text-2xl font-black tracking-wider uppercase">
                {teamInfo.teamName}
              </h2>
              <div className="flex items-center gap-3">
                <div
                  className="h-px w-8"
                  style={{ backgroundColor: mainColor }}
                />
                <span className="text-slate-400 text-xs font-semibold tracking-[0.3em]">
                  {teamInfo.formationName}
                </span>
                <div
                  className="h-px w-8"
                  style={{ backgroundColor: mainColor }}
                />
              </div>
            </div>

            {/* ミニカードグリッド */}
            <div className="w-full grid grid-cols-4 gap-2">
              {sortedPlayers.map((player, i) => (
                <MiniPlayerCard
                  key={player.number}
                  player={player}
                  color={colorOf(player)}
                  delay={i * 60}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
