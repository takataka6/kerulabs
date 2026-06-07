/**
 * @module TacticEvent
 * @description 戦術関連のドメインイベント定義。戦術の開始・完了・キャンセル、選手移動、ボールパス等のイベントクラスを提供する
 */

/** 戦術イベントの基底クラス。すべての戦術関連イベントはこのクラスを継承する */
export abstract class TacticEvent {
  abstract readonly type: string;
  readonly timestamp: number;

  constructor() {
    this.timestamp = Date.now();
  }
}

/** 戦術の実行が開始されたことを通知するイベント */
export class TacticStartedEvent extends TacticEvent {
  readonly type = "TACTIC_STARTED";

  constructor(
    public readonly tacticId: string,
    public readonly tacticName: string,
  ) {
    super();
  }
}

/** 選手の移動アニメーションが開始されたことを通知するイベント */
export class PlayerMovementStartedEvent extends TacticEvent {
  readonly type = "PLAYER_MOVEMENT_STARTED";

  constructor(
    public readonly playerIndex: number,
    public readonly startPosition: { x: number; z: number },
    public readonly targetPosition: { x: number; z: number },
    public readonly delay: number,
  ) {
    super();
  }
}

/** 選手の移動アニメーションが完了したことを通知するイベント */
export class PlayerMovementCompletedEvent extends TacticEvent {
  readonly type = "PLAYER_MOVEMENT_COMPLETED";

  constructor(
    public readonly playerIndex: number,
    public readonly position: { x: number; z: number },
  ) {
    super();
  }
}

/** 移動方向を示す矢印が表示されたことを通知するイベント */
export class ArrowDisplayedEvent extends TacticEvent {
  readonly type = "ARROW_DISPLAYED";

  constructor(
    public readonly start: { x: number; z: number },
    public readonly end: { x: number; z: number },
    public readonly color: string,
  ) {
    super();
  }
}

/** 戦術の全動作が完了したことを通知するイベント */
export class TacticCompletedEvent extends TacticEvent {
  readonly type = "TACTIC_COMPLETED";

  constructor(
    public readonly tacticId: string,
    public readonly duration: number,
  ) {
    super();
  }
}

/** ボールパスの軌道が表示されたことを通知するイベント */
export class BallPassDisplayedEvent extends TacticEvent {
  readonly type = "BALL_PASS_DISPLAYED";

  constructor(
    public readonly start: { x: number; z: number },
    public readonly end: { x: number; z: number },
    public readonly color: string,
    public readonly trajectoryType?: string,
  ) {
    super();
  }
}

/** 戦術の実行フェーズ（ハイライト→セットポジション→実行） */
export type ExecutionPhase = "highlight" | "set" | "run";

/** 実行フェーズが変更されたことを通知するイベント */
export class ExecutionPhaseChangedEvent extends TacticEvent {
  readonly type = "EXECUTION_PHASE_CHANGED";

  constructor(
    public readonly phase: ExecutionPhase,
    public readonly tacticId: string,
  ) {
    super();
  }
}

/** ステップ実行が開始されたことを通知するイベント */
export class StepExecutionStartedEvent extends TacticEvent {
  readonly type = "STEP_EXECUTION_STARTED";

  constructor(
    public readonly tacticId: string,
    public readonly stepIndex: number,
    public readonly totalSteps: number,
  ) {
    super();
  }
}

/** ステップ実行が完了したことを通知するイベント */
export class StepCompletedEvent extends TacticEvent {
  readonly type = "STEP_COMPLETED";

  constructor(
    public readonly tacticId: string,
    public readonly stepIndex: number,
    public readonly totalSteps: number,
  ) {
    super();
  }
}

/** 戦術の実行がキャンセルされたことを通知するイベント */
export class TacticCancelledEvent extends TacticEvent {
  readonly type = "TACTIC_CANCELLED";

  constructor(
    public readonly tacticId: string,
    public readonly reason: string,
  ) {
    super();
  }
}
