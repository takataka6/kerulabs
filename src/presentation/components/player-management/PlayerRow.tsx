/**
 * @module PlayerRow
 * @description 選手一覧の各行を表示するコンポーネント。選手情報の表示・インライン編集・削除を行う。
 */
import { useState, useEffect, memo } from "react";
import type { Player } from "@domain/entities/Player";
import type { PositionCategory } from "@domain/types";
import type { PlayerStatus } from "@shared/types/PlayerStatus";
import { getCountryInfo } from "@shared/constants/countries";
import type { TranslationKey } from "@shared/i18n/translations";
import { ImageCropModal } from "@presentation/components/ui";
import { POSITION_CONFIG } from "./constants";
import { PlayerFormFields } from "./PlayerFormFields";

interface PlayerRowProps {
  player: Player;
  isEditing: boolean;
  onStartEdit: (playerId: string) => void;
  onCancelEdit: () => void;
  onUpdate: (
    playerId: string,
    name: string,
    number: number,
    position: PositionCategory,
    nationality?: string,
    club?: string,
    leagueCountry?: string,
    imageUrl?: string,
    mainVisualImageUrl?: string,
    note?: string,
    status?: PlayerStatus,
  ) => void;
  onRemove: (playerId: string) => void;
  language: "ja" | "en";
  t: (key: TranslationKey) => string;
}

