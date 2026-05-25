# ADR-0003: IndexedDB マイグレーション戦略

## ステータス

採用済み

## コンテキスト

IndexedDB はスキーマレスだが、インデックスやオブジェクトストアの追加にはバージョン変更が必要。アプリのバージョンアップに伴い、安全にスキーマを進化させる仕組みが求められた。

## 決定

バージョンベースの順次マイグレーション方式を採用する。

```typescript
// migrations.ts
const migrations: Record<number, MigrationFn> = {
  1: v1,  // 初期スキーマ（7ストア作成）
  // 2: v2,  // 将来のマイグレーション
};

function runMigrations(db, oldVersion, newVersion, tx) {
  for (let v = oldVersion + 1; v <= newVersion; v++) {
    migrations[v](db, tx);
  }
}
```

- `LATEST_VERSION` はマイグレーション定義から自動算出
- `IndexedDBClient` は `openDB` の `upgrade` コールバックで `runMigrations` を実行

## 結果

### メリット
- v1 → v3 のような飛び越しアップグレードも安全に実行
- 各マイグレーションが独立した関数で、テスト可能
- マイグレーション追加は `migrations` マップにエントリを追加するだけ

### トレードオフ
- IndexedDB の versionchange トランザクション内での制約（非同期処理の制限）
- ロールバック機能は未実装（将来必要なら ADR を追加）
