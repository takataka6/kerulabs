/**
 * @module queryHooks（TanStack Queryラッパー）
 * @description データフェッチ用カスタムフック群の単体テスト
 *
 * テスト方針:
 * - ServiceContainer をvi.mockでスタブ化し、各Interactorの呼び出しを検証
 * - QueryClientProviderでラップしたrenderHookで各フックの動作を検証
 * - useQuery系: データ取得成功時の戻り値を検証
 * - useMutation系: save/delete操作の実行とキャッシュ無効化を検証
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  useGlossaries,
  useSaveGlossary,
  useDeleteGlossary,
  useTeams,
  useFormations,
  useTactics,
  useAllTactics,
  useSaveTactic,
  useDeleteTactic,
} from "../index";

// --- Mocks ---

const mockGlossaryInteractor = {
  getAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};
const mockTeamInteractor = { getAll: vi.fn() };
const mockFormationInteractor = { getAll: vi.fn() };
const mockTacticInteractor = {
  getAll: vi.fn(),
  getByPhase: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    glossaryInteractor: mockGlossaryInteractor,
    teamInteractor: mockTeamInteractor,
    formationInteractor: mockFormationInteractor,
    tacticInteractor: mockTacticInteractor,
  }),
}));

vi.mock("@shared/errors/handleError", () => ({ handleError: vi.fn() }));

vi.mock("@domain/value-objects", () => ({
  Phase: { fromString: (s: string) => s },
  TacticId: class TacticId {
    constructor(public readonly value: string) {}
    equals(other: { value: string }) {
      return this.value === other.value;
    }
    toString() {
      return this.value;
    }
  },
  GlossaryId: class GlossaryId {
    constructor(public readonly value: string) {}
    equals(other: { value: string }) {
      return this.value === other.value;
    }
    toString() {
      return this.value;
    }
  },
}));

// --- Helper ---

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useGlossaries", () => {
  it("データを取得できる", async () => {
    const data = [{ id: "1", term: "オフサイド" }];
    mockGlossaryInteractor.getAll.mockResolvedValue(data);

    const { result } = renderHook(() => useGlossaries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockGlossaryInteractor.getAll).toHaveBeenCalledOnce();
  });
});

describe("useTeams", () => {
  it("データを取得できる", async () => {
    const data = [{ id: "t1", name: "Team A" }];
    mockTeamInteractor.getAll.mockResolvedValue(data);

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockTeamInteractor.getAll).toHaveBeenCalledOnce();
  });
});

describe("useFormations", () => {
  it("データを取得できる", async () => {
    const data = [{ id: "f1", name: "4-4-2" }];
    mockFormationInteractor.getAll.mockResolvedValue(data);

    const { result } = renderHook(() => useFormations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFormationInteractor.getAll).toHaveBeenCalledOnce();
  });
});

describe("useTactics", () => {
  it("phaseValue が null の場合、クエリが無効化される", () => {
    const { result } = renderHook(() => useTactics(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockTacticInteractor.getByPhase).not.toHaveBeenCalled();
  });

  it("phaseValue がある場合、データを取得できる", async () => {
    const data = [{ id: "tac1", name: "Press" }];
    mockTacticInteractor.getByPhase.mockResolvedValue(data);

    const { result } = renderHook(() => useTactics("attack"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockTacticInteractor.getByPhase).toHaveBeenCalledWith("attack");
  });
});

describe("useAllTactics", () => {
  it("データを取得できる", async () => {
    const data = [{ id: "tac1" }, { id: "tac2" }];
    mockTacticInteractor.getAll.mockResolvedValue(data);

    const { result } = renderHook(() => useAllTactics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockTacticInteractor.getAll).toHaveBeenCalledOnce();
  });
});

describe("useSaveGlossary", () => {
  it("保存を実行できる", async () => {
    const glossary = { id: "1", term: "オフサイド", description: "..." };
    mockGlossaryInteractor.save.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSaveGlossary(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutateAsync).toBeDefined();
    await result.current.mutateAsync(glossary as never);
    expect(mockGlossaryInteractor.save).toHaveBeenCalledWith(glossary);
  });
});

describe("useDeleteGlossary", () => {
  it("削除を実行できる", async () => {
    mockGlossaryInteractor.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteGlossary(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutateAsync).toBeDefined();
    await result.current.mutateAsync("1");
    expect(mockGlossaryInteractor.delete).toHaveBeenCalledWith(
      expect.objectContaining({ value: "1" }),
    );
  });
});

describe("useSaveTactic", () => {
  it("保存を実行できる", async () => {
    const tactic = { id: "tac1", name: "Press" };
    mockTacticInteractor.save.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSaveTactic(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutateAsync).toBeDefined();
    await result.current.mutateAsync(tactic as never);
    expect(mockTacticInteractor.save).toHaveBeenCalledWith(tactic);
  });
});

describe("useDeleteTactic", () => {
  it("削除を実行できる", async () => {
    mockTacticInteractor.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTactic(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutateAsync).toBeDefined();
    await result.current.mutateAsync("tac1");
    expect(mockTacticInteractor.delete).toHaveBeenCalledWith(
      expect.objectContaining({ value: "tac1" }),
    );
  });
});

// =============================================================================
// ローディング状態・エラー状態・エッジケース テスト
// =============================================================================

import { handleError } from "@shared/errors/handleError";

// --- Query hooks: ローディング状態 ---

describe("useGlossaries - ローディング状態", () => {
  it("ローディング中は isLoading が true で data が undefined", () => {
    mockGlossaryInteractor.getAll.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useGlossaries(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useTeams - ローディング状態", () => {
  it("ローディング中は isLoading が true で data が undefined", () => {
    mockTeamInteractor.getAll.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useFormations - ローディング状態", () => {
  it("ローディング中は isLoading が true で data が undefined", () => {
    mockFormationInteractor.getAll.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useFormations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useTactics - ローディング状態", () => {
  it("phaseValue がある場合、ローディング中は isLoading が true で data が undefined", () => {
    mockTacticInteractor.getByPhase.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTactics("attack"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useAllTactics - ローディング状態", () => {
  it("ローディング中は isLoading が true で data が undefined", () => {
    mockTacticInteractor.getAll.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAllTactics(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

// --- Query hooks: エラー状態 ---

describe("useGlossaries - エラー状態", () => {
  it("取得失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("glossary DB failure");
    mockGlossaryInteractor.getAll.mockRejectedValue(error);

    const { result } = renderHook(() => useGlossaries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useTeams - エラー状態", () => {
  it("取得失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("team DB failure");
    mockTeamInteractor.getAll.mockRejectedValue(error);

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useFormations - エラー状態", () => {
  it("取得失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("formation DB failure");
    mockFormationInteractor.getAll.mockRejectedValue(error);

    const { result } = renderHook(() => useFormations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useTactics - エラー状態", () => {
  it("取得失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("tactic phase DB failure");
    mockTacticInteractor.getByPhase.mockRejectedValue(error);

    const { result } = renderHook(() => useTactics("defense"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useAllTactics - エラー状態", () => {
  it("取得失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("all tactics DB failure");
    mockTacticInteractor.getAll.mockRejectedValue(error);

    const { result } = renderHook(() => useAllTactics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });
});

// --- Mutation hooks: エラー状態 ---

describe("useSaveGlossary - エラー状態", () => {
  it("ミューテーション失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("glossary save failed");
    mockGlossaryInteractor.save.mockRejectedValue(error);

    const { result } = renderHook(() => useSaveGlossary(), {
      wrapper: createWrapper(),
    });

    const glossary = { id: "1", term: "テスト", description: "..." };

    try {
      await result.current.mutateAsync(glossary as never);
    } catch {
      /* expected */
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useDeleteGlossary - エラー状態", () => {
  it("ミューテーション失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("glossary delete failed");
    mockGlossaryInteractor.delete.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteGlossary(), {
      wrapper: createWrapper(),
    });

    try {
      await result.current.mutateAsync("1");
    } catch {
      /* expected */
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useSaveTactic - エラー状態", () => {
  it("ミューテーション失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("tactic save failed");
    mockTacticInteractor.save.mockRejectedValue(error);

    const { result } = renderHook(() => useSaveTactic(), {
      wrapper: createWrapper(),
    });

    const tactic = { id: { value: "tac1" }, name: "Press" };

    try {
      await result.current.mutateAsync(tactic as never);
    } catch {
      /* expected */
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("ミューテーション失敗時に handleError が呼ばれる", async () => {
    const error = new Error("tactic save failed");
    mockTacticInteractor.save.mockRejectedValue(error);

    const { result } = renderHook(() => useSaveTactic(), {
      wrapper: createWrapper(),
    });

    const tactic = { id: { value: "tac1" }, name: "Press" };

    try {
      await result.current.mutateAsync(tactic as never);
    } catch {
      /* expected */
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(handleError).toHaveBeenCalledWith(
      error,
      "database",
      "Failed to save tactic",
      { meta: { tacticId: "tac1", tacticName: "Press" } },
    );
  });
});

describe("useDeleteTactic - エラー状態", () => {
  it("ミューテーション失敗時は isError が true で error が Error インスタンス", async () => {
    const error = new Error("tactic delete failed");
    mockTacticInteractor.delete.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteTactic(), {
      wrapper: createWrapper(),
    });

    try {
      await result.current.mutateAsync("tac1");
    } catch {
      /* expected */
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("ミューテーション失敗時に handleError が呼ばれる", async () => {
    const error = new Error("tactic delete failed");
    mockTacticInteractor.delete.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteTactic(), {
      wrapper: createWrapper(),
    });

    try {
      await result.current.mutateAsync("tac1");
    } catch {
      /* expected */
    }

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(handleError).toHaveBeenCalledWith(
      error,
      "database",
      "Failed to delete tactic",
      { meta: { tacticId: "tac1" } },
    );
  });
});

// --- Mutation hooks: ローディング（isPending）状態 ---

describe("useSaveTactic - ローディング状態", () => {
  it("ミューテーション実行中は isPending が true", async () => {
    let resolvePromise: () => void;
    mockTacticInteractor.save.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useSaveTactic(), {
      wrapper: createWrapper(),
    });

    const tactic = { id: "tac1", name: "Press" };
    const mutationPromise = result.current.mutateAsync(tactic as never);

    await waitFor(() => expect(result.current.isPending).toBe(true));

    resolvePromise!();
    await mutationPromise;

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});

describe("useDeleteTactic - ローディング状態", () => {
  it("ミューテーション実行中は isPending が true", async () => {
    let resolvePromise: () => void;
    mockTacticInteractor.delete.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useDeleteTactic(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync("tac1");

    await waitFor(() => expect(result.current.isPending).toBe(true));

    resolvePromise!();
    await mutationPromise;

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});

describe("useSaveGlossary - ローディング状態", () => {
  it("ミューテーション実行中は isPending が true", async () => {
    let resolvePromise: () => void;
    mockGlossaryInteractor.save.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useSaveGlossary(), {
      wrapper: createWrapper(),
    });

    const glossary = { id: "1", term: "テスト", description: "..." };
    const mutationPromise = result.current.mutateAsync(glossary as never);

    await waitFor(() => expect(result.current.isPending).toBe(true));

    resolvePromise!();
    await mutationPromise;

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});

describe("useDeleteGlossary - ローディング状態", () => {
  it("ミューテーション実行中は isPending が true", async () => {
    let resolvePromise: () => void;
    mockGlossaryInteractor.delete.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useDeleteGlossary(), {
      wrapper: createWrapper(),
    });

    const mutationPromise = result.current.mutateAsync("1");

    await waitFor(() => expect(result.current.isPending).toBe(true));

    resolvePromise!();
    await mutationPromise;

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});

// --- useTactics: エッジケース ---

describe("useTactics - エッジケース", () => {
  it("phaseValue が null から値に変わるとクエリが有効化される", async () => {
    const data = [{ id: "tac1", name: "Counter" }];
    mockTacticInteractor.getByPhase.mockResolvedValue(data);

    const { result, rerender } = renderHook(
      ({ phase }: { phase: string | null }) => useTactics(phase),
      {
        wrapper: createWrapper(),
        initialProps: { phase: null as string | null },
      },
    );

    // null の場合はクエリが無効化されている
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(mockTacticInteractor.getByPhase).not.toHaveBeenCalled();

    // phase を設定して再レンダリング
    rerender({ phase: "attack" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockTacticInteractor.getByPhase).toHaveBeenCalledWith("attack");
  });

  it("phaseValue が null の場合 isLoading は false（クエリ無効）", () => {
    const { result } = renderHook(() => useTactics(null), {
      wrapper: createWrapper(),
    });

    // enabled: false のため isLoading は false、isPending は true（データなし）
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
