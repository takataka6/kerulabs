/**
 * @module TacticsTeamContext
 * @description チーム・フォーメーション・表示データを提供するContext。
 * 変更頻度が低い（チーム/フォーメーション選択時のみ更新）ため、
 * UI状態や戦術実行状態と分離して不要な再レンダリングを防ぐ。
 */
import { createContext, useContext, type ReactNode } from "react";
import type { useFormationManagement } from "@presentation/hooks/field/useFormationManagement";
import type { useTeamManagement } from "@presentation/hooks/team/useTeamManagement";
import type { useCardManagement } from "@presentation/hooks/team/useCardManagement";
import type { useManagerEditor } from "@presentation/hooks/team/useManagerEditor";
import type { Team } from "@domain/entities/Team";
import type { Formation } from "@domain/entities/Formation";
import type {
  ColorsData,
  PlayerData,
} from "@presentation/components/tactics-viewer/types";
import type {
  LineupPlayer,
  LineupTeamInfo,
} from "@presentation/components/lineup-animation/types";

/** useDisplayData の戻り値型 */
export interface DisplayData {
  playersData: PlayerData[];
  colorsData: ColorsData;
  lineupPlayers: LineupPlayer[];
  lineupTeamInfo: LineupTeamInfo;
}

export interface TacticsTeamContextType {
  /** 選択中のチーム */
  selectedTeam: Team;
  /** 現在のフォーメーション */
  currentFormation: Formation;
  /** 全チーム一覧 */
  teams: Team[] | undefined;

  /** チーム管理 */
  teamMgmt: ReturnType<typeof useTeamManagement>;
  /** フォーメーション管理 */
  formationMgmt: ReturnType<typeof useFormationManagement>;
  /** 表示用データ */
  displayData: DisplayData;

  /** カード管理 */
  cardMgmt: ReturnType<typeof useCardManagement>;
  /** 監督編集 */
  managerEditor: ReturnType<typeof useManagerEditor>;

  /** スカッドカードサイクル */
  handleSquadCardCycle: (index: number) => void;
  /** 監督保存 */
  handleSaveManager: (name: string) => void;
  /** 監督カードサイクル */
  handleCycleManagerCard: () => void;
}

const TacticsTeamContext = createContext<TacticsTeamContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components -- フックは対応する Context と同じファイルに配置する
export function useTacticsTeam() {
  const context = useContext(TacticsTeamContext);
  if (!context) {
    throw new Error("useTacticsTeam must be used within TacticsTeamProvider");
  }
  return context;
}

interface TacticsTeamProviderProps {
  value: TacticsTeamContextType;
  children: ReactNode;
}

export function TacticsTeamProvider({
  value,
  children,
}: TacticsTeamProviderProps) {
  return (
    <TacticsTeamContext.Provider value={value}>
      {children}
    </TacticsTeamContext.Provider>
  );
}
