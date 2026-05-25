/**
 * @module translations
 * @description 多言語翻訳の型定義とリソース管理。日本語・英語のロケールJSONを統合し、型安全な翻訳キーと翻訳関数の型を提供する。
 */
import ja from "./locales/ja.json";
import en from "./locales/en.json";

export type TranslationKey = keyof typeof ja;
export type TranslationFn = (key: TranslationKey) => string;

// en.json が ja.json と同じキーを持つことを型レベルで保証する
// キーが不足している場合はコンパイルエラーになる
const _enKeyCheck: Record<TranslationKey, string> = en;
void _enKeyCheck;

export const translations = { ja, en } as const;
