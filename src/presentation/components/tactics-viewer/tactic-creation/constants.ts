/**
 * @module tactic-creation/constants
 * @description タクティクス作成ウィザードで使用する定数定義。CSSクラス・色オプション・軌道タイプ選択肢を提供する。
 */
import type { TranslationKey } from "@shared/i18n/translations";
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { PhaseKey } from "@shared/constants";

// ---------------------------------------------------------------------------
// 軌道オプション（BallTrajectoryStep と EditingStep で使用）
// ---------------------------------------------------------------------------

export const TRAJECTORY_OPTIONS: {
  type: TrajectoryType;
  icon: string;
  labelKey: TranslationKey;
}[] = [
  { type: "low", icon: "➡️", labelKey: "tactics.creation.trajectory.low" },
  { type: "high", icon: "⤴️", labelKey: "tactics.creation.trajectory.high" },
  {
    type: "curveLeft",
    icon: "↩️",
    labelKey: "tactics.creation.trajectory.curveLeft",
  },
  {
    type: "curveRight",
    icon: "↪️",
    labelKey: "tactics.creation.trajectory.curveRight",
  },
];

// ---------------------------------------------------------------------------
// フェーズ＆アイコンオプション（MetadataStep で使用）
// ---------------------------------------------------------------------------

export const PHASE_DROPDOWN_KEYS: PhaseKey[] = [
  "attack",
  "defense",
  "positive_transition",
  "negative_transition",
];

export const ICON_OPTIONS = ["⚽", "📐", "↗️", "↘️", "🔄", "⚡", "🛡️", "🎯"];

// ---------------------------------------------------------------------------
// 共有Tailwindクラス（全ウィザードステップで共通利用）
// ---------------------------------------------------------------------------

/** Outer positioning wrapper for all wizard steps */
export const WIZARD_WRAPPER =
  "absolute bottom-4 left-1/2 z-50 flex flex-col items-center";
/** Card backdrop base — append border-color, padding, and width */
export const CARD_BASE =
  "bg-slate-900/98 backdrop-blur-xl border rounded-2xl shadow-2xl";
/** Step indicator subtitle (e.g. "Step 1 of 3") */
export const STEP_INDICATOR = "text-slate-500 text-xs mt-0.5";
/** Wizard step section title */
export const SECTION_TITLE = "text-white font-bold text-base tracking-wide";
/** Secondary button base for back / cancel / skip */
export const BTN_SECONDARY =
  "py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200";

// ---------------------------------------------------------------------------
// サイドバーウィザード用Tailwindクラス（SidebarCreationContent 系で共通利用）
// ---------------------------------------------------------------------------

export const SIDEBAR_BTN_PRIMARY =
  "w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500 shadow-md";
export const SIDEBAR_BTN_SECONDARY =
  "w-full py-2 rounded-lg text-xs font-medium transition-all duration-200 bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200";
export const SIDEBAR_BTN_DISABLED =
  "w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 bg-slate-800 text-slate-600 cursor-not-allowed flex items-center justify-center gap-1.5";
export const SIDEBAR_SECTION = "px-3 py-2 border-b border-slate-800/50";
