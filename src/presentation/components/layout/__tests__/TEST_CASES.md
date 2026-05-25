# Layout コンポーネント テストケース一覧

## PageHeader.test.tsx

| describe | テストケース |
| --- | --- |
| PageHeader | タイトルが表示される |
| PageHeader | アイコンが aria-hidden で表示される |
| PageHeader | サブタイトルが表示される |
| PageHeader | 説明が表示される |
| PageHeader | サブタイトル/説明が省略可能 |
| PageHeader | ホームへ戻るボタンをクリックすると navigate('/') が呼ばれる |

## PageShell.test.tsx

| describe | テストケース |
| --- | --- |
| PageShell | children を表示する |
| PageShell | main 要素に id='main-content' がある |
| PageShell | main 要素に tabIndex=-1 がある |
| PageShell | デフォルトで2つの背景オーブが表示される |
| PageShell | backgroundOrbs を空にすると背景が非表示になる |
| PageShell | カスタム backgroundOrbs を指定できる |
| PageShell | className を追加できる |
| PageShell | overlay が表示される |
| PageShell | contentClassName でコンテンツラッパーのクラスを上書きできる |
