/**
 * @module GitBasicsLesson
 * @description レッスン: Git基本操作。add → commit → push の流れでバージョン管理の基本を学ぶ。
 */
import { useState } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { LessonLayout } from "../LessonLayout";
import { CodeBlock } from "../CodeBlock";
import { MermaidFlowchart } from "@presentation/components/ui";

const CLONE_CODE = `# リポジトリをコピーする

# clone: リモートリポジトリをローカルにコピー
$ git clone https://github.com/user/kerulabs.git

# → kerulabs/ ディレクトリが作成される
# → コード、コミット履歴、ブランチが全てコピーされる
# → すぐに開発を始められる

$ cd kerulabs
$ pnpm install    # 依存関係をインストール
$ pnpm dev        # 開発サーバーを起動`;

const FORK_CODE = `# Fork: 他の人のリポジトリを自分のアカウントにコピー
#
# clone と Fork の違い:
#
#   clone = リポジトリをローカルにコピー
#   Fork  = リポジトリを自分のGitHubアカウントにコピー
#
# OSSに貢献する流れ:
#
# 1. Fork（GitHubの画面で「Fork」ボタン）
#    → 自分のアカウントにコピーが作られる
#
# 2. clone（自分のForkをローカルに取得）
#    $ git clone https://github.com/自分/kerulabs.git
#
# 3. ブランチを作って変更
#    $ git checkout -b fix/improve-lesson
#
# 4. push（自分のForkに送信）
#    $ git push origin fix/improve-lesson
#
# 5. Pull Request（元のリポジトリに変更を提案）`;

const CONCEPT_CODE = `# Git = コードの「タイムマシン」
#
# 変更の履歴を記録し、いつでも過去に戻れる

# 4つのエリア:
# 作業ディレクトリ → ステージング → リポジトリ → リモート
# (Working Dir)    (Staging)     (Local Repo)  (Remote)
#
# git add    : 変更をステージングに追加
# git commit : ステージングの内容を履歴として記録
# git push   : ローカルの履歴をリモートに送信`;

const STATUS_CODE = `# 変更の状態を確認する
$ git status

# 出力例:
On branch main
Changes not staged for commit:
  modified:   src/domain/entities/Player.ts
  modified:   src/presentation/pages/CodeLabPage.tsx

Untracked files:
  src/presentation/components/code-lab/lessons/NewLesson.tsx

# modified = 変更されたファイル
# Untracked = 新規作成されたファイル（まだ追跡対象外）`;

const ADD_CODE = `# ステージングに追加する（コミットする変更を選ぶ）

# 特定のファイルだけ追加
$ git add src/domain/entities/Player.ts

# 複数ファイルを追加
$ git add src/domain/entities/Player.ts src/presentation/pages/CodeLabPage.tsx

# ディレクトリごと追加
$ git add src/presentation/components/code-lab/

# 全ての変更を追加（注意して使う）
$ git add .

# ポイント:
# - コミットしたい変更だけを選んで add する
# - .env や credentials.json は追加しない`;

const COMMIT_CODE = `# 変更を履歴として記録する

# コミットメッセージ付きで保存
$ git commit -m "選手のバリデーションを追加"

# 良いコミットメッセージの例:
$ git commit -m "fix: 背番号が0未満のときのエラーを修正"
$ git commit -m "feat: コードラボにGitレッスンを追加"
$ git commit -m "test: Playerエンティティのテストを追加"

# コミットメッセージの慣例（Conventional Commits）:
# fix:    バグ修正
# feat:   新機能
# test:   テストの追加・修正
# docs:   ドキュメント変更
# refactor: リファクタリング`;

const PUSH_CODE = `# リモートリポジトリに送信する

# 現在のブランチをリモートに送信
$ git push

# 初回は上流ブランチを設定
$ git push -u origin feature/add-git-lesson

# push すると:
# 1. リモートリポジトリ（GitHub等）にコードが反映
# 2. CI が自動で実行される（テスト、Lint等）
# 3. チームメンバーが変更を取得できるようになる`;

const LOG_CODE = `# 変更履歴を見る
$ git log --oneline

# 出力例（このアプリの実際の履歴）:
ab340b6 file format
d397776 Merge pull request #50
485296f remove preview
76f304a 戦術作成時にペナルティエリアの線が消える
ec7b81a Merge pull request #49
871ae4c Fix: セットプレー戦術の保存エラーを修正

# 各行 = 1つのコミット
# 左の英数字 = コミットID（ハッシュ）
# 右のテキスト = コミットメッセージ`;

const DIFF_CODE = `# 変更内容を見る
$ git diff

# 出力例:
- if (props.number < 0 || props.number > 99) {
+ if (props.number < 1 || props.number > 99) {

# - （赤）= 削除された行
# + （緑）= 追加された行

# ステージング済みの差分を見る
$ git diff --staged`;

type Step = "status" | "add" | "commit" | "push";

