/**
 * @module LessonSectionRenderer
 * @description プラグインレッスンのJSONセクション定義をReactコンポーネントに変換するレンダラー。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { CodeBlock } from "../CodeBlock";
import { DemoCanvas } from "../DemoCanvas";
import { MiniPitch } from "../MiniPitch";
import { PlayerMarker } from "../PlayerMarker";
import { useCompact } from "./CompactModeContext";

import { MermaidFlowchart } from "@presentation/components/ui/MermaidFlowchart";
import type {
  LessonSection,
  I18nText,
  HeadingSection,
  ParagraphSection,
  CodeBlockSection,
  MiniPitchDemoSection,
  MiniPitchStepsSection,
  InteractiveDemoSection,
  MermaidDiagramSection,
  ConditionalValue,
  InteractivePlayerDefinition,
} from "@domain/entities/Plugin";
import DOMPurify from "dompurify";

function useI18n(text: I18nText): string {
  const { language } = useLanguage();
  return text[language] || text.ja;
}

function sanitize(text: string): string {
  return DOMPurify.sanitize(text);
}

/* ------------------------------------------------------------------ */
/*  セクションレンダラー                                                  */
/* ------------------------------------------------------------------ */

function HeadingRenderer({ section }: { section: HeadingSection }) {
  const text = useI18n(section.text);
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
      {sanitize(text)}
    </h2>
  );
}

function ParagraphRenderer({ section }: { section: ParagraphSection }) {
  const text = useI18n(section.text);
  return (
    <p className="text-slate-300 leading-relaxed mb-6">{sanitize(text)}</p>
  );
}

function CodeBlockRenderer({ section }: { section: CodeBlockSection }) {
  return (
    <div className="mb-6">
      <CodeBlock code={section.code} highlightLines={section.highlightLines} />
    </div>
  );
}

function MiniPitchDemoRenderer({ section }: { section: MiniPitchDemoSection }) {
  const { language } = useLanguage();
  const compact = useCompact();
  const description = section.description
    ? section.description[language] || section.description.ja
    : null;
  return (
    <div className="mb-6">
      {description && (
        <p className="text-slate-400 text-sm mb-3">{sanitize(description)}</p>
      )}
      <DemoCanvas cameraPosition={section.cameraPosition} compact={compact}>
        <MiniPitch />
        {section.players.map((p, i) => (
          <PlayerMarker
            key={i}
            position={[p.x, 0, p.z]}
            color={p.color}
            number={p.number}
            name={p.name}
          />
        ))}
      </DemoCanvas>
    </div>
  );
}

