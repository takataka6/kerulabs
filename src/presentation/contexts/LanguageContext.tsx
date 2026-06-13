/**
 * @module LanguageContext
 * @description 多言語対応のContext Provider。言語切替と翻訳関数(t/tDynamic)を提供する。
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { translations, TranslationKey } from "@shared/i18n/translations";
import { getContainer } from "@application/ServiceContainer";

export type Language = "ja" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  tDynamic: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components -- フックは対応する Context と同じファイルに配置する必要がある
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    return getContainer().preferencesService.get("language");
  });

  useEffect(() => {
    getContainer().preferencesService.set("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] ?? key;
    },
    [language],
  );

  const tDynamic = useCallback(
    (key: string): string => {
      return (translations[language] as Record<string, string>)[key] ?? key;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, tDynamic }),
    [language, setLanguage, t, tDynamic],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
