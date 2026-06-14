/**
 * @module PlayerCameraController
 * @description プレイヤー視点カメラ制御コンポーネント。常時マウント・マウスドラッグで左右見回し対応。
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { Vector3 } from "three";
import type CameraControlsImpl from "camera-controls";
import {
  getDefaultCameraParams,
  clampYaw,
  clampPitch,
  computePlayerViewCamera,
} from "@presentation/utils/threeCalculations";
import { CAMERA_CONTROLS } from "@shared/constants/threeConstants";
import type { PlayerCameraControllerProps } from "./SceneTypes";

export function PlayerCameraController({
  selectedPlayerIndex,
  playerPositions,
  isPlayerView,
  isDraggingObject,
  selectedOpponentId,
  opponentPositions,
  pitchConfig,
  fieldLocked,
  touchlineLocked,
  cameraAction,
  onCameraActionDone,
  yawNudgeRef,
  isFirstPerson,
}: PlayerCameraControllerProps) {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const gm = pitchConfig?.gameMode;
  const {
    camY: defaultCamY,
    camZ: defaultCamZ,
    targetZ: defaultTargetZ,
  } = getDefaultCameraParams(gm || "football");
  const smoothCamPos = useRef(new Vector3(0, defaultCamY, defaultCamZ));
  const smoothLookAt = useRef(new Vector3(0, 0, defaultTargetZ));
  // フレーム毎のGC負荷を避けるため事前確保
  const targetCamPosRef = useRef(new Vector3());
  const targetLookAtRef = useRef(new Vector3());
  const wasPlayerView = useRef(false);
  const savedOrbitCamPosRef = useRef(new Vector3(0, defaultCamY, defaultCamZ));
  const savedOrbitLookAtRef = useRef(new Vector3(0, 0, defaultTargetZ));

  // マウスドラッグによる視点回転
  const yawAngle = useRef(0); // 水平回転角度（ラジアン）
  const pitchAngle = useRef(0); // 垂直回転角度（ラジアン）
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const prevSelectedPlayer = useRef<number | null>(null);

  const { gl } = useThree();

  const saveOrbitCameraState = useCallback(() => {
    if (!controlsRef.current) return;

    controlsRef.current.getPosition(savedOrbitCamPosRef.current, false);
    controlsRef.current.getTarget(savedOrbitLookAtRef.current, false);
  }, []);

  // 修飾キー（Cmd/Ctrl/Shift）押下中はカメラ操作を無効化
  const [modifierKeyHeld, setModifierKeyHeld] = useState(false);
  useEffect(() => {
    const update = (e: KeyboardEvent) => {
      setModifierKeyHeld(e.metaKey || e.ctrlKey || e.shiftKey);
    };
    window.addEventListener("keydown", update);
    window.addEventListener("keyup", update);
    return () => {
      window.removeEventListener("keydown", update);
      window.removeEventListener("keyup", update);
    };
  }, []);

  // 選手切り替え時にyaw/pitchをリセット（自チーム or 相手チーム）
  const currentKey =
    selectedOpponentId != null
      ? `opp_${selectedOpponentId}`
      : `player_${selectedPlayerIndex}`;
  const prevKey = useRef<string | null>(null);

  if (currentKey !== prevKey.current) {
    prevKey.current = currentKey;
    prevSelectedPlayer.current = selectedPlayerIndex;
    yawAngle.current = 0;
    pitchAngle.current = 0;
  }

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!isPlayerView) return;
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
    },
    [isPlayerView],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !isPlayerView) return;
      const dx = e.clientX - lastMouseX.current;
      const dy = e.clientY - lastMouseY.current;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;

      yawAngle.current = clampYaw(
        yawAngle.current - dx * CAMERA_CONTROLS.YAW_SENSITIVITY,
      );
      pitchAngle.current = clampPitch(
        pitchAngle.current - dy * CAMERA_CONTROLS.PITCH_SENSITIVITY,
      );
    },
    [isPlayerView],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [gl, handleMouseDown, handleMouseMove, handleMouseUp]);

  // 初期カメラターゲット設定（マウント時のみ）
  const initialCameraSet = useRef(false);
  useEffect(() => {
    if (
      initialCameraSet.current ||
      !controlsRef.current ||
      defaultTargetZ === 0
    )
      return;
    initialCameraSet.current = true;
    controlsRef.current.setLookAt(
      0,
      defaultCamY,
      defaultCamZ,
      0,
      0,
      defaultTargetZ,
      false,
    );
    savedOrbitCamPosRef.current.set(0, defaultCamY, defaultCamZ);
    savedOrbitLookAtRef.current.set(0, 0, defaultTargetZ);
  }, [defaultCamY, defaultCamZ, defaultTargetZ]);

  // カメラアクション処理（真上 / デフォルト位置）
  useEffect(() => {
    if (!cameraAction || !controlsRef.current) return;
    if (isPlayerView) {
      onCameraActionDone?.();
      return;
    }
    if (cameraAction === "topDown") {
      // 真上からの俯瞰（polarAngle ≒ 0）
      controlsRef.current.setLookAt(0, defaultCamY + 4, 0, 0, 0, 0, true);
    } else if (cameraAction === "sideView") {
      // 右横から
      const sideX = -Math.abs(defaultCamZ);
      controlsRef.current.setLookAt(sideX, defaultCamY, 0, 0, 0, 0, true);
    } else if (cameraAction === "sideViewReverse") {
      // 左横から（反対側）
      const sideX = Math.abs(defaultCamZ);
      controlsRef.current.setLookAt(sideX, defaultCamY, 0, 0, 0, 0, true);
    } else if (cameraAction === "reset") {
      // デフォルト位置に戻す
      controlsRef.current.setLookAt(
        0,
        defaultCamY,
        defaultCamZ,
        0,
        0,
        defaultTargetZ,
        true,
      );
    }
    smoothCamPos.current.set(0, defaultCamY, defaultCamZ);
    smoothLookAt.current.set(0, 0, defaultTargetZ);
    saveOrbitCameraState();
    onCameraActionDone?.();
  }, [
    cameraAction,
    isPlayerView,
    defaultCamY,
    defaultCamZ,
    defaultTargetZ,
    onCameraActionDone,
    saveOrbitCameraState,
  ]);

  // タッチライン水平固定: 水平回転(azimuth)をロックし、ズーム・チルトは許可
  useEffect(() => {
    if (!controlsRef.current || isPlayerView) return;
    if (touchlineLocked) {
      const currentAzimuth = controlsRef.current.azimuthAngle;
      controlsRef.current.minAzimuthAngle = currentAzimuth;
      controlsRef.current.maxAzimuthAngle = currentAzimuth;
    } else {
      controlsRef.current.minAzimuthAngle = -Infinity;
      controlsRef.current.maxAzimuthAngle = Infinity;
    }
  }, [touchlineLocked, isPlayerView]);

  // ドラッグ中でなければyaw/pitchを徐々に0に戻す
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (!wasPlayerView.current && isPlayerView) {
      saveOrbitCameraState();
    }

    // プレイヤービュー → 俯瞰に戻る遷移
    if (wasPlayerView.current && !isPlayerView) {
      wasPlayerView.current = false;
      yawAngle.current = 0;
      pitchAngle.current = 0;
      controlsRef.current.setLookAt(
        savedOrbitCamPosRef.current.x,
        savedOrbitCamPosRef.current.y,
        savedOrbitCamPosRef.current.z,
        savedOrbitLookAtRef.current.x,
        savedOrbitLookAtRef.current.y,
        savedOrbitLookAtRef.current.z,
        true,
      );
      smoothCamPos.current.copy(savedOrbitCamPosRef.current);
      smoothLookAt.current.copy(savedOrbitLookAtRef.current);
      // enabled=trueに戻った状態なのでdreiのuseFrameがupdate()を呼ぶ
      return;
    }

    wasPlayerView.current = isPlayerView;

    if (!isPlayerView) {
      // enabled=false 時は drei が update() を呼ばないため手動で駆動する
      if (fieldLocked || modifierKeyHeld) controlsRef.current.update(delta);
      return;
    }

    // 追跡対象の位置を取得（相手選手 or 自チーム選手）
    let viewPos: { x: number; z: number } | null = null;
    let isOpponentView = false;

    if (selectedOpponentId != null && opponentPositions) {
      const opp = opponentPositions.find((o) => o.id === selectedOpponentId);
      if (opp) {
        viewPos = { x: opp.x, z: opp.z };
        isOpponentView = true;
      }
    } else if (selectedPlayerIndex !== null) {
      viewPos = playerPositions[selectedPlayerIndex] || null;
    }

    if (!viewPos) return;

    // ドラッグを離しても現在の視線角度を保持する（スナップバック無効）

    // HUDボタンによるyawナッジを消費
    if (
      yawNudgeRef &&
      yawNudgeRef.current != null &&
      yawNudgeRef.current !== 0
    ) {
      yawAngle.current = clampYaw(yawAngle.current + yawNudgeRef.current);
      (yawNudgeRef as React.MutableRefObject<number>).current = 0;
    }

    // 方向係数: 自チーム=+1（+Z方向を前方）、相手チーム=-1（-Z方向を前方）
    const dirSign = isOpponentView ? -1 : 1;

    // カメラ位置・注視点を算出
    const { camPos, lookAt } = computePlayerViewCamera(
      viewPos,
      yawAngle.current,
      pitchAngle.current,
      dirSign,
      isFirstPerson,
    );
    targetCamPosRef.current.set(camPos.x, camPos.y, camPos.z);
    targetLookAtRef.current.set(lookAt.x, lookAt.y, lookAt.z);

    smoothCamPos.current.lerp(
      targetCamPosRef.current,
      CAMERA_CONTROLS.LERP_FACTOR,
    );
    smoothLookAt.current.lerp(
      targetLookAtRef.current,
      CAMERA_CONTROLS.LERP_FACTOR,
    );

    controlsRef.current.setLookAt(
      smoothCamPos.current.x,
      smoothCamPos.current.y,
      smoothCamPos.current.z,
      smoothLookAt.current.x,
      smoothLookAt.current.y,
      smoothLookAt.current.z,
      false,
    );

    // enabled=false時はdreiがupdate()を呼ばないため、手動で呼ぶ
    controlsRef.current.update(delta);
  });

  return (
    <CameraControls
      ref={controlsRef}
      enabled={
        !isPlayerView && !isDraggingObject && !fieldLocked && !modifierKeyHeld
      }
      minPolarAngle={CAMERA_CONTROLS.MIN_POLAR_ANGLE}
      maxPolarAngle={CAMERA_CONTROLS.MAX_POLAR_ANGLE}
      minDistance={CAMERA_CONTROLS.MIN_DISTANCE}
      maxDistance={CAMERA_CONTROLS.MAX_DISTANCE}
      smoothTime={CAMERA_CONTROLS.SMOOTH_TIME}
    />
  );
}
