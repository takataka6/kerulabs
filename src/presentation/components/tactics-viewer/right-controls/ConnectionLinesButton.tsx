/**
 * @module ConnectionLinesButton
 * @description 接続ライン操作ボタンコンポーネント。ライン描画モード切替・色選択・全削除ボタンを表示する。
 */
import { memo } from "react";
import type { useConnectionLines } from "@presentation/hooks/field";
import type { TranslationFn } from "../types";

const LINE_COLORS = [
  { hex: "#22d3ee", name: "Cyan" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#ffffff", name: "White" },
] as const;

interface ConnectionLinesButtonProps {
  connLines: ReturnType<typeof useConnectionLines>;
  t: TranslationFn;
  className?: string;
}

export const ConnectionLinesButton = memo(function ConnectionLinesButton({
  connLines,
  t,
  className = "",
}: ConnectionLinesButtonProps) {
  return (
    <div
      className={`bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.9)_100%)] backdrop-blur-xl rounded-[20px] border shadow-[0_6px_16px_rgba(2,6,23,0.12),0_1px_3px_rgba(2,6,23,0.08)] ring-1 ring-white/5 overflow-hidden ${className} ${connLines.lineDrawingMode ? "border-cyan-500/45" : "border-slate-600/35"}`}
    >
      <div className="flex items-center">
        <button
          onClick={connLines.toggleLineDrawing}
          className={`flex-1 min-h-[42px] py-1.5 px-2 sm:py-2 sm:px-2.5 xl:py-2 xl:px-3 transition-all duration-300 flex items-center justify-center gap-1.5 ${connLines.lineDrawingMode ? "bg-cyan-600/18 text-cyan-200 hover:bg-cyan-600/24" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"}`}
          aria-label={t("tactics.connectionLines")}
        >
          <span className="text-xs sm:text-sm" aria-hidden="true">
            ✏️
          </span>
          <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
            {t("tactics.connectionLines")}
          </span>
          {connLines.connectionLines.length > 0 && (
            <span className="text-[9px] bg-white/8 text-slate-200 px-1.5 py-0.5 rounded-full border border-white/10">
              {connLines.connectionLines.length}
            </span>
          )}
        </button>
        {connLines.connectionLines.length > 0 && (
          <button
            onClick={connLines.clearConnectionLines}
            className="py-1.5 px-2 sm:py-2 sm:px-2.5 transition-all duration-300 text-slate-500 hover:text-white hover:bg-white/[0.06] border-l border-slate-700/50"
            title={t("tactics.connectionLines.clear")}
            aria-label={t("tactics.connectionLines.clear")}
          >
            <span className="text-[10px]" aria-hidden="true">
              ✕
            </span>
          </button>
        )}
      </div>
      {connLines.lineDrawingMode && (
        <div className="border-t border-slate-700/50 px-2.5 py-2 flex items-center gap-1.5 justify-center">
          {LINE_COLORS.map(({ hex, name }) => (
            <button
              key={hex}
              onClick={() => connLines.setLineColor(hex)}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${connLines.lineColor === hex ? "border-white scale-125" : "border-slate-600 hover:border-slate-400"}`}
              style={{ backgroundColor: hex }}
              aria-label={t("a11y.lineColor").replace("{color}", name)}
            />
          ))}
        </div>
      )}
    </div>
  );
});
