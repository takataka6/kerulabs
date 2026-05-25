/**
 * @module ConnectionLinesButton コンポーネント
 * @description 接続線描画ボタンの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 描画モードのトグルとアクティブ状態の表示を検証
 * - クリック時のコールバック呼び出しを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConnectionLinesButton } from "../right-controls/ConnectionLinesButton";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createConnLines(overrides = {}) {
  return {
    lineDrawingMode: false,
    connectionLines: [],
    lineColor: "#22d3ee",
    toggleLineDrawing: vi.fn(),
    clearConnectionLines: vi.fn(),
    setLineColor: vi.fn(),
    ...overrides,
  } as never;
}

function renderButton(overrides = {}) {
  const props = {
    connLines: createConnLines(),
    t: mockT,
    ...overrides,
  };
  return render(<ConnectionLinesButton {...props} />);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("ConnectionLinesButton", () => {
  it("接続線ボタンを描画する", () => {
    renderButton();

    expect(
      screen.getByRole("button", { name: "tactics.connectionLines" }),
    ).toBeInTheDocument();
  });

  it("ボタンをクリックすると toggleLineDrawing が呼ばれる", () => {
    const toggleLineDrawing = vi.fn();
    const connLines = createConnLines({ toggleLineDrawing });
    renderButton({ connLines });

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.connectionLines" }),
    );
    expect(toggleLineDrawing).toHaveBeenCalledOnce();
  });

  it("接続線がある場合にバッジとクリアボタンを表示する", () => {
    const connLines = createConnLines({
      connectionLines: [{ id: "1" }, { id: "2" }],
    });
    renderButton({ connLines });

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "tactics.connectionLines.clear" }),
    ).toBeInTheDocument();
  });

  it("lineDrawingMode=true の場合にカラーパレットを表示する", () => {
    const connLines = createConnLines({ lineDrawingMode: true });
    renderButton({ connLines });

    // 6 色のカラーボタン
    const colorButtons = screen.getAllByRole("button");
    // toggle button + 6 color buttons
    expect(colorButtons.length).toBeGreaterThanOrEqual(7);
  });

  it("カラーボタンをクリックすると setLineColor が呼ばれる", () => {
    const setLineColor = vi.fn();
    const connLines = createConnLines({
      lineDrawingMode: true,
      setLineColor,
    });
    const { container } = renderButton({ connLines });

    // Red color button (background-color: #ef4444)
    const colorButtons = container.querySelectorAll(
      "button[style*='background-color']",
    );
    // 2番目のカラーボタン（Red）をクリック
    const redButton = Array.from(colorButtons).find(
      (btn) =>
        (btn as HTMLElement).style.backgroundColor === "rgb(239, 68, 68)",
    );
    expect(redButton).toBeDefined();
    fireEvent.click(redButton!);
    expect(setLineColor).toHaveBeenCalledWith("#ef4444");
  });
});
