# レッスンプラグイン仕様

## 概要

KeruLabs のコードラボに外部レッスンを追加するためのプラグインシステム。
JSON ファイルをインポートすることで、カスタムレッスンをアプリに追加できる。

## プラグインフォーマット

```json
{
  "kerulabs_plugin": "1.0",
  "type": "lesson",
  "metadata": {
    "id": "my-custom-lesson",
    "name": { "ja": "カスタムレッスン", "en": "Custom Lesson" },
    "author": "Author Name",
    "version": "1.0.0",
    "description": { "ja": "説明文", "en": "Description" }
  },
  "data": {
    "lessonId": "my-custom-lesson",
    "category": "custom",
    "title": { "ja": "レッスンタイトル", "en": "Lesson Title" },
    "description": { "ja": "レッスンの説明", "en": "Lesson description" },
    "icon": "📘",
    "gradient": "from-blue-500 to-cyan-500",
    "sections": [...]
  }
}
```

## UX フロー

```
ホーム画面 → コードラボ
  └─ プラグイン管理画面（PluginManagerPage）
       ├─ [インポート] ← .json ファイルを選択
       │    → Zod バリデーション → 重複チェック → IndexedDB に保存
       ├─ インストール済み一覧
       │    └─ 📘 カスタムレッスン（author / version 表示）
       └─ [削除] で個別アンインストール
```

## レッスンカテゴリ

| カテゴリ | 値 | 説明 |
|---------|-----|------|
| プログラミング基礎 | `programming-basics` | 変数、関数、配列、オブジェクト等 |
| ファイルフォーマット | `file-formats` | JSON、Markdown 等 |
| Git | `git` | Git 基礎、ブランチ、フック |
| アーキテクチャ | `architecture` | クリーンアーキテクチャ、ドメインモデル |
| テスト | `testing` | モックテスト、CI/CD |
| カスタム | `custom` | プラグインによる外部レッスン |

## セクションタイプ

レッスンは複数のセクションで構成される。各セクションは `type` フィールドで区別される。

### heading — 見出し

```json
{
  "type": "heading",
  "text": { "ja": "見出しテキスト", "en": "Heading Text" }
}
```

### paragraph — 段落

```json
{
  "type": "paragraph",
  "text": { "ja": "本文テキスト", "en": "Body text" }
}
```

### codeBlock — コードブロック

