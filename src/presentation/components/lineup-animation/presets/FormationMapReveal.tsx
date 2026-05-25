/**
 * @module FormationMapReveal
 * @description フォーメーションマップ風のラインナップ表示アニメーションプリセット。ピッチ上の配置図で選手を表示する。
 */
import { useState, useEffect, useRef, memo } from "react";
import type { LineupAnimationProps, LineupPlayer } from "../types";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";
import { CATEGORY_LABEL_SHORT, getMainColor, getPlayerColor } from "./shared";

type DisplayPhase = "intro" | "counting" | "complete";

function PlayerSlot({
  player,
  color,
  index,
  visible,
}: {
  player: LineupPlayer;
  color: string;
  index: number;
  visible: boolean;
}) {
  return (
    <div
      className="overflow-hidden transition-all duration-400"
      style={{
        maxHeight: visible ? "48px" : "0px",
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-3 py-1 px-3 rounded-lg bg-white/5 backdrop-blur-sm">
        {/* インデックス */}
        <span className="text-slate-500 text-[10px] font-mono w-4 text-right flex-shrink-0">
          {(index + 1).toString().padStart(2, "0")}
        </span>

        {/* 写真またはカラードット */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border"
          style={{
            borderColor: `${color}60`,
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
            <span className="text-white text-[10px] font-bold">
              {player.number}
            </span>
          )}
        </div>

        {/* 背番号 */}
        <span
          className="text-base font-black w-7 text-center flex-shrink-0"
          style={{ color }}
        >
          {player.number}
        </span>

        {/* 区切り線 */}
        <div className="w-px h-5 bg-slate-700 flex-shrink-0" />

        {/* 名前 */}
        <span className="text-white text-sm font-semibold truncate flex-1">
          {player.name}
        </span>

        {/* ポジションバッジ */}
        <span
          className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {player.positionLabel || CATEGORY_LABEL_SHORT[player.category] || ""}
        </span>
      </div>
    </div>
  );
}

export const FormationMapReveal = memo(function FormationMapReveal({
  players,
  teamInfo,
  phase,
  onComplete,
}: LineupAnimationProps) {
  const [displayPhase, setDisplayPhase] = useState<DisplayPhase>("intro");
  const [revealedCount, setRevealedCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mainColor = getMainColor(teamInfo.colors);

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
      setRevealedCount(0);
    }, 0);
    timers.push(t0);

    const introDuration = 1500;
    const perPlayer = 350;

    // カウント開始
    const t1 = setTimeout(() => {
      setDisplayPhase("counting");

      players.forEach((_p, i) => {
        const t = setTimeout(
          () => {
            setRevealedCount(i + 1);
          },
          s(i * perPlayer),
        );
        timers.push(t);
      });

      // 完了フェーズ
      const allRevealedDelay = players.length * perPlayer + 400;
      const t2 = setTimeout(() => {
        setDisplayPhase("complete");
      }, s(allRevealedDelay));
      timers.push(t2);

      // 完了を通知
      const t3 = setTimeout(
        () => {
          onComplete();
        },
        s(allRevealedDelay + 2500),
      );
      timers.push(t3);
    }, s(introDuration));
    timers.push(t1);

    timersRef.current = timers;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [phase, players, onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 暗い背景 */}
      <div className="absolute inset-0 bg-black/90 animate-fade-in" />

      {/* 背景グロー */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] aspect-square rounded-full blur-[100px] opacity-[0.07]"
        style={{ backgroundColor: mainColor }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-4">
        {/* カードコンテナ */}
        <div
          className="w-full rounded-2xl border overflow-hidden"
          style={{ borderColor: `${mainColor}30` }}
        >
          {/* カードヘッダー */}
          <div
            className={`px-5 py-4 text-center transition-all duration-600 ${
              displayPhase === "intro" ? "animate-lineup-zoom-in" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, ${mainColor}25 0%, ${mainColor}08 100%)`,
            }}
          >
            <div
              className="text-[9px] font-bold tracking-[0.5em] uppercase mb-1"
              style={{ color: mainColor }}
            >
              STARTING LINE-UP
            </div>
            <h1 className="text-white text-2xl font-black tracking-wider uppercase">
              {teamInfo.teamName}
            </h1>
            <span className="text-slate-400 text-xs font-semibold tracking-widest">
              {teamInfo.formationName}
            </span>
          </div>

          {/* 区切り線 */}
          <div className="h-px" style={{ backgroundColor: `${mainColor}30` }} />

          {/* 選手リスト */}
          <div className="px-2 py-2 flex flex-col gap-0.5 bg-black/30">
            {(displayPhase === "counting" || displayPhase === "complete") &&
              players.map((player, i) => (
                <PlayerSlot
                  key={player.number}
                  player={player}
                  color={colorOf(player)}
                  index={i}
                  visible={i < revealedCount}
                />
              ))}
          </div>

          {/* カードフッター - カウンター & 監督 */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${mainColor}15 0%, transparent 100%)`,
            }}
          >
            {/* 選手カウンター */}
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-black transition-all duration-300"
                style={{ color: mainColor }}
              >
                {revealedCount}
              </span>
              <span className="text-slate-500 text-xs font-semibold">
                / {players.length}
              </span>
            </div>

            {/* 監督 */}
            {teamInfo.manager && (
              <span className="text-slate-500 text-[10px] font-medium truncate ml-4">
                {teamInfo.manager}
              </span>
            )}
          </div>
        </div>

        {/* 完了フラッシュ */}
        {displayPhase === "complete" && (
          <div className="mt-4 animate-lineup-slide-up">
            <span
              className="text-xs font-bold tracking-[0.4em] uppercase"
              style={{ color: mainColor }}
            >
              SQUAD CONFIRMED
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
