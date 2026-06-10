/**
 * @module LessonLayout コンポーネント
 * @description レッスンレイアウトコンポーネントの単体テスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonLayout } from "../LessonLayout";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock("@shared/constants", () => ({
  IS_ELECTRON: false,
}));

describe("LessonLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("children が正しくレンダリングされる", () => {
    render(
      <LessonLayout lessonId="arrays">
        <div data-testid="child-content">テスト内容</div>
      </LessonLayout>,
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("テスト内容")).toBeInTheDocument();
  });

  it("「戻る」ボタンが表示される", () => {
    render(
      <LessonLayout lessonId="arrays">
        <div>content</div>
      </LessonLayout>,
    );
    expect(
      screen.getByLabelText("code.lab.lesson.backToList"),
    ).toBeInTheDocument();
  });

  it("最初のレッスンでは「前へ」ボタンが表示されない", () => {
    render(
      <LessonLayout lessonId="variables">
        <div>content</div>
      </LessonLayout>,
    );
    expect(
      screen.queryByText(/code\.lab\.lesson\.prevLesson/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/code\.lab\.lesson\.nextLesson/),
    ).toBeInTheDocument();
  });

  it("最後のレッスンでは「次へ」ボタンが表示されない", () => {
    render(
      <LessonLayout lessonId="mock-test">
        <div>content</div>
      </LessonLayout>,
    );
    expect(
      screen.getByText(/code\.lab\.lesson\.prevLesson/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/code\.lab\.lesson\.nextLesson/),
    ).not.toBeInTheDocument();
  });

  it("中間のレッスンでは前後のナビゲーションが表示される", () => {
    render(
      <LessonLayout lessonId="objects">
        <div>content</div>
      </LessonLayout>,
    );
    expect(
      screen.getByText(/code\.lab\.lesson\.prevLesson/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/code\.lab\.lesson\.nextLesson/),
    ).toBeInTheDocument();
  });

  it("「戻る」ボタンをクリックすると /code-lab に遷移する", () => {
    render(
      <LessonLayout lessonId="arrays">
        <div>content</div>
      </LessonLayout>,
    );
    fireEvent.click(screen.getByLabelText("code.lab.lesson.backToList"));
    expect(mockNavigate).toHaveBeenCalledWith("/code-lab");
  });

  it("「次へ」ボタンをクリックすると次のレッスンに遷移する", () => {
    render(
      <LessonLayout lessonId="arrays">
        <div>content</div>
      </LessonLayout>,
    );
    fireEvent.click(screen.getByText(/code\.lab\.lesson\.nextLesson/));
    expect(mockNavigate).toHaveBeenCalledWith("/code-lab/lesson/conditionals");
  });

  it("「前へ」ボタンをクリックすると前のレッスンに遷移する", () => {
    render(
      <LessonLayout lessonId="arrays">
        <div>content</div>
      </LessonLayout>,
    );
    fireEvent.click(screen.getByText(/code\.lab\.lesson\.prevLesson/));
    expect(mockNavigate).toHaveBeenCalledWith("/code-lab/lesson/variables");
  });
});
