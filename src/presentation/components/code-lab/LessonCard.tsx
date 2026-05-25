/**
 * @module LessonCard
 * @description CodeLabで使用するレッスンカードコンポーネント。ホバーアニメーション・利用可否状態を表示する。
 */
import { memo } from "react";
import { STAGGER_DELAY_MS } from "@shared/constants";

export interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  available: boolean;
}

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  hoveredCard: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  onClick?: (id: string) => void;
  comingSoonLabel: string;
}

export const LessonCard = memo(function LessonCard({
  lesson,
  index,
  hoveredCard,
  onHover,
  onLeave,
  onClick,
  comingSoonLabel,
}: LessonCardProps) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(lesson.id)}
      onMouseLeave={onLeave}
      onClick={lesson.available ? () => onClick?.(lesson.id) : undefined}
      disabled={!lesson.available}
      className={`group relative p-5 sm:p-8 rounded-2xl border bg-slate-900/50 border-slate-700 transition-all duration-500 text-left animate-slide-in-up hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 ${lesson.available ? "cursor-pointer" : "cursor-default"} disabled:opacity-80`}
      style={{ animationDelay: `${index * STAGGER_DELAY_MS}ms` }}
    >
      {/* グラデーション背景 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${lesson.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
      ></div>

      {/* コンテンツ */}
      <div className="relative z-10">
        {/* レッスン番号 */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${lesson.gradient} text-white`}
          >
            {lesson.number}
          </span>
        </div>

        {/* アイコン */}
        <div
          className={`text-3xl sm:text-5xl mb-3 sm:mb-4 transition-transform duration-500 ${hoveredCard === lesson.id ? "scale-110 rotate-12" : ""}`}
          aria-hidden="true"
        >
          {lesson.icon}
        </div>

        {/* タイトル */}
        <h2 className="text-base sm:text-xl font-bold text-white mb-3 tracking-tight">
          {lesson.title}
        </h2>

        {/* 説明 */}
        <p className="text-slate-400 text-xs leading-relaxed mb-4">
          {lesson.description}
        </p>

        {/* ステータス */}
        <div className="flex items-center gap-2">
          {lesson.available ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-500 text-xs font-semibold">
                Ready
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-500 text-xs font-semibold">
                {comingSoonLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
});
