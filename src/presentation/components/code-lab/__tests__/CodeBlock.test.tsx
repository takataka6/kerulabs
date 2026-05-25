/**
 * @module CodeBlock コンポーネント
 * @description コードブロック表示コンポーネントの単体テスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodeBlock } from "../CodeBlock";

describe("CodeBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("コードが行ごとに表示される", () => {
    render(<CodeBlock code={"const a = 1;\nconst b = 2;"} />);
    expect(screen.getByText("const a = 1;")).toBeInTheDocument();
    expect(screen.getByText("const b = 2;")).toBeInTheDocument();
  });

  it("行番号が表示される", () => {
    render(<CodeBlock code={"line1\nline2\nline3"} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("ハイライト行にCSSクラスが適用される", () => {
    render(<CodeBlock code={"line1\nline2\nline3"} highlightLines={[2]} />);
    const highlightedLine = screen.getByText("line2").closest("div");
    expect(highlightedLine?.className).toContain("bg-blue-500/15");
    expect(highlightedLine?.className).toContain("border-blue-400");
  });

  it("highlightLinesが未指定の場合はハイライトなし", () => {
    render(<CodeBlock code={"line1\nline2"} />);
    const line1 = screen.getByText("line1").closest("div");
    const line2 = screen.getByText("line2").closest("div");
    expect(line1?.className).not.toContain("bg-blue-500/15");
    expect(line2?.className).not.toContain("bg-blue-500/15");
  });

  it("空のコードが正しく表示される", () => {
    const { container } = render(<CodeBlock code="" />);
    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("複数行のコードが正しく分割される", () => {
    const code = "a\nb\nc\nd\ne";
    render(<CodeBlock code={code} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
    expect(screen.getByText("d")).toBeInTheDocument();
    expect(screen.getByText("e")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
