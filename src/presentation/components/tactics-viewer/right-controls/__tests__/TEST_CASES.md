# Tactics Viewer Right Controls テストケース一覧

## BackgroundSettingsPanel.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| BackgroundSettingsPanel | トグルボタン | 背景設定ボタンを表示する |
| BackgroundSettingsPanel | トグルボタン | ボタンをクリックすると setShowSceneBgSettings が呼ばれる |
| BackgroundSettingsPanel | トグルボタン | aria-expanded が設定に応じて変わる |
| BackgroundSettingsPanel | パネル非表示時 | showSceneBgSettings が false のときパネルは表示されない |
| BackgroundSettingsPanel | パネル表示時 | シーン背景色の入力を表示する |
| BackgroundSettingsPanel | パネル表示時 | ピッチ色の入力を表示する |
| BackgroundSettingsPanel | パネル表示時 | ピッチ透明度スライダーを表示する |
| BackgroundSettingsPanel | パネル表示時 | 背景画像セクションを表示する |
| BackgroundSettingsPanel | シーン背景色リセット | デフォルト色ではリセットボタンを表示しない |
| BackgroundSettingsPanel | シーン背景色リセット | デフォルト色以外ではリセットボタンを表示する |
| BackgroundSettingsPanel | シーン背景色リセット | リセットボタンをクリックすると setSceneBgColor がデフォルト値で呼ばれる |
| BackgroundSettingsPanel | ピッチ色リセット | デフォルト色ではリセットボタンを表示しない |
| BackgroundSettingsPanel | ピッチ色リセット | デフォルト色以外ではリセットボタンを表示する |
| BackgroundSettingsPanel | ピッチ透明度リセット | デフォルト値ではリセットボタンを表示しない |
| BackgroundSettingsPanel | ピッチ透明度リセット | デフォルト値以外ではリセットボタンを表示しクリックで setPitchOpacity が呼ばれる |
| BackgroundSettingsPanel | 全リセットボタン | デフォルト設定のとき全リセットボタンを表示しない |
| BackgroundSettingsPanel | 全リセットボタン | 非デフォルト設定のとき全リセットボタンを表示する |
| BackgroundSettingsPanel | 背景画像 | 画像がない場合は追加ボタンのみ表示する |
| BackgroundSettingsPanel | 背景画像 | 画像がある場合はサムネイルを表示する |
| BackgroundSettingsPanel | 背景画像 | 画像サムネイルをクリックすると handleSelectBgImage が呼ばれる |
| BackgroundSettingsPanel | 背景画像 | 削除ボタンをクリックすると handleRemoveBgImage が呼ばれる |
| BackgroundSettingsPanel | 背景画像 | 背景なしボタンをクリックすると handleSelectBgImage(-1) が呼ばれる |
| BackgroundSettingsPanel | 色・透明度変更コールバック | シーン背景色を変更すると setSceneBgColor が呼ばれる |
| BackgroundSettingsPanel | 色・透明度変更コールバック | ピッチ色を変更すると setPitchColor が呼ばれる |
| BackgroundSettingsPanel | 色・透明度変更コールバック | ピッチ透明度スライダーを変更すると setPitchOpacity が呼ばれる |
| BackgroundSettingsPanel | 色・透明度変更コールバック | 画像アップロードで handleSceneBgImageUpload が呼ばれる |

## OpponentSquadSelector.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| OpponentSquadSelector | 非表示条件 | opponentPlacementMode が false のとき何も表示しない |
| OpponentSquadSelector | 非表示条件 | teams が undefined のとき何も表示しない |
| OpponentSquadSelector | 非表示条件 | teams が空配列のとき何も表示しない |
| OpponentSquadSelector | チーム選択 | チーム選択ラベルを表示する |
| OpponentSquadSelector | チーム選択 | チーム選択プルダウンに自チーム以外が表示される |
| OpponentSquadSelector | チーム選択 | プルダウンの先頭に「なし」オプションがある |
| OpponentSquadSelector | チーム選択 | チーム変更時に関連ステートがリセットされる |
| OpponentSquadSelector | チーム選択 | 空文字選択時に null をセットする |
| OpponentSquadSelector | opponentTeam 選択後のアクション | スカッドボタンを表示する |
| OpponentSquadSelector | opponentTeam 選択後のアクション | スカッドボタンをクリックすると setShowOpponentFormationSelect が呼ばれる |
| OpponentSquadSelector | opponentTeam 選択後のアクション | 編集案内文を表示する |
| OpponentSquadSelector | opponentTeam 選択後のアクション | プレイヤーリストを表示する |
| OpponentSquadSelector | opponentTeam 選択後のアクション | 配置済みプレイヤーは無効化される |
| OpponentSquadSelector | opponentTeam 選択後のアクション | 未配置プレイヤーをクリックすると setSelectedOpponentPlayerId が呼ばれる |
