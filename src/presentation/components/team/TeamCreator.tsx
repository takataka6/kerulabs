/**
 * @module TeamCreator
 * @description チーム作成コンポーネント。チーム名・国籍・カラー・デフォルトフォーメーションの入力フォームを表示する。
 */
import { useState } from "react";
import { Team } from "@domain/entities/Team";
import {
  COUNTRIES,
  FLAG_EMOJI,
  getFlagTypeByCountryName,
} from "@shared/constants/countries";
import { FORMATION_OPTIONS } from "@shared/constants/formations";
import {
  DEFAULT_TEAM_HEADER_GRADIENT,
  TEAM_HEADER_GRADIENT_OPTIONS,
} from "@shared/constants/teamHeaderGradients";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { AccessibleModal, useConfirm } from "@presentation/components/ui";

interface TeamCreatorProps {
  onCreateTeam: (team: Team) => void;
  onClose: () => void;
}

export function TeamCreator({ onCreateTeam, onClose }: TeamCreatorProps) {
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
  const [teamName, setTeamName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [flagType, setFlagType] = useState("japan");
  const [headerGradient, setHeaderGradient] = useState(
    DEFAULT_TEAM_HEADER_GRADIENT,
  );
  const [selectedFormations, setSelectedFormations] = useState<string[]>([
    "4-3-3",
  ]);
  const [country, setCountry] = useState("");
  const [manager, setManager] = useState("");
  const [defaultFormation, setDefaultFormation] = useState("4-3-3");

  // 色の設定
  const [gkColor, setGkColor] = useState("#fbbf24");
  const [mainColor, setMainColor] = useState("#3b82f6");

  const handleFormationToggle = (formation: string) => {
    if (selectedFormations.includes(formation)) {
      if (selectedFormations.length > 1) {
        const newFormations = selectedFormations.filter((f) => f !== formation);
        setSelectedFormations(newFormations);
        // デフォルトフォーメーションを削除する場合、残りの最初のものをデフォルトに設定
        if (formation === defaultFormation && newFormations.length > 0) {
          setDefaultFormation(newFormations[0]);
        }
      }
    } else {
      const newFormations = [...selectedFormations, formation];
      setSelectedFormations(newFormations);
      // 最初のフォーメーションの場合、デフォルトに設定
      if (selectedFormations.length === 0) {
        setDefaultFormation(formation);
      }
    }
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      await alert({ message: t("teamCreator.teamNameRequired") });
      return;
    }

    if (selectedFormations.length === 0) {
      await alert({ message: t("teamCreator.formationsRequired") });
      return;
    }

    const team = Team.create({
      name: teamName.trim(),
      subtitle: subtitle.trim() || t("teamCreator.defaultSubtitle"),
      colors: {
        gk: gkColor,
        main: mainColor,
      },
      availableFormations: selectedFormations,
      flagType,
      headerGradient,
      country: country || undefined,
      defaultFormation,
      manager: manager.trim() || undefined,
    });

    onCreateTeam(team);
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="team-creator-title"
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
                id="team-creator-title"
                className="text-2xl font-bold text-white tracking-tight"
              >
                {t("teamCreator.title")}
              </h2>
              <p className="text-white/80 text-sm">
                {t("teamCreator.description")}
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
              htmlFor="team-name"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.teamName")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="team-name"
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
              htmlFor="team-subtitle"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.subtitle")}
            </label>
            <input
              id="team-subtitle"
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
              htmlFor="team-country"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.country")}
            </label>
            <select
              id="team-country"
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
              htmlFor="team-manager"
              className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
            >
              {t("teamCreator.manager")}
            </label>
            <input
              id="team-manager"
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
              {TEAM_HEADER_GRADIENT_OPTIONS.map((gradient) => (
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
                  htmlFor="team-gk-color"
                  className="block text-xs text-slate-400 mb-2"
                >
                  GK
                </label>
                <input
                  id="team-gk-color"
                  type="color"
                  value={gkColor}
                  onChange={(e) => setGkColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer bg-slate-800 border border-slate-700"
                />
              </div>
              <div>
                <label
                  htmlFor="team-field-color"
                  className="block text-xs text-slate-400 mb-2"
                >
                  {t("teamCreator.fieldColor")}
                </label>
                <input
                  id="team-field-color"
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
                htmlFor="team-default-formation"
                className="block text-sm font-bold text-slate-300 mb-2 tracking-wide"
              >
                {t("teamCreator.defaultFormation")}
              </label>
              <select
                id="team-default-formation"
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
          onClick={handleCreate}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {t("teamCreator.create")}
        </button>
      </div>
    </AccessibleModal>
  );
}
