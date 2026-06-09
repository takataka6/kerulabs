# Infrastructure Layer テストケース一覧

## factories/RepositoryFactory.test.ts

| describe | テストケース |
| --- | --- |
| RepositoryFactory | createTeamRepository: IndexedDBTeamRepository のインスタンスを返す |
| RepositoryFactory | createFormationRepository: IndexedDBFormationRepository のインスタンスを返す |
| RepositoryFactory | createTacticRepository: IndexedDBTacticRepository のインスタンスを返す |
| RepositoryFactory | createGlossaryRepository: IndexedDBGlossaryRepository のインスタンスを返す |
| RepositoryFactory | createPluginRepository: IndexedDBPluginRepository のインスタンスを返す |

## logging/IndexedDBLogStore.test.ts

| describe | テストケース |
| --- | --- |
| IndexedDBLogStore | append でエントリを追加できる |
| IndexedDBLogStore | getAll でフィルタなしの全件取得 |
| IndexedDBLogStore | getAll でレベルフィルタ |
| IndexedDBLogStore | getAll でカテゴリフィルタ |
| IndexedDBLogStore | getAll で検索フィルタ |
| IndexedDBLogStore | getAll で検索フィルタが meta を含めて検索する |
| IndexedDBLogStore | getAll でタイムスタンプフィルタ (since/until) |
| IndexedDBLogStore | getAll で limit |
| IndexedDBLogStore | getAll の結果が新しい順にソートされる |
| IndexedDBLogStore | clear で全件削除 |
| IndexedDBLogStore | count でエントリ数を返す |
| IndexedDBLogStore | MAX_ENTRIES 超過時にクリーンアップが実行される |
| IndexedDBLogStore | MAX_ENTRIES 以下では クリーンアップが実行されない |

## repositories/IndexedDBClient.test.ts

| describe | テストケース |
| --- | --- |
| IndexedDBClient — upgrade コールバック | 新規インストールで全ストアが作成される |
| IndexedDBClient — upgrade コールバック | newVersion が null の場合、DB_VERSION にフォールバックする |
| IndexedDBClient — シングルトン | getInstance は同一インスタンスを返す |
| IndexedDBClient — getDB キャッシュ | getDB を2回呼んでも openDB は1回しか呼ばれない |
| IndexedDBClient — exportAll | 全8ストアのデータをエクスポートできる |
| IndexedDBClient — importAll | 全ストアをクリアしてデータをインポートできる |
| IndexedDBClient — importAll | 不正なデータの場合バリデーションエラーをスローする |
| IndexedDBClient — importAll | data にキーがないストアは空配列として処理される |
| IndexedDBClient — close | DB接続を閉じて null にリセットする |
| IndexedDBClient — close | DB が未接続の場合 close は何もしない |

## repositories/IndexedDBFormationRepository.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| IndexedDBFormationRepository | mapToDomain | レコードからFormationエンティティに変換できる |
| IndexedDBFormationRepository | mapToDomain | ポジションの座標が正しく復元される |
| IndexedDBFormationRepository | mapToDomain | roleMapが正しく復元される |
| IndexedDBFormationRepository | mapToDomain | gameModeがない場合はfootballがデフォルト |
| IndexedDBFormationRepository | mapToDomain | gameModeが指定されている場合はその値が使われる |
| IndexedDBFormationRepository | mapToDomain | 日付がDateオブジェクトに正しく変換される |
| IndexedDBFormationRepository | mapToPersistence | Formationエンティティをレコードに変換できる |
| IndexedDBFormationRepository | mapToPersistence | ポジション座標が正しくシリアライズされる |
| IndexedDBFormationRepository | mapToPersistence | roleMapがRecord<string, number>にシリアライズされる |
| IndexedDBFormationRepository | mapToPersistence | gameModeが正しくシリアライズされる |
| IndexedDBFormationRepository | ラウンドトリップ | 変換して戻しても値が保持される |
| IndexedDBFormationRepository | findAll | 全フォーメーションを取得してFormationエンティティの配列を返す |
| IndexedDBFormationRepository | findAll | レコードがない場合は空配列を返す |
| IndexedDBFormationRepository | findById | IDに一致するフォーメーションを返す |
| IndexedDBFormationRepository | findById | 存在しないIDの場合はnullを返す |
| IndexedDBFormationRepository | findByType | typeに一致するフォーメーションの配列を返す |
| IndexedDBFormationRepository | findByType | 該当するフォーメーションがない場合は空配列を返す |
| IndexedDBFormationRepository | save | Formationエンティティを永続化する |
| IndexedDBFormationRepository | delete | IDを指定してフォーメーションを削除する |

