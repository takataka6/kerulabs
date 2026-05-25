/**
 * @module useTeamManuals
 * @description チームマニュアルReact Queryフックの単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useTeamManuals,
  useSaveTeamManual,
  useDeleteTeamManual,
} from "../../../hooks/queries/useTeamManuals";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects";

const mockGetAll = vi.fn();
const mockSave = vi.fn();
const mockDelete = vi.fn();

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    teamManualInteractor: {
      getAll: mockGetAll,
      save: mockSave,
      delete: mockDelete,
    },
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const now = new Date("2025-01-01T00:00:00Z");

function createTestManual(id = "m-1", name = "Test"): TeamManual {
  return new TeamManual({
    id: new TeamManualId(id),
    name,
    description: "desc",
    sections: [],
    createdAt: now,
    updatedAt: now,
  });
}

describe("useTeamManuals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("全マニュアルを取得する", async () => {
    const manuals = [createTestManual("m-1", "マニュアル1")];
    mockGetAll.mockResolvedValue(manuals);

    const { result } = renderHook(() => useTeamManuals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe("マニュアル1");
  });
});

describe("useSaveTeamManual", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("マニュアルを保存する", async () => {
    mockSave.mockResolvedValue(undefined);
    mockGetAll.mockResolvedValue([]);
    const manual = createTestManual();

    const { result } = renderHook(() => useSaveTeamManual(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync(manual);

    expect(mockSave).toHaveBeenCalledWith(manual);
  });
});

describe("useDeleteTeamManual", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("マニュアルを削除する", async () => {
    mockDelete.mockResolvedValue(undefined);
    mockGetAll.mockResolvedValue([]);

    const { result } = renderHook(() => useDeleteTeamManual(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync("m-1");

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ value: "m-1" }),
    );
  });
});
