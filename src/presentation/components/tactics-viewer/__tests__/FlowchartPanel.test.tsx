/**
 * @module FlowchartPanel コンポーネント
 * @description フローチャートパネルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - Mermaidフローチャートの表示エリアとコピーボタンを検証
 * - フローチャートデータの表示を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlowchartPanel } from "../FlowchartPanel";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@presentation/components/ui", () => ({
  MermaidFlowchart: ({
    chart,
    className,
  }: {
    chart: string;
    className?: string;
  }) => (
    <div data-testid="mermaid-flowchart" className={className}>
      {chart}
    </div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function renderFlowchartPanel(
  overrides: Partial<React.ComponentProps<typeof FlowchartPanel>> = {},
) {
  const props = {
    chartContent: "graph TD\nA-->B",
    onClose: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return { ...render(<FlowchartPanel {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("FlowchartPanel", () => {
  it("タイトルが表示される", () => {
    renderFlowchartPanel();
    expect(screen.getByText("tactics.tacticsFlow")).toBeInTheDocument();
  });

  it("チャートコンテンツが MermaidFlowchart に渡される", () => {
    renderFlowchartPanel({ chartContent: "graph LR\nX-->Y" });

    const chart = screen.getByTestId("mermaid-flowchart");
    expect(chart.textContent).toBe("graph LR\nX-->Y");
  });

  it("閉じるボタンクリックで onClose が呼ばれる", () => {
    const { onClose } = renderFlowchartPanel();

    const closeButton = screen.getByLabelText("a11y.closePanel");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("コンテンツ領域に region role と aria-label が設定される", () => {
    renderFlowchartPanel();

    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-label", "tactics.tacticsFlow");
  });

  it("📊 アイコンが表示される", () => {
    renderFlowchartPanel();
    expect(screen.getByText("📊")).toBeInTheDocument();
  });
});