## repositories/IndexedDBGlossaryRepository.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| IndexedDBGlossaryRepository | mapToDomain | レコードを Glossary エンティティに変換する |
| IndexedDBGlossaryRepository | mapToDomain | terms が空配列の場合も正しく変換する |
| IndexedDBGlossaryRepository | mapToDomain | terms が空配列の場合は空配列でドメインオブジェクトを生成する |
| IndexedDBGlossaryRepository | mapToPersistence | Glossary エンティティを永続化レコードに変換する |
| IndexedDBGlossaryRepository | mapToPersistence | 日付をタイムスタンプに変換する |
| IndexedDBGlossaryRepository | findAll | 全用語集を取得して Glossary エンティティの配列を返す |
| IndexedDBGlossaryRepository | findAll | レコードがない場合は空配列を返す |
| IndexedDBGlossaryRepository | findById | IDに一致する用語集を返す |
| IndexedDBGlossaryRepository | findById | 存在しないIDの場合はnullを返す |
| IndexedDBGlossaryRepository | save | Glossary エンティティを永続化する |
| IndexedDBGlossaryRepository | delete | IDを指定して用語集を削除する |

## repositories/IndexedDBPluginRepository.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| IndexedDBPluginRepository | findAll | 全プラグインをドメインオブジェクトとして返す |
| IndexedDBPluginRepository | findAll | プラグインがない場合は空配列を返す |
| IndexedDBPluginRepository | findById | IDでプラグインを取得する |
| IndexedDBPluginRepository | findById | 存在しない場合はnullを返す |
| IndexedDBPluginRepository | findByMetadataId | メタデータIDでプラグインを取得する |
| IndexedDBPluginRepository | findByMetadataId | 存在しない場合はnullを返す |
| IndexedDBPluginRepository | save | プラグインを永続化レコードとして保存する |
| IndexedDBPluginRepository | delete | IDでプラグインを削除する |
| IndexedDBPluginRepository | ドメインマッピング | 永続化レコードからドメインオブジェクトへのラウンドトリップが正しい |

## repositories/IndexedDBTacticRepository.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| IndexedDBTacticRepository | mapToDomain | レコードからTacticエンティティに変換できる |
| IndexedDBTacticRepository | mapToDomain | 移動データが正しく復元される |
| IndexedDBTacticRepository | mapToDomain | ボールパスデータが正しく復元される |
| IndexedDBTacticRepository | mapToDomain | ボールパスがない場合も正しく処理される |
| IndexedDBTacticRepository | mapToDomain | createdAt/updatedAtがDateに変換される |
| IndexedDBTacticRepository | mapToDomain | ballPositionがある場合に正しく復元される |
| IndexedDBTacticRepository | mapToDomain | 複数フォーメーションの移動データが正しく復元される |
| IndexedDBTacticRepository | mapToDomain | ボールパスの trajectoryType が復元される |
| IndexedDBTacticRepository | mapToPersistence | Tacticエンティティをレコードに変換できる |
| IndexedDBTacticRepository | mapToPersistence | 移動データが正しくシリアライズされる |
| IndexedDBTacticRepository | mapToPersistence | ボールパスがない場合はフィールドがundefined |
| IndexedDBTacticRepository | mapToPersistence | カスタム終点座標が保持される |
| IndexedDBTacticRepository | mapToPersistence | ballPositionが正しくシリアライズされる |
| IndexedDBTacticRepository | mapToPersistence | ボールパスのstartX/startZ/trajectoryTypeが保持される |
| IndexedDBTacticRepository | ラウンドトリップ | 変換して戻しても値が保持される |
| IndexedDBTacticRepository | findAll | 全戦術を取得してTacticエンティティの配列を返す |
| IndexedDBTacticRepository | findAll | レコードがない場合は空配列を返す |
| IndexedDBTacticRepository | findById | IDに一致する戦術を返す |
| IndexedDBTacticRepository | findById | 存在しないIDの場合はnullを返す |
| IndexedDBTacticRepository | findByPhase | フェーズに一致する戦術の配列を返す |
| IndexedDBTacticRepository | findByPhase | 該当する戦術がない場合は空配列を返す |
| IndexedDBTacticRepository | findByPhaseAndFormation | フェーズとフォーメーションに一致する戦術を返す |
| IndexedDBTacticRepository | findByPhaseAndFormation | フォーメーションに対応しない戦術はフィルタされる |
| IndexedDBTacticRepository | save | Tacticエンティティを永続化する |
| IndexedDBTacticRepository | delete | IDを指定して戦術を削除する |

