/**
 * @module useTacticExecution
 * @description タクティクスのアニメーション再生を管理するフック。ドメインイベント経由で選手移動・矢印・ボールパスの再生状態をReactステートに反映する。
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Tactic } from "@domain/entities/Tactic";
import { Formation } from "@domain/entities/Formation";
import { EventBus } from "@domain/events/EventBus";
import { TacticExecutor } from "@application/services/TacticExecutor";
import {
  TacticStartedEvent,
  PlayerMovementStartedEvent,
  ArrowDisplayedEvent,
  BallPassDisplayedEvent,
  TacticCompletedEvent,
  TacticCancelledEvent,
  ExecutionPhaseChangedEvent,
  StepExecutionStartedEvent,
  StepCompletedEvent,
} from "@domain/events/TacticEvent";
import type { ExecutionPhase } from "@domain/events/TacticEvent";

export interface BallTrajectoryEntry {
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
  trajectoryType?: string;
}

/** ステップ実行の状態 */
export interface StepExecutionState {
  /** ステップ実行モードが有効か */
  isStepMode: boolean;
  /** 現在のステップインデックス（0始まり） */
  currentStep: number;
  /** 総ステップ数 */
  totalSteps: number;
  /** 現在のステップが実行中か */
  isStepRunning: boolean;
  /** 実行対象の戦術 */
  tactic: Tactic | null;
}

interface UseTacticExecutionResult {
  execute: (tactic: Tactic, formation: Formation) => void;
  cancel: () => void;
  reset: () => void;
  isExecuting: boolean;
  activeTacticId: string | null;
  executionPhase: ExecutionPhase | null;
  executingBallPosition: { x: number; z: number } | null;
  playerPositions: Record<number, { x: number; z: number }>;
  arrows: Array<{
    start: { x: number; z: number };
    end: { x: number; z: number };
    color: string;
  }>;
  ballTrajectories: BallTrajectoryEntry[];
  /** ステップ実行の状態 */
  stepExecution: StepExecutionState;
  /** ステップ実行モードで戦術を開始する */
  startStepExecution: (tactic: Tactic, formation: Formation) => void;
  /** 次のステップを実行する */
  executeNextStep: () => void;
  /** ステップ実行モードを終了する */
  exitStepMode: () => void;
}

/**
 * タクティクスのアニメーション再生 (実行) を管理する。
 *
 * {@link TacticExecutor} を内部で保持し、ドメインイベント経由で
 * 選手移動・矢印・ボールパスの再生状態を React ステートに反映する。
 *
 * @param formation - 初期選手ポジションの算出に使用するアクティブなフォーメーション。
 * @returns 実行制御（`execute`、`cancel`、`reset`）、実行状態フラグ、
 *          アニメーション中の選手ポジション、矢印、およびボール軌道。
 */
