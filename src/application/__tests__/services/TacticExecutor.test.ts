/**
 * @module TacticExecutor
 * @description 戦術実行エンジン（TacticExecutor）の単体テスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TacticExecutor } from "../../services/TacticExecutor";
import { EventBus } from "@domain/events/EventBus";
import { Tactic } from "@domain/entities/Tactic";
import { Movement } from "@domain/entities/Movement";
import { BallPass } from "@domain/entities/BallPass";
import { Formation, FormationPosition } from "@domain/entities/Formation";
import { Position } from "@domain/value-objects/Position";
import { Phase } from "@domain/value-objects/Phase";
import { FormationId } from "@domain/value-objects";
import { SET_POSITION_ARROW_COLOR } from "@shared/constants";
import { setPlaybackSpeed } from "@shared/stores/playbackSpeedStore";

if (typeof window === "undefined") {
  Object.assign(globalThis, { window: globalThis });
}

function createTestFormation(): Formation {
  const positions: FormationPosition[] = [
    { pos: "GK", position: Position.create(0, -4), category: "gk" },
    { pos: "LB", position: Position.create(-3, -2), category: "df" },
    { pos: "CB1", position: Position.create(-1, -2.5), category: "df" },
    { pos: "CB2", position: Position.create(1, -2.5), category: "df" },
    { pos: "RB", position: Position.create(3, -2), category: "df" },
    { pos: "LM", position: Position.create(-3, 0), category: "mf" },
    { pos: "CM1", position: Position.create(-1, 0), category: "mf" },
    { pos: "CM2", position: Position.create(1, 0), category: "mf" },
    { pos: "RM", position: Position.create(3, 0), category: "mf" },
    { pos: "CF1", position: Position.create(-1, 2.5), category: "fw" },
    { pos: "CF2", position: Position.create(1, 2.5), category: "fw" },
  ];
  return Formation.createDefault(
    new FormationId("test-442"),
    "4-4-2",
    "standard",
    positions,
  );
}

function createInitialPositions(): Record<number, { x: number; z: number }> {
  return {
    0: { x: 0, z: -4 },
    1: { x: -3, z: -2 },
    2: { x: -1, z: -2.5 },
    3: { x: 1, z: -2.5 },
    4: { x: 3, z: -2 },
    5: { x: -3, z: 0 },
    6: { x: -1, z: 0 },
    7: { x: 1, z: 0 },
    8: { x: 3, z: 0 },
    9: { x: -1, z: 2.5 },
    10: { x: 1, z: 2.5 },
  };
}

function createTactic(input?: {
  movements?: Movement[];
  ballPasses?: BallPass[];
  ballPosition?: { x: number; z: number };
  stepBoundaries?: number[];
  name?: { ja: string; en: string };
}): Tactic {
  const movements = new Map<string, Movement[]>();
  movements.set("4-4-2", input?.movements ?? [Movement.create("CF1", 0, 4, 0)]);

  const ballPasses = new Map<string, BallPass[]>();
  if (input?.ballPasses) {
    ballPasses.set("4-4-2", input.ballPasses);
  }

  return Tactic.create({
    name: input?.name ?? { ja: "テスト", en: "Test" },
    icon: "⚽",
    phase: Phase.attack(),
    movements,
    ballPasses: input?.ballPasses ? ballPasses : undefined,
    ballPosition: input?.ballPosition,
    stepBoundaries: input?.stepBoundaries,
  });
}

describe("TacticExecutor", () => {
  let eventBus: EventBus;
  let executor: TacticExecutor;

  beforeEach(() => {
    vi.useFakeTimers();
    eventBus = EventBus.getInstance();
    eventBus.clearAll();
    executor = new TacticExecutor(eventBus);
    setPlaybackSpeed(1);
  });

  afterEach(() => {
    executor.destroy();
    setPlaybackSpeed(1);
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("EventBusを注入できる", () => {
      const customBus = EventBus.getInstance();
      const exec = new TacticExecutor(customBus);
      expect(exec).toBeDefined();
    });

    it("EventBusを省略するとシングルトンが使われる", () => {
      const exec = new TacticExecutor();
      expect(exec).toBeDefined();
    });
  });

  describe("execute", () => {
    it("戦術開始イベントが発行される", () => {
      const handler = vi.fn();
      eventBus.subscribe("TACTIC_STARTED", handler);

      const tactic = createTactic();
      executor.execute(tactic, createTestFormation(), createInitialPositions());

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].tacticId).toBe(tactic.id.value);
    });

    it("移動もパスもない場合はキャンセルイベントが発行される", () => {
      const handler = vi.fn();
      eventBus.subscribe("TACTIC_CANCELLED", handler);

      const movements = new Map<string, Movement[]>();
      movements.set("3-5-2", [Movement.create("CF1", 0, 4, 0)]);
      const tactic = Tactic.create({
        name: { ja: "テスト", en: "Test" },
        icon: "⚽",
        phase: Phase.attack(),
        movements,
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      expect(handler).toHaveBeenCalledOnce();
      expect(executor.isExecuting()).toBe(false);
    });

    it("移動開始と矢印表示がdelay後に発行される", () => {
      const movementHandler = vi.fn();
      const arrowHandler = vi.fn();
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", movementHandler);
      eventBus.subscribe("ARROW_DISPLAYED", arrowHandler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 300, "#ff0000")],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      vi.advanceTimersByTime(299);
      expect(movementHandler).not.toHaveBeenCalled();
      expect(arrowHandler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(movementHandler).toHaveBeenCalledOnce();
      expect(arrowHandler).toHaveBeenCalledOnce();
      expect(arrowHandler.mock.calls[0][0].color).toBe("#ff0000");
    });

    it("ボールパスイベントがdelay後に発行される", () => {
      const handler = vi.fn();
      eventBus.subscribe("BALL_PASS_DISPLAYED", handler);

      const tactic = createTactic({
        ballPasses: [
          BallPass.create({
            startRole: "CF1",
            endRole: "CF2",
            delay: 500,
            color: "#facc15",
          }),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      vi.advanceTimersByTime(499);
      expect(handler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(handler).toHaveBeenCalledOnce();
    });

    it("移動がなくボールパスだけでも実行と完了ができる", () => {
      const phaseHandler = vi.fn();
      const ballPassHandler = vi.fn();
      const completeHandler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", phaseHandler);
      eventBus.subscribe("BALL_PASS_DISPLAYED", ballPassHandler);
      eventBus.subscribe("TACTIC_COMPLETED", completeHandler);

      const tactic = createTactic({
        movements: [],
        ballPasses: [
          BallPass.create({
            startRole: "CF1",
            endRole: "CF2",
            delay: 400,
          }),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      expect(phaseHandler).toHaveBeenCalledOnce();
      expect(phaseHandler.mock.calls[0][0].phase).toBe("run");

      vi.advanceTimersByTime(400);
      expect(ballPassHandler).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(1500);
      expect(completeHandler).toHaveBeenCalledOnce();
      expect(executor.isExecuting()).toBe(false);
    });

    it("最後の遅延にCOMPLETION_BUFFERを足した時点で完了する", () => {
      const handler = vi.fn();
      eventBus.subscribe("TACTIC_COMPLETED", handler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 200)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      vi.advanceTimersByTime(1699);
      expect(handler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(handler).toHaveBeenCalledOnce();
    });

    it("同じ選手の連続移動では次の開始位置に前回の終点が使われる", () => {
      const handler = vi.fn();
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", handler);

      const tactic = createTactic({
        movements: [
          Movement.create("CF1", 0, 4, 100),
          Movement.create("CF1", 2, 5, 300),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      vi.advanceTimersByTime(300);

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler.mock.calls[0][0].startPosition).toEqual({ x: -1, z: 2.5 });
      expect(handler.mock.calls[0][0].targetPosition).toEqual({ x: 0, z: 4 });
      expect(handler.mock.calls[1][0].startPosition).toEqual({ x: 0, z: 4 });
      expect(handler.mock.calls[1][0].targetPosition).toEqual({ x: 2, z: 5 });
    });

    it("存在しないroleの移動は無視される", () => {
      const handler = vi.fn();
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", handler);

      const tactic = createTactic({
        movements: [Movement.create("UNKNOWN", 0, 4, 0)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      vi.runAllTimers();

      expect(handler).not.toHaveBeenCalled();
    });

    it("カスタム座標のボールパスを発行できる", () => {
      const handler = vi.fn();
      eventBus.subscribe("BALL_PASS_DISPLAYED", handler);

      const tactic = createTactic({
        ballPasses: [
          BallPass.create({
            startRole: "",
            endRole: "",
            startX: 4,
            startZ: 1,
            endX: 8,
            endZ: 6,
            color: "#22c55e",
          }),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      vi.runOnlyPendingTimers();

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].start).toEqual({ x: 4, z: 1 });
      expect(handler.mock.calls[0][0].end).toEqual({ x: 8, z: 6 });
    });

    it("存在しない開始roleのボールパスは無視される", () => {
      const handler = vi.fn();
      eventBus.subscribe("BALL_PASS_DISPLAYED", handler);

      const tactic = createTactic({
        movements: [],
        ballPasses: [
          BallPass.create({
            startRole: "UNKNOWN",
            endRole: "CF2",
          }),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      vi.runAllTimers();

      expect(handler).not.toHaveBeenCalled();
    });

    it("存在しない終了roleのボールパスは無視される", () => {
      const handler = vi.fn();
      eventBus.subscribe("BALL_PASS_DISPLAYED", handler);

      const tactic = createTactic({
        movements: [],
        ballPasses: [
          BallPass.create({
            startRole: "CF1",
            endRole: "UNKNOWN",
          }),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      vi.runAllTimers();

      expect(handler).not.toHaveBeenCalled();
    });

    it("再生速度を考慮して遅延が短縮される", () => {
      const handler = vi.fn();
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", handler);
      setPlaybackSpeed(2);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 400)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      vi.advanceTimersByTime(199);
      expect(handler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(handler).toHaveBeenCalledOnce();
    });

    it("再生速度が0以下の場合は元の遅延を使う", () => {
      const handler = vi.fn();
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", handler);
      setPlaybackSpeed(0);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 400)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      vi.advanceTimersByTime(399);
      expect(handler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(handler).toHaveBeenCalledOnce();
    });

    it("getCurrentExecutionIdで現在の実行IDを取得できる", () => {
      const tactic = createTactic();

      expect(executor.getCurrentExecutionId()).toBeNull();

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      expect(executor.getCurrentExecutionId()).toContain(tactic.id.value);
    });
  });

  describe("execution phases", () => {
    it("セットポジションと実行内容がある場合はhighlight→set→runを発行する", () => {
      const handler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", handler);

      const tactic = createTactic({
        movements: [
          Movement.create("CF1", 0, 3.5, 200, SET_POSITION_ARROW_COLOR),
          Movement.create("CF2", 2, 5, 600, "#ef4444"),
        ],
        ballPasses: [
          BallPass.create({
            startRole: "CF1",
            endRole: "CF2",
            delay: 800,
          }),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      expect(handler.mock.calls.map(([event]) => event.phase)).toEqual([
        "highlight",
      ]);

      vi.advanceTimersByTime(200);
      expect(handler.mock.calls.map(([event]) => event.phase)).toEqual([
        "highlight",
        "set",
      ]);

      vi.advanceTimersByTime(400);
      expect(handler.mock.calls.map(([event]) => event.phase)).toEqual([
        "highlight",
        "set",
        "run",
      ]);
    });

    it("セットポジションだけの場合はhighlight→setを発行する", () => {
      const handler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", handler);

      const tactic = createTactic({
        movements: [
          Movement.create("CF1", 0, 3.5, 200, SET_POSITION_ARROW_COLOR),
        ],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      vi.advanceTimersByTime(200);

      expect(handler.mock.calls.map(([event]) => event.phase)).toEqual([
        "highlight",
        "set",
      ]);
    });

    it("セットポジションがない場合は即runになる", () => {
      const handler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", handler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 200)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].phase).toBe("run");
    });
  });

  describe("executeStep", () => {
    it("stepBoundariesがない場合は通常実行にフォールバックする", () => {
      const stepHandler = vi.fn();
      const startHandler = vi.fn();
      eventBus.subscribe("STEP_EXECUTION_STARTED", stepHandler);
      eventBus.subscribe("TACTIC_STARTED", startHandler);

      const tactic = createTactic();
      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        0,
      );

      expect(stepHandler).not.toHaveBeenCalled();
      expect(startHandler).toHaveBeenCalledOnce();
    });

    it("ステップ開始時にstepイベントを発行する", () => {
      const stepHandler = vi.fn();
      const startHandler = vi.fn();
      eventBus.subscribe("STEP_EXECUTION_STARTED", stepHandler);
      eventBus.subscribe("TACTIC_STARTED", startHandler);

      const tactic = createTactic({
        stepBoundaries: [0, 500],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        0,
      );

      expect(startHandler).toHaveBeenCalledOnce();
      expect(stepHandler).toHaveBeenCalledOnce();
      expect(stepHandler.mock.calls[0][0].stepIndex).toBe(0);
      expect(stepHandler.mock.calls[0][0].totalSteps).toBe(2);
    });

    it("空ステップは即座にStepCompletedを発行する", () => {
      const stepHandler = vi.fn();
      const tacticHandler = vi.fn();
      eventBus.subscribe("STEP_COMPLETED", stepHandler);
      eventBus.subscribe("TACTIC_COMPLETED", tacticHandler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 900)],
        stepBoundaries: [0, 500],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        0,
      );

      expect(stepHandler).toHaveBeenCalledOnce();
      expect(tacticHandler).not.toHaveBeenCalled();
    });

    it("最終ステップが空なら戦術完了も即時発行する", () => {
      const stepHandler = vi.fn();
      const tacticHandler = vi.fn();
      eventBus.subscribe("STEP_COMPLETED", stepHandler);
      eventBus.subscribe("TACTIC_COMPLETED", tacticHandler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 100)],
        stepBoundaries: [0, 500],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        1,
      );

      expect(stepHandler).toHaveBeenCalledOnce();
      expect(tacticHandler).toHaveBeenCalledOnce();
      expect(tacticHandler.mock.calls[0][0].duration).toBe(0);
      expect(executor.isExecuting()).toBe(false);
    });

    it("非最終ステップ完了後はexecutionIdをクリアする", () => {
      const stepHandler = vi.fn();
      eventBus.subscribe("STEP_COMPLETED", stepHandler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 100)],
        stepBoundaries: [0, 500],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        0,
      );

      vi.advanceTimersByTime(1600);
      expect(stepHandler).toHaveBeenCalledOnce();
      expect(executor.isExecuting()).toBe(false);
      expect(executor.getCurrentExecutionId()).toBeNull();
    });

    it("最終ステップ完了時はStepCompletedの後にTacticCompletedを発行する", () => {
      const stepHandler = vi.fn();
      const tacticHandler = vi.fn();
      eventBus.subscribe("STEP_COMPLETED", stepHandler);
      eventBus.subscribe("TACTIC_COMPLETED", tacticHandler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 600)],
        stepBoundaries: [0, 500],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        1,
      );

      vi.advanceTimersByTime(1600);
      expect(stepHandler).toHaveBeenCalledOnce();
      expect(tacticHandler).toHaveBeenCalledOnce();
    });

    it("旧形式ステップではstep0にセットポジション移動を含める", () => {
      const phaseHandler = vi.fn();
      const movementHandler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", phaseHandler);
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", movementHandler);

      const tactic = createTactic({
        movements: [
          Movement.create("CF1", 0, 3, 0, SET_POSITION_ARROW_COLOR),
          Movement.create("CF2", 2, 5, 600, "#ef4444"),
        ],
        stepBoundaries: [500, 1000],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        0,
      );

      vi.advanceTimersByTime(1);
      expect(phaseHandler.mock.calls.map(([event]) => event.phase)).toEqual([
        "set",
      ]);
      expect(movementHandler).toHaveBeenCalledOnce();
      expect(movementHandler.mock.calls[0][0].targetPosition).toEqual({
        x: 0,
        z: 3,
      });
    });

    it("セットアップ境界付きステップではoffset後のhighlight→set→runを発行する", () => {
      const phaseHandler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", phaseHandler);

      const tactic = createTactic({
        movements: [
          Movement.create("CF1", 0, 3, 800, SET_POSITION_ARROW_COLOR),
          Movement.create("CF2", 2, 5, 900, "#ef4444"),
        ],
        ballPosition: { x: 0, z: 0 },
        stepBoundaries: [0, 500, 1000],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        1,
      );

      expect(phaseHandler.mock.calls.map(([event]) => event.phase)).toEqual([
        "highlight",
      ]);

      vi.advanceTimersByTime(300);
      expect(phaseHandler.mock.calls.map(([event]) => event.phase)).toEqual([
        "highlight",
        "set",
      ]);

      vi.advanceTimersByTime(100);
      expect(phaseHandler.mock.calls.map(([event]) => event.phase)).toEqual([
        "highlight",
        "set",
        "run",
      ]);
    });

    it("set-onlyのステップでballPositionが無い場合は即setになる", () => {
      const phaseHandler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", phaseHandler);

      const tactic = createTactic({
        movements: [
          Movement.create("CF1", 0, 3, 800, SET_POSITION_ARROW_COLOR),
        ],
        stepBoundaries: [0, 500, 1000],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        1,
      );

      expect(phaseHandler).toHaveBeenCalledOnce();
      expect(phaseHandler.mock.calls[0][0].phase).toBe("set");
    });

    it("ボールパスだけのステップでもステップ完了を遅延発行する", () => {
      const phaseHandler = vi.fn();
      const ballPassHandler = vi.fn();
      const stepHandler = vi.fn();
      eventBus.subscribe("EXECUTION_PHASE_CHANGED", phaseHandler);
      eventBus.subscribe("BALL_PASS_DISPLAYED", ballPassHandler);
      eventBus.subscribe("STEP_COMPLETED", stepHandler);

      const tactic = createTactic({
        movements: [],
        ballPasses: [
          BallPass.create({
            startRole: "CF1",
            endRole: "CF2",
            delay: 700,
          }),
        ],
        stepBoundaries: [0, 500, 1000],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        1,
      );

      expect(phaseHandler).toHaveBeenCalledOnce();
      expect(phaseHandler.mock.calls[0][0].phase).toBe("run");

      vi.advanceTimersByTime(199);
      expect(ballPassHandler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(ballPassHandler).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(1499);
      expect(stepHandler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(stepHandler).toHaveBeenCalledOnce();
    });

    it("ステップ実行中に次のステップを始めると前の実行をキャンセルする", () => {
      const cancelHandler = vi.fn();
      eventBus.subscribe("TACTIC_CANCELLED", cancelHandler);

      const tactic = createTactic({
        movements: [
          Movement.create("CF1", 0, 3, 800, SET_POSITION_ARROW_COLOR),
          Movement.create("CF2", 2, 5, 900, "#ef4444"),
        ],
        stepBoundaries: [0, 500, 1000],
      });

      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        0,
      );
      executor.executeStep(
        tactic,
        createTestFormation(),
        createInitialPositions(),
        1,
      );

      expect(cancelHandler).toHaveBeenCalledOnce();
      expect(cancelHandler.mock.calls[0][0].reason).toBe(
        "Superseded by step execution",
      );
    });
  });

  describe("lifecycle", () => {
    it("移動開始から500ms後に移動完了イベントを発行する", () => {
      const handler = vi.fn();
      eventBus.subscribe("PLAYER_MOVEMENT_COMPLETED", handler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 100)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());

      vi.advanceTimersByTime(599);
      expect(handler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0].position).toEqual({ x: 0, z: 4 });
    });

    it("実行中はtrue、完了後はfalseを返す", () => {
      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 200)],
      });

      expect(executor.isExecuting()).toBe(false);

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      expect(executor.isExecuting()).toBe(true);

      vi.advanceTimersByTime(1700);
      expect(executor.isExecuting()).toBe(false);
    });

    it("キャンセル後は予定されていたイベントが発行されない", () => {
      const cancelHandler = vi.fn();
      const movementHandler = vi.fn();
      eventBus.subscribe("TACTIC_CANCELLED", cancelHandler);
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", movementHandler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 500)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      executor.cancel("テスト理由");
      vi.advanceTimersByTime(5000);

      expect(cancelHandler).toHaveBeenCalledOnce();
      expect(cancelHandler.mock.calls[0][0].reason).toBe("テスト理由");
      expect(movementHandler).not.toHaveBeenCalled();
      expect(executor.isExecuting()).toBe(false);
    });

    it("実行中でない場合のcancelは何もしない", () => {
      const handler = vi.fn();
      eventBus.subscribe("TACTIC_CANCELLED", handler);

      executor.cancel();

      expect(handler).not.toHaveBeenCalled();
    });

    it("新しい戦術実行時に前の戦術を自動キャンセルする", () => {
      const cancelHandler = vi.fn();
      eventBus.subscribe("TACTIC_CANCELLED", cancelHandler);

      const tactic1 = createTactic({ name: { ja: "戦術1", en: "T1" } });
      const tactic2 = createTactic({ name: { ja: "戦術2", en: "T2" } });

      executor.execute(
        tactic1,
        createTestFormation(),
        createInitialPositions(),
      );
      executor.execute(
        tactic2,
        createTestFormation(),
        createInitialPositions(),
      );

      expect(cancelHandler).toHaveBeenCalledOnce();
      expect(cancelHandler.mock.calls[0][0].reason).toBe(
        "Superseded by new tactic execution",
      );
    });

    it("destroyでタイマーと実行状態を破棄する", () => {
      const movementHandler = vi.fn();
      const completeHandler = vi.fn();
      eventBus.subscribe("PLAYER_MOVEMENT_STARTED", movementHandler);
      eventBus.subscribe("TACTIC_COMPLETED", completeHandler);

      const tactic = createTactic({
        movements: [Movement.create("CF1", 0, 4, 500)],
      });

      executor.execute(tactic, createTestFormation(), createInitialPositions());
      executor.destroy();
      vi.advanceTimersByTime(5000);

      expect(movementHandler).not.toHaveBeenCalled();
      expect(completeHandler).not.toHaveBeenCalled();
      expect(executor.isExecuting()).toBe(false);
      expect(executor.getCurrentExecutionId()).toBeNull();
    });
  });
});
