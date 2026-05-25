# Sketch Hooks テストケース一覧

## useSketchOverlay.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useSketchOverlay |  | 初期状態: sketchMode が false である |
| useSketchOverlay |  | 初期状態: activeTool が 'pen' である |
| useSketchOverlay |  | 初期状態: strokeColor が '#ef4444' である |
| useSketchOverlay |  | 初期状態: strokeWidth が 4 である |
| useSketchOverlay |  | toggleSketchMode でスケッチモードを切り替える |
| useSketchOverlay |  | setSketchMode で直接スケッチモードを設定する |
| useSketchOverlay |  | setActiveTool でツールを変更する |
| useSketchOverlay |  | setStrokeColor で色を変更する |
| useSketchOverlay |  | setStrokeWidth で幅を変更する |
| useSketchOverlay |  | レイヤー初期状態: 1つのレイヤーが存在する |
| useSketchOverlay |  | addLayer でレイヤーを追加する（最大3枚まで） |
| useSketchOverlay |  | addLayer で3枚を超えると追加されない |
| useSketchOverlay |  | addLayer で追加されたレイヤーがアクティブになる |
| useSketchOverlay |  | addLayer で欠番のIDが再利用される |
| useSketchOverlay |  | removeLayer でレイヤーを削除する |
| useSketchOverlay |  | removeLayer で最後の1枚は削除できない |
| useSketchOverlay |  | removeLayer でアクティブレイヤーを削除すると別のレイヤーに切り替わる |
| useSketchOverlay |  | removeLayer でアクティブでないレイヤーを削除してもアクティブレイヤーは変わらない |
| useSketchOverlay |  | renameLayer でレイヤー名を変更する |
| useSketchOverlay |  | renameLayer で空文字は無視する |
| useSketchOverlay |  | renameLayer で複数レイヤーがある場合、対象以外のレイヤー名は変わらない |
| useSketchOverlay |  | toggleLayerVisibility でレイヤーの表示/非表示を切り替える |
| useSketchOverlay |  | toggleLayerVisibility で複数レイヤーがある場合、対象以外のレイヤーの表示状態は変わらない |
| useSketchOverlay |  | reorderLayers でレイヤーの順序を変更する |
| useSketchOverlay |  | reorderLayers で同じ位置への移動は無視される |
| useSketchOverlay |  | reorderLayers で存在しないIDを指定すると無視される |
| useSketchOverlay |  | undoLastStroke でアクティブレイヤーの最後のストロークを取り消す |
| useSketchOverlay |  | undoLastStroke はアクティブレイヤー以外のストロークに影響しない |
| useSketchOverlay |  | clearLayer でアクティブレイヤーのストロークのみクリアする |
| useSketchOverlay |  | clearAllStrokes で全レイヤーのストロークをクリアする |
| useSketchOverlay |  | setActiveLayerId でアクティブレイヤーを直接変更する |
| useSketchOverlay | ポインターイベント（描画フロー） | sketchMode が false のときは handlePointerDown で描画が開始されない |
| useSketchOverlay | ポインターイベント（描画フロー） | canvasRef が null のときは handlePointerDown で描画が開始されない |
| useSketchOverlay | ポインターイベント（描画フロー） | pen ツールで描画すると全ポイントが蓄積される |
| useSketchOverlay | ポインターイベント（描画フロー） | line ツールでは始点と最新のポイントのみ保持される |
| useSketchOverlay | ポインターイベント（描画フロー） | arrow ツールでは始点と最新のポイントのみ保持される |
| useSketchOverlay | ポインターイベント（描画フロー） | ポイントが1つだけの極端に短いストロークは無視される |
| useSketchOverlay | ポインターイベント（描画フロー） | handlePointerMove で canvasRef が途中で null になっても安全 |
| useSketchOverlay | ポインターイベント（描画フロー） | handlePointerMove は描画中でないとき何もしない |
| useSketchOverlay | ポインターイベント（描画フロー） | handlePointerUp は描画中でないとき何もしない |
| useSketchOverlay | ポインターイベント（描画フロー） | 描画時に setPointerCapture が呼ばれる |
| useSketchOverlay | ポインターイベント（描画フロー） | 描画時にカスタムの strokeColor と strokeWidth が使用される |
| useSketchOverlay | ポインターイベント（描画フロー） | 複数のストロークを連続で描画できる |
| useSketchOverlay | ポインターイベント（描画フロー） | ストロークはアクティブレイヤーに追加される |
| useSketchOverlay | redraw（Canvas描画） | redraw は canvasRef が null のとき何もしない |
| useSketchOverlay | redraw（Canvas描画） | redraw は getContext が null のとき何もしない |
| useSketchOverlay | redraw（Canvas描画） | redraw でレイヤー内のストロークが描画される |
| useSketchOverlay | redraw（Canvas描画） | redraw で非表示レイヤーのストロークはスキップされる |
| useSketchOverlay | redraw（Canvas描画） | redraw に layerData 引数を渡すとそのデータで描画される |
| useSketchOverlay | redraw（Canvas描画） | redraw で line ツールのストロークが描画される |
| useSketchOverlay | redraw（Canvas描画） | redraw で arrow ツールのストロークが矢印付きで描画される |
| useSketchOverlay | redraw（Canvas描画） | redraw で空のポイント配列のストロークはスキップされる |
| useSketchOverlay | redraw（Canvas描画） | redraw で line ツールのポイントが1つだけの場合はスキップされる |
| useSketchOverlay | redraw（Canvas描画） | redraw で arrow ツールのポイントが1つだけの場合はスキップされる |
| useSketchOverlay | 永続化（デバウンス保存） | レイヤー操作後にデバウンスで saveSketch が呼ばれる |
| useSketchOverlay | 永続化（デバウンス保存） | デバウンス中に操作を繰り返すとタイマーがリセットされる |
| useSketchOverlay | 永続化（デバウンス保存） | saveSketch に正しいレコード形式で保存される |
| useSketchOverlay | 永続化（デバウンス保存） | ストローク描画完了後にデバウンス保存がスケジュールされる |
| useSketchOverlay | 永続化（デバウンス保存） | 各レイヤー操作で saveSketch が呼ばれる（toggleLayerVisibility） |
| useSketchOverlay | 永続化（デバウンス保存） | 各レイヤー操作で saveSketch が呼ばれる（undoLastStroke） |
| useSketchOverlay | 永続化（デバウンス保存） | 各レイヤー操作で saveSketch が呼ばれる（clearLayer） |
| useSketchOverlay | 永続化（デバウンス保存） | 各レイヤー操作で saveSketch が呼ばれる（clearAllStrokes） |
| useSketchOverlay | 永続化（デバウンス保存） | 各レイヤー操作で saveSketch が呼ばれる（removeLayer） |
| useSketchOverlay | 永続化（デバウンス保存） | 各レイヤー操作で saveSketch が呼ばれる（reorderLayers） |
| useSketchOverlay | マウント時のロード | 保存済みデータがある場合、マウント時にレイヤーが復元される |
| useSketchOverlay | マウント時のロード | 保存済みデータが null の場合、デフォルトレイヤーが使用される |
| useSketchOverlay | マウント時のロード | 保存済みデータの layers が空配列の場合、デフォルトレイヤーが使用される |
| useSketchOverlay | マウント時のロード | 復元時に nextStrokeId がレコード内の最大IDに基づいて設定される |
| useSketchOverlay | マウント時のロード | canvasRef が返される |
