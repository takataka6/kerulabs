# リリースと配布

KeruLabs は `vX.Y.Z` 形式の Git タグを起点に GitHub Release を作成します。タグが push されると、Web 版の zip と macOS / Windows 向け Electron ビルドが GitHub Releases に添付されます。

## 利用者向けガイド

### リリースチャネル

- `stable`: `v0.2.0` のような正式リリース
- `preview`: `v0.2.0-beta.1` のような事前公開版

`preview` は新機能検証向けです。安定運用を優先する場合は `stable` を選んでください。

### 配布アセット

| 配布形態 | 取得物 | 想定環境 | 補足 |
|----------|--------|----------|------|
| Web 版 | `kerulabs-web-vX.Y.Z.zip` | 最新の Chromium / Safari / Firefox | 静的ファイル一式。ローカル preview または任意サーバーで配信 |
| macOS 版 | `.dmg`, `.zip` | Apple Silicon Mac | Electron アプリ。Developer ID 署名済み、Apple notarization 済み |
| Windows 版 | `.exe`, `.zip` | Windows 11 | Electron アプリ。現状は未署名 |

### インストール時の注意

- まず試すだけなら Web 版が最も扱いやすいです。
- Windows 版は SmartScreen による警告が出る場合があります。

### macOS の初回起動

`KeruLabs.app` を `Applications` に移動して通常どおり起動できます。配布物は署名と公証が有効な前提です。

### GitHub Release 本文の見方

各 Release には次の情報を掲載します。

- リリースチャネル
- ダウンロード可能なアセット一覧
- 代表的な利用価値
- インストール時の注意
- 既知の制約
- 対応する `CHANGELOG.md` の更新内容

## メンテナー向け運用

### バージョン規約

- バージョンは Semantic Versioning に従います。
- Git タグは `v0.2.0` のように `v` プレフィックスを付けます。
- `package.json` の `version` とタグのバージョンは一致させます。
- `CHANGELOG.md` には `## [0.2.0] - YYYY-MM-DD` 形式の節を作成します。

### リリース手順

1. `main` を最新化します。

```bash
git switch main
git pull
```

2. リリース用ブランチを作成します。

```bash
git switch -c release/v0.2.0
```

3. `package.json` の `version` と `CHANGELOG.md` を更新し、検証を実行します。

```bash
pnpm type-check
pnpm lint
pnpm format:check
pnpm test:coverage
pnpm build
```

4. 変更をコミットして PR を作成します。

```bash
git add package.json CHANGELOG.md
git commit -m "chore: prepare v0.2.0 release"
git push -u origin release/v0.2.0
```

5. PR を `main` にマージ後、タグを作成して push します。

```bash
git switch main
git pull
git tag v0.2.0
git push origin v0.2.0
```

6. GitHub Actions の `Release` workflow が完了したら、作成された GitHub Release の本文、アセット、チャネル表記を確認します。

### macOS 署名と公証

`Release` workflow の macOS ジョブは、次の GitHub Actions secrets を使って `electron-builder` で署名と公証を行います。

- `MAC_CSC_LINK`: `Developer ID Application` 証明書を export した `.p12` の base64
- `MAC_CSC_KEY_PASSWORD`: `.p12` export 時のパスワード
- `APPLE_ID`: notarization に使う Apple ID
- `APPLE_APP_SPECIFIC_PASSWORD`: Apple ID の app-specific password
- `APPLE_TEAM_ID`: Apple Developer Team ID

これらが欠けている場合、`forceCodeSigning: true` により macOS リリースビルドは失敗します。

### リリース本文の生成

Release workflow は `scripts/extract-release-notes.mjs` を使って本文を生成します。`.github/release-body.md` が存在する場合はそのテンプレートと `CHANGELOG.md` の該当節を結合し、存在しない場合はスクリプト内のデフォルトテンプレートを使います。

例: `v0.2.0` の場合、`CHANGELOG.md` に次の節が必要です。

```markdown
## [0.2.0] - 2026-05-21

### Added

- ...
```

該当節がない、または `package.json` の `version` とタグが一致しない場合、Release workflow は失敗します。

### 手動実行

タグ push 後に workflow を再実行したい場合は、GitHub Actions の `Release` workflow から `workflow_dispatch` を選び、対象タグを入力します。
