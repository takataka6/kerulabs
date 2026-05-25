# Player Management コンポーネント テストケース一覧

## PlayerAddForm.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| PlayerAddForm | 基本レンダリング | タイトルを表示する |
| PlayerAddForm | 基本レンダリング | PlayerFormFields を表示する |
| PlayerAddForm | 基本レンダリング | 追加ボタンとキャンセルボタンを表示する |
| PlayerAddForm | バリデーション | 名前と番号が空のとき追加ボタンでエラートーストが表示される |
| PlayerAddForm | バリデーション | 番号が不正なとき（0）エラートーストが表示される |
| PlayerAddForm | バリデーション | 番号が不正なとき（100）エラートーストが表示される |
| PlayerAddForm | バリデーション | 既存プレイヤーと番号が重複するときエラートーストが表示される |
| PlayerAddForm | 正常追加 | 有効な入力で追加ボタンを押すと onUpdateTeam と onClose が呼ばれる |
| PlayerAddForm | キャンセル | キャンセルボタンで onClose が呼ばれる |

## BulkImportForm.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| BulkImportForm | レンダリング | タイトルが表示される |
| BulkImportForm | レンダリング | CSVフォーマット説明が表示される |
| BulkImportForm | レンダリング | JSONフォーマット説明が表示される |
| BulkImportForm | レンダリング | テキストエリアが表示される |
| BulkImportForm | レンダリング | インポートボタンが表示される |
| BulkImportForm | レンダリング | キャンセルボタンが表示される |
| BulkImportForm | テキストエリア入力 | テキストエリアに値を入力できる |
| BulkImportForm | 空データでインポート | 空のデータでインポートするとエラートーストが表示される |
| BulkImportForm | キャンセル | キャンセルボタンをクリックするとonCloseが呼ばれる |
| BulkImportForm | 説明表示 | CSV説明のインストラクションが表示される |
| BulkImportForm | 説明表示 | JSON説明のインストラクションが表示される |
| BulkImportForm | 説明表示 | CSVサンプルコードが表示される |
| BulkImportForm | スモークテスト | クラッシュせずにレンダリングされる |

## PlayerSearchFilter.test.tsx

| describe | テストケース |
| --- | --- |
| PlayerSearchFilter | 検索入力フィールドを表示する |
| PlayerSearchFilter | ポジションフィルターセレクトを表示する |
| PlayerSearchFilter | ソートセレクトを表示する |
| PlayerSearchFilter | 検索入力時に onSearchChange が呼ばれる |
| PlayerSearchFilter | フィルター変更時に onFilterChange が呼ばれる |
| PlayerSearchFilter | ソート変更時に onSortChange が呼ばれる |

## PlayerManagement.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| PlayerManagement | 基本レンダリング | モーダルがレンダリングされる |
| PlayerManagement | 基本レンダリング | チーム名が表示される |
| PlayerManagement | 基本レンダリング | サブタイトルに登録人数が表示される |
| PlayerManagement | 基本レンダリング | 閉じるボタンが表示される |
| PlayerManagement | 基本レンダリング | PositionStatsGridが表示される |
| PlayerManagement | 基本レンダリング | PlayerSearchFilterが表示される |
| PlayerManagement | 基本レンダリング | 選手追加ボタンが表示される |
| PlayerManagement | 基本レンダリング | 一括インポートボタンが表示される |
| PlayerManagement | 基本レンダリング | フッターの閉じるボタンが表示される |
| PlayerManagement | 選手リスト表示 | 選手が存在する場合、PlayerRowが表示される |
| PlayerManagement | 選手リスト表示 | 選手が0人の場合、空メッセージが表示される |
| PlayerManagement | 選手リスト表示 | 選手リストのカウントが表示される |
| PlayerManagement | UI操作 | 選手追加ボタンをクリックするとPlayerAddFormが表示される |
| PlayerManagement | UI操作 | 一括インポートボタンをクリックするとBulkImportFormが表示される |
| PlayerManagement | UI操作 | 選手追加ボタンクリック後、追加ボタン群が非表示になる |
| PlayerManagement | UI操作 | 閉じるボタンをクリックするとonCloseが呼ばれる |
| PlayerManagement | UI操作 | フッター閉じるボタンをクリックするとonCloseが呼ばれる |

## PositionStatsGrid.test.tsx

| describe | テストケース |
| --- | --- |
| PositionStatsGrid | 4 ポジション（GK, DF, MF, FW）のカードを表示する |
| PositionStatsGrid | 各ポジションの人数をカウントして表示する |
| PositionStatsGrid | 選手がいない場合は全て 0 を表示する |
| PositionStatsGrid | ポジション別のアイコンを表示する |

