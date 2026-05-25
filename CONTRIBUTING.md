# コントリビューションガイド

KeruLabs へのコントリビューションに興味を持っていただきありがとうございます。このドキュメントでは、開発環境のセットアップからプルリクエストの提出までの手順を説明します。

## 目次

- [開発環境セットアップ](#開発環境セットアップ)
- [コーディング規約](#コーディング規約)
- [ブランチ保護ルール](#ブランチ保護ルール)
- [ブランチ戦略](#ブランチ戦略)
- [PR の出し方](#pr-の出し方)
- [テストの実行方法](#テストの実行方法)
- [コミットメッセージ規約](#コミットメッセージ規約)
- [Issue とラベル運用](#issue-とラベル運用)

---

## 開発環境セットアップ

### 前提条件

| ツール | バージョン |
|--------|-----------|
| Node.js | 22.x 以上 |
| pnpm | 最新版推奨 |
| Git | 2.x 以上 |

### インストール手順

```bash
# 1. リポジトリをフォーク・クローン
git clone https://github.com/<your-username>/kerulabs.git
cd kerulabs

# 2. 依存パッケージのインストール
pnpm install

# 3. 開発サーバーの起動（Web版）
pnpm dev

# 4. Electron版で開発する場合
pnpm electron:dev
```

開発サーバーは `http://localhost:5173` で起動します。

### 主要コマンド一覧

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | Vite 開発サーバー起動 |
| `pnpm electron:dev` | Electron + Vite 同時起動 |
| `pnpm build` | TypeScript チェック + Vite ビルド |
| `pnpm build:electron` | Electron アプリのパッケージング |
| `pnpm type-check` | TypeScript 型チェック |
| `pnpm lint` | ESLint チェック |
| `pnpm lint:fix` | ESLint 自動修正 |
| `pnpm format` | Prettier 整形 |
| `pnpm format:check` | Prettier 整形チェック |
| `pnpm test` | Vitest ユニットテスト実行 |
| `pnpm test:coverage` | カバレッジ付きテスト実行 |
| `pnpm test:ui` | Vitest UI ダッシュボード |
| `pnpm test:a11y` | アクセシビリティテスト実行（Storybook） |
| `pnpm test:e2e` | Playwright E2E テスト |
| `pnpm test:e2e:ui` | Playwright E2E テスト（UI モード） |
| `pnpm check:circular` | 循環依存チェック（madge） |
| `pnpm check:licenses` | ライセンス互換性チェック |
| `pnpm storybook` | Storybook 開発サーバー起動 |
| `pnpm build-storybook` | Storybook ビルド |

---

## コーディング規約

### TypeScript

- **strict モード**を有効にしています（`tsconfig.json`）
- `noUnusedLocals: true` — 未使用のローカル変数は禁止
- `noUnusedParameters: true` — 未使用のパラメータは禁止
- `noFallthroughCasesInSwitch: true` — switch 文のフォールスルー禁止
- `@typescript-eslint/no-explicit-any: "error"` — `any` 型の使用は禁止

### ESLint

以下のルールセットを採用しています:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `react-hooks` recommended
- `react-refresh` （HMR 対応）
- `eslint-config-prettier` （Prettier との競合回避）
- `eslint-plugin-storybook` （Storybook 対応）

```bash
# Lint チェック
pnpm lint

# 自動修正
pnpm lint:fix
```

### Prettier

- セミコロン: あり
- クォート: ダブルクォート
- インデント: 2 スペース
- 対象ファイル: `*.ts`, `*.tsx`, `*.css`, `*.json`

```bash
# フォーマット実行
pnpm format

# フォーマットチェック（CI 用）
pnpm format:check
```

### Git フック（Husky + lint-staged）

コミット時に以下が自動実行されます:

- `*.ts`, `*.tsx` ファイル: ESLint 自動修正 + Prettier 整形
- `*.css`, `*.json` ファイル: Prettier 整形

### アーキテクチャ

クリーンアーキテクチャに基づく 4 層構造を遵守してください:

```
src/
├── domain/          # ドメイン層（外部依存なし）
├── application/     # アプリケーション層（ユースケース・サービス）
├── infrastructure/  # インフラ層（永続化・外部サービス）
├── presentation/    # プレゼンテーション層（UI）
└── shared/          # 共有ユーティリティ（i18n, logger, constants, errors, config, utils）
```

依存方向: `Presentation -> Application -> Domain <- Infrastructure`

> 詳細なディレクトリ構成は [README.md](../README.md#アーキテクチャ) を参照してください。

---

## ブランチ保護ルール

`main` ブランチには以下の保護ルールが適用されています:

- `main` への直接プッシュ禁止（必ず PR 経由）
- Force push・ブランチ削除の禁止
- PR マージには **1 名以上のレビュー承認** と **CODEOWNERS の承認** が必要
- すべての CI ステータスチェック（ci, e2e, a11y, sbom, semgrep）の成功が必須

---

## ブランチ戦略

### ブランチ命名規則

| 種類 | フォーマット | 例 |
|------|-------------|-----|
| 機能追加 | `feature/<説明>` | `feature/add-player-stats` |
| バグ修正 | `fix/<説明>` | `fix/formation-editor-crash` |
| ドキュメント | `docs/<説明>` | `docs/update-readme` |
| リファクタリング | `refactor/<説明>` | `refactor/extract-use-case` |
| テスト | `test/<説明>` | `test/add-tactic-tests` |
| CI/CD | `ci/<説明>` | `ci/add-coverage-check` |

### ワークフロー

1. `main` ブランチから新しいブランチを作成
2. 変更を実装・コミット
3. `main` ブランチの最新を取り込み（rebase 推奨）
4. プルリクエストを作成

```bash
# 新しいブランチを作成
git checkout main
git pull origin main
git checkout -b feature/my-new-feature

# 作業完了後、main の最新を取り込み
git fetch origin
git rebase origin/main

# プッシュ
git push origin feature/my-new-feature
```

---

## PR の出し方

### プルリクエスト作成手順

1. **フォーク**して自分のリポジトリにクローン
2. ブランチ戦略に従い**ブランチを作成**
3. 変更を実装し、**テストが通ること**を確認
4. コミットメッセージ規約に従い**コミット**
5. GitHub 上で**プルリクエストを作成**

### PR に含めるべき内容

- **変更の概要**: 何を変更したか簡潔に説明
- **変更の理由**: なぜこの変更が必要か
- **テスト方法**: どのようにテストしたか
- **スクリーンショット**: UI 変更がある場合は添付
- **関連 Issue**: 関連する Issue 番号（`Closes #123`）

### PR チェックリスト

- [ ] `pnpm type-check` が通る
- [ ] `pnpm lint` が通る
- [ ] `pnpm format:check` が通る
- [ ] `pnpm test` が通る
- [ ] `pnpm check:circular` が通る（循環依存なし）
- [ ] 新機能にはテストを追加した
- [ ] 破壊的変更がある場合はドキュメントを更新した

---

## Issue とラベル運用

公開リポジトリ移行後の Issue triage 方針は [docs/issue-triage.md](docs/issue-triage.md) にまとめています。

- `bug` / `enhancement` / `documentation` / `question` を基本カテゴリにします
- 優先度は `priority:high` / `priority:medium` / `priority:low` を使います
- 外部貢献向けには `good first issue` と `help wanted` を使い分けます
- 範囲の見通しをよくするため `area:*` ラベルを併用します

---

## テストの実行方法

### ユニットテスト（Vitest）

```bash
# テスト実行（ウォッチモード）
pnpm test

# テスト実行（単発）
pnpm test -- --run

# カバレッジ付きテスト実行
pnpm test:coverage

# Vitest UI ダッシュボード
pnpm test:ui
```

### アクセシビリティテスト（Storybook + axe）

```bash
# Storybook を起動した状態で実行
pnpm storybook  # 別ターミナルで
pnpm test:a11y
```

### E2E テスト（Playwright）

```bash
# E2E テスト実行
pnpm test:e2e

# E2E テスト（UI モード）
pnpm test:e2e:ui
```

### テスト構成

```
テスト（177ファイル / 2693テスト）
├── ユニットテスト (Vitest)
│   ├── domain/         # エンティティ、値オブジェクト、イベント
│   ├── application/    # Interactor（ユースケース）、サービス、スキーマ
│   ├── infrastructure/ # リポジトリ、スキーマ、ファクトリ、ログ、サービス
│   ├── presentation/   # コンポーネント、フック、コンテキスト、ページ
│   └── shared/         # 定数、エラー、ユーティリティ、Logger
│
├── アクセシビリティテスト (Storybook + axe) — 38ストーリーファイル
│   └── *.stories.tsx   # コンポーネントストーリー
│
└── E2E テスト (Playwright) — 9ファイル / 77テスト
    └── e2e/            # ページ遷移、ユーザーフロー、CRUD操作
```

### テスト作成のガイドライン

- 新しい機能には必ずユニットテストを追加してください
- UI コンポーネントには Storybook ストーリーの追加を推奨します
- テストファイルは対象ファイルと同じディレクトリの `__tests__` フォルダに配置してください
- テストファイル名は `<対象ファイル名>.test.ts(x)` としてください

---

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に準拠します。

### フォーマット

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### type 一覧

| type | 説明 |
|------|------|
| `feat` | 新機能の追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更（空白、フォーマットなど） |
| `refactor` | バグ修正でも機能追加でもないコード変更 |
| `perf` | パフォーマンス改善 |
| `test` | テストの追加・修正 |
| `build` | ビルドシステムや外部依存に関する変更 |
| `ci` | CI 設定の変更 |
| `chore` | その他の変更（ソースやテストの変更を含まない） |

### scope の例

- `domain` — ドメイン層の変更
- `application` — アプリケーション層の変更
- `infrastructure` — インフラ層の変更
- `presentation` — プレゼンテーション層の変更
- `electron` — Electron 関連の変更
- `i18n` — 国際化関連の変更
- `deps` — 依存パッケージの更新

### 例

```
feat(presentation): フォーメーションエディタにドラッグ&ドロップ機能を追加

選手アイコンをドラッグ&ドロップでフィールド上の任意の位置に配置できるようにした。
React DnD を使用。

Closes #42
```

```
fix(domain): チーム作成時のバリデーションエラーを修正
```

```
docs: CONTRIBUTING.md を追加
```

### 破壊的変更

破壊的変更がある場合は、type の後に `!` を付けるか、フッターに `BREAKING CHANGE:` を記述してください:

```
feat(domain)!: GameMode の値を列挙型に変更

BREAKING CHANGE: GameMode が文字列リテラルから列挙型に変更されました。
既存のコードで文字列として使用している箇所は修正が必要です。
```

---

## 質問・相談

開発に関する質問や相談は、GitHub Issues または Discussions でお気軽にどうぞ。
