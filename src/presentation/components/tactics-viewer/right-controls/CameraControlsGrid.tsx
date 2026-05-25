/**
 * @module CameraControlsGrid
 * @description カメラ操作グリッドコンポーネント。視点プリセットボタンと選手視点切替を表示する。
 */
import { memo } from "react";
import type { usePlayerView } from "@presentation/hooks/ui";
import type { TranslationFn } from "../types";

interface CameraControlsGridProps {
  playerView: ReturnType<typeof usePlayerView>;
  onCameraAction: (
    action: "topDown" | "sideView" | "sideViewReverse" | "reset" | null,
  ) => void;
  fieldLocked: boolean;
  onToggleFieldLock: () => void;
  t: TranslationFn;
}

export const CameraControlsGrid = memo(function CameraControlsGrid({
  playerView,
  onCameraAction,
  fieldLocked,
  onToggleFieldLock,
  t,
}: CameraControlsGridProps) {
  const cameraDisabled =
    playerView.playerViewEnabled &&
    (playerView.selectedPlayerIndex !== null ||
      playerView.selectedOpponentViewId !== null);

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
      <div className="grid grid-cols-2">
        <button
          onClick={() => onCameraAction("reset")}
          disabled={cameraDisabled}
          className={`py-1.5 px-2 transition-all duration-300 flex items-center justify-center gap-1 border-r border-b border-slate-700/50 ${cameraDisabled ? "text-slate-500 cursor-not-allowed bg-slate-800/50" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}
          aria-label={t("tactics.cameraReset")}
        >
          <span className="text-sm" aria-hidden="true">
            🏠
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {t("tactics.cameraReset")}
          </span>
        </button>
        <button
          onClick={onToggleFieldLock}
          className={`py-1.5 px-2 transition-all duration-300 flex items-center justify-center gap-1 border-b border-slate-700/50 ${fieldLocked ? "bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}
          aria-label={
            fieldLocked ? t("tactics.unlockField") : t("tactics.lockField")
          }
        >
          <span className="text-sm" aria-hidden="true">
            {fieldLocked ? "🔒" : "🔓"}
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {fieldLocked ? t("tactics.unlockField") : t("tactics.lockField")}
          </span>
        </button>
        <button
          onClick={() => onCameraAction("topDown")}
          disabled={cameraDisabled}
          className={`py-1.5 px-2 transition-all duration-300 flex items-center justify-center gap-1 border-r border-slate-700/50 ${cameraDisabled ? "text-slate-500 cursor-not-allowed bg-slate-800/50" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}
          aria-label={t("tactics.cameraTopDown")}
        >
          <span className="text-sm" aria-hidden="true">
            ⬇️
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {t("tactics.cameraTopDown")}
          </span>
        </button>
        <button
          onClick={() => onCameraAction("sideView")}
          disabled={cameraDisabled}
          className={`py-1.5 px-2 transition-all duration-300 flex items-center justify-center gap-1 border-r border-slate-700/50 ${cameraDisabled ? "text-slate-500 cursor-not-allowed bg-slate-800/50" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}
          aria-label={t("tactics.cameraSideView")}
        >
          <span className="text-sm" aria-hidden="true">
            ➡️
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {t("tactics.cameraSideView")}
          </span>
        </button>
        <button
          onClick={() => onCameraAction("sideViewReverse")}
          disabled={cameraDisabled}
          className={`py-1.5 px-2 transition-all duration-300 flex items-center justify-center gap-1 ${cameraDisabled ? "text-slate-500 cursor-not-allowed bg-slate-800/50" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"}`}
          aria-label={t("tactics.cameraSideViewReverse")}
        >
          <span className="text-sm" aria-hidden="true">
            ⬅️
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {t("tactics.cameraSideViewReverse")}
          </span>
        </button>
      </div>
    </div>
  );
});
