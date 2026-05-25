/**
 * @module useTeamManagement フック
 * @description チーム管理（選択・保存・選手CRUD・スカッド構成）フックの単体テスト
 *
 * テスト方針:
 * - ServiceContainer / useTeams / useSaveTeam / toast をvi.mockでスタブ化
 * - チーム選択・カラー更新・フォーメーション変更・監督設定を検証
 * - 選手の追加・更新・削除とチームへの保存を検証
 * - スカッド選択・カード管理・戦術設定のチーム永続化を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects";
import type { CardStatus } from "@presentation/components/three";
import { useTeamManagement } from "../useTeamManagement";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockTeamInteractor = {
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    teamInteractor: mockTeamInteractor,
  }),
}));

const mockHandleError = vi.fn();
vi.mock("@shared/errors", () => ({
  handleError: (...args: unknown[]) => mockHandleError(...args),
}));

vi.mock("@shared/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockConfirm = vi.fn().mockResolvedValue(true);
vi.mock("@presentation/components/ui", () => ({
  useConfirm: () => ({ confirm: mockConfirm, alert: vi.fn() }),
}));

// teamImportDataSchema — zod パースが通る最小限のモック
vi.mock("@application/schemas", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { z } = require("zod");
  return {
    teamImportDataSchema: z.object({
      name: z.string(),
      subtitle: z.string().optional().default(""),
      colors: z.object({
        gk: z.string().default("#FFFF00"),
        main: z.string().optional().default("#1E90FF"),
      }),
      availableFormations: z.array(z.string()).default(["4-4-2"]),
      flagType: z.string().default("rect"),
      headerGradient: z
        .string()
        .default("linear-gradient(135deg, #1e3a5f, #2d5a87)"),
      country: z.string().optional(),
      defaultFormation: z.string().optional(),
      manager: z.string().optional(),
      players: z
        .array(
          z.object({
            name: z.string(),
            number: z.number(),
            position: z.string().default("FW"),
            nationality: z.string().optional(),
            club: z.string().optional(),
            leagueCountry: z.string().optional(),
            note: z.string().optional(),
            status: z.string().optional(),
          }),
        )
        .optional()
        .default([]),
      availableTactics: z.record(z.array(z.string())).optional(),
    }),
  };
});

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockQueryClient = {
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  refetchQueries: vi.fn().mockResolvedValue(undefined),
  getQueryData: vi.fn().mockReturnValue([]),
};

function createMockCardMgmt() {
  return {
    playerCards: {} as Record<number, CardStatus>,
    setPlayerCards: vi.fn(),
    managerCard: "none" as const,
    setManagerCard: vi.fn(),
    showCards: true,
    setShowCards: vi.fn(),
    cycleCard: vi.fn(),
  };
}

function createDefaultParams(overrides: Record<string, unknown> = {}) {
  return {
    teams: [] as Team[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryClient: mockQueryClient as any,
    showToast: vi.fn(),
    cardMgmt: createMockCardMgmt(),
    resetHistory: vi.fn(),
    pushCurrentSnapshot: vi.fn(),
    t: vi.fn((key: string) => key),
    ...overrides,
  };
}

/** テスト用チームを作成 */
function createTestTeam(
  id: string,
  name: string,
  playerCount = 0,
  selectedSquad?: string[],
): Team {
  const teamId = new TeamId(id);
  const players: Player[] = [];
  for (let i = 0; i < playerCount; i++) {
    players.push(
      Player.create({
        name: `Player ${i + 1}`,
        number: i + 1,
        teamId,
        position: "fw",
      }),
    );
  }
  return new Team({
    id: teamId,
    name,
    subtitle: "Subtitle",
    colors: {
      gk: { hex: "#FFFF00" } as never,
      main: { hex: "#1E90FF" } as never,
    },
    availableFormations: ["4-4-2"],
    players,
    flagType: "rect",
    headerGradient: "linear-gradient(135deg, #1e3a5f, #2d5a87)",
    createdAt: new Date(),
    updatedAt: new Date(),
    defaultFormation: "4-4-2",
    selectedSquad,
  });
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("useTeamManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamInteractor.save.mockResolvedValue(undefined);
    mockTeamInteractor.delete.mockResolvedValue(undefined);
    mockQueryClient.invalidateQueries.mockResolvedValue(undefined);
    mockQueryClient.refetchQueries.mockResolvedValue(undefined);

    // confirm は常に true を返す（削除/インポート確認）
    mockConfirm.mockResolvedValue(true);
    // requestAnimationFrame スタブ
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      },
    );
  });

  // ── 初期状態 ────────────────────────────────────────────

  describe("初期状態", () => {
    it("selectedTeamId が null", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );
      expect(result.current.selectedTeamId).toBeNull();
    });

    it("showTeamSelection が true", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );
      expect(result.current.showTeamSelection).toBe(true);
    });

    it("showTeamCreator が false", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );
      expect(result.current.showTeamCreator).toBe(false);
    });

    it("showBulkTeamImport が false", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );
      expect(result.current.showBulkTeamImport).toBe(false);
    });

    it("customSquad が空配列", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );
      expect(result.current.customSquad).toEqual([]);
    });

    it("selectedTeam が undefined（チーム未選択）", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );
      expect(result.current.selectedTeam).toBeUndefined();
    });

    it("teams が渡されていても selectedTeamId が null なら selectedTeam は undefined", () => {
      const teams = [createTestTeam("t1", "Team A")];
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams({ teams })),
      );
      expect(result.current.selectedTeam).toBeUndefined();
    });
  });

  // ── チーム選択 ──────────────────────────────────────────

  describe("チーム選択", () => {
    it("setSelectedTeamId でチームを選択できる", () => {
      const teams = [createTestTeam("t1", "Team A")];
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams({ teams })),
      );

      act(() => {
        result.current.setSelectedTeamId("t1");
      });

      expect(result.current.selectedTeamId).toBe("t1");
      expect(result.current.selectedTeam).toBeDefined();
      expect(result.current.selectedTeam?.name).toBe("Team A");
    });

    it("存在しない teamId を選択すると selectedTeam は undefined", () => {
      const teams = [createTestTeam("t1", "Team A")];
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams({ teams })),
      );

      act(() => {
        result.current.setSelectedTeamId("nonexistent");
      });

      expect(result.current.selectedTeamId).toBe("nonexistent");
      expect(result.current.selectedTeam).toBeUndefined();
    });
  });

  // ── チーム作成 ──────────────────────────────────────────

  describe("handleCreateTeam", () => {
    it("成功: チームを保存しキャッシュを更新する", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const newTeam = createTestTeam("new-1", "New Team");

      await act(async () => {
        await result.current.handleCreateTeam(newTeam);
      });

      expect(mockTeamInteractor.save).toHaveBeenCalledWith(newTeam);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
      expect(mockQueryClient.refetchQueries).toHaveBeenCalled();
    });

    it("成功: 選択状態が更新される", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const newTeam = createTestTeam("new-1", "New Team");

      await act(async () => {
        await result.current.handleCreateTeam(newTeam);
      });

      expect(result.current.selectedTeamId).toBe("new-1");
      expect(result.current.showTeamSelection).toBe(false);
      expect(result.current.showTeamCreator).toBe(false);
      expect(result.current.customSquad).toEqual([]);
    });

    it("失敗: handleError が呼ばれる", async () => {
      mockTeamInteractor.save.mockRejectedValue(new Error("save failed"));
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const newTeam = createTestTeam("new-1", "New Team");

      await act(async () => {
        await result.current.handleCreateTeam(newTeam);
      });

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "database",
        "Failed to create team",
        expect.objectContaining({
          toast: expect.objectContaining({ message: "team.createFailed" }),
        }),
      );
    });
  });

  // ── チーム更新 ──────────────────────────────────────────

  describe("handleUpdateTeam", () => {
    it("成功: チームを保存しキャッシュを無効化する", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const team = createTestTeam("t1", "Updated Team");

      await act(async () => {
        await result.current.handleUpdateTeam(team);
      });

      expect(mockTeamInteractor.save).toHaveBeenCalledWith(team);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    });

    it("失敗: handleError が呼ばれる", async () => {
      mockTeamInteractor.save.mockRejectedValue(new Error("update failed"));
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const team = createTestTeam("t1", "Team A");

      await act(async () => {
        await result.current.handleUpdateTeam(team);
      });

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "database",
        "Failed to update team",
        expect.objectContaining({
          toast: expect.objectContaining({ message: "team.updateFailed" }),
        }),
      );
    });
  });

  // ── チーム削除 ──────────────────────────────────────────

  describe("handleDeleteTeam", () => {
    const createClickEvent = () =>
      ({ stopPropagation: vi.fn() }) as unknown as React.MouseEvent;

    it("成功: チームを削除しキャッシュを無効化する", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const event = createClickEvent();

      await act(async () => {
        await result.current.handleDeleteTeam("t1", "Team A", event);
      });

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(mockTeamInteractor.delete).toHaveBeenCalledWith(
        expect.any(TeamId),
      );
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    });

    it("確認ダイアログでキャンセルすると削除しない", async () => {
      mockConfirm.mockResolvedValueOnce(false);
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const event = createClickEvent();

      await act(async () => {
        await result.current.handleDeleteTeam("t1", "Team A", event);
      });

      expect(mockTeamInteractor.delete).not.toHaveBeenCalled();
    });

    it("選択中のチームを削除すると selectedTeamId が null になる", async () => {
      const teams = [createTestTeam("t1", "Team A")];
      const params = createDefaultParams({ teams });
      const { result } = renderHook(() => useTeamManagement(params));

      // まずチームを選択
      act(() => {
        result.current.setSelectedTeamId("t1");
      });
      expect(result.current.selectedTeamId).toBe("t1");

      // 選択中のチームを削除
      const event = createClickEvent();
      await act(async () => {
        await result.current.handleDeleteTeam("t1", "Team A", event);
      });

      expect(result.current.selectedTeamId).toBeNull();
      expect(result.current.showTeamSelection).toBe(true);
      expect(result.current.customSquad).toEqual([]);
    });

    it("選択していないチームを削除しても selectedTeamId は変わらない", async () => {
      const teams = [
        createTestTeam("t1", "Team A"),
        createTestTeam("t2", "Team B"),
      ];
      const params = createDefaultParams({ teams });
      const { result } = renderHook(() => useTeamManagement(params));

      act(() => {
        result.current.setSelectedTeamId("t1");
      });

      const event = createClickEvent();
      await act(async () => {
        await result.current.handleDeleteTeam("t2", "Team B", event);
      });

      // t1 の選択は維持される
      expect(result.current.selectedTeamId).toBe("t1");
    });

    it("失敗: handleError が呼ばれる", async () => {
      mockTeamInteractor.delete.mockRejectedValue(new Error("delete failed"));
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      const event = createClickEvent();

      await act(async () => {
        await result.current.handleDeleteTeam("t1", "Team A", event);
      });

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "database",
        "Failed to delete team",
        expect.objectContaining({
          toast: expect.objectContaining({ message: "team.deleteFailed" }),
        }),
      );
    });
  });

  // ── スカッド更新 ────────────────────────────────────────

  describe("handleUpdateSquad", () => {
    it("成功: スカッドをローカル状態と DB に保存する", async () => {
      const team = createTestTeam("t1", "Team A", 3);
      team.updateSelectedSquad = vi.fn();
      const teams = [team];
      const params = createDefaultParams({ teams });
      const { result } = renderHook(() => useTeamManagement(params));

      // チーム選択
      act(() => {
        result.current.setSelectedTeamId("t1");
      });

      const players = [team.players[0], team.players[1], null];
      await act(async () => {
        await result.current.handleUpdateSquad(players);
      });

      expect(result.current.customSquad).toEqual(players);
      expect(team.updateSelectedSquad).toHaveBeenCalled();
      expect(mockTeamInteractor.save).toHaveBeenCalledWith(team);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
    });

    it("チーム未選択時は DB 保存しない", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      await act(async () => {
        await result.current.handleUpdateSquad([null, null]);
      });

      // ローカル状態は更新される
      expect(result.current.customSquad).toEqual([null, null]);
      // DB 操作は行われない
      expect(mockTeamInteractor.save).not.toHaveBeenCalled();
    });

    it("失敗: handleError が呼ばれる", async () => {
      mockTeamInteractor.save.mockRejectedValue(new Error("squad save failed"));
      const team = createTestTeam("t1", "Team A", 2);
      team.updateSelectedSquad = vi.fn();
      const teams = [team];
      const params = createDefaultParams({ teams });
      const { result } = renderHook(() => useTeamManagement(params));

      act(() => {
        result.current.setSelectedTeamId("t1");
      });

      await act(async () => {
        await result.current.handleUpdateSquad([team.players[0]]);
      });

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "database",
        "Failed to update squad",
        expect.objectContaining({
          toast: expect.objectContaining({
            message: "team.squadUpdateFailed",
          }),
        }),
      );
    });
  });

  // ── 交代 ────────────────────────────────────────────────

  describe("handleSubstitution", () => {
    it("スターターとサブの選手を入れ替える", () => {
      const team = createTestTeam("t1", "Team A", 15);
      const playerIds = team.players.map((p) => p.id.value);
      team.updateSelectedSquad(playerIds);
      const teams = [team];
      const params = createDefaultParams({ teams });
      const { result } = renderHook(() => useTeamManagement(params));

      act(() => {
        result.current.setSelectedTeamId("t1");
      });

      // customSquad が同期されているか確認
      expect(result.current.customSquad.length).toBe(15);

      // 12 番目（サブ: index 11）→ 1 番目（スターター: index 0）
      act(() => {
        result.current.handleSubstitution(11, 0);
      });

      // スターター位置にサブ選手、サブ位置は null
      expect(result.current.customSquad[0]?.id.value).toBe(
        team.players[11].id.value,
      );
      expect(result.current.customSquad[11]).toBeNull();
      expect(result.current.substitutionRecords).toHaveLength(1);
      expect(result.current.substitutionRecords[0].inPlayer.id.value).toBe(
        team.players[11].id.value,
      );
      expect(result.current.substitutionRecords[0].outPlayer.id.value).toBe(
        team.players[0].id.value,
      );
    });

    it("どちらかが null の場合は交代しない", () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      // customSquad は空なのでどちらも null
      act(() => {
        result.current.handleSubstitution(0, 1);
      });

      expect(result.current.substitutionRecords).toHaveLength(0);
    });
  });

  // ── 交代リセット ────────────────────────────────────────

  describe("resetSubstitutions", () => {
    it("交代を元に戻し substitutionRecords をクリアする", () => {
      const team = createTestTeam("t1", "Team A", 15);
      const playerIds = team.players.map((p) => p.id.value);
      team.updateSelectedSquad(playerIds);
      const teams = [team];
      const params = createDefaultParams({ teams });
      const { result } = renderHook(() => useTeamManagement(params));

      act(() => {
        result.current.setSelectedTeamId("t1");
      });

      // 交代を実行
      act(() => {
        result.current.handleSubstitution(11, 0);
      });
      expect(result.current.substitutionRecords).toHaveLength(1);
      expect(result.current.customSquad[0]?.id.value).toBe(
        team.players[11].id.value,
      );

      // リセット
      act(() => {
        result.current.resetSubstitutions();
      });

      expect(result.current.substitutionRecords).toHaveLength(0);
      // 元のスカッドに復元
      expect(result.current.customSquad[0]?.id.value).toBe(
        team.players[0].id.value,
      );
    });
  });

  // ── カード初期化 Effect ─────────────────────────────────

  describe("チーム変更時の Effect", () => {
    it("チーム選択時にカード状態が初期化される", () => {
      const team = createTestTeam("t1", "Team A");
      team.updatePlayerCards({ 0: "yellow" });
      team.updateManagerCard("red");
      const cardMgmt = createMockCardMgmt();
      const resetHistory = vi.fn();
      const pushCurrentSnapshot = vi.fn();
      const teams = [team];
      const params = createDefaultParams({
        teams,
        cardMgmt,
        resetHistory,
        pushCurrentSnapshot,
      });

      const { result } = renderHook(() => useTeamManagement(params));

      act(() => {
        result.current.setSelectedTeamId("t1");
      });

      expect(cardMgmt.setPlayerCards).toHaveBeenCalledWith({ 0: "yellow" });
      expect(cardMgmt.setManagerCard).toHaveBeenCalledWith("red");
      expect(resetHistory).toHaveBeenCalled();
      expect(pushCurrentSnapshot).toHaveBeenCalled();
    });

    it("チーム未選択時にカード状態がリセットされる", () => {
      const cardMgmt = createMockCardMgmt();
      const params = createDefaultParams({ cardMgmt });

      renderHook(() => useTeamManagement(params));

      // selectedTeam が undefined なのでリセットされる
      expect(cardMgmt.setPlayerCards).toHaveBeenCalledWith({});
      expect(cardMgmt.setManagerCard).toHaveBeenCalledWith("none");
    });
  });

  // ── 一括インポート ──────────────────────────────────────

  describe("handleBulkTeamImport", () => {
    const validJsonSingle = JSON.stringify({
      name: "Imported Team",
      colors: { gk: "#FFFF00", main: "#1E90FF" },
      availableFormations: ["4-4-2"],
      flagType: "rect",
      headerGradient: "linear-gradient(135deg, #1e3a5f, #2d5a87)",
    });

    const validJsonMultiple = JSON.stringify([
      {
        name: "Team A",
        colors: { gk: "#FFFF00", main: "#1E90FF" },
        availableFormations: ["4-4-2"],
        flagType: "rect",
        headerGradient: "linear-gradient(135deg, #1e3a5f, #2d5a87)",
      },
      {
        name: "Team B",
        colors: { gk: "#FFFF00", main: "#FF0000" },
        availableFormations: ["4-3-3"],
        flagType: "rect",
        headerGradient: "linear-gradient(135deg, #1e3a5f, #2d5a87)",
      },
    ]);

    it("成功: 単一チームをインポートする", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      await act(async () => {
        await result.current.handleBulkTeamImport(validJsonSingle);
      });

      expect(mockTeamInteractor.save).toHaveBeenCalledTimes(1);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
      expect(params.showToast).toHaveBeenCalledWith(
        expect.any(String),
        "success",
      );
      expect(result.current.showBulkTeamImport).toBe(false);
    });

    it("成功: 複数チームをインポートする", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      await act(async () => {
        await result.current.handleBulkTeamImport(validJsonMultiple);
      });

      expect(mockTeamInteractor.save).toHaveBeenCalledTimes(2);
      expect(params.showToast).toHaveBeenCalledWith(
        expect.any(String),
        "success",
      );
    });

    it("空配列の場合はエラートーストを表示", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      await act(async () => {
        await result.current.handleBulkTeamImport("[]");
      });

      expect(params.showToast).toHaveBeenCalledWith(
        "team.import.noTeams",
        "error",
      );
      expect(mockTeamInteractor.save).not.toHaveBeenCalled();
    });

    it("確認ダイアログでキャンセルすると処理しない", async () => {
      mockConfirm.mockResolvedValueOnce(false);
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      await act(async () => {
        await result.current.handleBulkTeamImport(validJsonSingle);
      });

      expect(mockTeamInteractor.save).not.toHaveBeenCalled();
    });

    it("不正な JSON の場合 handleError が呼ばれる", async () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      await act(async () => {
        await result.current.handleBulkTeamImport("invalid json {{{");
      });

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        "database",
        "Bulk team import failed",
        expect.objectContaining({
          toast: expect.objectContaining({ message: "team.import.failed" }),
        }),
      );
    });

    it("DB 保存失敗時に handleError が呼ばれる", async () => {
      mockTeamInteractor.save.mockRejectedValue(new Error("DB write error"));
      const params = createDefaultParams();
      const { result } = renderHook(() => useTeamManagement(params));

      await act(async () => {
        await result.current.handleBulkTeamImport(validJsonSingle);
      });

      // 個別チーム保存エラー + 全体のエラー
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  // ── UI 状態トグル ───────────────────────────────────────

  describe("UI 状態トグル", () => {
    it("setShowTeamSelection でチーム選択パネルの表示を切替できる", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );

      act(() => {
        result.current.setShowTeamSelection(false);
      });
      expect(result.current.showTeamSelection).toBe(false);

      act(() => {
        result.current.setShowTeamSelection(true);
      });
      expect(result.current.showTeamSelection).toBe(true);
    });

    it("setShowTeamCreator でチーム作成モーダルの表示を切替できる", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );

      act(() => {
        result.current.setShowTeamCreator(true);
      });
      expect(result.current.showTeamCreator).toBe(true);
    });

    it("setShowBulkTeamImport で一括インポートモーダルの表示を切替できる", () => {
      const { result } = renderHook(() =>
        useTeamManagement(createDefaultParams()),
      );

      act(() => {
        result.current.setShowBulkTeamImport(true);
      });
      expect(result.current.showBulkTeamImport).toBe(true);
    });
  });
});
