# Glossary コンポーネント テストケース一覧

## TermFormModal.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| TermFormModal | 基本レンダリング（新規追加モード） | モーダルを表示する |
| TermFormModal | 基本レンダリング（新規追加モード） | 新規追加時のタイトルを表示する |
| TermFormModal | 基本レンダリング（新規追加モード） | 用語名・読み仮名・キーワード・説明のフィールドを表示する |
| TermFormModal | 基本レンダリング（新規追加モード） | 保存ボタンとキャンセルボタンを表示する |
| TermFormModal | 編集モード | 編集時のタイトルを表示する |
| TermFormModal | 編集モード | 初期値がフィールドにセットされる |
| TermFormModal | バリデーション | 用語名が空のとき保存ボタンが無効になる |
| TermFormModal | バリデーション | 用語名が空のとき保存ボタンをクリックしても onSave が呼ばれない |
| TermFormModal | 保存 | 有効な入力で保存ボタンをクリックすると onSave が呼ばれる |
| TermFormModal | 保存 | 前後空白がトリムされ、空読みは undefined になる |
| TermFormModal | キーワード操作 | 既存キーワードがチップとして表示される |
| TermFormModal | キーワード操作 | キーワードチップをクリックして選択・解除できる |
| TermFormModal | キーワード操作 | 新規キーワードを追加できる |
| TermFormModal | キーワード操作 | Enter キーで新規キーワードを追加できる |
| TermFormModal | キーワード操作 | 空のキーワードは追加されない |
| TermFormModal | キーワード操作 | 重複キーワードは追加されない |
| TermFormModal | キャンセル | キャンセルボタンで onClose が呼ばれる |

## GlossaryDetail.test.tsx

| describe | テストケース |
| --- | --- |
| GlossaryDetail | 用語付きの用語集を正しくレンダリングする |
| GlossaryDetail | 用語が空の場合にエンプティステートを表示する |
| GlossaryDetail | 戻るボタンが onBack コールバックを持つ |
| GlossaryDetail | キーワードがある場合にキーワードフィルターセレクトを表示する |
| GlossaryDetail | 用語の件数情報を表示する |
| GlossaryDetail | 戻るボタンをクリックすると onBack が呼ばれる |
| GlossaryDetail | 用語追加ボタンをクリックするとモーダルが表示される |
| GlossaryDetail | 検索入力が変更できる |
| GlossaryDetail | キーワードフィルターが変更できる |
| GlossaryDetail | 用語の編集ボタンをクリックすると編集モーダルが表示される |
| GlossaryDetail | 用語の削除ボタンをクリックすると確認ダイアログ後に削除される |
| GlossaryDetail | テーブルヘッダーをクリックするとソートできる |

## GlossaryImportModal.test.tsx

| describe | テストケース |
| --- | --- |
| GlossaryImportModal | インポートモーダルを描画する |
| GlossaryImportModal | JSON テキストエリアを持つ |
| GlossaryImportModal | JSON が空の場合にインポートボタンが disabled |
| GlossaryImportModal | JSON が空白のみの場合にインポートボタンが disabled |
| GlossaryImportModal | JSON を入力するとインポートボタンが有効になる |
| GlossaryImportModal | インポートボタンをクリックすると onImport が呼ばれる |
| GlossaryImportModal | キャンセルボタンをクリックすると onClose が呼ばれる |

## GlossaryFormModal.test.tsx

| describe | テストケース |
| --- | --- |
| GlossaryFormModal | 新規作成モードで表示する |
| GlossaryFormModal | 編集モードで表示する |
| GlossaryFormModal | 編集モードで初期値がフィールドにセットされる |
| GlossaryFormModal | 名前入力フィールドを持つ |
| GlossaryFormModal | 説明入力フィールドを持つ |
| GlossaryFormModal | 名前が空の場合に保存ボタンが disabled |
| GlossaryFormModal | 名前が空白のみの場合も保存ボタンが disabled |
| GlossaryFormModal | 名前を入力すると保存ボタンが有効になる |
| GlossaryFormModal | 保存ボタンをクリックすると onSave が呼ばれる |
| GlossaryFormModal | 保存時に名前と説明の前後空白がトリムされる |
| GlossaryFormModal | 名前が空のとき保存ボタンをクリックしても onSave が呼ばれない |
| GlossaryFormModal | キャンセルボタンをクリックすると onClose が呼ばれる |
