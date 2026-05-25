# ADR-0006: TanStack Query によるデータフェッチ・キャッシュ管理

## ステータス

採用済み

## コンテキスト

IndexedDB からのデータ取得は非同期であり、コンポーネント間でのキャッシュ共有・自動再検証・ミューテーション時の無効化が必要だった。

## 決定

TanStack Query（React Query v5）を採用し、クエリフックとミューテーションフックで IndexedDB アクセスをラップする。

```typescript
// useAllTactics.ts
useQuery({
  queryKey: queryKeys.tactics.all,
  queryFn: () => tacticInteractor.getAll(),
});

// useSaveTactic.ts
useMutation({
  mutationFn: (tactic) => tacticInteractor.save(tactic),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tactics"] }),
});
```

## 結果

### メリット
- リクエスト自動重複排除（同一データの並行取得を防止）
- ミューテーション成功時のキャッシュ自動無効化
- ローディング・エラー状態の標準化
- サーバーステート（DB データ）と UI ステートの明確な分離

### トレードオフ
- クライアントサイド DB に対しては staleTime / gcTime の調整が必要
- ローカルデータなのにネットワークライブラリの概念（refetch、retry）が混在
