/**
 * @module ProgrammingLessonPage
 * @description ProgrammingLessonPage の単体テスト
 *
 * テスト方針:
 * - react-router-dom をモック化し useParams / Navigate を制御
 * - 各レッスンコンポーネントをシンプルな div でモック化
 * - 有効/無効な lessonId に応じた表示切り替えを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { ProgrammingLessonPage } from "../ProgrammingLessonPage";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate" data-to={to} />
  ),
}));

function stubLesson(name: string) {
  return { [name]: () => <div data-testid={`lesson-${name}`}>{name}</div> };
}

vi.mock("@presentation/components/code-lab/lessons/VariablesLesson", () =>
  stubLesson("VariablesLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/ArraysLesson", () =>
  stubLesson("ArraysLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/ConditionalsLesson", () =>
  stubLesson("ConditionalsLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/FunctionsLesson", () =>
  stubLesson("FunctionsLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/ObjectsLesson", () =>
  stubLesson("ObjectsLesson"),
);
vi.mock(
  "@presentation/components/code-lab/lessons/CleanArchitectureLesson",
  () => stubLesson("CleanArchitectureLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/DomainModelLesson", () =>
  stubLesson("DomainModelLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/SingletonLesson", () =>
  stubLesson("SingletonLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/FactoryLesson", () =>
  stubLesson("FactoryLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/FirstTestLesson", () =>
  stubLesson("FirstTestLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/MockTestLesson", () =>
  stubLesson("MockTestLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/UITestLesson", () =>
  stubLesson("UITestLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/JSONLesson", () =>
  stubLesson("JSONLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/MarkdownLesson", () =>
  stubLesson("MarkdownLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/MermaidLesson", () =>
  stubLesson("MermaidLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/GitBasicsLesson", () =>
  stubLesson("GitBasicsLesson"),
);
vi.mock("@presentation/components/code-lab/lessons/GitBranchLesson", () =>
  stubLesson("GitBranchLesson"),
);

const mockUseParams = vi.mocked(useParams);

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("ProgrammingLessonPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["variables", "VariablesLesson"],
    ["arrays", "ArraysLesson"],
    ["conditionals", "ConditionalsLesson"],
  ])(
    "有効なlessonId「%s」で対応するレッスンコンポーネントがレンダリングされる",
    async (lessonId, componentName) => {
      mockUseParams.mockReturnValue({ lessonId });

      render(<ProgrammingLessonPage />);

      expect(
        await screen.findByTestId(`lesson-${componentName}`),
      ).toBeInTheDocument();
    },
  );

  it("無効なlessonIdでcode-labにリダイレクトされる", () => {
    mockUseParams.mockReturnValue({ lessonId: "nonexistent-lesson" });

    render(<ProgrammingLessonPage />);

    const navigate = screen.getByTestId("navigate");
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute("data-to", "/code-lab");
  });

  it("lessonIdが未定義の場合リダイレクトされる", () => {
    mockUseParams.mockReturnValue({});

    render(<ProgrammingLessonPage />);

    const navigate = screen.getByTestId("navigate");
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute("data-to", "/code-lab");
  });
});
