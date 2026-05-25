/**
 * @module TacticEvent ドメインイベント
 * @description 戦術実行に関するドメインイベントクラス群の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な値オブジェクト的イベントの生成のみ）
 * - 各イベントタイプ（開始・移動・矢印・パス・完了・キャンセル）の生成を検証
 * - 全イベントに共通するタイムスタンプの自動設定を一括検証
 */
import { describe, it, expect } from "vitest";
import {
  TacticStartedEvent,
  PlayerMovementStartedEvent,
  PlayerMovementCompletedEvent,
  ArrowDisplayedEvent,
  TacticCompletedEvent,
  BallPassDisplayedEvent,
  TacticCancelledEvent,
} from "../../events/TacticEvent";

describe("TacticEvent", () => {
  describe("TacticStartedEvent", () => {
    it("戦術開始イベントを作成できる", () => {
      const event = new TacticStartedEvent("tactic-1", "ポゼッション");
      expect(event.type).toBe("TACTIC_STARTED");
      expect(event.tacticId).toBe("tactic-1");
      expect(event.tacticName).toBe("ポゼッション");
      expect(event.timestamp).toBeGreaterThan(0);
    });
  });

  describe("PlayerMovementStartedEvent", () => {
    it("選手移動開始イベントを作成できる", () => {
      const event = new PlayerMovementStartedEvent(
        5,
        { x: 0, z: 0 },
        { x: 3, z: 4 },
        100,
      );
      expect(event.type).toBe("PLAYER_MOVEMENT_STARTED");
      expect(event.playerIndex).toBe(5);
      expect(event.startPosition).toEqual({ x: 0, z: 0 });
      expect(event.targetPosition).toEqual({ x: 3, z: 4 });
      expect(event.delay).toBe(100);
    });
  });

  describe("PlayerMovementCompletedEvent", () => {
    it("選手移動完了イベントを作成できる", () => {
      const event = new PlayerMovementCompletedEvent(3, { x: 5, z: 2 });
      expect(event.type).toBe("PLAYER_MOVEMENT_COMPLETED");
      expect(event.playerIndex).toBe(3);
      expect(event.position).toEqual({ x: 5, z: 2 });
    });
  });

  describe("ArrowDisplayedEvent", () => {
    it("矢印表示イベントを作成できる", () => {
      const event = new ArrowDisplayedEvent(
        { x: 0, z: 0 },
        { x: 5, z: 5 },
        "#ff0000",
      );
      expect(event.type).toBe("ARROW_DISPLAYED");
      expect(event.start).toEqual({ x: 0, z: 0 });
      expect(event.end).toEqual({ x: 5, z: 5 });
      expect(event.color).toBe("#ff0000");
    });
  });

  describe("TacticCompletedEvent", () => {
    it("戦術完了イベントを作成できる", () => {
      const event = new TacticCompletedEvent("tactic-1", 3000);
      expect(event.type).toBe("TACTIC_COMPLETED");
      expect(event.tacticId).toBe("tactic-1");
      expect(event.duration).toBe(3000);
    });
  });

  describe("BallPassDisplayedEvent", () => {
    it("ボールパス表示イベントを作成できる", () => {
      const event = new BallPassDisplayedEvent(
        { x: 1, z: 2 },
        { x: 5, z: 6 },
        "#facc15",
      );
      expect(event.type).toBe("BALL_PASS_DISPLAYED");
      expect(event.start).toEqual({ x: 1, z: 2 });
      expect(event.end).toEqual({ x: 5, z: 6 });
      expect(event.color).toBe("#facc15");
    });
  });

  describe("TacticCancelledEvent", () => {
    it("戦術キャンセルイベントを作成できる", () => {
      const event = new TacticCancelledEvent(
        "tactic-1",
        "ユーザーによるキャンセル",
      );
      expect(event.type).toBe("TACTIC_CANCELLED");
      expect(event.tacticId).toBe("tactic-1");
      expect(event.reason).toBe("ユーザーによるキャンセル");
    });
  });

  describe("タイムスタンプ", () => {
    it("全てのイベントにタイムスタンプが設定される", () => {
      const before = Date.now();
      const events = [
        new TacticStartedEvent("t", "n"),
        new PlayerMovementStartedEvent(0, { x: 0, z: 0 }, { x: 1, z: 1 }, 0),
        new PlayerMovementCompletedEvent(0, { x: 0, z: 0 }),
        new ArrowDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#000"),
        new TacticCompletedEvent("t", 0),
        new BallPassDisplayedEvent({ x: 0, z: 0 }, { x: 1, z: 1 }, "#000"),
        new TacticCancelledEvent("t", "r"),
      ];
      const after = Date.now();

      events.forEach((event) => {
        expect(event.timestamp).toBeGreaterThanOrEqual(before);
        expect(event.timestamp).toBeLessThanOrEqual(after);
      });
    });
  });
});
