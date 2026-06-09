/**
 * @module ViewLockPanel
 * @description カメラ視点ロックパネルコンポーネント。選手視点やフリー視点の切り替え操作を提供する。
 */
import { memo, useState } from "react";
import type { TranslationKey } from "@shared/i18n/translations";

type CameraAction = "topDown" | "sideView" | "sideViewReverse" | "reset";

interface ViewLockPanelProps {
  onCameraAction: (action: CameraAction) => void;
  touchlineLocked: boolean;
  onToggleTouchlineLock: () => void;
  disabled: boolean;
  t: (key: TranslationKey) => string;
}

const VIEWS: {
  action: CameraAction;
  icon: string;
  labelKey: TranslationKey;
}[] = [
  { action: "reset", icon: "🏠", labelKey: "tactics.cameraHome" },
  { action: "topDown", icon: "⬇️", labelKey: "tactics.cameraTopDown" },
  { action: "sideView", icon: "➡️", labelKey: "tactics.cameraSideView" },
  {
    action: "sideViewReverse",
    icon: "⬅️",
    labelKey: "tactics.cameraSideViewReverse",
  },
];

export const ViewLockPanel = memo(function ViewLockPanel({
  onCameraAction,
  touchlineLocked,
  onToggleTouchlineLock,
  disabled,
  t,
}: ViewLockPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const shellClass =
    "bg-[linear-gradient(180deg,rgba(15,23,42,0.94)_0%,rgba(2,6,23,0.92)_100%)] backdrop-blur-xl border border-slate-600/35 ring-1 ring-white/5 shadow-[0_8px_18px_rgba(2,6,23,0.14),0_2px_4px_rgba(2,6,23,0.08)]";
  const actionClass =
    "min-h-[56px] px-2 sm:px-2.5 transition-all duration-300 flex flex-col items-center justify-center gap-0.5";

  return (
    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 flex items-end gap-1 sm:gap-1.5">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`${shellClass} rounded-[20px] transition-all duration-300 flex items-center justify-center h-[46px] w-[36px] ${
          expanded
            ? "text-white hover:-translate-y-[1px] hover:border-slate-400/60"
            : "text-slate-400 hover:-translate-y-[1px] hover:border-slate-500/60 hover:text-slate-200"
        }`}
        aria-label={
          expanded ? t("tactics.hideControls") : t("tactics.showControls")
        }
      >
        <span className="text-sm" aria-hidden="true">
          {expanded ? "▼" : "▲"}
        </span>
      </button>
      {expanded && (
        <div
          className={`${shellClass} rounded-[22px] overflow-hidden max-w-[calc(100vw-4rem)]`}
        >
          <div className="flex flex-wrap sm:flex-nowrap">
            {VIEWS.map(({ action, icon, labelKey }) => (
              <button
                key={action}
                onClick={() => onCameraAction(action)}
                disabled={disabled}
                className={`${actionClass} ${
                  disabled
                    ? "text-slate-500 cursor-not-allowed bg-white/[0.03]"
                    : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`}
                aria-label={t(labelKey)}
              >
                <span className="text-base" aria-hidden="true">
                  {icon}
                </span>
                <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap hidden sm:block">
                  {t(labelKey)}
                </span>
              </button>
            ))}
            <button
              onClick={onToggleTouchlineLock}
              className={`${actionClass} ${
                touchlineLocked
                  ? "bg-sky-600/18 text-sky-200"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:text-white"
              }`}
              aria-label={
                touchlineLocked
                  ? t("tactics.touchlineUnlock")
                  : t("tactics.touchlineLock")
              }
            >
              <span className="text-base" aria-hidden="true">
                ↕️
              </span>
              <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap hidden sm:block">
                {touchlineLocked
                  ? t("tactics.touchlineUnlock")
                  : t("tactics.touchlineLock")}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
