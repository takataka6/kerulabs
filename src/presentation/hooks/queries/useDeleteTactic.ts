/**
 * @module useDeleteTactic
 * @description タクティクスを削除するReact Queryミューテーションフック。成功時にキャッシュを自動無効化する。
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import type { Tactic } from "@domain/entities/Tactic";
import { queryKeys } from "@shared/constants/queryKeys";
import { handleError } from "@shared/errors/handleError";
import { TacticId } from "@domain/value-objects";

/**
 * タクティクスを削除する React Query ミューテーションフック。Optimistic Updateで即時UI反映する。
 *
 * @returns `mutate` がタクティクスIDの文字列を受け取るミューテーション。
 */
export function useDeleteTactic() {
  const queryClient = useQueryClient();
  const { tacticInteractor } = getContainer();

  return useMutation({
    mutationFn: (tacticId: string) =>
      tacticInteractor.delete(new TacticId(tacticId)),
    onMutate: async (tacticId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tactics.all });
      const previous = queryClient.getQueryData<Tactic[]>(
        queryKeys.tactics.all,
      );
      queryClient.setQueryData<Tactic[]>(
        queryKeys.tactics.all,
        (old) => old?.filter((t) => t.id.value !== tacticId) ?? [],
      );
      return { previous };
    },
    onError: (error, tacticId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tactics.all, context.previous);
      }
      handleError(error, "database", "Failed to delete tactic", {
        meta: { tacticId },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tactics.all });
    },
  });
}
