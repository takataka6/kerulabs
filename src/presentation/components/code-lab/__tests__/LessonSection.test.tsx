/**
 * @module LessonSection コンポーネント
 * @description レッスンカテゴリセクションの単体テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonSection } from "../LessonSection";
import type { Lesson } from "../LessonCard";

const mockT = vi.fn((key: string) => key);

const createLessons = (): Lesson[] => [
  {
    id: "variables",
    number: 1,
    title: "変数",
    description: "変数について",
    icon: "🏷️",
    gradient: "from-emerald-600 to-teal-500",
    available: true,
  },
  {
    id: "arrays",
    number: 2,
    title: "配列",
    description: "配列について",
    icon: "👥",
    gradient: "from-sky-600 to-blue-500",
    available: true,
  },
];

describe("LessonSection", () => {
  const defaultProps = {
    titleKey: "code.lab.category.programmingBasics" as const,
    lessons: createLessons(),
    indexOffset: 0,
    hoveredCard: null as string | null,
    onHover: vi.fn(),
    onLeave: vi.fn(),
    onClick: vi.fn(),
    comingSoonLabel: "Coming Soon",
    t: mockT,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("カテゴリタイトルが表示される", () => {
    render(<LessonSection {...defaultProps} />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "code.lab.category.programmingBasics",
      }),
    ).toBeInTheDocument();
  });

  it("説明キーが指定された場合に説明が表示される", () => {
    render(
      <LessonSection
        {...defaultProps}
        descriptionKey={
          "code.lab.category.programmingBasics.description" as const
        }
      />,
    );
    expect(
      screen.getByText("code.lab.category.programmingBasics.description"),
    ).toBeInTheDocument();
  });

  it("説明キーが未指定の場合は説明が表示されない", () => {
    const { container } = render(<LessonSection {...defaultProps} />);
    // セクションヘッダーの直下(.mb-6)に p 要素がないことを検証
    const headerDiv = container.querySelector("section > .mb-6");
    const paragraphs = headerDiv?.querySelectorAll("p");
    expect(paragraphs).toHaveLength(0);
  });

  it("レッスンカードが表示される", () => {
    render(<LessonSection {...defaultProps} />);
    expect(screen.getByText("変数")).toBeInTheDocument();
    expect(screen.getByText("配列")).toBeInTheDocument();
  });

  it("レッスンカードをクリックすると onClick が呼ばれる", () => {
    render(<LessonSection {...defaultProps} />);
    fireEvent.click(screen.getByText("変数"));
    expect(defaultProps.onClick).toHaveBeenCalledWith("variables");
  });

  it("indexOffset が正しくカードに適用される", () => {
    render(<LessonSection {...defaultProps} indexOffset={5} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].style.animationDelay).toBe("500ms");
    expect(buttons[1].style.animationDelay).toBe("600ms");
  });

  it("カスタム className が適用される", () => {
    const { container } = render(
      <LessonSection {...defaultProps} className="custom-mb" />,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("custom-mb");
  });
});
