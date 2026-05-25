/**
 * @module rafThrottle
 * @description requestAnimationFrame ベースのスロットルユーティリティ。
 * ポインター移動やドラッグなどの高頻度イベントを 1フレーム（≈16ms）に1回に抑制する。
 */

/**
 * コールバックを requestAnimationFrame でスロットルする。
 *
 * 同一フレーム内で複数回呼ばれた場合、最後の引数で1回だけ実行される。
 * 返却される関数には `cancel()` メソッドが付与され、
 * コンポーネントのアンマウント時にペンディング中の RAF をキャンセルできる。
 *
 * @example
 * ```ts
 * const throttled = rafThrottle((pos: { x: number; z: number }) => {
 *   setState(pos);
 * });
 * element.addEventListener("pointermove", (e) => throttled({ x: e.clientX, y: e.clientY }));
 * // cleanup
 * throttled.cancel();
 * ```
 */
export function rafThrottle<T extends (...args: never[]) => void>(
  fn: T,
): T & { cancel: () => void } {
  let rafId: number | null = null;
  let latestArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    latestArgs = args;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (latestArgs) {
        fn(...latestArgs);
        latestArgs = null;
      }
    });
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    latestArgs = null;
  };

  return throttled;
}
