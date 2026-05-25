/**
 * @module PluginGuideModal
 * @description プラグインの作成方法を説明するガイドモーダル。
 * 各セクション種別のJSONスニペット付きリファレンスを提供し、人間・AI双方にとって分かりやすい構成。
 */
import { useState, Suspense } from "react";
import { AccessibleModal } from "@presentation/components/ui/AccessibleModal";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { SectionRenderer } from "./LessonSectionRenderer";
import { CompactModeContext } from "./CompactModeContext";
import type { LessonSection } from "@domain/entities/Plugin";
import type { TranslationKey } from "@shared/i18n/translations";

interface PluginGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  セクション種別ごとのJSONスニペット定義                                   */
/* ------------------------------------------------------------------ */

interface SectionSnippet {
  type: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  json: string;
  fieldsKey: TranslationKey;
}

const SECTION_SNIPPETS: SectionSnippet[] = [
  {
    type: "heading",
    labelKey: "code.lab.plugin.guide.sectionHeading",
    descKey: "code.lab.plugin.guide.sectionHeadingDesc",
    json: `{
  "type": "heading",
  "text": { "ja": "見出しテキスト", "en": "Heading text" }
}`,
    fieldsKey: "code.lab.plugin.guide.fieldsHeading",
  },
  {
    type: "paragraph",
    labelKey: "code.lab.plugin.guide.sectionParagraph",
    descKey: "code.lab.plugin.guide.sectionParagraphDesc",
    json: `{
  "type": "paragraph",
  "text": { "ja": "段落テキスト", "en": "Paragraph text" }
}`,
    fieldsKey: "code.lab.plugin.guide.fieldsParagraph",
  },
  {
    type: "codeBlock",
    labelKey: "code.lab.plugin.guide.sectionCodeBlock",
    descKey: "code.lab.plugin.guide.sectionCodeBlockDesc",
    json: `{
  "type": "codeBlock",
  "language": "javascript",
  "code": "const x = 10;\\nconst y = 20;",
  "highlightLines": [1]
}`,
    fieldsKey: "code.lab.plugin.guide.fieldsCodeBlock",
  },
  {
    type: "miniPitchDemo",
    labelKey: "code.lab.plugin.guide.sectionMiniPitchDemo",
    descKey: "code.lab.plugin.guide.sectionMiniPitchDemoDesc",
    json: `{
  "type": "miniPitchDemo",
  "description": { "ja": "説明文", "en": "Description" },
  "cameraPosition": [0, 12, -8],
  "players": [
    { "x": -1, "z": -2, "number": 10, "name": "Tsubasa", "color": "#3b82f6" },
    { "x": 2, "z": 1, "number": 7, "color": "#ef4444" }
  ]
}`,
    fieldsKey: "code.lab.plugin.guide.fieldsMiniPitchDemo",
  },
  {
    type: "miniPitchSteps",
    labelKey: "code.lab.plugin.guide.sectionMiniPitchSteps",
    descKey: "code.lab.plugin.guide.sectionMiniPitchStepsDesc",
    json: `{
  "type": "miniPitchSteps",
  "description": { "ja": "説明文", "en": "Description" },
  "cameraPosition": [0, 12, -8],
  "steps": [
    {
      "label": { "ja": "ステップ1", "en": "Step 1" },
      "players": [
        { "x": 0, "z": -2, "number": 10, "color": "#3b82f6" }
      ]
    },
    {
      "label": { "ja": "ステップ2", "en": "Step 2" },
      "players": [
        { "x": 2, "z": -4, "number": 10, "color": "#3b82f6" },
        { "x": -2, "z": 1, "number": 7, "color": "#ef4444" }
      ]
    }
  ]
}`,
    fieldsKey: "code.lab.plugin.guide.fieldsMiniPitchSteps",
  },
  {
    type: "mermaidDiagram",
    labelKey: "code.lab.plugin.guide.sectionMermaidDiagram",
    descKey: "code.lab.plugin.guide.sectionMermaidDiagramDesc",
    json: `{
  "type": "mermaidDiagram",
  "description": { "ja": "フローチャートの例", "en": "Flowchart example" },
  "code": "graph TD\\n  A[Start] --> B{Decision}\\n  B -->|Yes| C[Action 1]\\n  B -->|No| D[Action 2]"
}`,
    fieldsKey: "code.lab.plugin.guide.fieldsMermaidDiagram",
  },
  {
    type: "interactiveDemo",
    labelKey: "code.lab.plugin.guide.sectionInteractiveDemo",
    descKey: "code.lab.plugin.guide.sectionInteractiveDemoDesc",
    json: `{
  "type": "interactiveDemo",
  "description": { "ja": "説明文", "en": "Description" },
  "cameraPosition": [0, 12, -8],
  "state": {
    "team": { "type": "string", "default": "home" },
    "count": { "type": "number", "default": 3, "min": 1, "max": 11 }
  },
  "controls": [
    {
      "type": "buttonGroup",
      "bind": "team",
      "options": [
        { "value": "home", "label": { "ja": "ホーム", "en": "Home" } },
        { "value": "away", "label": { "ja": "アウェイ", "en": "Away" } }
      ]
    },
    {
      "type": "slider",
      "bind": "count",
      "label": { "ja": "人数", "en": "Count" }
    }
  ],
  "scenes": {
    "home": {
      "players": [
        { "x": -1, "z": -2, "number": 10, "color": "#3b82f6" }
      ]
    },
    "away": {
      "players": [
        { "x": 1, "z": 2, "number": 9, "color": "#ef4444" }
      ]
    }
  }
}`,
    fieldsKey: "code.lab.plugin.guide.fieldsInteractiveDemo",
  },
];

