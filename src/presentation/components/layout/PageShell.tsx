/**
 * @module PageShell
 * @description 各ページで共通のレイアウト構造（背景・Electronドラッグ領域・コンテンツラッパー）を提供するシェルコンポーネント。
 */
import type { ReactNode } from "react";
import { IS_ELECTRON } from "@shared/constants";

interface BackgroundOrb {
  color: string;
  position: "top-left" | "bottom-right" | "center";
}

const ORB_POSITION_CLASSES: Record<BackgroundOrb["position"], string> = {
  "top-left": "absolute top-0 left-1/4 w-96 h-96",
  "bottom-right": "absolute bottom-0 right-1/4 w-96 h-96",
  center:
    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]",
};

export type { BackgroundOrb };

interface PageShellProps {
  children: ReactNode;
  /** コンテンツラッパーの外側に配置する要素（上部コントロールバー等） */
  overlay?: ReactNode;
  backgroundOrbs?: BackgroundOrb[];
  className?: string;
  /** コンテンツラッパーのクラス名を上書き */
  contentClassName?: string;
}

const DEFAULT_ORBS: BackgroundOrb[] = [
  { color: "bg-blue-500/10", position: "top-left" },
  { color: "bg-purple-500/10", position: "bottom-right" },
];

export function PageShell({
  children,
  overlay,
  backgroundOrbs = DEFAULT_ORBS,
  className = "",
  contentClassName = "relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12",
}: PageShellProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-y-auto ${className}`}
    >
      {IS_ELECTRON && (
        <div
          className="absolute top-0 left-0 right-0 h-10 z-30"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        ></div>
      )}

      {backgroundOrbs.length > 0 && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {backgroundOrbs.map((orb, i) => (
            <div
              key={`${orb.position}-${orb.color}`}
              className={`${ORB_POSITION_CLASSES[orb.position]} ${orb.color} rounded-full blur-3xl animate-pulse`}
              style={i > 0 ? { animationDelay: `${i}s` } : undefined}
            ></div>
          ))}
        </div>
      )}

      {overlay}

      <div className={contentClassName}>{children}</div>
    </main>
  );
}
