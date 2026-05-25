/**
 * @module LessonCard コンポーネント
 * @description レッスンカードの単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonCard } from "../LessonCard";
import type { Lesson } from "../LessonCard";

const createLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: "variables",
  number: 1,
  title: "変数と型",
  description: "変数の使い方を学びます",
  icon: "🏷️",
  gradient: "from-emerald-600 to-teal-500",
  available: true,
  ...overrides,
});

describe("LessonCard", () => {
  const defaultProps = {
    index: 0,
    hoveredCard: null as string | null,
    onHover: vi.fn(),
    onLeave: vi.fn(),
    onClick: vi.fn(),
    comingSoonLabel: "Coming Soon",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タイトルと説明が表示される", () => {
    render(<LessonCard lesson={createLesson()} {...defaultProps} />);
    expect(screen.getByText("変数と型")).toBeInTheDocument();
    expect(screen.getByText("変数の使い方を学びます")).toBeInTheDocument();
  });

  it("レッスン番号が表示される", () => {
    render(
      <LessonCard lesson={createLesson({ number: 3 })} {...defaultProps} />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("利用可能なレッスンをクリックすると onClick が呼ばれる", () => {
    render(<LessonCard lesson={createLesson()} {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onClick).toHaveBeenCalledWith("variables");
  });

  it("利用不可のレッスンは disabled になる", () => {
    render(
      <LessonCard
        lesson={createLesson({ available: false })}
        {...defaultProps}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("利用不可のレッスンは Coming Soon を表示する", () => {
    render(
      <LessonCard
        lesson={createLesson({ available: false })}
        {...defaultProps}
      />,
    );
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("利用可能なレッスンは Ready を表示する", () => {
    render(<LessonCard lesson={createLesson()} {...defaultProps} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("マウスホバーで onHover が呼ばれる", () => {
    render(<LessonCard lesson={createLesson()} {...defaultProps} />);
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(defaultProps.onHover).toHaveBeenCalledWith("variables");
  });

  it("マウスリーブで onLeave が呼ばれる", () => {
    render(<LessonCard lesson={createLesson()} {...defaultProps} />);
    fireEvent.mouseLeave(screen.getByRole("button"));
    expect(defaultProps.onLeave).toHaveBeenCalled();
  });

  it("アニメーション遅延が index に基づいて設定される", () => {
    render(<LessonCard lesson={createLesson()} {...defaultProps} index={3} />);
    const button = screen.getByRole("button");
    expect(button.style.animationDelay).toBe("300ms");
  });

  it("アイコンに aria-hidden が設定されている", () => {
    const { container } = render(
      <LessonCard lesson={createLesson()} {...defaultProps} />,
    );
    const hiddenIcon = container.querySelector('[aria-hidden="true"]');
    expect(hiddenIcon?.textContent).toBe("🏷️");
  });
});
