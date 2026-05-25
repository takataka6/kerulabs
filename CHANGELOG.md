# 変更履歴

このプロジェクトのすべての注目すべき変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいており、
[Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [Unreleased]

### Changed

- **背景画像フィルター**: 背景画像のぼかし（blur）を廃止し、彩度（0–100%）と明度（0–150%）のスライダーに変更。ぼかしは `CanvasRenderingContext2D.filter` の挙動が環境によって不安定なため、より安定した CSS フィルター（`saturate` / `brightness`）へ置き換えた

### Removed

- **マッチプレビュー**: 試合の対戦カードを SNS 向け画像として生成する機能を現行アプリから削除

### Added

- **リリース運用**: タグ push から GitHub Release と Web / Electron アセットを作成する Release workflow、リリースノート抽出スクリプト、運用手順ドキュメントを追加
- **プラグインシステム**: レッスンプラグインの JSON インポート・管理機能（`PluginInteractor`, `IPluginRepository`, プラグイン管理ページ）
- **チームマニュアル**: チーム戦術マニュアルの作成・編集・Mermaid 図解対応（`TeamManualInteractor`, `TeamManualPage`）
- **スケッチオーバーレイ**: 3D フィールド上にペン・直線・矢印で描画できるスケッチ機能（レイヤー対応・IndexedDB 永続化）
- **アプリバックアップ**: IndexedDB 全データの JSON エクスポート/インポート・アトミックリストア（`AppBackupService`）
- **ユーザー設定永続化**: 言語・背景色・ピッチ色などの設定を IndexedDB に永続保存（`IPreferencesService`）
- **構造化ロギング**: IndexedDB ベースのログストア（`IndexedDBLogStore`）、`LogViewer` コンポーネント
- **エラーハンドリング基盤**: `AppError` 型階層、`handleError` ユーティリティ、`withErrorHandling` ラッパー
- **タイムラインエディタ**: 戦術アニメーションのタイムライン編集 UI
- **スケルトンローディング**: ローディング状態の Skeleton UI コンポーネント
- **画像クロップ**: プロフィール画像のクロップ・リサイズ機能（`ImageCropModal`）
- **選手一覧ビュー**: 選手視点カメラ切替・HUD 表示（`PlayerViewHUD`）
- **接続線表示**: フィールド上の選手間接続ライン描画（`PlayerConnectionLines`）
- **背景カスタマイズ**: 3D シーンの背景色・背景画像設定パネル（`BackgroundSettingsPanel`）
- **Undo/Redo**: 戦術編集のスナップショットベース Undo/Redo 機能
- **一括インポート**: チーム・選手の一括インポート機能（`BulkTeamImportModal`, `BulkImportForm`）
- **用語集インポート**: 用語集データの JSON インポート機能（`GlossaryImportModal`）
- **プログラミングレッスン**: コードラボの追加レッスン（Git、Markdown、Mermaid、CI、シングルトン、ファクトリ等）
- **TanStack Query 設定**: 共通クエリ設定の一元管理（`shared/config/tanstackQuery.ts`）
- **再生速度制御**: アニメーション再生速度のグローバル状態管理（`playbackSpeedStore`）
- **循環依存チェック**: `madge` による循環依存検出（`pnpm check:circular`）
- **ライセンスチェック**: GPL 等の非互換ライセンス検出（`pnpm check:licenses`）

## [0.1.0] - 2026-05-25

### Added

- **戦術シミュレーター**: 3D フィールド上で選手の動き・ボールパスをアニメーション再生する機能
- **フォーメーションエディタ**: ドラッグ&ドロップで選手のポジションを配置・編集する機能
- **マッチプレビュー**: 試合の対戦カードを SNS 向け画像として生成する機能
- **チーム用語辞典**: チーム内の戦術用語を登録・共有・管理する機能
- **コードラボ**: アプリのアーキテクチャを学習教材として提供する機能
- **チーム管理**: チーム情報・選手情報の登録・編集・削除
- **複数ゲームモード対応**: Football（11v11）、Futsal（5v5）、8人制（8v8）、ソサイチ（7v7）
- **多言語対応**: 日本語/英語の切り替え機能（i18n）
- **Electron デスクトップアプリ**: macOS/Windows/Linux 向けデスクトップアプリケーション
- **データ永続化**: IndexedDB によるクライアントサイドデータ保存
- **ファイルエクスポート/インポート**: 戦術データの JSON ファイル書き出し・読み込み
- **3D グラフィックス**: Three.js / React Three Fiber による 3D フィールド描画
- **クリーンアーキテクチャ**: Domain / Application / Infrastructure / Presentation の 4 層構造
- **DI コンテナ**: 依存性逆転の原則に基づくモジュールシングルトン方式の DI
- **Zod バリデーション**: ドメインエンティティの入力値バリデーション
- **DOMPurify サニタイゼーション**: ユーザー入力の XSS 対策
- **CSP 設定**: Electron 環境での Content Security Policy
- **Vitest ユニットテスト**: ドメイン・アプリケーション・インフラ層のテスト
- **Playwright E2E テスト**: ページ遷移・ユーザーフローのテスト
- **Storybook**: UI コンポーネントカタログとアクセシビリティテスト
- **ESLint + Prettier**: コード品質管理とフォーマット統一
- **Husky + lint-staged**: コミット時の自動リント・フォーマット
- **GitHub Actions CI**: 型チェック・リント・テストの自動実行

[Unreleased]: https://github.com/takataka6/kerulab/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/takataka6/kerulab/releases/tag/v0.1.0
