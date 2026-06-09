/**
 * @module ImageCaptureLayout
 * @description 画像撮影モード時の専用レイアウトコンポーネント。
 * 選択されたプリセットに応じて、3Dキャンバスの上に透過HUDカードを重ねることで、
 * フィールドと一体化したクールな画像撮影レイアウトを実現します。
 */
import { type ReactNode, memo } from "react";
import type { Player } from "@domain/entities/Player";
import type { Formation } from "@domain/entities/Formation";
import { getPositionBg } from "@shared/constants/positionColors";
import type { CardStatus, TranslationFn } from "./types";
import type { SubstitutionRecord } from "./SubstitutesPanel";

interface ImageCaptureLayoutProps {
  presetId: string;
  canvas: ReactNode;
  customSquad: (Player | null)[];
  currentFormation: Formation;
  playerCards: Record<number, CardStatus>;
  substitutionRecords: SubstitutionRecord[];
  teamName: string;
  t: TranslationFn;
}

export const ImageCaptureLayout = memo(function ImageCaptureLayout({
  presetId,
  canvas,
  customSquad,
  currentFormation,
  playerCards,
  substitutionRecords,
  teamName,
  t,
}: ImageCaptureLayoutProps) {
  const positionsLength = currentFormation?.positions?.length ?? 0;

  // スターティングメンバー
  const starters = customSquad
    .slice(0, positionsLength)
    .map((player, index) => {
      if (!player) return null;
      const pos = currentFormation.positions?.[index];
      const bgColor = getPositionBg(pos?.category);
      const card = playerCards[index] || "none";
      return { player, pos, bgColor, card, index };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // 控え選手
  const substitutes = customSquad
    .slice(positionsLength)
    .map((player, i) => ({
      player,
      originalIndex: positionsLength + i,
    }))
    .filter(
      (entry): entry is { player: Player; originalIndex: number } =>
        entry.player !== null,
    );

  // ── 各種共通部分テンプレート ──

  // スタメンリストカード
  const renderStartersList = (showTitle = true, className = "") => (
    <div
      className={`backdrop-blur-md bg-slate-950/35 border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-fade-in ${className}`}
    >
      {showTitle && (
        <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
          <span className="w-1.5 h-4 bg-emerald-400 rounded-full" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {t("tactics.squad")} • {currentFormation.name}
          </h3>
        </div>
      )}
      <div className="space-y-1 overflow-y-auto hud-scrollbar flex-1 pr-1">
        {starters.map(({ player, pos, bgColor, card }) => (
          <div
            key={player.id.value}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
          >
            <div
              className={`w-6 h-6 ${bgColor} rounded-lg flex items-center justify-center text-white font-bold text-[10px] shadow-md`}
            >
              {player.number}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {player.name}
              </p>
              {pos && (
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                  {pos.pos}
                </p>
              )}
            </div>
            {card !== "none" && (
              <span className="flex items-center gap-0.5">
                {card === "yellow" && (
                  <span className="w-2 h-3 rounded-[1px] bg-yellow-400 shadow-sm" />
                )}
                {card === "double_yellow" && (
                  <>
                    <span className="w-2 h-3 rounded-[1px] bg-yellow-400 shadow-sm" />
                    <span className="w-2 h-3 rounded-[1px] bg-yellow-400 shadow-sm" />
                  </>
                )}
                {card === "red" && (
                  <span className="w-2 h-3 rounded-[1px] bg-red-500 shadow-sm" />
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // 控え & 交代リストカード
  const renderSubsList = (showTitle = true, className = "") => (
    <div
      className={`backdrop-blur-md bg-slate-950/35 border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-fade-in ${className}`}
    >
      {showTitle && (
        <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
          <span className="w-1.5 h-4 bg-purple-400 rounded-full" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {t("tactics.substitutes")} • {substitutes.length}
          </h3>
        </div>
      )}
      <div className="space-y-1.5 overflow-y-auto hud-scrollbar flex-1 pr-1">
        {substitutes.map(({ player }) => {
          const bgColor = getPositionBg(player.position);
          return (
            <div
              key={player.id.value}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.01] border border-white/5"
            >
              <div
                className={`w-5.5 h-5.5 ${bgColor} rounded-md flex items-center justify-center text-white font-bold text-[9px] shadow-sm`}
              >
                {player.number}
              </div>
              <span className="text-xs font-medium text-slate-300 truncate">
                {player.name}
              </span>
            </div>
          );
        })}

        {substitutionRecords.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-3.5 bg-red-500 rounded-full"></span>
              {t("tactics.substitution.title")}
            </div>
            <div className="space-y-1.5">
              {substitutionRecords.map((record, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/5 rounded-xl px-2.5 py-2 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-green-400 w-5">
                      IN
                    </span>
                    <div
                      className={`w-5 h-5 ${getPositionBg(record.inPlayer.position)} rounded flex items-center justify-center text-white font-bold text-[9px]`}
                    >
                      {record.inPlayer.number}
                    </div>
                    <span className="text-slate-200 text-xs font-medium truncate">
                      {record.inPlayer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-red-400 w-5">
                      OUT
                    </span>
                    <div
                      className={`w-5 h-5 ${getPositionBg(record.outPlayer.position)} rounded flex items-center justify-center text-white font-bold text-[9px] opacity-40`}
                    >
                      {record.outPlayer.number}
                    </div>
                    <span className="text-slate-400 text-xs font-medium truncate line-through">
                      {record.outPlayer.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── 全画面背景レイアウトのレンダリング ──
  const renderLayout = (overlays: ReactNode) => (
    <div
      id="capture-area"
      className="w-full h-full relative overflow-hidden bg-slate-950"
    >
      {/* 透過HUD用カスタムスクロールバースタイル */}
      <style>{`
        .hud-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .hud-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hud-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
        }
        .hud-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      {/* 3Dフィールド（全画面背景） */}
      <div className="absolute inset-0 z-0 w-full h-full">{canvas}</div>

      {/* HUDオーバーレイ */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="w-full h-full relative p-6">{overlays}</div>
      </div>
    </div>
  );

  // ── プリセットに応じたレイアウトの切り替え ──
  switch (presetId) {
    case "squad-and-sub":
      return renderLayout(
        <>
          {renderStartersList(
            true,
            "absolute left-6 top-6 bottom-6 w-72 max-h-[85vh]",
          )}
          {renderSubsList(
            true,
            "absolute right-6 top-6 bottom-6 w-72 max-h-[85vh]",
          )}
        </>,
      );

    case "split-field-squad":
      return renderLayout(
        renderStartersList(
          true,
          "absolute right-6 top-6 bottom-6 w-80 max-h-[85vh]",
        ),
      );

    case "cinematic-all":
      return renderLayout(
        <>
          {renderStartersList(
            true,
            "absolute left-8 top-8 bottom-8 w-64 max-h-[80vh] bg-slate-950/20 backdrop-blur-[6px] border-white/5",
          )}
          {renderSubsList(
            true,
            "absolute right-8 top-8 bottom-8 w-64 max-h-[80vh] bg-slate-950/20 backdrop-blur-[6px] border-white/5",
          )}
        </>,
      );

    case "magazine-showcase":
      return renderLayout(
        <>
          {/* マガジン風ショーケースヘッダー */}
          <div className="absolute top-6 left-6 right-6 backdrop-blur-md bg-slate-950/45 border border-white/10 rounded-2xl px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between bg-gradient-to-r from-slate-950/60 via-slate-900/10 to-slate-950/60 pointer-events-auto animate-fade-in">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400/90">
                Team Showcase
              </p>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 uppercase tracking-wide">
                {teamName}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Formation
              </p>
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                {currentFormation.name}
              </span>
            </div>
          </div>
          {renderStartersList(
            true,
            "absolute top-28 left-6 bottom-6 w-72 max-h-[70vh]",
          )}
          {renderSubsList(
            true,
            "absolute top-28 right-6 bottom-6 w-72 max-h-[70vh]",
          )}
        </>,
      );

    case "field-only":
    default:
      // フィールドのみ
      return renderLayout(null);
  }
});
