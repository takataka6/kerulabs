/**
 * @module useSketchPersistence
 * @description スケッチデータのIndexedDB永続化を管理するフック。
 * デバウンス付き保存とマウント時のロードを提供する。
 */
import { useRef, useCallback, useEffect } from "react";
import type { SketchLayer } from "./types";
import { SketchStorage } from "@infrastructure/repositories/indexeddb/SketchStorage";
import { handleError } from "@shared/errors/handleError";

const SAVE_DEBOUNCE_MS = 1_000;

export interface UseSketchPersistenceReturn {
  scheduleSave: (updatedLayers: SketchLayer[]) => void;
  loadSketch: () => Promise<{
    layers: SketchLayer[];
    activeLayerId: number;
    maxStrokeId: number;
  } | null>;
}

/**
 * スケッチデータのIndexedDB永続化を管理する。
 *
 * デバウンス付き保存（1秒）とマウント時のロードを提供し、
 * アンマウント時にタイマーをクリーンアップする。
 *
 * @param activeLayerId - 現在のアクティブレイヤーID（保存メタデータ用）
 */
export function useSketchPersistence(
  activeLayerId: number,
): UseSketchPersistenceReturn {
  const storageRef = useRef<SketchStorage | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // デバウンス中にレイヤーが切り替わっても最新値を使えるよう ref で追跡
  const activeLayerIdRef = useRef(activeLayerId);
  useEffect(() => {
    activeLayerIdRef.current = activeLayerId;
  }, [activeLayerId]);

  const getStorage = useCallback(() => {
    if (!storageRef.current) {
      storageRef.current = new SketchStorage();
    }
    return storageRef.current;
  }, []);

  const scheduleSave = useCallback(
    (updatedLayers: SketchLayer[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          const storage = getStorage();
          await storage.saveSketch({
            id: "current",
            layers: updatedLayers,
            activeLayerId: activeLayerIdRef.current,
            updatedAt: Date.now(),
          });
        } catch (error) {
          handleError(error, "database", "Failed to save sketch");
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [getStorage],
  );

  const loadSketch = useCallback(async () => {
    const storage = getStorage();
    const record = await storage.loadSketch();
    if (!record || record.layers.length === 0) return null;

    let maxId = 0;
    for (const layer of record.layers) {
      for (const s of layer.strokes) {
        if (s.id > maxId) maxId = s.id;
      }
    }

    return {
      layers: record.layers,
      activeLayerId: record.activeLayerId,
      maxStrokeId: maxId,
    };
  }, [getStorage]);

  // アンマウント時にタイマークリーンアップ
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, []);

  return { scheduleSave, loadSketch };
}
