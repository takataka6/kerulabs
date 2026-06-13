/**
 * @module useOpponents
 * @description 相手チームマーカーの配置・管理フック。フィールド上への個別配置やフォーメーション一括配置を制御する。
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import { DEFAULT_OPPONENT_MARKER_COLOR } from "@shared/constants/colors";
import { rafThrottle } from "@shared/utils/rafThrottle";
import type { Team } from "@domain/entities/Team";
import type { Formation } from "@domain/entities/Formation";
import type { Player } from "@domain/entities/Player";
import type {
  Opponent,
  TranslationFn,
} from "../../components/tactics-viewer/types";

/**
 * 相手チームマーカーの配置・管理。
 *
 * フィールド上への個別配置、チーム選択によるフォーメーション一括配置、
 * ドラッグ移動・削除を制御する。
 *
 * @param teams - 登録済みの全チーム（相手チーム選択用）。
 * @param gameModeFormations - 現在のゲームモードで利用可能なフォーメーション。
 * @param maxOpponents - フィールド上に配置可能な相手マーカーの最大数。
 * @param onPushSnapshot - 変更後にUndo/Redoスナップショットを保存するコールバック。
 * @param onDisableOtherModes - 他の排他モードを無効化するコールバック。
 * @param showToast - トースト通知コールバック。
 * @param t - i18n翻訳関数。
 * @returns 相手チーム配列、配置モード状態、チーム/フォーメーションセレクター、およびCRUDハンドラー。
 */
