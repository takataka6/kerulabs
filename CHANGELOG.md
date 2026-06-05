# 変更履歴

このプロジェクトのすべての注目すべき変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいており、
[Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [Unreleased]

## [0.4.2] - 2026-06-06

### Changed

- **公開向けドキュメント整備**: README、CONTRIBUTING、SECURITY、リリース運用ドキュメント、および PR テンプレートを現行の公開運用に合わせて整理
- **相手チーム選択 UX**: 相手チーム設定ポップアップから `チーム編集` ボタンを削除し、該当チームのページで編集する案内文へ置き換えて導線を明確化

### Fixed

- **初期データのフォーメーションとセットプレー名**: サンプルデータのフォーメーション定義とセットプレー初期名を修正し、期待どおりの初期状態で扱えるよう改善
- **戦術マーカーの複数選択移動**: マルチ選択した戦術マーカーの移動結果が実行状態へ正しく反映されるよう修正
- **依存関係の監査対応**: `react-router-dom` を更新し、依存関係監査で検出された問題に対応

## [0.4.1] - 2026-06-03

### Fixed

- **選手管理の登録人数表示**: 選手削除後の登録人数表示を安定化し、E2E で更新を確実に検証できるよう改善

## [0.4.0] - 2026-06-03

### Added

- **3D テキストレンダリングの最適化**: `@react-three/drei` の `Text` コンポーネントをカスタムの `CanvasText` に置き換え、メモリリークを抑止しレンダリングパフォーマンスを向上

### Changed

- **OSS 公開準備**: セキュリティポリシー、行動規範、リリース運用ドキュメントを実装と一致する内容へ更新
- **CSP / Security Headers**: Web / Electron のレンダラーに Content Security Policy と基本的なセキュリティヘッダーを追加
- **Dependabot 設定**: `.github/dependabot.yml` の設定を強化

### Fixed

- **E2E テスト**: E2E テストのセレクター修正および Canvas ロードのタイムアウト時間を延長
- **パッケージロックファイル**: 不要な `package-lock.json` を削除し、`pnpm-lock.yaml` に統一

## [0.3.0] - 2026-05-31

### Added

- **OGP / Twitter Card**: `kerulabs.dev` 向けに OGP / Twitter Card メタデータを追加し、共有用画像 `ogp-card.png` を公開アセットとして追加
- **国旗表示**: チーム作成 / 編集で国旗表示に対応し、国選択 UI と国データを拡充
- **フォーメーション拡充**: 初期データへサッカー用フォーメーションを追加し、戦術ビューで選びやすいコンパクトなセレクタ UI を導入
- **名前ラベル固定モード**: 選手名ラベルを画面正面へ向け続ける Billboard モードを追加
- **チームヘッダーグラデーション**: チーム表示に使うヘッダーグラデーション定数を追加

### Changed

- **相手選手配置ワークフロー**: 配置ポップアップの操作フローを改善し、右カラムとポップアップの責務を整理
- **チーム国選択 UX**: 国入力フローを簡素化し、作成 / 編集画面の操作量を削減
- **README**: 戦術 UI 画像とデモ GIF を更新し、ログ確認ガイドを追加

### Fixed

- **Player View ボタン表示**: player view モード中に `Player View` ボタンがアクティブ表示されない問題を修正
- **Semgrep 誤検知**: `canonical` link に対する `missing-integrity` の誤検知を抑止

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

[Unreleased]: https://github.com/takataka6/kerulabs/compare/v0.4.2...HEAD
[0.4.2]: https://github.com/takataka6/kerulabs/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/takataka6/kerulabs/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/takataka6/kerulabs/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/takataka6/kerulabs/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/takataka6/kerulabs/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/takataka6/kerulabs/releases/tag/v0.1.0
