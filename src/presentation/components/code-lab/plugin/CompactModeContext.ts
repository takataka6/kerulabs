/**
 * @module CompactModeContext
 * @description プレビュー用コンパクトモードのコンテキスト。DemoCanvasの高さを縮小する。
 */
import { createContext, useContext } from "react";

export const CompactModeContext = createContext(false);

export function useCompact() {
  return useContext(CompactModeContext);
}