export function GitBasicsLesson() {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>("status");
  const ja = language === "ja";

  const steps: {
    key: Step;
    label: string;
    labelEn: string;
    command: string;
  }[] = [
    {
      key: "status",
      label: "状態確認",
      labelEn: "Check Status",
      command: "git status",
    },
    { key: "add", label: "追加", labelEn: "Stage", command: "git add" },
    { key: "commit", label: "記録", labelEn: "Commit", command: "git commit" },
    { key: "push", label: "送信", labelEn: "Push", command: "git push" },
  ];

  return (
    <LessonLayout lessonId="git-basics">
      <div className="mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          📚
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          {ja ? "Git 基本操作" : "Git Basic Operations"}
        </h1>
        <p className="text-slate-400">
          {ja
            ? "Git はコードの変更履歴を管理するツールです。「いつ、誰が、何を変えたか」を記録し、いつでも過去の状態に戻れます。"
            : "Git is a tool for managing code change history. It records 'when, who, and what changed', and lets you revert to any past state."}
        </p>
      </div>

      {/* clone と Fork */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "始め方: clone と Fork" : "Getting Started: clone & Fork"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="text-blue-400 font-bold text-sm mb-1">
              git clone
            </div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "リモートリポジトリをローカルにコピーする。チームの開発リポジトリを取得するときに使う"
                : "Copy a remote repository to local. Used to get the team's development repository"}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-emerald-400 font-bold text-sm mb-1">Fork</div>
            <div className="text-slate-400 text-xs">
              {ja
                ? "他の人のリポジトリを自分のアカウントにコピーする。OSSに貢献するときに使う"
                : "Copy someone else's repository to your account. Used when contributing to OSS"}
            </div>
          </div>
        </div>
        <CodeBlock code={CLONE_CODE} highlightLines={[4, 10, 11, 12]} />
        <div className="mt-4">
          <CodeBlock code={FORK_CODE} highlightLines={[11, 14, 17, 20, 22]} />
        </div>
      </section>

      {/* 3つのエリア */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "3つのエリア" : "Three Areas"}
        </h2>
        <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 mb-4 overflow-auto">
          <MermaidFlowchart
            chart={`graph LR
  A["${ja ? "作業ディレクトリ" : "Working Directory"}"] -->|git add| B["${ja ? "ステージング" : "Staging Area"}"]
  B -->|git commit| C["${ja ? "リポジトリ" : "Repository"}"]
  C -->|git push| D["${ja ? "リモート" : "Remote"}"]`}
            className="w-full"
          />
        </div>
        <CodeBlock code={CONCEPT_CODE} highlightLines={[9, 10, 11]} />
      </section>

      {/* ステップバイステップ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "基本の流れ" : "Basic Workflow"}
        </h2>

        {/* ステップインジケーター */}
        <div className="flex gap-1 mb-4">
          {steps.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setCurrentStep(s.key)}
              className={`flex-1 p-3 rounded-lg text-center transition-all ${
                currentStep === s.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              <div className="text-xs font-bold mb-1">
                {i + 1}. {ja ? s.label : s.labelEn}
              </div>
              <div className="font-mono text-xs opacity-70">{s.command}</div>
            </button>
          ))}
        </div>

        {currentStep === "status" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "まず git status で「今どのファイルが変更されているか」を確認します。Git が追跡しているファイルの変更状態が一覧表示されます。"
                  : "First, check which files have changed with git status. It shows the change status of all files Git is tracking."}
              </p>
            </div>
            <CodeBlock code={STATUS_CODE} highlightLines={[2, 7, 8, 11]} />
          </>
        )}
        {currentStep === "add" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "git add でコミットしたいファイルを「ステージングエリア」に移します。全ての変更をコミットする必要はなく、関連する変更だけを選べます。"
                  : "git add moves files you want to commit to the 'staging area'. You don't need to commit all changes — you can select only related changes."}
              </p>
            </div>
            <CodeBlock code={ADD_CODE} highlightLines={[4, 7, 10, 13]} />
          </>
        )}
        {currentStep === "commit" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "git commit でステージングした変更を「履歴」として永久に記録します。メッセージには「何をしたか」を簡潔に書きます。"
                  : "git commit permanently records staged changes as 'history'. The message briefly describes what you did."}
              </p>
            </div>
            <CodeBlock code={COMMIT_CODE} highlightLines={[4, 7, 8, 9]} />
          </>
        )}
        {currentStep === "push" && (
          <>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
              <p className="text-slate-300 text-sm">
                {ja
                  ? "git push でローカルのコミットをリモートリポジトリに送信します。push するとCIが自動実行され、チームメンバーが変更を取得できます。"
                  : "git push sends your local commits to the remote repository. This triggers CI and allows team members to pull your changes."}
              </p>
            </div>
            <CodeBlock code={PUSH_CODE} highlightLines={[4, 7]} />
          </>
        )}
      </section>

      {/* 履歴と差分 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "履歴を見る: git log" : "View History: git log"}
        </h2>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <p className="text-slate-300 text-sm">
            {ja
              ? "git log で過去のコミット一覧を確認できます。以下はこのアプリの実際のコミット履歴です。"
              : "git log shows all past commits. Below is the actual commit history of this app."}
          </p>
        </div>
        <CodeBlock code={LOG_CODE} highlightLines={[2, 5, 6, 7, 8, 9, 10]} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">
          {ja ? "変更内容を見る: git diff" : "View Changes: git diff"}
        </h2>
        <CodeBlock code={DIFF_CODE} highlightLines={[2, 5, 6]} />
      </section>
    </LessonLayout>
  );
}
