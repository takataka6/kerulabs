/**
 * @module useTacticExecution フック
 * @description 戦術実行（アニメーション再生）フックの単体テスト
 *
 * テスト方針:
 * - EventBus のドメインイベントを購読し、各イベント発火時の状態更新を検証
 * - vi.useFakeTimers() でTacticExecutorのタイマーを制御
 * - 実行開始→移動→矢印→パス→完了/キャンセルの一連のフローを検証
 * - 実行中フラグ、矢印・パスの累積管理、キャンセル後のクリーンアップを検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Formation, type FormationPosition } from "@domain/entities/Formation";
import { Tactic } from "@domain/entities/Tactic";
import { Phase } from "@domain/value-objects/Phase";
import { Position } from "@domain/value-objects/Position";
import { Movement } from "@domain/entities/Movement";
import { FormationId } from "@domain/value-objects/FormationId";
import { TacticId } from "@domain/value-objects/TacticId";
import { EventBus } from "@domain/events/EventBus";
import {
  TacticStartedEvent,
  PlayerMovementStartedEvent,
  ArrowDisplayedEvent,
  BallPassDisplayedEvent,
  TacticCompletedEvent,
  TacticCancelledEvent,
  ExecutionPhaseChangedEvent,
} from "@domain/events/TacticEvent";
import { useTacticExecution } from "../useTacticExecution";

// ── Mock TacticExecutor ──

const mockExecute = vi.fn();
const mockCancel = vi.fn();
const mockDestroy = vi.fn();

vi.mock("@application/services/TacticExecutor", () => ({
  TacticExecutor: vi.fn().mockImplementation(() => ({
    execute: mockExecute,
    cancel: mockCancel,
    destroy: mockDestroy,
    isExecuting: vi.fn().mockReturnValue(false),
    getCurrentExecutionId: vi.fn().mockReturnValue(null),
  })),
}));

vi.mock("@shared/errors/handleError", () => ({
  handleError: vi.fn(),
}));

// ── Helpers ──

function createTestFormationPositions(): FormationPosition[] {
  const roles = [
    "GK",
    "CB1",
    "CB2",
    "SB1",
    "SB2",
    "CM1",
    "CM2",
    "CM3",
    "RW",
    "LW",
    "ST",
  ];
  const categories: Array<"gk" | "df" | "mf" | "fw"> = [
    "gk",
    "df",
    "df",
    "df",
    "df",
    "mf",
    "mf",
    "mf",
    "fw",
    "fw",
    "fw",
  ];
  return roles.map((role, i) => ({
    pos: role,
    position: Position.create(i * 1.0, i * 0.5),
    category: categories[i],
  }));
}

function createTestFormation(): Formation {
  return Formation.createDefault(
    new FormationId("f-1"),
    "4-3-3",
    "standard",
    createTestFormationPositions(),
  );
}

function createTestTactic(overrides?: {
  id?: string;
  ballPosition?: { x: number; z: number };
}): Tactic {
  const movements = new Map<string, Movement[]>();
  movements.set("4-3-3", [Movement.create("CB1", 3, 4, 0, "#3b82f6")]);

  const tactic = Tactic.create({
    name: { ja: "Test", en: "Test" },
    icon: "⚽",
    phase: Phase.fromString("attack"),
    movements,
    ballPasses: new Map(),
    ballPosition: overrides?.ballPosition,
  });

  if (overrides?.id) {
    Object.defineProperty(tactic, "id", { value: new TacticId(overrides.id) });
  }

  return tactic;
}

let eventBus: EventBus;

// ── Tests ──

describe("useTacticExecution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventBus = EventBus.getInstance();
    eventBus.clearAll();
  });

  afterEach(() => {
    eventBus.clearAll();
  });

  // ==========================================================================
  // 初期状態
  // ==========================================================================
  describe("初期状態", () => {
    it("isExecuting が false", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.isExecuting).toBe(false);
    });

    it("activeTacticId が null", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.activeTacticId).toBeNull();
    });

    it("executionPhase が null", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.executionPhase).toBeNull();
    });

    it("executingBallPosition が null", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.executingBallPosition).toBeNull();
    });

    it("playerPositions が空オブジェクト", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.playerPositions).toEqual({});
    });

    it("arrows が空配列", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.arrows).toEqual([]);
    });

    it("ballTrajectories が空配列", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.ballTrajectories).toEqual([]);
    });
  });

  // ==========================================================================
  // formation 同期
  // ==========================================================================
  describe("formation 同期", () => {
    it("formation が渡されたとき playerPositions を初期化する", () => {
      const formation = createTestFormation();
      const { result } = renderHook(() => useTacticExecution(formation));

      // 11 positions (4-3-3)
      expect(Object.keys(result.current.playerPositions)).toHaveLength(11);
      // GK at index 0: Position.create(0, 0)
      expect(result.current.playerPositions[0]).toEqual({ x: 0, z: 0 });
      // CB1 at index 1: Position.create(1, 0.5)
      expect(result.current.playerPositions[1]).toEqual({ x: 1, z: 0.5 });
    });

    it("formation が undefined のとき playerPositions は変わらない", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));
      expect(result.current.playerPositions).toEqual({});
    });

    it("formation が変更されたら playerPositions を更新する", () => {
      const formation1 = createTestFormation();
      const { result, rerender } = renderHook(
        ({ f }: { f: Formation | undefined }) => useTacticExecution(f),
        { initialProps: { f: formation1 } },
      );

      expect(result.current.playerPositions[0]).toEqual({ x: 0, z: 0 });

      // 別のフォーメーションに変更
      const positions2 = createTestFormationPositions().map((p, i) => ({
        ...p,
        position: Position.create(i * 2, i * 3),
      }));
      const formation2 = Formation.createDefault(
        new FormationId("f-2"),
        "4-4-2",
        "standard",
        positions2,
      );

      rerender({ f: formation2 });

      expect(result.current.playerPositions[0]).toEqual({ x: 0, z: 0 });
      expect(result.current.playerPositions[1]).toEqual({ x: 2, z: 3 });
    });
  });

  // ==========================================================================
  // execute
  // ==========================================================================
  describe("execute", () => {
    it("TacticExecutor.execute を呼ぶ", () => {
      const formation = createTestFormation();
      const tactic = createTestTactic();

      const { result } = renderHook(() => useTacticExecution(formation));

      act(() => {
        result.current.execute(tactic, formation);
      });

      expect(mockExecute).toHaveBeenCalledWith(
        tactic,
        formation,
        expect.any(Object),
      );
    });

    it("ballPosition がある場合 executingBallPosition にセットする", () => {
      const formation = createTestFormation();
      const tactic = createTestTactic({
        ballPosition: { x: 10, z: 20 },
      });

      const { result } = renderHook(() => useTacticExecution(formation));

      act(() => {
        result.current.execute(tactic, formation);
      });

      expect(result.current.executingBallPosition).toEqual({ x: 10, z: 20 });
    });

    it("ballPosition がない場合 executingBallPosition は null", () => {
      const formation = createTestFormation();
      const tactic = createTestTactic();

      const { result } = renderHook(() => useTacticExecution(formation));

      act(() => {
        result.current.execute(tactic, formation);
      });

      expect(result.current.executingBallPosition).toBeNull();
    });
  });

  // ==========================================================================
  // cancel
  // ==========================================================================
  describe("cancel", () => {
    it("TacticExecutor.cancel を呼ぶ", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        result.current.cancel();
      });

      expect(mockCancel).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // reset
  // ==========================================================================
  describe("reset", () => {
    it("TacticExecutor.cancel を呼び全状態をリセットする", () => {
      const formation = createTestFormation();
      const { result } = renderHook(() => useTacticExecution(formation));

      // まず TACTIC_STARTED で状態を変更
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-1", "Test"));
      });
      expect(result.current.isExecuting).toBe(true);
      expect(result.current.activeTacticId).toBe("tac-1");

      // 矢印を追加
      act(() => {
        eventBus.publish(
          new ArrowDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#000"),
        );
      });
      expect(result.current.arrows).toHaveLength(1);

      // reset
      act(() => {
        result.current.reset();
      });

      expect(mockCancel).toHaveBeenCalled();
      expect(result.current.activeTacticId).toBeNull();
      expect(result.current.executionPhase).toBeNull();
      expect(result.current.executingBallPosition).toBeNull();
      expect(result.current.arrows).toEqual([]);
      expect(result.current.ballTrajectories).toEqual([]);
      // playerPositions は initialPositions に復元される
      expect(Object.keys(result.current.playerPositions)).toHaveLength(11);
    });
  });

  // ==========================================================================
  // イベント: TACTIC_STARTED
  // ==========================================================================
  describe("TACTIC_STARTED イベント", () => {
    it("isExecuting を true にし activeTacticId をセットする", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-1", "Test Tactic"));
      });

      expect(result.current.isExecuting).toBe(true);
      expect(result.current.activeTacticId).toBe("tac-1");
    });

    it("arrows と ballTrajectories をクリアする", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      // 先に矢印とボール軌道を追加
      act(() => {
        eventBus.publish(
          new ArrowDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#000"),
        );
      });
      act(() => {
        eventBus.publish(
          new BallPassDisplayedEvent({ x: 0, z: 0 }, { x: 2, z: 2 }, "#ff0"),
        );
      });
      expect(result.current.arrows).toHaveLength(1);
      expect(result.current.ballTrajectories).toHaveLength(1);

      // 新しい戦術開始 → クリア
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-2", "New Tactic"));
      });

      expect(result.current.arrows).toEqual([]);
      expect(result.current.ballTrajectories).toEqual([]);
    });
  });

  // ==========================================================================
  // イベント: PLAYER_MOVEMENT_STARTED
  // ==========================================================================
  describe("PLAYER_MOVEMENT_STARTED イベント", () => {
    it("指定インデックスの playerPositions を更新する", () => {
      const formation = createTestFormation();
      const { result } = renderHook(() => useTacticExecution(formation));

      const targetPos = { x: 5, z: 10 };
      act(() => {
        eventBus.publish(
          new PlayerMovementStartedEvent(1, { x: 0, z: 0 }, targetPos, 0),
        );
      });

      expect(result.current.playerPositions[1]).toEqual(targetPos);
      // 他のインデックスは変わらない
      expect(result.current.playerPositions[0]).toEqual({ x: 0, z: 0 });
    });

    it("複数の移動イベントを累積的に反映する", () => {
      const formation = createTestFormation();
      const { result } = renderHook(() => useTacticExecution(formation));

      act(() => {
        eventBus.publish(
          new PlayerMovementStartedEvent(0, { x: 0, z: 0 }, { x: 5, z: 5 }, 0),
        );
      });
      act(() => {
        eventBus.publish(
          new PlayerMovementStartedEvent(
            2,
            { x: 2, z: 1 },
            { x: 8, z: 8 },
            100,
          ),
        );
      });

      expect(result.current.playerPositions[0]).toEqual({ x: 5, z: 5 });
      expect(result.current.playerPositions[2]).toEqual({ x: 8, z: 8 });
    });
  });

  // ==========================================================================
  // イベント: ARROW_DISPLAYED
  // ==========================================================================
  describe("ARROW_DISPLAYED イベント", () => {
    it("arrows に矢印を追加する", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      const start = { x: 1, z: 1 };
      const end = { x: 3, z: 3 };
      act(() => {
        eventBus.publish(new ArrowDisplayedEvent(start, end, "#ff0000"));
      });

      expect(result.current.arrows).toHaveLength(1);
      expect(result.current.arrows[0]).toEqual({
        start,
        end,
        color: "#ff0000",
      });
    });

    it("複数の矢印イベントを累積的に追加する", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(
          new ArrowDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#f00"),
        );
      });
      act(() => {
        eventBus.publish(
          new ArrowDisplayedEvent({ x: 2, z: 2 }, { x: 3, z: 3 }, "#0f0"),
        );
      });

      expect(result.current.arrows).toHaveLength(2);
      expect(result.current.arrows[0].color).toBe("#f00");
      expect(result.current.arrows[1].color).toBe("#0f0");
    });
  });

  // ==========================================================================
  // イベント: BALL_PASS_DISPLAYED
  // ==========================================================================
  describe("BALL_PASS_DISPLAYED イベント", () => {
    it("ballTrajectories にボール軌道を追加する", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(
          new BallPassDisplayedEvent(
            { x: 1, z: 1 },
            { x: 5, z: 5 },
            "#facc15",
            "high",
          ),
        );
      });

      expect(result.current.ballTrajectories).toHaveLength(1);
      expect(result.current.ballTrajectories[0]).toEqual({
        start: { x: 1, z: 1 },
        end: { x: 5, z: 5 },
        color: "#facc15",
        trajectoryType: "high",
      });
    });

    it("trajectoryType が省略されたとき undefined になる", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(
          new BallPassDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#000"),
        );
      });

      expect(result.current.ballTrajectories[0].trajectoryType).toBeUndefined();
    });

    it("複数のボールパスを累積的に追加する", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(
          new BallPassDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#f00"),
        );
      });
      act(() => {
        eventBus.publish(
          new BallPassDisplayedEvent(
            { x: 2, z: 2 },
            { x: 3, z: 3 },
            "#0f0",
            "low",
          ),
        );
      });

      expect(result.current.ballTrajectories).toHaveLength(2);
    });
  });

  // ==========================================================================
  // イベント: EXECUTION_PHASE_CHANGED
  // ==========================================================================
  describe("EXECUTION_PHASE_CHANGED イベント", () => {
    it("executionPhase を更新する", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(new ExecutionPhaseChangedEvent("highlight", "tac-1"));
      });
      expect(result.current.executionPhase).toBe("highlight");

      act(() => {
        eventBus.publish(new ExecutionPhaseChangedEvent("set", "tac-1"));
      });
      expect(result.current.executionPhase).toBe("set");

      act(() => {
        eventBus.publish(new ExecutionPhaseChangedEvent("run", "tac-1"));
      });
      expect(result.current.executionPhase).toBe("run");
    });
  });

  // ==========================================================================
  // イベント: TACTIC_COMPLETED
  // ==========================================================================
  describe("TACTIC_COMPLETED イベント", () => {
    it("isExecuting を false にし executionPhase と executingBallPosition をクリアする", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      // 先に開始
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-1", "Test"));
      });
      expect(result.current.isExecuting).toBe(true);

      // 完了
      act(() => {
        eventBus.publish(new TacticCompletedEvent("tac-1", 3000));
      });

      expect(result.current.isExecuting).toBe(false);
      expect(result.current.executionPhase).toBeNull();
      expect(result.current.executingBallPosition).toBeNull();
    });

    it("activeTacticId は保持される（戦術フローボタン参照用）", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-1", "Test"));
      });

      act(() => {
        eventBus.publish(new TacticCompletedEvent("tac-1", 3000));
      });

      // TACTIC_COMPLETED では activeTacticId は保持される
      expect(result.current.activeTacticId).toBe("tac-1");
    });
  });

  // ==========================================================================
  // イベント: TACTIC_CANCELLED
  // ==========================================================================
  describe("TACTIC_CANCELLED イベント", () => {
    it("全状態をクリアする（activeTacticId 含む）", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      // 先に開始
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-1", "Test"));
      });
      expect(result.current.isExecuting).toBe(true);
      expect(result.current.activeTacticId).toBe("tac-1");

      // キャンセル
      act(() => {
        eventBus.publish(new TacticCancelledEvent("tac-1", "User cancelled"));
      });

      expect(result.current.isExecuting).toBe(false);
      expect(result.current.activeTacticId).toBeNull();
      expect(result.current.executionPhase).toBeNull();
      expect(result.current.executingBallPosition).toBeNull();
    });
  });

  // ==========================================================================
  // 統合シナリオ: 戦術実行ライフサイクル
  // ==========================================================================
  describe("統合: 戦術実行ライフサイクル", () => {
    it("開始 → 移動 → 矢印 → ボールパス → 完了 の一連のフロー", () => {
      const formation = createTestFormation();
      const { result } = renderHook(() => useTacticExecution(formation));

      // 1. 開始
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-lifecycle", "Lifecycle"));
      });
      expect(result.current.isExecuting).toBe(true);
      expect(result.current.activeTacticId).toBe("tac-lifecycle");
      expect(result.current.arrows).toEqual([]);

      // 2. フェーズ: highlight
      act(() => {
        eventBus.publish(
          new ExecutionPhaseChangedEvent("highlight", "tac-lifecycle"),
        );
      });
      expect(result.current.executionPhase).toBe("highlight");

      // 3. フェーズ: run
      act(() => {
        eventBus.publish(
          new ExecutionPhaseChangedEvent("run", "tac-lifecycle"),
        );
      });
      expect(result.current.executionPhase).toBe("run");

      // 4. 移動
      act(() => {
        eventBus.publish(
          new PlayerMovementStartedEvent(
            1,
            { x: 1, z: 0.5 },
            { x: 5, z: 5 },
            0,
          ),
        );
      });
      expect(result.current.playerPositions[1]).toEqual({ x: 5, z: 5 });

      // 5. 矢印
      act(() => {
        eventBus.publish(
          new ArrowDisplayedEvent({ x: 1, z: 0.5 }, { x: 5, z: 5 }, "#3b82f6"),
        );
      });
      expect(result.current.arrows).toHaveLength(1);

      // 6. ボールパス
      act(() => {
        eventBus.publish(
          new BallPassDisplayedEvent(
            { x: 0, z: 0 },
            { x: 5, z: 5 },
            "#facc15",
            "low",
          ),
        );
      });
      expect(result.current.ballTrajectories).toHaveLength(1);

      // 7. 完了
      act(() => {
        eventBus.publish(new TacticCompletedEvent("tac-lifecycle", 2500));
      });
      expect(result.current.isExecuting).toBe(false);
      expect(result.current.executionPhase).toBeNull();
      // arrows と ballTrajectories は完了時にクリアされない（表示を残す）
      expect(result.current.arrows).toHaveLength(1);
      expect(result.current.ballTrajectories).toHaveLength(1);
      // activeTacticId は保持
      expect(result.current.activeTacticId).toBe("tac-lifecycle");
    });

    it("実行中にキャンセルすると全状態がクリアされる", () => {
      const formation = createTestFormation();
      const { result } = renderHook(() => useTacticExecution(formation));

      // 開始
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-cancel", "Cancel Test"));
      });

      // フェーズ変更
      act(() => {
        eventBus.publish(new ExecutionPhaseChangedEvent("run", "tac-cancel"));
      });

      // 移動と矢印
      act(() => {
        eventBus.publish(
          new PlayerMovementStartedEvent(0, { x: 0, z: 0 }, { x: 3, z: 3 }, 0),
        );
        eventBus.publish(
          new ArrowDisplayedEvent({ x: 0, z: 0 }, { x: 3, z: 3 }, "#000"),
        );
      });

      expect(result.current.isExecuting).toBe(true);

      // キャンセル
      act(() => {
        eventBus.publish(
          new TacticCancelledEvent("tac-cancel", "User cancelled"),
        );
      });

      expect(result.current.isExecuting).toBe(false);
      expect(result.current.activeTacticId).toBeNull();
      expect(result.current.executionPhase).toBeNull();
    });

    it("reset 後に playerPositions が formation の初期位置に戻る", () => {
      const formation = createTestFormation();
      const { result } = renderHook(() => useTacticExecution(formation));

      const initialPos0 = { ...result.current.playerPositions[0] };

      // 移動で位置変更
      act(() => {
        eventBus.publish(
          new PlayerMovementStartedEvent(0, initialPos0, { x: 99, z: 99 }, 0),
        );
      });
      expect(result.current.playerPositions[0]).toEqual({ x: 99, z: 99 });

      // reset
      act(() => {
        result.current.reset();
      });

      // 元の位置に復元
      expect(result.current.playerPositions[0]).toEqual(initialPos0);
    });
  });

  // ==========================================================================
  // クリーンアップ
  // ==========================================================================
  describe("クリーンアップ", () => {
    it("アンマウント後にイベントが発行されてもエラーにならない", () => {
      const { unmount } = renderHook(() => useTacticExecution(undefined));

      unmount();

      // アンマウント後にイベント発行 → エラーが出ないこと
      expect(() => {
        eventBus.publish(new TacticStartedEvent("tac-after", "After Unmount"));
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // COMPLETED vs CANCELLED の違い
  // ==========================================================================
  describe("COMPLETED と CANCELLED の挙動の違い", () => {
    it("COMPLETED: activeTacticId を保持する", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-x", "X"));
      });
      act(() => {
        eventBus.publish(new TacticCompletedEvent("tac-x", 1000));
      });

      expect(result.current.activeTacticId).toBe("tac-x");
      expect(result.current.isExecuting).toBe(false);
    });

    it("CANCELLED: activeTacticId を null にする", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-y", "Y"));
      });
      act(() => {
        eventBus.publish(new TacticCancelledEvent("tac-y", "Reason"));
      });

      expect(result.current.activeTacticId).toBeNull();
      expect(result.current.isExecuting).toBe(false);
    });
  });

  // ==========================================================================
  // 連続実行
  // ==========================================================================
  describe("連続実行", () => {
    it("新しい TACTIC_STARTED で前回の arrows と ballTrajectories がクリアされる", () => {
      const { result } = renderHook(() => useTacticExecution(undefined));

      // 最初の実行
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-a", "A"));
      });
      act(() => {
        eventBus.publish(
          new ArrowDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#f00"),
        );
      });
      act(() => {
        eventBus.publish(
          new BallPassDisplayedEvent({ x: 0, z: 0 }, { x: 2, z: 2 }, "#0f0"),
        );
      });
      expect(result.current.arrows).toHaveLength(1);
      expect(result.current.ballTrajectories).toHaveLength(1);

      // 2回目の実行 → クリアされる
      act(() => {
        eventBus.publish(new TacticStartedEvent("tac-b", "B"));
      });
      expect(result.current.arrows).toEqual([]);
      expect(result.current.ballTrajectories).toEqual([]);
      expect(result.current.activeTacticId).toBe("tac-b");
    });
  });

  // ==========================================================================
  // ステップ実行
  // ==========================================================================

  // ==========================================================================
  // destroy
  // ==========================================================================
  describe("destroy", () => {
    it("アンマウント時に destroy が呼ばれる", () => {
      const { unmount } = renderHook(() => useTacticExecution(undefined));
      unmount();
      expect(mockDestroy).toHaveBeenCalled();
    });
  });
});
