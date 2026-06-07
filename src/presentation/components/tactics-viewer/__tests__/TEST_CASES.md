# Tactics Viewer テストケース一覧

## CameraControlsGrid.test.tsx

| describe | テストケース |
| --- | --- |
| CameraControlsGrid | 4 つのカメラボタンとロックボタンを描画する |
| CameraControlsGrid | カメラリセットボタンをクリックすると onCameraAction('reset') が呼ばれる |
| CameraControlsGrid | フィールドロックボタンをクリックすると onToggleFieldLock が呼ばれる |
| CameraControlsGrid | fieldLocked=true の場合ロック解除ラベルが表示される |
| CameraControlsGrid | playerView が有効でプレイヤーが選択されている場合、カメラボタンが disabled |
| CameraControlsGrid | 俯瞰ボタンをクリックすると onCameraAction('topDown') が呼ばれる |
| CameraControlsGrid | サイドビューボタンをクリックすると onCameraAction('sideView') が呼ばれる |
| CameraControlsGrid | サイドビューリバースボタンをクリックすると onCameraAction('sideViewReverse') が呼ばれる |
| CameraControlsGrid | playerView が有効で opponent が選択されている場合もカメラボタンが disabled |
| CameraControlsGrid | playerView が有効だがプレイヤー未選択の場合、カメラボタンは enabled |

## ConnectionLinesButton.test.tsx

| describe | テストケース |
| --- | --- |
| ConnectionLinesButton | 接続線ボタンを描画する |
| ConnectionLinesButton | ボタンをクリックすると toggleLineDrawing が呼ばれる |
| ConnectionLinesButton | 接続線がある場合にバッジとクリアボタンを表示する |
| ConnectionLinesButton | lineDrawingMode=true の場合にカラーパレットを表示する |
| ConnectionLinesButton | カラーボタンをクリックすると setLineColor が呼ばれる |

## FlowchartPanel.test.tsx

| describe | テストケース |
| --- | --- |
| FlowchartPanel | タイトルが表示される |
| FlowchartPanel | チャートコンテンツが MermaidFlowchart に渡される |
| FlowchartPanel | 閉じるボタンクリックで onClose が呼ばれる |
| FlowchartPanel | コンテンツ領域に region role と aria-label が設定される |
| FlowchartPanel | アイコンが表示される |

## Legend.test.tsx

| describe | テストケース |
| --- | --- |
| Legend | 自チームラベルが表示される |
| Legend | 自チームの色が適用される |
| Legend | 相手チームがない場合、相手ラベルは表示されない |
| Legend | 相手チームがある場合、相手ラベルが表示される |
| Legend | 相手チームの色が適用される |
| Legend | captureMode で hidden クラスが適用される |
| Legend | 通常モードで hidden クラスが適用されない |

## LoadingScreen.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| LoadingScreen | メッセージ表示 | 渡されたメッセージが画面に表示される |
| LoadingScreen | メッセージ表示 | 異なるメッセージを渡すと正しく反映される |
| LoadingScreen | レイアウト | フルスクリーンレイアウト（h-screen クラス）が適用される |
| LoadingScreen | レイアウト | w-full クラスで横幅が全幅に設定される |
| LoadingScreen | アニメーション | スピナー（animate-spin クラス）が存在する |
| LoadingScreen | アニメーション | ピングアニメーション（animate-ping クラス）が存在する |