/* ------------------------------------------------------------------ */
/*  プロンプト用スキーマ仕様（プロンプトに埋め込む共通部分）                         */
/* ------------------------------------------------------------------ */

const SCHEMA_SPEC = `## kerulabs プラグイン JSON 仕様

### 全体構造
{
  "kerulabs_plugin": "1.0",
  "type": "lesson",
  "metadata": {
    "id": "一意なID",
    "name": { "ja": "...", "en": "..." },
    "author": "作者名",
    "version": "1.0.0",
    "description": { "ja": "...", "en": "..." }
  },
  "data": {
    "lessonId": "一意なレッスンID",
    "category": "programming-basics",
    "title": { "ja": "...", "en": "..." },
    "description": { "ja": "...", "en": "..." },
    "icon": "絵文字",
    "gradient": "from-blue-600 to-cyan-500",
    "sections": [ ... ]
  }
}

category は次のいずれか: "programming-basics" | "file-formats" | "git" | "architecture" | "testing" | "custom"

### 3Dピッチ仕様
- フィールドサイズ: 幅10 × 奥行14（x: -5〜5, z: -7〜7）
- cameraPosition のデフォルト: [0, 12, -8]
- 選手定義: { x: number, z: number, number?: number, name?: string, color: "#hex" }

### セクション種別（sections 配列の各要素）

#### 1. heading — 見出し
{ "type": "heading", "text": { "ja": "...", "en": "..." } }
※ "content" ではなく必ず "text" を使用

#### 2. paragraph — 段落テキスト
{ "type": "paragraph", "text": { "ja": "...", "en": "..." } }
※ "content" ではなく必ず "text" を使用

#### 3. codeBlock — コードブロック
{ "type": "codeBlock", "language": "javascript", "code": "...", "highlightLines": [1, 2] }
※ "highlight" ではなく必ず "highlightLines" を使用。改行は \\n で表現

#### 4. miniPitchDemo — 3Dピッチデモ（静的）
{ "type": "miniPitchDemo", "description": { "ja": "...", "en": "..." }, "cameraPosition": [0, 12, -8], "players": [ { "x": 0, "z": -2, "number": 10, "name": "選手名", "color": "#3b82f6" } ] }

#### 5. miniPitchSteps — ステップ式3Dデモ
{ "type": "miniPitchSteps", "description": { "ja": "...", "en": "..." }, "cameraPosition": [0, 12, -8], "steps": [ { "label": { "ja": "ステップ1", "en": "Step 1" }, "players": [ ... ] } ] }
※ steps 内の各要素は label(必須, {ja, en}) と players(必須) のみ。code フィールドは不可

#### 6. mermaidDiagram — Mermaidダイアグラム
{ "type": "mermaidDiagram", "description": { "ja": "...", "en": "..." }, "code": "graph TD\\n  A --> B" }
※ code にはMermaid記法の文字列を指定。改行は \\n で表現

#### 7. interactiveDemo — インタラクティブデモ
{
  "type": "interactiveDemo",
  "description": { "ja": "...", "en": "..." },
  "cameraPosition": [0, 12, -8],
  "state": {
    "変数名": { "type": "string"|"number"|"boolean", "default": 初期値, "min?": 数値, "max?": 数値 }
  },
  "controls": [ ... ],
  "scenes": { "値1": { "players": [...] }, "値2": { "players": [...] } }
}
※ scene（単一シーン）または scenes（シーンマップ）のどちらかが必須

コントロール種別（controls 配列の各要素）:
- buttonGroup: { "type": "buttonGroup", "bind": "state変数名", "options": [{ "value": "値", "label": { "ja": "...", "en": "..." } }] }
- slider: { "type": "slider", "bind": "state変数名", "label": { "ja": "...", "en": "..." } }
- toggle: { "type": "toggle", "bind": "state変数名", "label": { "ja": "...", "en": "..." } }
- textInput: { "type": "textInput", "bind": "state変数名", "label": { "ja": "...", "en": "..." }, "maxLength?": 数値 }
- numberInput: { "type": "numberInput", "bind": "state変数名", "label": { "ja": "...", "en": "..." } }
※ colorPicker は存在しない。min/max/default は controls ではなく state 側に定義する
※ 各コントロールの "bind" は state のキー名と一致させること

### 重要な注意事項
- heading/paragraph のテキストフィールド名は "text"（"content" は不可）
- codeBlock のハイライトフィールド名は "highlightLines"（"highlight" は不可）
- steps 内の要素に "code" フィールドは不可
- セクションに "label" や "level" フィールドは不可
- interactiveDemo に "codeTemplate" フィールドは不可
- 全てのテキストは { "ja": "...", "en": "..." } 形式の多言語対応
- mermaidDiagram の code にはMermaid記法（flowchart, sequence, classなど）を使用可能
- 仕様に無いフィールドは追加しないこと`;

