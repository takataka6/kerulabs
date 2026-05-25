/**
 * @module ConfirmStep
 * @description タクティクス作成ウィザードの確認ステップコンポーネント。作成内容のプレビューと保存確認を表示する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import { WIZARD_WRAPPER, CARD_BASE } from "./constants";

interface ConfirmStepProps {
  creation: CreationState;
  language: string;
  isExecuting: boolean;
  offset: { x: number; y: number };
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
  onAddStep: () => void;
  onToggleTimeline: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export const ConfirmStep = memo(function ConfirmStep({
  creation,
  language,
  isExecuting,
  offset,
  isDragging,
  handlePointerDown,
  t,
  onWizardStep,
  onAddStep,
  onToggleTimeline,
  onPreview,
  onSave,
}: ConfirmStepProps) {
  const totalMovements = creation.steps.reduce(
    (sum, s) => sum + s.movements.size,
    0,
  );
  const totalBallPasses = creation.steps.reduce(
    (sum, s) => sum + s.ballPasses.length,
    0,
  );

  return (
    <div
      className={`${WIZARD_WRAPPER} gap-1.5`}
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
    >
      <div
        className={`${CARD_BASE} border-emerald-500/40 px-4 py-3 min-w-[400px]`}
      >
        {/* ドラッグハンドル */}
        <div
          onPointerDown={handlePointerDown}
          className={`flex justify-center py-2.5 -mx-4 -mt-3 mb-1 rounded-t-2xl hover:bg-slate-800/30 transition-colors ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <div className="w-10 h-1 rounded-full bg-slate-600 transition-colors" />
        </div>
        {/* ヘッダー */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{creation.icon}</span>
          <span className="text-white font-bold text-sm tracking-wide truncate max-w-[160px]">
            {(language === "ja" ? creation.nameJa : creation.nameEn) ||
              creation.nameJa ||
              creation.nameEn}
          </span>
          <span className="text-[10px] text-slate-500 font-medium ml-1">
            {t("tactics.creation.confirm")}
          </span>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-500">
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

        {/* 操作ボタン行 */}
        <div className="flex items-center gap-1.5 mb-3">
          <button
            type="button"
            onClick={onPreview}
            disabled={isExecuting}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
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
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              creation.timelineOpen
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>⏱</span>
            <span>{t("tactics.creation.timeline")}</span>
          </button>
        </div>

        {/* 下部ボタン行 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onWizardStep("editing")}
            className="h-8 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center gap-1"
          >
            <span>←</span>
            <span>{t("tactics.creation.back")}</span>
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => {
              onAddStep();
              onWizardStep("editing");
            }}
            className="h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200 bg-slate-800/60 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>+</span>
            <span>{t("tactics.creation.addStep2")}</span>
          </button>
        </div>

        {/* 保存ボタン */}
        <div className="mt-2">
          <button
            type="button"
            onClick={onSave}
            className="w-full h-8 px-4 rounded-lg text-xs font-bold transition-all duration-200 bg-emerald-600 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
          >
            <span>💾</span>
            <span>{t("tactics.creation.saveTactic")}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
