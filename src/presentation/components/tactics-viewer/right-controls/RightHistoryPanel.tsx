/**
 * @module RightHistoryPanel
 * @description Undo/Redo コントロールを独立したパネルとして提供 (Phase 3 split from RightControlsColumn)。
 */
import type { TranslationFn } from "../types";

interface RightHistoryPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  undoRedoEnabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  t: TranslationFn;
}

export function RightHistoryPanel({
  canUndo,
  canRedo,
  undoRedoEnabled,
  onUndo,
  onRedo,
  t,
}: RightHistoryPanelProps) {
  const SECONDARY_PANEL_CLASS =
    "bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.9)_100%)] backdrop-blur-xl rounded-[20px] border border-slate-600/35 shadow-[0_6px_16px_rgba(2,6,23,0.12),0_1px_3px_rgba(2,6,23,0.08)] overflow-hidden ring-1 ring-white/5";

  return (
    <div
      className={`hidden sm:flex ${SECONDARY_PANEL_CLASS} h-[68px] sm:h-[68px] xl:h-[86px] w-[88px] xl:w-[96px] self-stretch flex-col`}
    >
      <div className="bg-gradient-to-r from-slate-800/95 via-slate-800/90 to-slate-700/85 px-1 py-1 sm:py-1.5 border-b border-slate-600/60 flex items-center justify-center xl:justify-start xl:px-2">
        <div className="text-[10px] text-slate-300/90 font-bold tracking-[0.22em] uppercase flex items-center gap-1.5 h-5">
          <span className="w-1 h-3.5 bg-blue-500 rounded-full hidden xl:block"></span>
          <span>History</span>
        </div>
      </div>
      <div className="px-1.5 pt-0.5 pb-1 sm:px-2 sm:pt-1 sm:pb-1.5 xl:p-2 flex items-start justify-center gap-1 sm:gap-1.5 flex-1">
        <button
          onClick={onUndo}
          disabled={!canUndo || !undoRedoEnabled}
          className={`h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center ${
            canUndo && undoRedoEnabled
              ? "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5 hover:scale-105"
              : "bg-white/[0.03] border border-white/5 opacity-25 cursor-not-allowed"
          }`}
          title={`${t("tactics.undo")} (${navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Z)`}
          aria-label={t("tactics.undo")}
        >
          <span aria-hidden="true">↩️</span>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo || !undoRedoEnabled}
          className={`h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center ${
            canRedo && undoRedoEnabled
              ? "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5 hover:scale-105"
              : "bg-white/[0.03] border border-white/5 opacity-25 cursor-not-allowed"
          }`}
          title={`${t("tactics.redo")} (${navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Shift+Z)`}
          aria-label={t("tactics.redo")}
        >
          <span aria-hidden="true">↪️</span>
        </button>
      </div>
    </div>
  );
}
