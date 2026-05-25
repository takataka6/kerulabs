# Tactic Creation テストケース一覧

## BallPositionStep.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| BallPositionStep | 基本レンダリング | タイトルとステップインジケーターを表示する |
| BallPositionStep | 基本レンダリング | ヒントテキストを表示する |
| BallPositionStep | 基本レンダリング | 戻る・次へボタンを表示する |
| BallPositionStep | ボール位置未設定時 | 次へボタンが無効になる |
| BallPositionStep | ボール位置未設定時 | 座標が表示されない |
| BallPositionStep | ボール位置設定済み時 | 座標が表示される |
| BallPositionStep | ボール位置設定済み時 | 次へボタンが有効になる |
| BallPositionStep | ナビゲーション | 戻るボタンで metadata ステップに移動する |
| BallPositionStep | ナビゲーション | 次へボタン（有効時）で ballTrajectory ステップに移動する |
| BallPositionStep | ドラッグハンドル | isDragging が true のとき cursor-grabbing クラスが適用される |
| BallPositionStep | ドラッグハンドル | isDragging が false のとき cursor-grab クラスが適用される |
| BallPositionStep | ドラッグハンドル | PointerDown で handlePointerDown が呼ばれる |
| BallPositionStep | オフセット | offset が transform スタイルに反映される |

## BallTrajectoryStep.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| BallTrajectoryStep | 基本レンダリング | タイトルとステップインジケーターを表示する |
| BallTrajectoryStep | 基本レンダリング | ヒントテキストを表示する |
| BallTrajectoryStep | 基本レンダリング | 戻る・スキップ・次へボタンを表示する |
| BallTrajectoryStep | 軌道未設定時 | 次へボタンが無効になる |
| BallTrajectoryStep | 軌道未設定時 | 軌道タイプセレクターが表示されない |
| BallTrajectoryStep | 軌道設定済み時 | 座標が表示される |
| BallTrajectoryStep | 軌道設定済み時 | 次へボタンが有効になる |
| BallTrajectoryStep | 軌道設定済み時 | 軌道タイプセレクターが表示される |
| BallTrajectoryStep | 軌道設定済み時 | 4つの軌道タイプボタンを表示する |
| BallTrajectoryStep | 軌道設定済み時 | 現在の軌道タイプが aria-pressed=true になる |
| BallTrajectoryStep | 軌道設定済み時 | 軌道タイプをクリックすると onTrajectoryTypeChange が呼ばれる |
| BallTrajectoryStep | ナビゲーション | 戻るボタンで ballPosition ステップに移動する |
| BallTrajectoryStep | ナビゲーション | スキップボタンで setPosition ステップに移動する |
| BallTrajectoryStep | ナビゲーション | 次へボタン（有効時）で setPosition ステップに移動する |
| BallTrajectoryStep | ドラッグハンドル | isDragging が true のとき cursor-grabbing クラスが適用される |
| BallTrajectoryStep | ドラッグハンドル | isDragging が false のとき cursor-grab クラスが適用される |
| BallTrajectoryStep | ドラッグハンドル | PointerDown イベントで handlePointerDown が呼ばれる |
| BallTrajectoryStep | オフセット | offset が transform スタイルに反映される |

