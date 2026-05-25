# Infrastructure Schemas テストケース一覧

## glossary-import-export.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Glossary import/export | roundtrip | export → import で用語集の name/description が保持される |
| Glossary import/export | roundtrip | export → import で用語の全フィールドが保持される |
| Glossary import/export | roundtrip | 2回連続 export → import でデータが劣化しない |
| Glossary import/export | roundtrip | 用語が空の用語集が正しくラウンドトリップする |
| Glossary import/export | roundtrip | インポート時に新しいIDが生成される |
| Glossary import/export | import formats | keywords がない場合は空配列になる |
| Glossary import/export | import formats | 配列形式で複数の用語集をインポートできる |
| Glossary import/export | import formats | 単一オブジェクト形式でもインポートできる |
| Glossary import/export | import formats | デフォルト値が適用される（name/description/terms なし） |
| Glossary import/export | import formats | 用語の term/description にデフォルト値が適用される |
| Glossary import/export | error handling | 不正なJSONはエラーになる |
| Glossary import/export | error handling | 文字列はエラーになる（オブジェクト/配列が必要） |

## pluginSchema.test.ts

| describe | テストケース |
| --- | --- |
| pluginManifestSchema | 有効なマニフェストを受理する |
| pluginManifestSchema | kerulabs_pluginが空の場合は拒否する |
| pluginManifestSchema | typeがlesson以外の場合は拒否する |
| pluginManifestSchema | metadata.idが空の場合は拒否する |
| pluginManifestSchema | sectionsが空の場合は拒否する |
| pluginManifestSchema | paragraphセクションを受理する |
| pluginManifestSchema | codeBlockセクションを受理する |
| pluginManifestSchema | miniPitchDemoセクションを受理する |
| pluginManifestSchema | miniPitchStepsセクションを受理する |
| pluginManifestSchema | interactiveDemoセクションを受理する |
| pluginManifestSchema | 不正なカテゴリは拒否する |
| pluginManifestSchema | 全カテゴリを受理する |
| pluginRecordSchema | 有効なレコードを受理する |
| pluginRecordSchema | idが空の場合は拒否する |
| pluginRecordSchema | installedAtがない場合は拒否する |

## schemas.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| tacticSchema | movementRecordSchema | 有効な移動レコードをパースできる |
| tacticSchema | movementRecordSchema | delay が負の値だとエラーになる |
| tacticSchema | movementRecordSchema | 必須フィールドがないとエラーになる |
| tacticSchema | ballPassRecordSchema | 有効なボールパスレコードをパースできる |
| tacticSchema | ballPassRecordSchema | オプションフィールドをパースできる |
| tacticSchema | tacticRecordSchema | 有効な戦術レコードをパースできる |
| tacticSchema | tacticRecordSchema | ballPasses がオプションでパースできる |
| tacticSchema | tacticRecordSchema | 不正な型はエラーになる |
| tacticSchema | tacticExportDataSchema | 有効なエクスポートデータをパースできる |
| tacticSchema | tacticExportDataSchema | 空の戦術配列をパースできる |
| tacticSchema | tacticExportDataSchema | version がないとエラーになる |
| tacticSchema | tacticExportDataSchema | tactics がないとエラーになる |
| teamSchema | playerRecordSchema | 有効な選手レコードをパースできる |
| teamSchema | playerRecordSchema | オプションフィールドをパースできる |
| teamSchema | playerRecordSchema | 背番号が 0-99 の範囲外だとエラーになる |
| teamSchema | playerRecordSchema | position が不正な値だとエラーになる |
| teamSchema | teamRecordSchema | 有効なチームレコードをパースできる |
| teamSchema | teamRecordSchema | players 配列をパースできる |
| teamSchema | teamImportDataSchema | 最小限のデータでパースできる（デフォルト値が適用される） |
| teamSchema | teamImportDataSchema | name が空文字だとエラーになる |
| teamSchema | teamImportDataSchema | name がないとエラーになる |
| teamSchema | teamImportDataSchema | 完全なデータをパースできる |
| formationSchema | positionRecordSchema | 有効なポジションレコードをパースできる |
| formationSchema | positionRecordSchema | cat が不正な値だとエラーになる |
| formationSchema | formationRecordSchema | 有効なフォーメーションレコードをパースできる |
| formationSchema | formationRecordSchema | gameMode がオプションでパースできる |
| formationSchema | formationRecordSchema | 不正な gameMode だとエラーになる |
| glossarySchema | glossaryTermSchema | 有効な用語をパースできる |
| glossarySchema | glossaryTermSchema | reading がオプションでパースできる |
| glossarySchema | glossaryRecordSchema | 有効な用語集レコードをパースできる |
| glossarySchema | glossaryImportSchema | 最小限のデータでパースできる（デフォルト値が適用される） |
| glossarySchema | glossaryImportSchema | 用語付きデータをパースできる |

## team-import.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| Team import validation | defaults | 最小限のデータにデフォルト値が適用される |
| Team import validation | defaults | colors を省略するとデフォルト gk カラーが適用される |
| Team import validation | defaults | colors.gk を省略するとデフォルト値が適用される |
| Team import validation | defaults | players の position デフォルトは mf |
| Team import validation | full data | 全フィールドを含むチームデータをパースできる |
| Team import validation | player validation | 全ポジション（gk/df/mf/fw）が有効 |
| Team import validation | player validation | 不正な position はエラーになる |
| Team import validation | player validation | 背番号 0 は有効 |
| Team import validation | player validation | 背番号 99 は有効 |
| Team import validation | player validation | 背番号 100 はエラーになる |
| Team import validation | player validation | 背番号 -1 はエラーになる |
| Team import validation | player validation | 背番号が小数だとエラーになる |
| Team import validation | error cases | name が空文字だとエラーになる |
| Team import validation | error cases | name がないとエラーになる |
| Team import validation | error cases | name が数値だとエラーになる |
| Team import validation | error cases | players が配列でないとエラーになる |
| Team import validation | error cases | player に name がないとエラーになる |
| Team import validation | error cases | player に number がないとエラーになる |
| Team import validation | bulk import (array) | 配列で複数チームをパースできる |
