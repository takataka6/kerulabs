/**
 * @module MermaidLesson
 * @description レッスン: Mermaid。テキストからフローチャートや図を自動生成するMermaid記法を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { MermaidFlowchart } from "@presentation/components/ui";

const FLOWCHART_CODE = `graph TD
    A[ボール奪取] --> B{判断}
    B -->|パス| C[スルーパス]
    B -->|ドリブル| D[1対1]
    C --> E[シュート]
    D --> E`;

const FLOWCHART_CODE_EN = `graph TD
    A[Ball Win] --> B{Decision}
    B -->|Pass| C[Through Ball]
    B -->|Dribble| D[1v1]
    C --> E[Shot]
    D --> E`;

const SYNTAX_CODE = `// フローチャートの基本構文

graph TD          // TD = Top → Down（上から下）
    A[四角ノード]   // [ ] = 四角形
    B{ひし形ノード}  // { } = ひし形（分岐）
    C(丸角ノード)   // ( ) = 丸角
    D((円ノード))   // (( )) = 円

// 矢印の種類
    A --> B        // 実線矢印
    B -.-> C       // 点線矢印
    C ==> D        // 太線矢印
    A -->|ラベル| B  // ラベル付き矢印

// 方向
    graph TD   // Top → Down
    graph LR   // Left → Right
    graph BT   // Bottom → Top`;

const SEQUENCE_CODE = `sequenceDiagram
    participant UI as Presentation
    participant UC as UseCase
    participant DB as Repository

    UI->>UC: getAllTeams()
    UC->>DB: findAll()
    DB-->>UC: Team[]
    UC-->>UI: Team[]`;

const APP_CODE = `// このアプリでの Mermaid の使い方
// src/presentation/components/tactics-viewer/FlowchartPanel.tsx

// 戦術の流れをフローチャートで可視化
<MermaidFlowchart
  chart={chartContent}
  className="mermaid-container"
/>

// chartContent の例:
// graph TD
//   A[ビルドアップ] --> B{判断}
//   B -->|パス| C[スルーパス]
//   B -->|ドリブル| D[1対1]`;

type DiagramType = "flowchart" | "sequence" | "custom";

export function MermaidLesson() {
  const { language } = useLanguage();
  const ja = language === "ja";

  const defaultChart = ja ? FLOWCHART_CODE : FLOWCHART_CODE_EN;
  const [diagramType, setDiagramType] = useState<DiagramType>("flowchart");
  const [customChart, setCustomChart] = useState(defaultChart);

  const diagrams: { key: DiagramType; label: string; labelEn: string }[] = [
    { key: "flowchart", label: "フローチャート", labelEn: "Flowchart" },
    { key: "sequence", label: "シーケンス図", labelEn: "Sequence Diagram" },
    { key: "custom", label: "自由に書く", labelEn: "Write Your Own" },
  ];

  const currentChart =
    diagramType === "flowchart"
      ? defaultChart
      : diagramType === "sequence"
        ? SEQUENCE_CODE
        : customChart;

  return (
    <LessonLayout lessonId="mermaid">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🧜
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          Mermaid
        </h1>
        <p className="text-slate-400">
          {ja
            ? "Mermaid はテキストから図を自動生成するツールです。フローチャート、シーケンス図、クラス図などをコードとして書けるため、バージョン管理や差分確認が簡単にできます。"
            : "Mermaid auto-generates diagrams from text. Flowcharts, sequence diagrams, class diagrams and more can be written as code, making version control and diffs easy."}
        </p>
      </div>

      {/* なぜ Mermaid？ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "なぜテキストで図を書くのか？" : "Why Write Diagrams as Text?"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-blue-400 font-bold text-sm mb-1">
              {ja ? "バージョン管理" : "Version Control"}
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "テキストなのでGitで差分が見える。画像では変更点がわからない"
                : "Text diffs in Git. Image changes are invisible in diffs"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-emerald-400 font-bold text-sm mb-1">
              {ja ? "自動レイアウト" : "Auto Layout"}
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "ノードの位置や矢印の配置を自動計算。手動で調整する必要がない"
                : "Node positions and arrow routing are auto-calculated. No manual adjustment needed"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-amber-400 font-bold text-sm mb-1">
              {ja ? "どこでも使える" : "Works Everywhere"}
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "GitHub やこのアプリなど、多くのツールが対応"
                : "GitHub, this app, and many other tools support it"}
            </div>
          </div>
        </div>
      </section>

      {/* 構文 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "基本構文" : "Basic Syntax"}
        </h2>
        <CodeBlock
          code={SYNTAX_CODE}
          highlightLines={[3, 4, 5, 6, 7, 10, 11, 12, 13, 16, 17, 18]}
        />
      </section>

      {/* インタラクティブデモ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "試してみよう" : "Try It Out"}
        </h2>
        <div className="flex gap-2 mb-4">
          {diagrams.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDiagramType(d.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                diagramType === d.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {ja ? d.label : d.labelEn}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ソース */}
          <div>
            <div className="text-xs text-slate-500 mb-2 font-bold">
              {ja ? "Mermaid ソース" : "Mermaid Source"}
            </div>
            {diagramType === "custom" ? (
              <label className="block">
                <span className="sr-only">Mermaid source</span>
                <textarea
                  value={customChart}
                  onChange={(e) => setCustomChart(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 resize-none"
                />
              </label>
            ) : (
              <CodeBlock
                code={currentChart}
                highlightLines={
                  diagramType === "flowchart"
                    ? [1, 2, 3, 4, 5, 6]
                    : [1, 2, 3, 4, 6, 7, 8, 9]
                }
              />
            )}
          </div>

          {/* レンダリング結果 */}
          <div>
            <div className="text-xs text-slate-500 mb-2 font-bold">
              {ja ? "レンダリング結果" : "Rendered Output"}
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 min-h-[200px] flex items-center justify-center overflow-auto">
              <MermaidFlowchart chart={currentChart} className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* このアプリでの使い方 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "このアプリでの使い方" : "Usage in This App"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "このアプリでは「戦術フロー」機能で Mermaid を使っています。戦術の流れをフローチャートとして自動生成し、選手の動きの分岐や連携を可視化します。"
              : "This app uses Mermaid in the 'Tactics Flow' feature. It auto-generates flowcharts of tactical sequences, visualizing branching plays and player coordination."}
          </p>
        </div>
        <CodeBlock code={APP_CODE} highlightLines={[5, 6, 7, 8]} />
      </section>

      {/* シーケンス図の説明 */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja
            ? "シーケンス図でアーキテクチャを表現"
            : "Architecture with Sequence Diagrams"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "シーケンス図は「誰が誰に何を送るか」を時系列で表現します。Clean Architecture のレイヤー間のデータフローを図解するのに最適です。"
              : "Sequence diagrams show 'who sends what to whom' in time order. Perfect for diagramming data flow between Clean Architecture layers."}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CodeBlock
            code={SEQUENCE_CODE}
            highlightLines={[1, 2, 3, 4, 6, 7, 8, 9]}
          />
          <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 flex items-center justify-center overflow-auto">
            <MermaidFlowchart chart={SEQUENCE_CODE} className="w-full" />
          </div>
        </div>
      </section>
    </LessonLayout>
  );
}
