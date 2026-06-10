# Code Lab コンポーネント テストケース一覧

## CodeBlock.test.tsx

| describe | テストケース |
| --- | --- |
| CodeBlock | コードが行ごとに表示される |
| CodeBlock | 行番号が表示される |
| CodeBlock | ハイライト行にCSSクラスが適用される |
| CodeBlock | highlightLinesが未指定の場合はハイライトなし |
| CodeBlock | 空のコードが正しく表示される |
| CodeBlock | 複数行のコードが正しく分割される |

## LessonCard.test.tsx

| describe | テストケース |
| --- | --- |
| LessonCard | タイトルと説明が表示される |
| LessonCard | レッスン番号が表示される |
| LessonCard | 利用可能なレッスンをクリックすると onClick が呼ばれる |
| LessonCard | 利用不可のレッスンは disabled になる |
| LessonCard | 利用不可のレッスンは Coming Soon を表示する |
| LessonCard | 利用可能なレッスンは Ready を表示する |
| LessonCard | マウスホバーで onHover が呼ばれる |
| LessonCard | マウスリーブで onLeave が呼ばれる |
| LessonCard | アニメーション遅延が index に基づいて設定される |
| LessonCard | アイコンに aria-hidden が設定されている |

## LessonLayout.test.tsx

| describe | テストケース |
| --- | --- |
| LessonLayout | children が正しくレンダリングされる |
| LessonLayout | 「戻る」ボタンが表示される |
| LessonLayout | 最初のレッスンでは「前へ」ボタンが表示されない |
| LessonLayout | 最後のレッスンでは「次へ」ボタンが表示されない |
| LessonLayout | 中間のレッスンでは前後のナビゲーションが表示される |
| LessonLayout | 「戻る」ボタンをクリックすると /code-lab に遷移する |
| LessonLayout | 「次へ」ボタンをクリックすると次のレッスンに遷移する |
| LessonLayout | 「前へ」ボタンをクリックすると前のレッスンに遷移する |

## LessonSection.test.tsx

| describe | テストケース |
| --- | --- |
| LessonSection | カテゴリタイトルが表示される |
| LessonSection | 説明キーが指定された場合に説明が表示される |
| LessonSection | 説明キーが未指定の場合は説明が表示されない |
| LessonSection | レッスンカードが表示される |
| LessonSection | レッスンカードをクリックすると onClick が呼ばれる |
| LessonSection | indexOffset が正しくカードに適用される |
| LessonSection | カスタム className が適用される |

## lessonInteractions.test.tsx

| describe | テストケース |
| --- | --- |
| VariablesLesson interactions | should update player name on input change |
| VariablesLesson interactions | should update player number on input change |
| VariablesLesson interactions | should toggle isStarter on button click |
| ArraysLesson interactions | should filter by position when clicking filter buttons |
| ArraysLesson interactions | should change visible count with range slider |
| ArraysLesson interactions | should filter by DF position |
| ArraysLesson interactions | should filter by MF position |
| ArraysLesson interactions | should filter by FW position |
| ConditionalsLesson interactions | should update attacker position with range slider |
| ConditionalsLesson interactions | should show onside when attacker is behind defense line |
| FunctionsLesson interactions | should switch to 4-4-2 formation on button click |
| FunctionsLesson interactions | should switch to 3-5-2 formation on button click |
| FunctionsLesson interactions | should render 11 player markers for each formation |
| ObjectsLesson interactions | should display player properties when a player button is clicked |
| ObjectsLesson interactions | should switch selected player when clicking a different player |
| JSONLesson interactions | should update textarea content on change |
| JSONLesson interactions | should parse valid JSON and update player markers on parse button click |
| JSONLesson interactions | should show error on invalid JSON |
| JSONLesson interactions | should show error when JSON is not an array |
| MarkdownLesson interactions | should switch to Lists section when clicking tab button |
| MarkdownLesson interactions | should switch to Code section |
| MarkdownLesson interactions | should switch to Tables section |
| MarkdownLesson interactions | should switch to Links section |
| MarkdownLesson interactions | should switch to README example section |
| MermaidLesson interactions | should switch to Sequence Diagram tab |
| MermaidLesson interactions | should switch to custom diagram tab and show textarea |
| MermaidLesson interactions | should allow editing custom diagram text |
| GitBasicsLesson interactions | should switch to Stage step |
| GitBasicsLesson interactions | should switch to Commit step |
| GitBasicsLesson interactions | should switch to Push step |
| GitBranchLesson interactions | should switch to Create & Switch view |
| GitBranchLesson interactions | should switch to Pull Request view |
| GitBranchLesson interactions | should switch to Conflicts view |
| GitHooksLesson interactions | should switch to Husky tab |
| GitHooksLesson interactions | should switch to lint-staged tab |
| GitHooksLesson interactions | should switch to Execution Flow tab |
| GitHooksLesson interactions | should switch to On Failure tab |
| GitHooksLesson interactions | should switch to Hooks vs CI tab |
| CleanArchitectureLesson interactions | should select Application layer on button click |
| CleanArchitectureLesson interactions | should select Infrastructure layer on button click |
| CleanArchitectureLesson interactions | should select Presentation layer on button click |
| DomainModelLesson interactions | should switch to Value Object tab |
| DomainModelLesson interactions | should switch to Type-safe ID tab |
| DomainModelLesson interactions | should show validation error when name is empty in EntityDemo |
| DomainModelLesson interactions | should show validation error when number is out of range in EntityDemo |
| DomainModelLesson interactions | should show success when valid values are entered in EntityDemo |
| SingletonLesson interactions | should create one instance in singleton mode when clicking caller buttons |
| SingletonLesson interactions | should create multiple instances in new mode |
| SingletonLesson interactions | should reset instances when clicking reset button |
| FactoryLesson interactions | should switch to REST API implementation |
| FactoryLesson interactions | should switch to InMemory implementation |
| FactoryLesson interactions | should default to IndexedDB implementation |
| FirstTestLesson interactions | should update test name input and re-run simulated tests |
| FirstTestLesson interactions | should update test number input and show failure for out-of-range |
| FirstTestLesson interactions | should show all tests passing with valid input |
| MockTestLesson interactions | should switch to Create Mock step |
| MockTestLesson interactions | should switch to Use in Test step |
| MockTestLesson interactions | should switch to Why It Works step |
| CILesson interactions | should switch to CI Steps tab |
| CILesson interactions | should switch to E2E Tests tab |
| CILesson interactions | should switch to Accessibility tab in CI |
| CILesson interactions | should switch to Security tab |
| CILesson interactions | should start CI simulation when clicking run button |

## lessons.test.tsx

| describe | テストケース |
| --- | --- |
| Lessons スモークテスト | $name がクラッシュせずにレンダリングされる（ArraysLesson, CILesson, CleanArchitectureLesson, ConditionalsLesson, DomainModelLesson, FactoryLesson, FirstTestLesson, FunctionsLesson, GitBasicsLesson, GitBranchLesson, GitHooksLesson, JSONLesson, MarkdownLesson, MermaidLesson, MockTestLesson, ObjectsLesson, SingletonLesson, VariablesLesson） |
