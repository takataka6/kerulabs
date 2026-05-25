# Application Layer テストケース一覧

## schemas/appBackupSchema.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| appBackupSchema |  | 有効なバックアップデータを受け付ける |
| appBackupSchema |  | 全フィールドが揃った有効なデータを受け付ける |
| appBackupSchema | version フィールド | 正の整数を受け付ける |
| appBackupSchema | version フィールド | 0 でバリデーション失敗 |
| appBackupSchema | version フィールド | 負の数でバリデーション失敗 |
| appBackupSchema | version フィールド | 小数でバリデーション失敗 |
| appBackupSchema | version フィールド | 文字列でバリデーション失敗 |
| appBackupSchema | version フィールド | 欠如でバリデーション失敗 |
| appBackupSchema | exportedAt フィールド | 文字列を受け付ける |
| appBackupSchema | exportedAt フィールド | 数値でバリデーション失敗 |
| appBackupSchema | exportedAt フィールド | 欠如でバリデーション失敗 |
| appBackupSchema | indexedDB ペイロード | 空オブジェクトの場合に各配列がデフォルト値で初期化される |
| appBackupSchema | indexedDB ペイロード | 一部の配列のみ指定した場合に残りはデフォルト値になる |
| appBackupSchema | indexedDB ペイロード | indexedDB が欠如した場合にバリデーション失敗 |
| appBackupSchema | 不正なデータ構造 | null でバリデーション失敗 |
| appBackupSchema | 不正なデータ構造 | 文字列でバリデーション失敗 |
| appBackupSchema | 不正なデータ構造 | 配列でバリデーション失敗 |
| appBackupSchema | 不正なデータ構造 | teams に不正なレコードが含まれるとバリデーション失敗 |

## schemas/teamImportSchema.test.ts

| describe | テストケース |
| --- | --- |
| teamImportDataSchema | 有効なデータを受け付ける |
| teamImportDataSchema | 必須フィールド name が欠如した場合にバリデーション失敗 |
| teamImportDataSchema | name が空文字の場合にバリデーション失敗 |
| teamImportDataSchema | デフォルト値が正しく設定される |
| teamImportDataSchema | オプショナルフィールドの省略が可能 |
| teamImportDataSchema | 選手の背番号が不正な値でバリデーション失敗 |
| teamImportDataSchema | 選手のポジションが不正な値でバリデーション失敗 |
| glossaryImportSchema | 有効なデータを受け付ける |
| glossaryImportSchema | デフォルト値が正しく設定される |
| glossaryImportSchema | オプショナルフィールドの省略が可能 |
| glossaryImportSchema | terms 内のデフォルト値が正しく設定される |
| glossaryImportSchema | 不正な型のデータでバリデーション失敗 |
| teamManualImportSchema | 有効なデータを受け付ける |
| teamManualImportSchema | デフォルト値が正しく設定される |
| teamManualImportSchema | セクション内のデフォルト値が正しく設定される |
| teamManualImportSchema | オプショナルフィールドの省略が可能 |
| teamManualImportSchema | 不正なカテゴリでバリデーション失敗 |
| tacticExportDataSchema | 有効なデータを受け付ける |
| tacticExportDataSchema | 必須フィールドが欠如した場合にバリデーション失敗 |
| tacticExportDataSchema | version が欠如した場合にバリデーション失敗 |
| tacticExportDataSchema | オプショナルフィールドの省略が可能 |
| tacticExportDataSchema | 不正なHEXカラーコードでバリデーション失敗 |
| tacticExportDataSchema | movement の role が空文字でバリデーション失敗 |

## services/AppBackupService.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| AppBackupService | export | IndexedDB のデータを含む v1 JSON を返す |
| AppBackupService | import | バックアップ JSON から IndexedDB にデータを復元する |
| AppBackupService | import | 存在しないストアは空配列としてデフォルト補完される |
| AppBackupService | import | 無効な JSON 文字列で ValidationError を投げる |
| AppBackupService | import | version が欠落している場合に ValidationError を投げる |
| AppBackupService | import | version が負数の場合に検証エラーを投げる |
| AppBackupService | import | version が小数の場合に検証エラーを投げる |
| AppBackupService | import | version が文字列の場合に検証エラーを投げる |
| AppBackupService | import | indexedDB が欠落している場合に検証エラーを投げる |
| AppBackupService | import | indexedDB が文字列の場合に検証エラーを投げる |
| AppBackupService | import | teams の中身が不正な場合に検証エラーを投げる |
| AppBackupService | import | formations の positions が不正な場合に検証エラーを投げる |
| AppBackupService | import | 検証エラーに最大5件の issue 詳細が含まれる |
| AppBackupService | import | importAll が失敗した場合、元のデータにロールバックする |
| AppBackupService | import | importAll 失敗後のロールバックも失敗した場合、元のエラーを投げる |
| AppBackupService | import | インポート前にスナップショットを取得する |
| AppBackupService | resetAll | IndexedDB を空データでクリアする |

