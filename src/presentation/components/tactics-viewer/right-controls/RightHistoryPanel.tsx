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
      className={`hidden sm:flex ${SECONDARY_PANEL_CLASS} h-[54px] sm:h-[54px] xl:h-[72px] w-[76px] xl:w-[88px] self-stretch flex-col`}
    >
      <div className="px-1.5 py-1 sm:px-2 sm:py-1.5 xl:p-2 flex items-center justify-center gap-0.5 sm:gap-1 flex-1">
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