export function useOpponents(
  teams: Team[] | undefined,
  gameModeFormations: Formation[],
  maxOpponents: number,
  onPushSnapshot: () => void,
  onDisableOtherModes?: () => void,
  showToast?: (message: string, type: "success" | "error") => void,
  t?: TranslationFn,
) {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [opponentPlacementMode, setOpponentPlacementMode] = useState(false);
  const [nextOpponentId, setNextOpponentId] = useState(1);
  const [opponentTeamId, setOpponentTeamId] = useState<string | null>(null);
  const [selectedOpponentPlayerId, setSelectedOpponentPlayerId] = useState<
    string | null
  >(null);
  const [showOpponentFormationSelect, setShowOpponentFormationSelect] =
    useState(false);
  const [opponentFormationId, setOpponentFormationId] = useState<string | null>(
    null,
  );
  const [showOpponentSquadBuilder, setShowOpponentSquadBuilder] =
    useState(false);
  const [showOpponentNames, setShowOpponentNames] = useState(true);
  const [showOpponentNumbers, setShowOpponentNumbers] = useState(true);
  const [opponentMarkerColor, setOpponentMarkerColor] = useState(
    DEFAULT_OPPONENT_MARKER_COLOR,
  );

  const opponentTeam = useMemo(
    () => teams?.find((t) => t.id.value === opponentTeamId),
    [teams, opponentTeamId],
  );

  const handleFieldClick = useCallback(
    (pos: { x: number; z: number }, isDraggingObject: boolean) => {
      if (!opponentPlacementMode) return;
      if (isDraggingObject) return;
      if (opponents.length >= maxOpponents) return;

      if (opponentTeam && !selectedOpponentPlayerId) {
        showToast?.(t?.("tactics.opponents.selectPlayerAlert") || "", "error");
        return;
      }

      if (opponentTeam && selectedOpponentPlayerId) {
        const player = opponentTeam.players.find(
          (p) => p.id.value === selectedOpponentPlayerId,
        );
        if (!player) return;
        const isGk = player.position === "gk";
        setOpponents((prev) => [
          ...prev,
          {
            id: nextOpponentId,
            x: pos.x,
            z: pos.z,
            playerId: player.id.value,
            playerNumber: player.number,
            playerName: player.name,
            playerPosition: player.position,
            color: isGk
              ? opponentTeam.colors.gk.toHex()
              : opponentTeam.colors.main.toHex(),
          },
        ]);
        setSelectedOpponentPlayerId(null);
      } else {
        setOpponents((prev) => [
          ...prev,
          {
            id: nextOpponentId,
            x: pos.x,
            z: pos.z,
            color: opponentMarkerColor,
          },
        ]);
      }

      setNextOpponentId((prev) => prev + 1);
      requestAnimationFrame(() => onPushSnapshot());
    },
    [
      opponentPlacementMode,
      opponents.length,
      nextOpponentId,
      opponentTeam,
      selectedOpponentPlayerId,
      opponentMarkerColor,
      maxOpponents,
      onPushSnapshot,
      showToast,
      t,
    ],
  );

  // RAF スロットル: ドラッグ中の配列再マッピングを1フレームに1回に抑制する
  const throttledOpponentDrag = useMemo(
    () =>
      rafThrottle((id: number, pos: { x: number; z: number }) => {
        setOpponents((prev) =>
          prev.map((opp) =>
            opp.id === id ? { ...opp, x: pos.x, z: pos.z } : opp,
          ),
        );
      }),
    [],
  );
  useEffect(
    () => () => throttledOpponentDrag.cancel(),
    [throttledOpponentDrag],
  );

  const handleOpponentDrag = useCallback(
    (id: number, pos: { x: number; z: number }) => {
      throttledOpponentDrag(id, pos);
    },
    [throttledOpponentDrag],
  );

  const handleOpponentRemove = useCallback(
    (id: number) => {
      setOpponents((prev) => prev.filter((opp) => opp.id !== id));
      requestAnimationFrame(() => onPushSnapshot());
    },
    [onPushSnapshot],
  );

  const clearOpponents = useCallback(() => {
    setOpponents([]);
    setNextOpponentId(1);
    setSelectedOpponentPlayerId(null);
    requestAnimationFrame(() => onPushSnapshot());
  }, [onPushSnapshot]);

  const toggleOpponentPlacement = useCallback(() => {
    setOpponentPlacementMode((prev) => {
      if (prev) {
        setShowOpponentFormationSelect(false);
        setShowOpponentSquadBuilder(false);
        setOpponentFormationId(null);
      }
      return !prev;
    });
    onDisableOtherModes?.();
  }, [onDisableOtherModes]);

  const handleOpponentSquadComplete = useCallback(
    (players: (Player | null)[]) => {
      if (!opponentTeam || !opponentFormationId) return;
      const formation = gameModeFormations.find(
        (f) => f.id.value === opponentFormationId,
      );
      if (!formation) return;

      onPushSnapshot();

      const newOpponents: Opponent[] = [];
      let id = nextOpponentId;

      formation.positions.forEach((pos, index) => {
        const player = players[index];
        if (!player) return;
        const isGk = player.position === "gk";
        newOpponents.push({
          id: id++,
          x: pos.position.x * -1,
          z: pos.position.z * -1,
          playerId: player.id.value,
          playerNumber: player.number,
          playerName: player.name,
          playerPosition: player.position,
          color: isGk
            ? opponentTeam.colors.gk.toHex()
            : opponentTeam.colors.main.toHex(),
        });
      });

      setOpponents(newOpponents);
      setNextOpponentId(id);
      setShowOpponentSquadBuilder(false);
      setShowOpponentFormationSelect(false);
      setOpponentFormationId(null);

      requestAnimationFrame(() => onPushSnapshot());
    },
    [
      opponentTeam,
      opponentFormationId,
      gameModeFormations,
      nextOpponentId,
      onPushSnapshot,
    ],
  );

  /** selectedSquad から直接配置（SquadBuilder をスキップ） */
  const placeSquadDirectly = useCallback(
    (formationId: string, players: (Player | null)[]) => {
      if (!opponentTeam) return;
      const formation = gameModeFormations.find(
        (f) => f.id.value === formationId,
      );
      if (!formation) return;

      onPushSnapshot();

      const newOpponents: Opponent[] = [];
      let id = nextOpponentId;

      formation.positions.forEach((pos, index) => {
        const player = players[index];
        if (!player) return;
        const isGk = player.position === "gk";
        newOpponents.push({
          id: id++,
          x: pos.position.x * -1,
          z: pos.position.z * -1,
          playerId: player.id.value,
          playerNumber: player.number,
          playerName: player.name,
          playerPosition: player.position,
          color: isGk
            ? opponentTeam.colors.gk.toHex()
            : opponentTeam.colors.main.toHex(),
        });
      });

      setOpponents(newOpponents);
      setNextOpponentId(id);
      setShowOpponentFormationSelect(false);
      setOpponentFormationId(null);

      requestAnimationFrame(() => onPushSnapshot());
    },
    [opponentTeam, gameModeFormations, nextOpponentId, onPushSnapshot],
  );

  return {
    opponents,
    setOpponents,
    opponentPlacementMode,
    setOpponentPlacementMode,
    nextOpponentId,
    opponentTeamId,
    setOpponentTeamId,
    selectedOpponentPlayerId,
    setSelectedOpponentPlayerId,
    showOpponentFormationSelect,
    setShowOpponentFormationSelect,
    opponentFormationId,
    setOpponentFormationId,
    showOpponentSquadBuilder,
    setShowOpponentSquadBuilder,
    showOpponentNames,
    setShowOpponentNames,
    showOpponentNumbers,
    setShowOpponentNumbers,
    opponentMarkerColor,
    setOpponentMarkerColor,
    opponentTeam,
    handleFieldClick,
    handleOpponentDrag,
    handleOpponentRemove,
    clearOpponents,
    toggleOpponentPlacement,
    handleOpponentSquadComplete,
    placeSquadDirectly,
  };
}
