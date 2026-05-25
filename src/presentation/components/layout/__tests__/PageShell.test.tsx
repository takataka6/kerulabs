/**
 * @module PageShell コンポーネント
 * @description ページ共通シェルレイアウトの単体テスト
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageShell } from "../PageShell";

vi.mock("@shared/constants", () => ({ IS_ELECTRON: false }));

describe("PageShell", () => {
  it("children を表示する", () => {
    render(<PageShell>テストコンテンツ</PageShell>);
    expect(screen.getByText("テストコンテンツ")).toBeInTheDocument();
  });

  it("main 要素に id='main-content' がある", () => {
    render(<PageShell>内容</PageShell>);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("main 要素に tabIndex=-1 がある", () => {
    render(<PageShell>内容</PageShell>);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("デフォルトで2つの背景オーブが表示される", () => {
    const { container } = render(<PageShell>内容</PageShell>);
    const orbs = container.querySelectorAll('[aria-hidden="true"] > div');
    expect(orbs).toHaveLength(2);
  });

  it("backgroundOrbs を空にすると背景が非表示になる", () => {
    const { container } = render(
      <PageShell backgroundOrbs={[]}>内容</PageShell>,
    );
    const ariaHidden = container.querySelector('[aria-hidden="true"]');
    expect(ariaHidden).toBeNull();
  });

  it("カスタム backgroundOrbs を指定できる", () => {
    const { container } = render(
      <PageShell
        backgroundOrbs={[
          { color: "bg-red-500/10", position: "top-left" },
          { color: "bg-green-500/10", position: "bottom-right" },
          { color: "bg-blue-500/10", position: "center" },
        ]}
      >
        内容
      </PageShell>,
    );
    const orbs = container.querySelectorAll('[aria-hidden="true"] > div');
    expect(orbs).toHaveLength(3);
  });

  it("className を追加できる", () => {
    render(<PageShell className="custom-class">内容</PageShell>);
    const main = screen.getByRole("main");
    expect(main.className).toContain("custom-class");
  });

  it("overlay が表示される", () => {
    render(<PageShell overlay={<div>オーバーレイ</div>}>内容</PageShell>);
    expect(screen.getByText("オーバーレイ")).toBeInTheDocument();
  });

  it("contentClassName でコンテンツラッパーのクラスを上書きできる", () => {
    const { container } = render(
      <PageShell contentClassName="custom-content">内容</PageShell>,
    );
    const contentWrapper = container.querySelector(".custom-content");
    expect(contentWrapper).toBeInTheDocument();
    expect(contentWrapper?.textContent).toBe("内容");
  });
});
