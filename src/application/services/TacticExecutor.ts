/**
 * @module TacticExecutor
 * @description 戦術のアニメーション実行サービス。選手移動・ボールパスのスケジューリングとイベント駆動のフェーズ管理を行う
 */

import { Tactic } from "@domain/entities/Tactic";
import { Formation } from "@domain/entities/Formation";
import type { IEventBus } from "@domain/events/IEventBus";
import { EventBus } from "@domain/events/EventBus";
import { SET_POSITION_ARROW_COLOR } from "@shared/constants";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";
import {
  TacticStartedEvent,
  PlayerMovementStartedEvent,
  PlayerMovementCompletedEvent,
  ArrowDisplayedEvent,
  BallPassDisplayedEvent,
  TacticCompletedEvent,
  TacticCancelledEvent,
  ExecutionPhaseChangedEvent,
} from "@domain/events/TacticEvent";

/** 1回の移動アニメーションにかかる時間 (ms) */
const MOVEMENT_ANIMATION_MS = 500;

/** 全動作完了後、戦術完了イベントを発行するまでの余裕時間 (ms) */
const COMPLETION_BUFFER_MS = 1500;

/**
 * 戦術のアニメーション実行を管理するサービス
 * 選手移動・ボールパスのスケジューリングとイベント発行を行う
 */
