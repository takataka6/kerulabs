import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { translations } from "@shared/i18n/translations";
import { HomePage } from "@presentation/pages/HomePage";
import {
  LanguageProvider,
  useLanguage,
} from "@presentation/contexts/LanguageContext";
import {
  ConfirmProvider,
  ErrorBoundary,
  LogViewer,
  ToastProvider,
} from "@presentation/components/ui";
import { useAppInitialization } from "@presentation/hooks/useAppInitialization";

/* ------------------------------------------------------------------ */
/*  遅延ロード — 重いページをチャンク分割                                  */
/* ------------------------------------------------------------------ */
const TacticsViewerPage = lazy(() =>
  import("@presentation/pages/TacticsViewerPage").then((m) => ({
    default: m.TacticsViewerPage,
  })),
);
const GlossaryPage = lazy(() =>
  import("@presentation/pages/GlossaryPage").then((m) => ({
    default: m.GlossaryPage,
  })),
);
const CodeLabPage = lazy(() =>
  import("@presentation/pages/CodeLabPage").then((m) => ({
    default: m.CodeLabPage,
  })),
);
const ProgrammingLessonPage = lazy(() =>
  import("@presentation/pages/ProgrammingLessonPage").then((m) => ({
    default: m.ProgrammingLessonPage,
  })),
);
const PluginLessonPageRoute = lazy(() =>
  import("@presentation/pages/PluginLessonPageRoute").then((m) => ({
    default: m.PluginLessonPageRoute,
  })),
);
const PluginManagerPage = lazy(() =>
  import("@presentation/pages/PluginManagerPage").then((m) => ({
    default: m.PluginManagerPage,
  })),
);
const TeamManualPage = lazy(() =>
  import("@presentation/pages/TeamManualPage").then((m) => ({
    default: m.TeamManualPage,
  })),
);

function PageLoader() {
  return (
    <div className="flex-1 min-h-screen bg-slate-900 flex items-center justify-center">
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        aria-hidden="true"
      />
    </div>
  );
}

function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      // focus:z-[100] = Z_INDEX.TOAST (see shared/constants/zIndex.ts)
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
    >
      {t("a11y.skipToContent")}
    </a>
  );
}

export function App() {
  const { isInitialized, initError } = useAppInitialization();
  const [showLogViewer, setShowLogViewer] = useState(false);

  // Ctrl+Shift+L で LogViewer をトグル
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "L") {
        e.preventDefault();
        setShowLogViewer((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (initError) {
    const isJa = navigator.language.startsWith("ja");
    return (
      <div
        role="alert"
        className="w-full h-screen bg-slate-900 flex items-center justify-center"
      >
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-white mb-2">KeruLabs</h1>
          <p className="text-red-400 mb-4">
            {isJa
              ? "データベースの初期化に失敗しました"
              : "Failed to initialize database"}
          </p>
          <p className="text-slate-500 text-sm mb-6">{initError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            {isJa ? "再読み込み" : "Reload"}
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div
        role="status"
        aria-label="Initializing database"
        className="w-full h-screen bg-slate-900 flex items-center justify-center"
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <h1 className="text-2xl font-bold text-white mb-2">KeruLabs</h1>
          <p className="text-slate-400 mb-4">Football Tactics & Code Lab</p>
          <p className="text-slate-500 text-sm">
            {navigator.language.startsWith("ja")
              ? translations.ja["app.loading"]
              : translations.en["app.loading"]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <ToastProvider>
        <ConfirmProvider>
          <SkipLink />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/tactics-simulator"
                  element={
                    <ErrorBoundary inline>
                      <TacticsViewerPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/glossary"
                  element={
                    <ErrorBoundary inline>
                      <GlossaryPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/team-manual"
                  element={
                    <ErrorBoundary inline>
                      <TeamManualPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/code-lab"
                  element={
                    <ErrorBoundary inline>
                      <CodeLabPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/code-lab/lesson/plugin/:lessonId"
                  element={
                    <ErrorBoundary inline>
                      <PluginLessonPageRoute />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/code-lab/lesson/:lessonId"
                  element={
                    <ErrorBoundary inline>
                      <ProgrammingLessonPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/plugins"
                  element={
                    <ErrorBoundary inline>
                      <PluginManagerPage />
                    </ErrorBoundary>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </ConfirmProvider>
      </ToastProvider>
      {showLogViewer && <LogViewer onClose={() => setShowLogViewer(false)} />}
    </LanguageProvider>
  );
}
