# ADR-0002: IndexedDB による永続化

## ステータス

採用済み

## コンテキスト

クライアントサイドのみで動作するオフラインファーストアプリとして、永続化レイヤーの選択が必要だった。候補：

- **localStorage**: 5MB 制限、構造化クエリ不可
- **SQLite (sql.js / wa-sqlite)**: WASM 依存、バンドルサイズ増加
- **IndexedDB**: ブラウザ標準、構造化データ対応、トランザクション対応

## 決定

IndexedDB を `idb` ライブラリ（TypeScript ラッパー）経由で使用する。

7 つのオブジェクトストア（teams, players, formations, tactics, preferences, sketches, glossaries）を定義し、インデックスによる効率的なクエリを実現する。

## 結果

### メリット
- サーバー不要で完全オフライン動作
- 50MB+ の大容量ストレージ
- インデックスによるフェーズ別・チーム別クエリが高速
- トランザクションによるアトミックなインポート/エクスポート
- Web / Electron 両環境で動作

### トレードオフ
- IndexedDB API は低レベルで複雑（`idb` ラッパーで緩和）
- スキーママイグレーションを自前で管理する必要がある（→ ADR-0003）
- テスト時に `fake-indexeddb` が必要
