/**
 * @module tactics-viewer/types
 * @description タクティクスビューアー共通の型定義。選手データ・カラー・フォーメーション・オーケストレーション操作の型を提供する。
 */
import type { CardStatus } from "../three/SceneTypes";
import type { TranslationFn } from "@shared/i18n/translations";
import type { Language } from "@presentation/contexts/LanguageContext";

export type { CardStatus, Language, TranslationFn };

export interface Opponent {
  id: number;
  x: number;
  z: number;
  playerNumber?: number;
  playerName?: string;
  playerPosition?: string;
  color?: string;
  playerId?: string;
}

export interface PlayerData {
  name: string;
  number: number;
  imageUrl?: string;
  mainVisualImageUrl?: string;
}

export interface FormationDataItem {
  pos: string;
  x: number;
  z: number;
  cat: string;
}

export type ColorsData = {
  gk: string;
  df: string;
  mf: string;
  fw: string;
};

/**
 * Ref ベースのブリッジインタフェース。
 *
 * usePlayModePhase / useFormationManagement が useTacticsOrchestration / useOpponents の
 * コールバック・状態を参照するための循環依存解決用。
 * TacticsViewerPage がこの ref を作成し、各フック呼び出し後に最新値を代入する。
 */
export interface OrchestratorActions {
  resetTactic: () => void;
  clearManualPositions: () => void;
  isExecuting: boolean;
  hasCreation: boolean;
  cancelCreation: () => void;
  resetOpponents: () => void;
  resetFormationId: () => void;
}