## repositories/IndexedDBTeamManualRepository.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| IndexedDBTeamManualRepository | mapToDomain | DBレコードからドメインオブジェクトに変換される |
| IndexedDBTeamManualRepository | mapToDomain | セクションが空配列のレコードでも変換できる |
| IndexedDBTeamManualRepository | mapToDomain | teamIdが未設定のレコードでも変換できる |
| IndexedDBTeamManualRepository | mapToPersistence | ドメインオブジェクトからDBレコードに変換される |
| IndexedDBTeamManualRepository | mapToPersistence | セクションとアイテムがシリアライズされる |
| IndexedDBTeamManualRepository | mapToPersistence | teamIdが未設定の場合はundefined |
| IndexedDBTeamManualRepository | ラウンドトリップ（mapToPersistence -> mapToDomain） | ラウンドトリップ（domain→persistence→domain）で一致する |
| IndexedDBTeamManualRepository | findAll | findAll で全件取得できる |
| IndexedDBTeamManualRepository | findAll | findAll で空配列を返す |
| IndexedDBTeamManualRepository | findById | findById でIDに一致するマニュアルを返す |
| IndexedDBTeamManualRepository | findById | findById で見つからない場合nullを返す |
| IndexedDBTeamManualRepository | save | save でマニュアルを保存できる |
| IndexedDBTeamManualRepository | delete | delete でマニュアルを削除できる |

## repositories/IndexedDBTeamRepository.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| IndexedDBTeamRepository | mapToDomain | レコードからTeamエンティティに変換できる |
| IndexedDBTeamRepository | mapToDomain | 選手データが正しく復元される |
| IndexedDBTeamRepository | mapToDomain | 選手がいないレコードでも変換できる |
| IndexedDBTeamRepository | mapToDomain | createdAt/updatedAtがDateに変換される |
| IndexedDBTeamRepository | mapToDomain | 選手のpositionが未設定の場合mfにフォールバックする |
| IndexedDBTeamRepository | mapToDomain | 選手のstatusが未設定の場合availableにフォールバックする |
| IndexedDBTeamRepository | mapToDomain | 選手のオプショナルフィールドが正しく復元される |
| IndexedDBTeamRepository | mapToDomain | selectedSquadが復元される |
| IndexedDBTeamRepository | mapToDomain | playerCardsが復元される |
| IndexedDBTeamRepository | mapToDomain | managerCardが復元される |
| IndexedDBTeamRepository | mapToPersistence | Teamエンティティをレコードに変換できる |
| IndexedDBTeamRepository | mapToPersistence | 選手データがシリアライズされる |
| IndexedDBTeamRepository | mapToPersistence | selectedSquadがシリアライズされる |
| IndexedDBTeamRepository | mapToPersistence | selectedSquadが未設定の場合はundefined |
| IndexedDBTeamRepository | mapToPersistence | playerCardsがシリアライズされる |
| IndexedDBTeamRepository | mapToPersistence | playerCardsが未設定の場合はundefined |
| IndexedDBTeamRepository | mapToPersistence | 選手のオプショナルフィールドがすべてシリアライズされる |
| IndexedDBTeamRepository | mapToPersistence | managerCardがシリアライズされる |
| IndexedDBTeamRepository | ラウンドトリップ（mapToPersistence -> mapToDomain） | 変換して戻しても値が保持される |
| IndexedDBTeamRepository | findAll | 全チームを取得してTeamエンティティの配列を返す |
| IndexedDBTeamRepository | findAll | レコードがない場合は空配列を返す |
| IndexedDBTeamRepository | findById | TeamIdに一致するチームを返す |
| IndexedDBTeamRepository | findById | 存在しないIDの場合はnullを返す |
| IndexedDBTeamRepository | save | Teamエンティティを永続化する |
| IndexedDBTeamRepository | delete | TeamIdを指定してチームを削除する |

## repositories/SketchStorage.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| SketchStorage | loadSketch | データがある場合は SketchRecord を返す |
| SketchStorage | loadSketch | データがない場合は null を返す |
| SketchStorage | saveSketch | id を "current" に設定して保存する |
| SketchStorage | clearSketch | "current" キーを削除する |

## repositories/migrations.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| migrations | LATEST_VERSION | 1以上の整数を返す |
| migrations | runMigrations | 新規インストール（0→1）で全ストアが作成される |
| migrations | runMigrations | v2マイグレーション（1→2）でpluginsストアが作成される |
| migrations | runMigrations | teams ストアに by-name と by-created インデックスが作成される |
| migrations | runMigrations | 同じバージョンへのマイグレーションは何もしない |
| migrations | runMigrations | 存在しないバージョンへのマイグレーションはエラーになる |
| migrations | runMigrations | 0→LATEST_VERSION のフルマイグレーションが成功する |

