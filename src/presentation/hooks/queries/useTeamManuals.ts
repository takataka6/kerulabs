/**
 * @module useTeamManuals
 * @description チームマニュアルデータのCRUD操作を提供するReact Queryフック群。取得・保存・削除のmutationを管理する。
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { queryKeys } from "@shared/constants/queryKeys";
import type { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects";

/** 全チームマニュアルを取得する React Query フック */
export function useTeamManuals() {
  const { teamManualInteractor } = getContainer();
  return useQuery({
    queryKey: queryKeys.teamManuals.all,
    queryFn: () => teamManualInteractor.getAll(),
  });
}

/** チームマニュアルを保存するミューテーションフック。成功時にキャッシュを直接更新する。 */
export function useSaveTeamManual() {
  const { teamManualInteractor } = getContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manual: TeamManual) => teamManualInteractor.save(manual),
    onSuccess: (_data, manual) => {
      queryClient.setQueryData<TeamManual[]>(
        queryKeys.teamManuals.all,
        (old) => {
          if (!old) return [manual];
          const exists = old.some((m) => m.id.value === manual.id.value);
          return exists
            ? old.map((m) => (m.id.value === manual.id.value ? manual : m))
            : [...old, manual];
        },
      );
    },
  });
}

/** チームマニュアルを削除するミューテーションフック。Optimistic Updateで即時UI反映する。 */
export function useDeleteTeamManual() {
  const { teamManualInteractor } = getContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      teamManualInteractor.delete(new TeamManualId(id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.teamManuals.all,
      });
      const previous = queryClient.getQueryData<TeamManual[]>(
        queryKeys.teamManuals.all,
      );
      queryClient.setQueryData<TeamManual[]>(
        queryKeys.teamManuals.all,
        (old) => old?.filter((m) => m.id.value !== id) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.teamManuals.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teamManuals.all,
      });
    },
  });
}
