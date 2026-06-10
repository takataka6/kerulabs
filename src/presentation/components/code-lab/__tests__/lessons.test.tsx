/**
 * @module Lessons スモークテスト
 * @description 全レッスンコンポーネントがクラッシュせずにレンダリングされることを確認する
 */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({ t: (key: string) => key, language: "ja" }),
}));

vi.mock("@shared/constants", () => ({
  IS_ELECTRON: false,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: () => null,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("../DemoCanvas", () => ({
  DemoCanvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-demo-canvas">{stripThreeElements(children)}</div>
  ),
}));

vi.mock("../MiniPitch", () => ({
  MiniPitch: () => <div data-testid="mock-mini-pitch" />,
}));

vi.mock("../PlayerMarker", () => ({
  PlayerMarker: () => <div data-testid="mock-player-marker" />,
}));

vi.mock("@presentation/components/ui", () => ({
  MermaidFlowchart: ({ chart }: { chart: string }) => (
    <div data-testid="mock-mermaid">{chart}</div>
  ),
}));

const THREE_INTRINSICS = new Set([
  "bufferAttribute",
  "bufferGeometry",
  "circleGeometry",
  "line",
  "mesh",
  "meshBasicMaterial",
  "meshStandardMaterial",
  "ringGeometry",
]);

function stripThreeElements(node: React.ReactNode): React.ReactNode {
  return React.Children.map(node, (child) => {
    if (!React.isValidElement(child)) return child;
    if (typeof child.type === "string" && THREE_INTRINSICS.has(child.type)) {
      return null;
    }
    return React.cloneElement(
      child,
      undefined,
      stripThreeElements(child.props.children),
    );
  });
}

import { ArraysLesson } from "../lessons/ArraysLesson";
import { CleanArchitectureLesson } from "../lessons/CleanArchitectureLesson";
import { ConditionalsLesson } from "../lessons/ConditionalsLesson";
import { DomainModelLesson } from "../lessons/DomainModelLesson";
import { FactoryLesson } from "../lessons/FactoryLesson";
import { FirstTestLesson } from "../lessons/FirstTestLesson";
import { FunctionsLesson } from "../lessons/FunctionsLesson";
import { GitBasicsLesson } from "../lessons/GitBasicsLesson";
import { GitBranchLesson } from "../lessons/GitBranchLesson";
import { JSONLesson } from "../lessons/JSONLesson";
import { MarkdownLesson } from "../lessons/MarkdownLesson";
import { MermaidLesson } from "../lessons/MermaidLesson";
import { MockTestLesson } from "../lessons/MockTestLesson";
import { ObjectsLesson } from "../lessons/ObjectsLesson";
import { SingletonLesson } from "../lessons/SingletonLesson";
import { VariablesLesson } from "../lessons/VariablesLesson";

const lessons = [
  { name: "ArraysLesson", Component: ArraysLesson },
  { name: "CleanArchitectureLesson", Component: CleanArchitectureLesson },
  { name: "ConditionalsLesson", Component: ConditionalsLesson },
  { name: "DomainModelLesson", Component: DomainModelLesson },
  { name: "FactoryLesson", Component: FactoryLesson },
  { name: "FirstTestLesson", Component: FirstTestLesson },
  { name: "FunctionsLesson", Component: FunctionsLesson },
  { name: "GitBasicsLesson", Component: GitBasicsLesson },
  { name: "GitBranchLesson", Component: GitBranchLesson },
  { name: "JSONLesson", Component: JSONLesson },
  { name: "MarkdownLesson", Component: MarkdownLesson },
  { name: "MermaidLesson", Component: MermaidLesson },
  { name: "MockTestLesson", Component: MockTestLesson },
  { name: "ObjectsLesson", Component: ObjectsLesson },
  { name: "SingletonLesson", Component: SingletonLesson },
  { name: "VariablesLesson", Component: VariablesLesson },
] as const;

describe("Lessons スモークテスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(lessons)(
    "$name がクラッシュせずにレンダリングされる",
    ({ Component }) => {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    },
  );
});
