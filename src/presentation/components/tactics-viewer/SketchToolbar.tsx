/**
 * @module SketchToolbar
 * @description スケッチモードのツールバーコンポーネント。ペン/直線/矢印ツール・色・太さ・レイヤー操作を表示する。
 */
import {
  memo,
  useState,
  useCallback,
  useRef,
  useEffect,
  type DragEvent,
} from "react";
import type { SketchTool, SketchLayer } from "@presentation/hooks/sketch";
import type { TranslationFn } from "./types";

// ── 色プリセット ──────────────────────────────────
const SKETCH_COLORS = [
  { hex: "#ef4444", name: "Red" },
  { hex: "#22d3ee", name: "Cyan" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#ffffff", name: "White" },
] as const;

// ── 太さプリセット ──────────────────────────────────
const WIDTH_OPTIONS = [
  { label: "S", value: 2 },
  { label: "M", value: 4 },
  { label: "L", value: 6 },
] as const;

// ── ツール定義 ──────────────────────────────────────
const TOOL_OPTIONS: {
  tool: SketchTool;
  icon: string;
  labelKey:
    | "tactics.sketch.pen"
    | "tactics.sketch.line"
    | "tactics.sketch.arrow";
}[] = [
  { tool: "pen", icon: "🖊️", labelKey: "tactics.sketch.pen" },
  { tool: "line", icon: "━", labelKey: "tactics.sketch.line" },
  { tool: "arrow", icon: "➜", labelKey: "tactics.sketch.arrow" },
];

const MAX_LAYERS = 3;

// ── 編集可能レイヤー名 ──────────────────────────────
const EditableLayerName = memo(function EditableLayerName({
  layerId,
  name,
  onRename,
}: {
  layerId: number;
  name: string;
  onRename: (id: number, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      onRename(layerId, trimmed);
    } else {
      setDraft(name);
    }
    setEditing(false);
  }, [draft, name, layerId, onRename]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(name);
            setEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 text-xs font-medium bg-slate-800 text-white rounded px-1 py-0.5 outline-none ring-1 ring-pink-500/50 min-w-0"
        maxLength={20}
      />
    );
  }

  return (
    <span
      className="text-xs font-medium flex-1 truncate cursor-text"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setDraft(name);
        setEditing(true);
      }}
      title="Double-click to rename"
    >
      {name}
    </span>
  );
});

interface SketchToolbarProps {
  activeTool: SketchTool;
  onToolChange: (tool: SketchTool) => void;
  strokeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onWidthChange: (width: number) => void;
  layers: SketchLayer[];
  activeLayerId: number;
  onLayerSelect: (id: number) => void;
  onToggleLayerVisibility: (id: number) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: number) => void;
  onRenameLayer: (id: number, name: string) => void;
  onReorderLayers: (fromId: number, toId: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onClearAll: () => void;
  t: TranslationFn;
}

