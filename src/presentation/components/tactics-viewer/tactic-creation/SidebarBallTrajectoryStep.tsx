/**
 * @module SidebarBallTrajectoryStep
 * @description タクティクス作成サイドバーのボール軌道設定ステップ。ボールの飛行軌道タイプと着地点を指定する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import {
  TRAJECTORY_OPTIONS,
  STEP_INDICATOR,
  SECTION_TITLE,
  SIDEBAR_BTN_PRIMARY,
  SIDEBAR_BTN_DISABLED,
  SIDEBAR_BTN_SECONDARY,
  SIDEBAR_SECTION,
} from "./constants";

interface SidebarBallTrajectoryStepProps {
  creation: CreationState;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
  onTrajectoryTypeChange?: (type: TrajectoryType) => void;
}

export const SidebarBallTrajectoryStep = memo(
  function SidebarBallTrajectoryStep({
    creation,
    t,
    onWizardStep,
    onTrajectoryTypeChange,
  }: SidebarBallTrajectoryStepProps) {
    const hasTrajectory = creation.ballTrajectory !== null;

    return (
      <div className="flex flex-col gap-0">
        <div className={SIDEBAR_SECTION}>
          <div className="text-center mb-2">
            <h3
              className={`${SECTION_TITLE} flex items-center justify-center gap-1.5`}
            >
              <span>🎯</span>
              <span>{t("tactics.creation.ballLanding")}</span>
            </h3>
            <p className={STEP_INDICATOR}>
              {t("tactics.creation.stepIndicator")
                .replace("{current}", "3")
                .replace("{total}", "6")}
            </p>
          </div>
          <p className="text-slate-400 text-xs text-center mb-2">
            {t("tactics.creation.ballLandingHint")}
          </p>
          {hasTrajectory && (
            <div className="flex justify-center mb-2">
              <span className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 rounded-lg px-2 py-1 text-teal-400 text-[11px] font-medium">
                ✓ ({creation.ballTrajectory!.endX.toFixed(1)},{" "}
                {creation.ballTrajectory!.endZ.toFixed(1)})
              </span>
            </div>
          )}
          {/* 軌道タイプセレクター */}
          {hasTrajectory && (
            <div className="mb-1">
              <label className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-1 block">
                {t("tactics.creation.trajectoryType")}
              </label>
              <div className="grid grid-cols-2 gap-1">
                {TRAJECTORY_OPTIONS.map((opt) => {
                  const isActive =
                    (creation.ballTrajectory?.trajectoryType ?? "high") ===
                    opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => onTrajectoryTypeChange?.(opt.type)}
                      aria-label={t(opt.labelKey)}
                      aria-pressed={isActive}
                      className={`flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-teal-600/30 text-teal-300 ring-1 ring-teal-500/50"
                          : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{t(opt.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="px-3 py-2 space-y-1.5">
          <button
            type="button"
            onClick={() => onWizardStep("setPosition")}
            disabled={!hasTrajectory}
            className={
              hasTrajectory
                ? SIDEBAR_BTN_PRIMARY.replace(
                    "bg-emerald-600",
                    "bg-teal-600",
                  ).replace("hover:bg-emerald-500", "hover:bg-teal-500")
                : SIDEBAR_BTN_DISABLED
            }
          >
            <span>{t("tactics.creation.next")}</span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={() => onWizardStep("setPosition")}
            className={SIDEBAR_BTN_SECONDARY}
          >
            {t("tactics.creation.skip")}
          </button>
          <button
            type="button"
            onClick={() => onWizardStep("ballPosition")}
            className={SIDEBAR_BTN_SECONDARY}
          >
            <span>←</span> {t("tactics.creation.back")}
          </button>
        </div>
      </div>
    );
  },
);