## ConfirmStep.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| ConfirmStep | 基本レンダリング | 戦術名が表示される（日本語モード） |
| ConfirmStep | 基本レンダリング | アイコンが表示される |
| ConfirmStep | 基本レンダリング | 確認ラベルが表示される |
| ConfirmStep | 基本レンダリング | プレビューボタンが表示される |
| ConfirmStep | 基本レンダリング | タイムラインボタンが表示される |
| ConfirmStep | 基本レンダリング | 戻るボタンが表示される |
| ConfirmStep | 基本レンダリング | ステップ追加ボタンが表示される |
| ConfirmStep | 基本レンダリング | 保存ボタンが表示される |
| ConfirmStep | 基本レンダリング | ムーブメント数が表示される |
| ConfirmStep | 基本レンダリング | ステップ数が表示される |
| ConfirmStep | ボールパス表示 | ボールパスがある場合、パス数が表示される |
| ConfirmStep | ボールパス表示 | ボールパスがない場合、パス数が表示されない |
| ConfirmStep | ボタン操作 | 戻るボタンをクリックするとeditingステップに移動する |
| ConfirmStep | ボタン操作 | プレビューボタンをクリックするとonPreviewが呼ばれる |
| ConfirmStep | ボタン操作 | タイムラインボタンをクリックするとonToggleTimelineが呼ばれる |
| ConfirmStep | ボタン操作 | 保存ボタンをクリックするとonSaveが呼ばれる |
| ConfirmStep | ボタン操作 | ステップ追加ボタンをクリックするとonAddStepとonWizardStepが呼ばれる |
| ConfirmStep | 実行中の状態 | isExecutingがtrueの場合、プレビューボタンが無効になる |
| ConfirmStep | 実行中の状態 | isExecutingがfalseの場合、プレビューボタンが有効になる |
| ConfirmStep | 言語表示 | 英語モードの場合、英語名が表示される |
| ConfirmStep | 言語表示 | 日本語名のみ設定されている場合、英語モードでも日本語名が表示される |
| ConfirmStep | タイムライン状態 | timelineOpenがtrueの場合、タイムラインボタンがアクティブスタイルになる |
| ConfirmStep | タイムライン状態 | timelineOpenがfalseの場合、タイムラインボタンが非アクティブスタイルになる |
| ConfirmStep | ドラッグハンドル | isDragging が true のとき cursor-grabbing クラスが適用される |
| ConfirmStep | ドラッグハンドル | isDragging が false のとき cursor-grab クラスが適用される |
| ConfirmStep | オフセット | offset が transform スタイルに反映される |

## EditingStep.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| EditingStep | 基本レンダリング | 戦術名が表示される（日本語モード） |
| EditingStep | 基本レンダリング | アイコンが表示される |
| EditingStep | 基本レンダリング | 編集ガイダンスが表示される |
| EditingStep | 基本レンダリング | Passボタンが表示される |
| EditingStep | 基本レンダリング | リセットボタンが表示される |
| EditingStep | 基本レンダリング | 戻るボタンが表示される |
| EditingStep | 基本レンダリング | 完了ボタンが表示される |
| EditingStep | 基本レンダリング | ドラッグ操作のヒントが表示される |
| EditingStep | ステップバッジ | 複数ステップがある場合、全てのステップボタンが表示される |
| EditingStep | ステップバッジ | ステップボタンをクリックするとonSwitchStepが呼ばれる |
| EditingStep | ボタン状態 | ムーブメントがない場合、完了ボタンが無効になる |
| EditingStep | ボタン状態 | ムーブメントがない場合、リセットボタンが無効になる |
| EditingStep | ボタン状態 | ムーブメントがある場合、完了ボタンが有効になる |
| EditingStep | ボタン状態 | ムーブメントがある場合、リセットボタンが有効になる |
| EditingStep | ナビゲーション | 通常モードで戻るボタンをクリックするとmetadataステップに移動する |
| EditingStep | ナビゲーション | セットプレーモードで戻るボタンをクリックするとsetPositionステップに移動する |
| EditingStep | ナビゲーション | 完了ボタンをクリックするとconfirmステップに移動する |
| EditingStep | ナビゲーション | リセットボタンをクリックするとonResetStepが呼ばれる |
| EditingStep | ボールパスモード | Passボタンをクリックするとモード切替が呼ばれる |
| EditingStep | ボールパスモード | ボールパスモード時にガイダンスが変わる |
| EditingStep | ボールパスモード | ボールパスモードでスタート位置設定済みの場合、座標が表示される |
| EditingStep | ボールパスモード | ボールパスモード時に軌跡タイプセレクターが表示される |
| EditingStep | ボールパスモード | 軌跡タイプを選択するとonBallPassTrajectoryTypeChangeが呼ばれる |
| EditingStep | 言語表示 | 英語モードの場合、英語名が表示される |
| EditingStep | 言語表示 | 日本語名のみ設定されている場合、英語モードでも日本語名が表示される |
| EditingStep | ドラッグハンドル | isDragging が true のとき cursor-grabbing クラスが適用される |
| EditingStep | ドラッグハンドル | isDragging が false のとき cursor-grab クラスが適用される |
| EditingStep | オフセット | offset が transform スタイルに反映される |