function MiniPitchStepsRenderer({
  section,
}: {
  section: MiniPitchStepsSection;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const { language } = useLanguage();
  const compact = useCompact();
  const currentStep = section.steps[stepIndex];
  const label = currentStep.label[language] || currentStep.label.ja;
  const description = section.description
    ? section.description[language] || section.description.ja
    : null;

  return (
    <div className="mb-6">
      {description && (
        <p className="text-slate-400 text-sm mb-3">{sanitize(description)}</p>
      )}
      <DemoCanvas cameraPosition={section.cameraPosition} compact={compact}>
        <MiniPitch />
        {currentStep.players.map((p, i) => (
          <PlayerMarker
            key={i}
            position={[p.x, 0, p.z]}
            color={p.color}
            number={p.number}
            name={p.name}
          />
        ))}
      </DemoCanvas>
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={stepIndex === 0}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-white disabled:opacity-40 hover:bg-slate-600 transition-colors"
        >
          ←
        </button>
        <span className="text-slate-300 text-sm font-medium min-w-[120px] text-center">
          {sanitize(label)} ({stepIndex + 1}/{section.steps.length})
        </span>
        <button
          onClick={() =>
            setStepIndex((prev) => Math.min(section.steps.length - 1, prev + 1))
          }
          disabled={stepIndex === section.steps.length - 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-white disabled:opacity-40 hover:bg-slate-600 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}

function MermaidDiagramRenderer({
  section,
}: {
  section: MermaidDiagramSection;
}) {
  const { language } = useLanguage();
  const description = section.description
    ? section.description[language] || section.description.ja
    : null;

  return (
    <div className="mb-6">
      {description && (
        <p className="text-slate-400 text-sm mb-3">{sanitize(description)}</p>
      )}
      <div className="rounded-lg bg-slate-900/50 border border-slate-700/50 p-4 overflow-x-auto">
        <MermaidFlowchart chart={section.code} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  インタラクティブデモ                                                  */
/* ------------------------------------------------------------------ */

function resolveConditional(
  cond: ConditionalValue,
  state: Record<string, string | number | boolean>,
): string | number {
  const bindKey = cond.if.replace(/^\$/, "");
  return state[bindKey] ? cond.then : cond.else;
}

function resolveBindings(
  value: string | undefined,
  state: Record<string, string | number | boolean>,
): string | undefined {
  if (!value) return value;
  if (value.startsWith("$")) {
    const key = value.slice(1);
    return String(state[key] ?? value);
  }
  return value;
}

function resolvePlayerColor(
  color: string | ConditionalValue,
  state: Record<string, string | number | boolean>,
): string {
  if (typeof color === "string") return color;
  return String(resolveConditional(color, state));
}

function resolvePlayerNumber(
  num: number | string | undefined,
  state: Record<string, string | number | boolean>,
): number | undefined {
  if (num === undefined) return undefined;
  if (typeof num === "number") return num;
  if (num.startsWith("$")) {
    const key = num.slice(1);
    const val = state[key];
    return typeof val === "number" ? val : Number(val) || undefined;
  }
  return Number(num) || undefined;
}

function InteractiveDemoRenderer({
  section,
}: {
  section: InteractiveDemoSection;
}) {
  const { language } = useLanguage();
  const compact = useCompact();
  const description = section.description
    ? section.description[language] || section.description.ja
    : null;

  // 状態の初期化
  const initialState: Record<string, string | number | boolean> = {};
  for (const [key, def] of Object.entries(section.state)) {
    initialState[key] = def.default;
  }
  const [state, setState] = useState(initialState);

  const updateState = (key: string, value: string | number | boolean) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  // シーン解決: scenesマップまたは単一scene
  let players: InteractivePlayerDefinition[] = [];
  if (section.scenes) {
    // 最初のbind状態値でシーンを選択
    const firstControl = section.controls[0];
    if (firstControl) {
      const bindKey = firstControl.bind;
      const sceneKey = String(state[bindKey]);
      const selectedScene = section.scenes[sceneKey];
      if (selectedScene) {
        players = selectedScene.players;
      }
    }
  } else if (section.scene) {
    players = section.scene.players;
  }

  return (
    <div className="mb-6">
      {description && (
        <p className="text-slate-400 text-sm mb-3">{sanitize(description)}</p>
      )}
      {/* コントロール */}
      <div className="flex flex-wrap gap-3 mb-4">
        {section.controls.map((ctrl, i) => (
          <ControlRenderer
            key={i}
            control={ctrl}
            state={state}
            onUpdate={updateState}
            language={language}
          />
        ))}
      </div>
      {/* 3Dシーン */}
      <DemoCanvas cameraPosition={section.cameraPosition} compact={compact}>
        <MiniPitch />
        {players.map((p, i) => (
          <PlayerMarker
            key={i}
            position={[p.x, 0, p.z]}
            color={resolvePlayerColor(p.color, state)}
            number={resolvePlayerNumber(p.number, state)}
            name={resolveBindings(p.name, state)}
          />
        ))}
      </DemoCanvas>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  コントロールレンダラー                                                */
/* ------------------------------------------------------------------ */

import type { InteractiveControl } from "@domain/entities/Plugin";

function ControlRenderer({
  control,
  state,
  onUpdate,
  language,
}: {
  control: InteractiveControl;
  state: Record<string, string | number | boolean>;
  onUpdate: (key: string, value: string | number | boolean) => void;
  language: "ja" | "en";
}) {
  const value = state[control.bind];

  switch (control.type) {
    case "buttonGroup":
      return (
        <div className="flex gap-2">
          {control.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate(control.bind, opt.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                value === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {opt.label[language] || opt.label.ja}
            </button>
          ))}
        </div>
      );

    case "textInput":
      return (
        <div className="flex items-center gap-2">
          {control.label && (
            <span className="text-slate-400 text-sm">
              {control.label[language] || control.label.ja}
            </span>
          )}
          <input
            type="text"
            value={String(value)}
            onChange={(e) => onUpdate(control.bind, e.target.value)}
            maxLength={control.maxLength}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      );

    case "numberInput":
      return (
        <div className="flex items-center gap-2">
          {control.label && (
            <span className="text-slate-400 text-sm">
              {control.label[language] || control.label.ja}
            </span>
          )}
          <input
            type="number"
            value={Number(value)}
            onChange={(e) => onUpdate(control.bind, Number(e.target.value))}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none w-20"
          />
        </div>
      );

    case "toggle":
      return (
        <button
          onClick={() => onUpdate(control.bind, !value)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            value
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          {control.label
            ? control.label[language] || control.label.ja
            : String(value)}
        </button>
      );

    case "slider":
      return (
        <div className="flex items-center gap-2">
          {control.label && (
            <span className="text-slate-400 text-sm">
              {control.label[language] || control.label.ja}
            </span>
          )}
          <input
            type="range"
            value={Number(value)}
            onChange={(e) => onUpdate(control.bind, Number(e.target.value))}
            className="accent-blue-500"
          />
          <span className="text-slate-300 text-sm">{String(value)}</span>
        </div>
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  メインレンダラー                                                     */
/* ------------------------------------------------------------------ */

interface LessonSectionRendererProps {
  sections: LessonSection[];
}

export function LessonSectionRenderer({
  sections,
}: LessonSectionRendererProps) {
  return (
    <div className="space-y-2">
      {sections.map((section, i) => (
        <SectionRenderer key={i} section={section} />
      ))}
    </div>
  );
}

export function SectionRenderer({ section }: { section: LessonSection }) {
  switch (section.type) {
    case "heading":
      return <HeadingRenderer section={section} />;
    case "paragraph":
      return <ParagraphRenderer section={section} />;
    case "codeBlock":
      return <CodeBlockRenderer section={section} />;
    case "miniPitchDemo":
      return <MiniPitchDemoRenderer section={section} />;
    case "miniPitchSteps":
      return <MiniPitchStepsRenderer section={section} />;
    case "interactiveDemo":
      return <InteractiveDemoRenderer section={section} />;
    case "mermaidDiagram":
      return <MermaidDiagramRenderer section={section} />;
    default:
      return null;
  }
}
