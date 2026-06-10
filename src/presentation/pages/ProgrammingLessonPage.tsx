/**
 * @module ProgrammingLessonPage
 * @description コードラボレッスンのルーターコンポーネント。URLパラメータに応じたレッスンコンポーネントを表示する。
 */
import { useParams, Navigate } from "react-router-dom";
import { VariablesLesson } from "@presentation/components/code-lab/lessons/VariablesLesson";
import { ArraysLesson } from "@presentation/components/code-lab/lessons/ArraysLesson";
import { ConditionalsLesson } from "@presentation/components/code-lab/lessons/ConditionalsLesson";
import { FunctionsLesson } from "@presentation/components/code-lab/lessons/FunctionsLesson";
import { ObjectsLesson } from "@presentation/components/code-lab/lessons/ObjectsLesson";
import { CleanArchitectureLesson } from "@presentation/components/code-lab/lessons/CleanArchitectureLesson";
import { DomainModelLesson } from "@presentation/components/code-lab/lessons/DomainModelLesson";
import { SingletonLesson } from "@presentation/components/code-lab/lessons/SingletonLesson";
import { FactoryLesson } from "@presentation/components/code-lab/lessons/FactoryLesson";
import { FirstTestLesson } from "@presentation/components/code-lab/lessons/FirstTestLesson";
import { MockTestLesson } from "@presentation/components/code-lab/lessons/MockTestLesson";
import { JSONLesson } from "@presentation/components/code-lab/lessons/JSONLesson";
import { MarkdownLesson } from "@presentation/components/code-lab/lessons/MarkdownLesson";
import { MermaidLesson } from "@presentation/components/code-lab/lessons/MermaidLesson";
import { GitBasicsLesson } from "@presentation/components/code-lab/lessons/GitBasicsLesson";
import { GitBranchLesson } from "@presentation/components/code-lab/lessons/GitBranchLesson";

const LESSONS = {
  variables: VariablesLesson,
  arrays: ArraysLesson,
  conditionals: ConditionalsLesson,
  functions: FunctionsLesson,
  objects: ObjectsLesson,
  "clean-architecture": CleanArchitectureLesson,
  "domain-model": DomainModelLesson,
  singleton: SingletonLesson,
  factory: FactoryLesson,
  "first-test": FirstTestLesson,
  "mock-test": MockTestLesson,
  json: JSONLesson,
  markdown: MarkdownLesson,
  mermaid: MermaidLesson,
  "git-basics": GitBasicsLesson,
  "git-branch": GitBranchLesson,
} satisfies Record<string, React.ComponentType>;

export function ProgrammingLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lessonKey = lessonId as keyof typeof LESSONS | undefined;
  const LessonComponent = lessonKey ? LESSONS[lessonKey] : null;

  if (!LessonComponent) {
    return <Navigate to="/code-lab" replace />;
  }

  return <LessonComponent />;
}
