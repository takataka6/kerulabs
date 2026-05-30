/**
 * @module TeamEditor
 * @description チーム設定編集コンポーネント。既存チームの名前・国籍・カラー・フォーメーション等を更新する。
 */
import { useState } from "react";
import type { Team } from "@domain/entities/Team";
import {
  COUNTRIES,
  FLAG_EMOJI,
  getFlagTypeByCountryName,
} from "@shared/constants/countries";
import { FORMATION_OPTIONS } from "@shared/constants/formations";
import type { TranslationKey } from "@shared/i18n/translations";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { AccessibleModal, useConfirm } from "@presentation/components/ui";

interface TeamEditorProps {
  team: Team;
  onSave: (team: Team) => Promise<void>;
  onClose: () => void;
}

const GRADIENT_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "from-blue-600 to-blue-400", labelKey: "teamCreator.color.blue" },
  { value: "from-red-600 to-red-400", labelKey: "teamCreator.color.red" },
  {
    value: "from-green-600 to-green-400",
    labelKey: "teamCreator.color.green",
  },
  {
    value: "from-purple-600 to-purple-400",
    labelKey: "teamCreator.color.purple",
  },
  {
    value: "from-yellow-600 to-yellow-400",
    labelKey: "teamCreator.color.yellow",
  },
  { value: "from-pink-600 to-pink-400", labelKey: "teamCreator.color.pink" },
  {
    value: "from-indigo-600 to-indigo-400",
    labelKey: "teamCreator.color.indigo",
  },
  {
    value: "from-orange-600 to-orange-400",
    labelKey: "teamCreator.color.orange",
  },
  { value: "from-white to-slate-200", labelKey: "teamCreator.color.white" },
];

