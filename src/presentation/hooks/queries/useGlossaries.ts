/**
 * @module useGlossaries
 * @description 用語集データのCRUD操作を提供するReact Queryフック群。取得・保存・削除のmutationを管理する。
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContainer } from "@application/ServiceContainer";
import { queryKeys } from "@shared/constants/queryKeys";
import type { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects";

/** 全用語集を取得する React Query フック */
export function useGlossaries() {
  const { glossaryInteractor } = getContainer();
  return useQuery({
    queryKey: queryKeys.glossaries.all,
    queryFn: () => glossaryInteractor.getAll(),
  });
}

/** 用語集を保存するミューテーションフック。成功時にキャッシュを直接更新する。 */
export function useSaveGlossary() {
  const { glossaryInteractor } = getContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (glossary: Glossary) => glossaryInteractor.save(glossary),
    onSuccess: (_data, glossary) => {
      queryClient.setQueryData<Glossary[]>(queryKeys.glossaries.all, (old) => {
        if (!old) return [glossary];
        const exists = old.some((g) => g.id.value === glossary.id.value);
        return exists
          ? old.map((g) => (g.id.value === glossary.id.value ? glossary : g))
          : [...old, glossary];
      });
    },
  });
}

/** 用語集を削除するミューテーションフック。Optimistic Updateで即時UI反映する。 */
export function useDeleteGlossary() {
  const { glossaryInteractor } = getContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => glossaryInteractor.delete(new GlossaryId(id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.glossaries.all });
      const previous = queryClient.getQueryData<Glossary[]>(
        queryKeys.glossaries.all,
      );
      queryClient.setQueryData<Glossary[]>(
        queryKeys.glossaries.all,
        (old) => old?.filter((g) => g.id.value !== id) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.glossaries.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.glossaries.all });
    },
  });
}
