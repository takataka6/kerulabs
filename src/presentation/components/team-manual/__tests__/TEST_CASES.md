# Team Manual コンポーネント テストケース一覧

## ManualFormModal.test.tsx

| describe | テストケース |
| --- | --- |
| ManualFormModal | 新規作成モードでレンダリングされる (initialNameなし → タイトルが manual.create) |
| ManualFormModal | 編集モードでレンダリングされる (initialNameあり → タイトルが manual.editManual) |
| ManualFormModal | 名前の入力 |
| ManualFormModal | 説明の入力 |
| ManualFormModal | 空の名前では保存ボタンが無効 |
| ManualFormModal | 正常に保存できる |
| ManualFormModal | キャンセルで閉じる |

## ManualImportModal.test.tsx

| describe | テストケース |
| --- | --- |
| ManualImportModal | モーダルが正しくレンダリングされる |
| ManualImportModal | JSONテキストエリアの入力 |
| ManualImportModal | 空のJSONではインポートボタンが無効 |
| ManualImportModal | JSONを入力してインポートできる |
| ManualImportModal | キャンセルで閉じる |
| ManualImportModal | ファイル選択ボタンからインポート |

## ItemFormModal.test.tsx

| describe | テストケース |
| --- | --- |
| ItemFormModal | 新規作成モードでレンダリングされる（initialなし → タイトルが manual.addItem） |
| ItemFormModal | 編集モードでレンダリングされる（initialあり → タイトルが manual.editItem、初期値が入力される） |
| ItemFormModal | タイトルの入力 |
| ItemFormModal | コンテンツの入力 |
| ItemFormModal | ダイアグラムの入力 |
| ItemFormModal | 空のタイトルでは保存ボタンが無効 |
| ItemFormModal | 正常に保存: タイトル・コンテンツ・ダイアグラムが正しく渡される |
| ItemFormModal | ダイアグラム空文字列の場合はundefinedが渡される |
| ItemFormModal | 編集モードでlinkedTacticIdsが保持される |
| ItemFormModal | キャンセルでonCloseが呼ばれる |
| ItemFormModal | MermaidFlowchartプレビューが表示される（ダイアグラム入力時） |

## SectionFormModal.test.tsx

| describe | テストケース |
| --- | --- |
| SectionFormModal | 新規作成モードでレンダリングされる（initialなし → タイトルが manual.addSection） |
| SectionFormModal | 編集モードでレンダリングされる（initialあり → タイトルが manual.editSection） |
| SectionFormModal | タイトルの入力 |
| SectionFormModal | カテゴリの選択変更 |
| SectionFormModal | フォーメーション入力（カンマ区切り） |
| SectionFormModal | 空のタイトルでは保存ボタンが無効 |
| SectionFormModal | 空のタイトルで保存クリックしてもonSaveが呼ばれない |
| SectionFormModal | 正常に保存: onSaveが正しいデータで呼ばれる（formations がカンマ区切りで分割される） |
| SectionFormModal | キャンセルでonCloseが呼ばれる |
| SectionFormModal | 全カテゴリがselect optionとして表示される |

## ManualDetail.test.tsx

| describe | テストケース |
| --- | --- |
| ManualDetail | マニュアル名が表示される |
| ManualDetail | マニュアルの説明が表示される |
| ManualDetail | セクション名が表示される |
| ManualDetail | 項目のタイトルが表示される |
| ManualDetail | 項目の内容が表示される |
| ManualDetail | Mermaid図解がレンダリングされる |
| ManualDetail | フォーメーションバッジが表示される |
| ManualDetail | 空のセクションには空メッセージが表示される |
| ManualDetail | セクションがないマニュアルには空メッセージが表示される |
| ManualDetail | パンくずナビが表示される |
| ManualDetail | セクション追加ボタンが表示される |
| ManualDetail | セクションインポートボタンが表示される |
| ManualDetail | 戻るボタンでonBackが呼ばれる |
| ManualDetail | セクション追加ボタンをクリックするとSectionFormModalが表示される |
| ManualDetail | セクションインポートボタンをクリックするとManualImportModalが表示される |
| ManualDetail | セクション編集ボタンをクリックするとSectionFormModalが表示される |
| ManualDetail | セクション削除ボタンをクリックするとconfirmが呼ばれる |
| ManualDetail | 項目追加ボタンをクリックするとItemFormModalが表示される |
| ManualDetail | 項目編集ボタンをクリックするとItemFormModalが表示される |
| ManualDetail | 項目削除ボタンをクリックするとconfirmが呼ばれる |
| ManualDetail | エクスポートボタンをクリックするとクリップボードにコピーされる |
| ManualDetail | セクション削除でconfirmがtrueを返すとmanualのremoveSectionが呼ばれる |
| ManualDetail | 項目削除でconfirmがtrueを返すとmanualのremoveItemが呼ばれる |
| ManualDetail | クリップボードコピー失敗時にエラートーストが表示される |
