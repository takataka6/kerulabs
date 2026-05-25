/**
 * @module TacticsModals
 * @description タクティクスビューアーのモーダル群コンポーネント。スカッド・フォーメーション編集・ラインナップ表示モーダルを統合する。
 *
 * 使用するContext:
 * - TacticsUIContext: モーダル表示フラグ（showPlayerManagement, showSquadBuilder）
 * - TacticsTeamContext: チーム・フォーメーション情報
 * - TacticsExecutionContext: 相手チーム操作（opponentsHook）
 */
import { PlayerManagement } from "../player-management/PlayerManagement";
import { SquadBuilder } from "@presentation/components/team";
import { OpponentFormationSelectModal } from "./OpponentFormationSelectModal";
import { useTacticsUI } from "@presentation/contexts/TacticsUIContext";
import { useTacticsTeam } from "@presentation/contexts/TacticsTeamContext";
import { useTacticsExecution } from "@presentation/contexts/TacticsExecutionContext";
import { getFormationOptionsWithDefault } from "@shared/constants/formations";

export function TacticsModals() {
  const { ui } = useTacticsUI();
  const { selectedTeam, currentFormation, teamMgmt, formationMgmt } =
    useTacticsTeam();
  const { opponentsHook, playModePhase } = useTacticsExecution();

  const { opponentTeam } = opponentsHook;
  const availableOpponentFormationNames = opponentTeam
    ? new Set(
        getFormationOptionsWithDefault(
          opponentTeam.availableFormations,
          playModePhase.gameMode,
        ),
      )
    : null;
  const availableOpponentFormations = availableOpponentFormationNames
    ? formationMgmt.gameModeFormations.filter((f) =>
        availableOpponentFormationNames.has(f.name),
      )
    : [];

  const opponentFormation = opponentsHook.opponentFormationId
    ? formationMgmt.gameModeFormations.find(
        (f) => f.id.value === opponentsHook.opponentFormationId,
      )
    : undefined;

  const handleCloseFormationSelect = () => {
    opponentsHook.setShowOpponentFormationSelect(false);
    opponentsHook.setOpponentFormationId(null);
  };

  const handleSelectFormation = (formationId: string) => {
    const team = opponentsHook.opponentTeam;
    if (!team) return;

    if (team.selectedSquad && team.selectedSquad.length > 0) {
      const players = team.selectedSquad.map((pid) =>
        pid ? team.players.find((p) => p.id.value === pid) || null : null,
      );
      opponentsHook.placeSquadDirectly(formationId, players);
    } else {
      opponentsHook.setOpponentFormationId(formationId);
      opponentsHook.setShowOpponentFormationSelect(false);
      opponentsHook.setShowOpponentSquadBuilder(true);
    }
  };

  return (
    <>
      {ui.showPlayerManagement && (
        <PlayerManagement
          team={selectedTeam}
          onUpdateTeam={teamMgmt.handleUpdateTeam}
          onClose={() => ui.setShowPlayerManagement(false)}
        />
      )}

      {ui.showSquadBuilder && currentFormation && (
        <SquadBuilder
          team={selectedTeam}
          formation={currentFormation}
          selectedPlayers={teamMgmt.customSquad}
          onUpdateSquad={teamMgmt.handleUpdateSquad}
          onClose={() => ui.setShowSquadBuilder(false)}
        />
      )}

      {opponentsHook.showOpponentFormationSelect &&
        opponentsHook.opponentTeam && (
          <OpponentFormationSelectModal
            teamName={opponentsHook.opponentTeam.name}
            formations={availableOpponentFormations}
            onSelect={handleSelectFormation}
            onClose={handleCloseFormationSelect}
          />
        )}

      {/* 相手チーム SquadBuilder */}
      {opponentsHook.showOpponentSquadBuilder &&
        opponentsHook.opponentTeam &&
        opponentFormation && (
          <SquadBuilder
            team={opponentsHook.opponentTeam}
            formation={opponentFormation}
            selectedPlayers={[]}
            onUpdateSquad={opponentsHook.handleOpponentSquadComplete}
            onClose={() => {
              opponentsHook.setShowOpponentSquadBuilder(false);
              opponentsHook.setOpponentFormationId(null);
            }}
          />
        )}
    </>
  );
}