## MetadataStep.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| MetadataStep | 基本レンダリング | タイトルが表示される |
| MetadataStep | 基本レンダリング | ステップインジケーターが表示される |
| MetadataStep | 基本レンダリング | 日本語名入力フィールドが表示される |
| MetadataStep | 基本レンダリング | 英語名入力フィールドが表示される |
| MetadataStep | 基本レンダリング | フォーメーション名が表示される |
| MetadataStep | 基本レンダリング | キャンセルボタンが表示される |
| MetadataStep | 基本レンダリング | 次へボタンが表示される |
| MetadataStep | 基本レンダリング | アイコン選択ボタンが表示される |
| MetadataStep | 基本レンダリング | フェーズ選択ラベルが表示される |
| MetadataStep | 名前入力 | 日本語名を入力するとonNameJaChangeが呼ばれる |
| MetadataStep | 名前入力 | 英語名を入力するとonNameEnChangeが呼ばれる |
| MetadataStep | 次へボタン状態 | 名前が未入力の場合、次へボタンが無効になる |
| MetadataStep | 次へボタン状態 | 日本語名が入力されている場合、次へボタンが有効になる |
| MetadataStep | 次へボタン状態 | 英語名が入力されている場合、次へボタンが有効になる |
| MetadataStep | ナビゲーション | 通常モードで次へボタンをクリックするとeditingステップに移動する |
| MetadataStep | ナビゲーション | セットプレーモードで次へボタンをクリックするとballPositionステップに移動する |
| MetadataStep | ナビゲーション | キャンセルボタンをクリックするとonCancelが呼ばれる |
| MetadataStep | フェーズ選択（通常モード） | フェーズドロップダウンボタンが表示される |
| MetadataStep | フェーズ選択（通常モード） | ドロップダウンをクリックするとフェーズ一覧が表示される |
| MetadataStep | フェーズ表示（セットプレーモード） | セットプレーモードではフェーズが読み取り専用で表示される |
| MetadataStep | アイコンピッカー | アイコンボタンをクリックするとピッカーが表示される |
| MetadataStep | アイコンピッカー | アイコンを選択するとonIconChangeが呼ばれる |
| MetadataStep | ドラッグハンドル | isDragging が true のとき cursor-grabbing クラスが適用される |
| MetadataStep | ドラッグハンドル | isDragging が false のとき cursor-grab クラスが適用される |
| MetadataStep | ドラッグハンドル | PointerDown で handlePointerDown が呼ばれる |
| MetadataStep | オフセット | offset が transform スタイルに反映される |

## SetPositionStep.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| SetPositionStep | 基本レンダリング | タイトルとステップインジケーターを表示する |
| SetPositionStep | 基本レンダリング | ヒントテキストを表示する |
| SetPositionStep | 基本レンダリング | 戻る・次へボタンを表示する |
| SetPositionStep | 基本レンダリング | 次へボタンは常に有効 |
| SetPositionStep | 配置済みプレイヤー表示 | 配置数が 0 のとき配置済みカウントを表示しない |
| SetPositionStep | 配置済みプレイヤー表示 | 配置数が 1 以上のとき配置済みカウントを表示する |
| SetPositionStep | ナビゲーション | 戻るボタンで ballTrajectory ステップに移動する |
| SetPositionStep | ナビゲーション | 次へボタンで editing ステップに移動する |
| SetPositionStep | ドラッグハンドル | isDragging が true のとき cursor-grabbing クラスが適用される |
| SetPositionStep | ドラッグハンドル | isDragging が false のとき cursor-grab クラスが適用される |
| SetPositionStep | ドラッグハンドル | PointerDown で handlePointerDown が呼ばれる |
| SetPositionStep | オフセット | offset が transform スタイルに反映される |

