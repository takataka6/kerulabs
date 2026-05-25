/**
 * @module useOpponents フック
 * @description 相手チームマーカー管理フックの単体テスト
 *
 * テスト方針:
 * - ドメインエンティティ（Team / Player / Formation）を直接使用
 * - 相手マーカーの追加・削除・位置更新・配置モード切替を検証
 * - フィールドクリックによるマーカー配置の条件分岐を検証
 * - フォーメーション・チーム選択による初期配置ロジックを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOpponents } from "../useOpponents";
import type { Formation } from "@domain/entities/Formation";
import { FormationId } from "@domain/value-objects/FormationId";
import { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import { TeamId } from "@domain/value-objects/TeamId";
import { PlayerId } from "@domain/value-objects/PlayerId";
import { Color } from "@domain/value-objects/Color";
import { Position } from "@domain/value-objects/Position";

/* ── Helpers ── */

const TEAM_ID = new TeamId("team-1");

function createPlayer(
  overrides: Partial<{
    id: string;
    name: string;
    number: number;
    position: "gk" | "df" | "mf" | "fw";
  }> = {},
): Player {
  const now = new Date();
  return new Player({
    id: new PlayerId(overrides.id ?? `player-${overrides.number ?? 10}`),
    teamId: TEAM_ID,
    name: overrides.name ?? "Test Player",
    number: overrides.number ?? 10,
    position: overrides.position ?? "mf",
    createdAt: now,
    updatedAt: now,
  });
}

function createTeam(players: Player[]): Team {
  const now = new Date();
  return new Team({
    id: TEAM_ID,
    name: "Test Team",
    subtitle: "Test League",
    colors: { gk: Color.fromHex("#ffff00"), main: Color.fromHex("#ff0000") },
    availableFormations: ["4-4-2"],
    players,
    flagType: "flag",
    headerGradient: "gradient",
    createdAt: now,
    updatedAt: now,
  });
}

function createFormation(id: string, positionCount = 11): Formation {
  const positions = Array.from({ length: positionCount }, (_, i) => ({
    pos: i === 0 ? "GK" : `P${i}`,
    position: Position.create(i * 2, i * 3),
    category: (i === 0 ? "gk" : "mf") as "gk" | "df" | "mf" | "fw",
  }));
  const roleMap = new Map<string, number>();
  positions.forEach((p, i) => roleMap.set(p.pos, i));
  const now = new Date();
  return {
    id: new FormationId(id),
    name: `Formation-${id}`,
    type: "standard",
    positions,
    roleMap,
    isCustom: false,
    createdAt: now,
    updatedAt: now,
    gameMode: "football" as const,
    getPlayerIndexByRole: (role: string) => roleMap.get(role),
    getPositionByIndex: (index: number) => positions[index],
  } as Formation;
}

function renderOpponentsHook(
  overrides: {
    teams?: Team[];
    gameModeFormations?: Formation[];
    maxOpponents?: number;
    onPushSnapshot?: ReturnType<typeof vi.fn>;
    onDisableOtherModes?: ReturnType<typeof vi.fn>;
    showToast?: ReturnType<typeof vi.fn>;
    t?: (key: string) => string;
  } = {},
) {
  const onPushSnapshot = overrides.onPushSnapshot ?? vi.fn();
  const onDisableOtherModes = overrides.onDisableOtherModes ?? vi.fn();
  const showToast = overrides.showToast ?? vi.fn();

  return renderHook(() =>
    useOpponents(
      overrides.teams ?? [],
      overrides.gameModeFormations ?? [],
      overrides.maxOpponents ?? 11,
      onPushSnapshot,
      onDisableOtherModes,
      showToast,
      overrides.t,
    ),
  );
}

/* ── Tests ── */

