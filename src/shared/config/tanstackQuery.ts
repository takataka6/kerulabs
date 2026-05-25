/**
 * @module tanstackQuery
 * @description TanStack React Queryのグローバル設定。QueryClientのキャッシュ戦略、エラーハンドリング、リトライポリシーを定義する。
 */
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { handleError } from "@shared/errors/handleError";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleError(error, "database", "Query failed", {
        meta: { queryKey: query.queryKey },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      handleError(error, "database", "Mutation failed", {
        meta: { mutationKey: mutation.options.mutationKey },
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 30, // 30分（旧 cacheTime）
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
