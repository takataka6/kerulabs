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
import { useTacticsUI } from "@presentation/contexts/TacticsUIContext";
import { useTacticsTeam } from "@presentation/contexts/TacticsTeamContext";
import { useTacticsExecution } from "@presentation/contexts/TacticsExecutionContext";

export function TacticsModals() {
  const { ui } = useTacticsUI();
  const { selectedTeam, currentFormation, teamMgmt, formationMgmt } =
    useTacticsTeam();
  const { opponentsHook } = useTacticsExecution();

  const opponentFormation = opponentsHook.opponentFormationId
    ? formationMgmt.gameModeFormations.find(
        (f) => f.id.value === opponentsHook.opponentFormationId,
      )
    : undefined;

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