## ManagerDisplay.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| ManagerDisplay | 表示条件 | captureMode の場合は非表示 |
| ManagerDisplay | 表示条件 | 通常モードで監督名が表示される |
| ManagerDisplay | 監督名表示 | 監督ラベルが表示される |
| ManagerDisplay | 監督名表示 | 監督名未設定の場合にプレースホルダーが表示される |
| ManagerDisplay | 監督名表示 | 編集ボタンクリックで onStartEditing が呼ばれる |
| ManagerDisplay | 編集モード | 編集中にテキスト入力が表示される |
| ManagerDisplay | 編集モード | 入力値変更で onManagerInputChange が呼ばれる |
| ManagerDisplay | 編集モード | Enter キーで onSaveManager が呼ばれる |
| ManagerDisplay | 編集モード | Escape キーで onCancelEditing が呼ばれる |
| ManagerDisplay | 編集モード | blur で onSaveManager が呼ばれる |
| ManagerDisplay | カード表示 | none 状態で '−' が表示される |
| ManagerDisplay | カード表示 | カードボタンクリックで onCycleManagerCard が呼ばれる |
| ManagerDisplay | カード表示 | カードボタンに適切な aria-label が設定される |
| ManagerDisplay | 折りたたみ | 展開/折りたたみボタンが表示される |
| ManagerDisplay | 折りたたみ | 折りたたみボタンクリックでコンテンツが非表示になる |
| ManagerDisplay | 折りたたみ | 再クリックでコンテンツが再表示される |

## PhaseDiamond.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| PhaseDiamond | レンダリング | 4つのフェーズボタンが表示される |
| PhaseDiamond | レンダリング | 各フェーズのアイコンが表示される |
| PhaseDiamond | レンダリング | 翻訳関数が各フェーズのラベルで呼ばれる |
| PhaseDiamond | レンダリング | SVG 菱形が描画される |
| PhaseDiamond | フェーズ選択 | attack ボタンクリックで onPhaseChange('attack') が呼ばれる |
| PhaseDiamond | フェーズ選択 | defense ボタンクリックで onPhaseChange('defense') が呼ばれる |
| PhaseDiamond | フェーズ選択 | positive_transition ボタンクリックで onPhaseChange が呼ばれる |
| PhaseDiamond | フェーズ選択 | negative_transition ボタンクリックで onPhaseChange が呼ばれる |
| PhaseDiamond | 選択状態 | 選択中のフェーズに scale-110 クラスが適用される |
| PhaseDiamond | 選択状態 | 非選択のフェーズに scale-110 が適用されない |

## PlayerViewHUD.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| PlayerViewHUD | 非表示条件 | captureMode の場合は非表示 |
| PlayerViewHUD | 非表示条件 | playerViewEnabled が false の場合は非表示 |
| PlayerViewHUD | 選手未選択プロンプト | playerView 有効・選手未選択時にプロンプトが表示される |
| PlayerViewHUD | 選手未選択プロンプト | カメラアイコンが表示される |
| PlayerViewHUD | 自チーム選手追跡 | 選手名が表示される |
| PlayerViewHUD | 自チーム選手追跡 | 背番号が表示される |
| PlayerViewHUD | 自チーム選手追跡 | FOLLOWING ラベルが表示される |
| PlayerViewHUD | 自チーム選手追跡 | Exit ボタンが表示され、クリックで onExitPlayerView が呼ばれる |
| PlayerViewHUD | 自チーム選手追跡 | 存在しない playerIndex の場合、フォールバック表示になる |
| PlayerViewHUD | 相手選手追跡 | 相手選手名が表示される |
| PlayerViewHUD | 相手選手追跡 | 相手選手の背番号が表示される |
| PlayerViewHUD | 相手選手追跡 | FOLLOWING OPPONENT ラベルが表示される |
| PlayerViewHUD | 相手選手追跡 | Exit ボタンが表示され、クリックで onExitPlayerView が呼ばれる |
| PlayerViewHUD | 相手選手追跡 | 存在しない opponentId の場合は null を返す |
| PlayerViewHUD | 相手選手追跡 | playerName がない相手選手はフォールバック表示 |

