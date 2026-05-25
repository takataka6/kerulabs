/**
 * @module LineupAnimationOverlay
 * @description ラインナップアニメーションのオーバーレイコンポーネント。選択されたプリセットでスターティングメンバーを表示する。
 */
import { useMemo } from "react";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import type { LineupPlayer, LineupTeamInfo, AnimationPhase } from "./types";
import { getPresetById, getDefaultPreset } from "./registry";

interface LineupAnimationOverlayProps {
  players: LineupPlayer[];
  teamInfo: LineupTeamInfo;
  phase: AnimationPhase;
  presetId: string;
  onComplete: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function LineupAnimationOverlay({
  players,
  teamInfo,
  phase,
  presetId,
  onComplete,
  onSkip,
  onCancel,
}: LineupAnimationOverlayProps) {
  const { t } = useLanguage();

  const preset = useMemo(
    () => getPresetById(presetId) ?? getDefaultPreset(),
    [presetId],
  );

  if (phase === "idle" || phase === "completed") return null;

  const PresetComponent = preset.component;

  return (
    <div
      className={`absolute inset-0 z-20 transition-opacity duration-500 ${
        phase === "completing" ? "opacity-0" : "opacity-100"
      }`}
      style={{ pointerEvents: "auto" }}
    >
      {/* フルスクリーンアニメーション領域 */}
      <PresetComponent
        players={players}
        teamInfo={teamInfo}
        phase={phase}
        onComplete={onComplete}
      />

      {/* スキップ・キャンセルコントロール - 右上 */}
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <button
          onClick={onSkip}
          className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-600 text-white text-xs rounded-lg backdrop-blur-sm transition-all"
        >
          {t("lineup.animation.skip")}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg backdrop-blur-sm transition-all"
        >
          {t("lineup.animation.cancel")}
        </button>
      </div>
    </div>
  );
}
