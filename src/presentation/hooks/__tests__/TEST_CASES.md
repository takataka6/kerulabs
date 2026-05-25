# Top-level Hooks テストケース一覧

## useAppBackup.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useAppBackup |  | 初期状態: isExporting, isImporting, isResetting が false |
| useAppBackup |  | handleExport 成功: バックアップをエクスポートし success トーストを表示 |
| useAppBackup |  | handleExport 失敗: error トーストを表示 |
| useAppBackup |  | handleImport 成功: バックアップをインポートし success トーストを表示 |
| useAppBackup |  | handleImport 失敗: error トーストを表示 |
| useAppBackup |  | handleReset 成功: リセットし success トーストを表示 |
| useAppBackup |  | handleReset 失敗: error トーストを表示 |
| useAppBackup | ローディング状態の遷移 | handleExport 実行中は isExporting が true になる |
| useAppBackup | ローディング状態の遷移 | handleImport 実行中は isImporting が true になる |
| useAppBackup | ローディング状態の遷移 | handleReset 実行中は isResetting が true になる |

## useEntityPageState.test.ts

| describe | テストケース |
| --- | --- |
| useEntityPageState | 初期状態でモーダルは全て非表示 |
| useEntityPageState | setShowCreator で作成モーダルの表示を切り替えられる |
| useEntityPageState | setShowImport でインポートモーダルの表示を切り替えられる |
| useEntityPageState | setSelectedId で selectedItem が派生される |
| useEntityPageState | setEditingId で editingItem が派生される |
| useEntityPageState | 存在しないIDでは派生値がundefinedになる |
| useEntityPageState | 確認後に削除が実行される |
| useEntityPageState | 確認をキャンセルすると削除されない |
| useEntityPageState | 選択中のアイテムを削除すると選択が解除される |
| useEntityPageState | 削除失敗時にトーストが表示される |
| useEntityPageState | エクスポートがクリップボードに書き込まれ成功トーストが表示される |
| useEntityPageState | t, showToast, confirm が返される |
