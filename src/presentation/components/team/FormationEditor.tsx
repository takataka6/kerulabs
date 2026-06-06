/**
 * @module FormationEditor
 * @description フォーメーション編集モーダルコンポーネント。ポジション配置のドラッグ編集・保存・削除を行う。
 */
import { memo, useState, useRef, useMemo } from "react";
import { useClickOutside } from "@presentation/hooks/ui";
import { Team } from "@domain/entities/Team";
import { Tactic } from "@domain/entities/Tactic";
import type { Formation } from "@domain/entities/Formation";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { AccessibleModal } from "@presentation/components/ui";
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
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef, onClose);

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
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="formation-editor-title"
      overlayClassName="fixed inset-0 z-50"
      className="fixed top-16 right-4 xl:right-6 w-72 xl:w-80 max-h-[80vh] bg-slate-900 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col"
    >
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between shrink-0">
        <div
          id="formation-editor-title"
          className="text-xs text-slate-300 font-bold tracking-widest uppercase flex items-center gap-2"
        >
          <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
          {t("tactics.editFormations.title")}
        </div>
        <button
          onClick={onClose}
          aria-label={t("a11y.closePanel")}
          className="text-slate-400 hover:text-white transition-all duration-300 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-3">
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
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300 border border-slate-700/30"
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
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

      {/* ボタンエリア */}
      <div className="p-3 border-t border-slate-700/50 shrink-0">
        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg"
        >
          {t("tactics.squadBuilder.save")}
        </button>
      </div>
    </AccessibleModal>
  );
});