export function useTacticExecution(
  formation: Formation | undefined,
): UseTacticExecutionResult {
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTacticId, setActiveTacticId] = useState<string | null>(null);
  const [executionPhase, setExecutionPhase] = useState<ExecutionPhase | null>(
    null,
  );
  const [playerPositions, setPlayerPositions] = useState<
    Record<number, { x: number; z: number }>
  >({});
  const [arrows, setArrows] = useState<
    Array<{
      start: { x: number; z: number };
      end: { x: number; z: number };
      color: string;
    }>
  >([]);
  const [ballTrajectories, setBallTrajectories] = useState<
    BallTrajectoryEntry[]
  >([]);
  const [executingBallPosition, setExecutingBallPosition] = useState<{
    x: number;
    z: number;
  } | null>(null);

  // ステップ実行の状態
  const [stepExecution, setStepExecution] = useState<StepExecutionState>({
    isStepMode: false,
    currentStep: 0,
    totalSteps: 1,
    isStepRunning: false,
    tactic: null,
  });

  const executorRef = useRef<TacticExecutor>(new TacticExecutor());
  const eventBusRef = useRef<EventBus>(EventBus.getInstance());
  const initialPositionsRef = useRef<Record<number, { x: number; z: number }>>(
    {},
  );
  const formationRef = useRef<Formation | undefined>(formation);

  // ステップ実行時の現在の選手位置を追跡（次ステップの初期位置として使用）
  const stepPlayerPositionsRef = useRef<
    Record<number, { x: number; z: number }>
  >({});

  /* eslint-disable react-hooks/set-state-in-effect -- フォーメーション変更時に初期ポジションを同期。実行中は setPlayerPositions でアニメーション更新されるため useState が必要 */
  useEffect(() => {
    formationRef.current = formation;
    if (formation) {
      const positions: Record<number, { x: number; z: number }> = {};
      formation.positions.forEach((pos, i) => {
        positions[i] = { x: pos.position.x, z: pos.position.z };
      });
      initialPositionsRef.current = positions;
      setPlayerPositions(positions);
    }
  }, [formation]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // イベントハンドラーを設定
  useEffect(() => {
    const eventBus = eventBusRef.current;

    // 戦術開始イベント
    const unsubscribeStarted = eventBus.subscribe<TacticStartedEvent>(
      "TACTIC_STARTED",
      (event) => {
        setIsExecuting(true);
        setActiveTacticId(event.tacticId);
        setArrows([]);
        setBallTrajectories([]);
      },
    );

    // 選手移動開始イベント
    const unsubscribeMovement = eventBus.subscribe<PlayerMovementStartedEvent>(
      "PLAYER_MOVEMENT_STARTED",
      (event) => {
        setPlayerPositions((prev) => {
          const next = {
            ...prev,
            [event.playerIndex]: event.targetPosition,
          };
          // ステップ実行用にも位置を追跡
          stepPlayerPositionsRef.current = next;
          return next;
        });
      },
    );

    // 矢印表示イベント
    const unsubscribeArrow = eventBus.subscribe<ArrowDisplayedEvent>(
      "ARROW_DISPLAYED",
      (event) => {
        setArrows((prev) => [
          ...prev,
          {
            start: event.start,
            end: event.end,
            color: event.color,
          },
        ]);
      },
    );

    // ボールパス表示イベント
    const unsubscribeBallPass = eventBus.subscribe<BallPassDisplayedEvent>(
      "BALL_PASS_DISPLAYED",
      (event) => {
        setBallTrajectories((prev) => [
          ...prev,
          {
            start: event.start,
            end: event.end,
            color: event.color,
            trajectoryType: event.trajectoryType,
          },
        ]);
      },
    );

    // 実行フェーズ変更イベント
    const unsubscribePhase = eventBus.subscribe<ExecutionPhaseChangedEvent>(
      "EXECUTION_PHASE_CHANGED",
      (event) => {
        setExecutionPhase(event.phase);
      },
    );

    // ステップ実行開始イベント
    const unsubscribeStepStarted =
      eventBus.subscribe<StepExecutionStartedEvent>(
        "STEP_EXECUTION_STARTED",
        (event) => {
          setStepExecution((prev) => ({
            ...prev,
            currentStep: event.stepIndex,
            totalSteps: event.totalSteps,
            isStepRunning: true,
          }));
        },
      );

    // ステップ完了イベント
    const unsubscribeStepCompleted = eventBus.subscribe<StepCompletedEvent>(
      "STEP_COMPLETED",
      (event) => {
        setStepExecution((prev) => ({
          ...prev,
          currentStep: event.stepIndex,
          isStepRunning: false,
        }));
        if (event.stepIndex < event.totalSteps - 1) {
          // 次のステップ待ちなのでisExecutingはfalseに
          setIsExecuting(false);
        }
      },
    );

    // 戦術完了イベント
    // activeTacticId は保持（戦術フローボタン等で参照するため）
    const unsubscribeCompleted = eventBus.subscribe<TacticCompletedEvent>(
      "TACTIC_COMPLETED",
      () => {
        setIsExecuting(false);
        setExecutingBallPosition(null);
        setStepExecution((prev) => {
          if (prev.isStepMode) {
            // ステップ実行モード: 完了状態を表示し、ユーザーが終了するまで保持
            return {
              ...prev,
              isStepRunning: false,
            };
          }
          // 通常実行: 即座にリセット
          setExecutionPhase(null);
          return {
            ...prev,
            isStepRunning: false,
            isStepMode: false,
            tactic: null,
          };
        });
      },
    );

    // 戦術キャンセルイベント
    const unsubscribeCancelled = eventBus.subscribe<TacticCancelledEvent>(
      "TACTIC_CANCELLED",
      () => {
        setIsExecuting(false);
        setActiveTacticId(null);
        setExecutionPhase(null);
        setExecutingBallPosition(null);
        setStepExecution({
          isStepMode: false,
          currentStep: 0,
          totalSteps: 1,
          isStepRunning: false,
          tactic: null,
        });
      },
    );

    // クリーンアップ
    const executor = executorRef.current;
    return () => {
      unsubscribeStarted();
      unsubscribeMovement();
      unsubscribeArrow();
      unsubscribeBallPass();
      unsubscribePhase();
      unsubscribeStepStarted();
      unsubscribeStepCompleted();
      unsubscribeCompleted();
      unsubscribeCancelled();
      executor.destroy();
    };
  }, []);

  // 戦術実行
  const execute = useCallback((tactic: Tactic, formation: Formation) => {
    if (!formation) return;
    setExecutingBallPosition(tactic.ballPosition ?? null);
    executorRef.current.execute(tactic, formation, initialPositionsRef.current);
  }, []);

  // ステップ実行モードで戦術を開始する
  const startStepExecution = useCallback(
    (tactic: Tactic, formation: Formation) => {
      if (!formation || !tactic.supportsStepExecution) return;

      setExecutingBallPosition(tactic.ballPosition ?? null);
      stepPlayerPositionsRef.current = { ...initialPositionsRef.current };

      setStepExecution({
        isStepMode: true,
        currentStep: 0,
        totalSteps: tactic.totalSteps,
        isStepRunning: false,
        tactic,
      });

      // 最初のステップを自動実行
      setArrows([]);
      setBallTrajectories([]);
      setActiveTacticId(tactic.id.value);
      executorRef.current.executeStep(
        tactic,
        formation,
        initialPositionsRef.current,
        0,
      );
    },
    [],
  );

  // 次のステップを実行する
  const executeNextStep = useCallback(() => {
    const fm = formationRef.current;
    if (!fm) return;

    setStepExecution((prev) => {
      if (!prev.isStepMode || !prev.tactic || prev.isStepRunning) return prev;
      const nextStep = prev.currentStep + 1;
      if (nextStep >= prev.totalSteps) return prev;

      // 前のステップの矢印・ボールパスをクリアして次ステップの表示に備える
      setArrows([]);
      setBallTrajectories([]);

      executorRef.current.executeStep(
        prev.tactic,
        fm,
        stepPlayerPositionsRef.current,
        nextStep,
      );
      return prev; // イベントハンドラーが更新する
    });
  }, []);

  // ステップ実行モードを終了する
  const exitStepMode = useCallback(() => {
    executorRef.current.cancel("Step mode exited by user");
    setExecutionPhase(null);
    setExecutingBallPosition(null);
    setStepExecution({
      isStepMode: false,
      currentStep: 0,
      totalSteps: 1,
      isStepRunning: false,
      tactic: null,
    });
  }, []);

  // キャンセル
  const cancel = useCallback(() => {
    executorRef.current.cancel();
  }, []);

  // リセット
  const reset = useCallback(() => {
    executorRef.current.cancel();
    setActiveTacticId(null);
    setExecutionPhase(null);
    setExecutingBallPosition(null);
    setArrows([]);
    setBallTrajectories([]);
    setPlayerPositions(initialPositionsRef.current);
    setStepExecution({
      isStepMode: false,
      currentStep: 0,
      totalSteps: 1,
      isStepRunning: false,
      tactic: null,
    });
  }, []);

  return {
    execute,
    cancel,
    reset,
    isExecuting,
    activeTacticId,
    executionPhase,
    executingBallPosition,
    playerPositions,
    arrows,
    ballTrajectories,
    stepExecution,
    startStepExecution,
    executeNextStep,
    exitStepMode,
  };
}
