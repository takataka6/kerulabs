/**
 * @module BallPositionStep コンポーネント
 * @description ボール位置設定ステップの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - ボール位置のフィールドクリック設定UIを検証
 * - 位置リセット・次ステップへの遷移を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BallPositionStep } from "../BallPositionStep";
import type { CreationState } from "@presentation/hooks/tactic";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createCreationState(
  overrides: Partial<CreationState> = {},
): CreationState {
  return {
    nameJa: "",
    nameEn: "",
    icon: "⚽",
    gamePhase: "attack",
    formationName: "",
    currentStepIndex: 0,
    steps: [],
    timelineOpen: false,
    movementDelays: {},
    wizardStep: "ballPosition",
    ballPosition: null,
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof BallPositionStep>> = {},
) {
  const defaultProps = {
    creation: createCreationState(),
    offset: { x: 0, y: 0 },
    isDragging: false,
    handlePointerDown: vi.fn(),
    t: mockT,
    onWizardStep: vi.fn(),
    ...overrides,
  };
  return { ...render(<BallPositionStep {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("BallPositionStep", () => {
  // ── 基本レンダリング ──────────────────────────────────────

  describe("基本レンダリング", () => {
    it("タイトルとステップインジケーターを表示する", () => {
      renderComponent();
      expect(
        screen.getByText("tactics.creation.ballPosition"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.stepIndicator"),
      ).toBeInTheDocument();
    });

    it("ヒントテキストを表示する", () => {
      renderComponent();
      expect(
        screen.getByText("tactics.creation.ballPositionHint"),
      ).toBeInTheDocument();
    });

    it("戻る・次へボタンを表示する", () => {
      renderComponent();
      expect(screen.getByText("tactics.creation.back")).toBeInTheDocument();
      expect(screen.getByText("tactics.creation.next")).toBeInTheDocument();
    });
  });

  // ── ボール位置未設定 ──────────────────────────────────────

  describe("ボール位置未設定時", () => {
    it("次へボタンが無効になる", () => {
      renderComponent();
      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).toBeDisabled();
    });

    it("座標が表示されない", () => {
      renderComponent();
      expect(screen.queryByText(/✓/)).not.toBeInTheDocument();
    });
  });

  // ── ボール位置設定済み ────────────────────────────────────

  describe("ボール位置設定済み時", () => {
    const withBallPos = createCreationState({
      ballPosition: { x: 5.5, z: 10.2 },
    });

    it("座標が表示される", () => {
      renderComponent({ creation: withBallPos });
      expect(screen.getByText(/5\.5/)).toBeInTheDocument();
      expect(screen.getByText(/10\.2/)).toBeInTheDocument();
    });

    it("次へボタンが有効になる", () => {
      renderComponent({ creation: withBallPos });
      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).not.toBeDisabled();
    });
  });

  // ── ナビゲーション ──────────────────────────────────────────

  describe("ナビゲーション", () => {
    it("戻るボタンで metadata ステップに移動する", () => {
      const { onWizardStep } = renderComponent();
      fireEvent.click(screen.getByText("tactics.creation.back"));
      expect(onWizardStep).toHaveBeenCalledWith("metadata");
    });

    it("次へボタン（有効時）で ballTrajectory ステップに移動する", () => {
      const onWizardStep = vi.fn();
      const withBallPos = createCreationState({
        ballPosition: { x: 5, z: 10 },
      });
      renderComponent({ creation: withBallPos, onWizardStep });
      fireEvent.click(screen.getByText("tactics.creation.next"));
      expect(onWizardStep).toHaveBeenCalledWith("ballTrajectory");
    });
  });

  // ── ドラッグハンドル ─────────────────────────────────────────

  describe("ドラッグハンドル", () => {
    it("isDragging が true のとき cursor-grabbing クラスが適用される", () => {
      const { container } = renderComponent({ isDragging: true });
      expect(container.querySelector(".cursor-grabbing")).toBeInTheDocument();
    });

    it("isDragging が false のとき cursor-grab クラスが適用される", () => {
      const { container } = renderComponent({ isDragging: false });
      expect(container.querySelector(".cursor-grab")).toBeInTheDocument();
    });

    it("PointerDown で handlePointerDown が呼ばれる", () => {
      const handlePointerDown = vi.fn();
      const { container } = renderComponent({ handlePointerDown });
      fireEvent.pointerDown(container.querySelector(".cursor-grab")!);
      expect(handlePointerDown).toHaveBeenCalledTimes(1);
    });
  });

  // ── オフセット ──────────────────────────────────────────────

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
