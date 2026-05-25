# ADR-0004: モジュールシングルトンによる DI コンテナ

## ステータス

採用済み

## コンテキスト

Clean Architecture において、各レイヤーの依存関係を解決する DI メカニズムが必要。候補：

- **React Context + Provider**: React ツリー内でのみ利用可能、レンダリング最適化が必要
- **InversifyJS 等の DI フレームワーク**: デコレータ依存、バンドルサイズ増加
- **モジュールシングルトン**: ES Module のスコープを利用した軽量パターン

## 決定

モジュールレベルのシングルトン変数で DI コンテナを実現する。

```typescript
// ServiceContainer.ts
let container: Container | null = null;

export function configureContainer(c: Container): void {
  container = c;
}

export function getContainer(): Container {
  if (!container) throw new Error("...");
  return container;
}
```

- アプリ起動時（`App.tsx`）に `configureContainer()` で具象実装を注入
- 各レイヤーは `getContainer()` で依存を取得

## 結果

### メリット
- React に非依存（Application / Infrastructure 層からも利用可能）
- バンドルサイズゼロ（追加ライブラリ不要）
- TypeScript の型推論で型安全
- テスト時は `configureContainer()` でモック注入可能

### トレードオフ
- グローバル状態のため、テスト間の分離に注意が必要（`beforeEach` でリセット）
- 初期化順序への依存（`configureContainer()` が先に呼ばれる必要がある）