## PlayerRow.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| PlayerRow | 表示モード | 選手名が表示される |
| PlayerRow | 表示モード | 背番号が表示される |
| PlayerRow | 表示モード | ポジションが表示される |
| PlayerRow | 表示モード | 編集ボタンが表示される |
| PlayerRow | 表示モード | 削除ボタンが表示される |
| PlayerRow | 表示モード | 国籍が設定されている場合、国旗が表示される |
| PlayerRow | 表示モード | 所属クラブが設定されている場合、クラブ名が表示される |
| PlayerRow | 表示モード | メモが設定されている場合、メモが表示される |
| PlayerRow | 表示モード | ステータスが suspended の場合、ステータスが表示される |
| PlayerRow | インタラクション | 編集ボタンでonStartEditが呼ばれる |
| PlayerRow | インタラクション | 削除ボタンでonRemoveが呼ばれる |
| PlayerRow | 編集モード | 編集モードでフォームフィールドが表示される |
| PlayerRow | 編集モード | 編集モードで保存・キャンセルボタンが表示される |
| PlayerRow | 編集モード | 保存ボタンでonUpdateとonCancelEditが呼ばれる |
| PlayerRow | 編集モード | キャンセルボタンでonCancelEditが呼ばれる |
| PlayerRow | 編集モード | マーカー画像設定ボタンでImageCropModalが表示される |
| PlayerRow | 編集モード | メインビジュアル画像設定ボタンでImageCropModalが表示される |
| PlayerRow | 編集モード | マーカー画像が設定済みの場合、変更・削除ボタンが表示される |
| PlayerRow | 編集モード | メインビジュアル画像が設定済みの場合、変更・削除ボタンが表示される |

## PlayerFormFields.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| PlayerFormFields | 基本レンダリング | 名前入力フィールドが表示される |
| PlayerFormFields | 基本レンダリング | 背番号入力フィールドが表示される |
| PlayerFormFields | 基本レンダリング | ポジション選択フィールドが表示される |
| PlayerFormFields | 基本レンダリング | 国籍選択フィールドが表示される |
| PlayerFormFields | 基本レンダリング | クラブ入力フィールドが表示される |
| PlayerFormFields | 基本レンダリング | リーグ国選択フィールドが表示される |
| PlayerFormFields | 基本レンダリング | メモ入力フィールドが表示される |
| PlayerFormFields | 基本レンダリング | ステータス選択フィールドが表示される |
| PlayerFormFields | ポジションオプション | GK/DF/MF/FWの4つのポジションオプションが表示される |
| PlayerFormFields | ステータスオプション | 3つのステータスオプションが表示される |
| PlayerFormFields | 国籍選択 | 日本語モードで日本語の国名が表示される |
| PlayerFormFields | 国籍選択 | 英語モードで英語の国名が表示される |
| PlayerFormFields | 国籍選択 | 空の国籍オプションが表示される |
| PlayerFormFields | 国籍選択 | 空のリーグ国オプションが表示される |
| PlayerFormFields | 入力操作 | 名前入力でonNameChangeが呼ばれる |
| PlayerFormFields | 入力操作 | 背番号入力でonNumberChangeが呼ばれる |
| PlayerFormFields | 入力操作 | ポジション変更でonPositionChangeが呼ばれる |
| PlayerFormFields | 入力操作 | 国籍変更でonNationalityChangeが呼ばれる |
| PlayerFormFields | 入力操作 | クラブ入力でonClubChangeが呼ばれる |
| PlayerFormFields | 入力操作 | リーグ国変更でonLeagueCountryChangeが呼ばれる |
| PlayerFormFields | 入力操作 | メモ入力でonNoteChangeが呼ばれる |
| PlayerFormFields | 入力操作 | ステータス変更でonStatusChangeが呼ばれる |
| PlayerFormFields | 初期値 | 指定された名前が初期値として表示される |
| PlayerFormFields | 初期値 | 指定された背番号が初期値として表示される |
| PlayerFormFields | 初期値 | 指定されたポジションが選択されている |
| PlayerFormFields | 初期値 | 指定されたクラブが初期値として表示される |
| PlayerFormFields | 初期値 | 指定されたステータスが選択されている |
| PlayerFormFields | カスタムプレースホルダー | カスタム国籍プレースホルダーが使用される |
| PlayerFormFields | カスタムプレースホルダー | カスタムリーグ国プレースホルダーが使用される |
