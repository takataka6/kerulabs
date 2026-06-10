/**
 * @module useSeedSampleData フック
 * @description サンプルデータ投入フックの単体テスト
 *
 * テスト方針:
 * - targets オプションにより投入対象エンティティが切り替わることを検証
 * - 未指定時はすべてのエンティティを投入することを検証
 * - エラー時はロールバックが実行されることを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSeedSampleData } from "../useSeedSampleData";

const mockTeamSave = vi.fn().mockResolvedValue(undefined);
const mockGlossarySave = vi.fn().mockResolvedValue(undefined);
const mockManualSave = vi.fn().mockResolvedValue(undefined);
const mockTeamDelete = vi.fn().mockResolvedValue(undefined);
const mockGlossaryDelete = vi.fn().mockResolvedValue(undefined);
const mockManualDelete = vi.fn().mockResolvedValue(undefined);

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    teamInteractor: { save: mockTeamSave, delete: mockTeamDelete },
    glossaryInteractor: { save: mockGlossarySave, delete: mockGlossaryDelete },
    teamManualInteractor: { save: mockManualSave, delete: mockManualDelete },
  }),
}));

const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

const mockShowToast = vi.fn();
const mockT = (key: string) => key;

describe("useSeedSampleData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("targets 未指定ではチーム・用語集・マニュアルをすべて投入する", async () => {
    const { result } = renderHook(() =>
      useSeedSampleData(mockShowToast, mockT),
    );

    await act(async () => {
      await result.current.handleSeed();
    });

    expect(mockTeamSave).toHaveBeenCalled();
    expect(mockGlossarySave).toHaveBeenCalled();
    expect(mockManualSave).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith("app.seed.success", "success");
  });

  it("targets: { glossary: true } では用語集のみ投入する", async () => {
    const { result } = renderHook(() =>
      useSeedSampleData(mockShowToast, mockT, { glossary: true }),
    );

    await act(async () => {
      await result.current.handleSeed();
    });

    expect(mockTeamSave).not.toHaveBeenCalled();
    expect(mockGlossarySave).toHaveBeenCalledOnce();
    expect(mockManualSave).not.toHaveBeenCalled();
  });

  it("targets: { manual: true } ではマニュアルのみ投入する", async () => {
    const { result } = renderHook(() =>
      useSeedSampleData(mockShowToast, mockT, { manual: true }),
    );

    await act(async () => {
      await result.current.handleSeed();
    });

    expect(mockTeamSave).not.toHaveBeenCalled();
    expect(mockGlossarySave).not.toHaveBeenCalled();
    expect(mockManualSave).toHaveBeenCalledOnce();
  });

  it("targets: { teams: true } ではチームのみ投入する", async () => {
    const { result } = renderHook(() =>
      useSeedSampleData(mockShowToast, mockT, { teams: true }),
    );

    await act(async () => {
      await result.current.handleSeed();
    });

    expect(mockTeamSave).toHaveBeenCalled();
    expect(mockGlossarySave).not.toHaveBeenCalled();
    expect(mockManualSave).not.toHaveBeenCalled();
  });

  it("保存失敗時はロールバックしてエラートーストを表示する", async () => {
    mockGlossarySave.mockRejectedValueOnce(new Error("DB error"));

    const { result } = renderHook(() =>
      useSeedSampleData(mockShowToast, mockT, { glossary: true }),
    );

    await act(async () => {
      await result.current.handleSeed();
    });

    expect(mockShowToast).toHaveBeenCalledWith("app.seed.error", "error");
  });

  it("isSeeding は handleSeed 実行中に true になる", async () => {
    let resolveSave!: () => void;
    mockGlossarySave.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );

    const { result } = renderHook(() =>
      useSeedSampleData(mockShowToast, mockT, { glossary: true }),
    );

    expect(result.current.isSeeding).toBe(false);

    act(() => {
      result.current.handleSeed();
    });

    expect(result.current.isSeeding).toBe(true);

    await act(async () => {
      resolveSave();
    });

    expect(result.current.isSeeding).toBe(false);
  });
});