## RightControlsColumn.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| RightControlsColumn | 開閉トグル | トグルボタンが常に表示される |
| RightControlsColumn | 開閉トグル | コントロールが非表示の場合、トグルボタンのラベルが変わる |
| RightControlsColumn | 開閉トグル | コントロールが非表示の場合、フォーメーション選択が表示されない |
| RightControlsColumn | フォーメーション選択 | フォーメーションヘッダーが表示される |
| RightControlsColumn | フォーメーション選択 | 利用可能なフォーメーションボタンが表示される |
| RightControlsColumn | フォーメーション選択 | 実行中の場合、フォーメーションボタンが無効になる |
| RightControlsColumn | フォーメーション選択 | フォーメーション編集ボタンが表示される |
| RightControlsColumn | Undo/Redo | Undoセクションが表示される |
| RightControlsColumn | Undo/Redo | Undoが不可の場合、Undoボタンが無効になる |
| RightControlsColumn | Undo/Redo | Redoが不可の場合、Redoボタンが無効になる |
| RightControlsColumn | フォーメーションエディター | showFormationEditorがtrueの場合、エディターが表示される |
| RightControlsColumn | フォーメーションエディター | showFormationEditorがfalseの場合、エディターが表示されない |
| RightControlsColumn | 敵配置 | 敵配置ボタンが表示される |
| RightControlsColumn | 敵配置 | 敵がいる場合、クリアボタンが表示される |
| RightControlsColumn | 名前表示 | 名前表示切り替えボタンが表示される |
| RightControlsColumn | 名前表示 | 選手名が非表示の場合、ラベルが変わる |
| RightControlsColumn | 名前表示 | 名前設定パネルが表示される場合、選手リストが表示される |
| RightControlsColumn | カード表示 | カードトグルボタンが表示される |
| RightControlsColumn | マーカーサイズ | サイズ選択ボタン(S, M, L)が表示される |
| RightControlsColumn | 戦術フロー | アクティブ戦術がある場合、フローボタンが表示される |
| RightControlsColumn | 戦術フロー | アクティブ戦術がない場合、フローボタンが表示されない |
| RightControlsColumn | プレイヤービュー | プレイヤービューボタンが表示される |
| RightControlsColumn | ボール配置 | ボール配置ボタンが表示される |
| RightControlsColumn | ボール配置 | ボールが配置済みの場合、削除ボタンが表示される |
| RightControlsColumn | スケッチ | スケッチボタンが表示される |
| RightControlsColumn | サブコンポーネント | 背景設定パネルが表示される |
| RightControlsColumn | サブコンポーネント | 相手チーム選択パネルが表示される |
| RightControlsColumn | サブコンポーネント | ライン描画ボタンが表示される |
| RightControlsColumn | コールバック | トグルボタンクリックで onToggleRightControls が呼ばれる |
| RightControlsColumn | コールバック | フォーメーションボタンクリックで onChangeFormation が呼ばれる |
| RightControlsColumn | コールバック | フォーメーション編集ボタンクリックで onToggleFormationEditor が呼ばれる |
| RightControlsColumn | コールバック | Undoボタンクリックで onUndo が呼ばれる |
| RightControlsColumn | コールバック | Redoボタンクリックで onRedo が呼ばれる |
| RightControlsColumn | コールバック | 敵配置ボタンクリックで toggleOpponentPlacement が呼ばれる |
| RightControlsColumn | コールバック | 名前表示ボタンクリックで onTogglePlayerNames が呼ばれる |

