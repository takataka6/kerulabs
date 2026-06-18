/**
 * @module useUIVisibility
 * @description TacticsViewerPageのUI表示状態を一括管理するフック。モーダル・パネル・サイドバー等の表示/非表示を提供する。
 */
import { useState, useCallback } from "react";
import { DEFAULT_MARKER_SHAPE, type MarkerShape } from "@shared/types";

/**
 * TacticsViewerPage の UI 表示状態を一括管理するフック。
 *
 * モーダル・パネル・サイドバー・カメラ・マーカーサイズなど、
 * 表示/非表示やトグル系の状態をまとめて提供する。
 *
 * @returns モーダル、パネル、サイドバー、カメラ、キャプチャモード、
 *          マーカースケールの表示フラグ・セッター、および `toggleSidebar` コールバック。
 */
export function useUIVisibility() {
  // ── モーダル / パネル ──
  const [showPlayerManagement, setShowPlayerManagement] = useState(false);
  const [showSquadBuilder, setShowSquadBuilder] = useState(false);
  const [showFlowchart, setShowFlowchart] = useState(false);

  // ── 名前表示 ──
  const [showPlayerNames, setShowPlayerNames] = useState(true);
  const [showPlayerNumbers, setShowPlayerNumbers] = useState(true);
  const [showNameSettings, setShowNameSettings] = useState(false);
  const [hiddenPlayerIndices, setHiddenPlayerIndices] = useState<Set<number>>(
    new Set(),
  );
  const [labelFixed, setLabelFixed] = useState(false);

  // ── 右コントロール ──
  const [showRightControls, setShowRightControls] = useState(true);

  // ── サイドバー（常にデフォルトで開く） ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarAnimating, setSidebarAnimating] = useState(false);

  // ── 右サイドバー ──
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightSidebarAnimating, setRightSidebarAnimating] = useState(false);

  // ── スカッドパネル ──
  const [squadPanelOpen, setSquadPanelOpen] = useState(true);

  // ── ヘッダー表示 ──
  const [headerVisible, setHeaderVisible] = useState(true);

  // ── キャプチャモード ──
  const [captureMode, setCaptureMode] = useState(false);
  const [selectedImagePresetId, setSelectedImagePresetId] =
    useState<string>("none");

  // ── マーカーサイズ ──
  const [playerMarkerScale, setPlayerMarkerScale] = useState(1);
  const [playerMarkerShape, setPlayerMarkerShape] =
    useState<MarkerShape>(DEFAULT_MARKER_SHAPE);

  // ── カメラ ──
  const [cameraAction, setCameraAction] = useState<
    "topDown" | "sideView" | "sideViewReverse" | "reset" | null
  >(null);
  const [fieldLocked, setFieldLocked] = useState(false);
  const [touchlineLocked, setTouchlineLocked] = useState(false);

  // ── ドラッグ ──
  const [isDraggingObject, setIsDraggingObject] = useState(false);

  // ── サイドバー開閉 ──
  const toggleSidebar = useCallback(() => {
    setSidebarAnimating(true);
    setSidebarOpen((prev) => !prev);
  }, []);

  // ── 右サイドバー開閉 ──
  const toggleRightSidebar = useCallback(() => {
    setRightSidebarAnimating(true);
    setRightSidebarOpen((prev) => !prev);
  }, []);

  return {
    // モーダル / パネル
    showPlayerManagement,
    setShowPlayerManagement,
    showSquadBuilder,
    setShowSquadBuilder,
    showFlowchart,
    setShowFlowchart,

    // 名前表示
    showPlayerNames,
    setShowPlayerNames,
    showPlayerNumbers,
    setShowPlayerNumbers,
    showNameSettings,
    setShowNameSettings,
    hiddenPlayerIndices,
    setHiddenPlayerIndices,
    labelFixed,
    setLabelFixed,

    // 右コントロール
    showRightControls,
    setShowRightControls,

    // サイドバー
    sidebarOpen,
    setSidebarOpen,
    sidebarAnimating,
    setSidebarAnimating,
    toggleSidebar,

    // 右サイドバー
    rightSidebarOpen,
    setRightSidebarOpen,
    rightSidebarAnimating,
    setRightSidebarAnimating,
    toggleRightSidebar,

    // スカッドパネル
    squadPanelOpen,
    setSquadPanelOpen,

    // ヘッダー
    headerVisible,
    setHeaderVisible,

    // キャプチャ
    captureMode,
    setCaptureMode,
    selectedImagePresetId,
    setSelectedImagePresetId,

    // マーカー
    playerMarkerScale,
    setPlayerMarkerScale,
    playerMarkerShape,
    setPlayerMarkerShape,

    // カメラ
    cameraAction,
    setCameraAction,
    fieldLocked,
    setFieldLocked,
    touchlineLocked,
    setTouchlineLocked,

    // ドラッグ
    isDraggingObject,
    setIsDraggingObject,
  };
}
