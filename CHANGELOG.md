# 変更履歴

このプロジェクトのすべての注目すべき変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいており、
[Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [Unreleased]

## [0.2.0] - 2026-05-30

### Changed

- **背景画像フィルター**: 背景画像のぼかし（blur）を廃止し、彩度（0–100%）と明度（0–150%）のスライダーに変更。Safari / iPad 互換性のため、`CanvasRenderingContext2D.filter` 依存を避けた実装へ切り替えた
- **フローチャートパネル UX**: フルハイト表示と外側クリックでのクローズに対応し、閲覧性と操作性を改善
- **CI**: GitHub Actions で Playwright ブラウザのキャッシュを追加し、CI の安定性を改善

### Removed

- **ステップ実行**: 戦術アニメーションを手動でステップ単位に進める機能を削除。通常の自動再生で十分なため、全アーキテクチャ層（Domain / Application / Infrastructure / Presentation）から関連コード約1,300行を除去

### Added

- **macOS 署名・公証**: GitHub Release の macOS 向け Electron 配布物に `Developer ID` 署名と Apple notarization を追加
- **PR テンプレート**: `UI/UX 改善` の変更種別を追加

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

[Unreleased]: https://github.com/takataka6/kerulab/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/takataka6/kerulab/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/takataka6/kerulab/releases/tag/v0.1.0
