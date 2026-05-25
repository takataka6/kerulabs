# Tactic Hooks テストケース一覧

## useTacticCreation.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| phaseKeyToPhaseType |  | "attack" を "attack" に変換する |
| phaseKeyToPhaseType |  | "transition" を "positive_transition" に変換する |
| phaseKeyToPhaseType |  | "positive_transition" を "positive_transition" に変換する |
| phaseKeyToPhaseType |  | "pressing" を "defense" に変換する |
| phaseKeyToPhaseType |  | "defense" を "defense" に変換する |
| phaseKeyToPhaseType |  | "counter" を "negative_transition" に変換する |
| phaseKeyToPhaseType |  | "negative_transition" を "negative_transition" に変換する |
| phaseKeyToPhaseType |  | "set_piece" を "set_piece" に変換する |
| phaseKeyToPhaseType |  | "throw_in" を "throw_in" に変換する |
| phaseKeyToPhaseType |  | "goal_kick" を "goal_kick" に変換する |
| phaseKeyToPhaseType |  | 未知のキーは "attack" にフォールバックする |
| useTacticCreation |  | 初期状態: creation が null である |
| useTacticCreation |  | startCreation: 正しい初期状態を作成する |
| useTacticCreation |  | cancelCreation: creation を null に戻す |
| useTacticCreation |  | setPlayerTarget: 現在のステップにムーブメントを追加する |
| useTacticCreation |  | setPlayerTarget: デフォルトカラーは #ef4444 である |
| useTacticCreation |  | setPlayerTarget: 同じロールを再設定すると上書きされる |
| useTacticCreation |  | removePlayerTarget: ムーブメントを削除する |
| useTacticCreation |  | addBallPass: 現在のステップにボールパスを追加する |
| useTacticCreation |  | addBallPass: デフォルトカラーは #facc15 である |
| useTacticCreation |  | addBallPass: trajectoryType を省略すると含まれない |
| useTacticCreation |  | addBallPassByCoords: 座標でボールパスを追加する |
| useTacticCreation |  | addBallPassByCoords: デフォルトカラーは #facc15 である |
| useTacticCreation |  | addBallPassByCoords: trajectoryType を省略すると含まれない |
| useTacticCreation |  | removeBallPass: インデックスのボールパスを削除する |
| useTacticCreation |  | addStep: 新しいステップを追加して切り替える |
| useTacticCreation |  | switchToStep: 有効なインデックスに切り替える |
| useTacticCreation |  | switchToStep: 範囲外のインデックスはクランプされる |
| useTacticCreation |  | addStep: ステップ追加後に元のステップにムーブメントが保持される |
| useTacticCreation |  | setNameJa: 日本語名を変更する |
| useTacticCreation |  | setNameEn: 英語名を変更する |
| useTacticCreation |  | setIcon: アイコンを変更する |
| useTacticCreation |  | setGamePhase: フェーズを変更する |
| useTacticCreation |  | setWizardStep: ウィザードステップを変更する |
| useTacticCreation |  | setBallPosition: ボール位置を設定する |
| useTacticCreation |  | setBallPosition: null を設定してボール位置をクリアする |
| useTacticCreation |  | setBallTrajectory: ボール軌道を設定する |
| useTacticCreation |  | setTrajectoryType: 既存の軌道のタイプを更新する |
| useTacticCreation |  | setTrajectoryType: ballTrajectory が null の場合は何もしない |
| useTacticCreation |  | setSetPosition: セットプレー開始位置を設定する |
| useTacticCreation |  | setSetPosition: 複数のロールに設定できる |
| useTacticCreation |  | resetSetPositions: セットプレー位置をクリアする |
| useTacticCreation |  | resetCurrentStep: 現在のステップのムーブメントとボールパスをクリアする |
| useTacticCreation |  | resetCurrentStep: 他のステップに影響しない |
| useTacticCreation |  | setTimelineOpen: タイムラインの開閉を切り替える |
| useTacticCreation |  | setMovementDelay: 個別のムーブメント遅延を設定する |
| useTacticCreation |  | setMovementDelay: 存在しないステップインデックスの場合は何も変わらない |
| useTacticCreation |  | setMovementDelay: 同じステップの同じロールに再設定すると上書きする |
| useTacticCreation |  | setMovementDelay: 同じステップの異なるロールに設定できる |
| useTacticCreation |  | setStepDuration: ステップの duration を変更する |
| useTacticCreation |  | setStepDuration: 存在しないステップインデックスでも他のステップに影響しない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setPlayerTarget は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | removePlayerTarget は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | addBallPass は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | addBallPassByCoords は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | removeBallPass は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | addStep は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | switchToStep は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setNameJa は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setNameEn は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setIcon は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setGamePhase は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setWizardStep は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setBallPosition は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setBallTrajectory は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setTrajectoryType は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setSetPosition は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | resetSetPositions は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | resetCurrentStep は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setTimelineOpen は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setMovementDelay は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | setStepDuration は何もしない |
| useTacticCreation | creation が null の場合、各セッター関数は何も変更しない | updateBallPassTrajectoryType は何もしない |
| useTacticCreation | updateBallPassTrajectoryType | 指定インデックスのボールパスの trajectoryType を更新する |
| useTacticCreation | updateBallPassTrajectoryType | 他のプロパティ（色・ロール）は変更されない |
| useTacticCreation | updateBallPassTrajectoryType | 存在しないインデックスの場合は何も変更しない |
| useTacticCreation | buildTactic | creation が null の場合にエラーをスローする |
| useTacticCreation | buildTactic | 基本的な Tactic を構築する（ボールなし・セットポジションなし） |
| useTacticCreation | buildTactic | ボール位置と軌道がある場合にハイライトオフセットを含む |
| useTacticCreation | buildTactic | セットポジションがある場合にセットポジションムーブメントを生成する |
| useTacticCreation | buildTactic | ボール + セットポジションの両方がある場合の遅延計算 |
| useTacticCreation | buildTactic | 複数ステップでの遅延累積を正しく計算する |
| useTacticCreation | buildTactic | 個別ムーブメント遅延を baseDelay に加算する |
| useTacticCreation | buildTactic | ステップ内のボールパスが buildTactic に含まれる |
| useTacticCreation | buildTactic | 名前が空の場合はデフォルト名を使用する |
| useTacticCreation | buildTactic | フェーズマッピングが正しく適用される |
| useTacticCreation | buildTactic | ballPosition なしの場合は Tactic.ballPosition が undefined |
| useTacticCreation | buildTactic | 複数ステップで duration が異なる場合の遅延累積 |
| useTacticCreation | getPreviewArrows | creation が null の場合は空配列を返す |
| useTacticCreation | getPreviewArrows | ステップ0でフォーメーション位置から矢印を生成する |
| useTacticCreation | getPreviewArrows | ステップ0でセットポジションが設定されている場合はそれを開始位置として使用する |
| useTacticCreation | getPreviewArrows | ステップ1以降で前のステップのムーブメントを開始位置として使用する |
| useTacticCreation | getPreviewArrows | ステップ1以降で前のステップにムーブメントがない場合はフォーメーション位置を使用する |
| useTacticCreation | getPreviewArrows | ステップ2で2つ前のステップからムーブメントを検索する |
| useTacticCreation | getPreviewArrows | roleMap に存在しないロールの場合は矢印を生成しない |
| useTacticCreation | getPreviewArrows | 複数のムーブメントがある場合にすべての矢印を生成する |
| useTacticCreation | getPreviewBallPasses | creation が null の場合は空配列を返す |
| useTacticCreation | getPreviewBallPasses | ロールベースのボールパスでフォーメーション位置を使用する |
| useTacticCreation | getPreviewBallPasses | 座標ベースのボールパスで直接座標を使用する |
| useTacticCreation | getPreviewBallPasses | ロールベースのパスでセットポジションが設定されている場合はそれを使用する |
| useTacticCreation | getPreviewBallPasses | startRole が roleMap に存在しない場合はスキップする |
| useTacticCreation | getPreviewBallPasses | endRole が roleMap に存在しない場合はスキップする |
| useTacticCreation | getPreviewBallPasses | startRole も endRole も空で座標もない場合はスキップする |
| useTacticCreation | getPreviewBallPasses | trajectoryType がない場合は結果に含まれない |
| useTacticCreation | getPreviewBallPasses | endRole が空で endX/endZ もない場合はスキップする |
| useTacticCreation | getStepStartPositions | creation が null の場合は空オブジェクトを返す |
| useTacticCreation | getStepStartPositions | ステップ0でフォーメーション位置を返す |
| useTacticCreation | getStepStartPositions | セットポジションがある場合はフォーメーション位置を上書きする |
| useTacticCreation | getStepStartPositions | ステップ1で前のステップのムーブメントを反映する |
| useTacticCreation | getStepStartPositions | ステップ2で複数の前ステップのムーブメントを累積する |
| useTacticCreation | getStepStartPositions | セットポジション + 前ステップムーブメントの両方がある場合 |
| useTacticCreation | getStepStartPositions | roleMap に存在しないロールのセットポジションは無視される |

