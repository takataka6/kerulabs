/**
 * @module usePlayerView
 * @description プレイヤー視点モードの状態管理フック。選手・相手マーカー選択による一人称視点カメラ切替を提供する。
 */
import { useState, useCallback, useRef } from "react";
import { PLAYER_VIEW_CAMERA } from "@shared/constants/threeConstants";

/**
 * プレイヤー視点モードの状態管理。
 *
 * 選手 / 相手マーカーを選択して一人称視点カメラに切り替える。
 *
 * @param onResetDragging - プレイヤー視点モード切替時にドラッグ状態をリセットするコールバック。
 * @returns ビューモードフラグ、選択中の選手/相手インデックス、クリックハンドラー、およびトグル/終了ヘルパー。
 */
export function usePlayerView(onResetDragging?: () => void) {
  const [playerViewEnabled, setPlayerViewEnabled] = useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null,
  );
  const [selectedOpponentViewId, setSelectedOpponentViewId] = useState<
    number | null
  >(null);
  const [isFirstPerson, setIsFirstPerson] = useState(false);

  // ボタンによる視点回転用の累積値（PlayerCameraController がフレーム毎に消費）
  const yawNudgeRef = useRef(0);

  const handlePlayerClickForView = useCallback(
    (index: number) => {
      if (!playerViewEnabled) return;
      setSelectedPlayerIndex(index);
      setSelectedOpponentViewId(null);
    },
    [playerViewEnabled],
  );

  const handleOpponentViewClick = useCallback(
    (opponentId: number) => {
      if (!playerViewEnabled) return;
      setSelectedOpponentViewId(opponentId);
      setSelectedPlayerIndex(null);
    },
    [playerViewEnabled],
  );

  /** 1人称 ↔ 3人称 トグル */
  const togglePerspective = useCallback(() => {
    setIsFirstPerson((prev) => !prev);
  }, []);

  const exitPlayerView = useCallback(() => {
    setPlayerViewEnabled(false);
    setSelectedPlayerIndex(null);
    setSelectedOpponentViewId(null);
    setIsFirstPerson(false);
  }, []);

  const togglePlayerView = useCallback(() => {
    onResetDragging?.();
    if (playerViewEnabled) {
      exitPlayerView();
    } else {
      setPlayerViewEnabled(true);
    }
  }, [playerViewEnabled, exitPlayerView, onResetDragging]);

  /** 視点を左に回転（yaw を正方向にナッジ） */
  const rotateLeft = useCallback(() => {
    yawNudgeRef.current += PLAYER_VIEW_CAMERA.YAW_MAX / 4;
  }, []);

  /** 視点を右に回転（yaw を負方向にナッジ） */
  const rotateRight = useCallback(() => {
    yawNudgeRef.current -= PLAYER_VIEW_CAMERA.YAW_MAX / 4;
  }, []);

  return {
    playerViewEnabled,
    setPlayerViewEnabled,
    selectedPlayerIndex,
    setSelectedPlayerIndex,
    selectedOpponentViewId,
    setSelectedOpponentViewId,
    handlePlayerClickForView,
    handleOpponentViewClick,
    exitPlayerView,
    togglePlayerView,
    isFirstPerson,
    togglePerspective,
    yawNudgeRef,
    rotateLeft,
    rotateRight,
  };
}
