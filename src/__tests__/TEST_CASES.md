# src テストケース一覧

## App.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| App | 初期化フロー | 初期化中はローディング画面を表示する |
| App | 初期化フロー | 日本語ブラウザではローディング文言が日本語で表示される |
| App | 初期化フロー | 英語ブラウザではローディング文言が英語で表示される |
| App | 初期化フロー | 初期化完了後にメインコンテンツが表示される |
| App | 初期化フロー | IndexedDB スキーマ初期化（getDB）が呼ばれる |
| App | 初期化フロー | PreferencesService の initialize が呼ばれる |
| App | 初期化フロー | configureContainer が全依存で呼ばれる |
| App | シードデータ | 初回起動: 全デフォルトフォーメーションがシードされる |
| App | シードデータ | 既存データあり: 不足フォーメーションのみ追加される |
| App | シードデータ | 全フォーメーションが既に存在する場合は追加しない |
| App | シードデータ | デフォルト戦術（非カスタム）は削除して再シードされる |
| App | シードデータ | カスタム戦術は削除されない |
| App | 初期化エラーハンドリング | DB 初期化失敗時に handleError が呼ばれ、エラー画面が表示される |
| App | 初期化エラーハンドリング | PreferencesService 初期化失敗時にも handleError が呼ばれる |
| App | 初期化エラーハンドリング | フォーメーションシード失敗時にも handleError が呼ばれる |
| App | ルーティング | '/' で HomePage が表示される |
| App | ルーティング | '/tactics-simulator' で TacticsViewerPage が表示される |
| App | ルーティング | '/glossary' で GlossaryPage が表示される |
| App | ルーティング | '/code-lab' で CodeLabPage が表示される |
| App | ルーティング | 未定義パスは '/' にリダイレクトされる |
| App | SkipLink（アクセシビリティ） | スキップリンクがレンダーされる |
| App | LogViewer トグル | 初期状態では LogViewer は非表示 |
| App | LogViewer トグル | Ctrl+Shift+L で LogViewer が表示される |
| App | LogViewer トグル | Ctrl+Shift+L を再度押すと LogViewer が非表示になる |
| App | LogViewer トグル | Ctrl+L（Shift なし）では LogViewer は表示されない |
| App | LogViewer トグル | Shift+L（Ctrl なし）では LogViewer は表示されない |
| App | PageLoader | ローディング中に aria-hidden のスピナーが表示される |
| App | クリーンアップ | アンマウント時にキーボードリスナーが削除される |
