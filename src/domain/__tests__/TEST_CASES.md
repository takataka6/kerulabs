# Domain Layer テストケース一覧

## entities/BallPass.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| BallPass | create | ボールパスを作成できる |
| BallPass | create | デフォルト値で作成できる（delay=0, color=#facc15） |
| BallPass | create | 終点座標を指定できる |
| BallPass | create | 終点座標なしで作成できる |
| BallPass | create | 負のdelayはエラーになる |
| BallPass | hasCustomEnd | 終点座標が両方指定されている場合はtrue |
| BallPass | hasCustomEnd | 終点座標が指定されていない場合はfalse |
| BallPass | hasCustomEnd | endXのみ指定されている場合はfalse |
| BallPass | hasCustomEnd | endZのみ指定されている場合はfalse |

## entities/Formation.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Formation | create | 11人のフットボールフォーメーションを作成できる |
| Formation | create | 5人のフットサルフォーメーションを作成できる |
| Formation | create | roleMapが自動生成される |
| Formation | create | ポジション数が不正だとエラーになる（11人制で10人） |
| Formation | create | フットサルで11人はエラーになる |
| Formation | createDefault | デフォルトフォーメーションを作成できる（isCustom=false） |
| Formation | createDefault | カスタムroleMapを指定できる |
| Formation | getPlayerIndexByRole | ロール名からインデックスを取得できる |
| Formation | getPlayerIndexByRole | 存在しないロールはundefined |
| Formation | getPositionByIndex | インデックスからポジションを取得できる |
| Formation | getPositionByIndex | 範囲外のインデックスはundefined |

## entities/Glossary.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Glossary | create | 用語集を作成できる |
| Glossary | create | 作成日時と更新日時が設定される |
| Glossary | addTerm | 用語を追加できる |
| Glossary | addTerm | 複数の用語を追加できる |
| Glossary | addTerm | 追加時に更新日時が変わる |
| Glossary | removeTerm | 用語を削除できる |
| Glossary | removeTerm | 存在しないIDを削除しても何も起きない |
| Glossary | updateTerm | 用語の内容を更新できる |
| Glossary | updateTerm | 存在しないIDの更新は何もしない |
| Glossary | updateInfo | 用語集の名前と説明を更新できる |
| Glossary | getAllKeywords | 全用語のキーワードを重複なしで取得できる |
| Glossary | getAllKeywords | 用語がない場合は空配列 |
| Glossary | getAllKeywords | 空文字のキーワードは除外される |

## entities/Movement.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Movement | create | 移動を作成できる |
| Movement | create | デフォルト値で作成できる（delay=0, arrowColor=#ef4444） |
| Movement | create | 負のdelayはエラーになる |
| Movement | create | delay=0は有効 |
| Movement | immutability | プロパティはreadonlyである |

## entities/Player.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Player | create | 選手を作成できる |
| Player | create | ポジションを指定して作成できる |
| Player | create | 国籍・クラブ・リーグ国を指定できる |
| Player | create | IDが自動生成される |
| Player | create | 作成日時と更新日時が設定される |
| Player | バリデーション | 背番号0は有効 |
| Player | バリデーション | 背番号99は有効 |
| Player | バリデーション | 背番号が負の値はエラーになる |
| Player | バリデーション | 背番号が100以上はエラーになる |
| Player | updateName | 名前を更新できる |
| Player | updateName | 更新日時が変わる |
| Player | updateNumber | 背番号を更新できる |
| Player | updateNumber | 不正な背番号への更新はエラーになる |
| Player | updatePosition | ポジションを更新できる |
| Player | updateNationality | 国籍を更新できる |
| Player | updateNationality | undefinedで国籍を削除できる |
| Player | updateNationality | 空文字はエラーになる |
| Player | updateClub | クラブを更新できる |
| Player | updateClub | undefinedでクラブを削除できる |
| Player | updateClub | 空文字はエラーになる |
| Player | updateLeagueCountry | リーグ国を更新できる |
| Player | updateLeagueCountry | undefinedでリーグ国を削除できる |
| Player | updateLeagueCountry | 空文字はエラーになる |
| Player | updateNote | メモを設定できる |
| Player | updateNote | メモを削除できる |
| Player | updateNote | 更新日時が変わる |
| Player | updateStatus | デフォルトは available |
| Player | updateStatus | ステータスを suspended に更新できる |
| Player | updateStatus | ステータスを injured に更新できる |
| Player | updateStatus | ステータスを指定して作成できる |
| Player | updateStatus | 更新日時が変わる |

## entities/Plugin.test.ts

| describe | テストケース |
| --- | --- |
| Plugin | 正しいプロパティでインスタンスを生成できる |
| Plugin | metadataId はメタデータのIDを返す |
| Plugin | lessonId はデータのlessonIdを返す |
| Plugin | installedAt は正しい日時を返す |
| Plugin | 異なるカテゴリのレッスンデータを保持できる |

