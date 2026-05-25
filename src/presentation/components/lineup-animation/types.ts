/**
 * @module lineup-animation/types
 * @description ラインナップアニメーションの型定義。選手データ・チーム情報・アニメーションプリセットの型を提供する。
 */
import type { ComponentType } from "react";

// === 各アニメーションプリセットに渡されるデータ ===

export interface LineupPlayer {
  name: string;
  number: number;
  imageUrl?: string;
  /** ラインナップ表示用のメインビジュアル画像（縦3:4） */
  mainVisualImageUrl?: string;
  /** ポジションカテゴリ: "gk" | "df" | "mf" | "fw" */
  category: string;
  /** フォーメーション上のポジションラベル（例: "GK", "CB", "RB", "CMF"） */
  positionLabel: string;
}

export interface LineupTeamInfo {
  teamName: string;
  formationName: string;
  colors: {
    gk: string;
    df: string;
    mf: string;
    fw: string;
  };
  manager?: string;
}

// === アニメーションライフサイクル ===

export type AnimationPhase = "idle" | "running" | "completing" | "completed";

// === 各アニメーションプリセットコンポーネントが受け取るProps ===

export interface LineupAnimationProps {
  players: LineupPlayer[];
  teamInfo: LineupTeamInfo;
  /** 現在のアニメーションライフサイクルフェーズ */
  phase: AnimationPhase;
  /** アニメーションが自然に完了したことを通知するコールバック */
  onComplete: () => void;
}

// === プリセットレジストリ ===

export interface AnimationPresetMeta {
  id: string;
  /** 表示名のi18nキー */
  nameKey: string;
  /** i18nキーが見つからない場合のフォールバック表示名 */
  fallbackName: string;
  /** 推定再生時間（ミリ秒単位、UI表示用。強制されない） */
  estimatedDurationMs: number;
  /** このアニメーションを描画するReactコンポーネント */
  component: ComponentType<LineupAnimationProps>;
}
