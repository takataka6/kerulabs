/**
 * @module SidebarEditingStep
 * @description タクティクス作成サイドバーの編集ステップ。選手の移動先矢印とボールパスを配置する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { TrajectoryType } from "@domain/entities/BallPass";
import {
  getCreationMode,
  type CreationState,
  type WizardStep,
} from "@presentation/hooks/tactic";
import {
  TRAJECTORY_OPTIONS,
  SIDEBAR_BTN_PRIMARY,
  SIDEBAR_BTN_DISABLED,
  SIDEBAR_BTN_SECONDARY,
  SIDEBAR_SECTION,
} from "./constants";

interface SidebarEditingStepProps {
  creation: CreationState;
  language: string;
  isSetPlayMode?: boolean;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
  onSwitchStep: (index: number) => void;
  onResetStep: () => void;
  onResetPreview: () => void;
  ballPassCreationMode: boolean;
  ballPassStartPos: { x: number; z: number } | null;
  selectedBallPassTrajectoryType: TrajectoryType;
  onToggleBallPassMode?: () => void;
  onBallPassTrajectoryTypeChange?: (type: TrajectoryType) => void;
}

export const SidebarEditingStep = memo(function SidebarEditingStep({
  creation,
  language,
  t,
  onWizardStep,
  onSwitchStep,
  onResetStep,
  onResetPreview,
  ballPassCreationMode,
  ballPassStartPos,
  selectedBallPassTrajectoryType,
  onToggleBallPassMode,
  onBallPassTrajectoryTypeChange,
}: SidebarEditingStepProps) {
  const currentStep = creation.steps[creation.currentStepIndex];
  const creationMode = getCreationMode(creation);
  const movementCount = currentStep?.movements.size ?? 0;
  const ballPassCount = currentStep?.ballPasses.length ?? 0;
  const stepContentCount = movementCount + ballPassCount;

  return (
    <div className="flex flex-col gap-0">
      {/* ヘッダー: アイコン + 名前 */}
      <div className={SIDEBAR_SECTION}>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-base">{creation.icon}</span>
          <span className="text-white font-bold text-xs tracking-wide truncate flex-1">
            {(language === "ja" ? creation.nameJa : creation.nameEn) ||
              creation.nameJa ||
              creation.nameEn}
          </span>
        </div>

        {/* ステップタブ */}
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {creation.steps.map((step, index) => {
            const isActive = creation.currentStepIndex === index;
            const count = step.movements.size;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSwitchStep(index)}
                aria-label={
                  count > 0
                    ? t("a11y.stepWithCount")
                        .replace("{index}", String(index + 1))
                        .replace("{count}", String(count))
                    : t("a11y.step").replace("{index}", String(index + 1))
                }
                aria-current={isActive ? "step" : undefined}
                className={`h-6 px-1.5 rounded-md text-[10px] font-bold transition-all duration-200 flex items-center gap-0.5 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800/60 text-slate-500 hover:text-slate-300"
                }`}
              >
                {index + 1}
                {count > 0 && (
                  <span
                    className={`w-3 h-3 rounded-full text-[7px] flex items-center justify-center ${
                      isActive ? "bg-white/25" : "bg-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ガイダンス */}
        <div
          className={`${ballPassCreationMode ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-emerald-500/10 border border-emerald-500/20"} rounded-lg px-2 py-1.5 mb-2`}
        >
          <p
            className={`${ballPassCreationMode ? "text-yellow-300" : "text-emerald-300"} text-[11px] text-center`}
          >
            {ballPassCreationMode
              ? ballPassStartPos
                ? `⚽ (${ballPassStartPos.x.toFixed(1)}, ${ballPassStartPos.z.toFixed(1)}) → ? ${t("tactics.creation.passDestination")}`
                : `⚽ ${t("tactics.creation.passStartPosition")}`
              : t("tactics.creation.editingGuide")}
          </p>
        </div>

        {/* 軌跡タイプセレクター（ボールパスモード時） */}
        {ballPassCreationMode && (
          <div className="grid grid-cols-2 gap-1 mb-2">
            {TRAJECTORY_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => onBallPassTrajectoryTypeChange?.(opt.type)}
                aria-label={t(opt.labelKey)}
                aria-pressed={selectedBallPassTrajectoryType === opt.type}
                className={`h-6 rounded-md text-[10px] font-medium transition-all duration-200 flex items-center justify-center gap-0.5 ${
                  selectedBallPassTrajectoryType === opt.type
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <span>{opt.icon}</span>
                <span>{t(opt.labelKey)}</span>
              </button>
            ))}
          </div>
        )}

        {/* ヒントバッジ */}
        <div className="text-center mb-1">
          <span className="text-[9px] text-emerald-400/70 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {t("tactics.creation.step")} {creation.currentStepIndex + 1}
            {movementCount > 0 &&
              ` · ${t("tactics.creation.moves").replace("{count}", String(movementCount))}`}
            {(currentStep?.ballPasses.length ?? 0) > 0 &&
              ` · ${t("tactics.creation.passes").replace("{count}", String(currentStep?.ballPasses.length ?? 0))}`}
          </span>
        </div>
      </div>

      {/* ボタン */}
      <div className="px-3 py-2 space-y-1.5">
        {/* Pass mode toggle */}
        <button
          type="button"
          onClick={() => onToggleBallPassMode?.()}
          aria-label={t("tactics.creation.togglePassMode")}
          aria-pressed={ballPassCreationMode}
          className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
            ballPassCreationMode
              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <span>⚽</span>
          <span>Pass</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={onResetStep}
          disabled={stepContentCount === 0}
          className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
            stepContentCount > 0
              ? "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              : "bg-slate-800/30 text-slate-600 cursor-not-allowed"
          }`}
        >
          <span>↺</span>
          <span>{t("tactics.creation.resetStep")}</span>
        </button>

        {/* Complete */}
        <button
          type="button"
          onClick={() => {
            onResetPreview();
            onWizardStep("confirm");
          }}
          disabled={stepContentCount === 0}
          className={
            stepContentCount > 0 ? SIDEBAR_BTN_PRIMARY : SIDEBAR_BTN_DISABLED
          }
        >
          <span>{`${t("tactics.creation.step")} ${creation.currentStepIndex + 1} ${t("tactics.creation.stepComplete")}`}</span>
          <span>→</span>
        </button>

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            onWizardStep(
              creationMode === "standard" ? "metadata" : "setPosition",
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