export const PlayerRow = memo(function PlayerRow({
  player,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onRemove,
  language,
  t,
}: PlayerRowProps) {
  const [editName, setEditName] = useState(player.name);
  const [editNumber, setEditNumber] = useState(player.number.toString());
  const [editPosition, setEditPosition] = useState<PositionCategory>(
    player.position,
  );
  const [editNationality, setEditNationality] = useState(
    player.nationality || "",
  );
  const [editClub, setEditClub] = useState(player.club || "");
  const [editLeagueCountry, setEditLeagueCountry] = useState(
    player.leagueCountry || "",
  );
  const [editNote, setEditNote] = useState(player.note || "");
  const [editStatus, setEditStatus] = useState<PlayerStatus>(
    player.status || "available",
  );
  const [editImageUrl, setEditImageUrl] = useState<string | undefined>(
    player.imageUrl,
  );
  const [editMainVisualImageUrl, setEditMainVisualImageUrl] = useState<
    string | undefined
  >(player.mainVisualImageUrl);
  const [showCropModal, setShowCropModal] = useState<
    "marker" | "mainVisual" | null
  >(null);

  const nationalityInfo = player.nationality
    ? getCountryInfo(player.nationality, language)
    : null;
  const leagueCountryInfo = player.leagueCountry
    ? getCountryInfo(player.leagueCountry, language)
    : null;

  /* eslint-disable react-hooks/set-state-in-effect -- player prop 変更時にフォームステートを同期。編集中でない場合のみ反映し、ユーザー入力を上書きしない */
  useEffect(() => {
    if (!isEditing) {
      setEditName(player.name);
      setEditNumber(player.number.toString());
      setEditPosition(player.position);
      setEditNationality(player.nationality || "");
      setEditClub(player.club || "");
      setEditLeagueCountry(player.leagueCountry || "");
      setEditNote(player.note || "");
      setEditStatus(player.status || "available");
      setEditImageUrl(player.imageUrl);
      setEditMainVisualImageUrl(player.mainVisualImageUrl);
    }
  }, [
    isEditing,
    player.name,
    player.number,
    player.position,
    player.nationality,
    player.club,
    player.leagueCountry,
    player.note,
    player.status,
    player.imageUrl,
    player.mainVisualImageUrl,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const posConfig = POSITION_CONFIG[player.position];

  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border ${isEditing ? "border-cyan-500/50" : "border-slate-700/50"} hover:border-slate-600/70 transition-all duration-200 shadow-lg`}
    >
      {isEditing ? (
        <>
          <div className="mb-4">
            <PlayerFormFields
              name={editName}
              onNameChange={setEditName}
              number={editNumber}
              onNumberChange={setEditNumber}
              position={editPosition}
              onPositionChange={setEditPosition}
              nationality={editNationality}
              onNationalityChange={setEditNationality}
              club={editClub}
              onClubChange={setEditClub}
              leagueCountry={editLeagueCountry}
              onLeagueCountryChange={setEditLeagueCountry}
              note={editNote}
              onNoteChange={setEditNote}
              status={editStatus}
              onStatusChange={setEditStatus}
              language={language}
              t={t}
              nationalityPlaceholder="player.selectNationalityShort"
              leagueCountryPlaceholder="player.selectLeagueCountryShort"
            />
          </div>
          {/* 画像アップロード */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* マーカー画像 */}
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                MK
              </span>
              {editImageUrl ? (
                <>
                  <img
                    src={editImageUrl}
                    alt={`${player.name} ${t("player.marker")}`}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/50"
                  />
                  <button
                    onClick={() => setShowCropModal("marker")}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-medium transition-colors"
                  >
                    {t("player.change")}
                  </button>
                  <button
                    onClick={() => setEditImageUrl(undefined)}
                    className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-[10px] font-medium transition-colors"
                  >
                    {t("player.delete")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCropModal("marker")}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1"
                >
                  <span>📷</span>
                  <span>{t("player.markerImage")}</span>
                </button>
              )}
            </div>
            {/* メインビジュアル画像 */}
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-700/50">
              <span className="text-[10px] text-purple-400 font-bold tracking-wider">
                MV
              </span>
              {editMainVisualImageUrl ? (
                <>
                  <img
                    src={editMainVisualImageUrl}
                    alt={`${player.name} ${t("player.mainVisual")}`}
                    className="w-6 h-8 rounded-sm object-cover border-2 border-purple-500/50"
                  />
                  <button
                    onClick={() => setShowCropModal("mainVisual")}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-medium transition-colors"
                  >
                    {t("player.change")}
                  </button>
                  <button
                    onClick={() => setEditMainVisualImageUrl(undefined)}
                    className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-[10px] font-medium transition-colors"
                  >
                    {t("player.delete")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCropModal("mainVisual")}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1"
                >
                  <span>🖼️</span>
                  <span>{t("player.mainVisual")}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onUpdate(
                  player.id.value,
                  editName,
                  parseInt(editNumber, 10),
                  editPosition,
                  editNationality || undefined,
                  editClub || undefined,
                  editLeagueCountry || undefined,
                  editImageUrl,
                  editMainVisualImageUrl,
                  editNote || undefined,
                  editStatus,
                );
                onCancelEdit();
              }}
              className="flex-1 py-2.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              {t("player.save")}
            </button>
            <button
              onClick={onCancelEdit}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors text-sm border border-slate-700/60"
            >
              {t("player.cancel")}
            </button>
          </div>
          {showCropModal === "marker" && (
            <ImageCropModal
              initialImage={editImageUrl}
              onSave={(url) => setEditImageUrl(url)}
              onRemove={
                editImageUrl ? () => setEditImageUrl(undefined) : undefined
              }
              onClose={() => setShowCropModal(null)}
              title={t("player.setMarkerImage")}
              aspectRatio={1}
              cropShape="round"
              outputWidth={128}
              outputHeight={128}
            />
          )}
          {showCropModal === "mainVisual" && (
            <ImageCropModal
              initialImage={editMainVisualImageUrl}
              onSave={(url) => setEditMainVisualImageUrl(url)}
              onRemove={
                editMainVisualImageUrl
                  ? () => setEditMainVisualImageUrl(undefined)
                  : undefined
              }
              onClose={() => setShowCropModal(null)}
              title={t("player.setMainVisualImage")}
              aspectRatio={3 / 4}
              cropShape="rect"
              outputWidth={300}
              outputHeight={400}
            />
          )}
        </>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                loading="lazy"
                className="w-10 h-10 rounded-lg object-cover shadow-lg border border-slate-600/50 shrink-0"
              />
            ) : (
              <div
                className={`w-10 h-10 ${posConfig.color} ${posConfig.borderColor} border rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}
              >
                {player.number}
              </div>
            )}
            {player.mainVisualImageUrl && (
              <img
                src={player.mainVisualImageUrl}
                alt={`${player.name} ${t("player.mainVisual")}`}
                loading="lazy"
                className="w-7 h-10 rounded-md object-cover shadow-lg border border-purple-500/30 shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-white text-slate-100 font-semibold text-sm sm:text-base truncate tracking-wide">
                  {player.name}
                </div>
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${posConfig.color} ${posConfig.borderColor} border text-white/90`}
                >
                  {posConfig.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-slate-400 text-[11px] mt-0.5">
                <span className="text-[10px]">{posConfig.icon}</span>
                <span>•</span>
                <span>#{player.number}</span>
                {nationalityInfo && (
                  <>
                    <span>•</span>
                    <span>
                      {nationalityInfo.flag} {nationalityInfo.name}
                    </span>
                  </>
                )}
                {player.club && (
                  <>
                    <span>•</span>
                    <span>🏟️ {player.club}</span>
                  </>
                )}
                {leagueCountryInfo && (
                  <>
                    <span>•</span>
                    <span>
                      {leagueCountryInfo.flag} {leagueCountryInfo.name}
                    </span>
                  </>
                )}
                {player.status && player.status !== "available" && (
                  <>
                    <span>•</span>
                    <span
                      className={
                        player.status === "suspended"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }
                    >
                      {t(`player.status.${player.status}` as TranslationKey)}
                    </span>
                  </>
                )}
              </div>
              {player.note && (
                <div className="text-slate-500 text-[11px] mt-1 truncate max-w-md">
                  {player.note}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0 ml-2 self-center">
            <button
              onClick={() => onStartEdit(player.id.value)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700/60"
            >
              {t("player.edit")}
            </button>
            <button
              onClick={() => onRemove(player.id.value)}
              className="px-2.5 py-1 bg-red-700/20 hover:bg-red-700/30 text-red-300 rounded-lg text-xs font-semibold transition-colors border border-red-500/20"
            >
              {t("player.delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
