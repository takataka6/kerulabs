/**
 * @module SetPositionStep コンポーネント
 * @description ポジション設定ステップの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 選手ポジションの設定UIを検証
 * - ポジション確定と次ステップへの遷移を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SetPositionStep } from "../SetPositionStep";
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
    wizardStep: "setPosition",
    ballPosition: null,
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof SetPositionStep>> = {},
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
  return { ...render(<SetPositionStep {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("SetPositionStep", () => {
  // ── 基本レンダリング ──────────────────────────────────────

  describe("基本レンダリング", () => {
    it("タイトルとステップインジケーターを表示する", () => {
      renderComponent();
      expect(
        screen.getByText("tactics.creation.setPosition"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.stepIndicator"),
      ).toBeInTheDocument();
    });

    it("ヒントテキストを表示する", () => {
      renderComponent();
      expect(
        screen.getByText("tactics.creation.setPositionHint"),
      ).toBeInTheDocument();
    });

    it("戻る・次へボタンを表示する", () => {
      renderComponent();
      expect(screen.getByText("tactics.creation.back")).toBeInTheDocument();
      expect(screen.getByText("tactics.creation.next")).toBeInTheDocument();
    });

    it("次へボタンは常に有効", () => {
      renderComponent();
      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).not.toBeDisabled();
    });
  });

  // ── 配置済みプレイヤー表示 ────────────────────────────────

  describe("配置済みプレイヤー表示", () => {
    it("配置数が 0 のとき配置済みカウントを表示しない", () => {
      renderComponent();
      expect(
        screen.queryByText("tactics.creation.playersPlaced"),
      ).not.toBeInTheDocument();
    });

    it("配置数が 1 以上のとき配置済みカウントを表示する", () => {
      const positions = new Map<string, { x: number; z: number }>();
      positions.set("player-1", { x: 0, z: 0 });
      positions.set("player-2", { x: 5, z: 5 });
      renderComponent({
        creation: createCreationState({ setPositions: positions }),
      });
      expect(
        screen.getByText("tactics.creation.playersPlaced"),
      ).toBeInTheDocument();
    });
  });

  // ── ナビゲーション ──────────────────────────────────────────

  describe("ナビゲーション", () => {
    it("シチュエーション作成では戻るボタンで metadata ステップに移動する", () => {
      const { onWizardStep } = renderComponent();
      fireEvent.click(screen.getByText("tactics.creation.back"));
      expect(onWizardStep).toHaveBeenCalledWith("metadata");
    });

    it("セットプレー作成では戻るボタンで ballTrajectory ステップに移動する", () => {
      const { onWizardStep } = renderComponent({
        creation: createCreationState({ creationMode: "setPlay" }),
      });
      fireEvent.click(screen.getByText("tactics.creation.back"));
      expect(onWizardStep).toHaveBeenCalledWith("ballTrajectory");
    });

    it("次へボタンで editing ステップに移動する", () => {
      const { onWizardStep } = renderComponent();
      fireEvent.click(screen.getByText("tactics.creation.next"));
      expect(onWizardStep).toHaveBeenCalledWith("editing");
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
        offset: { x: 20, y: 40 },
      });
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.transform).toContain("20px");
      expect(wrapper.style.transform).toContain("40px");
    });
  });
});
