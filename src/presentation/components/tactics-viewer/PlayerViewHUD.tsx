/**
 * @module PlayerViewHUD
 * @description 選手視点モードのHUD（ヘッドアップディスプレイ）コンポーネント。選手名・ポジション・視点情報を表示する。
 */
import { memo } from "react";
import type { ColorsData, PlayerData, Opponent, TranslationFn } from "./types";

interface PlayerViewHUDProps {
  playerViewEnabled: boolean;
  selectedPlayerIndex: number | null;
  selectedOpponentViewId: number | null;
  captureMode: boolean;
  playersData: PlayerData[];
  colorsData: ColorsData;
  opponents: Opponent[];
  showPlayerNames: boolean;
  showPlayerNumbers: boolean;
  showOpponentNames: boolean;
  showOpponentNumbers: boolean;
  isFirstPerson: boolean;
  onExitPlayerView: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onTogglePerspective: () => void;
  t: TranslationFn;
}

export const PlayerViewHUD = memo(function PlayerViewHUD({
  playerViewEnabled,
  selectedPlayerIndex,
  selectedOpponentViewId,
  captureMode,
  playersData,
  colorsData,
  opponents,
  showPlayerNames,
  showPlayerNumbers,
  showOpponentNames,
  showOpponentNumbers,
  isFirstPerson,
  onExitPlayerView,
  onRotateLeft,
  onRotateRight,
  onTogglePerspective,
  t,
}: PlayerViewHUDProps) {
  if (!playerViewEnabled) return null;

  // 撮影モード: 選手選択中はメインビジュアルを大きく表示
  if (captureMode) {
    if (selectedPlayerIndex !== null) {
      const player = playersData[selectedPlayerIndex];
      if (!player) return null;
      return (
        <div className="absolute bottom-6 left-6 z-20 flex flex-col items-start animate-slide-up">
          <div className="relative w-40 xl:w-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {player.mainVisualImageUrl ? (
              <img
                src={player.mainVisualImageUrl}
                alt={player.name}
                className="w-full object-cover"
                style={{ aspectRatio: "3/4" }}
              />
            ) : (
              <div
                className="w-full flex items-center justify-center text-white text-4xl xl:text-6xl font-bold"
                style={{
                  aspectRatio: "3/4",
                  backgroundColor: colorsData.df,
                }}
              >
                {player.number}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-3 xl:px-4 xl:py-4">
              {showPlayerNames && (
                <p className="text-white font-bold text-sm xl:text-base leading-tight">
                  {player.name}
                </p>
              )}
              {showPlayerNumbers && (
                <p className="text-slate-300 text-xs xl:text-sm">
                  #{player.number}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (selectedOpponentViewId !== null) {
      const opp = opponents.find((o) => o.id === selectedOpponentViewId);
      if (!opp) return null;
      return (
        <div className="absolute bottom-6 left-6 z-20 flex flex-col items-start animate-slide-up">
          <div
            className="w-40 xl:w-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center text-white text-4xl xl:text-6xl font-bold"
            style={{
              aspectRatio: "3/4",
              backgroundColor: opp.color ?? "#475569",
            }}
          >
            {showOpponentNumbers ? (opp.playerNumber ?? "?") : "?"}
          </div>
          <div className="mt-2 px-1">
            {showOpponentNames && (
              <p className="text-white font-bold text-sm xl:text-base">
                {opp.playerName || `#${opp.playerNumber ?? opp.id}`}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  // プレイヤービュー: プロンプト（有効だが選手未選択）
  if (selectedPlayerIndex === null && selectedOpponentViewId === null) {
    return (
      <div className="absolute top-2 sm:top-4 xl:top-6 left-1/2 -translate-x-1/2 bg-amber-900/90 backdrop-blur-xl rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 xl:px-6 xl:py-3 border border-amber-500/50 shadow-2xl animate-slide-down z-20 max-w-[90vw]">
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className="text-base sm:text-lg animate-pulse"
            aria-hidden="true"
          >
            📹
          </span>
          <span className="text-amber-200 font-semibold text-sm xl:text-base tracking-wide">
            {t("tactics.playerView.selectPrompt")}
          </span>
        </div>
      </div>
    );
  }

  // 視点操作ボタン群（上段: 視点切替、下段: 左回転・終了・右回転）
  const bottomControls = (
    <div className="absolute bottom-12 sm:bottom-16 xl:bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      {/* 上段: 視点切替 */}
      <button
        onClick={onTogglePerspective}
        className={`backdrop-blur-xl rounded-2xl px-4 py-2.5 xl:px-5 xl:py-3 border shadow-2xl transition-all duration-300 flex items-center gap-1.5 ${
          isFirstPerson
            ? "bg-amber-700/90 border-amber-500/50 hover:bg-amber-600"
            : "bg-slate-900/95 border-slate-700/50 hover:bg-slate-800"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 text-slate-200"
        >
          {isFirstPerson ? (
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          ) : (
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          )}
        </svg>
        <span className="text-slate-200 font-semibold text-sm tracking-wide hidden sm:inline">
          {isFirstPerson
            ? t("tactics.playerView.firstPerson")
            : t("tactics.playerView.thirdPerson")}
        </span>
      </button>

      {/* 下段: 左回転・終了・右回転 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRotateLeft}
          aria-label={t("tactics.playerView.rotateLeft")}
          className="bg-slate-900/95 backdrop-blur-xl rounded-2xl px-4 py-2.5 xl:px-5 xl:py-3 border border-slate-700/50 shadow-2xl hover:bg-slate-800 active:bg-slate-700 transition-all duration-300 flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-slate-200"
          >
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-slate-200 font-semibold text-sm tracking-wide hidden sm:inline">
            {t("tactics.playerView.rotateLeft")}
          </span>
        </button>

        <button
          onClick={onExitPlayerView}
          className="bg-slate-900/95 backdrop-blur-xl rounded-2xl px-5 py-2.5 xl:px-6 xl:py-3 border border-slate-700/50 shadow-2xl hover:bg-slate-800 transition-all duration-300 flex items-center gap-2"
        >
          <span className="text-base" aria-hidden="true">
            🔙
          </span>
          <span className="text-slate-200 font-semibold text-sm tracking-wide">
            {t("tactics.playerView.exit")}
          </span>
        </button>

        <button
          onClick={onRotateRight}
          aria-label={t("tactics.playerView.rotateRight")}
          className="bg-slate-900/95 backdrop-blur-xl rounded-2xl px-4 py-2.5 xl:px-5 xl:py-3 border border-slate-700/50 shadow-2xl hover:bg-slate-800 active:bg-slate-700 transition-all duration-300 flex items-center gap-1.5"
        >
          <span className="text-slate-200 font-semibold text-sm tracking-wide hidden sm:inline">
            {t("tactics.playerView.rotateRight")}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-slate-200"
          >
            <path
              fillRule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  // プレイヤービュー: 自チーム選手追跡中HUD
  if (selectedPlayerIndex !== null) {
    return (
      <>
        <div className="absolute top-2 sm:top-4 xl:top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 xl:px-6 xl:py-3 max-w-[90vw] border-2 border-amber-500/50 shadow-2xl z-20">
          <div className="flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">
              📹
            </span>
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">
              {t("tactics.playerView.following")}
            </span>
            {showPlayerNumbers && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                style={{ backgroundColor: colorsData.df }}
              >
                {playersData[selectedPlayerIndex]?.number ||
                  selectedPlayerIndex + 1}
              </div>
            )}
            {showPlayerNames && (
              <span className="text-white font-bold text-sm xl:text-base tracking-wide">
                {playersData[selectedPlayerIndex]?.name ||
                  `#${selectedPlayerIndex + 1}`}
              </span>
            )}
          </div>
        </div>
        {bottomControls}
      </>
    );
  }

  // プレイヤービュー: 相手選手追跡中HUD
  if (selectedOpponentViewId !== null) {
    const opp = opponents.find((o) => o.id === selectedOpponentViewId);
    if (!opp) return null;
    return (
      <>
        <div className="absolute top-2 sm:top-4 xl:top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 xl:px-6 xl:py-3 max-w-[90vw] border-2 border-red-500/50 shadow-2xl z-20">
          <div className="flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">
              📹
            </span>
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase">
              {t("tactics.playerView.followingOpponent")}
            </span>
            {showOpponentNumbers && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md bg-slate-600"
                style={opp.color ? { backgroundColor: opp.color } : undefined}
              >
                {opp.playerNumber ?? "?"}
              </div>
            )}
            {showOpponentNames && (
              <span className="text-white font-bold text-sm xl:text-base tracking-wide">
                {opp.playerName || `#${opp.playerNumber ?? opp.id}`}
              </span>
            )}
          </div>
        </div>
        {bottomControls}
      </>
    );
  }

  return null;
});
