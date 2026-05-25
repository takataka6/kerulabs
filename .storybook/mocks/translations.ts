import ja from "../../src/shared/i18n/locales/ja.json";
import type { TranslationKey } from "@shared/i18n/translations";

export const mockT = (key: TranslationKey): string =>
  (ja as Record<string, string>)[key] ?? key;

/** 動的キー用の翻訳モック（TranslationKey以外のキーも受け付ける） */
export const mockTDynamic = (key: string): string =>
  (ja as Record<string, string>)[key] ?? key;
