/**
 * @module TacticsCanvas
 * @description 3Dフィールドのメインキャンバスコンポーネント。Three.jsシーンのマウント・キャプチャ・イベントハンドリングを統合する。
 */
import { useRef, useCallback, useState, useEffect, memo } from "react";
import { Canvas } from "@react-three/fiber";
import type { Camera } from "three";
import { Scene } from "../three/Scene";
import { getLogger } from "@shared/logger";
import { projectWorldToScreen } from "@presentation/utils/threeCalculations";
import type { SelectableItem } from "@presentation/hooks/ui";
import type { TranslationKey } from "@shared/i18n/translations";
import type { Language } from "@presentation/contexts/LanguageContext";
import type { Tactic } from "@domain/entities/Tactic";
import type { Team } from "@domain/entities/Team";
import type { Formation } from "@domain/entities/Formation";
import type { PitchConfig } from "@shared/constants/pitchConfig";
import type { ConnectionLine } from "@presentation/hooks/field";
import type { SceneBackgroundPreferenceV1 } from "@shared/types";
import type {
  Opponent,
  PlayerData,
  FormationDataItem,
  ColorsData,
  CardStatus,
} from "./types";

interface TacticsCanvasProps {
  // 選手データ
  playersData: PlayerData[];
  colorsData: ColorsData;
  formationData: FormationDataItem[];
  pitchConfig: PitchConfig;

  // ポジション＆矢印
  mergedPlayerPositions: Record<number, { x: number; z: number }>;
  mergedArrows: Array<{
    start: { x: number; z: number };
    end: { x: number; z: number };
    color: string;
  }>;
  mergedBallTrajectories: Array<{
    start: { x: number; z: number };
    end: { x: number; z: number };
    color: string;
    trajectoryType?: string;
  }>;

  // 名前＆表示
  showPlayerNames: boolean;
  showPlayerNumbers: boolean;
  showPlayerPhotos: boolean;
  showOpponentNames: boolean;
  hiddenPlayerIndices: Set<number>;
  labelFixed: boolean;
  playerMarkerScale: number;
  playerCards: Record<number, CardStatus>;
  // チーム情報
  teamName: string;
  opponentTeamName: string;

  // クリックハンドラー
  onPlayerClick: (index: number, event?: MouseEvent) => void;
  selectedPlayerIndex: number | null;
  selectedPlayerIndices?: Set<number>;
  isPlayerView: boolean;

  // 相手チーム
  opponents: Opponent[];
  selectedOpponentId: number | null;
  selectedOpponentIds?: Set<number>;
  onOpponentClick?: (id: number, event?: MouseEvent) => void;
  opponentPlacementMode: boolean;
  onFieldClick: (pos: { x: number; z: number }) => void;
  onOpponentDrag: (id: number, pos: { x: number; z: number }) => void;
  onOpponentRemove: (id: number) => void;

  // ボール
  ballPosition: { x: number; z: number } | null;
  ballHighlightPosition: { x: number; z: number } | null;
  ballPlacementMode: boolean;
  onBallPlace: (pos: { x: number; z: number }) => void;
  onBallDrag: (pos: { x: number; z: number }) => void;
  onBallRemove: () => void;

  // ドラッグ
  isDraggingObject: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;

  // 選手ドラッグ
  playerDraggable: boolean;
  onPlayerDragEnd: (index: number, pos: { x: number; z: number }) => void;
  onGroupDragEnd?: (
    positions: Array<{
      type: "player" | "opponent";
      id: number;
      pos: { x: number; z: number };
    }>,
  ) => void;

  // コネクションライン
  connectionLines: ConnectionLine[];
  pendingConnectionLine: {
    fromIndex: number;
    endPos: { x: number; z: number };
    color: string;
  } | null;
  onConnectionLineRemove: (id: number) => void;
  lineTrackingActive: boolean;
  onLinePointerMove: (pos: { x: number; z: number }) => void;

  // カメラ＆シーン
  fieldLocked: boolean;
  touchlineLocked: boolean;
  sceneBackground: SceneBackgroundPreferenceV1;
  sceneBackgroundImageUrl?: string;
  sceneBackgroundImageSaturation?: number;
  sceneBackgroundImageBrightness?: number;
  pitchColor: string;
  pitchOpacity: number;
  cameraAction: "topDown" | "sideView" | "sideViewReverse" | "reset" | null;
  onCameraActionDone: () => void;
  /** HUD ボタンによる yaw ナッジ累積値 */
  yawNudgeRef?: React.RefObject<number>;
  /** 1人称視点フラグ */
  isFirstPerson?: boolean;

  // 複数選択
  onRectSelectResult?: (items: SelectableItem[]) => void;
  onEmptyFieldClick?: () => void;

  // a11y
  selectedTeam: Team | undefined;
  currentFormation: Formation | undefined;
  activeTactic: Tactic | undefined;
  language: Language;
  t: (key: TranslationKey) => string;
  tDynamic: (key: string) => string;
}