export const SketchToolbar = memo(function SketchToolbar({
  activeTool,
  onToolChange,
  strokeColor,
  onColorChange,
  strokeWidth,
  onWidthChange,
  layers,
  activeLayerId,
  onLayerSelect,
  onToggleLayerVisibility,
  onAddLayer,
  onRemoveLayer,
  onRenameLayer,
  onReorderLayers,
  onUndo,
  onClear,
  onClearAll,
  t,
}: SketchToolbarProps) {
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const draggedIdRef = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, layerId: number) => {
      draggedIdRef.current = layerId;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(layerId));
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, layerId: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverId !== layerId) setDragOverId(layerId);
    },
    [dragOverId],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, targetId: number) => {
      e.preventDefault();
      const fromId = draggedIdRef.current;
      if (fromId != null && fromId !== targetId) {
        onReorderLayers(fromId, targetId);
      }
      draggedIdRef.current = null;
      setDragOverId(null);
    },
    [onReorderLayers],
  );

  const handleDragEnd = useCallback(() => {
    draggedIdRef.current = null;
    setDragOverId(null);
  }, []);

  return (
    <div
      className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5"
      data-sketch-toolbar="true"
    >
      {/* ツール選択 + カラー + 太さ */}
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-pink-500/40 shadow-2xl p-2.5 flex flex-col gap-2">
        {/* ツール */}
        <div className="flex items-center gap-1">
          {TOOL_OPTIONS.map(({ tool, icon, labelKey }) => (
            <button
              key={tool}
              onClick={() => onToolChange(tool)}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTool === tool
                  ? "bg-pink-600/30 text-pink-300 ring-1 ring-pink-500/50"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
              aria-label={t(labelKey)}
              aria-pressed={activeTool === tool}
            >
              <span className="text-sm">{icon}</span>
              <span className="text-[10px]">{t(labelKey)}</span>
            </button>
          ))}
        </div>

        {/* カラー */}
        <div className="flex items-center gap-1 justify-center">
          {SKETCH_COLORS.map(({ hex, name }) => (
            <button
              key={hex}
              onClick={() => onColorChange(hex)}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                strokeColor === hex
                  ? "border-white scale-125"
                  : "border-slate-600 hover:border-slate-400"
              }`}
              style={{ backgroundColor: hex }}
              aria-label={name}
            />
          ))}
        </div>

        {/* 太さ */}
        <div className="flex items-center gap-1 justify-center">
          {WIDTH_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onWidthChange(value)}
              className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                strokeWidth === value
                  ? "bg-pink-600/30 text-pink-300 ring-1 ring-pink-500/50"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
              aria-pressed={strokeWidth === value}
            >
              {label}
            </button>
          ))}
        </div>

        {/* アクション */}
        <div className="flex items-center gap-1 border-t border-slate-700/50 pt-2">
          <button
            onClick={onUndo}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
          >
            {t("tactics.sketch.undo")}
          </button>
          <button
            onClick={onClear}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
          >
            {t("tactics.sketch.clear")}
          </button>
          <button
            onClick={onClearAll}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200"
          >
            {t("tactics.sketch.clearAll")}
          </button>
        </div>
      </div>

      {/* レイヤーパネル */}
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-pink-500/40 shadow-2xl p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Layers
          </span>
          {layers.length < MAX_LAYERS && (
            <button
              onClick={onAddLayer}
              className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold transition-colors"
            >
              + {t("tactics.sketch.addLayer")}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          {[...layers].reverse().map((layer) => (
            <div
              key={layer.id}
              role="button"
              tabIndex={0}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, layer.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer transition-all duration-200 ${
                activeLayerId === layer.id
                  ? "bg-pink-600/20 text-pink-300"
                  : "text-slate-400 hover:bg-slate-800"
              } ${dragOverId === layer.id ? "ring-1 ring-pink-400/60" : ""}`}
              onClick={() => onLayerSelect(layer.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onLayerSelect(layer.id);
                }
              }}
            >
              {/* ドラッグハンドル */}
              <span
                className="text-[10px] text-slate-600 cursor-grab active:cursor-grabbing select-none"
                title="Drag to reorder"
              >
                ⠿
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLayerVisibility(layer.id);
                }}
                className={`w-4 h-4 flex items-center justify-center transition-colors ${
                  layer.visible
                    ? "text-slate-300 hover:text-slate-100"
                    : "text-slate-600 hover:text-slate-400"
                }`}
                aria-label={layer.visible ? "Hide layer" : "Show layer"}
              >
                {layer.visible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path
                      fillRule="evenodd"
                      d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z"
                      clipRule="evenodd"
                    />
                    <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41a1.651 1.651 0 0 1 0-1.186 10.007 10.007 0 0 1 2.569-3.898L4.22 6.493a2.5 2.5 0 0 0 3.287 3.287L10.748 13.93Z" />
                  </svg>
                )}
              </button>
              <EditableLayerName
                layerId={layer.id}
                name={layer.name}
                onRename={onRenameLayer}
              />
              {layers.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveLayer(layer.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                  aria-label="Delete layer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
