/**
 * @module PlayerAddForm
 * @description 選手の新規追加フォームコンポーネント。選手情報の入力と画像アップロードを行う。
 */
import { useState } from "react";
import type { Team } from "@domain/entities/Team";
import { Player } from "@domain/entities/Player";
import type { PositionCategory } from "@domain/types";
import type { PlayerStatus } from "@shared/types/PlayerStatus";
import { isValidPlayerNumber } from "@shared/utils";
import type { TranslationKey } from "@shared/i18n/translations";
import { handleError } from "@shared/errors";
import { useToast } from "@presentation/components/ui";
import { PlayerFormFields } from "./PlayerFormFields";

interface PlayerAddFormProps {
  team: Team;
  onUpdateTeam: (team: Team) => void;
  onClose: () => void;
  language: "ja" | "en";
  t: (key: TranslationKey) => string;
}

export function PlayerAddForm({
  team,
  onUpdateTeam,
  onClose,
  language,
  t,
}: PlayerAddFormProps) {
  const { showToast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerPosition, setPositionCategory] =
    useState<PositionCategory>("mf");
  const [playerNationality, setPlayerNationality] = useState("");
  const [playerClub, setPlayerClub] = useState("");
  const [playerLeagueCountry, setPlayerLeagueCountry] = useState("");
  const [playerNote, setPlayerNote] = useState("");
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("available");

  const handleAddPlayer = () => {
    if (!playerName.trim() || !playerNumber) {
      showToast(t("player.nameNumberRequired"), "error");
      return;
    }

    const number = parseInt(playerNumber, 10);
    if (!isValidPlayerNumber(number)) {
      showToast(t("player.numberRange"), "error");
      return;
    }

    if (team.players.some((p) => p.number === number)) {
      showToast(
        t("player.numberInUse").replace("{number}", String(number)),
        "error",
      );
      return;
    }

    try {
      const newPlayer = Player.create({
        name: playerName.trim(),
        number,
        teamId: team.id,
        position: playerPosition,
        nationality: playerNationality.trim() || undefined,
        club: playerClub.trim() || undefined,
        leagueCountry: playerLeagueCountry.trim() || undefined,
        note: playerNote.trim() || undefined,
        status: playerStatus,
      });
      team.addPlayer(newPlayer);
      onUpdateTeam(team);
      onClose();
    } catch (error) {
      handleError(error, "ui", "Failed to add player", {
        toast: {
          show: showToast,
          message:
            error instanceof Error ? error.message : t("player.addFailed"),
        },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden mb-5">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-[10px] text-slate-200 font-bold tracking-widest uppercase flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
          <span>{t("player.newPlayer")}</span>
        </h3>
      </div>
      <div className="p-4">
        <PlayerFormFields
          name={playerName}
          onNameChange={setPlayerName}
          number={playerNumber}
          onNumberChange={setPlayerNumber}
          position={playerPosition}
          onPositionChange={setPositionCategory}
          nationality={playerNationality}
          onNationalityChange={setPlayerNationality}
          club={playerClub}
          onClubChange={setPlayerClub}
          leagueCountry={playerLeagueCountry}
          onLeagueCountryChange={setPlayerLeagueCountry}
          note={playerNote}
          onNoteChange={setPlayerNote}
          status={playerStatus}
          onStatusChange={setPlayerStatus}
          language={language}
          t={t}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddPlayer}
            className="flex-1 py-2.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
          >
            {t("player.add")}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700/60"
          >
            {t("player.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
