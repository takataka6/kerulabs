/**
 * @module TacticsTeamContext
 * @description TacticsTeamContext の単体テスト
 *
 * テスト方針:
 * - Provider外でフックを使用するとエラーがスローされることを検証
 * - Provider内でフックが正しい値を返すことを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, renderHook } from "@testing-library/react";
import {
  TacticsTeamProvider,
  useTacticsTeam,
  type TacticsTeamContextType,
} from "../TacticsTeamContext";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockValue: TacticsTeamContextType = {
  selectedTeam: {} as TacticsTeamContextType["selectedTeam"],
  currentFormation: {} as TacticsTeamContextType["currentFormation"],
  teams: [],
  teamMgmt: {} as TacticsTeamContextType["teamMgmt"],
  formationMgmt: {} as TacticsTeamContextType["formationMgmt"],
  displayData: {} as TacticsTeamContextType["displayData"],
  cardMgmt: {} as TacticsTeamContextType["cardMgmt"],
  managerEditor: {} as TacticsTeamContextType["managerEditor"],
  handleSquadCardCycle: vi.fn(),
  handleSaveManager: vi.fn(),
  handleCycleManagerCard: vi.fn(),
};

class TestErrorBoundary extends React.Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TacticsTeamContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Provider 外で useTacticsTeam を使うとエラーがスローされる", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onError = vi.fn();
    const Consumer = () => {
      useTacticsTeam();
      return null;
    };

    render(
      <TestErrorBoundary onError={onError}>
        <Consumer />
      </TestErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "useTacticsTeam must be used within TacticsTeamProvider",
      }),
    );
    consoleError.mockRestore();
  });

  it("Provider 内で useTacticsTeam が正しい値を返す", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TacticsTeamProvider value={mockValue}>{children}</TacticsTeamProvider>
    );

    const { result } = renderHook(() => useTacticsTeam(), { wrapper });

    expect(result.current.teams).toEqual([]);
    expect(result.current.handleSquadCardCycle).toBe(
      mockValue.handleSquadCardCycle,
    );
    expect(result.current.handleSaveManager).toBe(mockValue.handleSaveManager);
    expect(result.current.handleCycleManagerCard).toBe(
      mockValue.handleCycleManagerCard,
    );
  });
});
