# History Hooks テストケース一覧

## useSnapshotManagement.test.ts

| describe | テストケース |
| --- | --- |
| useSnapshotManagement | pushCurrentSnapshot / resetHistory を即座に返す |
| useSnapshotManagement | syncSources で同期した状態を pushCurrentSnapshot で記録し、undo で復元できる |
| useSnapshotManagement | undoRedoEnabled が false のとき undo/redo は実行されない |
| useSnapshotManagement | canUndo / canRedo が正しく更新される |

## useUndoRedo.test.ts

| describe | テストケース |
| --- | --- |
| useUndoRedo | 初期状態では canUndo/canRedo が false |
| useUndoRedo | 1つ push すると canUndo は false のまま（1件目は起点） |
| useUndoRedo | 2つ push すると canUndo が true になる |
| useUndoRedo | undo で前のスナップショットが返る |
| useUndoRedo | redo で次のスナップショットが返る |
| useUndoRedo | undo 後に push すると redo 履歴が破棄される |
| useUndoRedo | MAX_HISTORY (50) を超えると古い履歴が捨てられる |
| useUndoRedo | undo が不可能な状態では null を返す |
| useUndoRedo | redo が不可能な状態では null を返す |
| useUndoRedo | resetHistory で全履歴がクリアされる |
| useUndoRedo | 返されるスナップショットは deep clone（元と独立） |

## useUndoRedoKeyboard.test.ts

| describe | テストケース |
| --- | --- |
| useUndoRedoKeyboard | Ctrl+Z で onUndo が呼ばれる |
| useUndoRedoKeyboard | Ctrl+Shift+Z で onRedo が呼ばれる |
| useUndoRedoKeyboard | Ctrl+Y で onRedo が呼ばれる |
| useUndoRedoKeyboard | enabled=false のときはキーイベントが無視される |
| useUndoRedoKeyboard | INPUT 要素にフォーカスしているときはスキップされる |
| useUndoRedoKeyboard | TEXTAREA 要素にフォーカスしているときはスキップされる |
| useUndoRedoKeyboard | Mac プラットフォームでは metaKey が使われる |
