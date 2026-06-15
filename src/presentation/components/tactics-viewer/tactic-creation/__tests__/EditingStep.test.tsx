/**
 * @module EditingStep コンポーネント
 * @description 戦術編集ステップの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 移動・ボールパスの追加・編集UIを検証
 * - タイムライン操作との連携を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditingStep } from "../EditingStep";
import type { CreationState, CreationStep } from "@presentation/hooks/tactic";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createStep(overrides: Partial<CreationStep> = {}): CreationStep {
  return {
    id: 1,
    movements: new Map(),
    ballPasses: [],
    duration: 1000,
    ...overrides,
  };
}

function createCreationState(
  overrides: Partial<CreationState> = {},
): CreationState {
  return {
    nameJa: "テスト戦術",
    nameEn: "Test Tactic",
    icon: "⚽",
    gamePhase: "attack",
    formationName: "4-3-3",
    currentStepIndex: 0,
    steps: [createStep()],
    timelineOpen: false,
    movementDelays: {},
    wizardStep: "editing",
    ballPosition: null,
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof EditingStep>> = {},
) {
  const defaultProps = {
    creation: createCreationState(),
    language: "ja",
    isSetPlayMode: false,
    offset: { x: 0, y: 0 },
    isDragging: false,
    handlePointerDown: vi.fn(),
    t: mockT,
    onWizardStep: vi.fn(),
    onSwitchStep: vi.fn(),
    onResetStep: vi.fn(),
    onResetPreview: vi.fn(),
    ballPassCreationMode: false,
    ballPassStartPos: null,
    selectedBallPassTrajectoryType: "low" as const,
    onToggleBallPassMode: vi.fn(),
    onBallPassTrajectoryTypeChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<EditingStep {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("EditingStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 基本レンダリング ──

  describe("基本レンダリング", () => {
    it("戦術名が表示される（日本語モード）", () => {
      renderComponent();

      expect(screen.getByText("テスト戦術")).toBeInTheDocument();
    });

    it("アイコンが表示される", () => {
      renderComponent({
        creation: createCreationState({ icon: "🎯" }),
      });

      expect(screen.getByText("🎯")).toBeInTheDocument();
    });

    it("編集ガイダンスが表示される", () => {
      renderComponent();

      expect(
        screen.getByText("tactics.creation.editingGuide"),
      ).toBeInTheDocument();
    });

    it("Passボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("Pass")).toBeInTheDocument();
    });

    it("リセットボタンが表示される", () => {
      renderComponent();

      expect(
        screen.getByText("tactics.creation.resetStep"),
      ).toBeInTheDocument();
    });

    it("戻るボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.back")).toBeInTheDocument();
    });

    it("完了ボタンが表示される", () => {
      renderComponent();

      expect(
        screen.getByText(/tactics\.creation\.stepComplete/),
      ).toBeInTheDocument();
    });

    it("ドラッグ操作のヒントが表示される", () => {
      renderComponent();

      expect(
        screen.getByText("tactics.creation.dragToMove"),
      ).toBeInTheDocument();
    });
  });

  // ── ステップバッジ ──

  describe("ステップバッジ", () => {
    it("複数ステップがある場合、全てのステップボタンが表示される", () => {
      renderComponent({
        creation: createCreationState({
          steps: [createStep({ id: 1 }), createStep({ id: 2 })],
        }),
      });

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("ステップボタンをクリックするとonSwitchStepが呼ばれる", () => {
      const onSwitchStep = vi.fn();
      renderComponent({
        creation: createCreationState({
          steps: [createStep({ id: 1 }), createStep({ id: 2 })],
        }),
        onSwitchStep,
      });

      fireEvent.click(screen.getByText("2"));

      expect(onSwitchStep).toHaveBeenCalledWith(1);
    });
  });

  // ── ボタン状態 ──

  describe("ボタン状態", () => {
    it("ムーブメントがない場合、完了ボタンが無効になる", () => {
      renderComponent();

      const completeBtn = screen
        .getByText(/tactics\.creation\.stepComplete/)
        .closest("button");
      expect(completeBtn).toBeDisabled();
    });

    it("ムーブメントがない場合、リセットボタンが無効になる", () => {
      renderComponent();

      const resetBtn = screen
        .getByText("tactics.creation.resetStep")
        .closest("button");
      expect(resetBtn).toBeDisabled();
    });

    it("ムーブメントがある場合、完了ボタンが有効になる", () => {
      const movements = new Map([
        ["player-1", { targetX: 5, targetZ: 10, color: "#fff" }],
      ]);
      renderComponent({
        creation: createCreationState({
          steps: [createStep({ movements })],
        }),
      });

      const completeBtn = screen
        .getByText(/tactics\.creation\.stepComplete/)
        .closest("button");
      expect(completeBtn).not.toBeDisabled();
    });

    it("ムーブメントがある場合、リセットボタンが有効になる", () => {
      const movements = new Map([
        ["player-1", { targetX: 5, targetZ: 10, color: "#fff" }],
      ]);
      renderComponent({
        creation: createCreationState({
          steps: [createStep({ movements })],
        }),
      });

      const resetBtn = screen
        .getByText("tactics.creation.resetStep")
        .closest("button");
      expect(resetBtn).not.toBeDisabled();
    });
  });

  // ── ナビゲーション ──

  describe("ナビゲーション", () => {
    it("通常モードで戻るボタンをクリックするとmetadataステップに移動する", () => {
      const onWizardStep = vi.fn();
      renderComponent({ onWizardStep });

      fireEvent.click(screen.getByText("tactics.creation.back"));

      expect(onWizardStep).toHaveBeenCalledWith("metadata");
    });

    it("シチュエーション作成で戻るボタンをクリックするとsetPositionステップに移動する", () => {
      const onWizardStep = vi.fn();
      renderComponent({
        creation: createCreationState({ creationMode: "situation" }),
        onWizardStep,
      });

      fireEvent.click(screen.getByText("tactics.creation.back"));

      expect(onWizardStep).toHaveBeenCalledWith("setPosition");
    });

    it("セットプレーモードで戻るボタンをクリックするとsetPositionステップに移動する", () => {
      const onWizardStep = vi.fn();
      renderComponent({
        creation: createCreationState({ creationMode: "setPlay" }),
        onWizardStep,
      });

      fireEvent.click(screen.getByText("tactics.creation.back"));

      expect(onWizardStep).toHaveBeenCalledWith("setPosition");
    });

    it("完了ボタンをクリックするとconfirmステップに移動する", () => {
      const onWizardStep = vi.fn();
      const onResetPreview = vi.fn();
      const movements = new Map([
        ["player-1", { targetX: 5, targetZ: 10, color: "#fff" }],
      ]);
      renderComponent({
        creation: createCreationState({
          steps: [createStep({ movements })],
        }),
        onWizardStep,
        onResetPreview,
      });

      fireEvent.click(screen.getByText(/tactics\.creation\.stepComplete/));

      expect(onResetPreview).toHaveBeenCalledTimes(1);
      expect(onWizardStep).toHaveBeenCalledWith("confirm");
    });

    it("リセットボタンをクリックするとonResetStepが呼ばれる", () => {
      const onResetStep = vi.fn();
      const movements = new Map([
        ["player-1", { targetX: 5, targetZ: 10, color: "#fff" }],
      ]);
      renderComponent({
        creation: createCreationState({
          steps: [createStep({ movements })],
        }),
        onResetStep,
      });

      fireEvent.click(screen.getByText("tactics.creation.resetStep"));

      expect(onResetStep).toHaveBeenCalledTimes(1);
    });
  });

  // ── ボールパスモード ──

  describe("ボールパスモード", () => {
    it("Passボタンをクリックするとモード切替が呼ばれる", () => {
      const onToggleBallPassMode = vi.fn();
      renderComponent({ onToggleBallPassMode });

      fireEvent.click(screen.getByLabelText("tactics.creation.togglePassMode"));

      expect(onToggleBallPassMode).toHaveBeenCalledTimes(1);
    });

    it("ボールパスモード時にガイダンスが変わる", () => {
      renderComponent({ ballPassCreationMode: true });

      expect(
        screen.getByText(/tactics\.creation\.passStartPosition/),
      ).toBeInTheDocument();
    });

    it("ボールパスモードでスタート位置設定済みの場合、座標が表示される", () => {
      renderComponent({
        ballPassCreationMode: true,
        ballPassStartPos: { x: 5.5, z: 10.2 },
      });

      expect(screen.getByText(/5\.5/)).toBeInTheDocument();
      expect(screen.getByText(/10\.2/)).toBeInTheDocument();
    });

    it("ボールパスモード時に軌跡タイプセレクターが表示される", () => {
      renderComponent({ ballPassCreationMode: true });

      // 4つの軌跡オプション
      expect(
        screen.getByLabelText("tactics.creation.trajectory.low"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("tactics.creation.trajectory.high"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("tactics.creation.trajectory.curveLeft"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("tactics.creation.trajectory.curveRight"),
      ).toBeInTheDocument();
    });

    it("軌跡タイプを選択するとonBallPassTrajectoryTypeChangeが呼ばれる", () => {
      const onBallPassTrajectoryTypeChange = vi.fn();
      renderComponent({
        ballPassCreationMode: true,
        onBallPassTrajectoryTypeChange,
      });

      fireEvent.click(
        screen.getByLabelText("tactics.creation.trajectory.high"),
      );

      expect(onBallPassTrajectoryTypeChange).toHaveBeenCalledWith("high");
    });
  });

  // ── 言語表示 ──

  describe("言語表示", () => {
    it("英語モードの場合、英語名が表示される", () => {
      renderComponent({ language: "en" });

      expect(screen.getByText("Test Tactic")).toBeInTheDocument();
    });

    it("日本語名のみ設定されている場合、英語モードでも日本語名が表示される", () => {
      renderComponent({
        language: "en",
        creation: createCreationState({ nameEn: "" }),
      });

      expect(screen.getByText("テスト戦術")).toBeInTheDocument();
    });
  });

  // ── ドラッグハンドル ──

  describe("ドラッグハンドル", () => {
    it("isDragging が true のとき cursor-grabbing クラスが適用される", () => {
      const { container } = renderComponent({ isDragging: true });

      expect(container.querySelector(".cursor-grabbing")).toBeInTheDocument();
    });

    it("isDragging が false のとき cursor-grab クラスが適用される", () => {
      const { container } = renderComponent({ isDragging: false });

      expect(container.querySelector(".cursor-grab")).toBeInTheDocument();
    });
  });

  // ── オフセット ──

  describe("オフセット", () => {
    it("offset が transform スタイルに反映される", () => {
      const { container } = renderComponent({
        offset: { x: 30, y: 60 },
      });

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.transform).toContain("30px");
      expect(wrapper.style.transform).toContain("60px");
    });
  });
});