## useTacticExecution.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useTacticExecution | 初期状態 | isExecuting が false |
| useTacticExecution | 初期状態 | activeTacticId が null |
| useTacticExecution | 初期状態 | executionPhase が null |
| useTacticExecution | 初期状態 | executingBallPosition が null |
| useTacticExecution | 初期状態 | playerPositions が空オブジェクト |
| useTacticExecution | 初期状態 | arrows が空配列 |
| useTacticExecution | 初期状態 | ballTrajectories が空配列 |
| useTacticExecution | formation 同期 | formation が渡されたとき playerPositions を初期化する |
| useTacticExecution | formation 同期 | formation が undefined のとき playerPositions は変わらない |
| useTacticExecution | formation 同期 | formation が変更されたら playerPositions を更新する |
| useTacticExecution | execute | TacticExecutor.execute を呼ぶ |
| useTacticExecution | execute | ballPosition がある場合 executingBallPosition にセットする |
| useTacticExecution | execute | ballPosition がない場合 executingBallPosition は null |
| useTacticExecution | cancel | TacticExecutor.cancel を呼ぶ |
| useTacticExecution | reset | TacticExecutor.cancel を呼び全状態をリセットする |
| useTacticExecution | TACTIC_STARTED イベント | isExecuting を true にし activeTacticId をセットする |
| useTacticExecution | TACTIC_STARTED イベント | arrows と ballTrajectories をクリアする |
| useTacticExecution | PLAYER_MOVEMENT_STARTED イベント | 指定インデックスの playerPositions を更新する |
| useTacticExecution | PLAYER_MOVEMENT_STARTED イベント | 複数の移動イベントを累積的に反映する |
| useTacticExecution | ARROW_DISPLAYED イベント | arrows に矢印を追加する |
| useTacticExecution | ARROW_DISPLAYED イベント | 複数の矢印イベントを累積的に追加する |
| useTacticExecution | BALL_PASS_DISPLAYED イベント | ballTrajectories にボール軌道を追加する |
| useTacticExecution | BALL_PASS_DISPLAYED イベント | trajectoryType が省略されたとき undefined になる |
| useTacticExecution | BALL_PASS_DISPLAYED イベント | 複数のボールパスを累積的に追加する |
| useTacticExecution | EXECUTION_PHASE_CHANGED イベント | executionPhase を更新する |
| useTacticExecution | TACTIC_COMPLETED イベント | isExecuting を false にし executionPhase と executingBallPosition をクリアする |
| useTacticExecution | TACTIC_COMPLETED イベント | activeTacticId は保持される（戦術フローボタン参照用） |
| useTacticExecution | TACTIC_CANCELLED イベント | 全状態をクリアする（activeTacticId 含む） |
| useTacticExecution | 統合: 戦術実行ライフサイクル | 開始 → 移動 → 矢印 → ボールパス → 完了 の一連のフロー |
| useTacticExecution | 統合: 戦術実行ライフサイクル | 実行中にキャンセルすると全状態がクリアされる |
| useTacticExecution | 統合: 戦術実行ライフサイクル | reset 後に playerPositions が formation の初期位置に戻る |
| useTacticExecution | クリーンアップ | アンマウント後にイベントが発行されてもエラーにならない |
| useTacticExecution | COMPLETED と CANCELLED の挙動の違い | COMPLETED: activeTacticId を保持する |
| useTacticExecution | COMPLETED と CANCELLED の挙動の違い | CANCELLED: activeTacticId を null にする |
| useTacticExecution | 連続実行 | 新しい TACTIC_STARTED で前回の arrows と ballTrajectories がクリアされる |
| useTacticExecution | ステップ実行 | startStepExecution でステップ実行モードを開始し executeStep を呼ぶ |
| useTacticExecution | ステップ実行 | supportsStepExecution が false のとき startStepExecution は何もしない |
| useTacticExecution | ステップ実行 | STEP_EXECUTION_STARTED イベントで stepExecution を更新する |
| useTacticExecution | ステップ実行 | STEP_COMPLETED イベントで isStepRunning が false になる |
| useTacticExecution | ステップ実行 | 最終ステップの STEP_COMPLETED では isExecuting を false に変更しない（TACTIC_COMPLETED に委譲） |
| useTacticExecution | ステップ実行 | TACTIC_COMPLETED でステップ実行モードは保持され、ユーザーが終了するまで維持する |
| useTacticExecution | ステップ実行 | exitStepMode でステップ実行モードを終了しリセットする |
| useTacticExecution | ステップ実行 | executeNextStep で次のステップを実行する |
| useTacticExecution | ステップ実行 | executeNextStep はステップ実行モードでないとき何もしない |
| useTacticExecution | ステップ実行 | TACTIC_CANCELLED でステップ実行状態がリセットされる |
| useTacticExecution | destroy | アンマウント時に destroy が呼ばれる |

