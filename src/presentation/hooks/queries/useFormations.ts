/**
 * @module useFormations
 * @description 全フォーメーション一覧を取得するReact Queryフック。
 */
import { useQuery } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { queryKeys } from "@shared/constants/queryKeys";

/**
 * 全フォーメーション一覧を取得する React Query フック。
 *
 * @returns 全 {@link Formation} エンティティを含む React Query の結果。
 */
export function useFormations() {
  const { formationInteractor } = getContainer();

  return useQuery({
    queryKey: queryKeys.formations.all,
    queryFn: () => formationInteractor.getAll(),
  });
}
