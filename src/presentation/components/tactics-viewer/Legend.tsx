/**
 * @module Legend
 * @description タクティクスビューアーの凡例コンポーネント。矢印色やマーカーの意味を表示する。
 */
import { memo } from "react";
import type { ColorsData, Opponent, TranslationFn } from "./types";

interface LegendProps {
  colorsData: ColorsData;
  opponents: Opponent[];
  captureMode: boolean;
  t: TranslationFn;
}

export const Legend = memo(function Legend({
  colorsData,
  opponents,
  captureMode,
  t,
}: LegendProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 xl:bottom-6 xl:right-6 z-10 bg-slate-900/95 backdrop-blur-xl rounded-2xl px-3 py-2 xl:px-5 xl:py-3 border border-slate-700/50 shadow-2xl ${captureMode ? "hidden" : ""}`}
    >
      <div className="flex items-center gap-2.5 xl:gap-4">
        <div className="flex items-center gap-1.5 xl:gap-2">
          <div
            className="w-4 h-4 xl:w-5 xl:h-5 rounded-full shadow-lg"
            style={{ backgroundColor: colorsData.df }}
          ></div>
          <span className="text-slate-300 text-[10px] xl:text-xs font-bold tracking-wide">
            {t("tactics.legend.myTeam")}
          </span>
        </div>
        {opponents.length > 0 && (
          <div className="flex items-center gap-1.5 xl:gap-2">
            <div
              className="w-4 h-4 xl:w-5 xl:h-5 rounded-full shadow-lg"
              style={{
                backgroundColor: opponents[0]?.color || "#1e1e1e",
              }}
            ></div>
            <span className="text-slate-300 text-[10px] xl:text-xs font-bold tracking-wide">
              {t("tactics.legend.opponent")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