## repositories/withDB.test.ts

| describe | テストケース |
| --- | --- |
| withDB | 正常系: operation の戻り値を返す |
| withDB | 正常系: client.getDB() で取得した DB を operation に渡す |
| withDB | 異常系: operation がエラーを投げた場合、DatabaseError でラップして再スロー |
| withDB | 異常系: client.getDB() がエラーを投げた場合、DatabaseError でラップして再スロー |
| withDB | 既に DatabaseError の場合は二重ラップしない |
| withDB | meta が指定された場合、handleError に meta を渡す |
| withDB | meta が未指定の場合、handleError に undefined を渡す |

## schemas/infrastructureSchemas.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| formationSchema | positionRecordSchema | 有効なレコードデータのバリデーション成功 |
| formationSchema | positionRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| formationSchema | positionRecordSchema | 型の不正な値でバリデーション失敗 |
| formationSchema | positionRecordSchema | position category enum バリデーション — 有効な値 |
| formationSchema | positionRecordSchema | position category enum バリデーション — 不正な値 |
| formationSchema | formationRecordSchema | 有効なレコードデータのバリデーション成功 |
| formationSchema | formationRecordSchema | gameMode オプション付きでバリデーション成功 |
| formationSchema | formationRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| formationSchema | formationRecordSchema | name が空文字列でバリデーション失敗 |
| formationSchema | formationRecordSchema | 型の不正な値でバリデーション失敗 |
| formationSchema | formationRecordSchema | game mode enum バリデーション — 有効な値 |
| formationSchema | formationRecordSchema | game mode enum バリデーション — 不正な値 |
| glossarySchema | glossaryTermSchema | 有効なレコードデータのバリデーション成功 |
| glossarySchema | glossaryTermSchema | reading オプション付きでバリデーション成功 |
| glossarySchema | glossaryTermSchema | 必須フィールドの欠如でバリデーション失敗 |
| glossarySchema | glossaryTermSchema | 型の不正な値でバリデーション失敗 |
| glossarySchema | glossaryRecordSchema | 有効なレコードデータのバリデーション成功 |
| glossarySchema | glossaryRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| glossarySchema | glossaryRecordSchema | 型の不正な値でバリデーション失敗 |
| teamSchema | playerRecordSchema | 有効なレコードデータのバリデーション成功 |
| teamSchema | playerRecordSchema | オプションフィールド付きでバリデーション成功 |
| teamSchema | playerRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| teamSchema | playerRecordSchema | 型の不正な値でバリデーション失敗 |
| teamSchema | playerRecordSchema | number が範囲外でバリデーション失敗 |
| teamSchema | playerRecordSchema | position category enum バリデーション — 有効な値 |
| teamSchema | playerRecordSchema | position category enum バリデーション — 不正な値 |
| teamSchema | playerRecordSchema | status enum バリデーション — 不正な値 |
| teamSchema | teamRecordSchema | 有効なレコードデータのバリデーション成功 |
| teamSchema | teamRecordSchema | オプションフィールド付きでバリデーション成功 |
| teamSchema | teamRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| teamSchema | teamRecordSchema | 型の不正な値でバリデーション失敗 |
| tacticSchema | movementRecordSchema | 有効なレコードデータのバリデーション成功 |
| tacticSchema | movementRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| tacticSchema | movementRecordSchema | 型の不正な値でバリデーション失敗 |
| tacticSchema | movementRecordSchema | role が空文字列でバリデーション失敗 |
| tacticSchema | movementRecordSchema | delay が負の値でバリデーション失敗 |
| tacticSchema | movementRecordSchema | hex color pattern バリデーション — 有効な6桁カラー |
| tacticSchema | movementRecordSchema | hex color pattern バリデーション — 有効な3桁カラー |
| tacticSchema | movementRecordSchema | hex color pattern バリデーション — #なしで失敗 |
| tacticSchema | movementRecordSchema | hex color pattern バリデーション — 不正な文字で失敗 |
| tacticSchema | movementRecordSchema | hex color pattern バリデーション — 桁数不正で失敗 |
| tacticSchema | movementRecordSchema | targetX/targetZ に Infinity で失敗 |
| tacticSchema | ballPassRecordSchema | 有効なレコードデータのバリデーション成功 |
| tacticSchema | ballPassRecordSchema | オプションフィールド付きでバリデーション成功 |
| tacticSchema | ballPassRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| tacticSchema | ballPassRecordSchema | 型の不正な値でバリデーション失敗 |
| tacticSchema | ballPassRecordSchema | hex color pattern バリデーション — 不正な値で失敗 |
| tacticSchema | ballPassRecordSchema | trajectoryType enum バリデーション — 有効な値 |
| tacticSchema | ballPassRecordSchema | trajectoryType enum バリデーション — 不正な値 |
| tacticSchema | tacticRecordSchema | 有効なレコードデータのバリデーション成功 |
| tacticSchema | tacticRecordSchema | オプションフィールド付きでバリデーション成功 |
| tacticSchema | tacticRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| tacticSchema | tacticRecordSchema | 型の不正な値でバリデーション失敗 |
| tacticSchema | tacticRecordSchema | movements 内の hex color が不正で失敗 |
| tacticSchema | tacticRecordSchema | stepBoundaries に負の値で失敗 |
| teamManualSchema | manualItemSchema | 有効なレコードデータのバリデーション成功 |
| teamManualSchema | manualItemSchema | diagram オプション付きでバリデーション成功 |
| teamManualSchema | manualItemSchema | 必須フィールドの欠如でバリデーション失敗 |
| teamManualSchema | manualItemSchema | 型の不正な値でバリデーション失敗 |
| teamManualSchema | manualSectionSchema | 有効なレコードデータのバリデーション成功 |
| teamManualSchema | manualSectionSchema | 必須フィールドの欠如でバリデーション失敗 |
| teamManualSchema | manualSectionSchema | 型の不正な値でバリデーション失敗 |
| teamManualSchema | manualSectionSchema | manual section category enum バリデーション — 有効な値 |
| teamManualSchema | manualSectionSchema | manual section category enum バリデーション — 不正な値 |
| teamManualSchema | teamManualRecordSchema | 有効なレコードデータのバリデーション成功 |
| teamManualSchema | teamManualRecordSchema | teamId オプション付きでバリデーション成功 |
| teamManualSchema | teamManualRecordSchema | 必須フィールドの欠如でバリデーション失敗 |
| teamManualSchema | teamManualRecordSchema | 型の不正な値でバリデーション失敗 |
| teamManualSchema | teamManualRecordSchema | sections 内の category が不正で失敗 |

