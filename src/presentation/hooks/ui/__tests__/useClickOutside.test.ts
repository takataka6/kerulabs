/**
 * @module useClickOutside フック
 * @description 要素外クリック検知フックの単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useClickOutside } from "../useClickOutside";

describe("useClickOutside", () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  it("ref 要素の外側クリックでコールバックが呼ばれる", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, callback));

    // 外側をクリック
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(element);
  });

  it("ref 要素の内側クリックではコールバックが呼ばれない", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, callback));

    // 内側をクリック
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it("ref.current が null のときコールバックが呼ばれない", () => {
    const ref = { current: null };

    renderHook(() => useClickOutside(ref, callback));

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).not.toHaveBeenCalled();
  });

  it("アンマウント後にイベントリスナーが解除される", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const ref = { current: element };

    const { unmount } = renderHook(() => useClickOutside(ref, callback));
    unmount();

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });
});
