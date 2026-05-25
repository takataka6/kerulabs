/**
 * @module MarkdownLesson
 * @description レッスン: Markdown。READMEやドキュメントで使われるMarkdown記法の基本を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";

const HEADING_CODE = `# 見出し1（最も大きい）
## 見出し2
### 見出し3

通常のテキストはそのまま書きます。

**太字**はアスタリスク2つで囲む。
*斜体*はアスタリスク1つで囲む。
~~取り消し線~~はチルダ2つ。`;

const LIST_CODE = `## リスト

### 箇条書き（順序なし）
- 攻撃
- 守備
- トランジション

### 番号付きリスト（順序あり）
1. ボールを奪う
2. 前線にパスを出す
3. シュートを打つ

### チェックリスト
- [x] フォーメーション設定
- [x] 選手登録
- [ ] 戦術作成`;

const CODE_BLOCK_CODE = `## コード

\`inline code\` はバッククォートで囲む。

コードブロックはバッククォート3つ:

\`\`\`typescript
const player = {
  name: "Tanaka",
  number: 10,
};
\`\`\``;

const TABLE_CODE = `## テーブル

| 名前 | 背番号 | ポジション |
|------|--------|-----------|
| Tanaka | 10 | MF |
| Suzuki | 9 | FW |
| Yamada | 1 | GK |`;

const LINK_IMAGE_CODE = `## リンクと画像

[リンクテキスト](https://example.com)

![画像の説明](image.png)

## 引用

> サッカーは11人でやるスポーツだが、
> ボールを持っているのは1人だけだ。`;

const README_CODE = `# KeruLabs

サッカー戦術の可視化と学習のための統合プラットフォーム

## 機能

- **戦術シミュレーター** — 3Dフィールドで戦術を可視化
- **コードラボ** — アプリの設計を教材として学習
- **チーム用語辞典** — 戦術用語を共有・管理

## セットアップ

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## テスト

\`\`\`bash
pnpm test
\`\`\`

## ライセンス

MIT`;

type Section = "heading" | "list" | "code" | "table" | "link" | "readme";

interface PreviewLine {
  type:
    | "h1"
    | "h2"
    | "h3"
    | "text"
    | "bold"
    | "bullet"
    | "ordered"
    | "check"
    | "code"
    | "table-header"
    | "table-row"
    | "quote"
    | "link";
  content: string;
}

function renderPreview(section: Section, ja: boolean): PreviewLine[] {
  switch (section) {
    case "heading":
      return [
        {
          type: "h1",
          content: ja ? "見出し1（最も大きい）" : "Heading 1 (largest)",
        },
        { type: "h2", content: ja ? "見出し2" : "Heading 2" },
        { type: "h3", content: ja ? "見出し3" : "Heading 3" },
        {
          type: "text",
          content: ja
            ? "通常のテキストはそのまま書きます。"
            : "Regular text is written as-is.",
        },
        {
          type: "bold",
          content: ja ? "**太字** と *斜体*" : "**Bold** and *italic*",
        },
      ];
    case "list":
      return [
        { type: "h3", content: ja ? "箇条書き" : "Bullet list" },
        { type: "bullet", content: ja ? "攻撃" : "Attack" },
        { type: "bullet", content: ja ? "守備" : "Defense" },
        { type: "bullet", content: ja ? "トランジション" : "Transition" },
        { type: "h3", content: ja ? "番号付き" : "Numbered" },
        { type: "ordered", content: ja ? "ボールを奪う" : "Win the ball" },
        { type: "ordered", content: ja ? "パスを出す" : "Pass forward" },
        { type: "ordered", content: ja ? "シュートを打つ" : "Take the shot" },
        { type: "h3", content: ja ? "チェックリスト" : "Checklist" },
        {
          type: "check",
          content: ja ? "✅ フォーメーション設定" : "✅ Formation set",
        },
        {
          type: "check",
          content: ja ? "✅ 選手登録" : "✅ Players registered",
        },
        { type: "check", content: ja ? "⬜ 戦術作成" : "⬜ Create tactic" },
      ];
    case "code":
      return [
        { type: "text", content: ja ? "インラインコード: " : "Inline: " },
        { type: "code", content: "const player = { ... }" },
      ];
    case "table":
      return [
        {
          type: "table-header",
          content: ja ? "名前 | 背番号 | ポジション" : "Name | No. | Position",
        },
        { type: "table-row", content: "Tanaka | 10 | MF" },
        { type: "table-row", content: "Suzuki | 9 | FW" },
        { type: "table-row", content: "Yamada | 1 | GK" },
      ];
    case "link":
      return [
        { type: "link", content: ja ? "リンクテキスト →" : "Link text →" },
        {
          type: "quote",
          content: ja
            ? "引用テキストはインデントされる"
            : "Quoted text is indented",
        },
      ];
    case "readme":
      return [
        { type: "h1", content: "KeruLabs" },
        {
          type: "text",
          content: ja ? "戦術の可視化と学習" : "Tactics visualization",
        },
        { type: "h2", content: ja ? "機能" : "Features" },
        {
          type: "bullet",
          content: ja ? "戦術シミュレーター" : "Tactics Simulator",
        },
        { type: "bullet", content: ja ? "コードラボ" : "Code Lab" },
      ];
  }
}

export function MarkdownLesson() {
  const { language } = useLanguage();
  const [section, setSection] = useState<Section>("heading");
  const ja = language === "ja";

  const sections: { key: Section; label: string; labelEn: string }[] = [
    { key: "heading", label: "見出し・テキスト", labelEn: "Headings & Text" },
    { key: "list", label: "リスト", labelEn: "Lists" },
    { key: "code", label: "コード", labelEn: "Code" },
    { key: "table", label: "テーブル", labelEn: "Tables" },
    { key: "link", label: "リンク・引用", labelEn: "Links & Quotes" },
    { key: "readme", label: "README例", labelEn: "README Example" },
  ];

  const preview = renderPreview(section, ja);

  const codeMap: Record<Section, { code: string; lines: number[] }> = {
    heading: { code: HEADING_CODE, lines: [1, 2, 3, 7, 8, 9] },
    list: { code: LIST_CODE, lines: [4, 5, 6, 9, 10, 11, 15, 16, 17] },
    code: { code: CODE_BLOCK_CODE, lines: [3, 7, 8, 9, 10, 11] },
    table: { code: TABLE_CODE, lines: [3, 4, 5, 6, 7] },
    link: { code: LINK_IMAGE_CODE, lines: [3, 5, 9, 10] },
    readme: { code: README_CODE, lines: [1, 3, 7, 8, 9, 14, 15] },
  };

  return (
    <LessonLayout lessonId="markdown">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          📝
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          Markdown
        </h1>
        <p className="text-slate-400">
          {ja
            ? "Markdown は、テキストに簡単な記号を加えるだけで見出し・リスト・コードブロックなどを表現できる記法です。READMEやドキュメント、GitHubのIssueやPRなど開発のあらゆる場面で使われます。"
            : "Markdown lets you express headings, lists, code blocks, and more by adding simple symbols to text. It's used everywhere in development: READMEs, docs, GitHub Issues, and PRs."}
        </p>
      </div>

      {/* なぜ Markdown？ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "なぜ Markdown を使うのか？" : "Why Use Markdown?"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-blue-400 font-bold text-sm mb-1">
              {ja ? "シンプル" : "Simple"}
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "HTMLタグを書かなくても # で見出し、- でリストが作れる"
                : "No HTML tags needed — # for headings, - for lists"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-emerald-400 font-bold text-sm mb-1">
              {ja ? "どこでも使える" : "Universal"}
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "GitHub をはじめ、ほぼ全ての開発ツールが対応"
                : "GitHub and almost all dev tools support it"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-amber-400 font-bold text-sm mb-1">
              {ja ? "読みやすい" : "Readable"}
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "記法を知らなくても元のテキストが読める（人間にやさしい）"
                : "Even raw text is readable without knowing the syntax"}
            </div>
          </div>
        </div>
      </section>

      {/* タブ切り替え + プレビュー */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "記法とプレビュー" : "Syntax & Preview"}
        </h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSection(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                section === s.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {ja ? s.label : s.labelEn}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ソース */}
          <div>
            <div className="text-xs text-slate-500 mb-2 font-bold">
              {ja ? "Markdownソース" : "Markdown Source"}
            </div>
            <CodeBlock
              code={codeMap[section].code}
              highlightLines={codeMap[section].lines}
            />
          </div>

          {/* プレビュー */}
          <div>
            <div className="text-xs text-slate-500 mb-2 font-bold">
              {ja ? "レンダリング結果" : "Rendered Output"}
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-700 p-5 space-y-2 min-h-[200px]">
              {preview.map((line, i) => {
                switch (line.type) {
                  case "h1":
                    return (
                      <div
                        key={i}
                        className="text-2xl font-bold text-white border-b border-slate-700 pb-2"
                      >
                        {line.content}
                      </div>
                    );
                  case "h2":
                    return (
                      <div
                        key={i}
                        className="text-lg font-bold text-white border-b border-slate-700/50 pb-1 mt-3"
                      >
                        {line.content}
                      </div>
                    );
                  case "h3":
                    return (
                      <div
                        key={i}
                        className="text-sm font-bold text-white mt-2"
                      >
                        {line.content}
                      </div>
                    );
                  case "text":
                    return (
                      <div key={i} className="text-sm text-slate-300">
                        {line.content}
                      </div>
                    );
                  case "bold":
                    return (
                      <div key={i} className="text-sm">
                        <span className="text-white font-bold">
                          {ja ? "太字" : "Bold"}
                        </span>
                        <span className="text-slate-300">
                          {" "}
                          {ja ? "と" : " and "}{" "}
                        </span>
                        <span className="text-slate-300 italic">
                          {ja ? "斜体" : "italic"}
                        </span>
                      </div>
                    );
                  case "bullet":
                    return (
                      <div key={i} className="text-sm text-slate-300 pl-4">
                        <span className="text-slate-500 mr-2">•</span>
                        {line.content}
                      </div>
                    );
                  case "ordered":
                    return (
                      <div key={i} className="text-sm text-slate-300 pl-4">
                        <span className="text-slate-500 mr-2">
                          {i -
                            preview.findIndex((p) => p.type === "ordered") +
                            1}
                          .
                        </span>
                        {line.content}
                      </div>
                    );
                  case "check":
                    return (
                      <div key={i} className="text-sm text-slate-300 pl-4">
                        {line.content}
                      </div>
                    );
                  case "code":
                    return (
                      <div
                        key={i}
                        className="text-xs font-mono bg-slate-800 text-emerald-400 p-3 rounded-lg"
                      >
                        {line.content}
                      </div>
                    );
                  case "table-header":
                    return (
                      <div
                        key={i}
                        className="text-xs font-mono text-white font-bold border-b border-slate-600 pb-1 grid grid-cols-3 gap-2"
                      >
                        {line.content.split(" | ").map((cell, j) => (
                          <span key={j}>{cell}</span>
                        ))}
                      </div>
                    );
                  case "table-row":
                    return (
                      <div
                        key={i}
                        className="text-xs font-mono text-slate-300 grid grid-cols-3 gap-2"
                      >
                        {line.content.split(" | ").map((cell, j) => (
                          <span key={j}>{cell}</span>
                        ))}
                      </div>
                    );
                  case "quote":
                    return (
                      <div
                        key={i}
                        className="text-sm text-slate-400 italic border-l-2 border-slate-600 pl-3"
                      >
                        {line.content}
                      </div>
                    );
                  case "link":
                    return (
                      <div key={i} className="text-sm text-blue-400 underline">
                        {line.content}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </div>
      </section>

      {/* README の例 */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "実践: README を書く" : "Practice: Writing a README"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "OSSプロジェクトではREADME.mdが「玄関」です。プロジェクトの説明、セットアップ方法、使い方を書きます。上の「README例」タブでこのアプリのREADMEのイメージを確認してみましょう。"
              : "In OSS projects, README.md is the 'front door'. It describes the project, setup steps, and usage. Check the 'README Example' tab above to see an example for this app."}
          </p>
        </div>
      </section>
    </LessonLayout>
  );
}
