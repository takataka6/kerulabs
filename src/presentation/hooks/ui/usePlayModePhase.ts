/**
 * @module usePlayModePhase
 * @description ゲームモード・プレーモード・フェーズ・イベントの状態管理フック。攻守フェーズ切替やセットプレー選択を提供する。
 */
import { useState, useCallback, useMemo } from "react";
import type { PhaseKey } from "@shared/constants/phases";
import type { SetPlayType } from "@shared/constants/setPlayTypes";
import type { GameMode } from "@domain/value-objects";
import { getPitchConfig } from "@shared/constants/pitchConfig";
import type { OrchestratorActions } from "@presentation/components/tactics-viewer/types";

/**
 * ゲームモード・プレーモード（フィールド/セットプレー）・フェーズ・イベントの管理フック。
 *
 * フェーズ（attack / defense / transition 等）とセットプレータイプの切替、
 * イベント（ボール奪取/喪失）トグル、ゲームモード（football/futsal/8人制/ソサイチ）切替を提供する。
 *
 * `actionsRef` は TacticsViewerPage が管理する Ref で、
 * useTacticsOrchestration / useOpponents / useFormationManagement の
 * コールバックをレンダー毎に更新する。コールバック内で `.current` を読むため、
 * 呼び出し時点で常に最新値が得られる。
 *
 * @param params.actionsRef - オーケストレーターアクション（作成、リセット等）を保持する安定した Ref。
 * @param params.setSquadPanelOpen - セットプレーモード切替時にスカッドパネルを閉じるセッター。
 * @returns フェーズ、プレーモード、ゲームモードの状態と派生値 `activePhaseForTactics` / `pitchConfig`、
 *          およびモード変更・イベントトグルのハンドラー。
 */
export function usePlayModePhase(params: {
  actionsRef: { current: OrchestratorActions };
  setSquadPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { actionsRef, setSquadPanelOpen } = params;

  const [selectedPhase, setSelectedPhase] = useState<PhaseKey>("attack");
  const [gameMode, setGameMode] = useState<GameMode>("football");
  const pitchConfig = useMemo(() => getPitchConfig(gameMode), [gameMode]);
  const [playMode, setPlayMode] = useState<"field" | "setPlay">("field");
  const [selectedSetPlayType, setSelectedSetPlayType] =
    useState<SetPlayType>("set_piece");
  const activePhaseForTactics =
    playMode === "field" ? selectedPhase : selectedSetPlayType;

  const handlePlayModeChange = useCallback(
    (mode: "field" | "setPlay") => {
      if (mode === playMode) return;
      if (actionsRef.current.hasCreation) {
        actionsRef.current.cancelCreation();
        actionsRef.current.clearManualPositions();
      }
      actionsRef.current.resetTactic();
      setPlayMode(mode);
      if (mode === "setPlay") {
        setSquadPanelOpen(false);
      }
    },
    [actionsRef, playMode, setSquadPanelOpen],
  );

  const handleResetState = useCallback(() => {
    actionsRef.current.resetTactic();
    actionsRef.current.clearManualPositions();
  }, [actionsRef]);

  const handleGameModeChange = useCallback(
    (mode: GameMode) => {
      if (gameMode !== mode) {
        setGameMode(mode);
        actionsRef.current.resetTactic();
        actionsRef.current.clearManualPositions();
        actionsRef.current.resetOpponents();
        actionsRef.current.resetFormationId();
      }
    },
    [actionsRef, gameMode],
  );

  return {
    selectedPhase,
    setSelectedPhase,
    gameMode,
    pitchConfig,
    playMode,
    selectedSetPlayType,
    setSelectedSetPlayType,
    activePhaseForTactics,
    handlePlayModeChange,
    handleResetState,
    handleGameModeChange,
  };
}
