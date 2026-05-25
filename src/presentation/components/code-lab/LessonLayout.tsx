/**
 * @module LessonLayout
 * @description レッスンページの共通レイアウトコンポーネント。ヘッダー・コンテンツエリア・ナビゲーションを提供する。
 */
import { useNavigate } from "react-router-dom";
import { IS_ELECTRON } from "@shared/constants";
import { useLanguage } from "@presentation/contexts/LanguageContext";

const LESSON_IDS = [
  // プログラミング基礎
  "variables",
  "arrays",
  "conditionals",
  "functions",
  "objects",
  // ファイルフォーマット
  "json",
  "markdown",
  "mermaid",
  // Git 入門
  "git-basics",
  "git-branch",
  // アーキテクチャ
  "clean-architecture",
  "domain-model",
  "singleton",
  "factory",
  // テスト入門
  "first-test",
  "mock-test",
  "ui-test",
] as const;

interface LessonLayoutProps {
  lessonId: string;
  children: React.ReactNode;
}

export function LessonLayout({ lessonId, children }: LessonLayoutProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const currentIndex = LESSON_IDS.indexOf(
    lessonId as (typeof LESSON_IDS)[number],
  );
  const prevId = currentIndex > 0 ? LESSON_IDS[currentIndex - 1] : null;
  const nextId =
    currentIndex < LESSON_IDS.length - 1 ? LESSON_IDS[currentIndex + 1] : null;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto"
    >
      {IS_ELECTRON && (
        <div
          className="absolute top-0 left-0 right-0 h-10 z-30"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        ></div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        {/* ヘッダー */}
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/code-lab")}
            aria-label={t("code.lab.lesson.backToList")}
            className="text-slate-400 hover:text-white transition-colors text-sm"
            {...(IS_ELECTRON && {
              style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
            })}
          >
            ← {t("code.lab.lesson.backToList")}
          </button>
        </header>

        {/* コンテンツ */}
        {children}

        {/* レッスンナビゲーション */}
        <nav className="flex justify-between items-center mt-12 pt-8 border-t border-slate-700">
          {prevId ? (
            <button
              onClick={() => navigate(`/code-lab/lesson/${prevId}`)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← {t("code.lab.lesson.prevLesson")}
            </button>
          ) : (
            <div />
          )}
          {nextId ? (
            <button
              onClick={() => navigate(`/code-lab/lesson/${nextId}`)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {t("code.lab.lesson.nextLesson")} →
            </button>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </main>
  );
}
