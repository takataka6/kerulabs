/**
 * Scene コンポーネント関連の共有型定義。
 *
 * Scene ↔ Player / OpponentMarker 間の循環依存を解消するため、
 * 共有型をこのファイルに抽出する。
 */

import type { ConnectionLine } from "./PlayerConnectionLines";
import type { PitchConfig } from "@shared/constants/pitchConfig";
import type { SceneBackgroundPreferenceV1 } from "@shared/types";
import type { MarkerShape } from "@shared/types";

export type CardStatus = "none" | "yellow" | "double_yellow" | "red";

/** グループドラッグの共有状態 */
export interface GroupDragState {
  active: boolean;
  delta: { x: number; z: number };
  startPositions: Record<string, { x: number; z: number }>;
  /** Scene が毎レンダーで更新する選択マーカーの現在位置 */
  selectionPositions: Record<string, { x: number; z: number }>;
}

/** Scene コンポーネントの Props */
export interface SceneProps {
  players: Array<{ name: string; number: number; imageUrl?: string }>;
  colors: Record<string, string>;
  formation: Array<{ pos: string; x: number; z: number; cat: string }>;
  playerPositions: Record<number, { x: number; z: number }>;
  arrows: Array<{
    start: { x: number; z: number };
    end: { x: number; z: number };
    color: string;
  }>;
  ballTrajectories: Array<{
    start: { x: number; z: number };
    end: { x: number; z: number };
    color: string;
    trajectoryType?: string;
  }>;
  showPlayerNames?: boolean;
  showPlayerNumbers?: boolean;
  showPlayerPhotos?: boolean;
  showOpponentNames?: boolean;
  showOpponentNumbers?: boolean;
  hiddenPlayerIndices?: Set<number>;
  labelFixed?: boolean;
  playerMarkerScale?: number;
  playerMarkerShape?: MarkerShape;
  playerCards?: Record<number, CardStatus>;
  teamName?: string;
  opponentTeamName?: string;
  onPlayerClick?: (index: number, event?: MouseEvent) => void;
  selectedPlayerIndex?: number | null;
  /** 複数選択された選手インデックス（提供時は selectedPlayerIndex より優先） */
  selectedPlayerIndices?: Set<number>;
  isPlayerView?: boolean;
  opponents?: Array<{
    id: number;
    x: number;
    z: number;
    playerNumber?: number;
    playerName?: string;
    color?: string;
  }>;
  selectedOpponentId?: number | null;
  /** 複数選択された相手選手ID（提供時は selectedOpponentId より優先） */
  selectedOpponentIds?: Set<number>;
  onOpponentClick?: (id: number, event?: MouseEvent) => void;
  opponentPlacementMode?: boolean;
  onFieldClick?: (pos: { x: number; z: number }) => void;
  onOpponentDrag?: (id: number, pos: { x: number; z: number }) => void;
  onOpponentRemove?: (id: number) => void;
  ballPosition?: { x: number; z: number } | null;
  /** ボール開始位置ハイライト（セットフェーズ中に表示） */
  ballHighlightPosition?: { x: number; z: number } | null;
  ballPlacementMode?: boolean;
  onBallPlace?: (pos: { x: number; z: number }) => void;
  onBallDrag?: (pos: { x: number; z: number }) => void;
  onBallRemove?: () => void;
  isDraggingObject?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  playerDraggable?: boolean;
  onPlayerDragEnd?: (index: number, pos: { x: number; z: number }) => void;
  /** グループドラッグ終了コールバック（全マーカー一括コミット） */
  onGroupDragEnd?: (
    positions: Array<{
      type: "player" | "opponent";
      id: number;
      pos: { x: number; z: number };
    }>,
  ) => void;
  connectionLines?: ConnectionLine[];
  pendingConnectionLine?: {
    fromIndex: number;
    endPos: { x: number; z: number };
    color: string;
  } | null;
  onConnectionLineRemove?: (id: number) => void;
  lineFromPlayerIndex?: number | null;
  lineColor?: string;
  /** ライン描画中の始点選手選択済み状態（マウス追従プレーン表示用） */
  lineTrackingActive?: boolean;
  onLinePointerMove?: (pos: { x: number; z: number }) => void;
  pitchConfig?: PitchConfig;
  /** フィールド固定（カメラ操作無効化） */
  fieldLocked?: boolean;
  /** フィールド右脇の固定トグル */
  onToggleFieldLock?: () => void;
  /** フィールド横の固定トグル表示可否 */
  showFieldLockButton?: boolean;
  /** タッチライン水平固定（水平回転のみロック） */
  touchlineLocked?: boolean;
  /** シーン背景設定 */
  sceneBackground?: SceneBackgroundPreferenceV1;
  /** シーン背景画像 (base64 Data URL, mode === "image" 時に使用) */
  sceneBackgroundImageUrl?: string;
  /** シーン背景画像の彩度 (%, 100 = 標準) */
  sceneBackgroundImageSaturation?: number;
  /** シーン背景画像の明度 (%, 100 = 標準) */
  sceneBackgroundImageBrightness?: number;
  /** フィールド（芝生）背景色 */
  pitchColor?: string;
  /** フィールド（芝生）透明度 0-1 */
  pitchOpacity?: number;
  /** カメラアクション: 'topDown' = 真上から見る, 'sideView' = 右横から見る, 'sideViewReverse' = 左横から見る, 'reset' = デフォルト位置に戻す */
  cameraAction?: "topDown" | "sideView" | "sideViewReverse" | "reset" | null;
  /** カメラアクション完了コールバック */
  onCameraActionDone?: () => void;
  /** HUD ボタンによる yaw ナッジ累積値（フレーム毎に消費） */
  yawNudgeRef?: React.RefObject<number>;
  /** 1人称視点フラグ（デフォルト: false = 3人称） */
  isFirstPerson?: boolean;
  /** 空フィールドクリック時のコールバック（選択解除用） */
  onEmptyFieldClick?: () => void;
}

/** PlayerCameraController の Props */
export interface PlayerCameraControllerProps {
  selectedPlayerIndex: number | null;
  playerPositions: Record<number, { x: number; z: number }>;
  isPlayerView: boolean;
  isDraggingObject: boolean;
  selectedOpponentId?: number | null;
  opponentPositions?: Array<{ id: number; x: number; z: number }>;
  pitchConfig?: PitchConfig;
  fieldLocked?: boolean;
  touchlineLocked?: boolean;
  cameraAction?: "topDown" | "sideView" | "sideViewReverse" | "reset" | null;
  onCameraActionDone?: () => void;
  /** HUD ボタンによる yaw ナッジ累積値（フレーム毎に消費） */
  yawNudgeRef?: React.RefObject<number>;
  /** 1人称視点フラグ（デフォルト: false = 3人称） */
  isFirstPerson?: boolean;
}
