/**
 * @module BroadcastReveal
 * @description 放送風のラインナップ表示アニメーションプリセット。選手をカテゴリ別にスライドイン表示する。
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

/** カードスタイルの選手表示 */
function PlayerCard({
  player,
  color,
  index,
  total,
  teamName,
  fromRight,
}: {
  player: LineupPlayer;
  color: string;
  index: number;
  total: number;
  teamName: string;
  fromRight: boolean;
}) {
  const hasMainVisual = !!player.mainVisualImageUrl;
  const hasImage = !!player.imageUrl;

  return (
    <div
      className={`w-full h-full flex ${fromRight ? "flex-row-reverse" : "flex-row"} items-center justify-center gap-8 px-8`}
      style={{
        animation: `${fromRight ? "lineup-broadcast-slide-right" : "lineup-broadcast-slide-left"} 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      {/* 選手カード */}
      <div className="flex-shrink-0 relative">
        {/* カードコンテナ */}
        <div
          className="w-52 h-72 rounded-2xl overflow-hidden shadow-2xl relative"
          style={{
            boxShadow: `0 0 60px ${color}25, 0 20px 40px rgba(0,0,0,0.5)`,
          }}
        >
          {/* カードボーダー / アクセント - 上部ストライプ */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5 z-20"
            style={{ backgroundColor: color }}
          />

          {/* カードコンテンツ */}
          {hasMainVisual ? (
            <>
              <img
                src={player.mainVisualImageUrl}
                alt={player.name}
                className="w-full h-full object-cover"
              />
              {/* テキスト可読性のための下部グラデーション */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
            </>
          ) : hasImage ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-28 h-28 rounded-full object-cover border-4"
                style={{ borderColor: color }}
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(160deg, ${color}20 0%, #0f172a 50%, ${color}10 100%)`,
              }}
            >
              <span
                className="text-8xl font-black opacity-20"
                style={{ color }}
              >
                {player.number}
              </span>
            </div>
          )}

          {/* カード下部の情報バー */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm"
              style={{ backgroundColor: `${color}30` }}
            >
              <span
                className="text-2xl font-black leading-none"
                style={{ color }}
              >
                {player.number}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-bold truncate leading-tight">
                  {player.name}
                </span>
                <span
                  className="text-[9px] font-bold tracking-wider"
                  style={{ color }}
                >
                  {CATEGORY_LABEL_SHORT[player.category] ||
                    player.positionLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* サイド情報パネル */}
      <div
        className={`flex flex-col ${fromRight ? "items-end text-right" : "items-start text-left"} max-w-[200px]`}
        style={{
          animation: "lineup-broadcast-info 0.5s ease-out 0.3s both",
        }}
      >
        {/* ポジションラベル */}
        <span
          className="text-[10px] font-bold tracking-[0.4em] uppercase mb-2"
          style={{ color }}
        >
          {CATEGORY_LABEL_SHORT[player.category] || player.positionLabel}
        </span>

        {/* 大きい背番号 */}
        <span
          className="text-6xl font-black leading-none mb-1"
          style={{ color, opacity: 0.25 }}
        >
          {player.number}
        </span>

        {/* 名前 */}
        <h2 className="text-white text-2xl font-black tracking-wide uppercase leading-tight">
          {player.name}
        </h2>

        {/* チーム */}
        <span className="text-slate-500 text-[10px] font-semibold tracking-[0.3em] uppercase mt-2">
          {teamName}
        </span>

        {/* カウンター */}
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-white text-lg font-black">{index + 1}</span>
          <span className="text-slate-600 text-xs font-bold">/ {total}</span>
        </div>
      </div>
    </div>
  );
}