## useFlowchartGenerator.test.ts

| describe | テストケース |
| --- | --- |
| useFlowchartGenerator | activeTactic が undefined の場合、空文字を返す |
| useFlowchartGenerator | currentFormation が undefined の場合、空文字を返す |
| useFlowchartGenerator | movements も ballPasses も空の場合、空文字を返す |
| useFlowchartGenerator | 単一フェーズの movement ノードを生成する |
| useFlowchartGenerator | 遅延なし（delay=0）の場合、即時ラベルを表示する |
| useFlowchartGenerator | delay > 0 の場合、秒数ラベルを表示する |
| useFlowchartGenerator | 複数の delay でフェーズ分割し、接続する |
| useFlowchartGenerator | ボールパスノードを「⚽ start → end」形式で生成する |
| useFlowchartGenerator | 既知の arrowColor にスタイルを適用する |
| useFlowchartGenerator | 未知の arrowColor の場合、スタイル行を出力しない |
| useFlowchartGenerator | カスタム戦術では getDisplayName を使用する |
| useFlowchartGenerator | デフォルト戦術では tDynamic を使用する |
| useFlowchartGenerator | Mermaid 特殊文字をエスケープする |
| useFlowchartGenerator | 同一 delay の movement と ballPass を同じ subgraph に配置する |