export class TacticExecutor {
  private readonly eventBus: IEventBus;
  private currentExecutionId: string | null = null;
  private currentTacticId: string | null = null;
  private timeouts: Set<number> = new Set();

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus ?? EventBus.getInstance();
  }

  /**
   * 戦術を実行する（既存の実行は自動キャンセル）
   * ハイライト→セットポジション→実行の3フェーズでアニメーションをスケジュールする
   * @param tactic - 実行する戦術
   * @param formation - 使用するフォーメーション
   * @param initialPositions - 各選手の初期位置（インデックスをキーとした座標マップ）
   */
  execute(
    tactic: Tactic,
    formation: Formation,
    initialPositions: Record<number, { x: number; z: number }>,
  ): void {
    // 既に実行中の戦術をキャンセル
    if (this.currentExecutionId) {
      this.cancel("Superseded by new tactic execution");
    }

    const executionId = `${tactic.id.value}-${Date.now()}`;
    this.currentExecutionId = executionId;
    this.currentTacticId = tactic.id.value;

    // 戦術開始イベントを発行
    this.eventBus.publish(
      new TacticStartedEvent(tactic.id.value, tactic.getDisplayName("en")),
    );

    // フォーメーションに対応する動きを取得
    const movements = tactic.getMovementsForFormation(formation.name);
    const ballPasses = tactic.getBallPassesForFormation(formation.name);

    if (movements.length === 0 && ballPasses.length === 0) {
      this.eventBus.publish(
        new TacticCancelledEvent(
          tactic.id.value,
          "No movements for this formation",
        ),
      );
      this.currentExecutionId = null;
      return;
    }

    const startTime = Date.now();

    // --- 実行フェーズ検出・遷移 ---
    const setPositionMovements = movements.filter(
      (m) => m.arrowColor === SET_POSITION_ARROW_COLOR,
    );
    const runMovements = movements.filter(
      (m) => m.arrowColor !== SET_POSITION_ARROW_COLOR,
    );

    this.schedulePhaseTransitions({
      tacticId: tactic.id.value,
      executionId,
      setPositionMovements,
      runMovements,
      ballPasses,
      highlightCondition: true,
    });

    // 各動きとボールパスをスケジュール
    this.scheduleMovements(movements, formation, initialPositions, executionId);
    this.scheduleBallPasses(
      ballPasses,
      formation,
      initialPositions,
      executionId,
    );

    // 戦術完了イベントをスケジュール
    const movementMaxDelay =
      movements.length > 0 ? Math.max(...movements.map((m) => m.delay)) : 0;
    const ballPassMaxDelay =
      ballPasses.length > 0 ? Math.max(...ballPasses.map((bp) => bp.delay)) : 0;
    const maxDelay = Math.max(movementMaxDelay, ballPassMaxDelay, 0);

    const completionTimeoutId = window.setTimeout(
      () => {
        if (this.currentExecutionId !== executionId) return;

        // 残存するタイムアウトをクリア（ネストされた移動完了タイマーなど）
        this.timeouts.forEach((id) => window.clearTimeout(id));
        this.timeouts.clear();

        const duration = Date.now() - startTime;
        this.eventBus.publish(
          new TacticCompletedEvent(tactic.id.value, duration),
        );
        this.currentExecutionId = null;
        this.currentTacticId = null;
      },
      this.scaleDelay(maxDelay + COMPLETION_BUFFER_MS),
    );

    this.timeouts.add(completionTimeoutId);
  }

  /**
   * 実行中の戦術をキャンセルする
   * @param reason - キャンセル理由
   */
  cancel(reason: string = "Cancelled by user"): void {
    if (!this.currentExecutionId) return;

    // すべてのタイムアウトをクリア
    this.timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    this.timeouts.clear();

    // キャンセルイベントを発行（tactic ID を使用）
    this.eventBus.publish(
      new TacticCancelledEvent(
        this.currentTacticId ?? this.currentExecutionId,
        reason,
      ),
    );

    this.currentExecutionId = null;
    this.currentTacticId = null;
  }

  /**
   * エグゼキュータを破棄し、全タイムアウトをクリアする。
   * コンポーネントのアンマウント時に呼び出してメモリリークを防止する。
   */
  destroy(): void {
    this.timeouts.forEach((id) => window.clearTimeout(id));
    this.timeouts.clear();
    this.currentExecutionId = null;
    this.currentTacticId = null;
  }

  /** 戦術が実行中かどうかを判定する */
  isExecuting(): boolean {
    return this.currentExecutionId !== null;
  }

  /** 現在の実行IDを取得する（未実行時はnull） */
  getCurrentExecutionId(): string | null {
    return this.currentExecutionId;
  }

  // ── Private ──────────────────────────────────────────────

  /**
   * セットポジション / 実行フェーズの遷移イベントをスケジュールする。
   */
  private schedulePhaseTransitions(params: {
    tacticId: string;
    executionId: string;
    setPositionMovements: ReadonlyArray<{ readonly delay: number }>;
    runMovements: ReadonlyArray<{ readonly delay: number }>;
    ballPasses: ReadonlyArray<{ readonly delay: number }>;
    highlightCondition: boolean;
  }): void {
    const {
      tacticId,
      executionId,
      setPositionMovements,
      runMovements,
      ballPasses,
      highlightCondition,
    } = params;

    const hasSetPositions = setPositionMovements.length > 0;
    const hasRunContent = runMovements.length > 0 || ballPasses.length > 0;

    if (hasSetPositions && hasRunContent) {
      const setDelay = setPositionMovements[0]?.delay ?? 0;

      if (highlightCondition && setDelay > 0) {
        // ハイライト → セット → 実行 の3フェーズ
        this.eventBus.publish(
          new ExecutionPhaseChangedEvent("highlight", tacticId),
        );
        const setPhaseTimeoutId = window.setTimeout(() => {
          if (this.currentExecutionId !== executionId) return;
          this.eventBus.publish(
            new ExecutionPhaseChangedEvent("set", tacticId),
          );
        }, this.scaleDelay(setDelay));
        this.timeouts.add(setPhaseTimeoutId);
      } else {
        // セット → 実行 の2フェーズ
        this.eventBus.publish(new ExecutionPhaseChangedEvent("set", tacticId));
      }

      // 最初のrun移動 or ボールパスのタイミングで「実行」フェーズに切替
      const runDelays = [
        ...runMovements.map((m) => m.delay),
        ...ballPasses.map((bp) => bp.delay),
      ];
      if (runDelays.length > 0) {
        const firstRunDelay = Math.min(...runDelays);
        const runPhaseTimeoutId = window.setTimeout(() => {
          if (this.currentExecutionId !== executionId) return;
          this.eventBus.publish(
            new ExecutionPhaseChangedEvent("run", tacticId),
          );
        }, this.scaleDelay(firstRunDelay));
        this.timeouts.add(runPhaseTimeoutId);
      }
    } else if (hasSetPositions) {
      // セットポジションのみ
      const setDelay = setPositionMovements[0]?.delay ?? 0;
      if (highlightCondition && setDelay > 0) {
        this.eventBus.publish(
          new ExecutionPhaseChangedEvent("highlight", tacticId),
        );
        const setPhaseTimeoutId = window.setTimeout(() => {
          if (this.currentExecutionId !== executionId) return;
          this.eventBus.publish(
            new ExecutionPhaseChangedEvent("set", tacticId),
          );
        }, this.scaleDelay(setDelay));
        this.timeouts.add(setPhaseTimeoutId);
      } else {
        this.eventBus.publish(new ExecutionPhaseChangedEvent("set", tacticId));
      }
    } else if (hasRunContent) {
      // セットポジション無し → 即「実行」フェーズ
      this.eventBus.publish(new ExecutionPhaseChangedEvent("run", tacticId));
    }
  }

  /** 再生速度を考慮したミリ秒を返す */
  private scaleDelay(ms: number): number {
    const speed = getPlaybackSpeed();
    return speed > 0 ? ms / speed : ms;
  }

  /** 移動アニメーションをスケジュールする */
  private scheduleMovements(
    movements: ReadonlyArray<{
      readonly role: string;
      readonly targetX: number;
      readonly targetZ: number;
      readonly delay: number;
      readonly arrowColor: string;
    }>,
    formation: Formation,
    initialPositions: Record<number, { x: number; z: number }>,
    executionId: string,
  ): void {
    const sortedMovements = [...movements].sort((a, b) => a.delay - b.delay);
    const roleCurrentPos: Record<string, { x: number; z: number }> = {};

    sortedMovements.forEach((movement) => {
      const playerIndex = formation.getPlayerIndexByRole(movement.role);
      if (playerIndex === undefined) return;

      const startPos =
        roleCurrentPos[movement.role] || initialPositions[playerIndex];
      const endPos = { x: movement.targetX, z: movement.targetZ };
      roleCurrentPos[movement.role] = endPos;

      const timeoutId = window.setTimeout(() => {
        if (this.currentExecutionId !== executionId) return;

        this.eventBus.publish(
          new PlayerMovementStartedEvent(
            playerIndex,
            startPos,
            endPos,
            movement.delay,
          ),
        );

        this.eventBus.publish(
          new ArrowDisplayedEvent(startPos, endPos, movement.arrowColor),
        );

        const completionTimeoutId = window.setTimeout(() => {
          if (this.currentExecutionId !== executionId) return;

          this.eventBus.publish(
            new PlayerMovementCompletedEvent(playerIndex, endPos),
          );
        }, this.scaleDelay(MOVEMENT_ANIMATION_MS));

        this.timeouts.add(completionTimeoutId);
      }, this.scaleDelay(movement.delay));

      this.timeouts.add(timeoutId);
    });
  }

  /** ボールパスアニメーションをスケジュールする */
  private scheduleBallPasses(
    ballPasses: ReadonlyArray<{
      readonly startRole: string;
      readonly endRole: string;
      readonly delay: number;
      readonly color: string;
      readonly startX?: number;
      readonly startZ?: number;
      readonly endX?: number;
      readonly endZ?: number;
      readonly trajectoryType?: string;
      hasCustomStart(): boolean;
      hasCustomEnd(): boolean;
    }>,
    formation: Formation,
    initialPositions: Record<number, { x: number; z: number }>,
    executionId: string,
  ): void {
    ballPasses.forEach((ballPass) => {
      let startPos: { x: number; z: number };
      if (ballPass.hasCustomStart()) {
        startPos = { x: ballPass.startX!, z: ballPass.startZ! };
      } else {
        const startPlayerIndex = formation.getPlayerIndexByRole(
          ballPass.startRole,
        );
        if (startPlayerIndex === undefined) return;
        startPos = initialPositions[startPlayerIndex];
      }

      let endPos: { x: number; z: number };
      if (ballPass.hasCustomEnd()) {
        endPos = { x: ballPass.endX!, z: ballPass.endZ! };
      } else {
        const endPlayerIndex = formation.getPlayerIndexByRole(ballPass.endRole);
        if (endPlayerIndex === undefined) return;
        endPos = initialPositions[endPlayerIndex];
      }

      const timeoutId = window.setTimeout(() => {
        if (this.currentExecutionId !== executionId) return;

        this.eventBus.publish(
          new BallPassDisplayedEvent(
            startPos,
            endPos,
            ballPass.color,
            ballPass.trajectoryType,
          ),
        );
      }, this.scaleDelay(ballPass.delay));

      this.timeouts.add(timeoutId);
    });
  }
}