## services/TacticExecutor.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TacticExecutor | constructor | EventBusを注入できる（依存性注入） |
| TacticExecutor | constructor | EventBusを省略するとシングルトンが使われる |
| TacticExecutor | execute | 戦術開始イベントが発行される |
| TacticExecutor | execute | 移動のないフォーメーションの場合はキャンセルイベントが発行される |
| TacticExecutor | execute | delay後に移動開始イベントが発行される |
| TacticExecutor | execute | 矢印表示イベントも移動開始と同時に発行される |
| TacticExecutor | execute | ボールパスイベントがdelay後に発行される |
| TacticExecutor | execute | 戦術完了イベントが最後に発行される |
| TacticExecutor | isExecuting | 実行中はtrueを返す |
| TacticExecutor | isExecuting | 実行前はfalseを返す |
| TacticExecutor | isExecuting | 完了後はfalseを返す |
| TacticExecutor | cancel | 実行中の戦術をキャンセルできる |
| TacticExecutor | cancel | キャンセル後は予定されていたイベントが発行されない |
| TacticExecutor | cancel | 実行中でない場合はキャンセルしても何も起きない |
| TacticExecutor | cancel | 新しい戦術の実行時に前の戦術が自動キャンセルされる |

## services/TacticShareService.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TacticShareService | export | 戦術をJSON文字列にエクスポートできる |
| TacticShareService | export | 移動データが正しくシリアライズされる |
| TacticShareService | export | ボールパスがある場合はシリアライズされる |
| TacticShareService | export | ボールパスがない場合はフィールドが省略される |
| TacticShareService | export | カスタム終点座標がシリアライズされる |
| TacticShareService | export | 複数の戦術をエクスポートできる |
| TacticShareService | export | 空の戦術配列をエクスポートできる |
| TacticShareService | import | エクスポートしたJSONをインポートできる（ラウンドトリップ） |
| TacticShareService | import | インポート時に新しいIDが生成される |
| TacticShareService | import | 移動データが正しく復元される |
| TacticShareService | import | ボールパスデータが正しく復元される |
| TacticShareService | import | 不正なJSONは ValidationError になる |
| TacticShareService | import | versionがないJSONは ValidationError になる |
| TacticShareService | import | tacticsがないJSONは ValidationError になる |
| TacticShareService | roundtrip completeness | 全Movement フィールドが export→import で完全一致する |
| TacticShareService | roundtrip completeness | 全BallPass フィールドが export→import で完全一致する |
| TacticShareService | roundtrip completeness | 複数フォーメーションの Movement が全て復元される |
| TacticShareService | roundtrip completeness | 複数フォーメーションの BallPass が全て復元される |
| TacticShareService | roundtrip completeness | 多言語 name が export→import で完全一致する |
| TacticShareService | roundtrip completeness | 複数タクティクスの一括 export→import でデータが保持される |
| TacticShareService | roundtrip completeness | 全3フェーズが export→import で保持される |
| TacticShareService | roundtrip completeness | ballPasses なしのタクティクスが空Mapとして復元される |
| TacticShareService | roundtrip completeness | 2回連続 export→import してもデータが劣化しない |
| TacticShareService | edge cases | movement が空のフォーメーションキーを含む戦術を処理できる |
| TacticShareService | edge cases | delay=0 の Movement が正しくラウンドトリップする |
| TacticShareService | edge cases | 負の座標値が正しくラウンドトリップする |
| TacticShareService | edge cases | movement の delay が負だとインポート時にエラーになる |
| TacticShareService | edge cases | 不正な phase 文字列はエラーになる |
| TacticShareService | edge cases | Unicode 特殊文字を含む name がラウンドトリップする |

## use-cases/FormationInteractor.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| FormationInteractor | getAll | リポジトリのfindAllを呼び出す |
| FormationInteractor | getAll | リポジトリから取得したフォーメーション一覧を返す |
| FormationInteractor | getAll | フォーメーションがない場合は空配列を返す |
| FormationInteractor | エラーハンドリング | getAll でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする |

## use-cases/GlossaryInteractor.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| GlossaryInteractor | getAll | リポジトリの findAll() に委譲する |
| GlossaryInteractor | getAll | リポジトリから取得した用語集一覧を返す |
| GlossaryInteractor | getAll | 用語集がない場合は空配列を返す |
| GlossaryInteractor | getById | リポジトリの findById() に委譲する |
| GlossaryInteractor | getById | 存在しないIDの場合はnullを返す |
| GlossaryInteractor | save | リポジトリの save() に委譲する |
| GlossaryInteractor | delete | リポジトリの delete() に委譲する |
| GlossaryInteractor | エラーハンドリング | リポジトリの findAll がエラーを投げた場合、そのまま伝播する |
| GlossaryInteractor | エラーハンドリング | リポジトリの findById がエラーを投げた場合、そのまま伝播する |
| GlossaryInteractor | エラーハンドリング | リポジトリの save がエラーを投げた場合、そのまま伝播する |
| GlossaryInteractor | エラーハンドリング | リポジトリの delete がエラーを投げた場合、そのまま伝播する |

