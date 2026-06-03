/**
 * 3D シーンで使用するジオメトリ・アニメーション・レイアウト定数。
 *
 * マジックナンバーを排除し、Player / OpponentMarker / BallMarker など
 * 複数コンポーネント間で一貫した値を使うために一元管理する。
 */

// ── フィールド境界 ──────────────────────────────────────
/** ドラッグ可能範囲のデフォルト境界 */
export const DEFAULT_FIELD_BOUNDS = {
  minX: -5,
  maxX: 5,
  minZ: -6,
  maxZ: 6,
} as const;

// ── ディスクマーカー共通ジオメトリ ──────────────────────
/** プレイヤー / 相手マーカーのシリンダー形状 */
export const DISK_GEOMETRY = {
  /** シリンダー半径 */
  RADIUS: 0.35,
  /** シリンダー高さ */
  HEIGHT: 0.12,
  /** 円周分割数 */
  SEGMENTS: 32,
  /** ディスク中心の Y 座標 */
  Y_POSITION: 0.08,
} as const;

// ── 選択リングジオメトリ ────────────────────────────────
export const SELECTION_RING = {
  /** リング内側半径 (Player) */
  INNER_RADIUS: 0.55,
  /** リング外側半径 (Player) */
  OUTER_RADIUS: 0.7,
  /** リング内側半径 (Opponent) */
  INNER_RADIUS_SMALL: 0.45,
  /** リング外側半径 (Opponent) */
  OUTER_RADIUS_SMALL: 0.6,
  SEGMENTS: 32,
  Y_POSITION: 0.02,
  OPACITY: 0.6,
} as const;

// ── テキストラベル ──────────────────────────────────────
export const TEXT_LABEL = {
  /** 背番号フォントサイズ (Player) */
  NUMBER_FONT_SIZE: 0.28,
  /** 相手背番号フォントサイズ */
  OPPONENT_NUMBER_FONT_SIZE: 0.22,
  /** 名前ラベルフォントサイズ */
  NAME_FONT_SIZE: 0.21,
  /** 名前ラベル幅計算: 文字数 × 係数 + パディング */
  NAME_WIDTH_FACTOR: 0.12,
  NAME_WIDTH_PADDING: 0.12,
  /** 名前ラベル高さ */
  NAME_HEIGHT: 0.24,
  /** アウトライン幅（名前ラベル用） */
  OUTLINE_WIDTH: 0.05,
  /** アウトライン幅（番号テキスト用） */
  NUMBER_OUTLINE_WIDTH: 0.02,
  /** 名前背景色 */
  NAME_BG_COLOR: "#000000",
} as const;

// ── カード表示 ──────────────────────────────────────────
export const CARD_DISPLAY = {
  WIDTH: 0.14,
  HEIGHT: 0.2,
  Y_POSITION: 0.3,
  /** カード1枚目 X オフセット */
  SINGLE_X: 0.3,
  /** カード2枚目 (ダブルイエロー) X オフセット */
  DOUBLE_X1: 0.25,
  DOUBLE_X2: 0.4,
  /** Z オフセット */
  Z_OFFSET: 0.3,
} as const;

// ── アニメーション ──────────────────────────────────────
export const ANIMATION = {
  /** 位置補間係数: Player */
  LERP_PLAYER: 0.08,
  /** 位置補間係数: OpponentMarker / BallMarker */
  LERP_STANDARD: 0.15,
  /** パルスアニメーション振幅 */
  PULSE_AMPLITUDE: 0.12,
  /** パルス周波数 */
  PULSE_FREQUENCY: 4,
  /** 透明度アニメーション周波数 */
  OPACITY_FREQUENCY: 3,
  /** 透明度ベース値 */
  OPACITY_BASE: 0.5,
  /** 透明度振幅 */
  OPACITY_AMPLITUDE: 0.2,
  /** 選択リング回転速度 (rad/frame) */
  RING_ROTATION_SPEED: 0.03,
} as const;

// ── ボールマーカー ──────────────────────────────────────
export const BALL_GEOMETRY = {
  /** 正二十面体半径 */
  RADIUS: 0.12,
  /** 正二十面体分割数 */
  DETAIL: 5,
  /** 浮遊 Y 座標 */
  Y_POSITION: 0.15,
  /** 影サイズ */
  SHADOW_RADIUS: 0.18,
  SHADOW_Y: -0.14,
  /** バウンス振幅 */
  BOUNCE_AMPLITUDE: 0.05,
  /** バウンス周波数 */
  BOUNCE_FREQUENCY: 3,
} as const;

