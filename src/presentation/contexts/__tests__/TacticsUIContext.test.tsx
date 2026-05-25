/**
 * @module TacticsUIContext
 * @description TacticsUIContext の単体テスト
 *
 * テスト方針:
 * - Provider外でフックを使用するとエラーがスローされることを検証
 * - Provider内でフックが正しい値を返すことを検証
 * - childrenが正しくレンダリングされることを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import {
  TacticsUIProvider,
  useTacticsUI,
  type TacticsUIContextType,
} from "../TacticsUIContext";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockValue: TacticsUIContextType = {
  ui: {} as TacticsUIContextType["ui"],
  canUndo: true,
  canRedo: false,
  handleUndo: vi.fn(),
  handleRedo: vi.fn(),
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

describe("TacticsUIContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Provider 外で useTacticsUI を使うとエラーがスローされる", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onError = vi.fn();
    const Consumer = () => {
      useTacticsUI();
      return null;
    };

    render(
      <TestErrorBoundary onError={onError}>
        <Consumer />
      </TestErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "useTacticsUI must be used within TacticsUIProvider",
      }),
    );
    consoleError.mockRestore();
  });

  it("Provider 内で useTacticsUI が正しい値を返す", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TacticsUIProvider value={mockValue}>{children}</TacticsUIProvider>
    );

    const { result } = renderHook(() => useTacticsUI(), { wrapper });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.handleUndo).toBe(mockValue.handleUndo);
    expect(result.current.handleRedo).toBe(mockValue.handleRedo);
  });

  it("children が正しくレンダリングされる", () => {
    render(
      <TacticsUIProvider value={mockValue}>
        <div data-testid="child">テスト子要素</div>
      </TacticsUIProvider>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("テスト子要素");
  });
});
