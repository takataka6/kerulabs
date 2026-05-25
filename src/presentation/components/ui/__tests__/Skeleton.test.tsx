/**
 * @module Skeleton コンポーネント
 * @description スケルトンローディングUIの単体テスト
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardListSkeleton } from "../Skeleton";

describe("CardListSkeleton", () => {
  it("デフォルトで4つのスケルトンカードを表示する", () => {
    render(<CardListSkeleton />);
    const container = screen.getByRole("status");
    expect(container).toBeInTheDocument();
    expect(container.children).toHaveLength(4);
  });

  it("指定した数のスケルトンカードを表示する", () => {
    render(<CardListSkeleton count={2} />);
    const container = screen.getByRole("status");
    expect(container.children).toHaveLength(2);
  });

  it("aria-label が設定されている", () => {
    render(<CardListSkeleton />);
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
  });
});
