/**
 * @module FormationEditor
 * @description フォーメーション編集モーダルコンポーネント。ポジション配置のドラッグ編集・保存・削除を行う。
 */
import { memo, useState, useMemo } from "react";
import { Team } from "@domain/entities/Team";
import { Tactic } from "@domain/entities/Tactic";
import type { Formation } from "@domain/entities/Formation";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import {
  ensureFormationDefaultForGameMode,
  getFormationOptions,
  getFormationOptionsWithDefault,
  getFormationNameById,
  normalizeFormationKey,
} from "@shared/constants/formations";
import type { GameMode } from "@shared/types/GameMode";

interface FormationEditorProps {
  team: Team;
  allTactics?: Tactic[];
  formations?: Formation[];
  onUpdateTeam: (team: Team) => void;
  onClose: () => void;
  gameMode?: GameMode;
}

export const FormationEditor = memo(function FormationEditor({
  team,
  onUpdateTeam,
  onClose,
  gameMode = "football",
}: FormationEditorProps) {
  const { t } = useLanguage();
  const formationOptions = useMemo(
    () => getFormationOptions(gameMode),
    [gameMode],
  );
  const initialSelectedFormations = useMemo(
    () => ensureFormationDefaultForGameMode(team.availableFormations, gameMode),
    [team.availableFormations, gameMode],
  );
  const initialModeFormations = useMemo(
    () => getFormationOptionsWithDefault(team.availableFormations, gameMode),
    [team.availableFormations, gameMode],
  );
  const initialDefaultFormation =
    team.defaultFormation &&
    initialModeFormations.includes(team.defaultFormation)
      ? team.defaultFormation
      : initialModeFormations[0];
  const [selectedFormations, setSelectedFormations] = useState<string[]>(
    initialSelectedFormations,
  );
  const [defaultFormation, setDefaultFormation] = useState<string>(
    initialDefaultFormation,
  );

  const handleFormationToggle = (formation: string) => {
    if (selectedFormations.includes(formation)) {
      if (selectedFormations.length <= 1) return;
      const newFormations = selectedFormations.filter((f) => f !== formation);
      setSelectedFormations(newFormations);
      if (formation === defaultFormation) {
        setDefaultFormation(newFormations[0]);
      }
    } else {
      setSelectedFormations([...selectedFormations, formation]);
    }
  };

  const handleSave = () => {
    team.updateFormations(selectedFormations, defaultFormation);
    onUpdateTeam(team);
    onClose();
  };

  return (
    <div
      data-testid="formation-editor-popup"
      className="absolute top-2 right-14 z-40 flex max-h-[min(70vh,560px)] w-[320px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-[24px] border border-slate-600/40 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.94)_100%)] shadow-[0_18px_40px_rgba(2,6,23,0.32),0_4px_12px_rgba(2,6,23,0.16)] ring-1 ring-white/5 backdrop-blur-xl sm:top-3 sm:right-[164px] xl:right-[176px]"
    >
      <div className="flex shrink-0 items-center justify-end gap-2 border-b border-slate-700/50 px-4 py-3">
        <button
          onClick={onClose}
          aria-label={t("a11y.closePanel")}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/85 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="shrink-0 border-b border-slate-700/50 px-4 py-3">
        <div
          id="formation-editor-title"
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/90"
        >
          {t("tactics.editFormations.title")}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {formationOptions.map((formation) => {
              const formationId = normalizeFormationKey(formation);
              const isSelected = selectedFormations.includes(formationId);
              const isLastOne = isSelected && selectedFormations.length <= 1;
              return (
                <button
                  key={formation}
                  onClick={() => handleFormationToggle(formationId)}
                  disabled={isLastOne}
                  className={`py-2.5 px-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : "border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-700/70"
                  } ${isLastOne ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {formation}
                </button>
              );
            })}
          </div>

          {selectedFormations.length > 1 && (
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">
                {t("tactics.editFormations.default")}
              </label>
              <select
                value={defaultFormation}
                onChange={(e) => setDefaultFormation(e.target.value)}
                aria-label={t("tactics.editFormations.default")}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {selectedFormations.map((f) => (
                  <option key={f} value={f}>
                    {getFormationNameById(f) ?? f}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-slate-700/50 shrink-0">
        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg"
        >
          {t("tactics.squadBuilder.save")}
        </button>
      </div>
    </div>
  );
});