## useTacticShareHandlers.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useTacticShareHandlers | hasCustomTactics | カスタム戦術がある場合 true |
| useTacticShareHandlers | hasCustomTactics | カスタム戦術がない場合 false |
| useTacticShareHandlers | hasCustomTactics | 空配列の場合 false |
| useTacticShareHandlers | handleExportTactics | カスタム戦術をJSON形式でダウンロードする |
| useTacticShareHandlers | handleExportTactics | カスタム戦術が0件の場合はダウンロードしない |
| useTacticShareHandlers | handleImportTactics | ファイルピッカーからインポートしてsaveTacticMutationを呼ぶ |
| useTacticShareHandlers | handleImportTactics | 空のインポートの場合エラートーストを表示 |

## useTacticsOrchestration.crud.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useTacticsOrchestration — CRUD操作 | 初期状態 | manualPlayerPositions が空オブジェクト |
| useTacticsOrchestration — CRUD操作 | 初期状態 | ballPassCreationMode が false |
| useTacticsOrchestration — CRUD操作 | 初期状態 | ballPassStartPos / ballPassPendingEndPos が null |
| useTacticsOrchestration — CRUD操作 | 初期状態 | ballPassTrajectoryType のデフォルトが 'low' |
| useTacticsOrchestration — CRUD操作 | 初期状態 | isExecuting が false |
| useTacticsOrchestration — CRUD操作 | 初期状態 | activeTacticId が null |
| useTacticsOrchestration — CRUD操作 | 初期状態 | undoRedoEnabled: creation が null のとき true |
| useTacticsOrchestration — CRUD操作 | startTacticCreation | currentFormation が undefined のとき何もしない |
| useTacticsOrchestration — CRUD操作 | startTacticCreation | field モードで selectedPhase を渡して startCreation を呼ぶ |
| useTacticsOrchestration — CRUD操作 | startTacticCreation | setPlay モードで selectedSetPlayType を渡して startCreation を呼ぶ |
| useTacticsOrchestration — CRUD操作 | startTacticCreation | 開始時に各モードをリセットする |
| useTacticsOrchestration — CRUD操作 | cancelTacticCreation | creation が null のとき confirm を表示せず cancelCreation を呼ぶ |
| useTacticsOrchestration — CRUD操作 | cancelTacticCreation | creation がある場合 confirm で確認する |
| useTacticsOrchestration — CRUD操作 | cancelTacticCreation | confirm をキャンセルしたら cancelCreation を呼ばない |
| useTacticsOrchestration — CRUD操作 | handleSaveTactic | creation が null のとき何もしない |
| useTacticsOrchestration — CRUD操作 | handleSaveTactic | currentFormation が undefined のとき何もしない |
| useTacticsOrchestration — CRUD操作 | handleSaveTactic | movements も ballPasses もないとき error トーストを表示 |
| useTacticsOrchestration — CRUD操作 | handleSaveTactic | 成功時: buildTactic → mutateAsync → cancelCreation → success トースト |
| useTacticsOrchestration — CRUD操作 | handleSaveTactic | 保存失敗時: handleError を呼ぶ |
| useTacticsOrchestration — CRUD操作 | handlePreviewTactic | creation が null のとき何もしない |
| useTacticsOrchestration — CRUD操作 | handlePreviewTactic | currentFormation が undefined のとき何もしない |
| useTacticsOrchestration — CRUD操作 | handlePreviewTactic | コンテンツがない場合は何もしない |
| useTacticsOrchestration — CRUD操作 | handlePreviewTactic | コンテンツがある場合 buildTactic → executeTactic を呼ぶ |
| useTacticsOrchestration — CRUD操作 | handleExportTactics | カスタム戦術がない場合は何もしない |
| useTacticsOrchestration — CRUD操作 | handleExportTactics | カスタム戦術がある場合 export → downloadJson を呼ぶ |
| useTacticsOrchestration — CRUD操作 | handleExportTactics | デフォルト戦術はエクスポート対象外 |
| useTacticsOrchestration — CRUD操作 | handleImportTactics | 成功時: openFilePicker → import → mutateAsync → success トースト |
| useTacticsOrchestration — CRUD操作 | handleImportTactics | インポート結果が空の場合 error トーストを表示 |
| useTacticsOrchestration — CRUD操作 | handleImportTactics | 失敗時: handleError を呼ぶ |

