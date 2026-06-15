/**
 * @module SidebarMetadataStep
 * @description タクティクス作成サイドバーのメタデータ入力ステップ。戦術名・アイコン・フェーズを設定する。
 */
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { PHASE_CONFIG, Z_INDEX } from "@shared/constants";
import { useClickOutside } from "@presentation/hooks/ui";
import type { PhaseKey } from "@shared/constants";
import type { TranslationKey } from "@shared/i18n/translations";
import {
  getCreationMode,
  type CreationState,
  type WizardStep,
} from "@presentation/hooks/tactic";
import {
  PHASE_DROPDOWN_KEYS,
  ICON_OPTIONS,
  STEP_INDICATOR,
  SECTION_TITLE,
  SIDEBAR_BTN_PRIMARY,
  SIDEBAR_BTN_DISABLED,
  SIDEBAR_BTN_SECONDARY,
  SIDEBAR_SECTION,
} from "./constants";

interface SidebarMetadataStepProps {
  creation: CreationState;
  isSetPlayMode?: boolean;
  t: (key: TranslationKey) => string;
  onNameJaChange: (name: string) => void;
  onNameEnChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onGamePhaseChange: (phase: PhaseKey) => void;
  onWizardStep: (step: WizardStep) => void;
  onCancel: () => void;
}

export const SidebarMetadataStep = memo(function SidebarMetadataStep({
  creation,
  t,
  onNameJaChange,
  onNameEnChange,
  onIconChange,
  onGamePhaseChange,
  onWizardStep,
  onCancel,
}: SidebarMetadataStepProps) {
  const [phaseDropdownOpen, setPhaseDropdownOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const phaseRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const nameJaInputRef = useRef<HTMLInputElement>(null);

  const currentPhaseConfig = PHASE_CONFIG[creation.gamePhase];
  const creationMode = getCreationMode(creation);
  const stepTotal =
    creationMode === "setPlay" ? "6" : creationMode === "situation" ? "4" : "3";

  const closePhaseDropdown = useCallback(() => setPhaseDropdownOpen(false), []);
  const closeIconPicker = useCallback(() => setIconPickerOpen(false), []);
  useClickOutside(phaseRef, closePhaseDropdown);
  useClickOutside(iconRef, closeIconPicker);

  useEffect(() => {
    nameJaInputRef.current?.focus();
  }, []);

  const hasName = creation.nameJa.trim() || creation.nameEn.trim();

  return (
    <div className="flex flex-col gap-0">
      {/* タイトル */}
      <div className={SIDEBAR_SECTION}>
        <div className="text-center mb-1">
          <h3 className={SECTION_TITLE}>{t("tactics.creation.create")}</h3>
          <p className={STEP_INDICATOR}>
            {t("tactics.creation.stepIndicator")
              .replace("{current}", "1")
              .replace("{total}", stepTotal)}
          </p>
        </div>
      </div>

      {/* アイコン + 名前 */}
      <div className={SIDEBAR_SECTION}>
        <div className="flex items-start gap-2 mb-2">
          <div ref={iconRef} className="relative mt-1">
            <button
              type="button"
              onClick={() => setIconPickerOpen((prev) => !prev)}
              aria-label={t("tactics.creation.selectIcon")}
              aria-expanded={iconPickerOpen}
              className={`w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 border text-lg transition-all duration-200 ${
                iconPickerOpen ? "border-emerald-500/50" : "border-slate-700/50"
              }`}
            >
              {creation.icon}
            </button>
            {iconPickerOpen && (
              <div
                className="absolute top-0 left-full ml-1 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl p-1.5 grid grid-cols-4 gap-0.5 w-[148px]"
                style={{ zIndex: Z_INDEX.DROPDOWN }}
              >
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      onIconChange(icon);
                      setIconPickerOpen(false);
                    }}
                    aria-label={`${t("tactics.creation.icon")} ${icon}`}
                    aria-pressed={creation.icon === icon}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                      creation.icon === icon
                        ? "bg-emerald-600/40 ring-1 ring-emerald-400 scale-110"
                        : "hover:bg-slate-800 hover:scale-105"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <input
              ref={nameJaInputRef}
              type="text"
              value={creation.nameJa}
              onChange={(e) => onNameJaChange(e.target.value)}
              placeholder={t("tactics.creation.nameJaPlaceholder")}
              aria-label={t("tactics.creation.nameJaPlaceholder")}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700/50 focus:outline-none focus:border-emerald-500/50 transition-colors duration-200"
            />
            <input
              type="text"
              value={creation.nameEn}
              onChange={(e) => onNameEnChange(e.target.value)}
              placeholder={t("tactics.creation.nameEnPlaceholder")}
              aria-label={t("tactics.creation.nameEnPlaceholder")}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700/50 focus:outline-none focus:border-emerald-500/50 transition-colors duration-200"
            />
          </div>
        </div>

        {/* フォーメーション表示 */}
        <div className="flex items-center gap-2 px-0.5 mb-2">
          <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">
            {t("tactics.formation")}
          </span>
          <span className="text-xs text-slate-300 font-semibold">
            {creation.formationName}
          </span>
        </div>

        {/* フェーズ選択 */}
        {creationMode === "setPlay" ? (
          <div className="mb-2">
            <label className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-0.5 block">
              {t("tactics.creation.gamePhase")}
            </label>
            <div className="w-full bg-slate-800/60 text-slate-300 text-xs rounded-lg px-3 py-2 border border-slate-700/50 flex items-center gap-1.5">
              <span className="text-sm">{currentPhaseConfig.icon}</span>
              <span>{t(currentPhaseConfig.nameKey)}</span>
            </div>
          </div>
        ) : (
          <div ref={phaseRef} className="relative mb-2">
            <label className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-0.5 block">
              {t("tactics.creation.gamePhase")}
            </label>
            <button
              type="button"
              onClick={() => setPhaseDropdownOpen((prev) => !prev)}
              aria-expanded={phaseDropdownOpen}
              aria-haspopup="listbox"
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700/50 hover:border-emerald-500/50 focus:outline-none flex items-center gap-1.5 transition-colors duration-200"
            >
              <span className="text-sm">{currentPhaseConfig.icon}</span>
              <span>{t(currentPhaseConfig.nameKey)}</span>
              <span className="ml-auto text-slate-500 text-[10px]">▼</span>
            </button>
            {phaseDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden"
                style={{ zIndex: Z_INDEX.DROPDOWN }}
              >
                {PHASE_DROPDOWN_KEYS.map((key) => {
                  const cfg = PHASE_CONFIG[key];
                  const isActive = creation.gamePhase === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onGamePhaseChange(key);
                        setPhaseDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-1.5 px-3 py-2 text-xs transition-colors duration-150 ${
                        isActive
                          ? "bg-emerald-600/20 text-emerald-300"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{cfg.icon}</span>
                      <span>{t(cfg.nameKey)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="px-3 py-2 space-y-1.5">
        <button
          type="button"
          onClick={() => {
            if (creationMode === "setPlay") {
              onWizardStep("ballPosition");
              return;
            }
            if (creationMode === "situation") {
              onWizardStep("setPosition");
              return;
            }
            onWizardStep("editing");
          }}
          disabled={!hasName}
          className={hasName ? SIDEBAR_BTN_PRIMARY : SIDEBAR_BTN_DISABLED}
        >
          <span>{t("tactics.creation.next")}</span>
          <span>→</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={SIDEBAR_BTN_SECONDARY}
        >
          {t("tactics.creation.cancel")}
        </button>
      </div>
    </div>
  );
});