/**
 * 3D Canvas（React Three Fiber）と Scene コンポーネントのラッパー。
 *
 * 3D レンダリング、プレイヤー操作、ボール操作、接続ライン描画を含む。
 */
export const TacticsCanvas = memo(function TacticsCanvas(
  props: TacticsCanvasProps,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const [rectDrag, setRectDrag] = useState<{
    start: { x: number; y: number };
    current: { x: number; y: number };
  } | null>(null);
  // rect drag 中のイベントリスナー解除関数を保持（アンマウント時のメモリリーク防止）
  const rectDragCleanupRef = useRef<(() => void) | null>(null);

  const {
    playersData,
    colorsData,
    formationData,
    pitchConfig,
    mergedPlayerPositions,
    mergedArrows,
    mergedBallTrajectories,
    showPlayerNames,
    showPlayerNumbers,
    showPlayerPhotos,
    showOpponentNames,
    hiddenPlayerIndices,
    labelFixed,
    playerMarkerScale,
    playerCards,
    teamName,
    opponentTeamName,
    onPlayerClick,
    selectedPlayerIndex,
    selectedPlayerIndices,
    isPlayerView,
    opponents,
    selectedOpponentId,
    selectedOpponentIds,
    onOpponentClick,
    opponentPlacementMode,
    onFieldClick,
    onOpponentDrag,
    onOpponentRemove,
    ballPosition,
    ballHighlightPosition,
    ballPlacementMode,
    onBallPlace,
    onBallDrag,
    onBallRemove,
    isDraggingObject,
    onDragStart,
    onDragEnd,
    playerDraggable,
    onPlayerDragEnd,
    onGroupDragEnd,
    connectionLines,
    pendingConnectionLine,
    onConnectionLineRemove,
    lineTrackingActive,
    onLinePointerMove,
    fieldLocked,
    touchlineLocked,
    sceneBackground,
    sceneBackgroundImageUrl,
    sceneBackgroundImageSaturation,
    sceneBackgroundImageBrightness,
    pitchColor,
    pitchOpacity,
    cameraAction,
    onCameraActionDone,
    yawNudgeRef,
    isFirstPerson,
    onRectSelectResult,
    onEmptyFieldClick,
    selectedTeam,
    currentFormation,
    activeTactic,
    language,
    t,
    tDynamic,
  } = props;

  // ── Rect drag cleanup on unmount ──
  useEffect(() => {
    return () => {
      rectDragCleanupRef.current?.();
    };
  }, []);

  // ── Shift key tracking ──
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftHeld(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftHeld(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // ── Rect selection resolution ──
  const resolveRef = useRef(onRectSelectResult);
  const formationDataRef = useRef(formationData);
  const mergedPositionsRef = useRef(mergedPlayerPositions);
  const opponentsDataRef = useRef(opponents);
  useEffect(() => {
    resolveRef.current = onRectSelectResult;
    formationDataRef.current = formationData;
    mergedPositionsRef.current = mergedPlayerPositions;
    opponentsDataRef.current = opponents;
  });

  const resolveRectSelection = useCallback(
    (start: { x: number; y: number }, end: { x: number; y: number }) => {
      const camera = cameraRef.current;
      const el = wrapperRef.current;
      const cb = resolveRef.current;
      if (!camera || !el || !cb) return;

      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);
      // 最小ドラッグ距離（5px未満は無視）
      if (maxX - minX < 5 && maxY - minY < 5) return;

      camera.updateMatrixWorld();
      const w = el.clientWidth;
      const h = el.clientHeight;
      const items: SelectableItem[] = [];

      // 選手
      const fd = formationDataRef.current;
      const mp = mergedPositionsRef.current;
      for (let i = 0; i < fd.length; i++) {
        const pos = mp[i] ?? fd[i];
        const s = projectWorldToScreen(pos.x, pos.z, camera, w, h);
        if (s.x >= minX && s.x <= maxX && s.y >= minY && s.y <= maxY) {
          items.push({ type: "player", index: i });
        }
      }

      // 相手チーム
      for (const opp of opponentsDataRef.current) {
        const s = projectWorldToScreen(opp.x, opp.z, camera, w, h);
        if (s.x >= minX && s.x <= maxX && s.y >= minY && s.y <= maxY) {
          items.push({ type: "opponent", id: opp.id });
        }
      }

      cb(items);
    },
    [],
  );

  // ── Rect drag handlers ──
  const handleRectPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const start = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setRectDrag({ start, current: start });

      const cachedRect = rect;
      const onMove = (ev: PointerEvent) => {
        setRectDrag((prev) =>
          prev
            ? {
                ...prev,
                current: {
                  x: ev.clientX - cachedRect.left,
                  y: ev.clientY - cachedRect.top,
                },
              }
            : null,
        );
      };
      const cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        rectDragCleanupRef.current = null;
      };
      const onUp = (ev: PointerEvent) => {
        const endPos = {
          x: ev.clientX - cachedRect.left,
          y: ev.clientY - cachedRect.top,
        };
        setRectDrag(null);
        resolveRectSelection(start, endPos);
        cleanup();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      rectDragCleanupRef.current = cleanup;
    },
    [resolveRectSelection],
  );

  return (
    <div
      ref={wrapperRef}
      data-tactics-canvas-root="true"
      role="img"
      aria-label={t("a11y.tacticsCanvas")}
      className="absolute inset-0 outline-none select-none"
    >
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 12, -8], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl, camera }) => {
          cameraRef.current = camera;
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            getLogger().warn("system", "WebGL context lost");
          });
          gl.domElement.addEventListener("webglcontextrestored", () => {
            getLogger().info("system", "WebGL context restored");
          });
        }}
      >
        <Scene
          players={playersData}
          colors={colorsData as Record<string, string>}
          formation={formationData}
          pitchConfig={pitchConfig}
          playerPositions={mergedPlayerPositions}
          arrows={mergedArrows}
          ballTrajectories={mergedBallTrajectories}
          showPlayerNames={showPlayerNames}
          showPlayerNumbers={showPlayerNumbers}
          showPlayerPhotos={showPlayerPhotos}
          showOpponentNames={showOpponentNames}
          hiddenPlayerIndices={hiddenPlayerIndices}
          labelFixed={labelFixed}
          playerMarkerScale={playerMarkerScale}
          playerCards={playerCards}
          teamName={teamName}
          opponentTeamName={opponentTeamName}
          onPlayerClick={onPlayerClick}
          selectedPlayerIndex={selectedPlayerIndex}
          selectedPlayerIndices={selectedPlayerIndices}
          isPlayerView={isPlayerView}
          opponents={opponents}
          selectedOpponentId={selectedOpponentId}
          selectedOpponentIds={selectedOpponentIds}
          onOpponentClick={onOpponentClick}
          opponentPlacementMode={opponentPlacementMode}
          onFieldClick={onFieldClick}
          onOpponentDrag={onOpponentDrag}
          onOpponentRemove={onOpponentRemove}
          ballPosition={ballPosition}
          ballHighlightPosition={ballHighlightPosition}
          ballPlacementMode={ballPlacementMode}
          onBallPlace={onBallPlace}
          onBallDrag={onBallDrag}
          onBallRemove={onBallRemove}
          isDraggingObject={isDraggingObject}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          playerDraggable={playerDraggable}
          onPlayerDragEnd={onPlayerDragEnd}
          onGroupDragEnd={onGroupDragEnd}
          connectionLines={connectionLines}
          pendingConnectionLine={pendingConnectionLine}
          onConnectionLineRemove={onConnectionLineRemove}
          lineTrackingActive={lineTrackingActive}
          onLinePointerMove={onLinePointerMove}
          fieldLocked={fieldLocked}
          touchlineLocked={touchlineLocked}
          sceneBackground={sceneBackground}
          sceneBackgroundImageUrl={sceneBackgroundImageUrl}
          sceneBackgroundImageSaturation={sceneBackgroundImageSaturation}
          sceneBackgroundImageBrightness={sceneBackgroundImageBrightness}
          pitchColor={pitchColor}
          pitchOpacity={pitchOpacity}
          cameraAction={cameraAction}
          onCameraActionDone={onCameraActionDone}
          yawNudgeRef={yawNudgeRef}
          isFirstPerson={isFirstPerson}
          onEmptyFieldClick={onEmptyFieldClick}
        />
      </Canvas>
      {/* Shift+ドラッグ矩形選択オーバーレイ（配置・ライン描画・プレイヤービューモードでは無効） */}
      {(isShiftHeld || rectDrag) &&
        !isPlayerView &&
        !opponentPlacementMode &&
        !ballPlacementMode &&
        !lineTrackingActive && (
          <div
            className="absolute inset-0 z-10 cursor-crosshair"
            onPointerDown={handleRectPointerDown}
          />
        )}
      {rectDrag && (
        <div
          className="absolute border-2 border-blue-400 bg-blue-400/20 pointer-events-none z-20"
          style={{
            left: Math.min(rectDrag.start.x, rectDrag.current.x),
            top: Math.min(rectDrag.start.y, rectDrag.current.y),
            width: Math.abs(rectDrag.current.x - rectDrag.start.x),
            height: Math.abs(rectDrag.current.y - rectDrag.start.y),
          }}
        />
      )}
      <div className="sr-only" aria-live="polite">
        {selectedTeam?.name}
        {currentFormation ? ` - ${currentFormation.name}` : ""}
        {activeTactic
          ? ` - ${activeTactic.isCustom ? activeTactic.getDisplayName(language) : tDynamic(`tactics.name.${activeTactic.id}`)}`
          : ""}
      </div>
    </div>
  );
});
