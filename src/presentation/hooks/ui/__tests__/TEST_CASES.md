# UI Hooks テストケース一覧

## useClickOutside.test.ts

| describe | テストケース |
| --- | --- |
| useClickOutside | ref 要素の外側クリックでコールバックが呼ばれる |
| useClickOutside | ref 要素の内側クリックではコールバックが呼ばれない |
| useClickOutside | ref.current が null のときコールバックが呼ばれない |
| useClickOutside | アンマウント後にイベントリスナーが解除される |

## useDraggable.test.ts

| describe | テストケース |
| --- | --- |
| useDraggable | 初期状態: offset が { x: 0, y: 0 }, isDragging が false |
| useDraggable | resetOffset: offset を初期値にリセットする |
| useDraggable | handlePointerDown を呼ぶと isDragging=true になる |
| useDraggable | ドラッグ中に pointermove で offset が更新される |
| useDraggable | pointerup でドラッグが終了する |
| useDraggable | アンマウント時にドラッグ中のリスナーが除去される |
| useDraggable | pointerup 後の pointermove では offset が変わらない |

## useMultiSelect.test.ts

| describe | テストケース |
| --- | --- |
| useMultiSelect | 初期状態: selectedItems が空配列 |
| useMultiSelect | toggleItem: プレイヤーを追加できる |
| useMultiSelect | toggleItem: 同じプレイヤーを再度トグルすると解除される |
| useMultiSelect | selectSingle: 単一選択に切り替わる |
| useMultiSelect | clearSelection: 選択がクリアされる |
| useMultiSelect | selectedPlayerIndices: プレイヤーのインデックスのみの Set |
| useMultiSelect | selectedOpponentIds: 対戦相手の ID のみの Set |
| useMultiSelect | hasSelection: 2つ以上選択時に true |
| useMultiSelect | Escape キーで選択がクリアされる |
| useMultiSelect | startRectSelect: 矩形選択を開始する |
| useMultiSelect | updateRectSelect: 矩形選択中でない場合は rectEnd を更新しない |

## usePlayModePhase.test.ts

| describe | テストケース |
| --- | --- |
| usePlayModePhase | 初期状態: selectedPhase='attack', gameMode='football', playMode='field' |
| usePlayModePhase | activePhaseForTactics: field モードでは selectedPhase を返す |
| usePlayModePhase | handlePlayModeChange: setPlay に切り替わる |
| usePlayModePhase | handlePlayModeChange: 同じモードの場合は何も起きない |
| usePlayModePhase | handleToggleBallWin: ball_win をトグル & positive_transition に変更 |
| usePlayModePhase | handleToggleBallLost: ball_lost をトグル & negative_transition に変更 |
| usePlayModePhase | handleResetState: リセットする |
| usePlayModePhase | handleGameModeChange: ゲームモードを変更し opponents と formationId をリセット |

## usePlayerView.test.ts

| describe | テストケース |
| --- | --- |
| usePlayerView | 初期状態: playerViewEnabled=false、選択なし |
| usePlayerView | togglePlayerView で ON にできる |
| usePlayerView | togglePlayerView で OFF にできる |
| usePlayerView | ON 時に onResetDragging が呼ばれる |
| usePlayerView | playerViewEnabled=true のとき選手クリックで選択される |
| usePlayerView | playerViewEnabled=false のとき選手クリックは無視される |
| usePlayerView | 相手クリックで opponent が選択され、player がクリアされる |
| usePlayerView | playerViewEnabled=false のとき相手クリックは無視される |
| usePlayerView | exitPlayerView で全状態がリセットされる |

## useUIVisibility.test.ts

| describe | テストケース |
| --- | --- |
| useUIVisibility | 初期状態: 各フラグのデフォルト値が正しい |
| useUIVisibility | setShowPlayerManagement でモーダルを開閉できる |
| useUIVisibility | toggleSidebar でサイドバーを開閉できる |
| useUIVisibility | toggleSidebar で sidebarAnimating が true になる |
| useUIVisibility | playerMarkerScale のデフォルトが 1 である |

## useBackgroundSettings.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useBackgroundSettings |  | デフォルト設定を返す |
| useBackgroundSettings |  | setSceneBgColor でシーン背景色を更新できる |
| useBackgroundSettings |  | setPitchColor でピッチ色を更新できる |
| useBackgroundSettings |  | setPitchOpacity でピッチ透明度を更新できる |
| useBackgroundSettings |  | setShowSceneBgSettings で設定パネルの表示を切り替えられる |
| useBackgroundSettings |  | handleSaveBgImage で画像を追加＆選択できる |
| useBackgroundSettings |  | handleSaveBgImage は最大スロット数を超えた場合追加しない |
| useBackgroundSettings |  | handleSelectBgImage でインデックスを選択＆解除できる |
| useBackgroundSettings |  | handleRemoveBgImage で画像を削除＆インデックスを調整する |
| useBackgroundSettings |  | handleRemoveBgImage で選択中の画像を削除すると selectedIndex が -1 になる |
| useBackgroundSettings |  | handleResetAllBgSettings で全設定をデフォルトにリセットできる |
| useBackgroundSettings |  | handleRemoveBgImage で選択画像より後の画像を削除しても selectedIndex は変わらない |
| useBackgroundSettings |  | sceneBgImageUrl: selectedIndex が範囲外の場合は null を返す |
| useBackgroundSettings | handleSceneBgImageUpload | ファイルが選択されていない場合は何も起きない |
| useBackgroundSettings | handleSceneBgImageUpload | ファイルが空リストの場合は何も起きない |
| useBackgroundSettings | handleSceneBgImageUpload | 画像ファイルでない場合は warn ログを出して終了する |
| useBackgroundSettings | handleSceneBgImageUpload | ファイルサイズが大きすぎる場合は warn ログを出して終了する |
| useBackgroundSettings | handleSceneBgImageUpload | 正常な画像ファイルを処理してリサイズなしで保存する |
| useBackgroundSettings | handleSceneBgImageUpload | 大きい画像はリサイズされる |
| useBackgroundSettings | handleSceneBgImageUpload | FileReader.onerror で handleError が呼ばれる |
| useBackgroundSettings | handleSceneBgImageUpload | Image.onerror で handleError が呼ばれる |
| useBackgroundSettings | handleSceneBgImageUpload | canvas.getContext が null を返した場合は handleError が呼ばれる |
| useBackgroundSettings | handleSceneBgImageUpload | img.onload 内で例外が発生した場合は handleError が呼ばれる |
| useBackgroundSettings | 永続化 | 設定変更時に preferencesService.set が呼ばれる |
| useBackgroundSettings | 永続化 | pitchColor 変更時に preferencesService.set が呼ばれる |
| useBackgroundSettings | 永続化 | pitchOpacity 変更時に preferencesService.set が呼ばれる |
| useBackgroundSettings | 永続化 | savedImages 変更時に preferencesService.set が呼ばれる |
| useBackgroundSettings | 永続化 | selectedIndex 変更時に preferencesService.set が呼ばれる |