/** フィナーレ: 全選手カードのグリッド表示 */
function FinaleGrid({
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
    <div className="flex flex-col items-center gap-4 animate-lineup-zoom-in w-full max-w-xl px-4">
      {/* ヘッダー */}
      <div className="flex flex-col items-center gap-1 mb-1">
        <h2 className="text-white text-2xl font-black tracking-wider uppercase">
          {teamName}
        </h2>
        <div className="flex items-center gap-3">
          <div className="h-px w-8" style={{ backgroundColor: mainColor }} />
          <span className="text-slate-400 text-xs font-semibold tracking-[0.3em]">
            {formationName}
          </span>
          <div className="h-px w-8" style={{ backgroundColor: mainColor }} />
        </div>
      </div>

      {/* 選手ミニカード */}
      <div className="w-full grid grid-cols-4 gap-2">
        {players.map((player, i) => {
          const color =
            colors[player.category as keyof typeof colors] || mainColor;
          return (
            <div
              key={player.number}
              className="animate-lineup-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="rounded-lg overflow-hidden border relative"
                style={{ borderColor: `${color}60` }}
              >
                {/* 上部アクセント */}
                <div className="h-0.5" style={{ backgroundColor: color }} />

                {/* 画像エリア */}
                <div className="aspect-[3/4] relative">
                  {player.mainVisualImageUrl ? (
                    <img
                      src={player.mainVisualImageUrl}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  ) : player.imageUrl ? (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <span
                        className="text-xl font-black opacity-30"
                        style={{ color }}
                      >
                        {player.number}
                      </span>
                    </div>
                  )}

                  {/* オーバーレイ情報 */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1.5 pt-4">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-[10px] font-black"
                        style={{ color }}
                      >
                        {player.number}
                      </span>
                      <span className="text-white text-[9px] font-semibold truncate">
                        {player.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const BroadcastReveal = memo(function BroadcastReveal({
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
    const playerInterval = 2000;

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
      const finaleDelay = sortedPlayers.length * playerInterval + 600;
      const t2 = setTimeout(() => {
        setDisplayPhase("finale");
      }, s(finaleDelay));
      timers.push(t2);

      // 完了
      const completeDelay = finaleDelay + 3500;
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
      {/* 控えめな背景 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${mainColor}12 0%, transparent 60%)`,
        }}
      />

      {/* フェーズ: イントロ */}
      {displayPhase === "intro" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center gap-4 animate-lineup-zoom-in">
            {/* STARTING LINEUP label */}
            <span
              className="text-[10px] font-bold tracking-[0.6em] uppercase"
              style={{ color: mainColor }}
            >
              STARTING LINEUP
            </span>

            {/* チームカラーバー */}
            <div
              className="w-24 h-1 rounded-full"
              style={{ backgroundColor: mainColor }}
            />

            {/* チーム名 */}
            <h1 className="text-white text-5xl font-black tracking-[0.15em] uppercase">
              {teamInfo.teamName}
            </h1>

            {/* フォーメーション */}
            <div className="flex items-center gap-4">
              <div
                className="h-px w-16"
                style={{ backgroundColor: mainColor }}
              />
              <span
                className="text-lg font-bold tracking-[0.3em]"
                style={{ color: mainColor }}
              >
                {teamInfo.formationName}
              </span>
              <div
                className="h-px w-16"
                style={{ backgroundColor: mainColor }}
              />
            </div>

            {/* 監督 */}
            {teamInfo.manager && (
              <span className="text-slate-400 text-sm mt-2 animate-lineup-slide-up">
                {teamInfo.manager}
              </span>
            )}
          </div>
        </div>
      )}

      {/* フェーズ: 選手表示 - 一人ずつカード表示 */}
      {displayPhase === "players" && currentPlayerIndex >= 0 && (
        <div className="absolute inset-0" key={currentPlayerIndex}>
          <PlayerCard
            player={sortedPlayers[currentPlayerIndex]}
            color={colorOf(sortedPlayers[currentPlayerIndex])}
            index={currentPlayerIndex}
            total={sortedPlayers.length}
            teamName={teamInfo.teamName}
            fromRight={currentPlayerIndex % 2 === 1}
          />

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

      {/* フェーズ: フィナーレ - 全選手カード */}
      {displayPhase === "finale" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10">
            <FinaleGrid
              players={sortedPlayers}
              colors={teamInfo.colors}
              teamName={teamInfo.teamName}
              formationName={teamInfo.formationName}
              mainColor={mainColor}
            />
          </div>
        </div>
      )}
    </div>
  );
});