// ── Player 固有オフセット ───────────────────────────────
export const PLAYER_OFFSETS = {
  /** 写真テクスチャ Y */
  PHOTO_Y: 0.141,
  /** テキスト Y */
  TEXT_Y: 0.15,
  /** 名前ラベル Z (マーカー前方) */
  NAME_Z: -0.55,
  /** 名前背景 Y */
  NAME_BG_Y: 0.235,
  /** 名前テキスト Y */
  NAME_TEXT_Y: 0.24,
  /** 番号テキスト Y */
  NUMBER_Y: 0.23,
} as const;

// ── OpponentMarker 固有オフセット ───────────────────────
export const OPPONENT_OFFSETS = {
  /** 番号テキスト Y */
  NUMBER_Y: 0.2,
  /** 名前ラベル Z (マーカー後方: 相手は反転) */
  NAME_Z: 0.55,
  /** 名前背景 Y */
  NAME_BG_Y: 0.235,
  /** 名前テキスト Y */
  NAME_TEXT_Y: 0.24,
} as const;

// ── Player マテリアル ────────────────────────────────────
export const PLAYER_MATERIAL = {
  EMISSIVE_INTENSITY: 0.2,
  METALNESS: 0.6,
  ROUGHNESS: 0.3,
  /** 写真テクスチャの polygonOffset */
  POLYGON_OFFSET_FACTOR: -1,
  POLYGON_OFFSET_UNITS: -1,
} as const;

// ── カメラコントロール ───────────────────────────────────
export const CAMERA_CONTROLS = {
  /** 水平ドラッグ感度 (rad/px) */
  YAW_SENSITIVITY: 0.003,
  /** 垂直ドラッグ感度 (rad/px) */
  PITCH_SENSITIVITY: 0.002,
  /** カメラ追従のスムーズ係数 */
  LERP_FACTOR: 0.06,
  /** 最小仰角 (rad) */
  MIN_POLAR_ANGLE: 0.3,
  /** 最大仰角 (rad, π/2.5) */
  MAX_POLAR_ANGLE: Math.PI / 2.5,
  /** 最小ズーム距離 */
  MIN_DISTANCE: 8,
  /** 最大ズーム距離 */
  MAX_DISTANCE: 20,
  /** CameraControls の smoothTime */
  SMOOTH_TIME: 0.25,
} as const;

// ── プレイヤービューカメラ ───────────────────────────────
export const PLAYER_VIEW_CAMERA = {
  /** カメラ距離 (背後) — 3人称 */
  CAM_DISTANCE: 2.5,
  /** 注視点距離 (前方) */
  LOOK_DISTANCE: 4,
  /** カメラ高さ — 3人称 */
  CAM_Y: 1.8,
  /** カメラ高さ — 1人称（マーカーと同じ高さ） */
  FIRST_PERSON_CAM_Y: 0.2,
  /** 1人称カメラの前方オフセット（マーカーより前に出す） */
  FIRST_PERSON_FORWARD_OFFSET: 0.5,
  /** Yaw クランプ (±5π/6) */
  YAW_MAX: (Math.PI * 5) / 6,
  /** Pitch クランプ (±π/4) */
  PITCH_MAX: Math.PI / 4,
  /** 角度減衰係数 */
  DECAY_FACTOR: 0.95,
  /** 角度スナップ閾値 */
  SNAP_THRESHOLD: 0.001,
} as const;

// ── デフォルトカメラ位置（ゲームモード別） ───────────────
export const DEFAULT_CAMERA_PARAMS: Record<
  string,
  { camY: number; camZ: number; targetZ: number }
> = {
  futsal: { camY: 8, camZ: -5, targetZ: 0 },
  society: { camY: 9, camZ: -5.5, targetZ: 0 },
  eight_aside: { camY: 10, camZ: -6, targetZ: 0 },
  football: { camY: 12, camZ: -8, targetZ: -1.5 },
} as const;

