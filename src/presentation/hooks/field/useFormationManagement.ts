/**
 * @module useFormationManagement
 * @description フォーメーションの選択・切替・フィルタリングを管理するフック。ゲームモードに応じた一覧表示と自動選択を提供する。
 */
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Formation } from "@domain/entities/Formation";
import type { Team } from "@domain/entities/Team";
import type { GameMode } from "@domain/value-objects";
import type {
  FormationDataItem,
  OrchestratorActions,
} from "@presentation/components/tactics-viewer/types";
import { getFormationOptionsWithDefault } from "@shared/constants/formations";

/**
 * フォーメーションの選択・切替・フィルタリングを管理するフック。
 *
 * ゲームモードに応じたフォーメーション一覧のフィルタ、
 * チームのデフォルトフォーメーション自動選択、
 * フォーメーション変更時の状態リセットを提供する。
 *
 * `actionsRef` は TacticsViewerPage が管理する Ref で、
 * useTacticsOrchestration のコールバック・状態をレンダー毎に更新する。
 *
 * @param params.formations - React Query から取得した全フォーメーション。
 * @param params.gameMode - フォーメーションのフィルタに使用する現在のゲームモード。
 * @param params.selectedTeam - 現在選択中のチーム（デフォルトフォーメーションの参照用）。
 * @param params.actionsRef - オーケストレーターアクション（ポジションクリア、タクティクスリセット等）への安定した Ref。
 * @param params.resetHistory - Undo/Redo 履歴をクリアするコールバック。
 * @param params.pushCurrentSnapshot - リセット後にUndo/Redoスナップショットを記録するコールバック。
 * @returns 現在のフォーメーションID、フィルタ済みフォーメーション、派生値 `formationData`、
 *          エディター表示フラグ、および `changeFormation` ハンドラー。
 */
export function useFormationManagement(params: {
  formations: Formation[] | undefined;
  gameMode: GameMode;
  selectedTeam: Team | undefined;
  actionsRef: { current: OrchestratorActions };
  resetHistory: () => void;
  pushCurrentSnapshot: () => void;
}) {
  const {
    formations,
    gameMode,
    selectedTeam,
    actionsRef,
    resetHistory,
    pushCurrentSnapshot,
  } = params;

  const [currentFormationId, setCurrentFormationId] = useState<string | null>(
    null,
  );
  const [showFormationEditor, setShowFormationEditor] = useState(false);
  const previousSelectedTeamIdRef = useRef<string | null>(null);

  const gameModeFormations = useMemo(() => {
    if (!formations) return [];
    return formations.filter((f) => (f.gameMode || "football") === gameMode);
  }, [formations, gameMode]);

  const currentFormation = gameModeFormations.find(
    (f) => f.id.value === currentFormationId,
  );

  const formationData: FormationDataItem[] = useMemo(() => {
    if (!currentFormation) return [];
    return currentFormation.positions.map((p) => ({
      pos: p.pos,
      x: p.position.x,
      z: p.position.z,
      cat: p.category,
    }));
  }, [currentFormation]);

  // ── チーム/ゲームモード変更時にデフォルトフォーメーションを自動選択 ──
  useEffect(() => {
    if (!selectedTeam) {
      previousSelectedTeamIdRef.current = null;
      return;
    }
    if (gameModeFormations.length === 0) return;

    const selectedTeamId = selectedTeam.id?.value ?? "__selected-team__";
    const teamChanged = previousSelectedTeamIdRef.current !== selectedTeamId;
    previousSelectedTeamIdRef.current = selectedTeamId;

    const availableFormationNames = getFormationOptionsWithDefault(
      selectedTeam.availableFormations,
      gameMode,
    );
    const currentFormationSupported =
      !!currentFormation &&
      availableFormationNames.includes(currentFormation.name);

    if (!teamChanged && currentFormationSupported) return;

    if (
      selectedTeam.defaultFormation &&
      availableFormationNames.includes(selectedTeam.defaultFormation)
    ) {
      const defaultFormation = gameModeFormations.find(
        (f) => f.name === selectedTeam.defaultFormation,
      );
      if (defaultFormation) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- チーム変更時または無効な選択時にデフォルトへ再同期する派生状態
        setCurrentFormationId(defaultFormation.id.value);
        return;
      }
    }

    const fallbackFormation =
      gameModeFormations.find((f) => f.name === availableFormationNames[0]) ??
      gameModeFormations[0];

    setCurrentFormationId(fallbackFormation.id.value);
  }, [gameModeFormations, selectedTeam, gameMode, currentFormation]);

  const changeFormation = useCallback(
    (formationId: string) => {
      if (actionsRef.current.isExecuting) return;
      const newFormation = gameModeFormations.find(
        (f) => f.id.value === formationId,
      );
      if (!newFormation) return;

      setCurrentFormationId(formationId);
      actionsRef.current.clearManualPositions();
      actionsRef.current.resetTactic();
      resetHistory();
      requestAnimationFrame(() => pushCurrentSnapshot());
    },
    [actionsRef, gameModeFormations, resetHistory, pushCurrentSnapshot],
  );

  return {
    currentFormationId,
    setCurrentFormationId,
    showFormationEditor,
    setShowFormationEditor,
    gameModeFormations,
    currentFormation,
    formationData,
    changeFormation,
  };
}
