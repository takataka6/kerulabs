/**
 * @module TacticsViewerContext
 *
 * タクティクスビューアーの Context 群をまとめて公開するためのバレル（Phase 2 簡素化版）。
 *
 * Phase 2 以降、TacticsViewerPage では 3 つの個別 Provider を直接ネストして使用しています。
 * このファイルは主にドキュメントと後方互換のためのものです。
 *
 * 新規コードでは以下を直接 import してください:
 *   - useTacticsUI / TacticsUIProvider  from "./TacticsUIContext"
 *   - useTacticsTeam / TacticsTeamProvider from "./TacticsTeamContext"
 *   - useTacticsExecution / TacticsExecutionProvider from "./TacticsExecutionContext"
 */

// Provider の再エクスポート（コンポーネントのみ）
export { TacticsUIProvider } from "./TacticsUIContext";
export { TacticsTeamProvider } from "./TacticsTeamContext";
export { TacticsExecutionProvider } from "./TacticsExecutionContext";

// 旧来の複合型（後方互換用・非推奨）
import type { TacticsUIContextType } from "./TacticsUIContext";
import type { TacticsTeamContextType } from "./TacticsTeamContext";
import type { TacticsExecutionContextType } from "./TacticsExecutionContext";

/** @deprecated 直接 3 つの Context を使用してください。 */
export type TacticsViewerContextType = TacticsUIContextType &
  TacticsTeamContextType &
  TacticsExecutionContextType;