## services/BrowserFileService.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| BrowserFileService | downloadJson | Blob URL を作成して <a> 要素をクリックする |
| BrowserFileService | downloadJson | ファイル名が <a> の download 属性に設定される |
| BrowserFileService | downloadJson | <a> 要素がクリック後に body から削除される |
| BrowserFileService | downloadJson | Blob URL が setTimeout で解放される |
| BrowserFileService | downloadJson | Electron 環境では window.electron.saveJson を呼ぶ |
| BrowserFileService | openFilePicker | ファイルが選択されない場合はエラーを投げる |
| BrowserFileService | openFilePicker | ファイルが選択された場合はファイル内容を返す |
| BrowserFileService | openFilePicker | FileReader でエラーが発生した場合は reject する |
| BrowserFileService | openFilePicker | FileReader エラーが null の場合はデフォルトエラーメッセージを使う |
| BrowserFileService | openFilePicker | Electron 環境では window.electron.openJson を呼ぶ |
| BrowserFileService | openFilePicker | Electron 環境でファイルが選択されなかった場合はエラーを投げる |

## services/IndexedDBPreferencesService.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| IndexedDBPreferencesService | initialize | IndexedDB から全設定値をキャッシュにロードする |
| IndexedDBPreferencesService | initialize | 旧 sceneBgImageUrl を sceneBgImages に移行する |
| IndexedDBPreferencesService | initialize | sceneBgImages が既にある場合は移行しない |
| IndexedDBPreferencesService | get | キャッシュにない場合はデフォルト値を返す |
| IndexedDBPreferencesService | get | キャッシュにある場合はキャッシュ値を返す |
| IndexedDBPreferencesService | set | キャッシュを即座に更新する |
| IndexedDBPreferencesService | set | IndexedDB に非同期で書き込む |
| IndexedDBPreferencesService | set | IndexedDB 書き込み失敗時もキャッシュは更新される |
| IndexedDBPreferencesService | remove | キャッシュからキーを削除し、デフォルト値に戻る |
| IndexedDBPreferencesService | remove | IndexedDB に非同期で削除を実行する |
| IndexedDBPreferencesService | remove | IndexedDB 削除失敗時もキャッシュは削除される |
