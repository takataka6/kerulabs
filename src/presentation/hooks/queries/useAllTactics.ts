/**
 * @module useAllTactics
 * @description 全タクティクス一覧をフェーズ横断で取得するReact Queryフック。
 */
import { useQuery } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { queryKeys } from "@shared/constants/queryKeys";

/**
 * 全タクティクス一覧を取得する React Query フック（フェーズ横断）。
 *
 * @returns 全フェーズの {@link Tactic} エンティティを含む React Query の結果。
 */
export function useAllTactics() {
  const { tacticInteractor } = getContainer();

  return useQuery({
    queryKey: queryKeys.tactics.all,
    queryFn: () => tacticInteractor.getAll(),
  });
}
