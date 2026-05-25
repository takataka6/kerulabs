/**
 * @module ErrorBoundary
 * @description Reactエラーバウンダリコンポーネント。子コンポーネントのレンダリングエラーをキャッチしフォールバックUIを表示する。
 */
import { Component, ReactNode, useState } from "react";
import { translations } from "@shared/i18n/translations";
import { handleError } from "@shared/errors/handleError";
import { getContainer } from "@application/ServiceContainer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ErrorBoundaryProps {
  children: ReactNode;
  /** カスタムフォールバックUI */
  fallback?: ReactNode;
  /** ページ単位で使う場合 true — 全画面表示ではなくインライン表示 */
  inline?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/* ------------------------------------------------------------------ */
/*  Utility: 言語取得（class component 用）                              */
/* ------------------------------------------------------------------ */
function getLanguage(): "ja" | "en" {
  try {
    return getContainer().preferencesService.get("language");
  } catch {
    return "ja";
  }
}

function t(key: keyof typeof translations.ja): string {
  const lang = getLanguage();
  return (translations[lang] as Record<string, string>)[key] ?? key;
}

/* ------------------------------------------------------------------ */
/*  ErrorFallback — フォールバック UI                                    */
/* ------------------------------------------------------------------ */
function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  inline,
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onRetry: () => void;
  inline?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  const containerClass = inline
    ? "flex-1 bg-slate-900 flex items-center justify-center p-8"
    : "min-h-screen bg-slate-900 flex items-center justify-center p-8";

  return (
    <div role="alert" className={containerClass}>
      <div className="text-center max-w-lg">
        {/* アイコン */}
        <div className="text-5xl mb-4" aria-hidden="true">
          ⚠️
        </div>

        {/* タイトル */}
        <h1 className="text-2xl font-bold text-red-400 mb-3">
          {t("error.title")}
        </h1>

        {/* 説明 */}
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {t("error.description")}
        </p>

        {/* アクションボタン */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={onRetry}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {t("error.retry")}
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {t("error.goHome")}
          </a>
        </div>

        {/* 開発モード: エラー詳細 */}
        {isDev && error && (
          <div className="text-left">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2 underline underline-offset-2"
            >
              {t("error.details")} {showDetails ? "▲" : "▼"}
            </button>
            {showDetails && (
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700 overflow-auto max-h-64 text-xs text-left">
                <p className="text-red-400 font-mono font-bold mb-2">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-slate-400 font-mono whitespace-pre-wrap break-words text-[11px] leading-relaxed">
                    {error.stack}
                  </pre>
                )}
                {errorInfo?.componentStack && (
                  <>
                    <p className="text-slate-500 font-mono font-bold mt-3 mb-1">
                      Component Stack:
                    </p>
                    <pre className="text-slate-500 font-mono whitespace-pre-wrap break-words text-[11px] leading-relaxed">
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ErrorBoundary — Class Component                                    */
/* ------------------------------------------------------------------ */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    handleError(error, "ui", "ErrorBoundary caught", {
      meta: { componentStack: errorInfo.componentStack },
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          inline={this.props.inline}
        />
      );
    }
    return this.props.children;
  }
}