// ── シーン照明 ───────────────────────────────────────────
export const SCENE_LIGHTING = {
  AMBIENT_INTENSITY: 0.4,
  AMBIENT_COLOR: "#dbeafe",
  /** メインスポットライト */
  MAIN_SPOT: { Y: 20, ANGLE: 0.6, PENUMBRA: 0.5, INTENSITY: 1.2 },
  /** サイドフィルライト */
  SIDE_FILL: { ANGLE: 0.4, PENUMBRA: 0.8, INTENSITY: 0.6, COLOR: "#93c5fd" },
} as const;

// ── フィールドクリック検出プレーン ───────────────────────
export const FIELD_CLICK_PLANE = {
  Y_POSITION: 0.02,
} as const;

// ── 矢印ジオメトリ ──────────────────────────────────────
export const ARROW_GEOMETRY = {
  /** ラインの Y 座標 */
  LINE_Y: 0.1,
  /** 矢印ヘッドの Y 座標 */
  HEAD_Y: 0.2,
  /** コーン半径 */
  CONE_RADIUS: 0.15,
  /** コーン高さ */
  CONE_HEIGHT: 0.4,
  /** コーン分割数 */
  CONE_SEGMENTS: 8,
  /** ライン透明度 */
  LINE_OPACITY: 0.8,
  /** ヘッド透明度 */
  HEAD_OPACITY: 0.9,
} as const;

// ── ボール弾道ジオメトリ ─────────────────────────────────
export const TRAJECTORY = {
  /** チューブ分割数 */
  TUBE_SEGMENTS: 8,
  /** チューブ半径 */
  TUBE_RADIUS: 0.06,
  /** チューブ断面分割数 */
  TUBE_RADIAL_SEGMENTS: 6,
  /** 発光強度 */
  EMISSIVE_INTENSITY: 0.6,
  /** ガイドライン透明度 */
  GUIDELINE_OPACITY: 0.15,
  /** リングの Y 座標 */
  RING_Y: 0.04,
  /** リング分割数 */
  RING_SEGMENTS: 24,
  /** 始点リング内径 / 外径 */
  START_INNER: 0.25,
  START_OUTER: 0.35,
  /** 始点グロー Y / 半径 */
  GLOW_Y: 0.02,
  GLOW_RADIUS: 0.5,
  /** 終点外側リング1 */
  END_INNER_1: 0.2,
  END_OUTER_1: 0.3,
  /** 終点外側リング2 */
  END_INNER_2: 0.35,
  END_OUTER_2: 0.42,
  END_RING2_Y: 0.03,
  END_RING2_OPACITY: 0.5,
  /** 終点グロー半径 */
  END_GLOW_RADIUS: 0.55,
  /** アニメーションボール */
  BALL_RADIUS: 0.12,
  BALL_SEGMENTS: 16,
  BALL_INITIAL_Y: 0.3,
  BALL_EMISSIVE: 0.8,
  BALL_METALNESS: 0.2,
  BALL_ROUGHNESS: 0.3,
} as const;

// ── 弾道アーチパラメータ ─────────────────────────────────
export const TRAJECTORY_ARCH = {
  /** 低弾道: 距離係数 / 最小高さ */
  LOW: { FACTOR: 0.08, MIN: 0.3 },
  /** 高弾道 */
  HIGH: { FACTOR: 0.45, MIN: 1.5 },
  /** カーブ左 */
  CURVE_LEFT: { FACTOR: 0.25, MIN: 0.8 },
  /** カーブ右 */
  CURVE_RIGHT: { FACTOR: 0.3, MIN: 1.0 },
  /** デフォルト */
  DEFAULT: { FACTOR: 0.2, MIN: 0.5 },
  /** カーブオフセット係数 */
  CURVE_OFFSET_FACTOR: 0.25,
  CURVE_OFFSET_MIN: 0.8,
} as const;

// ── カーブ生成パラメータ ─────────────────────────────────
export const CURVE_GENERATION = {
  /** デフォルト分割数 */
  DEFAULT_SEGMENTS: 50,
  /** 放物線係数 */
  PARABOLA_FACTOR: 4,
  /** 基準 Y オフセット */
  BASE_Y: 0.15,
  /** 破線の線分長 */
  DASH_LENGTH: 0.4,
  /** 破線の隙間長 */
  GAP_LENGTH: 0.25,
  /** ボールアニメーション速度 */
  BALL_SPEED: 0.4,
} as const;