## SidebarPanel.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| SidebarPanel |  | renders in normal mode with reset button, phase diamond, and tactics |
| SidebarPanel |  | renders capture mode UI |
| SidebarPanel |  | renders with tactics list when tactics are present |
| SidebarPanel |  | renders loading state for tactics |
| SidebarPanel |  | renders set play type selector when playMode is setPlay |
| SidebarPanel | game mode callbacks | clicking a game mode button calls onGameModeChange |
| SidebarPanel | phase callbacks | clicking reset button calls onResetState |
| SidebarPanel | phase callbacks | clicking ball win button calls onToggleBallWin |
| SidebarPanel | phase callbacks | clicking ball lost button calls onToggleBallLost |
| SidebarPanel | phase callbacks | clicking a set play type button calls onSetPlayTypeChange and onResetTactic |
| SidebarPanel | tactics callbacks | clicking a tactic button calls onTriggerTactic |
| SidebarPanel | tactics callbacks | clicking delete button on custom tactic calls onDeleteTactic |
| SidebarPanel | tactics callbacks | clicking create button calls onStartCreation |
| SidebarPanel | tactics callbacks | clicking import button calls onImportTactics |
| SidebarPanel | tactics callbacks | clicking export button calls onExportTactics when custom tactics exist |
| SidebarPanel | capture mode callbacks | clicking save PNG button calls onSavePng |
| SidebarPanel | capture mode callbacks | clicking toggle player names button calls onTogglePlayerNames |
| SidebarPanel | capture mode callbacks | clicking close capture button calls onExitCaptureMode |

## SketchOverlay.test.tsx

| describe | テストケース |
| --- | --- |
| SketchOverlay | canvas 要素を描画する |
| SketchOverlay | sketchMode=false の場合 pointerEvents=none |
| SketchOverlay | sketchMode=true の場合 pointerEvents=auto |
| SketchOverlay | sketchMode=true の場合 cursor=crosshair |

## SketchToolbar.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| SketchToolbar | ツール選択 | ペン・ライン・矢印のツールボタンが表示される |
| SketchToolbar | ツール選択 | アクティブツールがaria-pressedでマークされる |
| SketchToolbar | カラーパレット | 6色のカラーボタンが表示される |
| SketchToolbar | 太さ選択 | S, M, Lの太さボタンが表示される |
| SketchToolbar | 太さ選択 | 選択中の太さがaria-pressedでマークされる |
| SketchToolbar | アクションボタン | Undo, Clear, ClearAllボタンが表示される |
| SketchToolbar | レイヤーパネル | Layersヘッダーが表示される |
| SketchToolbar | レイヤーパネル | レイヤー名が表示される |
| SketchToolbar | レイヤーパネル | レイヤーが3未満の場合、追加ボタンが表示される |
| SketchToolbar | レイヤーパネル | レイヤーが3つの場合、追加ボタンが表示されない |
| SketchToolbar | レイヤーパネル | レイヤーが複数ある場合、削除ボタンが表示される |
| SketchToolbar | レイヤーパネル | レイヤーが1つだけの場合、削除ボタンが表示されない |
| SketchToolbar | レイヤーパネル | 可視レイヤーの表示/非表示切り替えボタンが表示される |
| SketchToolbar | レイヤーパネル | 非表示レイヤーのShow layerボタンが表示される |
| SketchToolbar | スモークテスト | 全プロパティが渡された場合にクラッシュしない |

## SquadPanel.test.tsx

| describe | テストケース |
| --- | --- |
| SquadPanel | renders with squad players showing names and numbers |
| SquadPanel | returns null when captureMode is true |
| SquadPanel | returns null when showSquadBuilder is true |
| SquadPanel | returns null when playerViewEnabled and a player is selected |
| SquadPanel | returns null when all squad positions are null |
| SquadPanel | displays card status when a player has a yellow card |
| SquadPanel | shows closed indicator when squadPanelOpen is false but players exist |

