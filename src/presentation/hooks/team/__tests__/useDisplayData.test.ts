/**
 * @module useDisplayData フック
 * @description チーム表示データ変換フックの単体テスト
 *
 * テスト方針:
 * - モック不要（純粋なデータ変換ロジック）
 * - Team / Formation / Player からフォーメーション表示用データへの変換を検証
 * - スカッド選択時のプレイヤー並び替えと位置マッピングを検証
 * - チーム/フォーメーション未選択時のフォールバック動作を検証
 */
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDisplayData } from "../useDisplayData";
import type { Team } from "@domain/entities/Team";
import type { Formation } from "@domain/entities/Formation";
import type { Player } from "@domain/entities/Player";
import type { FormationDataItem } from "@presentation/components/tactics-viewer";

const mockTeam = {
  name: "Test FC",
  colors: {
    main: { toHex: () => "#FF0000" },
    gk: { toHex: () => "#00FF00" },
  },
} as unknown as Team;

const mockFormation = {
  name: "4-4-2",
  positions: [
    { pos: "GK", position: { x: 0, z: 0 }, category: "gk" },
    { pos: "CB", position: { x: 0, z: 0 }, category: "df" },
  ],
} as unknown as Formation;

const mockPlayer: Player = {
  name: "Taro Yamada",
  number: 10,
  imageUrl: undefined,
  mainVisualImageUrl: undefined,
} as unknown as Player;

const mockFormationData: FormationDataItem[] = [
  { pos: "gk", x: 0, z: 0, cat: "gk" },
  { pos: "cb", x: 0, z: 0, cat: "df" },
];

const defaultParams = {
  selectedTeam: undefined as Team | undefined,
  currentFormation: undefined as Formation | undefined,
  customSquad: [] as (Player | null)[],
  showSquadBuilder: false,
  formationData: mockFormationData,
  managerInput: "",
};

describe("useDisplayData", () => {
  it('selectedTeam が undefined の場合、colorsData は全て "#000000"', () => {
    const { result } = renderHook(() =>
      useDisplayData({ ...defaultParams, selectedTeam: undefined }),
    );

    expect(result.current.colorsData).toEqual({
      gk: "#000000",
      df: "#000000",
      mf: "#000000",
      fw: "#000000",
    });
  });

  it("selectedTeam がある場合、colorsData にチームカラーを反映", () => {
    const { result } = renderHook(() =>
      useDisplayData({ ...defaultParams, selectedTeam: mockTeam }),
    );

    expect(result.current.colorsData).toEqual({
      gk: "#00FF00",
      df: "#FF0000",
      mf: "#FF0000",
      fw: "#FF0000",
    });
  });

  it("currentFormation が undefined の場合、playersData は空配列", () => {
    const { result } = renderHook(() =>
      useDisplayData({ ...defaultParams, currentFormation: undefined }),
    );

    expect(result.current.playersData).toEqual([]);
  });

  it("showSquadBuilder が true の場合、ポジション名を表示", () => {
    const { result } = renderHook(() =>
      useDisplayData({
        ...defaultParams,
        currentFormation: mockFormation,
        customSquad: [mockPlayer, null],
        showSquadBuilder: true,
      }),
    );

    expect(result.current.playersData[0].name).toBe("GK");
    expect(result.current.playersData[1].name).toBe("CB");
  });

  it("lineupTeamInfo にチーム名とフォーメーション名が含まれる", () => {
    const { result } = renderHook(() =>
      useDisplayData({
        ...defaultParams,
        selectedTeam: mockTeam,
        currentFormation: mockFormation,
        customSquad: [mockPlayer, null],
      }),
    );

    expect(result.current.lineupTeamInfo.teamName).toBe("Test FC");
    expect(result.current.lineupTeamInfo.formationName).toBe("4-4-2");
  });
});
