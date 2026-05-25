/**
 * @module TacticsUIContext
 * @description UI表示状態（モーダル・サイドバー・カメラ等）を提供するContext。
 * 変更頻度が高い（UIインタラクションごとに更新される）ため、
 * チーム/戦術データと分離して不要な再レンダリングを防ぐ。
 */
import { createContext, useContext, type ReactNode } from "react";
import type { useUIVisibility } from "@presentation/hooks/ui/useUIVisibility";

export interface TacticsUIContextType {
  /** UI表示状態（モーダル・サイドバー・カメラ等） */
  ui: ReturnType<typeof useUIVisibility>;

  /** Undo/Redo */
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
}

const TacticsUIContext = createContext<TacticsUIContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components -- フックは対応する Context と同じファイルに配置する
export function useTacticsUI() {
  const context = useContext(TacticsUIContext);
  if (!context) {
    throw new Error("useTacticsUI must be used within TacticsUIProvider");
  }
  return context;
}

interface TacticsUIProviderProps {
  value: TacticsUIContextType;
  children: ReactNode;
}

export function TacticsUIProvider({ value, children }: TacticsUIProviderProps) {
  return (
    <TacticsUIContext.Provider value={value}>
      {children}
    </TacticsUIContext.Provider>
  );
}
