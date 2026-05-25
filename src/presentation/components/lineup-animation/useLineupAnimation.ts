/**
 * @module useLineupAnimation
 * @description ラインナップアニメーションの再生制御フック。フェーズ管理・プリセット選択・開始/スキップ/キャンセル操作を提供する。
 */
import { useState, useCallback, useRef, useEffect } from "react";
import type { AnimationPhase } from "./types";
import { getPlaybackSpeed } from "@shared/stores/playbackSpeedStore";

interface UseLineupAnimationReturn {
  phase: AnimationPhase;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  start: () => void;
  skip: () => void;
  cancel: () => void;
  onAnimationComplete: () => void;
  isActive: boolean;
}

export function useLineupAnimation(
  defaultPresetId: string = "classic-tv-reveal",
): UseLineupAnimationReturn {
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [selectedPresetId, setSelectedPresetId] = useState(defaultPresetId);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) {
      clearTimeout(t);
    }
    timersRef.current = [];
  }, []);

  // アンマウント時のクリーンアップ
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const start = useCallback(() => {
    setPhase("running");
  }, []);

  const skip = useCallback(() => {
    clearTimers();
    const speed = getPlaybackSpeed();
    const s = (ms: number) => (speed > 0 ? ms / speed : ms);
    setPhase("completing");
    const t = setTimeout(() => {
      setPhase("completed");
      const t2 = setTimeout(() => setPhase("idle"), s(500));
      timersRef.current.push(t2);
    }, s(400));
    timersRef.current.push(t);
  }, [clearTimers]);

  const cancel = useCallback(() => {
    clearTimers();
    setPhase("idle");
  }, [clearTimers]);

  const onAnimationComplete = useCallback(() => {
    const speed = getPlaybackSpeed();
    const s = (ms: number) => (speed > 0 ? ms / speed : ms);
    setPhase("completing");
    const t = setTimeout(() => {
      setPhase("completed");
      const t2 = setTimeout(() => setPhase("idle"), s(500));
      timersRef.current.push(t2);
    }, s(1000));
    timersRef.current.push(t);
  }, []);

  return {
    phase,
    selectedPresetId,
    setSelectedPresetId,
    start,
    skip,
    cancel,
    onAnimationComplete,
    isActive: phase === "running" || phase === "completing",
  };
}
