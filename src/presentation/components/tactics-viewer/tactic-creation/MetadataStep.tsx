/**
 * @module MetadataStep
 * @description タクティクス作成ウィザードのメタデータ入力ステップコンポーネント。戦術名・アイコン・フェーズを設定する。
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
  WIZARD_WRAPPER,
  CARD_BASE,
  STEP_INDICATOR,
  SECTION_TITLE,
  BTN_SECONDARY,
} from "./constants";

interface MetadataStepProps {
  creation: CreationState;
  isSetPlayMode?: boolean;
  offset: { x: number; y: number };
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
  t: (key: TranslationKey) => string;
  onNameJaChange: (name: string) => void;
  onNameEnChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onGamePhaseChange: (phase: PhaseKey) => void;
  onWizardStep: (step: WizardStep) => void;
  onCancel: () => void;
}

export const MetadataStep = memo(function MetadataStep({
  creation,
  offset,
  isDragging,
  handlePointerDown,
  t,
  onNameJaChange,
  onNameEnChange,
  onIconChange,
  onGamePhaseChange,
  onWizardStep,
  onCancel,
}: MetadataStepProps) {
  const [phaseDropdownOpen, setPhaseDropdownOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const phaseRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const nameJaInputRef = useRef<HTMLInputElement>(null);

  const currentPhaseConfig = PHASE_CONFIG[creation.gamePhase];
  const creationMode = getCreationMode(creation);
  const stepTotal =
    creationMode === "setPlay" ? "6" : creationMode === "situation" ? "4" : "3";

  // ドロップダウン外クリックで閉じる
  const closePhaseDropdown = useCallback(() => setPhaseDropdownOpen(false), []);
  const closeIconPicker = useCallback(() => setIconPickerOpen(false), []);
  useClickOutside(phaseRef, closePhaseDropdown);
  useClickOutside(iconRef, closeIconPicker);

  useEffect(() => {
    nameJaInputRef.current?.focus();
  }, []);

  return (
    <div
      className={`${WIZARD_WRAPPER} gap-2`}
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
    >
      <div className={`${CARD_BASE} border-emerald-500/40 p-5 w-[380px]`}>
        {/* ドラッグハンドル */}
        <div
          onPointerDown={handlePointerDown}
          className={`flex justify-center py-2.5 -mx-5 -mt-5 mb-2 rounded-t-2xl hover:bg-slate-800/30 transition-colors ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <div className="w-10 h-1 rounded-full bg-slate-600 group-hover:bg-slate-400 transition-colors" />
        </div>
        {/* タイトル */}
        <div className="text-center mb-4">
          <h3 className={SECTION_TITLE}>{t("tactics.creation.create")}</h3>
          <p className={STEP_INDICATOR}>
            {t("tactics.creation.stepIndicator")
              .replace("{current}", "1")
              .replace("{total}", stepTotal)}
          </p>
        </div>

        {/* アイコン + 名前（日英） */}
        <div className="flex items-start gap-2 mb-3">
          <div ref={iconRef} className="relative mt-1">
            <button
              type="button"
              onClick={() => setIconPickerOpen((prev) => !prev)}
              aria-label={t("tactics.creation.selectIcon")}
              aria-expanded={iconPickerOpen}
              className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border text-xl transition-all duration-200 hover:scale-105 ${
                iconPickerOpen ? "border-emerald-500/50" : "border-slate-700/50"
              }`}
            >
              {creation.icon}
            </button>
            {iconPickerOpen && (
              <div
                className="absolute top-0 left-full ml-2 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl p-2 grid grid-cols-4 gap-1 w-[168px]"
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
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all duration-200 ${
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
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold w-5 shrink-0">
                🇯🇵
              </span>
              <input
                ref={nameJaInputRef}
                type="text"
                value={creation.nameJa}
                onChange={(e) => onNameJaChange(e.target.value)}
                placeholder={t("tactics.creation.nameJaPlaceholder")}
                aria-label={t("tactics.creation.nameJaPlaceholder")}
                className="flex-1 bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-700/50 focus:outline-none focus:border-emerald-500/50 transition-colors duration-200"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold w-5 shrink-0">
                🇬🇧
              </span>
              <input
                type="text"
                value={creation.nameEn}
                onChange={(e) => onNameEnChange(e.target.value)}
                placeholder={t("tactics.creation.nameEnPlaceholder")}
                aria-label={t("tactics.creation.nameEnPlaceholder")}
                className="flex-1 bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-700/50 focus:outline-none focus:border-emerald-500/50 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* フォーメーション表示（読み取り専用） */}
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            {t("tactics.formation")}
          </span>
          <span className="text-sm text-slate-300 font-semibold">
            {creation.formationName}
          </span>
        </div>

        {/* フェーズ選択 */}
        {creationMode === "setPlay" ? (
          /* セットプレーモード時はフェーズ固定表示 */
          <div className="mb-4">
            <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1 block">
              {t("tactics.creation.gamePhase")}
            </label>
            <div className="w-full bg-slate-800/60 text-slate-300 text-sm rounded-xl px-4 py-2.5 border border-slate-700/50 flex items-center gap-2">
              <span className="text-base">{currentPhaseConfig.icon}</span>
              <span>{t(currentPhaseConfig.nameKey)}</span>
            </div>
          </div>
        ) : (
          <div ref={phaseRef} className="relative mb-4">
            <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1 block">
              {t("tactics.creation.gamePhase")}
            </label>
            <button
              type="button"
              onClick={() => setPhaseDropdownOpen((prev) => !prev)}
              aria-expanded={phaseDropdownOpen}
              aria-haspopup="listbox"
              className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 border border-slate-700/50 hover:border-emerald-500/50 focus:outline-none flex items-center gap-2 transition-colors duration-200"
            >
              <span className="text-base">{currentPhaseConfig.icon}</span>
              <span>{t(currentPhaseConfig.nameKey)}</span>
              <span className="ml-auto text-slate-500 text-xs">▼</span>
            </button>
            {phaseDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-60">
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
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors duration-150 ${
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

        {/* ボタン */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 ${BTN_SECONDARY}`}
          >
            {t("tactics.creation.cancel")}
          </button>
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
            disabled={!creation.nameJa.trim() && !creation.nameEn.trim()}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              creation.nameJa.trim() || creation.nameEn.trim()
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            <span>{t("tactics.creation.next")}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
});