## SidebarCreationContent.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| SidebarCreationContent | メタデータステップ (metadata) | メタデータステップが正常にレンダリングされる |
| SidebarCreationContent | メタデータステップ (metadata) | 名前入力フィールドが表示される |
| SidebarCreationContent | メタデータステップ (metadata) | フォーメーション名が表示される |
| SidebarCreationContent | メタデータステップ (metadata) | 名前が未入力の場合、次へボタンが無効になる |
| SidebarCreationContent | メタデータステップ (metadata) | 名前が入力されている場合、次へボタンが有効になる |
| SidebarCreationContent | メタデータステップ (metadata) | セットプレーモードの場合、フェーズドロップダウンが静的表示される |
| SidebarCreationContent | メタデータステップ (metadata) | キャンセルボタンが表示される |
| SidebarCreationContent | ボール位置ステップ (ballPosition) | ボール位置ステップが正常にレンダリングされる |
| SidebarCreationContent | ボール位置ステップ (ballPosition) | ボール位置が未設定の場合、次へボタンが無効になる |
| SidebarCreationContent | ボール位置ステップ (ballPosition) | ボール位置が設定済みの場合、座標が表示される |
| SidebarCreationContent | ボール位置ステップ (ballPosition) | 戻るボタンが表示される |
| SidebarCreationContent | ボール軌道ステップ (ballTrajectory) | ボール軌道ステップが正常にレンダリングされる |
| SidebarCreationContent | ボール軌道ステップ (ballTrajectory) | 軌道が未設定の場合、次へボタンが無効になる |
| SidebarCreationContent | ボール軌道ステップ (ballTrajectory) | 軌道が設定済みの場合、軌道タイプセレクターが表示される |
| SidebarCreationContent | ボール軌道ステップ (ballTrajectory) | スキップボタンが表示される |
| SidebarCreationContent | セット位置ステップ (setPosition) | セット位置ステップが正常にレンダリングされる |
| SidebarCreationContent | セット位置ステップ (setPosition) | 配置済み選手数が表示される |
| SidebarCreationContent | 編集ステップ (editing) | 編集ステップが正常にレンダリングされる |
| SidebarCreationContent | 編集ステップ (editing) | ステップタブが表示される |
| SidebarCreationContent | 編集ステップ (editing) | ボールパスモードの場合、パスモードUIが表示される |
| SidebarCreationContent | 編集ステップ (editing) | ボールパス開始位置が設定済みの場合、開始座標が表示される |
| SidebarCreationContent | 編集ステップ (editing) | 動きが0件の場合、完了ボタンが無効になる |
| SidebarCreationContent | 編集ステップ (editing) | 動きがある場合、完了ボタンが有効になる |
| SidebarCreationContent | 編集ステップ (editing) | リセットステップボタンが表示される |
| SidebarCreationContent | 編集ステップ (editing) | Passトグルボタンが表示される |
| SidebarCreationContent | 確認ステップ (confirm) | 確認ステップが正常にレンダリングされる |
| SidebarCreationContent | 確認ステップ (confirm) | 保存ボタンが表示される |
| SidebarCreationContent | 確認ステップ (confirm) | プレビューボタンが表示される |
| SidebarCreationContent | 確認ステップ (confirm) | タイムラインボタンが表示される |
| SidebarCreationContent | 確認ステップ (confirm) | ステップ追加ボタンが表示される |
| SidebarCreationContent | 確認ステップ (confirm) | 実行中の場合、プレビューボタンが無効になる |
| SidebarCreationContent | 確認ステップ (confirm) | ボールパス数が0より大きい場合、パス数が表示される |

## constants.test.ts

| describe | テストケース |
| --- | --- |
| TRAJECTORY_OPTIONS | 4つの軌道タイプが定義されている |
| TRAJECTORY_OPTIONS | 各オプションに type, icon, labelKey が存在する |
| TRAJECTORY_OPTIONS | 正しい軌道タイプを含む |
| TRAJECTORY_OPTIONS | labelKey が tactics.creation.trajectory. プレフィックスを持つ |
| PHASE_DROPDOWN_KEYS | 4つのフェーズキーが定義されている |
| PHASE_DROPDOWN_KEYS | 正しいフェーズキーを含む |
| ICON_OPTIONS | 8つのアイコンオプションが定義されている |
| ICON_OPTIONS | 全て文字列である |
| ICON_OPTIONS | 重複がない |
| Tailwind クラス定数 | WIZARD_WRAPPER が定義されている |
| Tailwind クラス定数 | CARD_BASE が定義されている |
| Tailwind クラス定数 | STEP_INDICATOR が定義されている |
| Tailwind クラス定数 | SECTION_TITLE が定義されている |
| Tailwind クラス定数 | BTN_SECONDARY が定義されている |
| Tailwind クラス定数 | WIZARD_WRAPPER に flex レイアウト関連のクラスを含む |
| Tailwind クラス定数 | CARD_BASE にバックドロップ関連のクラスを含む |
