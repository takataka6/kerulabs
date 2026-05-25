# UI コンポーネント テストケース一覧

## ErrorBoundary.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| ErrorBoundary | 正常レンダリング | 子コンポーネントがエラーなしで正常にレンダーされる |
| ErrorBoundary | 正常レンダリング | 複数の子コンポーネントを正常にレンダーする |
| ErrorBoundary | エラーキャッチ | 子コンポーネントのエラーをキャッチしてフォールバック UI を表示する |
| ErrorBoundary | エラーキャッチ | componentDidCatch で handleError を呼び出す |
| ErrorBoundary | エラーキャッチ | エラー発生後、子コンポーネントは表示されない |
| ErrorBoundary | フォールバック UI | 日本語のエラーメッセージが表示される |
| ErrorBoundary | フォールバック UI | 英語のエラーメッセージが表示される |
| ErrorBoundary | フォールバック UI | role='alert' がアクセシビリティのために設定される |
| ErrorBoundary | フォールバック UI | ホームリンクが '/' を指している |
| ErrorBoundary | 表示モード | デフォルト（full-screen）モードで min-h-screen クラスが適用される |
| ErrorBoundary | 表示モード | inline モードで flex-1 クラスが適用される |
| ErrorBoundary | カスタムフォールバック | fallback prop が指定された場合、カスタム UI を表示する |
| ErrorBoundary | リトライ | 再試行ボタンをクリックすると子コンポーネントの再レンダーを試みる |
| ErrorBoundary | リトライ | リトライ後も再度エラーが起きるとフォールバック UI に戻る |
| ErrorBoundary | エラー詳細（開発モード） | 開発モードではエラー詳細トグルボタンが表示される |
| ErrorBoundary | エラー詳細（開発モード） | エラー詳細ボタンをクリックすると詳細が展開される |
| ErrorBoundary | エラー詳細（開発モード） | エラー詳細にエラー名とメッセージが含まれる |
| ErrorBoundary | エラー詳細（開発モード） | エラー詳細を再度クリックすると閉じる |
| ErrorBoundary | getLanguage フォールバック | ServiceContainer が未初期化の場合、日本語にフォールバックする |
| ErrorBoundary | 本番モード | 本番モードではエラー詳細トグルが表示されない |

## ConfirmDialog.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| ConfirmDialog | useConfirm without provider | ConfirmProvider の外で useConfirm を使うとエラーが発生する |
| ConfirmDialog | confirm ダイアログ | トリガーでダイアログが表示される |
| ConfirmDialog | confirm ダイアログ | 確認ボタンで true が返る |
| ConfirmDialog | confirm ダイアログ | キャンセルボタンで false が返る |
| ConfirmDialog | red variant | variant=red で赤い確認ボタンが表示される |
| ConfirmDialog | alert ダイアログ | alert でキャンセルボタンが表示されない |
| ConfirmDialog | alert ダイアログ | OK ボタンで alert が解決される |
| ConfirmDialog | デフォルトラベル | confirmLabel 未指定時にデフォルト OK が表示される |
| ConfirmDialog | タイトルなし | title 未指定時にタイトル要素が表示されない |

## ImageCropModal.test.tsx

| describe | テストケース |
| --- | --- |
| ImageCropModal | 画像未選択時: ファイル選択ボタンが表示される |
| ImageCropModal | 初期画像あり: Cropperコンポーネントが表示される |
| ImageCropModal | 閉じるボタンでonCloseが呼ばれる |
| ImageCropModal | キャンセルボタンでonCloseが呼ばれる |
| ImageCropModal | 画像未選択時は保存ボタンが無効 |
| ImageCropModal | 削除ボタンが表示される (onRemoveがある場合) |
| ImageCropModal | 削除ボタンが表示されない (onRemoveがない場合) |
| ImageCropModal | カスタムタイトルが表示される |
| ImageCropModal | ズームスライダーで値が変更される |
| ImageCropModal | 別の画像を選択ボタンがファイル入力をトリガーする |
| ImageCropModal | 画像未選択時のファイル選択ボタンがファイル入力をトリガーする |
| ImageCropModal | ファイル選択で画像ファイルを選択するとCropperが表示される |
| ImageCropModal | 削除ボタンでonRemoveとonCloseが呼ばれる |
| ImageCropModal | 保存ボタンはimageSrcがない場合は無効 |
| ImageCropModal | ズームスライダーの値を1から3の範囲で変更できる |
| ImageCropModal | 非画像ファイルを選択するとエラーになりCropperは表示されない |
| ImageCropModal | ファイルが空の場合は何も起きない |
| ImageCropModal | initialImage有りで保存ボタンをクリックするとhandleSaveが実行される（croppedAreaPixelsがnullの場合は何もしない） |