## entities/Tactic.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Tactic | create | カスタム戦術を作成できる |
| Tactic | create | ボールパス付きで作成できる |
| Tactic | createDefault | デフォルト戦術を作成できる（isCustom=false） |
| Tactic | getDisplayName | 指定した言語の名前を返す |
| Tactic | getDisplayName | 存在しない言語の場合はenにフォールバック |
| Tactic | getDisplayName | enもない場合はjaにフォールバック |
| Tactic | getMovementsForFormation | フォーメーション別の移動を取得できる |
| Tactic | getMovementsForFormation | 存在しないフォーメーションは空配列 |
| Tactic | getBallPassesForFormation | フォーメーション別のボールパスを取得できる |
| Tactic | getBallPassesForFormation | 存在しないフォーメーションは空配列 |
| Tactic | supportsFormation | サポートするフォーメーションはtrue |
| Tactic | supportsFormation | サポートしないフォーメーションはfalse |
| Tactic | updateName | 名前を更新できる |
| Tactic | updateName | 更新日時が変わる |
| Tactic | updateName | 空のname objectはエラーになる |
| Tactic | updateIcon | アイコンを更新できる |
| Tactic | updateIcon | 空文字のアイコンはエラーになる |

## entities/Team.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Team | create | チームを作成できる |
| Team | create | IDが自動生成される |
| Team | create | デフォルトフォーメーションが最初のフォーメーションになる |
| Team | create | 指定したデフォルトフォーメーションが使われる |
| Team | create | availableFormationsに含まれないデフォルトフォーメーションはエラー |
| Team | addPlayer | 選手を追加できる |
| Team | addPlayer | 同じ背番号の選手は追加できない |
| Team | removePlayer | 選手を削除できる |
| Team | removePlayer | 存在しない選手を削除しても何も起きない |
| Team | updateColors | チームカラーを更新できる |
| Team | updateName | チーム名を更新できる |
| Team | updateFormations | フォーメーションを更新できる |
| Team | updateFormations | 空のフォーメーションはエラーになる |
| Team | updateFormations | 削除されたフォーメーションの戦術設定がクリーンアップされる |
| Team | updateFormations | デフォルトフォーメーションが削除された場合は最初のフォーメーションに変わる |
| Team | updateSelectedSquad | スカッドを更新できる |
| Team | updateManager | 監督名を設定できる |
| Team | updateManager | 空文字を渡すとundefinedになる |
| Team | availableTactics | フォーメーション別の戦術を設定・取得できる |
| Team | availableTactics | 戦術が設定されていないフォーメーションはundefined |
| Team | availableTactics | 空の戦術配列はクリーンアップされる |

## entities/TeamManual.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TeamManual | create | マニュアルを作成できる |
| TeamManual | create | teamIdを指定して作成できる |
| TeamManual | create | 作成日時と更新日時が設定される |
| TeamManual | create | 空の名前ではエラーになる |
| TeamManual | create | 空白のみの名前ではエラーになる |
| TeamManual | constructor | propsから復元できる |
| TeamManual | updateInfo | 名前と説明を更新できる |
| TeamManual | updateInfo | 空の名前ではエラーになる |
| TeamManual | updateInfo | 更新日時が変わる |
| TeamManual | addSection | セクションを追加できる |
| TeamManual | addSection | 追加時に更新日時が変わる |
| TeamManual | removeSection | セクションを削除できる |
| TeamManual | removeSection | 存在しないIDの削除はfalseを返す |
| TeamManual | updateSection | セクションを更新できる |
| TeamManual | updateSection | 存在しないIDの更新はfalseを返す |
| TeamManual | addItem | セクションに項目を追加できる |
| TeamManual | addItem | 存在しないセクションIDの場合はfalseを返す |
| TeamManual | removeItem | 項目を削除できる |
| TeamManual | removeItem | 存在しないセクションIDの場合はfalseを返す |
| TeamManual | removeItem | 存在しない項目IDの場合はfalseを返す |
| TeamManual | updateItem | 項目を更新できる |
| TeamManual | updateItem | 存在しないセクションIDの場合はfalseを返す |
| TeamManual | updateItem | 存在しない項目IDの場合はfalseを返す |
| TeamManual | getAllCategories | 全カテゴリを重複なしで取得できる |
| TeamManual | getAllCategories | セクションがない場合は空配列 |

## events/EventBus.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| EventBus | getInstance | シングルトンインスタンスを返す |
| EventBus | subscribe / publish | イベントを購読して受信できる |
| EventBus | subscribe / publish | 同じイベントタイプに複数のハンドラーを登録できる |
| EventBus | subscribe / publish | 異なるイベントタイプのハンドラーは呼ばれない |
| EventBus | subscribe / publish | 購読解除後はハンドラーが呼ばれない |
| EventBus | getHistory | 発行されたイベントの履歴を取得できる |
| EventBus | getHistory | イベントタイプでフィルタできる |
| EventBus | getHistory | 履歴は不変のコピーとして返される |
| EventBus | clearHistory | イベント履歴をクリアできる |
| EventBus | clearAll | 購読と履歴の両方をクリアする |
| EventBus | エラーハンドリング | ハンドラーでエラーが発生しても他のハンドラーは実行される |

