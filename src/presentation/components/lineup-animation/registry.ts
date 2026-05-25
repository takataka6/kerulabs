/**
 * @module lineup-animation/registry
 * @description ラインナップアニメーションプリセットのレジストリ。利用可能なプリセット一覧と検索ヘルパーを提供する。
 */
import type { AnimationPresetMeta } from "./types";
import {
  ClassicTvReveal,
  FormationMapReveal,
  CinematicReveal,
  BroadcastReveal,
  PlayerCardReveal,
} from "./presets";

/**
 * 利用可能なラインナップアニメーションプリセットのレジストリ。
 *
 * 新しいプリセットを追加するには:
 * 1. ./presets/ に LineupAnimationProps を実装する新しいコンポーネントを作成する
 * 2. ./presets/index.ts からエクスポートする
 * 3. この配列にエントリを追加する
 */
export const LINEUP_ANIMATION_PRESETS: AnimationPresetMeta[] = [
  {
    id: "classic-tv-reveal",
    nameKey: "lineup.animation.preset.classicTv",
    fallbackName: "Classic TV",
    estimatedDurationMs: 15000,
    component: ClassicTvReveal,
  },
  {
    id: "squad-list-reveal",
    nameKey: "lineup.animation.preset.squadList",
    fallbackName: "Squad List",
    estimatedDurationMs: 10000,
    component: FormationMapReveal,
  },
  {
    id: "cinematic-reveal",
    nameKey: "lineup.animation.preset.cinematic",
    fallbackName: "Cinematic",
    estimatedDurationMs: 18000,
    component: CinematicReveal,
  },
  {
    id: "broadcast-reveal",
    nameKey: "lineup.animation.preset.broadcast",
    fallbackName: "Broadcast",
    estimatedDurationMs: 32000,
    component: BroadcastReveal,
  },
  {
    id: "player-card-reveal",
    nameKey: "lineup.animation.preset.playerCard",
    fallbackName: "Player Card",
    estimatedDurationMs: 20000,
    component: PlayerCardReveal,
  },
];

export function getPresetById(id: string): AnimationPresetMeta | undefined {
  return LINEUP_ANIMATION_PRESETS.find((p) => p.id === id);
}

export function getDefaultPreset(): AnimationPresetMeta {
  return LINEUP_ANIMATION_PRESETS[0];
}