const PROMPT_BASIC = (theme: string) =>
  `kerulabsのプラグインJSONを1つ生成してください。

テーマ: ${theme}

以下の仕様に厳密に従い、仕様に無いフィールドは絶対に追加しないでください。
日本語・英語の両方のテキストを含めてください。
heading → paragraph → codeBlock → 3Dデモ の流れで構成してください。

${SCHEMA_SPEC}`;

const PROMPT_INTERACTIVE = (theme: string) =>
  `kerulabsのプラグインJSONを1つ生成してください。

テーマ: ${theme}

以下の仕様に厳密に従い、仕様に無いフィールドは絶対に追加しないでください。
日本語・英語の両方のテキストを含めてください。

セクション構成:
1. heading + paragraph で概念を説明
2. codeBlock でコード例を表示（highlightLines で重要行をハイライト）
3. miniPitchSteps で選手の動きをステップ表示
4. interactiveDemo でボタンやスライダーで状態を切り替えて結果の違いを体験
   - state で状態変数を定義し、controls の bind でそのキー名を参照
   - scenes で状態値ごとの選手配置を定義
5. まとめの heading + paragraph

${SCHEMA_SPEC}`;

/* ------------------------------------------------------------------ */
/*  基本構造テンプレート                                                  */
/* ------------------------------------------------------------------ */

const BASE_STRUCTURE_JSON = `{
  "kerulabs_plugin": "1.0",
  "type": "lesson",
  "metadata": {
    "id": "unique-plugin-id",
    "name": { "ja": "プラグイン名", "en": "Plugin Name" },
    "author": "作者名",
    "version": "1.0.0",
    "description": { "ja": "説明", "en": "Description" }
  },
  "data": {
    "lessonId": "unique-lesson-id",
    "category": "programming-basics",
    "title": { "ja": "レッスンタイトル", "en": "Lesson Title" },
    "description": { "ja": "レッスン説明", "en": "Lesson Description" },
    "icon": "📦",
    "gradient": "from-blue-600 to-cyan-500",
    "sections": [
      // ここにセクションを追加
    ]
  }
}`;

