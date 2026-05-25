# ADR-0008: カスタム i18n 実装

## ステータス

採用済み

## コンテキスト

日本語・英語の 2 言語対応が必要。候補：

- **i18next + react-i18next**: 豊富な機能（名前空間、プラグイン、動的読み込み）
- **カスタム実装**: JSON 翻訳ファイル + React Context + TypeScript 型推論

## 決定

2 言語のみの要件に対し、シンプルなカスタム実装を選択する。

```typescript
// translations.ts
export type TranslationKey = keyof typeof ja;
export type TranslationFn = (key: TranslationKey) => string;
```

- `LanguageContext` で翻訳関数 `t()` を提供
- 翻訳キーは TypeScript のリテラル型で型安全

## 結果

### メリット
- i18next の依存を排除（バンドルサイズ削減）
- 翻訳キーのタイポを TypeScript がコンパイル時に検出
- 設定・プラグインの複雑さがゼロ
- IDE の補完が効く

### トレードオフ
- 3 言語以上への拡張時にスケーラビリティの懸念
- 複数形・日付フォーマット等の高度な機能は手動実装が必要
