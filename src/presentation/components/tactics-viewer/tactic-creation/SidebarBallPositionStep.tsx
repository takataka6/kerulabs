/**
 * @module SidebarBallPositionStep
 * @description タクティクス作成サイドバーのボール位置設定ステップ。フィールド上でボール配置位置を指定する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import {
  STEP_INDICATOR,
  SECTION_TITLE,
  SIDEBAR_BTN_PRIMARY,
  SIDEBAR_BTN_DISABLED,
  SIDEBAR_BTN_SECONDARY,
  SIDEBAR_SECTION,
} from "./constants";

interface SidebarBallPositionStepProps {
  creation: CreationState;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
}

export const SidebarBallPositionStep = memo(function SidebarBallPositionStep({
  creation,
  t,
  onWizardStep,
}: SidebarBallPositionStepProps) {
  const hasBallPos = creation.ballPosition !== null;

  return (
    <div className="flex flex-col gap-0">
      <div className={SIDEBAR_SECTION}>
        <div className="text-center mb-2">
          <h3
            className={`${SECTION_TITLE} flex items-center justify-center gap-1.5`}
          >
            <span>⚽</span>
            <span>{t("tactics.creation.ballPosition")}</span>
          </h3>
          <p className={STEP_INDICATOR}>
            {t("tactics.creation.stepIndicator")
              .replace("{current}", "2")
              .replace("{total}", "6")}
          </p>
        </div>
        <p className="text-slate-400 text-xs text-center mb-2">
          {t("tactics.creation.ballPositionHint")}
        </p>
        {hasBallPos && (
          <div className="flex justify-center mb-1">
            <span className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 rounded-lg px-2 py-1 text-teal-400 text-[11px] font-medium">
              ✓ ({creation.ballPosition!.x.toFixed(1)},{" "}
              {creation.ballPosition!.z.toFixed(1)})
            </span>
          </div>
        )}
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <button
          type="button"
          onClick={() => onWizardStep("ballTrajectory")}
          disabled={!hasBallPos}
          className={
            hasBallPos
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
          onClick={() => onWizardStep("metadata")}
          className={SIDEBAR_BTN_SECONDARY}
        >
          <span>←</span> {t("tactics.creation.back")}
        </button>
      </div>
    </div>
  );
});
