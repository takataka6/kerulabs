/**
 * @module tacticCreationTypes
 * @description タクティクス作成ウィザードで共有される型定義・定数・ヘルパー関数
 */
import type { TrajectoryType } from "@domain/entities/BallPass";
import type { PhaseKey } from "@shared/constants/phases";
import type { PhaseType } from "@domain/value-objects/Phase";
import type { Formation } from "@domain/entities/Formation";

// ---------------------------------------------------------------------------
// 定数
// ---------------------------------------------------------------------------

/** ボール開始位置ハイライト表示時間 (ms) */
export const BALL_HIGHLIGHT_PAUSE_MS = 1500;

/** セットポジション配置後、動きアニメーション開始までの待ち時間 (ms) */
export const SET_POSITION_PAUSE_MS = 2000;

/** ボールが蹴られてから選手が動き出すまでの遅延 (ms) */
export const BALL_KICK_TO_MOVEMENT_MS = 500;

// ---------------------------------------------------------------------------
// フェーズキーのマッピング
// ---------------------------------------------------------------------------

export function phaseKeyToPhaseType(key: PhaseKey): PhaseType {
  switch (key) {
    case "attack":
      return "attack";
    case "transition":
    case "positive_transition":
      return "positive_transition";
    case "pressing":
    case "defense":
      return "defense";
    case "counter":
    case "negative_transition":
      return "negative_transition";
    case "set_piece":
      return "set_piece";
    case "throw_in":
      return "throw_in";
    case "goal_kick":
      return "goal_kick";
    default:
      return "attack";
  }
}

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

export interface CreationStepBallPass {
  startRole: string;
  endRole: string;
  color: string;
  startX?: number;
  startZ?: number;
  endX?: number;
  endZ?: number;
  trajectoryType?: TrajectoryType;
}

export interface CreationStep {
  id: number;
  movements: Map<string, { targetX: number; targetZ: number; color: string }>;
  ballPasses: CreationStepBallPass[];
  duration: number;
}

export type WizardStep =
  | "metadata"
  | "ballPosition"
  | "ballTrajectory"
  | "setPosition"
  | "editing"
  | "confirm";

export type CreationMode = "standard" | "situation" | "setPlay";

export interface CreationState {
  nameJa: string;
  nameEn: string;
  icon: string;
  gamePhase: PhaseKey;
  formationId?: string;
  formationName: string;
  currentStepIndex: number;
  steps: CreationStep[];
  timelineOpen: boolean;
  movementDelays: Record<number, Record<string, number>>;
  wizardStep: WizardStep;
  creationMode?: CreationMode;
  ballPosition: { x: number; z: number } | null;
  ballTrajectory: {
    endX: number;
    endZ: number;
    color: string;
    trajectoryType: TrajectoryType;
  } | null;
  /** セットプレー: ロールごとのカスタム開始位置（フォーメーションのデフォルトを上書き） */
  setPositions: Map<string, { x: number; z: number }>;
}

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

/** 空のステップを新規作成する */
export function createEmptyStep(id: number): CreationStep {
  return {
    id,
    movements: new Map(),
    ballPasses: [],
    duration: 1000,
  };
}

export function getCreationMode(creation: CreationState): CreationMode {
  if (creation.creationMode) return creation.creationMode;
  if (creation.ballPosition || creation.ballTrajectory) return "setPlay";
  if (creation.setPositions.size > 0) return "situation";
  return "standard";
}

// ---------------------------------------------------------------------------
// 共通ユーティリティ型
// ---------------------------------------------------------------------------

export type ArrowPreview = {
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
};

export type BallPassPreview = ArrowPreview & {
  trajectoryType?: TrajectoryType;
};

/**
 * ロールの基準位置を取得する（setPosition > formation の優先順）
 */
export function getBasePosition(
  role: string,
  formation: Formation,
  setPositions: Map<string, { x: number; z: number }>,
): { x: number; z: number } | undefined {
  const sp = setPositions.get(role);
  if (sp) return sp;
  const playerIndex = formation.roleMap.get(role);
  if (playerIndex === undefined) return undefined;
  const formPos = formation.positions[playerIndex];
  return { x: formPos.position.x, z: formPos.position.z };
}