## SubstitutesPanel.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| SubstitutesPanel | 表示条件 | サブがいる場合にパネルが表示される |
| SubstitutesPanel | 表示条件 | captureMode の場合は表示されない |
| SubstitutesPanel | 表示条件 | showSquadBuilder の場合は表示されない |
| SubstitutesPanel | 表示条件 | squadPanelOpen が false の場合は表示されない |
| SubstitutesPanel | 表示条件 | playerView が有効で選手選択中の場合は表示されない |
| SubstitutesPanel | 表示条件 | playerView が有効で相手選手選択中の場合は表示されない |
| SubstitutesPanel | 表示条件 | サブも交代記録もない場合は表示されない |
| SubstitutesPanel | サブ選手一覧 | サブ選手の名前が表示される |
| SubstitutesPanel | サブ選手一覧 | サブ選手の背番号が表示される |
| SubstitutesPanel | サブ選手一覧 | サブ選手数がヘッダーに表示される |
| SubstitutesPanel | 折りたたみ | ヘッダークリックでパネルを閉じる |
| SubstitutesPanel | 折りたたみ | 再クリックでパネルを開く |
| SubstitutesPanel | 折りたたみ | 折りたたみインジケーター '▲'/'▼' が切り替わる |
| SubstitutesPanel | 交代記録 | 交代記録が表示される |
| SubstitutesPanel | 交代記録 | 交代記録数がヘッダーに表示される |
| SubstitutesPanel | 交代記録 | リセットボタンが表示され、クリックで onResetSubstitutions が呼ばれる |
| SubstitutesPanel | 交代記録 | onResetSubstitutions が未設定の場合、リセットボタンは表示されない |
| SubstitutesPanel | ドラッグ | サブ選手が draggable 属性を持つ |

## TacticCreationToolbar.test.tsx

| describe | テストケース |
| --- | --- |
| TacticCreationToolbar | wizardStep="metadata" で MetadataStep を表示する |
| TacticCreationToolbar | wizardStep="ballPosition" で BallPositionStep を表示する |
| TacticCreationToolbar | wizardStep="ballTrajectory" で BallTrajectoryStep を表示する |
| TacticCreationToolbar | wizardStep="setPosition" で SetPositionStep を表示する |
| TacticCreationToolbar | wizardStep="editing" で EditingStep を表示する |
| TacticCreationToolbar | wizardStep="confirm" で ConfirmStep を表示する |

## TacticsCanvas.test.tsx

| describe | テストケース |
| --- | --- |
| TacticsCanvas | Canvas ラッパーを aria-label 付きで描画する |
| TacticsCanvas | R3F Canvas と Scene をレンダリングする |
| TacticsCanvas | Shift キーが押されたとき矩形選択オーバーレイを表示する |
| TacticsCanvas | Shift キーが離されたとき矩形選択オーバーレイを非表示にする |
| TacticsCanvas | isPlayerView=true の場合、Shift キーでもオーバーレイを表示しない |
| TacticsCanvas | opponentPlacementMode=true の場合、Shift キーでもオーバーレイを表示しない |
| TacticsCanvas | ballPlacementMode=true の場合、Shift キーでもオーバーレイを表示しない |
| TacticsCanvas | lineTrackingActive=true の場合、Shift キーでもオーバーレイを表示しない |
| TacticsCanvas | 選択チーム・フォーメーション名を sr-only で表示する |

## TacticsHeader.test.tsx

| describe | テストケース |
| --- | --- |
| TacticsHeader | チーム名とフォーメーション名を表示する |
| TacticsHeader | チーム選択ボタンをクリックすると setShowTeamSelection が呼ばれる |
| TacticsHeader | 選手管理ボタンをクリックすると setShowPlayerManagement が呼ばれる |
| TacticsHeader | スカッドビルダーボタンをクリックすると setShowSquadBuilder が呼ばれる |
| TacticsHeader | キャプチャモードボタンをクリックすると setCaptureMode が呼ばれる |
| TacticsHeader | プレーモード切替ボタンをクリックすると handlePlayModeChange が呼ばれる |
| TacticsHeader | captureMode=true の場合 header が hidden クラスを持つ |
| TacticsHeader | 国情報がない場合もクラッシュしない |