/* ------------------------------------------------------------------ */
/*  全セクション種別を含む完全サンプル                                       */
/* ------------------------------------------------------------------ */

const FULL_EXAMPLE_JSON = `{
  "kerulabs_plugin": "1.0",
  "type": "lesson",
  "metadata": {
    "id": "soccer-variables-lesson",
    "name": { "ja": "変数の基本", "en": "Variable Basics" },
    "author": "Your Name",
    "version": "1.0.0",
    "description": {
      "ja": "サッカーの例で変数を学ぶ",
      "en": "Learn variables with soccer examples"
    }
  },
  "data": {
    "lessonId": "soccer-variables",
    "category": "programming-basics",
    "title": { "ja": "変数の基本", "en": "Variable Basics" },
    "description": {
      "ja": "選手データで変数を理解しよう",
      "en": "Understand variables with player data"
    },
    "icon": "📦",
    "gradient": "from-blue-600 to-cyan-500",
    "sections": [
      {
        "type": "heading",
        "text": { "ja": "変数とは？", "en": "What is a variable?" }
      },
      {
        "type": "paragraph",
        "text": {
          "ja": "変数は選手の背番号のようなものです。名前をつけて値を保存できます。",
          "en": "A variable is like a player's jersey number. You can assign a name and store a value."
        }
      },
      {
        "type": "codeBlock",
        "language": "javascript",
        "code": "const playerNumber = 10;\\nconst playerName = \\"Tsubasa\\";\\nconsole.log(playerName + \\" #\\" + playerNumber);",
        "highlightLines": [1, 2]
      },
      {
        "type": "miniPitchDemo",
        "description": {
          "ja": "背番号10の選手をピッチに配置",
          "en": "Player #10 placed on the pitch"
        },
        "players": [
          { "x": 0, "z": -2, "number": 10, "name": "Tsubasa", "color": "#3b82f6" }
        ]
      },
      {
        "type": "mermaidDiagram",
        "description": {
          "ja": "変数の代入フロー",
          "en": "Variable assignment flow"
        },
        "code": "graph LR\\n  A[const playerNumber] -->|= 10| B[playerNumber: 10]\\n  C[const playerName] -->|= Tsubasa| D[playerName: Tsubasa]"
      },
      {
        "type": "heading",
        "text": { "ja": "変数の変更", "en": "Changing Variables" }
      },
      {
        "type": "miniPitchSteps",
        "description": {
          "ja": "選手の移動をステップで確認",
          "en": "See player movement step by step"
        },
        "steps": [
          {
            "label": { "ja": "初期位置", "en": "Initial Position" },
            "players": [
              { "x": 0, "z": -2, "number": 10, "color": "#3b82f6" }
            ]
          },
          {
            "label": { "ja": "移動後", "en": "After Move" },
            "players": [
              { "x": 3, "z": 3, "number": 10, "color": "#3b82f6" }
            ]
          }
        ]
      },
      {
        "type": "heading",
        "text": { "ja": "チームの切り替え", "en": "Switching Teams" }
      },
      {
        "type": "interactiveDemo",
        "description": {
          "ja": "ボタンでチームカラーを切り替えてみよう",
          "en": "Switch team colors with buttons"
        },
        "state": {
          "team": { "type": "string", "default": "home" }
        },
        "controls": [
          {
            "type": "buttonGroup",
            "bind": "team",
            "options": [
              { "value": "home", "label": { "ja": "ホーム", "en": "Home" } },
              { "value": "away", "label": { "ja": "アウェイ", "en": "Away" } }
            ]
          }
        ],
        "scenes": {
          "home": {
            "players": [
              { "x": -1, "z": -3, "number": 10, "color": "#3b82f6" },
              { "x": -3, "z": 0, "number": 7, "color": "#3b82f6" }
            ]
          },
          "away": {
            "players": [
              { "x": 1, "z": 3, "number": 9, "color": "#ef4444" },
              { "x": 3, "z": 0, "number": 11, "color": "#ef4444" }
            ]
          }
        }
      }
    ]
  }
}`;

