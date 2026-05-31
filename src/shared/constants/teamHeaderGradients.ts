/**
 * @module teamHeaderGradients
 * @description チーム作成・編集と相手マーカープリセットで共通利用するヘッダーカラー定義。
 */
import type { TranslationKey } from "@shared/i18n/translations";

export interface TeamHeaderGradientOption {
  value: string;
  labelKey: TranslationKey;
  markerColor: string;
}

export const TEAM_HEADER_GRADIENT_OPTIONS: TeamHeaderGradientOption[] = [
  {
    value: "from-blue-600 to-blue-400",
    labelKey: "teamCreator.color.blue",
    markerColor: "#2563eb",
  },
  {
    value: "from-red-600 to-red-400",
    labelKey: "teamCreator.color.red",
    markerColor: "#dc2626",
  },
  {
    value: "from-green-600 to-green-400",
    labelKey: "teamCreator.color.green",
    markerColor: "#16a34a",
  },
  {
    value: "from-purple-600 to-purple-400",
    labelKey: "teamCreator.color.purple",
    markerColor: "#9333ea",
  },
  {
    value: "from-yellow-600 to-yellow-400",
    labelKey: "teamCreator.color.yellow",
    markerColor: "#ca8a04",
  },
  {
    value: "from-pink-600 to-pink-400",
    labelKey: "teamCreator.color.pink",
    markerColor: "#db2777",
  },
  {
    value: "from-indigo-600 to-indigo-400",
    labelKey: "teamCreator.color.indigo",
    markerColor: "#4f46e5",
  },
  {
    value: "from-orange-600 to-orange-400",
    labelKey: "teamCreator.color.orange",
    markerColor: "#ea580c",
  },
  {
    value: "from-white to-slate-200",
    labelKey: "teamCreator.color.white",
    markerColor: "#e2e8f0",
  },
];

export const DEFAULT_TEAM_HEADER_GRADIENT =
  TEAM_HEADER_GRADIENT_OPTIONS[0].value;

export const DEFAULT_OPPONENT_MARKER_COLOR =
  TEAM_HEADER_GRADIENT_OPTIONS[0].markerColor;
