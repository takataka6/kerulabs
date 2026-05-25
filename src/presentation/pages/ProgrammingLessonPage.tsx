/**
 * @module ProgrammingLessonPage
 * @description コードラボレッスンのルーターコンポーネント。URLパラメータに応じたレッスンコンポーネントを表示する。
 */
import { lazy, Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";

const LESSONS = {
  variables: lazy(() =>
    import("@presentation/components/code-lab/lessons/VariablesLesson").then(
      ({ VariablesLesson }) => ({ default: VariablesLesson }),
    ),
  ),
  arrays: lazy(() =>
    import("@presentation/components/code-lab/lessons/ArraysLesson").then(
      ({ ArraysLesson }) => ({ default: ArraysLesson }),
    ),
  ),
  conditionals: lazy(() =>
    import("@presentation/components/code-lab/lessons/ConditionalsLesson").then(
      ({ ConditionalsLesson }) => ({ default: ConditionalsLesson }),
    ),
  ),
  functions: lazy(() =>
    import("@presentation/components/code-lab/lessons/FunctionsLesson").then(
      ({ FunctionsLesson }) => ({ default: FunctionsLesson }),
    ),
  ),
  objects: lazy(() =>
    import("@presentation/components/code-lab/lessons/ObjectsLesson").then(
      ({ ObjectsLesson }) => ({ default: ObjectsLesson }),
    ),
  ),
  "clean-architecture": lazy(() =>
    import("@presentation/components/code-lab/lessons/CleanArchitectureLesson").then(
      ({ CleanArchitectureLesson }) => ({
        default: CleanArchitectureLesson,
      }),
    ),
  ),
  "domain-model": lazy(() =>
    import("@presentation/components/code-lab/lessons/DomainModelLesson").then(
      ({ DomainModelLesson }) => ({ default: DomainModelLesson }),
    ),
  ),
  singleton: lazy(() =>
    import("@presentation/components/code-lab/lessons/SingletonLesson").then(
      ({ SingletonLesson }) => ({ default: SingletonLesson }),
    ),
  ),
  factory: lazy(() =>
    import("@presentation/components/code-lab/lessons/FactoryLesson").then(
      ({ FactoryLesson }) => ({ default: FactoryLesson }),
    ),
  ),
  "first-test": lazy(() =>
    import("@presentation/components/code-lab/lessons/FirstTestLesson").then(
      ({ FirstTestLesson }) => ({ default: FirstTestLesson }),
    ),
  ),
  "mock-test": lazy(() =>
    import("@presentation/components/code-lab/lessons/MockTestLesson").then(
      ({ MockTestLesson }) => ({ default: MockTestLesson }),
    ),
  ),
  "ui-test": lazy(() =>
    import("@presentation/components/code-lab/lessons/UITestLesson").then(
      ({ UITestLesson }) => ({ default: UITestLesson }),
    ),
  ),
  json: lazy(() =>
    import("@presentation/components/code-lab/lessons/JSONLesson").then(
      ({ JSONLesson }) => ({ default: JSONLesson }),
    ),
  ),
  markdown: lazy(() =>
    import("@presentation/components/code-lab/lessons/MarkdownLesson").then(
      ({ MarkdownLesson }) => ({ default: MarkdownLesson }),
    ),
  ),
  mermaid: lazy(() =>
    import("@presentation/components/code-lab/lessons/MermaidLesson").then(
      ({ MermaidLesson }) => ({ default: MermaidLesson }),
    ),
  ),
  "git-basics": lazy(() =>
    import("@presentation/components/code-lab/lessons/GitBasicsLesson").then(
      ({ GitBasicsLesson }) => ({ default: GitBasicsLesson }),
    ),
  ),
  "git-branch": lazy(() =>
    import("@presentation/components/code-lab/lessons/GitBranchLesson").then(
      ({ GitBranchLesson }) => ({ default: GitBranchLesson }),
    ),
  ),
} satisfies Record<string, React.ComponentType>;

function LessonLoader() {
  return (
    <div
      className="flex min-h-[240px] items-center justify-center text-sm text-slate-400"
      role="status"
      aria-live="polite"
    >
      Loading lesson...
    </div>
  );
}

export function ProgrammingLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lessonKey = lessonId as keyof typeof LESSONS | undefined;
  const LessonComponent = lessonKey ? LESSONS[lessonKey] : null;

  if (!LessonComponent) {
    return <Navigate to="/code-lab" replace />;
  }

  return (
    <Suspense fallback={<LessonLoader />}>
      <LessonComponent />
    </Suspense>
  );
}
