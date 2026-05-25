/**
 * @module PlayerFormFields
 * @description 選手情報入力フォームの共通フィールドコンポーネント。名前・背番号・ポジション・国籍・画像などの入力を表示する。
 */
import { useState, useCallback } from "react";
import type { PositionCategory } from "@domain/types";
import type { PlayerStatus } from "@shared/types/PlayerStatus";
import { COUNTRIES } from "@shared/constants/countries";
import type { TranslationKey } from "@shared/i18n/translations";
import { POSITION_CONFIG } from "./constants";

/** フォーム入力の共有Tailwindクラス */
export const INPUT_BASE =
  "px-4 py-2.5 bg-slate-800/80 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors";
const BORDER_NORMAL = "border border-slate-700/60 focus:border-cyan-500";
const BORDER_ERROR = "border border-red-500/70 focus:border-red-400";

export const INPUT_CLASS = `${INPUT_BASE} ${BORDER_NORMAL}`;
export const SELECT_CLASS = `${INPUT_BASE} ${BORDER_NORMAL}`;

function inputClass(hasError: boolean) {
  return `${INPUT_BASE} ${hasError ? BORDER_ERROR : BORDER_NORMAL}`;
}

interface PlayerFormFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  number: string;
  onNumberChange: (value: string) => void;
  position: PositionCategory;
  onPositionChange: (value: PositionCategory) => void;
  nationality: string;
  onNationalityChange: (value: string) => void;
  club: string;
  onClubChange: (value: string) => void;
  leagueCountry: string;
  onLeagueCountryChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  status: PlayerStatus;
  onStatusChange: (value: PlayerStatus) => void;
  language: "ja" | "en";
  t: (key: TranslationKey) => string;
  /** 国籍未選択時のi18nキー */
  nationalityPlaceholder?: TranslationKey;
  /** リーグ所属国未選択時のi18nキー */
  leagueCountryPlaceholder?: TranslationKey;
}

/**
 * 選手フォームの共通フィールド（名前、背番号、ポジション、国籍、クラブ、リーグ）。
 * PlayerAddFormとPlayerRow（編集モード）の両方で使用される。
 */
export function PlayerFormFields({
  name,
  onNameChange,
  number,
  onNumberChange,
  position,
  onPositionChange,
  nationality,
  onNationalityChange,
  club,
  onClubChange,
  leagueCountry,
  onLeagueCountryChange,
  note,
  onNoteChange,
  status,
  onStatusChange,
  language,
  t,
  nationalityPlaceholder = "player.selectNationality",
  leagueCountryPlaceholder = "player.selectLeagueCountry",
}: PlayerFormFieldsProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = useCallback(
    (field: string) =>
      setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true })),
    [],
  );

  const nameError = touched.name && name.trim() === "";
  const num = parseInt(number, 10);
  const numberError =
    touched.number && (number === "" || isNaN(num) || num < 1 || num > 99);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder={t("player.name")}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => markTouched("name")}
          aria-label={t("player.name")}
          aria-invalid={nameError || undefined}
          required
          className={`col-span-2 ${inputClass(!!nameError)}`}
        />
        <input
          type="number"
          placeholder={t("player.number")}
          min="1"
          max="99"
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          onBlur={() => markTouched("number")}
          aria-label={t("player.number")}
          aria-invalid={numberError || undefined}
          required
          className={inputClass(!!numberError)}
        />
        <select
          value={position}
          onChange={(e) => onPositionChange(e.target.value as PositionCategory)}
          aria-label={t("player.position")}
          className={SELECT_CLASS}
        >
          {(Object.keys(POSITION_CONFIG) as PositionCategory[]).map((pos) => (
            <option key={pos} value={pos}>
              {POSITION_CONFIG[pos].icon} {POSITION_CONFIG[pos].label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={nationality}
          onChange={(e) => onNationalityChange(e.target.value)}
          aria-label={t("player.nationality")}
          className={SELECT_CLASS}
        >
          <option value="">{t(nationalityPlaceholder)}</option>
          {COUNTRIES.map((country) => {
            const cname = language === "ja" ? country.nameJa : country.nameEn;
            return (
              <option key={country.code} value={cname}>
                {country.flag} {cname}
              </option>
            );
          })}
        </select>
        <input
          type="text"
          placeholder={t("player.clubOptional")}
          value={club}
          onChange={(e) => onClubChange(e.target.value)}
          aria-label={t("player.club")}
          className={INPUT_CLASS}
        />
        <select
          value={leagueCountry}
          onChange={(e) => onLeagueCountryChange(e.target.value)}
          aria-label={t("player.leagueCountry")}
          className={SELECT_CLASS}
        >
          <option value="">{t(leagueCountryPlaceholder)}</option>
          {COUNTRIES.map((country) => {
            const cname = language === "ja" ? country.nameJa : country.nameEn;
            return (
              <option key={country.code} value={cname}>
                {country.flag} {cname}
              </option>
            );
          })}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as PlayerStatus)}
          aria-label={t("player.status")}
          className={SELECT_CLASS}
        >
          <option value="available">{t("player.status.available")}</option>
          <option value="suspended">{t("player.status.suspended")}</option>
          <option value="injured">{t("player.status.injured")}</option>
        </select>
        <input
          type="text"
          placeholder={t("player.notePlaceholder")}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          aria-label={t("player.note")}
          className={`col-span-2 ${INPUT_CLASS}`}
        />
      </div>
    </div>
  );
}
