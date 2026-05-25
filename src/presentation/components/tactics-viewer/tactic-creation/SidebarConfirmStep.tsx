/**
 * @module SidebarConfirmStep
 * @description タクティクス作成サイドバーの確認ステップ。作成内容のプレビューと保存確認を表示する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import { SIDEBAR_BTN_SECONDARY, SIDEBAR_SECTION } from "./constants";

interface SidebarConfirmStepProps {
  creation: CreationState;
  language: string;
  isExecuting: boolean;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
  onAddStep: () => void;
  onToggleTimeline: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export const SidebarConfirmStep = memo(function SidebarConfirmStep({
  creation,
  language,
  isExecuting,
  t,
  onWizardStep,
  onAddStep,
  onToggleTimeline,
  onPreview,
  onSave,
}: SidebarConfirmStepProps) {
  const totalMovements = creation.steps.reduce(
    (sum, s) => sum + s.movements.size,
    0,
  );
  const totalBallPasses = creation.steps.reduce(
    (sum, s) => sum + s.ballPasses.length,
    0,
  );

  return (
    <div className="flex flex-col gap-0">
      <div className={SIDEBAR_SECTION}>
        {/* ヘッダー */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-base">{creation.icon}</span>
          <span className="text-white font-bold text-xs tracking-wide truncate flex-1">
            {(language === "ja" ? creation.nameJa : creation.nameEn) ||
              creation.nameJa ||
              creation.nameEn}
          </span>
        </div>

        {/* サマリー */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
          <span>{t("tactics.creation.confirm")}</span>
          <span>·</span>
          <span>
            {t("tactics.creation.moves").replace(
              "{count}",
              String(totalMovements),
            )}
          </span>
          {totalBallPasses > 0 && (
            <>
              <span>·</span>
              <span>
                {t("tactics.creation.passes").replace(
                  "{count}",
                  String(totalBallPasses),
                )}
              </span>
            </>
          )}
          <span>·</span>
          <span>
            {t("tactics.creation.steps").replace(
              "{count}",
              String(creation.steps.length),
            )}
          </span>
        </div>
      </div>

      {/* ボタン */}
      <div className="px-3 py-2 space-y-1.5">
        {/* Preview + Timeline */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onPreview}
            disabled={isExecuting}
            className={`py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
              isExecuting
                ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>▶</span>
            <span>{t("tactics.creation.preview")}</span>
          </button>
          <button
            type="button"
            onClick={onToggleTimeline}
            className={`py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
              creation.timelineOpen
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>⏱</span>
            <span>{t("tactics.creation.timeline")}</span>
          </button>
        </div>

        {/* Add Step */}
        <button
          type="button"
          onClick={() => {
            onAddStep();
            onWizardStep("editing");
          }}
          className="w-full py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-slate-800/60 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 flex items-center justify-center gap-1"
        >
          <span>+</span>
          <span>{t("tactics.creation.addStep2")}</span>
        </button>

        {/* Back */}
        <button
          type="button"
          onClick={() => onWizardStep("editing")}
          className={SIDEBAR_BTN_SECONDARY}
        >
          <span>←</span> {t("tactics.creation.back")}
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          className="w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 bg-emerald-600 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
        >
          <span>💾</span>
          <span>{t("tactics.creation.saveTactic")}</span>
        </button>
      </div>
    </div>
  );
});
