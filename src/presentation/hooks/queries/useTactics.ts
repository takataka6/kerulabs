/**
 * @module useTactics
 * @description 指定フェーズに紐づくタクティクス一覧を取得するReact Queryフック。
 */
import { useQuery } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { Phase } from "@domain/value-objects";
import { queryKeys } from "@shared/constants/queryKeys";

/**
 * 指定フェーズに紐づくタクティクス一覧を取得する React Query フック。
 *
 * @param phaseValue - フェーズ文字列（例: `"attack"`）。`null` の場合、クエリは無効化される。
 * @returns 指定フェーズの {@link Tactic} エンティティを含む React Query の結果。
 */
export function useTactics(phaseValue: string | null) {
  const { tacticInteractor } = getContainer();

  return useQuery({
    queryKey: queryKeys.tactics.byPhase(phaseValue || ""),
    queryFn: () => tacticInteractor.getByPhase(Phase.fromString(phaseValue!)),
    enabled: !!phaseValue,
  });
}
