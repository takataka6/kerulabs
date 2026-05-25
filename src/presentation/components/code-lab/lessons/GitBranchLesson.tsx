/**
 * @module GitBranchLesson
 * @description レッスン: ブランチとマージ。ブランチの作成・切り替え・マージとPRの流れを学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { MermaidFlowchart } from "@presentation/components/ui";

const CREATE_CODE = `# ブランチを作って切り替える

# 新しいブランチを作成＋切り替え
$ git checkout -b feature/add-git-lesson

# 今いるブランチを確認
$ git branch
  main
* feature/add-git-lesson    ← 今ここ

# ブランチ名の慣例:
# feature/○○  → 新機能
# fix/○○      → バグ修正
# refactor/○○ → リファクタリング`;

const SWITCH_CODE = `# ブランチを切り替える

# main に戻る
$ git switch main

# 作業ブランチに戻る
$ git switch feature/add-git-lesson

# 注意:
# - 切り替え前に変更をコミットしておく
# - コミットしていない変更は切り替え先に持ち越される
#   （コンフリクトが起きることもある）`;

const MERGE_CODE = `# ブランチをマージ（統合）する

# 1. main に切り替え
$ git switch main

# 2. feature ブランチを main に取り込む
$ git merge feature/add-git-lesson

# → feature の全コミットが main に統合される
# → 上の Mermaid 図で流れを確認しよう`;

const PR_CODE = `# Pull Request (PR) の流れ
#
# 直接 main にマージするのではなく、
# PR を作ってレビューを受けてからマージする
#
# 1. feature ブランチで作業＆コミット
$ git add .
$ git commit -m "feat: Gitレッスンを追加"

# 2. リモートに push
$ git push -u origin feature/add-git-lesson

# 3. GitHub で PR を作成
#    - タイトル: "Gitレッスンを追加"
#    - 説明: 変更内容、テスト方法
#    - レビュアーを指定

# 4. CI が自動実行される
#    ✅ Lint, Test, Build → 全て通過

# 5. レビュー＆承認後にマージ
#    → main に統合される`;

const CONFLICT_CODE = `# コンフリクト（衝突）の解消
#
# 同じファイルの同じ場所を別々に変更するとコンフリクトが起きる

# コンフリクトしたファイルの中身:
<<<<<<< HEAD
const MAX_NUMBER = 99;
=======
const MAX_NUMBER = 100;
>>>>>>> feature/change-max

# 解消方法:
# 1. どちらの変更を採用するか決める
# 2. <<<<<<< と ======= と >>>>>>> を削除
# 3. 正しいコードにする:
const MAX_NUMBER = 99;
# 4. git add → git commit`;

type View = "concept" | "create" | "pr" | "conflict";

export function GitBranchLesson() {
  const { language } = useLanguage();
  const [view, setView] = useState<View>("concept");
  const ja = language === "ja";

  const views: { key: View; label: string; labelEn: string }[] = [
    { key: "concept", label: "ブランチとは", labelEn: "What are Branches" },
    { key: "create", label: "作成と切り替え", labelEn: "Create & Switch" },
    { key: "pr", label: "Pull Request", labelEn: "Pull Request" },
    { key: "conflict", label: "コンフリクト", labelEn: "Conflicts" },
  ];

  return (
    <LessonLayout lessonId="git-branch">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🌿
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "ブランチとマージ" : "Branches & Merging"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "ブランチは「main を壊さずに新しい機能を開発する仕組み」です。作業が完成したら Pull Request を通じてレビューし、main にマージします。"
            : "Branches let you develop new features without breaking main. When done, you create a Pull Request for review, then merge into main."}
        </p>
      </div>

      {/* このアプリでの運用 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "このアプリでのブランチ運用" : "Branch Strategy in This App"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-emerald-400 font-bold text-sm mb-1">main</div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "常に動作する安定版。直接コミットせず、PRを通じてのみ変更"
                : "Always working, stable. Changes only through PRs, never direct commits"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="text-blue-400 font-bold text-sm mb-1">
              feature/*
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "新機能の開発用。例: feature/add-git-lesson"
                : "For developing new features. Ex: feature/add-git-lesson"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-amber-400 font-bold text-sm mb-1">fix/*</div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "バグ修正用。例: fix/player-validation"
                : "For bug fixes. Ex: fix/player-validation"}
            </div>
          </div>
        </div>
      </section>

      {/* タブ切り替え */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "ブランチ操作" : "Branch Operations"}
        </h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {views.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                view === v.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {ja ? v.label : v.labelEn}
            </button>
          ))}
        </div>

        {view === "concept" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "ブランチは main の「コピー」を作って独立して作業する仕組みです。main には影響を与えず、完成したら統合（マージ）します。"
                  : "A branch creates a 'copy' of main to work on independently. It doesn't affect main, and is merged back when complete."}
              </p>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 mb-4 overflow-auto">
              <MermaidFlowchart
                chart={`gitGraph
  commit id: "init"
  commit id: "feat: setup"
  branch feature/add-lesson
  commit id: "add lesson 1"
  commit id: "add lesson 2"
  commit id: "add tests"
  checkout main
  commit id: "other work"
  merge feature/add-lesson id: "Merge PR #51"
  commit id: "next task"`}
                className="w-full"
              />
            </div>
            <CodeBlock code={MERGE_CODE} highlightLines={[4, 7]} />
          </>
        )}
        {view === "create" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "checkout -b で新しいブランチを作成して同時に切り替えます。switch で既存のブランチに切り替えられます。"
                  : "checkout -b creates a new branch and switches to it. Use switch to move between existing branches."}
              </p>
            </div>
            <CodeBlock code={CREATE_CODE} highlightLines={[4, 7, 8, 9]} />
            <div className="mt-4">
              <CodeBlock code={SWITCH_CODE} highlightLines={[4, 7]} />
            </div>
          </>
        )}
        {view === "pr" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm mb-3">
                {ja
                  ? "Pull Request（PR）は「このブランチの変更を main に取り込んでほしい」というリクエストです。コードレビューとCIチェックを経てマージします。"
                  : "A Pull Request (PR) is a request to merge your branch's changes into main. It goes through code review and CI checks before merging."}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    step: "1",
                    text: ja ? "ブランチで作業" : "Work on branch",
                    color: "bg-blue-500/20 text-blue-400",
                  },
                  {
                    step: "2",
                    text: ja ? "push" : "push",
                    color: "bg-violet-500/20 text-violet-400",
                  },
                  {
                    step: "3",
                    text: ja ? "PR作成" : "Create PR",
                    color: "bg-amber-500/20 text-amber-400",
                  },
                  {
                    step: "4",
                    text: ja ? "CI実行" : "CI runs",
                    color: "bg-emerald-500/20 text-emerald-400",
                  },
                  {
                    step: "5",
                    text: ja ? "レビュー" : "Review",
                    color: "bg-pink-500/20 text-pink-400",
                  },
                  {
                    step: "6",
                    text: ja ? "マージ" : "Merge",
                    color: "bg-green-500/20 text-green-400",
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${s.color}`}
                  >
                    {s.step}. {s.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 mb-4 overflow-auto">
              <MermaidFlowchart
                chart={`gitGraph
  commit id: "init"
  commit id: "v1.0"
  branch feature/add-lesson
  commit id: "add lesson"
  commit id: "add tests"
  checkout main
  commit id: "hotfix"
  checkout feature/add-lesson
  commit id: "fix review"
  checkout main
  merge feature/add-lesson id: "Merge PR" type: HIGHLIGHT`}
                className="w-full"
              />
            </div>
            <CodeBlock code={PR_CODE} highlightLines={[7, 8, 11, 19, 22]} />
          </>
        )}
        {view === "conflict" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "2人が同じファイルの同じ場所を変更するとコンフリクト（衝突）が起きます。Git がマーカーを入れてくれるので、どちらを採用するか手動で決めます。"
                  : "When two people change the same place in the same file, a conflict occurs. Git adds markers so you can manually decide which change to keep."}
              </p>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 mb-4 overflow-auto">
              <MermaidFlowchart
                chart={`gitGraph
  commit id: "init"
  branch feature/change-max
  commit id: "MAX=100"
  checkout main
  commit id: "MAX=99"
  merge feature/change-max id: "CONFLICT!" type: REVERSE`}
                className="w-full"
              />
            </div>
            <CodeBlock
              code={CONFLICT_CODE}
              highlightLines={[6, 7, 8, 9, 10, 18]}
            />
          </>
        )}
      </section>
    </LessonLayout>
  );
}
