/**
 * @module useSketchLayers
 * @description スケッチレイヤーの管理フック。
 * レイヤーの追加・削除・並替・表示切替・ストロークのUndo/クリアを提供する。
 */
import { useState, useCallback } from "react";
import type { SketchLayer } from "./types";

const MAX_LAYERS = 3;

const DEFAULT_LAYER: SketchLayer = {
  id: 1,
  strokes: [],
  visible: true,
  name: "Layer 1",
};

export interface UseSketchLayersReturn {
  layers: SketchLayer[];
  setLayers: React.Dispatch<React.SetStateAction<SketchLayer[]>>;
  activeLayerId: number;
  setActiveLayerId: React.Dispatch<React.SetStateAction<number>>;
  addLayer: () => void;
  removeLayer: (layerId: number) => void;
  renameLayer: (layerId: number, newName: string) => void;
  reorderLayers: (fromId: number, toId: number) => void;
  toggleLayerVisibility: (layerId: number) => void;
  undoLastStroke: () => void;
  clearLayer: () => void;
  clearAllStrokes: () => void;
}

/**
 * スケッチレイヤーを管理する。
 *
 * 最大3レイヤーの追加・削除・並替・表示切替と、
 * アクティブレイヤーのストロークUndo・クリアを提供する。
 *
 * @param onLayersChange - レイヤー変更時のコールバック（永続化用）
 */
export function useSketchLayers(
  onLayersChange: (layers: SketchLayer[]) => void,
): UseSketchLayersReturn {
  const [layers, setLayers] = useState<SketchLayer[]>([DEFAULT_LAYER]);
  const [activeLayerId, setActiveLayerId] = useState(1);

  const addLayer = useCallback(() => {
    setLayers((prev) => {
      if (prev.length >= MAX_LAYERS) return prev;
      const usedNums = new Set(prev.map((l) => l.id));
      let newId = 1;
      while (usedNums.has(newId)) newId++;
      const next = [
        ...prev,
        {
          id: newId,
          strokes: [],
          visible: true,
          name: `Layer ${newId}`,
        },
      ];
      setActiveLayerId(newId);
      onLayersChange(next);
      return next;
    });
  }, [onLayersChange]);

  const removeLayer = useCallback(
    (layerId: number) => {
      setLayers((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((l) => l.id !== layerId);
        if (activeLayerId === layerId) {
          setActiveLayerId(next[next.length - 1].id);
        }
        onLayersChange(next);
        return next;
      });
    },
    [activeLayerId, onLayersChange],
  );

  const renameLayer = useCallback(
    (layerId: number, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      setLayers((prev) => {
        const next = prev.map((layer) =>
          layer.id === layerId ? { ...layer, name: trimmed } : layer,
        );
        onLayersChange(next);
        return next;
      });
    },
    [onLayersChange],
  );

  const reorderLayers = useCallback(
    (fromId: number, toId: number) => {
      setLayers((prev) => {
        const fromIdx = prev.findIndex((l) => l.id === fromId);
        const toIdx = prev.findIndex((l) => l.id === toId);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        onLayersChange(next);
        return next;
      });
    },
    [onLayersChange],
  );

  const toggleLayerVisibility = useCallback(
    (layerId: number) => {
      setLayers((prev) => {
        const next = prev.map((layer) =>
          layer.id === layerId ? { ...layer, visible: !layer.visible } : layer,
        );
        onLayersChange(next);
        return next;
      });
    },
    [onLayersChange],
  );

  const undoLastStroke = useCallback(() => {
    setLayers((prev) => {
      const next = prev.map((layer) =>
        layer.id === activeLayerId
          ? { ...layer, strokes: layer.strokes.slice(0, -1) }
          : layer,
      );
      onLayersChange(next);
      return next;
    });
  }, [activeLayerId, onLayersChange]);

  const clearLayer = useCallback(() => {
    setLayers((prev) => {
      const next = prev.map((layer) =>
        layer.id === activeLayerId ? { ...layer, strokes: [] } : layer,
      );
      onLayersChange(next);
      return next;
    });
  }, [activeLayerId, onLayersChange]);

  const clearAllStrokes = useCallback(() => {
    setLayers((prev) => {
      const next = prev.map((layer) => ({ ...layer, strokes: [] }));
      onLayersChange(next);
      return next;
    });
  }, [onLayersChange]);

  return {
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    addLayer,
    removeLayer,
    renameLayer,
    reorderLayers,
    toggleLayerVisibility,
    undoLastStroke,
    clearLayer,
    clearAllStrokes,
  };
}