## TacticsMainContent.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| TacticsMainContent |  | main 要素が id='main-content' で描画される |
| TacticsMainContent |  | 主要なサブコンポーネントが描画される |
| TacticsMainContent |  | captureMode 時は RightControlsColumn が非表示 |
| TacticsMainContent | callback delegation to sub-components | onToggleRightControls toggles showRightControls via context |
| TacticsMainContent | callback delegation to sub-components | onUndo calls handleUndo from context |
| TacticsMainContent | callback delegation to sub-components | onRedo calls handleRedo from context |
| TacticsMainContent | callback delegation to sub-components | onTogglePlayerNames toggles showPlayerNames via context |
| TacticsMainContent | callback delegation to sub-components | onToggleNameSettings toggles showNameSettings via context |
| TacticsMainContent | callback delegation to sub-components | onToggleCards toggles showCards via context |
| TacticsMainContent | callback delegation to sub-components | onToggleFlowchart toggles showFlowchart via context |
| TacticsMainContent | callback delegation to sub-components | onToggleFormationEditor toggles showFormationEditor via context |
| TacticsMainContent | callback delegation to sub-components | onToggleSketchMode toggles sketch mode via context |
| TacticsMainContent | callback delegation to sub-components | onTogglePlayerHidden toggles hidden player indices via context |
| TacticsMainContent | callback delegation to sub-components | onMarkerScaleChange delegates to context |
| TacticsMainContent | callback delegation to sub-components | onToggleSquadPanel toggles squadPanelOpen via SquadPanel props |
| TacticsMainContent | callback delegation to sub-components | ViewLockPanel onCameraAction delegates to context |
| TacticsMainContent | callback delegation to sub-components | ViewLockPanel onToggleFieldLock toggles fieldLocked via context |
| TacticsMainContent | callback delegation to sub-components | ViewLockPanel onToggleTouchlineLock toggles touchlineLocked via context |
| TacticsMainContent | callback delegation to sub-components | onChangeFormation delegates to formationMgmt.changeFormation |
| TacticsMainContent | callback delegation to sub-components | onUpdateTeam delegates to teamMgmt.handleUpdateTeam |
| TacticsMainContent | callback delegation to sub-components | onEditOpponentTeam sets selectedTeamId and toggles opponent placement |
| TacticsMainContent | callback delegation to sub-components | onToggleSketchMode closes sidebar when entering sketch mode with sidebar open |
| TacticsMainContent | callback delegation to sub-components | onToggleSketchMode does not close sidebar when exiting sketch mode |
| TacticsMainContent | callback delegation to sub-components | SquadPanel onCycleCard delegates to handleSquadCardCycle |
| TacticsMainContent | callback delegation to sub-components | SquadPanel onSubstitute delegates to teamMgmt.handleSubstitution |

## TacticsModals.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| TacticsModals | PlayerManagement モーダル | showPlayerManagement が false のとき表示しない |
| TacticsModals | PlayerManagement モーダル | showPlayerManagement が true のとき表示する |
| TacticsModals | SquadBuilder モーダル | showSquadBuilder が false のとき表示しない |
| TacticsModals | SquadBuilder モーダル | showSquadBuilder が true のとき表示する |
| TacticsModals | 相手チームフォーメーション選択 | showOpponentFormationSelect が false のとき表示しない |
| TacticsModals | 相手チームフォーメーション選択 | opponentTeam がない場合は表示しない |
| TacticsModals | 相手チームフォーメーション選択 | 両方設定されていればフォーメーション選択を表示する |
| TacticsModals | 相手チームフォーメーション選択 | 利用可能なフォーメーションのボタンが表示される |
| TacticsModals | 相手チームフォーメーション選択 | フォーメーションボタンをクリックすると opponentsHook の状態遷移が呼ばれる |
| TacticsModals | 相手チームフォーメーション選択 | 閉じるボタンをクリックすると setShowOpponentFormationSelect(false) が呼ばれる |
| TacticsModals | 相手チームフォーメーション選択 | オーバーレイクリックで setShowOpponentFormationSelect(false) が呼ばれる |
| TacticsModals | 相手チーム SquadBuilder | 条件が揃っていないとき表示しない |
| TacticsModals | 相手チーム SquadBuilder | 条件が揃っているとき SquadBuilder を表示する |