## useTacticsOrchestration.derived.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useTacticsOrchestration — 派生状態 | 派生状態 | undoRedoEnabled: creation がある場合 false |
| useTacticsOrchestration — 派生状態 | 派生状態 | isCreationBallPositionStep: wizardStep が ballPosition のとき true |
| useTacticsOrchestration — 派生状態 | 派生状態 | isCreationBallTrajectoryStep: wizardStep が ballTrajectory のとき true |
| useTacticsOrchestration — 派生状態 | 派生状態 | effectiveBallPosition: creation 中は creation.ballPosition を返す |
| useTacticsOrchestration — 派生状態 | 派生状態 | effectiveBallPosition: creation が null のとき ballHook.ballPosition を返す |
| useTacticsOrchestration — 派生状態 | 派生状態 | effectiveBallPlacementMode: ballPassCreationMode が true のとき true |
| useTacticsOrchestration — 派生状態 | 派生状態 | activeTactic: activeTacticId に一致する戦術を返す |
| useTacticsOrchestration — 派生状態 | 派生状態 | activeTactic: 一致する戦術がないとき undefined |
| useTacticsOrchestration — 派生状態 | mergedPlayerPositions | execution の playerPositions を含む |
| useTacticsOrchestration — 派生状態 | mergedPlayerPositions | manualPlayerPositions が execution を上書きする |
| useTacticsOrchestration — 派生状態 | mergedPlayerPositions | creation 中 (executing でない) は getStepStartPositions をマージする |
| useTacticsOrchestration — 派生状態 | mergedArrows | execution arrows と creationArrows をマージする |
| useTacticsOrchestration — 派生状態 | mergedArrows | isExecuting のとき creationArrows は空 |
| useTacticsOrchestration — 派生状態 | mergedBallTrajectories | execution フェーズが highlight のとき execution trajectories を非表示 |
| useTacticsOrchestration — 派生状態 | mergedBallTrajectories | execution フェーズが set のとき execution trajectories を非表示 |
| useTacticsOrchestration — 派生状態 | mergedBallTrajectories | execution フェーズが run のとき execution trajectories を表示 |
| useTacticsOrchestration — 派生状態 | mergedBallTrajectories | creation の ballPosition + ballTrajectory がある場合マージされる |
| useTacticsOrchestration — 派生状態 | mergedBallTrajectories | pendingBallPassPreview: startPos と endPos が両方あるとき含まれる |
| useTacticsOrchestration — 派生状態 | ballHighlightPosition | executionPhase が highlight でないとき null |
| useTacticsOrchestration — 派生状態 | ballHighlightPosition | highlight フェーズで creation.ballPosition がある場合それを返す |
| useTacticsOrchestration — 派生状態 | ballHighlightPosition | highlight フェーズで executingBallPosition がある場合それを返す |
| useTacticsOrchestration — 派生状態 | ballHighlightPosition | highlight フェーズでどちらもないとき null |
| useTacticsOrchestration — 派生状態 | tacticsForCurrentFormation | tactics が undefined のとき空配列 |
| useTacticsOrchestration — 派生状態 | tacticsForCurrentFormation | currentFormation が undefined のとき空配列 |
| useTacticsOrchestration — 派生状態 | tacticsForCurrentFormation | フォーメーション名に一致する戦術のみフィルタする |
| useTacticsOrchestration — 派生状態 | tacticsForCurrentFormation | selectedTeam に whitelist がある場合それでさらにフィルタする |
| useTacticsOrchestration — 派生状態 | tacticsForCurrentFormation | selectedTeam の whitelist が undefined (制限なし) の場合全戦術を返す |
| useTacticsOrchestration — 派生状態 | hasCustomTactics | カスタム戦術がある場合 true |
| useTacticsOrchestration — 派生状態 | hasCustomTactics | カスタム戦術がない場合 false |
| useTacticsOrchestration — 派生状態 | hasCustomTactics | tactics が空配列の場合 false |
| useTacticsOrchestration — 派生状態 | clearManualPositions | manualPlayerPositions を空にリセットする |
| useTacticsOrchestration — 派生状態 | ballPass ステート setter | setBallPassCreationMode で ballPassCreationMode を切り替える |
| useTacticsOrchestration — 派生状態 | ballPass ステート setter | setBallPassTrajectoryType で trajectoryType を切り替える |

