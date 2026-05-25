/**
 * @module PluginLessonPage
 * @description プラグインで追加されたレッスンを表示するページコンポーネント。
 */
import { useNavigate } from "react-router-dom";
import { IS_ELECTRON } from "@shared/constants";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { usePluginLessons } from "@presentation/hooks/queries/usePlugins";
import { LessonSectionRenderer } from "./LessonSectionRenderer";

interface PluginLessonPageProps {
  lessonId: string;
}

export function PluginLessonPage({ lessonId }: PluginLessonPageProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: plugins } = usePluginLessons();

  const plugin = plugins?.find((p) => p.data.lessonId === lessonId);

  if (!plugin) {
    return (
      <main className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">
            {t("code.lab.plugin.lessonNotFound")}
          </p>
          <button
            onClick={() => navigate("/code-lab")}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            ← {t("code.lab.lesson.backToList")}
          </button>
        </div>
      </main>
    );
  }

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

        {/* プラグインバッジ */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-1 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/30">
            {t("code.lab.plugin.badge")}
          </span>
          <span className="text-xs text-slate-500">
            {plugin.metadata.author} v{plugin.metadata.version}
          </span>
        </div>

        {/* コンテンツ */}
        <LessonSectionRenderer sections={plugin.data.sections} />

        {/* ナビゲーション */}
        <nav className="flex justify-between items-center mt-12 pt-8 border-t border-slate-700">
          <button
            onClick={() => navigate("/code-lab")}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← {t("code.lab.lesson.backToList")}
          </button>
          <div />
        </nav>
      </div>
    </main>
  );
}