describe("useOpponents", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  it("初期状態: opponents が空配列, opponentPlacementMode が false", () => {
    const { result } = renderOpponentsHook();
    expect(result.current.opponents).toEqual([]);
    expect(result.current.opponentPlacementMode).toBe(false);
  });

  it("toggleOpponentPlacement: 配置モードをトグルする", () => {
    const onDisableOtherModes = vi.fn();
    const { result } = renderOpponentsHook({ onDisableOtherModes });

    act(() => result.current.toggleOpponentPlacement());
    expect(result.current.opponentPlacementMode).toBe(true);
    expect(onDisableOtherModes).toHaveBeenCalledOnce();

    act(() => result.current.toggleOpponentPlacement());
    expect(result.current.opponentPlacementMode).toBe(false);
  });

  it("toggleOpponentPlacement: OFF にすると関連状態がリセットされる", () => {
    const { result } = renderOpponentsHook();

    // ON にする
    act(() => result.current.toggleOpponentPlacement());
    expect(result.current.opponentPlacementMode).toBe(true);

    // showOpponentFormationSelect を手動で ON にして関連状態を設定
    act(() => result.current.setShowOpponentFormationSelect(true));
    act(() => result.current.setOpponentFormationId("some-formation"));
    act(() => result.current.setShowOpponentSquadBuilder(true));

    // OFF にすると関連状態がリセットされる
    act(() => result.current.toggleOpponentPlacement());
    expect(result.current.opponentPlacementMode).toBe(false);
    expect(result.current.showOpponentFormationSelect).toBe(false);
    expect(result.current.showOpponentSquadBuilder).toBe(false);
    expect(result.current.opponentFormationId).toBeNull();
  });

  it("handleOpponentDrag: 対戦相手の位置を更新する", () => {
    const { result } = renderOpponentsHook();

    // まず配置モードで 1 体追加
    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.handleFieldClick({ x: 10, z: 20 }, false));
    const oppId = result.current.opponents[0].id;

    // ドラッグで位置を更新
    act(() => result.current.handleOpponentDrag(oppId, { x: 30, z: 40 }));
    expect(result.current.opponents[0]).toMatchObject({ x: 30, z: 40 });
  });

  it("handleOpponentDrag: 存在しない id の場合は他の要素に影響しない", () => {
    const { result } = renderOpponentsHook();

    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.handleFieldClick({ x: 10, z: 20 }, false));

    act(() => result.current.handleOpponentDrag(9999, { x: 30, z: 40 }));
    expect(result.current.opponents[0]).toMatchObject({ x: 10, z: 20 });
  });

  it("handleOpponentRemove: 対戦相手を削除する", () => {
    const onPushSnapshot = vi.fn();
    const { result } = renderOpponentsHook({ onPushSnapshot });

    // 配置モードで 1 体追加
    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.handleFieldClick({ x: 5, z: 5 }, false));
    expect(result.current.opponents).toHaveLength(1);
    const oppId = result.current.opponents[0].id;

    onPushSnapshot.mockClear();
    act(() => result.current.handleOpponentRemove(oppId));
    expect(result.current.opponents).toHaveLength(0);
    expect(onPushSnapshot).toHaveBeenCalled();
  });

  it("clearOpponents: 全対戦相手をクリアする", () => {
    const onPushSnapshot = vi.fn();
    const { result } = renderOpponentsHook({ onPushSnapshot });

    // 配置モードで 2 体追加
    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.handleFieldClick({ x: 1, z: 1 }, false));
    act(() => result.current.handleFieldClick({ x: 2, z: 2 }, false));
    expect(result.current.opponents).toHaveLength(2);

    onPushSnapshot.mockClear();
    act(() => result.current.clearOpponents());
    expect(result.current.opponents).toEqual([]);
    expect(onPushSnapshot).toHaveBeenCalled();
  });

  it("handleFieldClick: 配置モードでない場合は何も起きない", () => {
    const { result } = renderOpponentsHook();

    act(() => result.current.handleFieldClick({ x: 10, z: 20 }, false));
    expect(result.current.opponents).toHaveLength(0);
  });

  it("handleFieldClick: isDraggingObject が true の場合は何も起きない", () => {
    const { result } = renderOpponentsHook();

    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.handleFieldClick({ x: 10, z: 20 }, true));
    expect(result.current.opponents).toHaveLength(0);
  });

  it("handleFieldClick: maxOpponents に達した場合は追加しない", () => {
    const { result } = renderOpponentsHook({ maxOpponents: 2 });

    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.handleFieldClick({ x: 1, z: 1 }, false));
    act(() => result.current.handleFieldClick({ x: 2, z: 2 }, false));
    expect(result.current.opponents).toHaveLength(2);

    // 3 体目は追加されない
    act(() => result.current.handleFieldClick({ x: 3, z: 3 }, false));
    expect(result.current.opponents).toHaveLength(2);
  });

  // ── opponentTeam memo ──

  it("opponentTeam: opponentTeamId に一致するチームを返す", () => {
    const players = [createPlayer({ id: "p1", number: 1, position: "gk" })];
    const team = createTeam(players);
    const { result } = renderOpponentsHook({ teams: [team] });

    act(() => result.current.setOpponentTeamId(TEAM_ID.value));
    expect(result.current.opponentTeam).toBe(team);
  });

  it("opponentTeam: teams が undefined の場合は undefined", () => {
    const { result } = renderHook(() =>
      useOpponents(undefined, [], 11, vi.fn()),
    );
    expect(result.current.opponentTeam).toBeUndefined();
  });

  it("opponentTeam: 一致しない teamId の場合は undefined", () => {
    const team = createTeam([]);
    const { result } = renderOpponentsHook({ teams: [team] });

    act(() => result.current.setOpponentTeamId("non-existent-id"));
    expect(result.current.opponentTeam).toBeUndefined();
  });

  // ── handleFieldClick: チーム選択時のパス ──

  it("handleFieldClick: opponentTeam がありプレイヤー未選択の場合、トーストを表示", () => {
    const showToast = vi.fn();
    const t = vi.fn((key: string) => `translated:${key}`);
    const players = [createPlayer({ id: "p1", number: 10 })];
    const team = createTeam(players);

    const { result } = renderOpponentsHook({ teams: [team], showToast, t });

    // チームを選択してプレイヤーは未選択
    act(() => result.current.setOpponentTeamId(TEAM_ID.value));
    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.handleFieldClick({ x: 5, z: 5 }, false));

    expect(showToast).toHaveBeenCalledWith(
      "translated:tactics.opponents.selectPlayerAlert",
      "error",
    );
    expect(result.current.opponents).toHaveLength(0);
  });

  it("handleFieldClick: opponentTeam + プレイヤー選択済みの場合、フィールドプレイヤーを配置", () => {
    const onPushSnapshot = vi.fn();
    const fp = createPlayer({
      id: "p10",
      number: 10,
      position: "mf",
      name: "Midfielder",
    });
    const team = createTeam([fp]);

    const { result } = renderOpponentsHook({
      teams: [team],
      onPushSnapshot,
    });

    act(() => result.current.setOpponentTeamId(TEAM_ID.value));
    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.setSelectedOpponentPlayerId("p10"));
    act(() => result.current.handleFieldClick({ x: 5, z: 10 }, false));

    expect(result.current.opponents).toHaveLength(1);
    const opp = result.current.opponents[0];
    expect(opp.x).toBe(5);
    expect(opp.z).toBe(10);
    expect(opp.playerName).toBe("Midfielder");
    expect(opp.playerNumber).toBe(10);
    expect(opp.playerPosition).toBe("mf");
    expect(opp.color).toBe("#ff0000"); // main color
    // selectedOpponentPlayerId がリセットされる
    expect(result.current.selectedOpponentPlayerId).toBeNull();
  });

  it("handleFieldClick: GK プレイヤーの場合は GK カラーが使われる", () => {
    const gk = createPlayer({
      id: "gk1",
      number: 1,
      position: "gk",
      name: "Goalkeeper",
    });
    const team = createTeam([gk]);

    const { result } = renderOpponentsHook({ teams: [team] });

    act(() => result.current.setOpponentTeamId(TEAM_ID.value));
    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.setSelectedOpponentPlayerId("gk1"));
    act(() => result.current.handleFieldClick({ x: 0, z: 0 }, false));

    expect(result.current.opponents).toHaveLength(1);
    expect(result.current.opponents[0].color).toBe("#ffff00"); // GK color
  });

  it("handleFieldClick: 選択プレイヤーがチームに見つからない場合は追加しない", () => {
    const fp = createPlayer({ id: "p10", number: 10 });
    const team = createTeam([fp]);

    const { result } = renderOpponentsHook({ teams: [team] });

    act(() => result.current.setOpponentTeamId(TEAM_ID.value));
    act(() => result.current.toggleOpponentPlacement());
    act(() => result.current.setSelectedOpponentPlayerId("non-existent"));
    act(() => result.current.handleFieldClick({ x: 5, z: 5 }, false));

    expect(result.current.opponents).toHaveLength(0);
  });

  // ── handleOpponentSquadComplete ──

  describe("handleOpponentSquadComplete", () => {
    it("opponentTeam が未設定の場合は何も起きない", () => {
      const onPushSnapshot = vi.fn();
      const { result } = renderOpponentsHook({ onPushSnapshot });

      act(() => result.current.setOpponentFormationId("f1"));
      onPushSnapshot.mockClear();
      act(() => result.current.handleOpponentSquadComplete([]));

      expect(result.current.opponents).toHaveLength(0);
      expect(onPushSnapshot).not.toHaveBeenCalled();
    });

    it("opponentFormationId が未設定の場合は何も起きない", () => {
      const onPushSnapshot = vi.fn();
      const team = createTeam([]);
      const { result } = renderOpponentsHook({ teams: [team], onPushSnapshot });

      act(() => result.current.setOpponentTeamId(TEAM_ID.value));
      onPushSnapshot.mockClear();
      act(() => result.current.handleOpponentSquadComplete([]));

      expect(result.current.opponents).toHaveLength(0);
      expect(onPushSnapshot).not.toHaveBeenCalled();
    });

    it("フォーメーションが gameModeFormations に見つからない場合は何も起きない", () => {
      const onPushSnapshot = vi.fn();
      const team = createTeam([]);
      const formation = createFormation("f1");
      const { result } = renderOpponentsHook({
        teams: [team],
        gameModeFormations: [formation],
        onPushSnapshot,
      });

      act(() => result.current.setOpponentTeamId(TEAM_ID.value));
      act(() => result.current.setOpponentFormationId("non-existent"));
      onPushSnapshot.mockClear();
      act(() => result.current.handleOpponentSquadComplete([]));

      expect(result.current.opponents).toHaveLength(0);
    });

    it("プレイヤー配列から対戦相手を一括配置する", () => {
      const onPushSnapshot = vi.fn();
      const gk = createPlayer({
        id: "gk1",
        number: 1,
        position: "gk",
        name: "GK",
      });
      const mf = createPlayer({
        id: "mf10",
        number: 10,
        position: "mf",
        name: "MF",
      });
      const team = createTeam([gk, mf]);
      const formation = createFormation("f1", 11);

      const { result } = renderOpponentsHook({
        teams: [team],
        gameModeFormations: [formation],
        onPushSnapshot,
      });

      act(() => result.current.setOpponentTeamId(TEAM_ID.value));
      act(() => result.current.setOpponentFormationId("f1"));

      // 11ポジションのうち2人だけ入れて残りは null
      const players: (Player | null)[] = [gk, mf, ...Array(9).fill(null)];

      onPushSnapshot.mockClear();
      act(() => result.current.handleOpponentSquadComplete(players));

      expect(result.current.opponents).toHaveLength(2);
      // GK はポジション0 → 座標が反転
      expect(result.current.opponents[0].playerName).toBe("GK");
      expect(result.current.opponents[0].color).toBe("#ffff00"); // GK color
      expect(result.current.opponents[0].x).toBe(0 * -1); // position.x * -1
      // MF はポジション1
      expect(result.current.opponents[1].playerName).toBe("MF");
      expect(result.current.opponents[1].color).toBe("#ff0000"); // main color
      // 関連状態がリセットされる
      expect(result.current.showOpponentSquadBuilder).toBe(false);
      expect(result.current.showOpponentFormationSelect).toBe(false);
      expect(result.current.opponentFormationId).toBeNull();
      // onPushSnapshot が呼ばれる（開始時と rAF 後）
      expect(onPushSnapshot).toHaveBeenCalled();
    });
  });

  // ── placeSquadDirectly ──

  describe("placeSquadDirectly", () => {
    it("opponentTeam が未設定の場合は何も起きない", () => {
      const onPushSnapshot = vi.fn();
      const { result } = renderOpponentsHook({ onPushSnapshot });

      onPushSnapshot.mockClear();
      act(() => result.current.placeSquadDirectly("f1", []));

      expect(result.current.opponents).toHaveLength(0);
      expect(onPushSnapshot).not.toHaveBeenCalled();
    });

    it("フォーメーションが見つからない場合は何も起きない", () => {
      const onPushSnapshot = vi.fn();
      const team = createTeam([]);
      const { result } = renderOpponentsHook({
        teams: [team],
        gameModeFormations: [],
        onPushSnapshot,
      });

      act(() => result.current.setOpponentTeamId(TEAM_ID.value));
      onPushSnapshot.mockClear();
      act(() => result.current.placeSquadDirectly("non-existent", []));

      expect(result.current.opponents).toHaveLength(0);
    });

    it("フォーメーションIDとプレイヤー配列から直接配置する", () => {
      const onPushSnapshot = vi.fn();
      const gk = createPlayer({
        id: "gk1",
        number: 1,
        position: "gk",
        name: "GK",
      });
      const fw = createPlayer({
        id: "fw9",
        number: 9,
        position: "fw",
        name: "FW",
      });
      const team = createTeam([gk, fw]);
      const formation = createFormation("f1", 11);

      const { result } = renderOpponentsHook({
        teams: [team],
        gameModeFormations: [formation],
        onPushSnapshot,
      });

      act(() => result.current.setOpponentTeamId(TEAM_ID.value));

      const players: (Player | null)[] = [gk, fw, ...Array(9).fill(null)];

      onPushSnapshot.mockClear();
      act(() => result.current.placeSquadDirectly("f1", players));

      expect(result.current.opponents).toHaveLength(2);
      expect(result.current.opponents[0].playerName).toBe("GK");
      expect(result.current.opponents[0].color).toBe("#ffff00"); // GK color
      expect(result.current.opponents[1].playerName).toBe("FW");
      expect(result.current.opponents[1].color).toBe("#ff0000"); // main color
      // 座標は反転される (0 * -1 = -0)
      expect(result.current.opponents[0].x).toBe(-0);
      expect(result.current.opponents[0].z).toBe(-0);
      expect(result.current.opponents[1].x).toBe(-2);
      expect(result.current.opponents[1].z).toBe(-3);
      // 関連状態がリセットされる
      expect(result.current.showOpponentFormationSelect).toBe(false);
      expect(result.current.opponentFormationId).toBeNull();
      expect(onPushSnapshot).toHaveBeenCalled();
    });
  });

  // ── showOpponentNames ──

  it("showOpponentNames: デフォルトは true で切り替え可能", () => {
    const { result } = renderOpponentsHook();

    expect(result.current.showOpponentNames).toBe(true);
    act(() => result.current.setShowOpponentNames(false));
    expect(result.current.showOpponentNames).toBe(false);
  });

  // ── setOpponents (直接設定) ──

  it("setOpponents: 外部から opponents 配列を直接設定できる", () => {
    const { result } = renderOpponentsHook();

    act(() =>
      result.current.setOpponents([
        { id: 100, x: 1, z: 2 },
        { id: 101, x: 3, z: 4 },
      ]),
    );
    expect(result.current.opponents).toHaveLength(2);
    expect(result.current.opponents[0].id).toBe(100);
  });
});
