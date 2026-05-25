/**
 * @module PhaseDiamond
 * @description 試合フェーズ（攻撃・守備・トランジション等）をダイヤモンド型で可視化するコンポーネント。
 */
import { memo } from "react";
import { PHASE_CONFIG, type PhaseKey } from "@shared/constants/phases";
import type { TranslationKey } from "@shared/i18n/translations";

interface PhaseDiamondProps {
  selectedPhase: PhaseKey;
  onPhaseChange: (phase: PhaseKey) => void;
  t: (key: TranslationKey) => string;
}

const PHASE_ITEMS = [
  {
    phase: "attack" as const,
    pos: "absolute top-0 left-1/2 -translate-x-1/2",
    color: "red",
    fontSize: "text-[8px]",
  },
  {
    phase: "positive_transition" as const,
    pos: "absolute top-1/2 left-0 -translate-y-1/2",
    color: "green",
    fontSize: "text-[7px]",
  },
  {
    phase: "negative_transition" as const,
    pos: "absolute top-1/2 right-0 -translate-y-1/2",
    color: "orange",
    fontSize: "text-[7px]",
  },
  {
    phase: "defense" as const,
    pos: "absolute bottom-0 left-1/2 -translate-x-1/2",
    color: "blue",
    fontSize: "text-[8px]",
  },
] as const;

/**
 * 4つのゲームフェーズを菱形レイアウトで表示するセレクター。
 *
 * SVGで菱形の枠線と接続線を描画し、4方向にフェーズボタンを配置する。
 */
export const PhaseDiamond = memo(function PhaseDiamond({
  selectedPhase,
  onPhaseChange,
  t,
}: PhaseDiamondProps) {
  return (
    <div className="relative w-full aspect-square max-w-[140px] xl:max-w-[180px] mx-auto">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#ef4444", stopOpacity: 1 }}
            />
            <stop
              offset="25%"
              style={{ stopColor: "#22c55e", stopOpacity: 1 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "#3b82f6", stopOpacity: 1 }}
            />
            <stop
              offset="75%"
              style={{ stopColor: "#f97316", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#ef4444", stopOpacity: 1 }}
            />
          </linearGradient>
          <radialGradient id="radialGradient">
            <stop
              offset="0%"
              style={{ stopColor: "#60a5fa", stopOpacity: 0.4 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#60a5fa", stopOpacity: 0 }}
            />
          </radialGradient>
        </defs>
        <path
          d="M 50 10 L 90 50 L 50 90 L 10 50 Z"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-30"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,3"
          className="opacity-20"
        />
        <line
          x1="50"
          y1="50"
          x2="10"
          y2="50"
          stroke="#22c55e"
          strokeWidth="1"
          strokeDasharray="2,3"
          className="opacity-20"
        />
        <line
          x1="50"
          y1="50"
          x2="90"
          y2="50"
          stroke="#f97316"
          strokeWidth="1"
          strokeDasharray="2,3"
          className="opacity-20"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="90"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,3"
          className="opacity-20"
        />
      </svg>

      {PHASE_ITEMS.map(({ phase, pos, color, fontSize }) => {
        const label = t(`phase.${phase}` as TranslationKey);
        return (
          <button
            key={phase}
            onClick={() => onPhaseChange(phase)}
            className={`${pos} w-11 h-11 xl:w-14 xl:h-14 rounded-xl transition-all duration-300 font-bold flex flex-col items-center justify-center ${
              selectedPhase === phase
                ? `bg-gradient-to-br from-${color}-600 to-${color}-500 text-white shadow-2xl shadow-${color}-500/50 scale-110 rotate-45`
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border border-slate-700/50 rotate-45"
            }`}
            title={label}
          >
            <div className="-rotate-45 flex flex-col items-center gap-0.5">
              <span className="text-lg">{PHASE_CONFIG[phase].icon}</span>
              <span className={`${fontSize} tracking-tight leading-none`}>
                {label}
              </span>
            </div>
          </button>
        );
      })}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
      </div>
    </div>
  );
});