## TacticsSidebarSection.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| TacticsSidebarSection |  | サイドバートグルボタンが表示される |
| TacticsSidebarSection |  | サイドバーが閉じている場合は openSidebar ラベルが表示される |
| TacticsSidebarSection |  | トグルボタンクリックで toggleSidebar が呼ばれる |
| TacticsSidebarSection |  | SidebarPanel がレンダリングされる |
| TacticsSidebarSection |  | モバイルオーバーレイはサイドバーが開いているときに表示される |
| TacticsSidebarSection |  | lineupAnimation がアクティブな場合、トグルボタンは非表示 |
| TacticsSidebarSection | callback delegation to SidebarPanel | layout.onTransitionEnd calls setSidebarAnimating(false) |
| TacticsSidebarSection | callback delegation to SidebarPanel | gameMode.onGameModeChange delegates to playModePhase.handleGameModeChange |
| TacticsSidebarSection | callback delegation to SidebarPanel | phase.onPhaseChange delegates to playModePhase.setSelectedPhase |
| TacticsSidebarSection | callback delegation to SidebarPanel | phase.onSetPlayTypeChange delegates to playModePhase.setSelectedSetPlayType |
| TacticsSidebarSection | callback delegation to SidebarPanel | phase.onToggleBallWin delegates to playModePhase.handleToggleBallWin |
| TacticsSidebarSection | callback delegation to SidebarPanel | phase.onToggleBallLost delegates to playModePhase.handleToggleBallLost |
| TacticsSidebarSection | callback delegation to SidebarPanel | phase.onResetState delegates to playModePhase.handleResetState |
| TacticsSidebarSection | callback delegation to SidebarPanel | phase.onResetTactic delegates to tOrch.resetTactic |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onTriggerTactic delegates to tOrch.triggerTactic |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onDeleteTactic delegates to tOrch.handleDeleteTactic |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onStartCreation delegates to tOrch.startTacticCreation |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onImportTactics がモーダルを開く |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onExportTactics delegates to tOrch.handleExportTactics |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onTriggerStepTactic delegates to tOrch.triggerStepTactic |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onExecuteNextStep delegates to tOrch.executeNextStep |
| TacticsSidebarSection | callback delegation to SidebarPanel | tactics.onExitStepMode delegates to tOrch.exitStepMode |
| TacticsSidebarSection | callback delegation to SidebarPanel | capture.onSavePng delegates to handleSavePng |
| TacticsSidebarSection | callback delegation to SidebarPanel | capture.onExitCaptureMode calls setCaptureMode(false) |
| TacticsSidebarSection | callback delegation to SidebarPanel | capture.onTogglePlayerNames toggles showPlayerNames and resets hiddenPlayerIndices when enabling |
| TacticsSidebarSection | callback delegation to SidebarPanel | capture.onTogglePlayerNames does not reset hiddenPlayerIndices when disabling |
| TacticsSidebarSection | callback delegation to SidebarPanel | モバイルオーバーレイクリックで toggleSidebar が呼ばれる |

