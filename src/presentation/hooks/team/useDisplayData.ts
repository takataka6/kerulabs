/**
 * @module useDisplayData
 * @description 表示用データ（チームカラー・選手データ・ラインナップ情報）をuseMemoで算出するフック。
 */
import { useMemo } from "react";
import type { Team } from "@domain/entities/Team";
import type { Formation } from "@domain/entities/Formation";
import type { Player } from "@domain/entities/Player";
import type {
  ColorsData,
  PlayerData,
  FormationDataItem,
} from "@presentation/components/tactics-viewer";
import type {
  LineupPlayer,
  LineupTeamInfo,
} from "@presentation/components/lineup-animation";

/**
 * 表示用データ（チームカラー、選手データ、ラインナップ情報）を算出するフック。
 *
 * 各 useMemo は入力パラメータからの純粋な変換。
 *
 * @param params.selectedTeam - 現在選択中のチーム（カラーと選手データを提供）。
 * @param params.currentFormation - アクティブなフォーメーション（ポジション枠を定義）。
 * @param params.customSquad - 現在のスカッドの選手/null配列（順序付き）。
 * @param params.showSquadBuilder - `true` の場合、選手名の代わりにポジションラベルを表示する。
 * @param params.formationData - スロットごとのポジションメタデータ（カテゴリ、座標）。
 * @param params.managerInput - ラインナップ表示用の監督名文字列。
 * @returns `colorsData`、`playersData`、`lineupPlayers`、`lineupTeamInfo` のメモ化値。
 */
export function useDisplayData(params: {
  selectedTeam: Team | undefined;
  currentFormation: Formation | undefined;
  customSquad: (Player | null)[];
  showSquadBuilder: boolean;
  formationData: FormationDataItem[];
  managerInput: string;
}) {
  const {
    selectedTeam,
    currentFormation,
    customSquad,
    showSquadBuilder,
    formationData,
    managerInput,
  } = params;

  const colorsData: ColorsData = useMemo(() => {
    if (!selectedTeam)
      return { gk: "#000000", df: "#000000", mf: "#000000", fw: "#000000" };
    const teamColor = selectedTeam.colors.main.toHex();
    return {
      gk: selectedTeam.colors.gk.toHex(),
      df: teamColor,
      mf: teamColor,
      fw: teamColor,
    };
  }, [selectedTeam]);

  const playersData: PlayerData[] = useMemo(() => {
    if (!currentFormation) return [];
    return currentFormation.positions.map((position, i) => {
      const player = customSquad[i];
      const displayName = showSquadBuilder
        ? position.pos
        : player?.name || `Player ${i + 1}`;
      return {
        name: displayName,
        number: player?.number || i + 1,
        imageUrl: player?.imageUrl,
        mainVisualImageUrl: player?.mainVisualImageUrl,
      };
    });
  }, [currentFormation, customSquad, showSquadBuilder]);

  const lineupPlayers: LineupPlayer[] = useMemo(() => {
    return playersData.map((player, i) => ({
      ...player,
      category: formationData[i]?.cat ?? "mf",
      positionLabel: formationData[i]?.pos?.toUpperCase() ?? "",
    }));
  }, [playersData, formationData]);

  const lineupTeamInfo: LineupTeamInfo = useMemo(
    () => ({
      teamName: selectedTeam?.name || "",
      formationName: currentFormation?.name || "",
      colors: colorsData,
      manager: managerInput || undefined,
    }),
    [selectedTeam, currentFormation, colorsData, managerInput],
  );

  return {
    colorsData,
    playersData,
    lineupPlayers,
    lineupTeamInfo,
  };
}
