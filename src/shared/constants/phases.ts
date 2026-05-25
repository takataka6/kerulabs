/**
 * @module phases
 * @description 戦術フェーズ（攻撃・守備・トランジション・セットプレー等）のUI表示設定定数。各フェーズのアイコン・色・翻訳キーを定義する。
 */
import type { TranslationKey } from "@shared/i18n/translations";

export const PHASE_CONFIG = {
  attack: {
    nameKey: "phase.attack" as TranslationKey,
    icon: "⚽",
    bgColor: "bg-red-600",
    textColor: "text-white",
    borderColor: "border-red-500",
  },
  transition: {
    nameKey: "phase.transition" as TranslationKey,
    icon: "⚡",
    bgColor: "bg-green-600",
    textColor: "text-white",
    borderColor: "border-green-500",
  },
  pressing: {
    nameKey: "phase.pressing" as TranslationKey,
    icon: "🛡️",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-500",
  },
  counter: {
    nameKey: "phase.counter" as TranslationKey,
    icon: "🔄",
    bgColor: "bg-orange-600",
    textColor: "text-white",
    borderColor: "border-orange-500",
  },
  defense: {
    nameKey: "phase.defense" as TranslationKey,
    icon: "🛡️",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-500",
  },
  positive_transition: {
    nameKey: "phase.positive_transition" as TranslationKey,
    icon: "⚡",
    bgColor: "bg-green-600",
    textColor: "text-white",
    borderColor: "border-green-500",
  },
  negative_transition: {
    nameKey: "phase.negative_transition" as TranslationKey,
    icon: "🔄",
    bgColor: "bg-orange-600",
    textColor: "text-white",
    borderColor: "border-orange-500",
  },
  set_piece: {
    nameKey: "phase.set_piece" as TranslationKey,
    icon: "🎯",
    bgColor: "bg-teal-600",
    textColor: "text-white",
    borderColor: "border-teal-500",
  },
  throw_in: {
    nameKey: "phase.throw_in" as TranslationKey,
    icon: "🤾",
    bgColor: "bg-sky-600",
    textColor: "text-white",
    borderColor: "border-sky-500",
  },
  goal_kick: {
    nameKey: "phase.goal_kick" as TranslationKey,
    icon: "🥅",
    bgColor: "bg-indigo-600",
    textColor: "text-white",
    borderColor: "border-indigo-500",
  },
} as const;

export type PhaseKey = keyof typeof PHASE_CONFIG;
