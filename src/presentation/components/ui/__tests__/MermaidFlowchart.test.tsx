/**
 * @module MermaidFlowchart コンポーネント
 * @description Mermaidフローチャートレンダリングの単体テスト
 *
 * テスト方針:
 * - chartプロパティの空/非空による描画制御を検証
 * - mermaid.render の呼び出しを検証
 * - レンダリングエラー時のフォールバック表示を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MermaidFlowchart } from "../MermaidFlowchart";

// Mock mermaid
const mockRender = vi.fn();
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: mockRender,
  },
}));

// Mock DOMPurify
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// Mock logger
vi.mock("@shared/logger", () => ({
  getLogger: () => ({ warn: vi.fn() }),
}));

// Mock crypto.randomUUID
vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });

describe("MermaidFlowchart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chartが空の場合は何もレンダリングしない", () => {
    const { container } = render(<MermaidFlowchart chart="" />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("chartが指定された場合にmermaid.renderが呼ばれる", async () => {
    mockRender.mockResolvedValue({ svg: "<svg>test</svg>" });
    render(<MermaidFlowchart chart="graph TD; A-->B;" />);
    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledWith(
        "mermaid-test-uuid",
        "graph TD; A-->B;",
      );
    });
  });

  it("レンダリングエラー時にエラーメッセージが表示される", async () => {
    mockRender.mockRejectedValue(new Error("Parse error"));
    render(<MermaidFlowchart chart="invalid chart" />);
    await waitFor(() => {
      expect(screen.getByText("Syntax Error")).toBeInTheDocument();
    });
    expect(screen.getByText("Parse error")).toBeInTheDocument();
  });

  it("classNameが適用される", () => {
    const { container } = render(
      <MermaidFlowchart chart="" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("SVGコンテンツが表示される", async () => {
    mockRender.mockResolvedValue({
      svg: '<svg data-testid="mermaid-svg">flowchart</svg>',
    });
    render(<MermaidFlowchart chart="graph TD; A-->B;" />);
    await waitFor(() => {
      expect(screen.getByTestId("mermaid-svg")).toBeInTheDocument();
    });
  });
});