## TeamSelectionScreen.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| TeamSelectionScreen | ヘッダー | タイトルが表示される |
| TeamSelectionScreen | ヘッダー | サブタイトルが表示される |
| TeamSelectionScreen | ヘッダー | ホームボタンクリックで onNavigateHome が呼ばれる |
| TeamSelectionScreen | チーム一覧 | チーム名が表示される |
| TeamSelectionScreen | チーム一覧 | フォーメーションバッジが表示される |
| TeamSelectionScreen | チーム一覧 | チームクリックで onSelectTeam が呼ばれる |
| TeamSelectionScreen | チーム一覧 | teams が undefined の場合、チーム一覧は空 |
| TeamSelectionScreen | チーム一覧 | 国旗が設定されたチームは国旗が表示される |
| TeamSelectionScreen | 削除 | 削除ボタンに適切な aria-label が設定される |
| TeamSelectionScreen | 削除 | 削除ボタンクリックで onDeleteTeam が呼ばれる |
| TeamSelectionScreen | アクションボタン | 一括インポートボタンクリックで onShowBulkTeamImport が呼ばれる |
| TeamSelectionScreen | アクションボタン | チーム作成ボタンクリックで onShowTeamCreator が呼ばれる |
| TeamSelectionScreen | モーダル | showTeamCreator が true のとき TeamCreator が表示される |
| TeamSelectionScreen | モーダル | showTeamCreator が false のとき TeamCreator が非表示 |
| TeamSelectionScreen | モーダル | showBulkTeamImport が true のとき BulkTeamImportModal が表示される |
| TeamSelectionScreen | モーダル | showBulkTeamImport が false のとき BulkTeamImportModal が非表示 |

## TimelineEditor.test.tsx

| describe | テストケース |
| --- | --- |
| TimelineEditor | Timeline ヘッダーと閉じるボタンを表示する |
| TimelineEditor | 閉じるボタンをクリックすると onClose が呼ばれる |
| TimelineEditor | ステップ番号を表示する |
| TimelineEditor | duration 入力フィールドにステップの duration が表示される |
| TimelineEditor | duration を変更すると onStepDurationChange が呼ばれる |
| TimelineEditor | 100 未満の duration は無視される |
| TimelineEditor | ムーブメントの role ラベルを表示する |
| TimelineEditor | ムーブメントバーに slider role と aria 属性がある |
| TimelineEditor | 遅延がある場合、+{delay}ms テキストを表示する |
| TimelineEditor | ボールパスの Pass ラベルを表示する |
| TimelineEditor | ボールパスの startRole → endRole を表示する |
| TimelineEditor | onRemoveBallPass が渡された場合、削除ボタンを表示する |
| TimelineEditor | onBallPassTrajectoryChange が渡された場合、トラジェクトリボタンを表示する |
| TimelineEditor | ルーラーに時間目盛りを表示する |
| TimelineEditor | 座標ベースのボールパスは座標を表示する |

## ViewLockPanel.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| ViewLockPanel | レンダリング | 4つのカメラアクションボタンが表示される |
| ViewLockPanel | レンダリング | フィールドロックボタンが表示される（未ロック状態） |
| ViewLockPanel | レンダリング | フィールドロックボタンが表示される（ロック状態） |
| ViewLockPanel | カメラアクション | ホームボタンクリックで onCameraAction('reset') が呼ばれる |
| ViewLockPanel | カメラアクション | トップダウンボタンクリックで onCameraAction('topDown') が呼ばれる |
| ViewLockPanel | カメラアクション | サイドビューボタンクリックで onCameraAction('sideView') が呼ばれる |
| ViewLockPanel | カメラアクション | サイドビューリバースボタンクリックで onCameraAction('sideViewReverse') が呼ばれる |
| ViewLockPanel | ロックトグル | フィールドロックボタンクリックで onToggleFieldLock が呼ばれる |
| ViewLockPanel | ロックトグル | タッチラインロックボタンクリックで onToggleTouchlineLock が呼ばれる |
| ViewLockPanel | ロックトグル | fieldLocked 時のラベルが unlockField になる |
| ViewLockPanel | ロックトグル | touchlineLocked 時のラベルが touchlineUnlock になる |
| ViewLockPanel | 無効状態 | disabled でカメラアクションボタンが無効になる |
| ViewLockPanel | 無効状態 | disabled でカーソルが not-allowed になる |
| ViewLockPanel | 折りたたみ | 折りたたみボタンクリックでパネルが非表示になる |
| ViewLockPanel | 折りたたみ | 再クリックでパネルが再表示される |
