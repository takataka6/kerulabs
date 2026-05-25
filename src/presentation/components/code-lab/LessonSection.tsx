/**
 * @module LessonSection
 * @description CodeLabPage内のレッスンカテゴリセクション。タイトル・説明文とレッスンカードグリッドを表示する。
 */
import { memo } from "react";
import type { Lesson } from "./LessonCard";
import { LessonCard } from "./LessonCard";
import type { TranslationFn, TranslationKey } from "@shared/i18n/translations";

interface LessonSectionProps {
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  lessons: Lesson[];
  indexOffset: number;
  hoveredCard: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  onClick: (id: string) => void;
  comingSoonLabel: string;
  t: TranslationFn;
  className?: string;
  /** セクションヘッダー右側に表示するアクション要素 */
  headerAction?: React.ReactNode;
}

export const LessonSection = memo(function LessonSection({
  titleKey,
  descriptionKey,
  lessons,
  indexOffset,
  hoveredCard,
  onHover,
  onLeave,
  onClick,
  comingSoonLabel,
  t,
  className = "mb-12 sm:mb-16",
  headerAction,
}: LessonSectionProps) {
  return (
    <section className={`max-w-7xl mx-auto ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t(titleKey)}
          </h2>
          {headerAction}
        </div>
        {descriptionKey && (
          <p className="text-sm text-slate-400">{t(descriptionKey)}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={indexOffset + index}
            hoveredCard={hoveredCard}
            onHover={onHover}
            onLeave={onLeave}
            onClick={onClick}
            comingSoonLabel={comingSoonLabel}
          />
        ))}
      </div>
    </section>
  );
});
