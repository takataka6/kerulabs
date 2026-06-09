/**
 * @module useSquadManagement
 * @description スカッド（出場選手リスト）と交代の管理フック。
 * スカッド更新の永続化と交代記録のセッション管理を提供する。
 */
import { useState, useCallback, useMemo } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { getContainer } from "@application/ServiceContainer";
import { queryKeys } from "@shared/constants/queryKeys";
import type { TranslationKey } from "@shared/i18n/translations";
import { handleError } from "@shared/errors";

export interface UseSquadManagementReturn {
  customSquad: (Player | null)[];
  setCustomSquad: React.Dispatch<React.SetStateAction<(Player | null)[]>>;
  substitutionRecords: { inPlayer: Player; outPlayer: Player }[];
  handleUpdateSquad: (players: (Player | null)[]) => Promise<void>;
  handleSubstitution: (subOriginalIndex: number, starterIndex: number) => void;
  handleSwapPositions: (fromIndex: number, toIndex: number) => void;
  resetSubstitutions: () => void;
}

/** チームからスカッドを復元する純粋関数 */
function resolveSquadFromTeam(team: Team): (Player | null)[] {
  if (team.selectedSquad && team.selectedSquad.length > 0) {
    return team.selectedSquad.map((playerId) => {
      if (!playerId) return null;
      return team.players.find((p) => p.id.value === playerId) || null;
    });
  }
  return [];
}

/** 既存のスカッド順を保ったまま、最新の Team.players 参照へ差し替える */
function remapSquadPlayers(
  squad: (Player | null)[],
  team: Team,
): (Player | null)[] {
  const playersById = new Map(
    team.players.map((player) => [player.id.value, player]),
  );
  return squad.map((player) =>
    player ? (playersById.get(player.id.value) ?? null) : null,
  );
}

/**
 * スカッドと交代を管理する。
 *
 * チーム選択時にスカッドを同期し、
 * 交代操作をセッションレベルで追跡する。
 *
 * @param params.selectedTeam - 現在選択中のチーム
 * @param params.queryClient - キャッシュ無効化用のTanStack Queryクライアント
 * @param params.showToast - トースト通知コールバック
 * @param params.t - i18n翻訳関数
 */
export function useSquadManagement(params: {
  selectedTeam: Team | undefined;
  queryClient: QueryClient;
  showToast: (msg: string, type: "success" | "error") => void;
  t: (key: TranslationKey) => string;
}): UseSquadManagementReturn {
  const { selectedTeam, queryClient, showToast, t } = params;

  // ── チーム変更時のスカッド同期 ──
  // チームID変更時はローカルステートをリセットし、
  // 同一チーム内の更新時は既存スカッド順を維持して最新参照へ差し替える
  const teamKey = selectedTeam?.id.value ?? "";
  const initialSquad = useMemo(
    () => (selectedTeam ? resolveSquadFromTeam(selectedTeam) : []),
    [selectedTeam],
  );

  const [customSquad, setCustomSquad] = useState<(Player | null)[]>([]);
  const [substitutionRecords, setSubstitutionRecords] = useState<
    { inPlayer: Player; outPlayer: Player }[]
  >([]);
  const [appliedTeamKey, setAppliedTeamKey] = useState("");
  const [appliedTeam, setAppliedTeam] = useState<Team | undefined>(undefined);

  // チーム変更を検出してステートをリセット（レンダー中の同期パターン）
  if (teamKey !== appliedTeamKey) {
    setAppliedTeamKey(teamKey);
    setAppliedTeam(selectedTeam);
    setCustomSquad(initialSquad);
    setSubstitutionRecords([]);
  } else if (selectedTeam && selectedTeam !== appliedTeam) {
    setAppliedTeam(selectedTeam);
    setCustomSquad((prev) =>
      prev.length > 0 ? remapSquadPlayers(prev, selectedTeam) : initialSquad,
    );
  }

  const handleUpdateSquad = useCallback(
    async (players: (Player | null)[]) => {
      setCustomSquad(players);
      if (selectedTeam) {
        try {
          const playerIds = players.map((p) => (p ? p.id.value : ""));
          selectedTeam.updateSelectedSquad(playerIds);
          const { teamInteractor } = getContainer();
          await teamInteractor.save(selectedTeam);
          await queryClient.invalidateQueries({
            queryKey: queryKeys.teams.all,
          });
        } catch (error) {
          handleError(error, "database", "Failed to update squad", {
            toast: { show: showToast, message: t("team.squadUpdateFailed") },
          });
        }
      }
    },
    [selectedTeam, queryClient, showToast, t],
  );

  const handleSubstitution = useCallback(
    (subOriginalIndex: number, starterIndex: number) => {
      const starterPlayer = customSquad[starterIndex];
      const subPlayer = customSquad[subOriginalIndex];
      if (!starterPlayer || !subPlayer) return;

      setSubstitutionRecords((prev) => [
        ...prev,
        { inPlayer: subPlayer, outPlayer: starterPlayer },
      ]);
      setCustomSquad((prev) => {
        const next = [...prev];
        next[starterIndex] = subPlayer;
        next[subOriginalIndex] = null;
        return next;
      });
    },
    [customSquad],
  );

  const handleSwapPositions = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      setCustomSquad((prev) => {
        const next = [...prev];
        [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
        return next;
      });
    },
    [],
  );

  const resetSubstitutions = useCallback(() => {
    if (selectedTeam?.selectedSquad) {
      const restored: (Player | null)[] = selectedTeam.selectedSquad.map(
        (pid) =>
          pid
            ? selectedTeam.players.find((p) => p.id.value === pid) || null
            : null,
      );
      setCustomSquad(restored);
    }
    setSubstitutionRecords([]);
  }, [selectedTeam]);

  return {
    customSquad,
    setCustomSquad,
    substitutionRecords,
    handleUpdateSquad,
    handleSubstitution,
    handleSwapPositions,
    resetSubstitutions,
  };
}