## LogViewer.test.tsx

| describe | テストケース |
| --- | --- |
| LogViewer | renders with empty logs |
| LogViewer | renders with log entries |
| LogViewer | Clearボタンでログがクリアされる |
| LogViewer | Export JSONボタンでexportJSONが呼ばれる |
| LogViewer | ログレベルフィルターを変更するとgetEntriesが再呼び出しされる |
| LogViewer | カテゴリフィルターを変更するとgetEntriesが再呼び出しされる |
| LogViewer | 検索入力を変更するとgetEntriesが再呼び出しされる |
| LogViewer | RefreshボタンでloadEntriesが再呼び出しされる |
| LogViewer | CloseボタンでonCloseが呼ばれる |
| LogViewer | Clearボタン後にgetEntriesが空配列で再取得される |
| LogViewer | メタデータがないログエントリを展開しても詳細は表示されない |
| LogViewer | ログエントリをクリックすると展開される |

## MermaidFlowchart.test.tsx

| describe | テストケース |
| --- | --- |
| MermaidFlowchart | chartが空の場合は何もレンダリングしない |
| MermaidFlowchart | chartが指定された場合にmermaid.renderが呼ばれる |
| MermaidFlowchart | レンダリングエラー時にエラーメッセージが表示される |
| MermaidFlowchart | classNameが適用される |
| MermaidFlowchart | SVGコンテンツが表示される |

## Skeleton.test.tsx

| describe | テストケース |
| --- | --- |
| CardListSkeleton | デフォルトで4つのスケルトンカードを表示する |
| CardListSkeleton | 指定した数のスケルトンカードを表示する |
| CardListSkeleton | aria-label が設定されている |

## Toast.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| Toast | ToastProvider | children を正常にレンダーする |
| Toast | ToastProvider | aria-live='polite' のコンテナが存在する |
| Toast | useToast | Provider 外で使用するとエラーを投げる |
| Toast | トースト表示 | success トーストを表示する |
| Toast | トースト表示 | error トーストを表示する |
| Toast | トースト表示 | デフォルト type は info |
| Toast | トースト表示 | success アイコン '✓' が表示される |
| Toast | トースト表示 | error アイコン '✕' が表示される |
| Toast | トースト表示 | info アイコン 'ℹ' が表示される |
| Toast | トースト表示 | 複数のトーストを同時に表示できる |
| Toast | 自動消去 | 3500ms + 300ms 後にトーストが消える |
| Toast | 自動消去 | 3500ms 未満ではトーストが残っている |

## AccessibleModal.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| AccessibleModal | 表示/非表示 | isOpen が true のとき children を表示する |
| AccessibleModal | 表示/非表示 | isOpen が false のとき何も表示しない |
| AccessibleModal | アクセシビリティ | role='dialog' が設定される |
| AccessibleModal | アクセシビリティ | aria-modal='true' が設定される |
| AccessibleModal | アクセシビリティ | aria-labelledby が設定される |
| AccessibleModal | アクセシビリティ | aria-label が設定される |
| AccessibleModal | Escape キーで閉じる | Escape キーで onClose が呼ばれる |
| AccessibleModal | Escape キーで閉じる | isOpen が false の場合、Escape キーで onClose は呼ばれない |
| AccessibleModal | オーバーレイクリック | オーバーレイをクリックすると onClose が呼ばれる |
| AccessibleModal | オーバーレイクリック | モーダル内部をクリックしても onClose は呼ばれない |
| AccessibleModal | カスタムクラス | className がモーダル要素に適用される |
| AccessibleModal | カスタムクラス | overlayClassName がオーバーレイに適用される |
| AccessibleModal | フォーカストラップ | Tab キーでフォーカスがモーダル内に閉じ込められる |
| AccessibleModal | フォーカストラップ | Shift+Tab キーで逆方向のフォーカストラップ |
