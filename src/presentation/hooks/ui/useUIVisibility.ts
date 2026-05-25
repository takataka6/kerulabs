/**
 * @module useUIVisibility
 * @description TacticsViewerPageのUI表示状態を一括管理するフック。モーダル・パネル・サイドバー等の表示/非表示を提供する。
 */
import { useState, useCallback } from "react";

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
  const [showNameSettings, setShowNameSettings] = useState(false);
  const [hiddenPlayerIndices, setHiddenPlayerIndices] = useState<Set<number>>(
    new Set(),
  );

  // ── 右コントロール ──
  const [showRightControls, setShowRightControls] = useState(true);

  // ── サイドバー（常にデフォルトで開く） ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarAnimating, setSidebarAnimating] = useState(false);

  // ── スカッドパネル ──
  const [squadPanelOpen, setSquadPanelOpen] = useState(true);

  // ── ヘッダー表示 ──
  const [headerVisible, setHeaderVisible] = useState(true);

  // ── キャプチャモード ──
  const [captureMode, setCaptureMode] = useState(false);

  // ── マーカーサイズ ──
  const [playerMarkerScale, setPlayerMarkerScale] = useState(1);

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
    showNameSettings,
    setShowNameSettings,
    hiddenPlayerIndices,
    setHiddenPlayerIndices,

    // 右コントロール
    showRightControls,
    setShowRightControls,

    // サイドバー
    sidebarOpen,
    sidebarAnimating,
    setSidebarAnimating,
    toggleSidebar,

    // スカッドパネル
    squadPanelOpen,
    setSquadPanelOpen,

    // ヘッダー
    headerVisible,
    setHeaderVisible,

    // キャプチャ
    captureMode,
    setCaptureMode,

    // マーカー
    playerMarkerScale,
    setPlayerMarkerScale,

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
