/**
 * @module TacticsExecutionContext
 * @description TacticsExecutionContext の単体テスト
 *
 * テスト方針:
 * - Provider外でフックを使用するとエラーがスローされることを検証
 * - Provider内でフックが正しい値を返すことを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, renderHook } from "@testing-library/react";
import {
  TacticsExecutionProvider,
  useTacticsExecution,
  type TacticsExecutionContextType,
} from "../TacticsExecutionContext";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockValue: TacticsExecutionContextType = {
  tOrch: {} as TacticsExecutionContextType["tOrch"],
  playModePhase: {} as TacticsExecutionContextType["playModePhase"],
  tacticsLoading: false,
  opponentsHook: {} as TacticsExecutionContextType["opponentsHook"],
  ballHook: {} as TacticsExecutionContextType["ballHook"],
  connLines: {} as TacticsExecutionContextType["connLines"],
  playerView: {} as TacticsExecutionContextType["playerView"],
  multiSelect: {} as TacticsExecutionContextType["multiSelect"],
  bgSettings: {} as TacticsExecutionContextType["bgSettings"],
  lineupAnimation: {} as TacticsExecutionContextType["lineupAnimation"],
  sketch: {} as TacticsExecutionContextType["sketch"],
  canvasMemo: {} as TacticsExecutionContextType["canvasMemo"],
  canvasCallbacks: {} as TacticsExecutionContextType["canvasCallbacks"],
  handlePlayerClick: vi.fn(),
  handleOpponentClick: vi.fn(),
  generateFlowchart: vi.fn().mockReturnValue(""),
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

describe("TacticsExecutionContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Provider 外で useTacticsExecution を使うとエラーがスローされる", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onError = vi.fn();
    const Consumer = () => {
      useTacticsExecution();
      return null;
    };

    render(
      <TestErrorBoundary onError={onError}>
        <Consumer />
      </TestErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          "useTacticsExecution must be used within TacticsExecutionProvider",
      }),
    );
    consoleError.mockRestore();
  });

  it("Provider 内で useTacticsExecution が正しい値を返す", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TacticsExecutionProvider value={mockValue}>
        {children}
      </TacticsExecutionProvider>
    );

    const { result } = renderHook(() => useTacticsExecution(), { wrapper });

    expect(result.current.tacticsLoading).toBe(false);
    expect(result.current.handlePlayerClick).toBe(mockValue.handlePlayerClick);
    expect(result.current.handleOpponentClick).toBe(
      mockValue.handleOpponentClick,
    );
    expect(result.current.generateFlowchart).toBe(mockValue.generateFlowchart);
  });
});
