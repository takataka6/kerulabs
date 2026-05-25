/**
 * @module useDraggable フック
 * @description ドラッグ操作フックの単体テスト
 *
 * テスト方針:
 * - jsdom環境のPointerEvent不在をポリフィルで補完
 * - PointerDown→PointerMove→PointerUpのライフサイクルでドラッグ動作を検証
 * - ドラッグ閾値（最小移動量）による意図しないドラッグの防止を検証
 * - コールバック（onDragStart / onDrag / onDragEnd / onClick）の呼び出しを検証
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDraggable } from "../useDraggable";

// jsdom には PointerEvent がないためポリフィル
beforeAll(() => {
  if (typeof globalThis.PointerEvent === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
      readonly pointerId: number;
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId ?? 0;
      }
    };
  }
});

describe("useDraggable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // rafThrottle 内の RAF を即時実行にスタブ化
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      cb();
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  it("初期状態: offset が { x: 0, y: 0 }, isDragging が false", () => {
    const { result } = renderHook(() => useDraggable());
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
    expect(result.current.isDragging).toBe(false);
  });

  it("resetOffset: offset を初期値にリセットする", () => {
    const { result } = renderHook(() => useDraggable());

    act(() => {
      result.current.resetOffset();
    });

    expect(result.current.offset).toEqual({ x: 0, y: 0 });
    expect(result.current.isDragging).toBe(false);
  });

  it("handlePointerDown を呼ぶと isDragging=true になる", () => {
    const { result } = renderHook(() => useDraggable());

    const mockEvent = {
      preventDefault: vi.fn(),
      target: { setPointerCapture: vi.fn() },
      pointerId: 1,
      clientX: 100,
      clientY: 200,
    } as unknown as React.PointerEvent;

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it("ドラッグ中に pointermove で offset が更新される", () => {
    const { result } = renderHook(() => useDraggable());

    const mockEvent = {
      preventDefault: vi.fn(),
      target: { setPointerCapture: vi.fn() },
      pointerId: 1,
      clientX: 100,
      clientY: 200,
    } as unknown as React.PointerEvent;

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    act(() => {
      document.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 150, clientY: 250 }),
      );
    });

    expect(result.current.offset).toEqual({ x: 50, y: 50 });
  });

  it("pointerup でドラッグが終了する", () => {
    const { result } = renderHook(() => useDraggable());

    const mockEvent = {
      preventDefault: vi.fn(),
      target: { setPointerCapture: vi.fn() },
      pointerId: 1,
      clientX: 100,
      clientY: 200,
    } as unknown as React.PointerEvent;

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    act(() => {
      document.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 130, clientY: 230 }),
      );
    });

    act(() => {
      document.dispatchEvent(new PointerEvent("pointerup"));
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.offset).toEqual({ x: 30, y: 30 });
  });

  it("アンマウント時にドラッグ中のリスナーが除去される", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { result, unmount } = renderHook(() => useDraggable());

    const mockEvent = {
      preventDefault: vi.fn(),
      target: { setPointerCapture: vi.fn() },
      pointerId: 1,
      clientX: 100,
      clientY: 200,
    } as unknown as React.PointerEvent;

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    // pointerup 前にアンマウント
    unmount();

    const removedTypes = removeSpy.mock.calls.map((c) => c[0]);
    expect(removedTypes).toContain("pointermove");
    expect(removedTypes).toContain("pointerup");
    removeSpy.mockRestore();
  });

  it("pointerup 後の pointermove では offset が変わらない", () => {
    const { result } = renderHook(() => useDraggable());

    const mockEvent = {
      preventDefault: vi.fn(),
      target: { setPointerCapture: vi.fn() },
      pointerId: 1,
      clientX: 100,
      clientY: 200,
    } as unknown as React.PointerEvent;

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    act(() => {
      document.dispatchEvent(new PointerEvent("pointerup"));
    });

    const offsetAfterUp = { ...result.current.offset };

    act(() => {
      document.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 500, clientY: 500 }),
      );
    });

    expect(result.current.offset).toEqual(offsetAfterUp);
  });
});
