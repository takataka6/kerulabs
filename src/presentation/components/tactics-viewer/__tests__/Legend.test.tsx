/**
 * @module Legend コンポーネント
 * @description 凡例（レジェンド）コンポーネントの単体テスト
 *
 * テスト方針:
 * - 翻訳関数をvi.fnでモック化
 * - チームカラー・選手情報・相手マーカーの凡例表示を検証
 * - データ有無による表示切替を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Legend } from "../Legend";
import type { ColorsData, Opponent } from "../types";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

const defaultColors: ColorsData = {
  gk: "#FFFF00",
  df: "#1E90FF",
  mf: "#32CD32",
  fw: "#FF4500",
};

function renderLegend(
  overrides: Partial<React.ComponentProps<typeof Legend>> = {},
) {
  const props = {
    colorsData: defaultColors,
    opponents: [] as Opponent[],
    captureMode: false,
    t: mockT,
    ...overrides,
  };
  return { ...render(<Legend {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("Legend", () => {
  it("自チームラベルが表示される", () => {
    renderLegend();
    expect(screen.getByText("tactics.legend.myTeam")).toBeInTheDocument();
  });

  it("自チームの色が適用される", () => {
    const { container } = renderLegend();
    const dot = container.querySelector(
      '[style*="background-color"]',
    ) as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.style.backgroundColor).toBeTruthy();
  });

  it("相手チームがない場合、相手ラベルは表示されない", () => {
    renderLegend({ opponents: [] });
    expect(
      screen.queryByText("tactics.legend.opponent"),
    ).not.toBeInTheDocument();
  });

  it("相手チームがある場合、相手ラベルが表示される", () => {
    const opponents: Opponent[] = [{ id: 1, x: 0, z: 0, color: "#FF0000" }];
    renderLegend({ opponents });
    expect(screen.getByText("tactics.legend.opponent")).toBeInTheDocument();
  });

  it("相手チームの色が適用される", () => {
    const opponents: Opponent[] = [{ id: 1, x: 0, z: 0, color: "#FF0000" }];
    const { container } = renderLegend({ opponents });
    const dots = container.querySelectorAll('[style*="background-color"]');
    // 2つの色ドット（自チーム + 相手）
    expect(dots.length).toBe(2);
  });

  it("captureMode で hidden クラスが適用される", () => {
    const { container } = renderLegend({ captureMode: true });
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("hidden");
  });

  it("通常モードで hidden クラスが適用されない", () => {
    const { container } = renderLegend({ captureMode: false });
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("hidden");
  });
});
