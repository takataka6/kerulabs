/**
 * @module TacticsCanvas コンポーネント
 * @description 戦術キャンバス（メイン3Dビュー）の単体テスト
 *
 * テスト方針:
 * - Three.js / R3F をvi.mockでスタブ化し、WebGL描画を回避
 * - Canvas要素のマウントとprops受け渡しを検証
 * - イベントハンドラーのバインディングを検証
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TacticsCanvas } from "../TacticsCanvas";
import type { PitchConfig } from "@shared/constants/pitchConfig";
import { DEFAULT_SCENE_BACKGROUND } from "@shared/constants";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

// Three.js Canvas と Scene をモック（jsdom では WebGL 不可）
vi.mock("@react-three/fiber", () => ({
  Canvas: React.forwardRef<HTMLCanvasElement, { children: React.ReactNode }>(
    ({ children }, ref) => (
      <canvas data-testid="r3f-canvas" ref={ref}>
        {children}
      </canvas>
    ),
  ),
  useThree: () => ({ scene: {}, camera: {}, gl: {} }),
  useFrame: vi.fn(),
  extend: vi.fn(),
}));

vi.mock("@react-three/drei", () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: () => null,
  OrbitControls: () => null,
  PerspectiveCamera: () => null,
}));

vi.mock("../../three/Scene", () => ({
  Scene: () => <div data-testid="scene" />,
}));

vi.mock("@shared/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock("@presentation/utils/threeCalculations", () => ({
  projectWorldToScreen: vi.fn(() => ({ x: 50, y: 50 })),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);
const mockTDynamic = vi.fn((key: string) => key);

const defaultPitchConfig: PitchConfig = {
  gameMode: "football",
  fieldWidth: 10,
  fieldLength: 12,
  halfWidth: 5,
  halfLength: 6,
  fieldBounds: { minX: -5, maxX: 5, minZ: -6, maxZ: 6 },
  playerCount: 11,
  maxOpponents: 11,
};

function createDefaultProps(): React.ComponentProps<typeof TacticsCanvas> {
  return {
    playersData: [],
    colorsData: { gk: "#ff0", df: "#00f", mf: "#0f0", fw: "#f00" },
    formationData: [],
    pitchConfig: defaultPitchConfig,
    mergedPlayerPositions: {},
    mergedArrows: [],
    mergedBallTrajectories: [],
    showPlayerNames: true,
    showPlayerNumbers: true,
    showPlayerPhotos: false,
    showOpponentNames: false,
    hiddenPlayerIndices: new Set(),
    playerMarkerScale: 1,
    playerCards: {},
    teamName: "Home",
    opponentTeamName: "Away",
    onPlayerClick: vi.fn(),
    selectedPlayerIndex: null,
    selectedPlayerIndices: new Set(),
    isPlayerView: false,
    opponents: [],
    selectedOpponentId: null,
    selectedOpponentIds: new Set(),
    onOpponentClick: vi.fn(),
    opponentPlacementMode: false,
    onFieldClick: vi.fn(),
    onOpponentDrag: vi.fn(),
    onOpponentRemove: vi.fn(),
    ballPosition: null,
    ballHighlightPosition: null,
    ballPlacementMode: false,
    onBallPlace: vi.fn(),
    onBallDrag: vi.fn(),
    onBallRemove: vi.fn(),
    isDraggingObject: false,
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    playerDraggable: true,
    onPlayerDragEnd: vi.fn(),
    onGroupDragEnd: vi.fn(),
    connectionLines: [],
    pendingConnectionLine: null,
    onConnectionLineRemove: vi.fn(),
    lineTrackingActive: false,
    onLinePointerMove: vi.fn(),
    fieldLocked: false,
    touchlineLocked: false,
    sceneBackground: DEFAULT_SCENE_BACKGROUND,
    pitchColor: "#16a34a",
    pitchOpacity: 1,
    cameraAction: null,
    onCameraActionDone: vi.fn(),
    onRectSelectResult: vi.fn(),
    onEmptyFieldClick: vi.fn(),
    selectedTeam: undefined,
    currentFormation: undefined,
    activeTactic: undefined,
    language: "ja",
    t: mockT,
    tDynamic: mockTDynamic,
  };
}

function renderTacticsCanvas(
  overrides: Partial<React.ComponentProps<typeof TacticsCanvas>> = {},
) {
  const props = { ...createDefaultProps(), ...overrides };
  return render(<TacticsCanvas {...props} />);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TacticsCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── レンダリング ──

  it("Canvas ラッパーを aria-label 付きで描画する", () => {
    renderTacticsCanvas();

    const wrapper = screen.getByRole("img", { name: "a11y.tacticsCanvas" });
    expect(wrapper).toBeInTheDocument();
  });

  it("R3F Canvas と Scene をレンダリングする", () => {
    renderTacticsCanvas();

    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("scene")).toBeInTheDocument();
  });

  // ── Shift キーによる矩形選択オーバーレイ ──

  it("Shift キーが押されたとき矩形選択オーバーレイを表示する", () => {
    renderTacticsCanvas();

    // デフォルトではオーバーレイなし
    expect(screen.queryByTestId("rect-overlay")).not.toBeInTheDocument();

    // Shift key down → crosshair overlay should appear
    fireEvent.keyDown(window, { key: "Shift" });

    // cursor-crosshair クラスを持つオーバーレイが表示される
    const wrapper = screen.getByRole("img", { name: "a11y.tacticsCanvas" });
    const overlay = wrapper.querySelector(".cursor-crosshair");
    expect(overlay).not.toBeNull();
  });

  it("Shift キーが離されたとき矩形選択オーバーレイを非表示にする", () => {
    renderTacticsCanvas();

    fireEvent.keyDown(window, { key: "Shift" });
    fireEvent.keyUp(window, { key: "Shift" });

    const wrapper = screen.getByRole("img", { name: "a11y.tacticsCanvas" });
    const overlay = wrapper.querySelector(".cursor-crosshair");
    expect(overlay).toBeNull();
  });

  // ── プレイヤービューモードでは矩形選択無効 ──

  it("isPlayerView=true の場合、Shift キーでもオーバーレイを表示しない", () => {
    renderTacticsCanvas({ isPlayerView: true });

    fireEvent.keyDown(window, { key: "Shift" });

    const wrapper = screen.getByRole("img", { name: "a11y.tacticsCanvas" });
    const overlay = wrapper.querySelector(".cursor-crosshair");
    expect(overlay).toBeNull();
  });

  it("opponentPlacementMode=true の場合、Shift キーでもオーバーレイを表示しない", () => {
    renderTacticsCanvas({ opponentPlacementMode: true });

    fireEvent.keyDown(window, { key: "Shift" });

    const wrapper = screen.getByRole("img", { name: "a11y.tacticsCanvas" });
    const overlay = wrapper.querySelector(".cursor-crosshair");
    expect(overlay).toBeNull();
  });

  it("ballPlacementMode=true の場合、Shift キーでもオーバーレイを表示しない", () => {
    renderTacticsCanvas({ ballPlacementMode: true });

    fireEvent.keyDown(window, { key: "Shift" });

    const wrapper = screen.getByRole("img", { name: "a11y.tacticsCanvas" });
    const overlay = wrapper.querySelector(".cursor-crosshair");
    expect(overlay).toBeNull();
  });

  it("lineTrackingActive=true の場合、Shift キーでもオーバーレイを表示しない", () => {
    renderTacticsCanvas({ lineTrackingActive: true });

    fireEvent.keyDown(window, { key: "Shift" });

    const wrapper = screen.getByRole("img", { name: "a11y.tacticsCanvas" });
    const overlay = wrapper.querySelector(".cursor-crosshair");
    expect(overlay).toBeNull();
  });

  // ── sr-only アクセシビリティ情報 ──

  it("選択チーム・フォーメーション名を sr-only で表示する", () => {
    const team = {
      name: "FC Test",
    } as never;

    const formation = {
      name: "4-3-3",
    } as never;

    renderTacticsCanvas({
      selectedTeam: team,
      currentFormation: formation,
    });

    // sr-only div にチーム名とフォーメーション名が含まれる
    const srOnly = screen.getByText(/FC Test/);
    expect(srOnly).toBeInTheDocument();
    expect(srOnly.textContent).toContain("4-3-3");
  });
});
