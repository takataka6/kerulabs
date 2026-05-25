/**
 * @module playbackSpeedStore
 * @description 再生速度ストアの単体テスト
 *
 * テスト方針:
 * - getPlaybackSpeed / setPlaybackSpeed / subscribePlaybackSpeed の動作を検証
 * - リスナー通知・重複値スキップ・購読解除の動作を検証
 * - PLAYBACK_SPEED_OPTIONS 定数の内容を検証
 */
import { describe, it, expect, beforeEach } from "vitest";
import { vi } from "vitest";
import {
  getPlaybackSpeed,
  setPlaybackSpeed,
  subscribePlaybackSpeed,
  PLAYBACK_SPEED_OPTIONS,
} from "@shared/stores/playbackSpeedStore";

describe("playbackSpeedStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset speed to default
    setPlaybackSpeed(1);
  });

  // ── getPlaybackSpeed ──

  describe("getPlaybackSpeed", () => {
    it("デフォルトの再生速度 1 を返す", () => {
      expect(getPlaybackSpeed()).toBe(1);
    });
  });

  // ── setPlaybackSpeed ──

  describe("setPlaybackSpeed", () => {
    it("再生速度を変更する", () => {
      setPlaybackSpeed(0.5);
      expect(getPlaybackSpeed()).toBe(0.5);
    });

    it("速度変更時にリスナーを通知する", () => {
      const listener = vi.fn();
      subscribePlaybackSpeed(listener);

      setPlaybackSpeed(1.5);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("同じ値を設定した場合はリスナーを通知しない", () => {
      const listener = vi.fn();
      subscribePlaybackSpeed(listener);

      setPlaybackSpeed(1);

      expect(listener).not.toHaveBeenCalled();
    });

    it("複数のリスナーに通知する", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      subscribePlaybackSpeed(listener1);
      subscribePlaybackSpeed(listener2);

      setPlaybackSpeed(0.25);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  // ── subscribePlaybackSpeed ──

  describe("subscribePlaybackSpeed", () => {
    it("購読解除関数を返す", () => {
      const unsubscribe = subscribePlaybackSpeed(vi.fn());
      expect(typeof unsubscribe).toBe("function");
    });

    it("購読解除後はリスナーが通知されない", () => {
      const listener = vi.fn();
      const unsubscribe = subscribePlaybackSpeed(listener);

      unsubscribe();
      setPlaybackSpeed(0.5);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  // ── PLAYBACK_SPEED_OPTIONS ──

  describe("PLAYBACK_SPEED_OPTIONS", () => {
    it("[0.25, 0.5, 1, 1.5] を含む", () => {
      expect(PLAYBACK_SPEED_OPTIONS).toEqual([0.25, 0.5, 1, 1.5]);
    });
  });
});
