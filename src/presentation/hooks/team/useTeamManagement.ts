/**
 * @module useTeamManagement
 * @description チームのCRUD・スカッド管理を行うフック。
 * チーム選択、作成、更新、削除、一括インポート、スカッド更新を提供する。
 *
 * 責務ごとに分割された子フックを合成する構造:
 * - {@link useTeamCrud} チームのCRUD操作
 * - {@link useSquadManagement} スカッドと交代の管理
 */
import { useState, useEffect, useCallback } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { Team } from "@domain/entities/Team";
import type { TranslationKey } from "@shared/i18n/translations";
import type { CardStatus } from "@presentation/components/three";
import type { useCardManagement } from "./useCardManagement";
import { useTeamCrud } from "./useTeamCrud";
import { useSquadManagement } from "./useSquadManagement";

/**
 * チームの CRUD・スカッド管理を行うフック。
 *
 * チーム選択、作成、更新、削除、一括インポート、スカッド更新を提供し、
 * チーム変更時のカード初期化とスカッド同期の Effect も含む。
 *
 * @param params.teams - React Queryからの現在のチーム一覧。
 * @param params.queryClient - キャッシュ無効化用のTanStack Queryクライアント。
 * @param params.showToast - トースト通知コールバック。
 * @param params.cardMgmt - カード管理フックのインスタンス（チーム変更時に同期）。
 * @param params.resetHistory - チーム切替時にUndo/Redo履歴をクリアするコールバック。
 * @param params.pushCurrentSnapshot - 初回のUndo/Redoスナップショットを記録するコールバック。
 * @param params.t - i18n翻訳関数。
 * @returns 選択チーム状態、CRUDハンドラー、スカッド更新ハンドラー、およびモーダル表示フラグ。
 */
export function useTeamManagement(params: {
  teams: Team[] | undefined;
  queryClient: QueryClient;
  showToast: (msg: string, type: "success" | "error") => void;
  cardMgmt: ReturnType<typeof useCardManagement>;
  resetHistory: () => void;
  pushCurrentSnapshot: () => void;
  t: (key: TranslationKey) => string;
}) {
  const {
    teams,
    queryClient,
    showToast,
    cardMgmt,
    resetHistory,
    pushCurrentSnapshot,
    t,
  } = params;

  // ── State ──
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showTeamSelection, setShowTeamSelection] = useState(true);
  const [showTeamCreator, setShowTeamCreator] = useState(false);
  const [showBulkTeamImport, setShowBulkTeamImport] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const selectedTeam = teams?.find((tm) => tm.id.value === selectedTeamId);
  const editingTeam = editingTeamId
    ? teams?.find((tm) => tm.id.value === editingTeamId)
    : undefined;

  // ── 子フック合成 ──
  const squadMgmt = useSquadManagement({
    selectedTeam,
    queryClient,
    showToast,
    t,
  });

  const teamCrud = useTeamCrud({
    queryClient,
    selectedTeamId,
    showToast,
    t,
    onTeamCreated: useCallback(
      (teamId: string) => {
        setSelectedTeamId(teamId);
        squadMgmt.setCustomSquad([]);
        setShowTeamSelection(false);
        setShowTeamCreator(false);
      },
      [squadMgmt],
    ),
    onTeamDeleted: useCallback(() => {
      setSelectedTeamId(null);
      squadMgmt.setCustomSquad([]);
      setShowTeamSelection(true);
    }, [squadMgmt]),
    onBulkImportComplete: useCallback(() => {
      setShowBulkTeamImport(false);
    }, []),
  });

  // ── チーム変更時のカード初期化 ──
  useEffect(() => {
    if (selectedTeam) {
      cardMgmt.setPlayerCards(
        (selectedTeam.playerCards as Record<number, CardStatus>) || {},
      );
      cardMgmt.setManagerCard(
        (selectedTeam.managerCard as CardStatus) || "none",
      );
    } else {
      cardMgmt.setPlayerCards({});
      cardMgmt.setManagerCard("none");
    }
    resetHistory();
    requestAnimationFrame(() => pushCurrentSnapshot());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cardMgmtのsetter、resetHistory、pushCurrentSnapshotは安定参照。チームIDの変更時のみ再実行する
  }, [selectedTeam?.id.value]);

  return {
    selectedTeamId,
    setSelectedTeamId,
    selectedTeam,
    showTeamSelection,
    setShowTeamSelection,
    showTeamCreator,
    setShowTeamCreator,
    showBulkTeamImport,
    setShowBulkTeamImport,
    editingTeam,
    setEditingTeamId,
    customSquad: squadMgmt.customSquad,
    setCustomSquad: squadMgmt.setCustomSquad,
    substitutionRecords: squadMgmt.substitutionRecords,
    handleCreateTeam: teamCrud.handleCreateTeam,
    handleUpdateTeam: teamCrud.handleUpdateTeam,
    handleDeleteTeam: teamCrud.handleDeleteTeam,
    handleBulkTeamImport: teamCrud.handleBulkTeamImport,
    handleUpdateSquad: squadMgmt.handleUpdateSquad,
    handleSubstitution: squadMgmt.handleSubstitution,
    handleSwapPositions: squadMgmt.handleSwapPositions,
    resetSubstitutions: squadMgmt.resetSubstitutions,
  };
}
