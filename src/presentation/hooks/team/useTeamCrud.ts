/**
 * @module useTeamCrud
 * @description チームのCRUD操作（作成・更新・削除・一括インポート）を管理するフック。
 */
import { useCallback } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects";
import { getContainer } from "@application/ServiceContainer";
import { teamImportDataSchema } from "@application/schemas";
import { queryKeys } from "@shared/constants/queryKeys";
import { DEFAULT_TEAM_MAIN_COLOR } from "@shared/constants";
import type { TranslationKey } from "@shared/i18n/translations";
import { handleError } from "@shared/errors";
import { getLogger } from "@shared/logger";
import { z } from "zod";
import { useConfirm } from "@presentation/components/ui";

export interface UseTeamCrudReturn {
  handleCreateTeam: (newTeam: Team) => Promise<void>;
  handleUpdateTeam: (updatedTeam: Team) => Promise<void>;
  handleDeleteTeam: (
    teamId: string,
    teamName: string,
    event: React.MouseEvent,
  ) => Promise<void>;
  handleBulkTeamImport: (jsonData: string) => Promise<void>;
}

/**
 * チームのCRUD操作を管理する。
 *
 * 作成・更新・削除・一括インポートの非同期ハンドラーを提供し、
 * TanStack Queryのキャッシュ無効化と連携する。
 *
 * @param params.queryClient - キャッシュ無効化用のTanStack Queryクライアント
 * @param params.selectedTeamId - 現在選択中のチームID
 * @param params.showToast - トースト通知コールバック
 * @param params.t - i18n翻訳関数
 * @param params.onTeamCreated - チーム作成成功時のコールバック
 * @param params.onTeamDeleted - チーム削除成功時のコールバック
 * @param params.onBulkImportComplete - 一括インポート完了時のコールバック
 */
export function useTeamCrud(params: {
  queryClient: QueryClient;
  selectedTeamId: string | null;
  showToast: (msg: string, type: "success" | "error") => void;
  t: (key: TranslationKey) => string;
  onTeamCreated: (teamId: string) => void;
  onTeamDeleted: (teamId: string) => void;
  onBulkImportComplete: () => void;
}): UseTeamCrudReturn {
  const {
    queryClient,
    selectedTeamId,
    showToast,
    t,
    onTeamCreated,
    onTeamDeleted,
    onBulkImportComplete,
  } = params;

  const { confirm } = useConfirm();

  const handleUpdateTeam = useCallback(
    async (updatedTeam: Team) => {
      try {
        const { teamInteractor } = getContainer();
        await teamInteractor.save(updatedTeam);
        await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      } catch (error) {
        handleError(error, "database", "Failed to update team", {
          toast: { show: showToast, message: t("team.updateFailed") },
        });
      }
    },
    [queryClient, showToast, t],
  );

  const handleCreateTeam = useCallback(
    async (newTeam: Team) => {
      try {
        const { teamInteractor } = getContainer();
        await teamInteractor.save(newTeam);
        await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
        await queryClient.refetchQueries({ queryKey: queryKeys.teams.all });
        const cachedTeams = queryClient.getQueryData(queryKeys.teams.all);
        if (!cachedTeams) {
          throw new Error("Team cache not updated after refetch");
        }
        onTeamCreated(newTeam.id.value);
      } catch (error) {
        handleError(error, "database", "Failed to create team", {
          toast: { show: showToast, message: t("team.createFailed") },
        });
      }
    },
    [queryClient, showToast, t, onTeamCreated],
  );

  const handleDeleteTeam = useCallback(
    async (teamId: string, teamName: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (
        !(await confirm({
          message: t("team.deleteConfirm").replace("{name}", teamName),
          variant: "red",
        }))
      ) {
        return;
      }
      try {
        const { teamInteractor } = getContainer();
        await teamInteractor.delete(new TeamId(teamId));
        if (selectedTeamId === teamId) {
          onTeamDeleted(teamId);
        }
        await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      } catch (error) {
        handleError(error, "database", "Failed to delete team", {
          toast: { show: showToast, message: t("team.deleteFailed") },
        });
      }
    },
    [queryClient, selectedTeamId, showToast, t, confirm, onTeamDeleted],
  );

  const handleBulkTeamImport = useCallback(
    async (jsonData: string) => {
      try {
        const raw = JSON.parse(jsonData);
        const dataArray = z
          .array(teamImportDataSchema)
          .parse(Array.isArray(raw) ? raw : [raw]);

        if (dataArray.length === 0) {
          showToast(t("team.import.noTeams"), "error");
          return;
        }

        const confirmMessage = t("team.import.confirm").replace(
          "{count}",
          String(dataArray.length),
        );
        if (!(await confirm({ message: confirmMessage }))) {
          return;
        }

        const { teamInteractor } = getContainer();

        for (let i = 0; i < dataArray.length; i++) {
          const teamData = dataArray[i];

          try {
            const importColors = {
              gk: teamData.colors.gk,
              main: teamData.colors.main || DEFAULT_TEAM_MAIN_COLOR,
            };

            const team = Team.create({
              name: teamData.name.trim(),
              subtitle: teamData.subtitle,
              colors: importColors,
              availableFormations: teamData.availableFormations,
              flagType: teamData.flagType,
              headerGradient: teamData.headerGradient,
              country: teamData.country,
              defaultFormation: teamData.defaultFormation,
              manager: teamData.manager,
            });

            if (teamData.players) {
              for (const playerData of teamData.players) {
                const player = Player.create({
                  name: playerData.name,
                  number: playerData.number,
                  teamId: team.id,
                  position: playerData.position,
                  nationality: playerData.nationality,
                  club: playerData.club,
                  leagueCountry: playerData.leagueCountry,
                  note: playerData.note,
                  status: playerData.status,
                });
                team.addPlayer(player);
              }
            }

            getLogger().info("database", "Saving team", {
              teamName: team.name,
            });
            await teamInteractor.save(team);
            getLogger().info("database", "Team saved", { teamName: team.name });
          } catch (err) {
            handleError(
              err,
              "database",
              `Team import failed at index ${i + 1}`,
            );
            throw new Error(
              err instanceof Error
                ? err.message
                : t("team.import.teamFailed").replace("{index}", String(i + 1)),
              { cause: err },
            );
          }
        }

        getLogger().info("database", "Reloading team data");
        await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
        await queryClient.refetchQueries({ queryKey: queryKeys.teams.all });

        getLogger().info("database", "Bulk team import completed", {
          count: dataArray.length,
        });
        onBulkImportComplete();
        showToast(
          t("team.import.success").replace("{count}", String(dataArray.length)),
          "success",
        );
      } catch (error) {
        handleError(error, "database", "Bulk team import failed", {
          toast: { show: showToast, message: t("team.import.failed") },
        });
      }
    },
    [queryClient, showToast, t, confirm, onBulkImportComplete],
  );

  return {
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
    handleBulkTeamImport,
  };
}
