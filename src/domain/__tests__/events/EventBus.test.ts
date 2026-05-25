/**
 * @module EventBus ドメインイベントバス
 * @description EventBus（Pub/Subイベントシステム）の単体テスト
 *
 * テスト方針:
 * - モック: イベントハンドラーをvi.fnでモック化
 * - シングルトンパターンの検証とテスト間の状態分離（beforeEachでclearAll）
 * - subscribe/publish のイベント配信・フィルタリング・購読解除
 * - イベント履歴の記録・取得・クリア・不変コピー保証
 * - ハンドラーエラー時の他ハンドラーへの影響隔離
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventBus } from "../../events/EventBus";
import {
  TacticStartedEvent,
  TacticCompletedEvent,
} from "../../events/TacticEvent";

describe("EventBus", () => {
  // シングルトンのため、各テスト前にクリア
  beforeEach(() => {
    EventBus.getInstance().clearAll();
  });

  describe("getInstance", () => {
    it("シングルトンインスタンスを返す", () => {
      const a = EventBus.getInstance();
      const b = EventBus.getInstance();
      expect(a).toBe(b);
    });
  });

  describe("subscribe / publish", () => {
    it("イベントを購読して受信できる", () => {
      const bus = EventBus.getInstance();
      const handler = vi.fn();
      bus.subscribe("TACTIC_STARTED", handler);

      const event = new TacticStartedEvent("tactic-1", "テスト");
      bus.publish(event);

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(event);
    });

    it("同じイベントタイプに複数のハンドラーを登録できる", () => {
      const bus = EventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.subscribe("TACTIC_STARTED", handler1);
      bus.subscribe("TACTIC_STARTED", handler2);

      bus.publish(new TacticStartedEvent("tactic-1", "テスト"));

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it("異なるイベントタイプのハンドラーは呼ばれない", () => {
      const bus = EventBus.getInstance();
      const handler = vi.fn();
      bus.subscribe("TACTIC_COMPLETED", handler);

      bus.publish(new TacticStartedEvent("tactic-1", "テスト"));

      expect(handler).not.toHaveBeenCalled();
    });

    it("購読解除後はハンドラーが呼ばれない", () => {
      const bus = EventBus.getInstance();
      const handler = vi.fn();
      const unsubscribe = bus.subscribe("TACTIC_STARTED", handler);

      unsubscribe();
      bus.publish(new TacticStartedEvent("tactic-1", "テスト"));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("getHistory", () => {
    it("発行されたイベントの履歴を取得できる", () => {
      const bus = EventBus.getInstance();
      bus.publish(new TacticStartedEvent("t-1", "A"));
      bus.publish(new TacticCompletedEvent("t-1", 1000));

      const history = bus.getHistory();
      expect(history).toHaveLength(2);
    });

    it("イベントタイプでフィルタできる", () => {
      const bus = EventBus.getInstance();
      bus.publish(new TacticStartedEvent("t-1", "A"));
      bus.publish(new TacticCompletedEvent("t-1", 1000));
      bus.publish(new TacticStartedEvent("t-2", "B"));

      const started = bus.getHistory("TACTIC_STARTED");
      expect(started).toHaveLength(2);

      const completed = bus.getHistory("TACTIC_COMPLETED");
      expect(completed).toHaveLength(1);
    });

    it("履歴は不変のコピーとして返される", () => {
      const bus = EventBus.getInstance();
      bus.publish(new TacticStartedEvent("t-1", "A"));

      const history = bus.getHistory();
      history.push(new TacticStartedEvent("fake", "fake"));

      expect(bus.getHistory()).toHaveLength(1); // 元の履歴は変わらない
    });
  });

  describe("clearHistory", () => {
    it("イベント履歴をクリアできる", () => {
      const bus = EventBus.getInstance();
      bus.publish(new TacticStartedEvent("t-1", "A"));
      bus.clearHistory();
      expect(bus.getHistory()).toHaveLength(0);
    });
  });

  describe("clearAll", () => {
    it("購読と履歴の両方をクリアする", () => {
      const bus = EventBus.getInstance();
      const handler = vi.fn();
      bus.subscribe("TACTIC_STARTED", handler);
      bus.publish(new TacticStartedEvent("t-1", "A"));

      expect(bus.getHistory()).toHaveLength(1);
      bus.clearAll();
      expect(bus.getHistory()).toHaveLength(0); // 履歴がクリアされた

      // clearAll後にpublishしてもハンドラーは呼ばれない
      bus.publish(new TacticStartedEvent("t-2", "B"));
      expect(handler).toHaveBeenCalledOnce(); // clearAll前の1回のみ

      // ただしpublishされたイベントは新たに履歴に記録される
      expect(bus.getHistory()).toHaveLength(1);
      expect(bus.getHistory()[0].type).toBe("TACTIC_STARTED");
    });
  });

  describe("エラーハンドリング", () => {
    it("ハンドラーでエラーが発生しても他のハンドラーは実行される", () => {
      const bus = EventBus.getInstance();
      const errorHandler = vi.fn(() => {
        throw new Error("Handler error");
      });
      const normalHandler = vi.fn();

      // console.errorを抑制
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      bus.subscribe("TACTIC_STARTED", errorHandler);
      bus.subscribe("TACTIC_STARTED", normalHandler);

      bus.publish(new TacticStartedEvent("t-1", "テスト"));

      expect(errorHandler).toHaveBeenCalledOnce();
      expect(normalHandler).toHaveBeenCalledOnce();

      consoleSpy.mockRestore();
    });
  });
});