## events/TacticEvent.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TacticEvent | TacticStartedEvent | 戦術開始イベントを作成できる |
| TacticEvent | PlayerMovementStartedEvent | 選手移動開始イベントを作成できる |
| TacticEvent | PlayerMovementCompletedEvent | 選手移動完了イベントを作成できる |
| TacticEvent | ArrowDisplayedEvent | 矢印表示イベントを作成できる |
| TacticEvent | TacticCompletedEvent | 戦術完了イベントを作成できる |
| TacticEvent | BallPassDisplayedEvent | ボールパス表示イベントを作成できる |
| TacticEvent | TacticCancelledEvent | 戦術キャンセルイベントを作成できる |
| TacticEvent | タイムスタンプ | 全てのイベントにタイムスタンプが設定される |

## value-objects/Color.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Color | fromHex | 6桁のHEXカラーを作成できる |
| Color | fromHex | 3桁のHEXカラーを作成できる |
| Color | fromHex | 大文字のHEXカラーを小文字に正規化する |
| Color | fromHex | 前後の空白を除去する |
| Color | fromHex | #なしのHEXはエラーになる |
| Color | fromHex | 不正な文字を含むHEXはエラーになる |
| Color | fromHex | 桁数が不正なHEXはエラーになる |
| Color | fromHex | 空文字はエラーになる |
| Color | toHex | HEX文字列を返す |
| Color | equals | 同じHEXカラーは等しい |
| Color | equals | 大文字小文字を区別しない |
| Color | equals | 異なるHEXカラーは等しくない |
| Color | toString | HEX文字列を返す |

## value-objects/GameMode.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| GameMode | GAME_MODES | 4つのゲームモードが定義されている |
| GameMode | GAME_MODES | football, futsal, eight_aside, society が含まれる |
| GameMode | isValidGameMode | 無効な文字列はfalseを返す |
| GameMode | isValidGameMode | 空文字はfalseを返す |

## value-objects/Phase.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Phase | fromString | 無効なフェーズはエラーになる |
| Phase | fromString | 空文字はエラーになる |
| Phase | ファクトリメソッド | attack() は attack を返す |
| Phase | ファクトリメソッド | defense() は defense を返す |
| Phase | ファクトリメソッド | positiveTransition() は positive_transition を返す |
| Phase | ファクトリメソッド | negativeTransition() は negative_transition を返す |
| Phase | equals | 同じフェーズは等しい |
| Phase | equals | 異なるフェーズは等しくない |
| Phase | toString | フェーズの値を文字列として返す |

## value-objects/PlayerId.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| PlayerId | constructor | 有効な文字列でPlayerIdを作成できる |
| PlayerId | constructor | 空文字はエラーになる |
| PlayerId | constructor | 空白のみはエラーになる |
| PlayerId | generate | UUIDを生成する |
| PlayerId | generate | 生成されるIDは毎回異なる |
| PlayerId | equals | 同じ値のPlayerIdは等しい |
| PlayerId | equals | 異なる値のPlayerIdは等しくない |
| PlayerId | toString | 値を文字列として返す |

## value-objects/PluginId.test.ts

| describe | テストケース |
| --- | --- |
| PluginId | 有効な文字列でインスタンスを生成できる |
| PluginId | 空文字列ではエラーを投げる |
| PluginId | 空白のみではエラーを投げる |
| PluginId | 同じ値のPluginIdは等価である |
| PluginId | 異なる値のPluginIdは等価でない |
| PluginId | generate() はUUIDで新しいインスタンスを生成する |
| PluginId | toString() は値を返す |

## value-objects/Position.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Position | create | 座標を指定してPositionを作成できる |
| Position | create | 負の座標でも作成できる |
| Position | create | 原点でも作成できる |
| Position | distanceTo | 同じ座標の距離は0 |
| Position | distanceTo | 2点間の距離を計算できる（3-4-5の三角形） |
| Position | distanceTo | 距離は対称である（a→b === b→a） |
| Position | equals | 同じ座標は等しい |
| Position | equals | 異なるx座標は等しくない |
| Position | equals | 異なるz座標は等しくない |
| Position | toString | 座標を文字列として返す |

## value-objects/TeamId.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TeamId | constructor | 有効な文字列でTeamIdを作成できる |
| TeamId | constructor | 空文字はエラーになる |
| TeamId | constructor | 空白のみはエラーになる |
| TeamId | generate | UUIDを生成する |
| TeamId | generate | 生成されるIDは毎回異なる |
| TeamId | equals | 同じ値のTeamIdは等しい |
| TeamId | equals | 異なる値のTeamIdは等しくない |
| TeamId | toString | 値を文字列として返す |

## value-objects/TeamManualId.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| TeamManualId | constructor | 有効な文字列でTeamManualIdを作成できる |
| TeamManualId | constructor | 空文字はエラーになる |
| TeamManualId | constructor | 空白のみはエラーになる |
| TeamManualId | generate | UUIDを生成する |
| TeamManualId | generate | 生成されるIDは毎回異なる |
| TeamManualId | equals | 同じ値のTeamManualIdは等しい |
| TeamManualId | equals | 異なる値のTeamManualIdは等しくない |
| TeamManualId | toString | 値を文字列として返す |
