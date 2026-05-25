/**
 * @module useBridgeCallbacks
 * @description オーケストレーターレベルのブリッジコールバック群。
 * 各フック間を橋渡しするクリックハンドラ・カード操作・PNG保存などを統合する。
 */
import { useCallback } from "react";
import { getDateStamp } from "@shared/utils";
import type { useConnectionLines } from "../field/useConnectionLines";
import type { usePlayerView } from "../ui/usePlayerView";
import type { useMultiSelect } from "../ui/useMultiSelect";
import type { useCardManagement } from "../team/useCardManagement";
import type { useTeamManagement } from "../team/useTeamManagement";
import type { useManagerEditor } from "../team/useManagerEditor";
import type { Team } from "@domain/entities/Team";

interface UseBridgeCallbacksParams {
  connLines: ReturnType<typeof useConnectionLines>;
  playerView: ReturnType<typeof usePlayerView>;
  multiSelect: ReturnType<typeof useMultiSelect>;
  cardMgmt: ReturnType<typeof useCardManagement>;
  teamMgmt: ReturnType<typeof useTeamManagement>;
  managerEditor: ReturnType<typeof useManagerEditor>;
  pushCurrentSnapshot: () => void;
  teams: Team[] | undefined;
}

/**
 * オーケストレーターレベルのブリッジコールバック群を提供するフック。
 *
 * - handlePlayerClick: ライン描画 / プレイヤービュー / マルチ選択の分岐
 * - handleOpponentClick: プレイヤービュー / マルチ選択の分岐
 * - handleSquadCardCycle: スカッドパネルでのカード切り替え
 * - handleSaveManager: 監督名の保存
 * - handleCycleManagerCard: 監督カードの切り替え
 * - handleSavePng: 3Dキャンバス + スケッチのPNG保存
 */
export function useBridgeCallbacks({
  connLines,
  playerView,
  multiSelect,
  cardMgmt,
  teamMgmt,
  managerEditor,
  pushCurrentSnapshot,
  teams,
}: UseBridgeCallbacksParams) {
  const handlePlayerClick = useCallback(
    (index: number, event?: MouseEvent) => {
      if (connLines.lineDrawingMode) {
        connLines.handlePlayerClickForLine(index);
        return;
      }
      if (playerView.playerViewEnabled) {
        playerView.handlePlayerClickForView(index);
        return;
      }
      if (event && (event.metaKey || event.ctrlKey)) {
        multiSelect.toggleItem({ type: "player", index });
      } else {
        multiSelect.selectSingle({ type: "player", index });
      }
    },
    [connLines, playerView, multiSelect],
  );

  const handleOpponentClick = useCallback(
    (id: number, event?: MouseEvent) => {
      if (playerView.playerViewEnabled) {
        playerView.handleOpponentViewClick(id);
        return;
      }
      if (event && (event.metaKey || event.ctrlKey)) {
        multiSelect.toggleItem({ type: "opponent", id });
      } else {
        multiSelect.selectSingle({ type: "opponent", id });
      }
    },
    [playerView, multiSelect],
  );

  const handleSquadCardCycle = useCallback(
    (index: number) => {
      cardMgmt.setPlayerCards((prev) => {
        const updated = {
          ...prev,
          [index]: cardMgmt.cycleCard(prev[index] || "none"),
        };
        if (teamMgmt.selectedTeam) {
          teamMgmt.selectedTeam.updatePlayerCards(updated);
          teamMgmt.handleUpdateTeam(teamMgmt.selectedTeam);
        }
        return updated;
      });
      requestAnimationFrame(() => pushCurrentSnapshot());
    },
    [cardMgmt, teamMgmt, pushCurrentSnapshot],
  );

  const handleSaveManager = useCallback(
    (name: string) => {
      if (teamMgmt.selectedTeam) {
        teamMgmt.selectedTeam.updateManager(name || undefined);
        teamMgmt.handleUpdateTeam(teamMgmt.selectedTeam);
      }
      managerEditor.cancelEditing();
    },
    [teamMgmt, managerEditor],
  );

  const handleCycleManagerCard = useCallback(() => {
    const newCard = cardMgmt.cycleCard(cardMgmt.managerCard);
    cardMgmt.setManagerCard(newCard);
    if (teamMgmt.selectedTeam) {
      teamMgmt.selectedTeam.updateManagerCard(newCard);
      teamMgmt.handleUpdateTeam(teamMgmt.selectedTeam);
    }
    requestAnimationFrame(() => pushCurrentSnapshot());
  }, [cardMgmt, teamMgmt, pushCurrentSnapshot]);

  const handleSavePng = useCallback(() => {
    const threeCanvas = document.querySelector(
      "canvas:not(#sketch-canvas)",
    ) as HTMLCanvasElement | null;
    if (!threeCanvas) return;

    const sketchCanvas = document.getElementById(
      "sketch-canvas",
    ) as HTMLCanvasElement | null;

    let dataUrl: string;
    if (sketchCanvas && sketchCanvas.width > 0 && sketchCanvas.height > 0) {
      const composite = document.createElement("canvas");
      composite.width = threeCanvas.width;
      composite.height = threeCanvas.height;
      const ctx = composite.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(threeCanvas, 0, 0);
      ctx.drawImage(sketchCanvas, 0, 0, composite.width, composite.height);
      dataUrl = composite.toDataURL("image/png");
    } else {
      dataUrl = threeCanvas.toDataURL("image/png");
    }

    const link = document.createElement("a");
    const teamName =
      teams?.find((tm) => tm.id.value === teamMgmt.selectedTeamId)?.name ||
      "tactics";
    link.download = `${teamName}_${getDateStamp()}.png`;
    link.href = dataUrl;
    link.click();
  }, [teams, teamMgmt.selectedTeamId]);

  return {
    handlePlayerClick,
    handleOpponentClick,
    handleSquadCardCycle,
    handleSaveManager,
    handleCycleManagerCard,
    handleSavePng,
  };
}
