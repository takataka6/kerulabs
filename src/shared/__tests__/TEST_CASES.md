# Shared Layer テストケース一覧

## config/tanstackQuery.test.ts

| describe | テストケース |
| --- | --- |
| queryClient (TanStack Query 設定) | queryClient が QueryClient のインスタンスである |
| queryClient (TanStack Query 設定) | クエリのデフォルトオプションが正しく設定されている |
| queryClient (TanStack Query 設定) | ミューテーションのデフォルトオプションが正しく設定されている |
| queryClient (TanStack Query 設定) | QueryCache の onError で handleError が呼ばれる |
| queryClient (TanStack Query 設定) | MutationCache の onError で handleError が呼ばれる |

## errors/AppError.test.ts

| describe | テストケース |
| --- | --- |
| AppError | name と category が正しく設定される |
| AppError | cause を保持できる |
| DatabaseError | category が 'database' に固定される |
| DatabaseError | cause を保持できる |
| ValidationError | category が 'validation' に固定される |
| ValidationError | details を保持できる |
| ValidationError | details が未指定の場合は undefined |
| ValidationError | cause と details を同時に保持できる |
| DomainError | category が 'domain' に固定される |
| instanceof による型判別 | サブクラスは AppError として判別される |
| instanceof による型判別 | 異なるサブクラス同士は区別される |

## errors/handleError.test.ts

| describe | テストケース |
| --- | --- |
| handleError | ログに error レベルで記録される |
| handleError | toast が指定されていればユーザー向けトーストを表示する |
| handleError | toast が指定されていない場合、トーストは表示しない |
| handleError | meta が指定されればログに追加メタデータが含まれる |
| handleError | error が Error オブジェクトでも文字列でも null でも動作する |
| handleError | AppError の場合はカテゴリを自動推論する（2引数オーバーロード） |
| handleError | AppError の場合に toast と meta を渡せる |