## useTacticsOrchestration.execution.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| useTacticsOrchestration — 実行制御・操作 | triggerTactic | isExecuting が true のとき何もしない |
| useTacticsOrchestration — 実行制御・操作 | triggerTactic | currentFormation が undefined のとき何もしない |
| useTacticsOrchestration — 実行制御・操作 | triggerTactic | 指定IDの戦術が見つからないとき何もしない |
| useTacticsOrchestration — 実行制御・操作 | triggerTactic | 正常時: executeTactic を呼ぶ |
| useTacticsOrchestration — 実行制御・操作 | handlePlayerDragEnd | manualPlayerPositions を更新し pushCurrentSnapshot を呼ぶ |
| useTacticsOrchestration — 実行制御・操作 | handlePlayerDragEnd | creation 中の setPosition ステップでは setSetPosition を呼ぶ |
| useTacticsOrchestration — 実行制御・操作 | handlePlayerDragEnd | creation 中の editing ステップでは setPlayerTarget を呼ぶ |
| useTacticsOrchestration — 実行制御・操作 | handleWizardStepChange | setWizardStep を呼び ballPass 関連をリセットする |
| useTacticsOrchestration — 実行制御・操作 | handleWizardStepChange | 前のステップが setPosition のとき manualPositions をリセット |
| useTacticsOrchestration — 実行制御・操作 | ステップ管理ハンドラー | handleSwitchStep: switchToStep + resetTactic + manualPositions クリア |
| useTacticsOrchestration — 実行制御・操作 | ステップ管理ハンドラー | handleAddStep: addStep + resetTactic + manualPositions クリア |
| useTacticsOrchestration — 実行制御・操作 | ステップ管理ハンドラー | handleResetStep: resetCurrentStep + manualPositions クリア |
| useTacticsOrchestration — 実行制御・操作 | ステップ管理ハンドラー | handleResetPreview: resetTactic + manualPositions クリア |
