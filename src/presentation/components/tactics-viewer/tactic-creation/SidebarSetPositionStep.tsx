/**
 * @module SidebarSetPositionStep
 * @description タクティクス作成サイドバーのセットポジション設定ステップ。セットプレー時の選手初期配置を指定する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import {
  getCreationMode,
  type CreationState,
  type WizardStep,
} from "@presentation/hooks/tactic";
import {
  STEP_INDICATOR,
  SECTION_TITLE,
  SIDEBAR_BTN_PRIMARY,
  SIDEBAR_BTN_SECONDARY,
  SIDEBAR_SECTION,
} from "./constants";

interface SidebarSetPositionStepProps {
  creation: CreationState;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
}

export const SidebarSetPositionStep = memo(function SidebarSetPositionStep({
  creation,
  t,
  onWizardStep,
}: SidebarSetPositionStepProps) {
  const posCount = creation.setPositions.size;
  const creationMode = getCreationMode(creation);
  const stepCurrent = creationMode === "setPlay" ? "4" : "2";
  const stepTotal = creationMode === "setPlay" ? "6" : "4";

  return (
    <div className="flex flex-col gap-0">
      <div className={SIDEBAR_SECTION}>
        <div className="text-center mb-2">
          <h3
            className={`${SECTION_TITLE} flex items-center justify-center gap-1.5`}
          >
            <span>📍</span>
            <span>{t("tactics.creation.setPosition")}</span>
          </h3>
          <p className={STEP_INDICATOR}>
            {t("tactics.creation.stepIndicator")
              .replace("{current}", stepCurrent)
              .replace("{total}", stepTotal)}
          </p>
        </div>
        <p className="text-slate-400 text-xs text-center mb-2">
          {t("tactics.creation.setPositionHint")}
        </p>
        {posCount > 0 && (
          <div className="flex justify-center mb-1">
            <span className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/30 rounded-lg px-2 py-1 text-teal-400 text-[11px] font-medium">
              {t("tactics.creation.playersPlaced").replace(
                "{count}",
                String(posCount),
              )}
            </span>
          </div>
        )}
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <button
          type="button"
          onClick={() => onWizardStep("editing")}
          className={SIDEBAR_BTN_PRIMARY.replace(
            "bg-emerald-600",
            "bg-teal-600",
          ).replace("hover:bg-emerald-500", "hover:bg-teal-500")}
        >
          <span>{t("tactics.creation.next")}</span>
          <span>→</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onWizardStep(
              creationMode === "setPlay" ? "ballTrajectory" : "metadata",
            )
          }
          className={SIDEBAR_BTN_SECONDARY}
        >
          <span>←</span> {t("tactics.creation.back")}
        </button>
      </div>
    </div>
  );
});