```json
{
  "type": "codeBlock",
  "language": "typescript",
  "code": "const x = 1;",
  "highlightLines": [1]
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `language` | `string` | 必須 | 言語識別子（`typescript`, `json` 等） |
| `code` | `string` | 必須 | コード文字列 |
| `highlightLines` | `number[]` | 任意 | ハイライトする行番号 |

### miniPitchDemo — 3D ピッチデモ

3D フィールド上に選手を配置して表示する。

```json
{
  "type": "miniPitchDemo",
  "description": { "ja": "4-3-3フォーメーション", "en": "4-3-3 Formation" },
  "cameraPosition": [0, 15, 12],
  "players": [
    { "x": 0, "z": -5, "number": 1, "name": "GK", "color": "#ffcc00" },
    { "x": -3, "z": -2, "number": 2, "color": "#3b82f6" }
  ]
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `description` | `I18nText` | 任意 | デモの説明 |
| `cameraPosition` | `[x, y, z]` | 任意 | カメラ位置（デフォルト自動） |
| `players` | `PlayerDefinition[]` | 必須 | 選手配置 |

`PlayerDefinition`:

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `x` | `number` | 必須 | X 座標 |
| `z` | `number` | 必須 | Z 座標 |
| `number` | `number` | 任意 | 背番号 |
| `name` | `string` | 任意 | 選手名 |
| `color` | `string` | 必須 | マーカー色（HEX） |

### miniPitchSteps — ステップ切替式 3D デモ

複数のステップを切り替えて表示する。

```json
{
  "type": "miniPitchSteps",
  "description": { "ja": "攻守の切替", "en": "Transition" },
  "cameraPosition": [0, 15, 12],
  "steps": [
    {
      "label": { "ja": "攻撃時", "en": "Attacking" },
      "players": [...]
    },
    {
      "label": { "ja": "守備時", "en": "Defending" },
      "players": [...]
    }
  ]
}
```

### interactiveDemo — インタラクティブデモ

ユーザーが UI コントロールで状態を変更し、3D シーンが動的に変化するデモ。

```json
{
  "type": "interactiveDemo",
  "description": { "ja": "フォーメーション比較", "en": "Formation Comparison" },
  "cameraPosition": [0, 15, 12],
  "state": {
    "formation": {
      "type": "string",
      "default": "4-3-3"
    }
  },
  "controls": [
    {
      "type": "buttonGroup",
      "bind": "formation",
      "options": [
        { "value": "4-3-3", "label": { "ja": "4-3-3", "en": "4-3-3" } },
        { "value": "4-4-2", "label": { "ja": "4-4-2", "en": "4-4-2" } }
      ]
    }
  ],
  "scenes": {
    "4-3-3": { "players": [...] },
    "4-4-2": { "players": [...] }
  }
}
```

**状態定義（`StateDefinition`）:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `type` | `"string" \| "number" \| "boolean"` | 値の型 |
| `default` | `string \| number \| boolean` | 初期値 |
| `min` / `max` | `number` | 数値の範囲（任意） |

**UI コントロール:**

| タイプ | 説明 | 主要フィールド |
|--------|------|---------------|
| `buttonGroup` | ボタン選択 | `bind`, `options[].value`, `options[].label` |
| `textInput` | テキスト入力 | `bind`, `maxLength`, `label` |
| `numberInput` | 数値入力 | `bind`, `label` |
| `toggle` | トグルスイッチ | `bind`, `label` |
| `slider` | スライダー | `bind`, `label` |

**シーン定義:**

- `scene` — 単一シーン（状態による選手の色・位置の動的変更に使用）
- `scenes` — 状態値をキーとしたシーンマップ（状態値でシーン全体を切替）

**条件式（`ConditionalValue`）:**

`scene` 内の選手の `color` に条件式を使用できる:

```json
{ "if": "role", "then": "#3b82f6", "else": "#94a3b8" }
```

→ `state.role` の現在値と `if` の値を比較し、`then` / `else` の値を適用。

### mermaidDiagram — Mermaid ダイアグラム

```json
{
  "type": "mermaidDiagram",
  "description": { "ja": "アーキテクチャ図", "en": "Architecture Diagram" },
  "code": "graph TD\n  A[Domain] --> B[Application]"
}
```

## 技術アーキテクチャ

### レイヤー構成

| レイヤー | ファイル | 責務 |
|---------|---------|------|
| Domain | `domain/entities/Plugin.ts` | `Plugin` エンティティ、`LessonSection` 型定義 |
| Domain | `domain/value-objects/PluginId.ts` | プラグイン ID 値オブジェクト |
| Application | `application/use-cases/plugin/PluginInteractor.ts` | CRUD + JSON インポート（バリデーション・重複チェック） |
| Application | `application/ports/input/IPluginInputPort.ts` | Input Port インターフェース |
| Application | `application/ports/output/repositories/IPluginRepository.ts` | Output Port インターフェース |
| Infrastructure | `infrastructure/repositories/indexeddb/IndexedDBPluginRepository.ts` | IndexedDB 永続化 |
| Infrastructure | `infrastructure/schemas/pluginSchema.ts` | Zod バリデーションスキーマ |
| Presentation | `presentation/pages/PluginManagerPage.tsx` | プラグイン管理 UI |
| Presentation | `presentation/pages/PluginLessonPageRoute.tsx` | レッスン表示ルーティング |
| Presentation | `presentation/components/code-lab/plugin/` | レッスン描画コンポーネント群 |
| Presentation | `presentation/hooks/queries/usePlugins.ts` | React Query フック |

### インポートフロー

```
JSON ファイル選択
  → PluginInteractor.importFromJson(json)
    → JSON.parse()
    → pluginManifestSchema.parse()   // Zod バリデーション
    → findByMetadataId()             // 重複チェック（同 ID は上書き）
    → new Plugin(...)                // エンティティ生成
    → pluginRepository.save()        // IndexedDB 保存
    → React Query キャッシュ無効化
```

### 永続化

- IndexedDB の `plugins` オブジェクトストアに保存
- `metadata-id` インデックスによる重複検出

## ライセンスに関する注意

- 本体のライセンスは MIT（GPL 系はプラグインにも伝播するため避ける）
- プラグインは独自ライセンス（有料販売可能）
- プラグイン API の安定性を保証するバージョニング規約が必要
