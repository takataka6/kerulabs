/**
 * @module rafThrottle
 * @description rafThrottle ユーティリティの単体テスト
 *
 * テスト方針:
 * - requestAnimationFrame をvi.stubGlobalでスタブ化
 * - スロットル動作（同一フレーム内の呼び出し集約）を検証
 * - キャンセル機能を検証
 * - 最新の引数が使われることを検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rafThrottle } from "../rafThrottle";

describe("rafThrottle", () => {
  let rafCallbacks: Array<() => void>;
  let nextRafId: number;

  beforeEach(() => {
    rafCallbacks = [];
    nextRafId = 1;

    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      rafCallbacks.push(cb);
      return nextRafId++;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      // フレーム実行前のキャンセルをシミュレート
      rafCallbacks = rafCallbacks.filter((_, i) => i + 1 !== id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb());
  }

  it("コールバックを RAF でスロットルする", () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled();
    expect(fn).not.toHaveBeenCalled();

    flushRaf();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("同一フレーム内の複数呼び出しを最後の引数で1回にまとめる", () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled(1);
    throttled(2);
    throttled(3);

    expect(fn).not.toHaveBeenCalled();

    flushRaf();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it("フレームをまたぐと再度実行される", () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled("a");
    flushRaf();
    expect(fn).toHaveBeenCalledWith("a");

    throttled("b");
    flushRaf();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("b");
  });

  it("cancel() でペンディング中の RAF をキャンセルできる", () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled("x");
    throttled.cancel();

    flushRaf();
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel() 後も再利用できる", () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled("x");
    throttled.cancel();
    flushRaf();
    expect(fn).not.toHaveBeenCalled();

    throttled("y");
    flushRaf();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("y");
  });
});
