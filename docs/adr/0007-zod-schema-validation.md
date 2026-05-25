# ADR-0007: Zod によるランタイムスキーマ検証

## ステータス

採用済み

## コンテキスト

IndexedDB はスキーマレスであるため、保存されたデータの構造が型定義と一致する保証がない。マイグレーション前のデータやインポートデータの安全性を確保する仕組みが必要だった。

## 決定

Zod を採用し、リポジトリ層での DB レコード読み取り時にランタイム検証を行う。

```typescript
// IndexedDBTeamRepository.ts
const raw = await db.getAll("teams");
const records = z.array(teamRecordSchema).parse(raw);
```

インポートデータにも Zod スキーマを適用し、不正データを事前に排除する。

## 結果

### メリット
- TypeScript の型とランタイム検証を単一ソースから生成（`z.infer<typeof schema>`）
- バリデーションエラー時の詳細なエラーメッセージ
- 外部データ（JSON インポート）の安全な検証
- バンドルサイズが小さい（tree-shakeable）

### トレードオフ
- 全レコード読み取り時のパフォーマンスオーバーヘッド（大量データ時）
- スキーマ定義と TypeScript 型の二重管理（Zod の `infer` で緩和）
