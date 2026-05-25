# Pages テストケース一覧

## HomePage.test.tsx

| describe | テストケース |
| --- | --- |
| HomePage | ページタイトルが表示される |
| HomePage | サブタイトルが表示される |
| HomePage | アプリカードが表示される |
| HomePage | バックアップボタンが表示される |
| HomePage | 言語切替ボタンが表示される |
| HomePage | リセットボタンが表示される |
| HomePage | フッターが表示される |
| HomePage | アプリカードをクリックすると対応ページへ遷移する |
| HomePage | 言語切替ボタンをクリックすると setLanguage が呼ばれる |
| HomePage | エクスポートボタンをクリックすると handleExport が呼ばれる |
| HomePage | インポートボタンをクリックすると handleImport が呼ばれる |
| HomePage | リセットボタンをクリックすると確認後に handleReset が呼ばれる |
| HomePage | リセット確認でキャンセルした場合 handleReset が呼ばれない |
| HomePage | カードホバー時にホバー状態が切り替わる |

## GlossaryPage.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| GlossaryPage | 空の用語集一覧 | 用語集が空のとき空メッセージが表示される |
| GlossaryPage | 空の用語集一覧 | ページタイトルが表示される |
| GlossaryPage | 空の用語集一覧 | 作成ボタンが表示される |
| GlossaryPage | 空の用語集一覧 | インポートボタンが表示される |
| GlossaryPage | 用語集が存在する場合 | 用語集名が表示される |
| GlossaryPage | 用語集が存在する場合 | 用語集の説明が表示される |
| GlossaryPage | 用語集が存在する場合 | 用語数バッジが表示される |
| GlossaryPage | 用語集が存在する場合 | 空メッセージが表示されない |
| GlossaryPage | 用語集が存在する場合 | 用語集をクリックすると詳細画面が表示される |
| GlossaryPage | 用語集が存在する場合 | 詳細画面から戻るボタンで一覧に戻る |
| GlossaryPage | 用語集が存在する場合 | 削除ボタンをクリックすると確認ダイアログを表示して削除する |
| GlossaryPage | 用語集が存在する場合 | エクスポートボタンをクリックするとクリップボードにコピーする |
| GlossaryPage | 用語集が存在する場合 | 編集ボタンをクリックするとフォームモーダルが表示される |
| GlossaryPage | 作成フロー | 作成ボタンでモーダルが開き保存できる |
| GlossaryPage | 作成フロー | インポートボタンでモーダルが開く |
| GlossaryPage | 作成フロー | インポートモーダルからインポートを実行する |
| GlossaryPage | ローディング状態 | isLoading 時にスケルトンを表示する |
| GlossaryPage | ナビゲーション | ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる |

## TacticsViewerPage.test.tsx

| describe | テストケース |
| --- | --- |
| TacticsViewerPage | チームロード中はローディング画面を表示する |
| TacticsViewerPage | フォーメーションロード中はローディング画面を表示する |
| TacticsViewerPage | チーム選択済みの場合、メイン画面を描画する |
| TacticsViewerPage | TacticsSidebarSection が表示される |
| TacticsViewerPage | TacticsMainContent が表示される |
| TacticsViewerPage | チーム未選択かつ selectedTeamId がない場合、チーム選択画面を表示する |
| TacticsViewerPage | showTeamSelection が true の場合、チーム選択画面を表示する |
| TacticsViewerPage | selectedTeamId はあるが selectedTeam が null の場合、更新中ローディングを表示する |

## TeamManualPage.test.tsx

| describe | context | テストケース |
| --- | --- | --- |
| TeamManualPage | 空のマニュアル一覧 | マニュアルが空のとき空メッセージが表示される |
| TeamManualPage | 空のマニュアル一覧 | ページタイトルが表示される |
| TeamManualPage | 空のマニュアル一覧 | 作成ボタンが表示される |
| TeamManualPage | 空のマニュアル一覧 | インポートボタンが表示される |
| TeamManualPage | 空のマニュアル一覧 | ホームへ戻るボタンが表示される |
| TeamManualPage | マニュアルが存在する場合 | マニュアル名が表示される |
| TeamManualPage | マニュアルが存在する場合 | マニュアルの説明が表示される |
| TeamManualPage | マニュアルが存在する場合 | セクション数バッジが表示される |
| TeamManualPage | マニュアルが存在する場合 | 空メッセージは表示されない |
| TeamManualPage | マニュアルが存在する場合 | マニュアルをクリックすると詳細画面が表示される |
| TeamManualPage | マニュアルが存在する場合 | 詳細画面から戻るボタンで一覧に戻る |
| TeamManualPage | マニュアルが存在する場合 | 削除ボタンをクリックすると確認ダイアログを表示して削除する |
| TeamManualPage | マニュアルが存在する場合 | エクスポートボタンをクリックするとクリップボードにコピーする |
| TeamManualPage | マニュアルが存在する場合 | 編集ボタンをクリックするとフォームモーダルが表示される |
| TeamManualPage | 作成フロー | 作成ボタンでモーダルが開き保存できる |
| TeamManualPage | 作成フロー | インポートボタンでモーダルが開く |
| TeamManualPage | 作成フロー | インポートモーダルからインポートを実行する |
| TeamManualPage | ローディング状態 | isLoading 時にスケルトンを表示する |
| TeamManualPage | ナビゲーション | ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる |

## ProgrammingLessonPage.test.tsx

| describe | テストケース |
| --- | --- |
| ProgrammingLessonPage | 有効なlessonId「variables」で対応するレッスンコンポーネントがレンダリングされる |
| ProgrammingLessonPage | 有効なlessonId「arrays」で対応するレッスンコンポーネントがレンダリングされる |
| ProgrammingLessonPage | 有効なlessonId「conditionals」で対応するレッスンコンポーネントがレンダリングされる |
| ProgrammingLessonPage | 無効なlessonIdでcode-labにリダイレクトされる |
| ProgrammingLessonPage | lessonIdが未定義の場合リダイレクトされる |

## CodeLabPage.test.tsx

| describe | テストケース |
| --- | --- |
| CodeLabPage | ページタイトルが表示される |
| CodeLabPage | サブタイトルと説明が表示される |
| CodeLabPage | ホームへ戻るボタンが表示される |
| CodeLabPage | ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる |
| CodeLabPage | プログラミング基礎とアーキテクチャの2つのカテゴリを表示する |
| CodeLabPage | 6つのプログラミング基礎レッスンカードを表示する |
| CodeLabPage | 6つのアーキテクチャレッスンカードを表示する |
| CodeLabPage | 各レッスンの説明文を表示する |
| CodeLabPage | 全レッスンが Ready 状態である |
| CodeLabPage | テスト入門カテゴリを表示する |
| CodeLabPage | プログラミング基礎レッスンをクリックするとレッスンページに遷移する |
| CodeLabPage | main 要素に id='main-content' がある |
| CodeLabPage | 装飾アイコンに aria-hidden が設定されている |
