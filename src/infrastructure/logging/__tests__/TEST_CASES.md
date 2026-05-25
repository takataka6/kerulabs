# Infrastructure Logging テストケース一覧

## IndexedDBLogStore.test.ts

| describe | テストケース |
| --- | --- |
| IndexedDBLogStore | append でログエントリを保存できる |
| IndexedDBLogStore | 複数エントリを追加できる |
| IndexedDBLogStore | getAll でフィルタなしで全エントリを取得できる |
| IndexedDBLogStore | getAll で level フィルタが動作する |
| IndexedDBLogStore | getAll で category フィルタが動作する |
| IndexedDBLogStore | getAll で since/until フィルタが動作する |
| IndexedDBLogStore | getAll で search フィルタが動作する |
| IndexedDBLogStore | getAll で limit フィルタが動作する |
| IndexedDBLogStore | clear で全エントリを削除できる |
| IndexedDBLogStore | count で保存済みエントリ数を取得できる |
| IndexedDBLogStore | 空のストアで count は 0 を返す |
| IndexedDBLogStore | getAll の search フィルタが meta フィールドも検索する |
| IndexedDBLogStore | ensureCount は2回目以降 DB の count を呼ばない |
| IndexedDBLogStore | getAll で level フィルタと since/until を組み合わせて使える |
| IndexedDBLogStore | getAll の search フィルタは大文字小文字を区別しない |
| IndexedDBLogStore | MAX_ENTRIES (2000) を超えた場合にクリーンアップが実行される |
