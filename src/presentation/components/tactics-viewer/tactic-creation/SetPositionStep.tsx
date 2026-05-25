/**
 * @module SetPositionStep
 * @description タクティクス作成ウィザードのセットポジション設定ステップコンポーネント。セットプレー時の選手初期配置を指定する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import {
  WIZARD_WRAPPER,
  CARD_BASE,
  STEP_INDICATOR,
  SECTION_TITLE,
  BTN_SECONDARY,
} from "./constants";

interface SetPositionStepProps {
  creation: CreationState;
  offset: { x: number; y: number };
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
}

export const SetPositionStep = memo(function SetPositionStep({
  creation,
  offset,
  isDragging,
  handlePointerDown,
  t,
  onWizardStep,
}: SetPositionStepProps) {
  const posCount = creation.setPositions.size;

  return (
    <div
      className={`${WIZARD_WRAPPER} gap-2`}
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
    >
      <div className={`${CARD_BASE} border-teal-500/40 p-5 w-[380px]`}>
        {/* ドラッグハンドル */}
        <div
          onPointerDown={handlePointerDown}
          className={`flex justify-center py-2.5 -mx-5 -mt-5 mb-2 rounded-t-2xl hover:bg-slate-800/30 transition-colors ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <div className="w-10 h-1 rounded-full bg-slate-600 group-hover:bg-slate-400 transition-colors" />
        </div>
        {/* タイトル */}
        <div className="text-center mb-4">
          <h3
            className={`${SECTION_TITLE} flex items-center justify-center gap-2`}
          >
            <span>📍</span>
            <span>{t("tactics.creation.setPosition")}</span>
          </h3>
          <p className={STEP_INDICATOR}>
            {t("tactics.creation.stepIndicator")
              .replace("{current}", "4")
              .replace("{total}", "6")}
          </p>
        </div>

        {/* 説明 */}
        <div className="text-center mb-4">
          <p className="text-slate-400 text-sm">
            {t("tactics.creation.setPositionHint")}
          </p>
          {posCount > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-1.5">
              <span className="text-teal-400 text-xs font-medium">
                {t("tactics.creation.playersPlaced").replace(
                  "{count}",
                  String(posCount),
                )}
              </span>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onWizardStep("ballTrajectory")}
            className={`${BTN_SECONDARY} px-4 flex items-center justify-center gap-1`}
          >
            <span>←</span>
            <span>{t("tactics.creation.back")}</span>
          </button>
          <button
            type="button"
            onClick={() => onWizardStep("editing")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 bg-teal-600 text-white hover:bg-teal-500 shadow-md`}
          >
            <span>{t("tactics.creation.next")}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
});
