/**
 * @module BackgroundSettingsPanel
 * @description 背景設定パネルのトグルボタンコンポーネント。
 * パネルコンテンツは BackgroundSettingsPanelContent として TacticsMainContent に直接配置される。
 */
import { memo } from "react";
import type { useBackgroundSettings } from "@presentation/hooks/ui";
import type { TranslationFn } from "../types";

interface BackgroundSettingsPanelProps {
  bgSettings: ReturnType<typeof useBackgroundSettings>;
  t: TranslationFn;
  className?: string;
}

export const BackgroundSettingsPanel = memo(function BackgroundSettingsPanel({
  bgSettings,
  t,
  className = "",
}: BackgroundSettingsPanelProps) {
  return (
    <div className={className}>
      <button
        onClick={() => bgSettings.setShowSceneBgSettings((prev) => !prev)}
        className={`relative w-full min-h-[36px] py-1 px-1.5 sm:py-1.5 sm:px-2 xl:py-1.5 xl:px-2.5 rounded-[20px] border shadow-[0_6px_16px_rgba(2,6,23,0.12),0_1px_3px_rgba(2,6,23,0.08)] ring-1 ring-white/5 transition-all duration-300 flex items-center justify-center gap-1.5 ${bgSettings.showSceneBgSettings ? "border-slate-400/55 bg-[linear-gradient(180deg,rgba(51,65,85,0.95)_0%,rgba(30,41,59,0.95)_100%)] text-white hover:border-slate-300/60" : "border-slate-600/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.9)_100%)] text-slate-300 hover:-translate-y-[1px] hover:border-slate-500/50 hover:text-white"}`}
        aria-label={t("tactics.sceneBackground")}
        aria-expanded={bgSettings.showSceneBgSettings}
      >
        <span className="text-xs sm:text-sm" aria-hidden="true">
          🎨
        </span>
        <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
          {t("tactics.sceneBackground")}
        </span>
      </button>
    </div>
  );
});
