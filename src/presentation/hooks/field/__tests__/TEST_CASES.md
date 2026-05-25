# Field Hooks テストケース一覧

## useBallPlacement.test.ts

| describe | テストケース |
| --- | --- |
| useBallPlacement | 初期状態: ballPosition=null、ballPlacementMode=false |
| useBallPlacement | toggleBallPlacement でモードを ON/OFF できる |
| useBallPlacement | handleBallPlace でボールを配置し、モードが OFF になる |
| useBallPlacement | handleBallDrag でボール位置を更新する（snapshot なし） |
| useBallPlacement | handleBallRemove でボール位置を null にし snapshot を push |

## useConnectionLines.test.ts

| describe | テストケース |
| --- | --- |
| useConnectionLines | 初期状態: ライン空、描画モード OFF、色は cyan |
| useConnectionLines | toggleLineDrawing で描画モードを ON/OFF できる |
| useConnectionLines | 2選手をクリックするとラインが追加される |
| useConnectionLines | 同じ選手を2回クリックしてもラインは追加されない |
| useConnectionLines | ライン色を変更して新しいラインに反映される |
| useConnectionLines | handleConnectionLineRemove でラインを削除できる |
| useConnectionLines | clearConnectionLines で全ラインがクリアされる |
| useConnectionLines | resetLineDrawingState で描画状態のみリセットされる |
| useConnectionLines | ラインIDは順番にインクリメントされる |

## useFormationManagement.test.ts

| describe | テストケース |
| --- | --- |
| useFormationManagement | 初期状態: currentFormationId が null |
| useFormationManagement | gameModeFormations: football のフォーメーションのみフィルタリングする |
| useFormationManagement | gameModeFormations: formations が undefined の場合は空配列 |
| useFormationManagement | changeFormation: フォーメーション ID を変更しリセットする |
| useFormationManagement | changeFormation: isExecuting の場合は何も起きない |
| useFormationManagement | changeFormation: 存在しないフォーメーション ID は無視する |

## useOpponents.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useOpponents |  | 初期状態: opponents が空配列, opponentPlacementMode が false |
| useOpponents |  | toggleOpponentPlacement: 配置モードをトグルする |
| useOpponents |  | toggleOpponentPlacement: OFF にすると関連状態がリセットされる |
| useOpponents |  | handleOpponentDrag: 対戦相手の位置を更新する |
| useOpponents |  | handleOpponentDrag: 存在しない id の場合は他の要素に影響しない |
| useOpponents |  | handleOpponentRemove: 対戦相手を削除する |
| useOpponents |  | clearOpponents: 全対戦相手をクリアする |
| useOpponents |  | handleFieldClick: 配置モードでない場合は何も起きない |
| useOpponents |  | handleFieldClick: isDraggingObject が true の場合は何も起きない |
| useOpponents |  | handleFieldClick: maxOpponents に達した場合は追加しない |
| useOpponents |  | opponentTeam: opponentTeamId に一致するチームを返す |
| useOpponents |  | opponentTeam: teams が undefined の場合は undefined |
| useOpponents |  | opponentTeam: 一致しない teamId の場合は undefined |
| useOpponents |  | handleFieldClick: opponentTeam がありプレイヤー未選択の場合、トーストを表示 |
| useOpponents |  | handleFieldClick: opponentTeam + プレイヤー選択済みの場合、フィールドプレイヤーを配置 |
| useOpponents |  | handleFieldClick: GK プレイヤーの場合は GK カラーが使われる |
| useOpponents |  | handleFieldClick: 選択プレイヤーがチームに見つからない場合は追加しない |
| useOpponents | handleOpponentSquadComplete | opponentTeam が未設定の場合は何も起きない |
| useOpponents | handleOpponentSquadComplete | opponentFormationId が未設定の場合は何も起きない |
| useOpponents | handleOpponentSquadComplete | フォーメーションが gameModeFormations に見つからない場合は何も起きない |
| useOpponents | handleOpponentSquadComplete | プレイヤー配列から対戦相手を一括配置する |
| useOpponents | placeSquadDirectly | opponentTeam が未設定の場合は何も起きない |
| useOpponents | placeSquadDirectly | フォーメーションが見つからない場合は何も起きない |
| useOpponents | placeSquadDirectly | フォーメーションIDとプレイヤー配列から直接配置する |
| useOpponents | placeSquadDirectly | showOpponentNames: デフォルトは true で切り替え可能 |
| useOpponents | placeSquadDirectly | setOpponents: 外部から opponents 配列を直接設定できる |
