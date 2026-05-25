/**
 * @module usePlugins
 * @description プラグインデータのCRUD操作を提供するReact Queryフック群。
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { queryKeys } from "@shared/constants/queryKeys";
import type { Plugin } from "@domain/entities/Plugin";
import { PluginId } from "@domain/value-objects";

/** 全プラグインを取得する React Query フック */
export function usePlugins() {
  const { pluginInteractor } = getContainer();
  return useQuery({
    queryKey: queryKeys.plugins.all,
    queryFn: () => pluginInteractor.getAll(),
  });
}

/** プラグインレッスンのみを取得するフック */
export function usePluginLessons() {
  const query = usePlugins();
  return {
    ...query,
    data: query.data?.filter((p) => p.type === "lesson"),
  };
}

/** JSONからプラグインをインポートするミューテーションフック */
export function useImportPlugin() {
  const { pluginInteractor } = getContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (json: string) => pluginInteractor.importFromJson(json),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
    },
  });
}

/** プラグインを削除するミューテーションフック */
export function useDeletePlugin() {
  const { pluginInteractor } = getContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pluginInteractor.delete(new PluginId(id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plugins.all });
      const previous = queryClient.getQueryData<Plugin[]>(
        queryKeys.plugins.all,
      );
      queryClient.setQueryData<Plugin[]>(
        queryKeys.plugins.all,
        (old) => old?.filter((p) => p.id.value !== id) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plugins.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all });
    },
  });
}
