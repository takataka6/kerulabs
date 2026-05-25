/**
 * @module useTeams
 * @description 全チーム一覧を取得するReact Queryフック。
 */
import { useQuery } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { queryKeys } from "@shared/constants/queryKeys";

/**
 * 全チーム一覧を取得する React Query フック。
 *
 * @returns 全 {@link Team} エンティティを含む React Query の結果。
 */
export function useTeams() {
  const { teamInteractor } = getContainer();

  return useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: () => teamInteractor.getAll(),
  });
}
