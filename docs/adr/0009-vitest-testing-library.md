# ADR-0009: Vitest + Testing Library によるテスト戦略

## ステータス

採用済み

## コンテキスト

Vite ベースのプロジェクトに最適なテスティングフレームワークの選定が必要だった。候補：

- **Jest**: 安定・広く普及、ESM 対応がやや弱い
- **Vitest**: Vite ネイティブ、ESM 対応、高速な HMR 統合

## 決定

Vitest を採用し、以下のテストスタックで構成する。

- **単体テスト**: Vitest + `@testing-library/react`
- **E2E テスト**: Playwright
- **a11y テスト**: `@storybook/test-runner` + `axe-playwright`

テスト戦略：
- ドメイン層: モックなしの純粋なユニットテスト
- アプリケーション層: リポジトリをモックした Interactor テスト
- インフラ層: `fake-indexeddb` を使用した統合テスト
- プレゼンテーション層: `renderHook` / `render` でフックとコンポーネントをテスト

## 結果

### メリット
- Vite の変換パイプラインを共有（設定の二重管理なし）
- ESM ネイティブで `vi.mock()` が高速
- `--coverage` で Istanbul カバレッジ統合
- テスト実行速度が Jest 比で約 2-3 倍高速

### トレードオフ
- Jest エコシステムの一部ライブラリが非互換の場合がある
- Vitest のエコシステムは Jest より小さい（ただし急速に拡大中）
