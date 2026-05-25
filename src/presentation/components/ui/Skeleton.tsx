/**
 * @module Skeleton
 * @description リスト・カードのローディング状態を表示するスケルトンコンポーネント。
 */

interface SkeletonProps {
  className?: string;
}

function SkeletonBlock({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      role="status"
      aria-label="Loading..."
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="p-5 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/50"
        >
          <div className="flex items-center gap-5 mb-4">
            <SkeletonBlock className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-6 w-3/4" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-7 w-16 rounded-lg" />
            <SkeletonBlock className="h-7 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
