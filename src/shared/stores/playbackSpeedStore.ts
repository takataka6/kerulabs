/**
 * @module playbackSpeedStore
 * @description 再生速度のグローバルストア。TacticExecutor・Player・BallTrajectory など
 * 複数モジュールから参照される再生速度を一元管理する。
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let currentSpeed = 1;

/** 現在の再生速度倍率を取得する */
export function getPlaybackSpeed(): number {
  return currentSpeed;
}

/** 再生速度倍率を設定する */
export function setPlaybackSpeed(speed: number): void {
  if (speed === currentSpeed) return;
  currentSpeed = speed;
  listeners.forEach((fn) => fn());
}

/** 再生速度変更を購読する（React の useSyncExternalStore 用） */
export function subscribePlaybackSpeed(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 利用可能な再生速度オプション */
export const PLAYBACK_SPEED_OPTIONS = [0.25, 0.5, 1, 1.5] as const;
export type PlaybackSpeedOption = (typeof PLAYBACK_SPEED_OPTIONS)[number];