## use-cases/PluginInteractor.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| PluginInteractor | getAll | リポジトリの findAll() に委譲する |
| PluginInteractor | getAll | プラグイン一覧を返す |
| PluginInteractor | getById | リポジトリの findById() に委譲する |
| PluginInteractor | getById | 存在しないIDの場合はnullを返す |
| PluginInteractor | importFromJson | 有効なJSONからプラグインをインポートする |
| PluginInteractor | importFromJson | 不正なJSONではエラーを投げる |
| PluginInteractor | importFromJson | スキーマに合わないJSONではエラーを投げる |
| PluginInteractor | importFromJson | 同じmetadata.idのプラグインがある場合は上書きする |
| PluginInteractor | importFromJson | 新規プラグインには新しいIDが生成される |
| PluginInteractor | delete | リポジトリの delete() に委譲する |
| PluginInteractor | エラーハンドリング | findAll がエラーを投げた場合、伝播する |
| PluginInteractor | エラーハンドリング | findById がエラーを投げた場合、伝播する |
| PluginInteractor | エラーハンドリング | delete がエラーを投げた場合、伝播する |

## use-cases/TacticInteractor.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TacticInteractor | getAll | リポジトリのfindAllを呼び出す |
| TacticInteractor | getAll | リポジトリから取得した戦術一覧を返す |
| TacticInteractor | getAll | 戦術がない場合は空配列を返す |
| TacticInteractor | getByPhase | 指定したフェーズの戦術一覧を返す |
| TacticInteractor | getByPhase | 該当する戦術がない場合は空配列を返す |
| TacticInteractor | save | リポジトリのsaveを呼び出す |
| TacticInteractor | delete | リポジトリのdeleteを呼び出す |
| TacticInteractor | エラーハンドリング | getAll でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする |
| TacticInteractor | エラーハンドリング | getByPhase でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする |
| TacticInteractor | エラーハンドリング | save でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする |
| TacticInteractor | エラーハンドリング | delete でリポジトリがエラーを投げた場合、handleError を呼びエラーを再スローする |

## use-cases/TeamInteractor.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TeamInteractor | getAll | リポジトリのfindAllを呼び出す |
| TeamInteractor | getAll | リポジトリから取得したチーム一覧を返す |
| TeamInteractor | getAll | チームがない場合は空配列を返す |
| TeamInteractor | getById | IDを指定してチームを取得できる |
| TeamInteractor | getById | 存在しないIDの場合はnullを返す |
| TeamInteractor | save | リポジトリのsaveを呼び出す |
| TeamInteractor | delete | リポジトリのdeleteを呼び出す |

## use-cases/TeamManualInteractor.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TeamManualInteractor | getAll | リポジトリの findAll() に委譲する |
| TeamManualInteractor | getAll | リポジトリから取得したマニュアル一覧を返す |
| TeamManualInteractor | getAll | マニュアルがない場合は空配列を返す |
| TeamManualInteractor | getById | リポジトリの findById() に委譲する |
| TeamManualInteractor | getById | 存在しないIDの場合はnullを返す |
| TeamManualInteractor | save | リポジトリの save() に委譲する |
| TeamManualInteractor | delete | リポジトリの delete() に委譲する |
| TeamManualInteractor | エラーハンドリング | findAll がエラーを投げた場合、そのまま伝播する |
| TeamManualInteractor | エラーハンドリング | findById がエラーを投げた場合、そのまま伝播する |
| TeamManualInteractor | エラーハンドリング | save がエラーを投げた場合、そのまま伝播する |
| TeamManualInteractor | エラーハンドリング | delete がエラーを投げた場合、そのまま伝播する |

## utils/withErrorHandling.test.ts

| describe | テストケース |
| --- | --- |
| withErrorHandling | 非同期関数が成功した場合に結果を返す |
| withErrorHandling | 非同期関数が成功した場合にオブジェクトの結果を返す |
| withErrorHandling | エラーが発生した場合にDatabaseErrorでラップしてhandleErrorを呼び出してから再スローする |
| withErrorHandling | 既にDatabaseErrorの場合は二重ラップしない |
| withErrorHandling | metaがある場合はhandleErrorにmetaを渡す |
| withErrorHandling | metaがない場合はhandleErrorにmetaを渡さない |
| withErrorHandling | 戻り値の型が正しいこと |
