/** @module lineup-animation - ラインナップアニメーション関連の公開APIバレルエクスポート */
export { LineupAnimationOverlay } from "./LineupAnimationOverlay";
export { useLineupAnimation } from "./useLineupAnimation";
export {
  LINEUP_ANIMATION_PRESETS,
  getPresetById,
  getDefaultPreset,
} from "./registry";
export type {
  LineupPlayer,
  LineupTeamInfo,
  AnimationPhase,
  LineupAnimationProps,
  AnimationPresetMeta,
} from "./types";