/* ------------------------------------------------------------------ */
/*  コピーボタンコンポーネント                                              */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
    >
      {copied ? (
        <svg
          className="w-3.5 h-3.5 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  展開式セクションカード                                                */
/* ------------------------------------------------------------------ */

/** セクションJSONスニペットをパースしてプレビュー用のLessonSectionオブジェクトに変換 */
function parseSectionForPreview(json: string): LessonSection | null {
  try {
    return JSON.parse(json) as LessonSection;
  } catch {
    return null;
  }
}

/** 3D系セクションかどうかを判定 */
function is3DSection(type: string): boolean {
  return ["miniPitchDemo", "miniPitchSteps", "interactiveDemo"].includes(type);
}

function SectionPreview({ section }: { section: LessonSection }) {
  const is3D = is3DSection(section.type);

  return (
    <div
      className={`rounded-lg border border-slate-600/50 ${is3D ? "pointer-events-none" : "p-3 bg-slate-900/50"}`}
    >
      <CompactModeContext.Provider value={is3D}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-40 text-slate-500 text-xs">
              Loading...
            </div>
          }
        >
          <SectionRenderer section={section} />
        </Suspense>
      </CompactModeContext.Provider>
    </div>
  );
}

function SectionCard({
  snippet,
  t,
  isExpanded,
  onToggle,
}: {
  snippet: SectionSnippet;
  t: (key: TranslationKey) => string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <code className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-emerald-400">
            {snippet.type}
          </code>
          <span className="text-white text-sm font-medium">
            {t(snippet.labelKey)}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-700/50">
          <p className="text-slate-400 text-xs pt-2">{t(snippet.descKey)}</p>

          {/* レンダリングプレビュー */}
          {(() => {
            const section = parseSectionForPreview(snippet.json);
            if (!section) return null;
            return (
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1.5">
                  {t("code.lab.plugin.guide.preview")}
                </p>
                <SectionPreview section={section} />
              </div>
            );
          })()}

          {/* フィールド説明 */}
          <div className="text-xs text-slate-500 whitespace-pre-line">
            {t(snippet.fieldsKey)}
          </div>

          {/* JSONスニペット */}
          <div className="relative">
            <div className="absolute top-2 right-2">
              <CopyButton
                text={snippet.json}
                label={t("code.lab.plugin.guide.copy")}
              />
            </div>
            <pre className="p-3 pr-20 rounded-md bg-slate-950 border border-slate-700/50 text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <code>{snippet.json}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  プロンプトカードコンポーネント                                            */
/* ------------------------------------------------------------------ */

function PromptCard({
  label,
  prompt,
  copyLabel,
}: {
  label: string;
  prompt: string;
  copyLabel: string;
}) {
  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
        <span className="text-white text-sm font-medium">{label}</span>
        <CopyButton text={prompt} label={copyLabel} />
      </div>
      <pre className="p-3 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {prompt}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  メインコンポーネント                                                  */
/* ------------------------------------------------------------------ */

type TabKey = "structure" | "sections" | "example" | "prompt";

export function PluginGuideModal({ isOpen, onClose }: PluginGuideModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("structure");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [promptTheme, setPromptTheme] = useState("");

  const toggleSection = (type: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(SECTION_SNIPPETS.map((s) => s.type)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "structure", label: t("code.lab.plugin.guide.tabStructure") },
    { key: "sections", label: t("code.lab.plugin.guide.tabSections") },
    { key: "example", label: t("code.lab.plugin.guide.tabExample") },
    { key: "prompt", label: t("code.lab.plugin.guide.tabPrompt") },
  ];

  const categories = [
    {
      key: "programming-basics",
      label: t("code.lab.plugin.guide.catProgramming"),
    },
    { key: "file-formats", label: t("code.lab.plugin.guide.catFileFormats") },
    { key: "git", label: t("code.lab.plugin.guide.catGit") },
    { key: "architecture", label: t("code.lab.plugin.guide.catArchitecture") },
    { key: "testing", label: t("code.lab.plugin.guide.catTesting") },
    { key: "custom", label: t("code.lab.plugin.guide.catCustom") },
  ];

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={t("code.lab.plugin.guide.title")}
      className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-700/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span aria-hidden="true">📖</span>
          {t("code.lab.plugin.guide.title")}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* タブ */}
      <div className="flex gap-1 px-6 pt-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* ── 基本構造タブ ── */}
        {activeTab === "structure" && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              {t("code.lab.plugin.guide.structureDesc")}
            </p>

            {/* 基本構造JSON */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold">
                  {t("code.lab.plugin.guide.baseStructureTitle")}
                </h3>
                <CopyButton
                  text={BASE_STRUCTURE_JSON}
                  label={t("code.lab.plugin.guide.copy")}
                />
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-700/50 text-xs text-slate-300 overflow-x-auto leading-relaxed">
                <code>{BASE_STRUCTURE_JSON}</code>
              </pre>
            </div>

            {/* フィールド説明 */}
            <div className="space-y-2">
              <h3 className="text-white text-sm font-semibold">
                {t("code.lab.plugin.guide.fieldsTitle")}
              </h3>
              <div className="text-xs text-slate-400 space-y-1.5 whitespace-pre-line leading-relaxed">
                {t("code.lab.plugin.guide.baseFieldsDesc")}
              </div>
            </div>

            {/* カテゴリ一覧 */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-2">
                {t("code.lab.plugin.guide.categoriesTitle")}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.key}
                    className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <code className="text-xs text-blue-400">{cat.key}</code>
                    <p className="text-slate-300 text-xs mt-0.5">{cat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── セクションリファレンスタブ ── */}
        {activeTab === "sections" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                {t("code.lab.plugin.guide.sectionsDesc")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {t("code.lab.plugin.guide.expandAll")}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={collapseAll}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {t("code.lab.plugin.guide.collapseAll")}
                </button>
              </div>
            </div>

            {SECTION_SNIPPETS.map((snippet) => (
              <SectionCard
                key={snippet.type}
                snippet={snippet}
                t={t}
                isExpanded={expandedSections.has(snippet.type)}
                onToggle={() => toggleSection(snippet.type)}
              />
            ))}

            {/* コントロール種別の補足 */}
            <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <h4 className="text-white text-sm font-semibold mb-2">
                {t("code.lab.plugin.guide.controlTypesTitle")}
              </h4>
              <div className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                {t("code.lab.plugin.guide.controlTypesDesc")}
              </div>
            </div>
          </div>
        )}

        {/* ── 完全サンプルタブ ── */}
        {activeTab === "example" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                {t("code.lab.plugin.guide.exampleDesc")}
              </p>
              <CopyButton
                text={FULL_EXAMPLE_JSON}
                label={t("code.lab.plugin.guide.copy")}
              />
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-700/50 text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <code>{FULL_EXAMPLE_JSON}</code>
            </pre>
          </div>
        )}

        {/* ── プロンプト例タブ ── */}
        {activeTab === "prompt" && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              {t("code.lab.plugin.guide.promptDesc")}
            </p>

            {/* テーマ入力 */}
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium whitespace-nowrap">
                {t("code.lab.plugin.guide.promptThemePrefix")}
              </span>
              <input
                type="text"
                value={promptTheme}
                onChange={(e) => setPromptTheme(e.target.value)}
                placeholder={t("code.lab.plugin.guide.promptThemePlaceholder")}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            {/* 基本プロンプト */}
            <PromptCard
              label={t("code.lab.plugin.guide.promptLabel.basic")}
              prompt={PROMPT_BASIC(
                promptTheme ||
                  t("code.lab.plugin.guide.promptThemePlaceholder"),
              )}
              copyLabel={t("code.lab.plugin.guide.copy")}
            />

            {/* インタラクティブデモ付きプロンプト */}
            <PromptCard
              label={t("code.lab.plugin.guide.promptLabel.interactive")}
              prompt={PROMPT_INTERACTIVE(
                promptTheme ||
                  t("code.lab.plugin.guide.promptThemePlaceholder"),
              )}
              copyLabel={t("code.lab.plugin.guide.copy")}
            />
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <button
          onClick={onClose}
          className="w-full py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {t("code.lab.plugin.guide.close")}
        </button>
      </div>
    </AccessibleModal>
  );
}