export function TeamEditor({ team, onSave, onClose }: TeamEditorProps) {
  const { language, t } = useLanguage();
  const { alert } = useConfirm();
  const sortedCountries = [...COUNTRIES].sort((a, b) => {
    if (language === "ja") {
      if (a.code === "JP") return -1;
      if (b.code === "JP") return 1;
      return a.nameJa.localeCompare(b.nameJa, "ja");
    }
    return a.nameEn.localeCompare(b.nameEn, "en");
  });
  const [teamName, setTeamName] = useState(team.name);
  const [subtitle, setSubtitle] = useState(team.subtitle);
  const [flagType, setFlagType] = useState(team.flagType);
  const [headerGradient, setHeaderGradient] = useState(team.headerGradient);
  const [selectedFormations, setSelectedFormations] = useState<string[]>([
    ...team.availableFormations,
  ]);
  const [country, setCountry] = useState(team.country || "");
  const [manager, setManager] = useState(team.manager || "");
  const [defaultFormation, setDefaultFormation] = useState(
    team.defaultFormation || team.availableFormations[0],
  );
  const [gkColor, setGkColor] = useState(team.colors.gk.hex);
  const [mainColor, setMainColor] = useState(team.colors.main.hex);

  const handleFormationToggle = (formation: string) => {
    if (selectedFormations.includes(formation)) {
      if (selectedFormations.length > 1) {
        const newFormations = selectedFormations.filter((f) => f !== formation);
        setSelectedFormations(newFormations);
        if (formation === defaultFormation && newFormations.length > 0) {
          setDefaultFormation(newFormations[0]);
        }
      }
    } else {
      const newFormations = [...selectedFormations, formation];
      setSelectedFormations(newFormations);
      if (selectedFormations.length === 0) {
        setDefaultFormation(formation);
      }
    }
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      await alert({ message: t("teamCreator.teamNameRequired") });
      return;
    }

    if (selectedFormations.length === 0) {
      await alert({ message: t("teamCreator.formationsRequired") });
      return;
    }

    team.updateName(
      teamName.trim(),
      subtitle.trim() || t("teamCreator.defaultSubtitle"),
    );
    team.updateColors({ gk: gkColor, main: mainColor });
    team.updateFlagType(flagType);
    team.updateHeaderGradient(headerGradient);
    team.updateCountry(country || undefined);
    team.updateManager(manager.trim() || undefined);
    team.updateFormations(selectedFormations, defaultFormation);

    await onSave(team);
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="team-editor-title"
      className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
    >
      {/* ヘッダー */}
      <div
        className={`bg-gradient-to-r ${headerGradient} px-6 py-4 border-b border-slate-700`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{FLAG_EMOJI[flagType] || "⚽"}</span>
            <div>
              <h2
                id="team-editor-title"
                className="text-2xl font-bold text-white tracking-tight"
              >
                {t("teamEditor.title")}
              </h2>
              <p className="text-white/80 text-sm">
                {t("teamEditor.description")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("a11y.closeModal")}
            className="text-white/60 hover:text-white transition-all duration-300 text-3xl hover:rotate-90 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="space-y-6">
          {/* チーム名 */}
          <div>
            <label
              htmlFor="edit-team-name"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.teamName")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-team-name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={t("teamCreator.teamNamePlaceholder")}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* サブタイトル */}
          <div>
            <label
              htmlFor="edit-team-subtitle"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.subtitle")}
            </label>
            <input
              id="edit-team-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={t("teamCreator.subtitlePlaceholder")}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 国選択 */}
          <div>
            <label
              htmlFor="edit-team-country"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.country")}
            </label>
            <select
              id="edit-team-country"
              value={country}
              onChange={(e) => {
                const nextCountry = e.target.value;
                setCountry(nextCountry);
                const nextFlagType = getFlagTypeByCountryName(nextCountry);
                if (nextFlagType) {
                  setFlagType(nextFlagType);
                }
              }}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">{t("teamCreator.countryNone")}</option>
              {sortedCountries.map((c) => (
                <option
                  key={c.code}
                  value={language === "ja" ? c.nameJa : c.nameEn}
                >
                  {c.flag} {language === "ja" ? c.nameJa : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* 監督 */}
          <div>
            <label
              htmlFor="edit-team-manager"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.manager")}
            </label>
            <input
              id="edit-team-manager"
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder={t("teamCreator.managerPlaceholder")}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* グラデーション選択 */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 tracking-wide">
              {t("teamCreator.headerColor")}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENT_OPTIONS.map((gradient) => (
                <button
                  key={gradient.value}
                  onClick={() => setHeaderGradient(gradient.value)}
                  className={`p-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    headerGradient === gradient.value
                      ? "scale-105 ring-2 ring-white"
                      : ""
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${gradient.value}`}
                  ></div>
                  <div className="relative z-10 text-white text-xs font-bold">
                    {t(gradient.labelKey)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* チームカラー */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 tracking-wide">
              {t("teamCreator.teamColors")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="edit-team-gk-color"
                  className="block text-xs text-slate-400 mb-2"
                >
                  GK
                </label>
                <input
                  id="edit-team-gk-color"
                  type="color"
                  value={gkColor}
                  onChange={(e) => setGkColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer bg-slate-800 border border-slate-700"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-team-field-color"
                  className="block text-xs text-slate-400 mb-2"
                >
                  {t("teamCreator.fieldColor")}
                </label>
                <input
                  id="edit-team-field-color"
                  type="color"
                  value={mainColor}
                  onChange={(e) => setMainColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer bg-slate-800 border border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* フォーメーション選択 */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 tracking-wide">
              {t("teamCreator.formations")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FORMATION_OPTIONS.map((formation) => (
                <button
                  key={formation}
                  onClick={() => handleFormationToggle(formation)}
                  className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                    selectedFormations.includes(formation)
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {formation}
                </button>
              ))}
            </div>
          </div>

          {/* デフォルトフォーメーション選択 */}
          {selectedFormations.length > 0 && (
            <div>
              <label
                htmlFor="edit-team-default-formation"
                className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
              >
                {t("teamCreator.defaultFormation")}
              </label>
              <select
                id="edit-team-default-formation"
                value={defaultFormation}
                onChange={(e) => setDefaultFormation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {selectedFormations.map((formation) => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="border-t border-slate-700 px-6 py-4 bg-slate-900/50 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl font-semibold transition-all duration-300"
        >
          {t("teamCreator.cancel")}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {t("teamEditor.save")}
        </button>
      </div>
    </AccessibleModal>
  );
}
