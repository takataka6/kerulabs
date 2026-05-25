/**
 * @module queryClient (TanStack Query 設定)
 * @description TanStack Query のグローバル設定の単体テスト
 *
 * テスト方針:
 * - handleError をvi.mockでスタブ化し、エラーハンドリングの結合を検証
 * - モジュールスコープの queryClient を動的importで取得（モック適用後）
 * - クエリ/ミューテーションのデフォルトオプション値を検証
 * - QueryCache/MutationCache の onError コールバックで handleError が呼ばれることを検証
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/*  Mock                                                               */
/* ------------------------------------------------------------------ */

const mockHandleError = vi.fn();
vi.mock("@shared/errors/handleError", () => ({
  handleError: (...args: unknown[]) => mockHandleError(...args),
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("queryClient (TanStack Query 設定)", () => {
  // モジュールスコープで export された queryClient を取得
  // handleError モックの後に動的 import する
  let queryClient: QueryClient;

  beforeAll(async () => {
    const mod = await import("@shared/config/tanstackQuery");
    queryClient = mod.queryClient;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queryClient が QueryClient のインスタンスである", () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it("クエリのデフォルトオプションが正しく設定されている", () => {
    const defaults = queryClient.getDefaultOptions();

    expect(defaults.queries?.staleTime).toBe(1000 * 60 * 5);
    expect(defaults.queries?.gcTime).toBe(1000 * 60 * 30);
    expect(defaults.queries?.retry).toBe(1);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
  });

  it("ミューテーションのデフォルトオプションが正しく設定されている", () => {
    const defaults = queryClient.getDefaultOptions();

    expect(defaults.mutations?.retry).toBe(0);
  });

  it("QueryCache の onError で handleError が呼ばれる", () => {
    const queryCache = queryClient.getQueryCache();
    const error = new Error("query failed");
    const mockQuery = {
      queryKey: ["teams"],
      queryHash: '["teams"]',
    };

    // QueryCache の config.onError を直接呼び出す
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheConfig = (queryCache as any).config;
    if (cacheConfig?.onError) {
      cacheConfig.onError(error, mockQuery);
    }

    expect(mockHandleError).toHaveBeenCalledWith(
      error,
      "database",
      "Query failed",
      { meta: { queryKey: ["teams"] } },
    );
  });

  it("MutationCache の onError で handleError が呼ばれる", () => {
    const mutationCache = queryClient.getMutationCache();
    const error = new Error("mutation failed");
    const mockMutation = {
      options: {
        mutationKey: ["saveTeam"],
      },
    };

    // MutationCache の config.onError を直接呼び出す
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheConfig = (mutationCache as any).config;
    if (cacheConfig?.onError) {
      cacheConfig.onError(error, undefined, undefined, mockMutation);
    }

    expect(mockHandleError).toHaveBeenCalledWith(
      error,
      "database",
      "Mutation failed",
      { meta: { mutationKey: ["saveTeam"] } },
    );
  });
});
