/**
 * @module ConfirmStep コンポーネント
 * @description 戦術作成確認ステップの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 作成内容のプレビュー表示を検証
 * - 確定・キャンセル・戻るボタンの動作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmStep } from "../ConfirmStep";
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
    icon: "🎯",
    gamePhase: "attack",
    formationName: "4-3-3",
    currentStepIndex: 0,
    steps: [
      createStep({
        movements: new Map([
          ["player-1", { targetX: 5, targetZ: 10, color: "#fff" }],
        ]),
      }),
    ],
    timelineOpen: false,
    movementDelays: {},
    wizardStep: "confirm",
    ballPosition: null,
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof ConfirmStep>> = {},
) {
  const defaultProps = {
    creation: createCreationState(),
    language: "ja",
    isExecuting: false,
    offset: { x: 0, y: 0 },
    isDragging: false,
    handlePointerDown: vi.fn(),
    t: mockT,
    onWizardStep: vi.fn(),
    onAddStep: vi.fn(),
    onToggleTimeline: vi.fn(),
    onPreview: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };
  return { ...render(<ConfirmStep {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("ConfirmStep", () => {
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
      renderComponent();

      expect(screen.getByText("🎯")).toBeInTheDocument();
    });

    it("確認ラベルが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.confirm")).toBeInTheDocument();
    });

    it("プレビューボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.preview")).toBeInTheDocument();
    });

    it("タイムラインボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.timeline")).toBeInTheDocument();
    });

    it("戻るボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.back")).toBeInTheDocument();
    });

    it("ステップ追加ボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.addStep2")).toBeInTheDocument();
    });

    it("保存ボタンが表示される", () => {
      renderComponent();

      expect(
        screen.getByText("tactics.creation.saveTactic"),
      ).toBeInTheDocument();
    });

    it("ムーブメント数が表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.moves")).toBeInTheDocument();
    });

    it("ステップ数が表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.steps")).toBeInTheDocument();
    });
  });

  // ── ボールパス表示 ──

  describe("ボールパス表示", () => {
    it("ボールパスがある場合、パス数が表示される", () => {
      renderComponent({
        creation: createCreationState({
          steps: [
            createStep({
              movements: new Map([
                ["player-1", { targetX: 5, targetZ: 10, color: "#fff" }],
              ]),
              ballPasses: [
                {
                  startRole: "CM1",
                  endRole: "CF",
                  startX: 0,
                  startZ: 0,
                  endX: 5,
                  endZ: 5,
                  trajectoryType: "low",
                  color: "#fff",
                },
              ],
            }),
          ],
        }),
      });

      expect(screen.getByText("tactics.creation.passes")).toBeInTheDocument();
    });

    it("ボールパスがない場合、パス数が表示されない", () => {
      renderComponent();

      expect(
        screen.queryByText("tactics.creation.passes"),
      ).not.toBeInTheDocument();
    });
  });

  // ── ボタン操作 ──

  describe("ボタン操作", () => {
    it("戻るボタンをクリックするとeditingステップに移動する", () => {
      const onWizardStep = vi.fn();
      renderComponent({ onWizardStep });

      fireEvent.click(screen.getByText("tactics.creation.back"));

      expect(onWizardStep).toHaveBeenCalledWith("editing");
    });

    it("プレビューボタンをクリックするとonPreviewが呼ばれる", () => {
      const onPreview = vi.fn();
      renderComponent({ onPreview });

      fireEvent.click(screen.getByText("tactics.creation.preview"));

      expect(onPreview).toHaveBeenCalledTimes(1);
    });

    it("タイムラインボタンをクリックするとonToggleTimelineが呼ばれる", () => {
      const onToggleTimeline = vi.fn();
      renderComponent({ onToggleTimeline });

      fireEvent.click(screen.getByText("tactics.creation.timeline"));

      expect(onToggleTimeline).toHaveBeenCalledTimes(1);
    });

    it("保存ボタンをクリックするとonSaveが呼ばれる", () => {
      const onSave = vi.fn();
      renderComponent({ onSave });

      fireEvent.click(screen.getByText("tactics.creation.saveTactic"));

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("ステップ追加ボタンをクリックするとonAddStepとonWizardStepが呼ばれる", () => {
      const onAddStep = vi.fn();
      const onWizardStep = vi.fn();
      renderComponent({ onAddStep, onWizardStep });

      fireEvent.click(screen.getByText("tactics.creation.addStep2"));

      expect(onAddStep).toHaveBeenCalledTimes(1);
      expect(onWizardStep).toHaveBeenCalledWith("editing");
    });
  });

  // ── 実行中の状態 ──

  describe("実行中の状態", () => {
    it("isExecutingがtrueの場合、プレビューボタンが無効になる", () => {
      renderComponent({ isExecuting: true });

      const previewBtn = screen
        .getByText("tactics.creation.preview")
        .closest("button");
      expect(previewBtn).toBeDisabled();
    });

    it("isExecutingがfalseの場合、プレビューボタンが有効になる", () => {
      renderComponent({ isExecuting: false });

      const previewBtn = screen
        .getByText("tactics.creation.preview")
        .closest("button");
      expect(previewBtn).not.toBeDisabled();
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

  // ── タイムライン状態 ──

  describe("タイムライン状態", () => {
    it("timelineOpenがtrueの場合、タイムラインボタンがアクティブスタイルになる", () => {
      renderComponent({
        creation: createCreationState({ timelineOpen: true }),
      });

      const timelineBtn = screen
        .getByText("tactics.creation.timeline")
        .closest("button");
      expect(timelineBtn?.className).toContain("bg-emerald-600");
    });

    it("timelineOpenがfalseの場合、タイムラインボタンが非アクティブスタイルになる", () => {
      renderComponent({
        creation: createCreationState({ timelineOpen: false }),
      });

      const timelineBtn = screen
        .getByText("tactics.creation.timeline")
        .closest("button");
      expect(timelineBtn?.className).toContain("bg-slate-800/60");
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
        offset: { x: 20, y: 40 },
      });

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.transform).toContain("20px");
      expect(wrapper.style.transform).toContain("40px");
    });
  });
});
