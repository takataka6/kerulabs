/**
 * @module PageHeader
 * @description ページ共通のヘッダー（戻るボタン＋タイトルセクション）を提供するコンポーネント。
 */
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IS_ELECTRON } from "@shared/constants";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import type { TranslationKey } from "@shared/i18n/translations";

const GITHUB_URL = "https://github.com/takataka6/kerulabs";

interface PageHeaderProps {
  icon: ReactNode;
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  /** 戻り先パス（デフォルト: "/"） */
  backTo?: string;
  /** 戻るボタンのラベル翻訳キー（デフォルト: "tactics.home"） */
  backLabelKey?: TranslationKey;
}

export function PageHeader({
  icon,
  titleKey,
  subtitleKey,
  descriptionKey,
  backTo = "/",
  backLabelKey = "tactics.home",
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
        <button
          onClick={() => navigate(backTo)}
          aria-label={t("a11y.backToHome")}
          className="text-slate-400 hover:text-white transition-colors text-sm"
          {...(IS_ELECTRON && {
            style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
          })}
        >
          ← {t(backLabelKey)}
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-slate-500 hover:text-white transition-colors duration-200 flex items-center gap-1.5"
          {...(IS_ELECTRON && {
            style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
          })}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
          </svg>
          <span className="hidden sm:inline text-xs font-medium">GitHub</span>
        </a>
      </header>

      <div className="text-center mb-8 sm:mb-12">
        <div
          className="mx-auto mb-3 h-16 w-16 text-white/90 sm:mb-4 sm:h-20 sm:w-20"
          aria-hidden="true"
        >
          {icon}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
          {t(titleKey)}
        </h1>
        {subtitleKey && (
          <p className="text-base sm:text-xl text-slate-400 mb-2">
            {t(subtitleKey)}
          </p>
        )}
        {descriptionKey && (
          <p className="text-xs sm:text-sm text-slate-400">
            {t(descriptionKey)}
          </p>
        )}
      </div>
    </>
  );
}
