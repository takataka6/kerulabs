# Team Hooks テストケース一覧

## useTeamManagement.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useTeamManagement | 初期状態 | selectedTeamId が null |
| useTeamManagement | 初期状態 | showTeamSelection が true |
| useTeamManagement | 初期状態 | showTeamCreator が false |
| useTeamManagement | 初期状態 | showBulkTeamImport が false |
| useTeamManagement | 初期状態 | customSquad が空配列 |
| useTeamManagement | 初期状態 | selectedTeam が undefined（チーム未選択） |
| useTeamManagement | 初期状態 | teams が渡されていても selectedTeamId が null なら selectedTeam は undefined |
| useTeamManagement | チーム選択 | setSelectedTeamId でチームを選択できる |
| useTeamManagement | チーム選択 | 存在しない teamId を選択すると selectedTeam は undefined |
| useTeamManagement | handleCreateTeam | 成功: チームを保存しキャッシュを更新する |
| useTeamManagement | handleCreateTeam | 成功: 選択状態が更新される |
| useTeamManagement | handleCreateTeam | 失敗: handleError が呼ばれる |
| useTeamManagement | handleUpdateTeam | 成功: チームを保存しキャッシュを無効化する |
| useTeamManagement | handleUpdateTeam | 失敗: handleError が呼ばれる |
| useTeamManagement | handleDeleteTeam | 成功: チームを削除しキャッシュを無効化する |
| useTeamManagement | handleDeleteTeam | 確認ダイアログでキャンセルすると削除しない |
| useTeamManagement | handleDeleteTeam | 選択中のチームを削除すると selectedTeamId が null になる |
| useTeamManagement | handleDeleteTeam | 選択していないチームを削除しても selectedTeamId は変わらない |
| useTeamManagement | handleDeleteTeam | 失敗: handleError が呼ばれる |
| useTeamManagement | handleUpdateSquad | 成功: スカッドをローカル状態と DB に保存する |
| useTeamManagement | handleUpdateSquad | チーム未選択時は DB 保存しない |
| useTeamManagement | handleUpdateSquad | 失敗: handleError が呼ばれる |
| useTeamManagement | handleSubstitution | スターターとサブの選手を入れ替える |
| useTeamManagement | handleSubstitution | どちらかが null の場合は交代しない |
| useTeamManagement | resetSubstitutions | 交代を元に戻し substitutionRecords をクリアする |
| useTeamManagement | チーム変更時の Effect | チーム選択時にカード状態が初期化される |
| useTeamManagement | チーム変更時の Effect | チーム未選択時にカード状態がリセットされる |
| useTeamManagement | handleBulkTeamImport | 成功: 単一チームをインポートする |
| useTeamManagement | handleBulkTeamImport | 成功: 複数チームをインポートする |
| useTeamManagement | handleBulkTeamImport | 空配列の場合はエラートーストを表示 |
| useTeamManagement | handleBulkTeamImport | 確認ダイアログでキャンセルすると処理しない |
| useTeamManagement | handleBulkTeamImport | 不正な JSON の場合 handleError が呼ばれる |
| useTeamManagement | handleBulkTeamImport | DB 保存失敗時に handleError が呼ばれる |
| useTeamManagement | UI 状態トグル | setShowTeamSelection でチーム選択パネルの表示を切替できる |
| useTeamManagement | UI 状態トグル | setShowTeamCreator でチーム作成モーダルの表示を切替できる |
| useTeamManagement | UI 状態トグル | setShowBulkTeamImport で一括インポートモーダルの表示を切替できる |

## useDisplayData.test.ts

| describe | テストケース |
| --- | --- |
| useDisplayData | selectedTeam が undefined の場合、colorsData は全て "#000000" |
| useDisplayData | selectedTeam がある場合、colorsData にチームカラーを反映 |
| useDisplayData | currentFormation が undefined の場合、playersData は空配列 |
| useDisplayData | showSquadBuilder が true の場合、ポジション名を表示 |
| useDisplayData | lineupTeamInfo にチーム名とフォーメーション名が含まれる |

## useCardManagement.test.ts

| describe | テストケース |
| --- | --- |
| useCardManagement | 初期状態: playerCards 空、managerCard=none、showCards=true |
| useCardManagement | cycleCard: none → yellow → double_yellow → red → none |
| useCardManagement | playerCards を更新できる |
| useCardManagement | managerCard を更新できる |
| useCardManagement | showCards をトグルできる |

## useManagerEditor.test.ts

| describe | テストケース |
| --- | --- |
| useManagerEditor | 初期状態: editingManager=false、managerInput=空文字 |
| useManagerEditor | startEditing で編集モードに入り、入力値がセットされる |
| useManagerEditor | startEditing に空文字を渡すと managerInput も空文字 |
| useManagerEditor | cancelEditing で編集モードを終了する |
| useManagerEditor | setManagerInput で入力値を直接更新できる |
