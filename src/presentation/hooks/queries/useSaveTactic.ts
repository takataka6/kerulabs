/**
 * @module useSaveTactic
 * @description タクティクスを保存するReact Queryミューテーションフック。成功時にキャッシュを自動無効化する。
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { Tactic } from "@domain/entities/Tactic";
import { queryKeys } from "@shared/constants/queryKeys";
import { handleError } from "@shared/errors/handleError";

/**
 * タクティクスを保存する React Query ミューテーションフック。成功時にキャッシュを無効化する。
 *
 * @returns `mutate` が {@link Tactic} エンティティを受け取るミューテーション。成功時にタクティクスキャッシュを無効化する。
 */
export function useSaveTactic() {
  const queryClient = useQueryClient();
  const { tacticInteractor } = getContainer();

  return useMutation({
    mutationFn: (tactic: Tactic) => tacticInteractor.save(tactic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tactics.all });
    },
    onError: (error, tactic) => {
      handleError(error, "database", "Failed to save tactic", {
        meta: { tacticId: tactic.id.value, tacticName: tactic.name },
      });
    },
  });
}
