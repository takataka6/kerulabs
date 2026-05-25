# Query Hooks テストケース一覧

## queryHooks.test.ts

| describe | テストケース |
| --- | --- |
| useGlossaries | データを取得できる |
| useTeams | データを取得できる |
| useFormations | データを取得できる |
| useTactics | phaseValue が null の場合、クエリが無効化される |
| useTactics | phaseValue がある場合、データを取得できる |
| useAllTactics | データを取得できる |
| useSaveGlossary | 保存を実行できる |
| useDeleteGlossary | 削除を実行できる |
| useSaveTactic | 保存を実行できる |
| useDeleteTactic | 削除を実行できる |
| useGlossaries - ローディング状態 | ローディング中は isLoading が true で data が undefined |
| useTeams - ローディング状態 | ローディング中は isLoading が true で data が undefined |
| useFormations - ローディング状態 | ローディング中は isLoading が true で data が undefined |
| useTactics - ローディング状態 | phaseValue がある場合、ローディング中は isLoading が true で data が undefined |
| useAllTactics - ローディング状態 | ローディング中は isLoading が true で data が undefined |
| useGlossaries - エラー状態 | 取得失敗時は isError が true で error が Error インスタンス |
| useTeams - エラー状態 | 取得失敗時は isError が true で error が Error インスタンス |
| useFormations - エラー状態 | 取得失敗時は isError が true で error が Error インスタンス |
| useTactics - エラー状態 | 取得失敗時は isError が true で error が Error インスタンス |
| useAllTactics - エラー状態 | 取得失敗時は isError が true で error が Error インスタンス |
| useSaveGlossary - エラー状態 | ミューテーション失敗時は isError が true で error が Error インスタンス |
| useDeleteGlossary - エラー状態 | ミューテーション失敗時は isError が true で error が Error インスタンス |
| useSaveTactic - エラー状態 | ミューテーション失敗時は isError が true で error が Error インスタンス |
| useSaveTactic - エラー状態 | ミューテーション失敗時に handleError が呼ばれる |
| useDeleteTactic - エラー状態 | ミューテーション失敗時は isError が true で error が Error インスタンス |
| useDeleteTactic - エラー状態 | ミューテーション失敗時に handleError が呼ばれる |
| useSaveTactic - ローディング状態 | ミューテーション実行中は isPending が true |
| useDeleteTactic - ローディング状態 | ミューテーション実行中は isPending が true |
| useSaveGlossary - ローディング状態 | ミューテーション実行中は isPending が true |
| useDeleteGlossary - ローディング状態 | ミューテーション実行中は isPending が true |
| useTactics - エッジケース | phaseValue が null から値に変わるとクエリが有効化される |
| useTactics - エッジケース | phaseValue が null の場合 isLoading は false（クエリ無効） |
