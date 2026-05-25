/**
 * @module CodeLabPage
 * @description コードラボのレッスン一覧を表示するページコンポーネント。プログラミング基礎とアーキテクチャの2カテゴリでレッスンカードを表示する。
 */
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { PageShell, PageHeader } from "@presentation/components/layout";
import { LessonSection } from "@presentation/components/code-lab/LessonSection";
import type { Lesson } from "@presentation/components/code-lab/LessonCard";
import {
  CodeLabPageIcon,
  PluginIcon,
} from "@presentation/components/ui/LineIcons";
import type { TranslationKey } from "@shared/i18n/translations";
import { usePluginLessons } from "@presentation/hooks/queries/usePlugins";

interface LessonCategoryConfig {
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  lessons: Lesson[];
}

export function CodeLabPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { data: pluginLessons } = usePluginLessons();

  const categories: LessonCategoryConfig[] = useMemo(
    () => [
      {
        titleKey: "code.lab.category.programmingBasics",
        descriptionKey: "code.lab.category.programmingBasics.description",
        lessons: [
          {
            id: "variables",
            number: 1,
            title: t("code.lab.lesson.variables"),
            description: t("code.lab.lesson.variables.description"),
            icon: "🏷️",
            gradient: "from-emerald-600 to-teal-500",
            available: true,
          },
          {
            id: "arrays",
            number: 2,
            title: t("code.lab.lesson.arrays"),
            description: t("code.lab.lesson.arrays.description"),
            icon: "👥",
            gradient: "from-sky-600 to-blue-500",
            available: true,
          },
          {
            id: "conditionals",
            number: 3,
            title: t("code.lab.lesson.conditionals"),
            description: t("code.lab.lesson.conditionals.description"),
            icon: "🚩",
            gradient: "from-red-600 to-orange-500",
            available: true,
          },
          {
            id: "functions",
            number: 4,
            title: t("code.lab.lesson.functions"),
            description: t("code.lab.lesson.functions.description"),
            icon: "🔄",
            gradient: "from-violet-600 to-purple-500",
            available: true,
          },
          {
            id: "objects",
            number: 5,
            title: t("code.lab.lesson.objects"),
            description: t("code.lab.lesson.objects.description"),
            icon: "📋",
            gradient: "from-amber-600 to-yellow-500",
            available: true,
          },
        ],
      },
      {
        titleKey: "code.lab.category.fileFormats",
        descriptionKey: "code.lab.category.fileFormats.description",
        lessons: [
          {
            id: "json",
            number: 1,
            title: t("code.lab.lesson.json"),
            description: t("code.lab.lesson.json.description"),
            icon: "📄",
            gradient: "from-amber-600 to-orange-500",
            available: true,
          },
          {
            id: "markdown",
            number: 2,
            title: t("code.lab.lesson.markdown"),
            description: t("code.lab.lesson.markdown.description"),
            icon: "📝",
            gradient: "from-slate-600 to-gray-500",
            available: true,
          },
          {
            id: "mermaid",
            number: 3,
            title: t("code.lab.lesson.mermaid"),
            description: t("code.lab.lesson.mermaid.description"),
            icon: "🧜",
            gradient: "from-pink-600 to-fuchsia-500",
            available: true,
          },
        ],
      },
      {
        titleKey: "code.lab.category.git",
        descriptionKey: "code.lab.category.git.description",
        lessons: [
          {
            id: "git-basics",
            number: 1,
            title: t("code.lab.lesson.gitBasics"),
            description: t("code.lab.lesson.gitBasics.description"),
            icon: "📚",
            gradient: "from-orange-600 to-red-500",
            available: true,
          },
          {
            id: "git-branch",
            number: 2,
            title: t("code.lab.lesson.gitBranch"),
            description: t("code.lab.lesson.gitBranch.description"),
            icon: "🌿",
            gradient: "from-emerald-600 to-green-500",
            available: true,
          },
        ],
      },
      {
        titleKey: "code.lab.category.architecture",
        lessons: [
          {
            id: "clean-architecture",
            number: 1,
            title: t("code.lab.lesson.cleanArchitecture"),
            description: t("code.lab.lesson.cleanArchitecture.description"),
            icon: "🏗️",
            gradient: "from-blue-600 to-cyan-500",
            available: true,
          },
          {
            id: "domain-model",
            number: 2,
            title: t("code.lab.lesson.domainModel"),
            description: t("code.lab.lesson.domainModel.description"),
            icon: "📦",
            gradient: "from-amber-600 to-yellow-500",
            available: true,
          },
          {
            id: "singleton",
            number: 3,
            title: t("code.lab.lesson.singleton"),
            description: t("code.lab.lesson.singleton.description"),
            icon: "🔒",
            gradient: "from-slate-600 to-zinc-500",
            available: true,
          },
          {
            id: "factory",
            number: 4,
            title: t("code.lab.lesson.factory"),
            description: t("code.lab.lesson.factory.description"),
            icon: "🏭",
            gradient: "from-teal-600 to-cyan-500",
            available: true,
          },
        ],
      },
      {
        titleKey: "code.lab.category.testing",
        descriptionKey: "code.lab.category.testing.description",
        lessons: [
          {
            id: "first-test",
            number: 1,
            title: t("code.lab.lesson.firstTest"),
            description: t("code.lab.lesson.firstTest.description"),
            icon: "🧪",
            gradient: "from-cyan-600 to-teal-500",
            available: true,
          },
          {
            id: "mock-test",
            number: 2,
            title: t("code.lab.lesson.mockTest"),
            description: t("code.lab.lesson.mockTest.description"),
            icon: "🎭",
            gradient: "from-fuchsia-600 to-pink-500",
            available: true,
          },
          {
            id: "ui-test",
            number: 3,
            title: t("code.lab.lesson.uiTest"),
            description: t("code.lab.lesson.uiTest.description"),
            icon: "🖥️",
            gradient: "from-lime-600 to-green-500",
            available: true,
          },
        ],
      },
    ],
    [t],
  );

  // プラグインレッスンをカテゴリとして追加
  const pluginCategory: LessonCategoryConfig | null = useMemo(() => {
    if (!pluginLessons || pluginLessons.length === 0) return null;
    return {
      titleKey: "code.lab.plugin.category" as TranslationKey,
      descriptionKey: "code.lab.plugin.category.description" as TranslationKey,
      lessons: pluginLessons.map((p, i) => ({
        id: `plugin:${p.data.lessonId}`,
        number: i + 1,
        title: p.data.title[language] || p.data.title.ja,
        description: p.data.description[language] || p.data.description.ja,
        icon: p.data.icon,
        gradient: p.data.gradient,
        available: true,
      })),
    };
  }, [pluginLessons, language]);

  const allCategories = useMemo(() => {
    if (pluginCategory) return [...categories, pluginCategory];
    return categories;
  }, [categories, pluginCategory]);

  const handleLessonClick = useCallback(
    (lessonId: string) => {
      if (lessonId.startsWith("plugin:")) {
        const pluginLessonId = lessonId.replace("plugin:", "");
        navigate(`/code-lab/lesson/plugin/${pluginLessonId}`);
      } else {
        navigate(`/code-lab/lesson/${lessonId}`);
      }
    },
    [navigate],
  );

  const handleLeave = useCallback(() => setHoveredCard(null), []);

  const comingSoonLabel = t("code.lab.comingSoon");

  // セクションごとのアニメーション遅延用のオフセットを累積計算
  const indexOffsets = useMemo(() => {
    const offsets: number[] = [0];
    for (let i = 0; i < allCategories.length - 1; i++) {
      offsets.push(offsets[i] + allCategories[i].lessons.length);
    }
    return offsets;
  }, [allCategories]);

  return (
    <PageShell
      backgroundOrbs={[
        { color: "bg-purple-500/10", position: "top-left" },
        { color: "bg-blue-500/10", position: "bottom-right" },
      ]}
    >
      <PageHeader
        icon={<CodeLabPageIcon className="h-full w-full text-purple-400" />}
        titleKey="code.lab"
        subtitleKey="code.lab.subtitle"
        descriptionKey="code.lab.description"
      />

      {/* プラグインが無い場合のプラグイン管理への導線 */}
      {!pluginCategory && (
        <div className="max-w-7xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
            <div>
              <p className="text-white text-sm font-semibold">
                {t("code.lab.plugin.category")}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {t("code.lab.plugin.empty")}
              </p>
            </div>
            <button
              onClick={() => navigate("/plugins")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <PluginIcon className="h-4 w-4 shrink-0" />
              {t("code.lab.plugin.manager")}
            </button>
          </div>
        </div>
      )}

      {allCategories.map((category, i) => (
        <LessonSection
          key={category.titleKey}
          titleKey={category.titleKey}
          descriptionKey={category.descriptionKey}
          lessons={category.lessons}
          indexOffset={indexOffsets[i]}
          hoveredCard={hoveredCard}
          onHover={setHoveredCard}
          onLeave={handleLeave}
          onClick={handleLessonClick}
          comingSoonLabel={comingSoonLabel}
          t={t}
          className={i === allCategories.length - 1 ? "" : "mb-12 sm:mb-16"}
          headerAction={
            category === pluginCategory ? (
              <button
                onClick={() => navigate("/plugins")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <PluginIcon className="h-4 w-4 shrink-0" />
                {t("code.lab.plugin.manager")}
              </button>
            ) : undefined
          }
        />
      ))}
    </PageShell>
  );
}
