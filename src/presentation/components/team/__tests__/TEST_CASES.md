# Team コンポーネント テストケース一覧

## TeamEditor.test.tsx

| describe | テストケース |
| --- | --- |
| TeamEditor | モーダルが正しくレンダリングされる |
| TeamEditor | チーム名の入力と更新 |
| TeamEditor | サブタイトルの変更 |
| TeamEditor | 国選択の変更 |
| TeamEditor | 監督名の入力 |
| TeamEditor | フォーメーションの選択/解除 (最低1つは残る) |
| TeamEditor | デフォルトフォーメーションの更新 |
| TeamEditor | 空のチーム名で保存するとalertが表示される |
| TeamEditor | フォーメーション未選択で保存するとalertが表示される |
| TeamEditor | 正常に保存できる (onSaveが呼ばれ、onCloseが呼ばれる) |
| TeamEditor | キャンセルボタンでonCloseが呼ばれる |

## BulkTeamImportModal.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| BulkTeamImportModal | 基本レンダリング | モーダルがレンダリングされる |
| BulkTeamImportModal | 基本レンダリング | タイトルが表示される |
| BulkTeamImportModal | 基本レンダリング | 閉じるボタンが表示される |
| BulkTeamImportModal | 基本レンダリング | 説明セクションが表示される |
| BulkTeamImportModal | 基本レンダリング | JSONデータ入力ラベルが表示される |
| BulkTeamImportModal | 基本レンダリング | テキストエリアが表示される |
| BulkTeamImportModal | 基本レンダリング | キャンセルボタンが表示される |
| BulkTeamImportModal | 基本レンダリング | インポートボタンが表示される |
| BulkTeamImportModal | 基本レンダリング | フィールド説明が表示される |
| BulkTeamImportModal | 基本レンダリング | サンプル表示トグルが存在する |
| BulkTeamImportModal | ボタン状態 | テキストエリアが空の場合、インポートボタンが無効化される |
| BulkTeamImportModal | ボタン状態 | テキストエリアに入力がある場合、インポートボタンが有効になる |
| BulkTeamImportModal | 閉じる操作 | 閉じるボタンをクリックするとonCloseが呼ばれる |
| BulkTeamImportModal | 閉じる操作 | キャンセルボタンをクリックするとonCloseが呼ばれる |
| BulkTeamImportModal | インポート処理 | 無効なJSONで空白のみの入力はボタンが無効化される |
| BulkTeamImportModal | インポート処理 | 無効なJSONでインポートするとエラーが表示される |
| BulkTeamImportModal | インポート処理 | 有効なJSONでインポートするとonImportが呼ばれる |
| BulkTeamImportModal | インポート処理 | インポート成功後にonCloseが呼ばれる |
| BulkTeamImportModal | インポート処理 | インポート失敗時にエラーが表示される |
| BulkTeamImportModal | インポート処理 | テキストエリア入力時にエラーがクリアされる |

## TeamCreator.test.tsx

| describe | テストケース |
| --- | --- |
| TeamCreator | チーム作成フォームがレンダリングされる |
| TeamCreator | チーム名入力フィールドが表示される |
| TeamCreator | サブタイトル入力フィールドが表示される |
| TeamCreator | 国選択フィールドが表示される |
| TeamCreator | 監督入力フィールドが表示される |
| TeamCreator | フォーメーション選択ボタンが表示される |
| TeamCreator | 作成・キャンセルボタンが表示される |
| TeamCreator | チームカラー設定フィールドが表示される |
| TeamCreator | チーム名を入力できる |
| TeamCreator | サブタイトルを入力できる |
| TeamCreator | 国を選択できる |
| TeamCreator | 監督名を入力できる |
| TeamCreator | フォーメーションのトグルで選択/解除ができる |
| TeamCreator | GKカラーピッカーで色を変更できる |
| TeamCreator | フィールドカラーピッカーで色を変更できる |
| TeamCreator | キャンセルボタンでonCloseが呼ばれる |
| TeamCreator | 作成ボタンでhandleCreateが実行される（チーム名空の場合alertが呼ばれる） |
| TeamCreator | 国旗タイプを選択できる |
| TeamCreator | グラデーションカラーを選択できる |
| TeamCreator | チーム名を入力して作成ボタンをクリックするとonCreateTeamが呼ばれる |
| TeamCreator | デフォルトフォーメーションを変更できる |
| TeamCreator | 全フォーメーションを解除すると最低1つは残る |

## SquadBuilder.test.tsx

| describe | テストケース |
| --- | --- |
| SquadBuilder | renders with a mock team |
| SquadBuilder | ポジションをクリックするとアクティブ状態になる |
| SquadBuilder | 選手検索フィルターで選手を絞り込める |
| SquadBuilder | 保存ボタンでonUpdateSquadとonCloseが呼ばれる |
| SquadBuilder | キャンセルボタンでonCloseが呼ばれる |
| SquadBuilder | SUBボタンで選手をサブに追加できる |
| SquadBuilder | ポジションスロットの選手をクリックすると割り当てが解除される |
| SquadBuilder | アクティブポジションがある時に選手をクリックすると割り当てられる |
| SquadBuilder | サブメンバーを削除できる |
| SquadBuilder | ポジションボタンから直接選手を割り当てできる |
| SquadBuilder | 保存ボタンでサブメンバーも含めてonUpdateSquadに渡される |
| SquadBuilder | 同じポジションを再度クリックするとアクティブ状態が解除される |

## FormationEditor.test.tsx

| describe | テストケース |
| --- | --- |
| FormationEditor | ヘッダーとタブを表示する |
| FormationEditor | 閉じるボタンをクリックすると onClose が呼ばれる |
| FormationEditor | 利用可能なフォーメーションボタンを表示する |
| FormationEditor | 選択済みフォーメーションのトグルで選択を解除できる |
| FormationEditor | 最後の1つは解除できない（disabled） |
| FormationEditor | 複数フォーメーション選択時にデフォルト選択のドロップダウンを表示する |
| FormationEditor | 戦術タブに切り替えるとフェーズごとの戦術リストを表示する |
| FormationEditor | デフォルトでは全戦術モード表示 |
| FormationEditor | 戦術のチェックボックスを外すと明示モードに切り替わる |
| FormationEditor | 全解除ボタンで該当フェーズの戦術を全解除する |
| FormationEditor | 保存ボタンで onUpdateTeam と onClose が呼ばれる |
| FormationEditor | テキストインポートエリアの表示・非表示を切り替えられる |
| FormationEditor | 有効な JSON をインポートすると成功通知を表示する |
| FormationEditor | 無効な JSON をインポートするとエラー通知を表示する |
| FormationEditor | 空の availableFormations でインポートするとエラーになる |
| FormationEditor | クリップボードにエクスポートすると成功通知を表示する |
| FormationEditor | 戦術タブで対象フォーメーションを切り替えられる |
