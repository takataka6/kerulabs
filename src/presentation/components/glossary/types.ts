/**
 * @module glossary/types
 * @description 用語集コンポーネント共通の型定義。翻訳関数型とフォームデータ型を提供する。
 */
import type { TranslationFn } from "@shared/i18n/translations";

export type TFunc = TranslationFn;

export interface TermFormData {
  term: string;
  reading?: string;
  description: string;
  keywords: string[];
}
