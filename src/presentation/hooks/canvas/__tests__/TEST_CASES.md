# Canvas Hooks テストケース一覧

## useBridgeCallbacks.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useBridgeCallbacks | handlePlayerClick | ラインドローイングモード時は handlePlayerClickForLine を呼ぶ |
| useBridgeCallbacks | handlePlayerClick | プレイヤービューモード時は handlePlayerClickForView を呼ぶ |
| useBridgeCallbacks | handlePlayerClick | 通常モードでは selectSingle を呼ぶ |
| useBridgeCallbacks | handlePlayerClick | Cmd/Ctrl + クリックでは toggleItem を呼ぶ |
| useBridgeCallbacks | handleOpponentClick | プレイヤービューモード時は handleOpponentViewClick を呼ぶ |
| useBridgeCallbacks | handleOpponentClick | 通常モードでは selectSingle を呼ぶ |
| useBridgeCallbacks | handleSaveManager | チームの監督名を更新し編集モードを終了する |

## useCanvasCallbacks.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useCanvasCallbacks |  | 依存が変わってもコールバック参照が安定している |
| useCanvasCallbacks | handleFieldClick | opponentsHook.handleFieldClick に委譲する |
| useCanvasCallbacks | handleBallPlace | 通常モードでは ballHook.handleBallPlace に委譲する |
| useCanvasCallbacks | handleBallPlace | ballPassCreationMode で開始位置未設定の場合、setBallPassStartPos を呼ぶ |
| useCanvasCallbacks | handleBallPlace | ballPassCreationMode で開始位置がある場合、addBallPassByCoords を呼んでリセットする |
| useCanvasCallbacks | handleBallPlace | isCreationBallPositionStep の場合、setBallPosition を呼ぶ |
| useCanvasCallbacks | handleBallPlace | isCreationBallTrajectoryStep の場合、setBallTrajectory を呼ぶ |
| useCanvasCallbacks | handleBallDrag | 通常モードでは ballHook.handleBallDrag に委譲する |
| useCanvasCallbacks | handleBallDrag | isCreationBallPositionStep の場合、setBallPosition を呼ぶ |
| useCanvasCallbacks | handleBallRemove | 通常モードでは ballHook.handleBallRemove に委譲する |
| useCanvasCallbacks | handleBallRemove | isCreationBallPositionStep の場合、setBallPosition(null) を呼ぶ |
| useCanvasCallbacks | handleDragStart | setIsDraggingObject(true) を呼ぶ |
| useCanvasCallbacks | handleDragEnd | setIsDraggingObject(false) を呼び、rAF 後に pushCurrentSnapshot を呼ぶ |
| useCanvasCallbacks | handlePlayerDragEnd | setIsDraggingObject(false) + tOrch.handlePlayerDragEnd を呼ぶ |
| useCanvasCallbacks | handleGroupDragEnd | プレイヤーの位置を一括コミットする |
| useCanvasCallbacks | handleGroupDragEnd | 相手マーカーの位置を一括コミットする |
| useCanvasCallbacks | handleGroupDragEnd | プレイヤーも相手もない場合、位置コミットは呼ばれない |
| useCanvasCallbacks | handleLinePointerMove | lineDrawingMode 時に setPendingLineEndPos を呼ぶ |
| useCanvasCallbacks | handleLinePointerMove | ballPassCreationMode + ballPassStartPos 時に setBallPassPendingEndPos を呼ぶ |
| useCanvasCallbacks | handleLinePointerMove | どちらのモードでもない場合、何も呼ばれない |
| useCanvasCallbacks | handleCameraActionDone | setCameraAction(null) を呼ぶ |

## useCanvasMemoization.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useCanvasMemoization | canvasPlayerCards | showCards=true && captureMode=false の場合、playerCards を返す |
| useCanvasMemoization | canvasPlayerCards | captureMode=true の場合、空オブジェクトを返す |
| useCanvasMemoization | canvasPlayerCards | showCards=false の場合、空オブジェクトを返す |
| useCanvasMemoization | canvasSelectedPlayerIndex | lineFromPlayerIndex が null でない場合はそれを返す |
| useCanvasMemoization | canvasSelectedPlayerIndex | lineFromPlayerIndex が null の場合は selectedPlayerIndex を返す |
| useCanvasMemoization | canvasSelectedPlayerIndex | 両方 null の場合は null を返す |
| useCanvasMemoization | canvasIsPlayerView | playerViewEnabled=true && selectedPlayerIndex あり の場合 true を返す |
| useCanvasMemoization | canvasIsPlayerView | playerViewEnabled=true && selectedOpponentViewId あり の場合 true を返す |
| useCanvasMemoization | canvasIsPlayerView | playerViewEnabled=false の場合 false を返す |
| useCanvasMemoization | canvasIsPlayerView | playerViewEnabled=true でも選択なしの場合 false を返す |
| useCanvasMemoization | canvasPlayerDraggable | 全モード OFF の場合 true を返す |
| useCanvasMemoization | canvasPlayerDraggable | isExecuting=true の場合 false を返す |
| useCanvasMemoization | canvasPlayerDraggable | opponentPlacementMode=true の場合 false を返す |
| useCanvasMemoization | canvasPlayerDraggable | ballPlacementMode=true の場合 false を返す |
| useCanvasMemoization | canvasPlayerDraggable | lineDrawingMode=true の場合 false を返す |
| useCanvasMemoization | canvasPlayerDraggable | playerViewEnabled=true の場合 false を返す |
| useCanvasMemoization | canvasPlayerDraggable | creation.wizardStep='editing' の場合 true を返す |
| useCanvasMemoization | canvasPlayerDraggable | creation.wizardStep='setPosition' の場合 true を返す |
| useCanvasMemoization | canvasPlayerDraggable | creation あり && ballPassCreationMode=true の場合 false を返す |
| useCanvasMemoization | canvasPlayerDraggable | creation.wizardStep が 'editing' でも 'setPosition' でもない場合 false を返す |
| useCanvasMemoization | canvasLineTrackingActive | lineDrawingMode=true && lineFromPlayerIndex あり の場合 true を返す |
| useCanvasMemoization | canvasLineTrackingActive | ballPassCreationMode=true && ballPassStartPos あり の場合 true を返す |
| useCanvasMemoization | canvasLineTrackingActive | lineDrawingMode=true でも lineFromPlayerIndex が null の場合 false を返す |
| useCanvasMemoization | canvasLineTrackingActive | 全て OFF の場合 false を返す |
| useCanvasMemoization | canvasPendingConnectionLine | lineFromPlayerIndex と pendingLineEndPos がある場合、オブジェクトを返す |
| useCanvasMemoization | canvasPendingConnectionLine | lineFromPlayerIndex が null の場合、null を返す |
| useCanvasMemoization | canvasPendingConnectionLine | pendingLineEndPos が null の場合、null を返す |
