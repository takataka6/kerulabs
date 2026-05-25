# Shared Constants テストケース一覧

## countries.test.ts

| describe | テストケース |
| --- | --- |
| countries | COUNTRIES に複数の国が定義されている |
| countries | 各国に code / nameJa / nameEn / flag が含まれる |
| countries | 日本（JP）が含まれている |
| countries | FLAG_EMOJI に 10 件のフラグが定義されている |
| countries | FLAG_EMOJI の japan キーが 🇯🇵 を返す |
| countries | 日本語名で検索すると対応する国情報を返す |
| countries | 英語名で検索すると対応する国情報を返す |
| countries | 日本語名で検索して英語で取得できる |
| countries | 存在しない国名の場合 🌍 フラグとそのまま名前を返す |

## formations.test.ts

| describe | テストケース |
| --- | --- |
| getFormationOptions | footballモードでサッカーフォーメーションを返す |
| getFormationOptions | futsalモードでフットサルフォーメーションを返す |
| getFormationOptions | eight_asideモードで8人制フォーメーションを返す |
| getFormationOptions | societyモードでソサイチフォーメーションを返す |

## pitchConfig.test.ts

| describe | テストケース |
| --- | --- |
| pitchConfig | FOOTBALL_CONFIG は 11 人制で fieldWidth=10, fieldLength=12 |
| pitchConfig | FUTSAL_CONFIG は 5 人制で fieldWidth=8, fieldLength=6 |
| pitchConfig | EIGHT_ASIDE_CONFIG は 8 人制 |
| pitchConfig | SOCIETY_CONFIG は 7 人制 |
| pitchConfig | 各コンフィグの fieldBounds が対称になっている |
| pitchConfig | 各コンフィグの halfWidth / halfLength が正しい |
| pitchConfig | getPitchConfig("football") が FOOTBALL_CONFIG を返す |
| pitchConfig | getPitchConfig("futsal") が FUTSAL_CONFIG を返す |
| pitchConfig | getPitchConfig("eight_aside") が EIGHT_ASIDE_CONFIG を返す |
| pitchConfig | getPitchConfig("society") が SOCIETY_CONFIG を返す |
| pitchConfig | 不明なモードでは FOOTBALL_CONFIG をデフォルトとして返す |

## positionColors.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| positionColors | getPositionBg | 無効なポジションではデフォルトフォールバック bg-gray-500 を返す |
| positionColors | getPositionBg | undefined ではデフォルトフォールバック bg-gray-500 を返す |
| positionColors | getPositionBg | カスタムフォールバックを指定できる |
| positionColors | getPositionBorder | 無効なポジションではデフォルトフォールバック border-gray-500 を返す |
| positionColors | getPositionBorder | undefined ではデフォルトフォールバック border-gray-500 を返す |
| positionColors | getPositionBorder | カスタムフォールバックを指定できる |
| positionColors | getPositionBgDark | 無効なポジションではフォールバック bg-gray-600/60 を返す |
| positionColors | getPositionBgDark | undefined ではフォールバック bg-gray-600/60 を返す |
| positionColors | getPositionBorderDark | 無効なポジションではフォールバック border-gray-900/30 を返す |
| positionColors | getPositionBorderDark | undefined ではフォールバック border-gray-900/30 を返す |

## queryKeys.test.ts

| describe | context | テストケース |
| --- | --- | --- |
| queryKeys | teams | all は ["teams"] を返す |
| queryKeys | teams | detail(id) は ["teams", id] を返す |
| queryKeys | formations | all は ["formations"] を返す |
| queryKeys | formations | detail(id) は ["formations", id] を返す |
| queryKeys | formations | byType(type) は ["formations", "type", type] を返す |
| queryKeys | tactics | all は ["tactics"] を返す |
| queryKeys | tactics | detail(id) は ["tactics", id] を返す |
| queryKeys | tactics | byPhase(phase) は ["tactics", "phase", phase] を返す |
| queryKeys | tactics | byPhaseAndFormation(phase, formation) は ["tactics", "phase", phase, "formation", formation] を返す |
| queryKeys | preferences | current は ["preferences"] を返す |
| queryKeys | glossaries | all は ["glossaries"] を返す |
| queryKeys | glossaries | detail(id) は ["glossaries", id] を返す |
| queryKeys | teamManuals | all は ["teamManuals"] を返す |
| queryKeys | teamManuals | detail(id) は ["teamManuals", id] を返す |
