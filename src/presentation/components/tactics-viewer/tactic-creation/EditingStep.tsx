/**
 * @module EditingStep
 * @description タクティクス作成ウィザードの編集ステップコンポーネント。選手の移動先矢印とボールパスを配置する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import { TRAJECTORY_OPTIONS, WIZARD_WRAPPER, CARD_BASE } from "./constants";

interface EditingStepProps {
  creation: CreationState;
  language: string;
  isSetPlayMode: boolean;
  offset: { x: number; y: number };
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
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

export const EditingStep = memo(function EditingStep({
  creation,
  language,
  isSetPlayMode,
  offset,
  isDragging,
  handlePointerDown,
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
}: EditingStepProps) {
  const currentStep = creation.steps[creation.currentStepIndex];
  const movementCount = currentStep?.movements.size ?? 0;
  const ballPassCount = currentStep?.ballPasses.length ?? 0;
  const stepContentCount = movementCount + ballPassCount;

  return (
    <div
      className={`${WIZARD_WRAPPER} gap-1.5`}
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
    >
      <div
        className={`${CARD_BASE} border-emerald-500/40 px-4 py-3 min-w-[360px]`}
      >
        {/* ドラッグハンドル */}
        <div
          onPointerDown={handlePointerDown}
          className={`flex justify-center py-2.5 -mx-4 -mt-3 mb-1 rounded-t-2xl hover:bg-slate-800/30 transition-colors ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <div className="w-10 h-1 rounded-full bg-slate-600 transition-colors" />
        </div>
        {/* ヘッダー: アイコン + 名前 + ステップバッジ */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{creation.icon}</span>
          <span className="text-white font-bold text-sm tracking-wide truncate max-w-[160px]">
            {(language === "ja" ? creation.nameJa : creation.nameEn) ||
              creation.nameJa ||
              creation.nameEn}
          </span>
          <div className="flex items-center gap-1 ml-auto">
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
                  className={`h-7 px-2 rounded-lg text-[11px] font-bold transition-all duration-200 flex items-center gap-1 ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800/60 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {index + 1}
                  {count > 0 && (
                    <span
                      className={`w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center ${
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
        </div>

        {/* ガイダンス */}
        <div
          className={`${ballPassCreationMode ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-emerald-500/10 border border-emerald-500/20"} rounded-lg px-3 py-2 mb-2`}
        >
          <p
            className={`${ballPassCreationMode ? "text-yellow-300" : "text-emerald-300"} text-xs text-center`}
          >
            {ballPassCreationMode
              ? ballPassStartPos
                ? `⚽ (${ballPassStartPos.x.toFixed(1)}, ${ballPassStartPos.z.toFixed(1)}) → ? ${t("tactics.creation.passDestination")}`
                : `⚽ ${t("tactics.creation.passStartPosition")}`
              : t("tactics.creation.editingGuide")}
          </p>
        </div>

        {/* 軌跡タイプセレクター（ボールパスモード時のみ） */}
        {ballPassCreationMode && (
          <div className="grid grid-cols-4 gap-1 mb-2">
            {TRAJECTORY_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => onBallPassTrajectoryTypeChange?.(opt.type)}
                aria-label={t(opt.labelKey)}
                aria-pressed={selectedBallPassTrajectoryType === opt.type}
                className={`h-7 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center justify-center gap-0.5 ${
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

        {/* ボタン行 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleBallPassMode?.()}
            aria-label={t("tactics.creation.togglePassMode")}
            aria-pressed={ballPassCreationMode}
            className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
              ballPassCreationMode
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <span>⚽</span>
            <span>Pass</span>
          </button>

          <button
            type="button"
            onClick={onResetStep}
            disabled={stepContentCount === 0}
            className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
              stepContentCount > 0
                ? "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                : "bg-slate-800/30 text-slate-600 cursor-not-allowed"
            }`}
          >
            <span>↺</span>
            <span>{t("tactics.creation.resetStep")}</span>
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() =>
              onWizardStep(isSetPlayMode ? "setPosition" : "metadata")
            }
            className="h-8 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center gap-1"
          >
            <span>←</span>
            <span>{t("tactics.creation.back")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onResetPreview();
              onWizardStep("confirm");
            }}
            disabled={stepContentCount === 0}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
              stepContentCount > 0
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            <span>{`${t("tactics.creation.step")} ${creation.currentStepIndex + 1} ${t("tactics.creation.stepComplete")}`}</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ヒントバッジ */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-emerald-400/70 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {t("tactics.creation.step")} {creation.currentStepIndex + 1}
          {movementCount > 0 &&
            ` · ${t("tactics.creation.moves").replace("{count}", String(movementCount))}`}
          {(currentStep?.ballPasses.length ?? 0) > 0 &&
            ` · ${t("tactics.creation.passes").replace("{count}", String(currentStep?.ballPasses.length ?? 0))}`}
        </span>
        <span className="text-xs text-slate-200 font-medium">
          {ballPassCreationMode
            ? t("tactics.creation.clickField")
            : t("tactics.creation.dragToMove")}
        </span>
      </div>
    </div>
  );
});
