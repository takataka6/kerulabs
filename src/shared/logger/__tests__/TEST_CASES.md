# Shared Logger テストケース一覧

## Logger.test.ts

| describe | テストケース |
| --- | --- |
| Logger | error レベルのログは即座に flush される |
| Logger | 各レベルのログが正しいレベルで記録される |
| Logger | minLevel 以下のログはスキップされる |
| Logger | Error オブジェクトは name/message/stack に変換される |
| Logger | meta なしでもログが記録される |
| Logger | getEntries でフィルタが効く |
| Logger | clear でエントリが全削除される |
| Logger | exportJSON が JSON 文字列を返す |
| Logger | store が null の場合はコンソール出力のみ（エラーなし） |
| Logger | dev モードではコンソールに出力される |
| Logger | dispose 後は flush タイマーが停止する |
| Logger | LogEntry に id と timestamp が付与される |
| Logger | dev モードで debug レベルは console.debug に出力される |
| Logger | dev モードで warn レベルは console.warn に出力される |
| Logger | dev モードで info レベルは console.info に出力される |
| Logger | dev モードで meta 付きのログは meta も出力される |
| Logger | バッファが上限に達すると自動 flush される |
| Logger | store.append が失敗してもエラーを投げない |
| Logger | getEntries で search フィルタが効く |
| Logger | store が null の場合 clear はエラーなく完了する |
