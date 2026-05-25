/**
 * @module BallTrajectoryStep
 * @description タクティクス作成ウィザードのボール軌道設定ステップコンポーネント。ボールの飛行軌道タイプと着地点を指定する。
 */
import { memo } from "react";
import type { TranslationKey } from "@shared/i18n/translations";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";
import {
  TRAJECTORY_OPTIONS,
  WIZARD_WRAPPER,
  CARD_BASE,
  STEP_INDICATOR,
  SECTION_TITLE,
  BTN_SECONDARY,
} from "./constants";

interface BallTrajectoryStepProps {
  creation: CreationState;
  offset: { x: number; y: number };
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
  t: (key: TranslationKey) => string;
  onWizardStep: (step: WizardStep) => void;
  onTrajectoryTypeChange?: (type: TrajectoryType) => void;
}

export const BallTrajectoryStep = memo(function BallTrajectoryStep({
  creation,
  offset,
  isDragging,
  handlePointerDown,
  t,
  onWizardStep,
  onTrajectoryTypeChange,
}: BallTrajectoryStepProps) {
  const hasTrajectory = creation.ballTrajectory !== null;

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
            <span>🎯</span>
            <span>{t("tactics.creation.ballLanding")}</span>
          </h3>
          <p className={STEP_INDICATOR}>
            {t("tactics.creation.stepIndicator")
              .replace("{current}", "3")
              .replace("{total}", "6")}
          </p>
        </div>

        {/* 説明 */}
        <div className="text-center mb-3">
          <p className="text-slate-400 text-sm">
            {t("tactics.creation.ballLandingHint")}
          </p>
          {hasTrajectory && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-1.5">
              <span className="text-teal-400 text-xs font-medium">
                ✓ ({creation.ballTrajectory!.endX.toFixed(1)},{" "}
                {creation.ballTrajectory!.endZ.toFixed(1)})
              </span>
            </div>
          )}
        </div>

        {/* 軌道タイプセレクター（着地点設定後に表示） */}
        {hasTrajectory && (
          <div className="mb-4">
            <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1.5 block">
              {t("tactics.creation.trajectoryType")}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
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
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-teal-600/30 text-teal-300 ring-1 ring-teal-500/50"
                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-[10px]">{t(opt.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ボタン */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onWizardStep("ballPosition")}
            className={`${BTN_SECONDARY} px-4 flex items-center justify-center gap-1`}
          >
            <span>←</span>
            <span>{t("tactics.creation.back")}</span>
          </button>
          <button
            type="button"
            onClick={() => onWizardStep("setPosition")}
            className={`${BTN_SECONDARY} px-4`}
          >
            {t("tactics.creation.skip")}
          </button>
          <button
            type="button"
            onClick={() => onWizardStep("setPosition")}
            disabled={!hasTrajectory}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              hasTrajectory
                ? "bg-teal-600 text-white hover:bg-teal-500 shadow-md"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            <span>{t("tactics.creation.next")}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
});
