/**
 * @module BallTrajectoryStep コンポーネント
 * @description ボール軌道設定ステップの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 軌道タイプ（高い/低い/地面）の選択UIを検証
 * - 軌道の終点設定を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BallTrajectoryStep } from "../BallTrajectoryStep";
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
    wizardStep: "ballTrajectory",
    ballPosition: { x: 0, z: 0 },
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof BallTrajectoryStep>> = {},
) {
  const defaultProps = {
    creation: createCreationState(),
    offset: { x: 0, y: 0 },
    isDragging: false,
    handlePointerDown: vi.fn(),
    t: mockT,
    onWizardStep: vi.fn(),
    onTrajectoryTypeChange: vi.fn(),
    ...overrides,
  };
  return {
    ...render(<BallTrajectoryStep {...defaultProps} />),
    ...defaultProps,
  };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("BallTrajectoryStep", () => {
  // ── 基本レンダリング ──────────────────────────────────────

  describe("基本レンダリング", () => {
    it("タイトルとステップインジケーターを表示する", () => {
      renderComponent();
      expect(
        screen.getByText("tactics.creation.ballLanding"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.stepIndicator"),
      ).toBeInTheDocument();
    });

    it("ヒントテキストを表示する", () => {
      renderComponent();
      expect(
        screen.getByText("tactics.creation.ballLandingHint"),
      ).toBeInTheDocument();
    });

    it("戻る・スキップ・次へボタンを表示する", () => {
      renderComponent();
      expect(screen.getByText("tactics.creation.back")).toBeInTheDocument();
      expect(screen.getByText("tactics.creation.skip")).toBeInTheDocument();
      expect(screen.getByText("tactics.creation.next")).toBeInTheDocument();
    });
  });

  // ── 軌道なし状態 ──────────────────────────────────────────

  describe("軌道未設定時", () => {
    it("次へボタンが無効になる", () => {
      renderComponent({
        creation: createCreationState({ ballTrajectory: null }),
      });
      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).toBeDisabled();
    });

    it("軌道タイプセレクターが表示されない", () => {
      renderComponent({
        creation: createCreationState({ ballTrajectory: null }),
      });
      expect(
        screen.queryByText("tactics.creation.trajectoryType"),
      ).not.toBeInTheDocument();
    });
  });

  // ── 軌道あり状態 ──────────────────────────────────────────

  describe("軌道設定済み時", () => {
    const withTrajectory = createCreationState({
      ballTrajectory: {
        endX: 10.5,
        endZ: 20.3,
        color: "#fff",
        trajectoryType: "high",
      },
    });

    it("座標が表示される", () => {
      renderComponent({ creation: withTrajectory });
      expect(screen.getByText(/10\.5/)).toBeInTheDocument();
      expect(screen.getByText(/20\.3/)).toBeInTheDocument();
    });

    it("次へボタンが有効になる", () => {
      renderComponent({ creation: withTrajectory });
      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).not.toBeDisabled();
    });

    it("軌道タイプセレクターが表示される", () => {
      renderComponent({ creation: withTrajectory });
      expect(
        screen.getByText("tactics.creation.trajectoryType"),
      ).toBeInTheDocument();
    });

    it("4つの軌道タイプボタンを表示する", () => {
      renderComponent({ creation: withTrajectory });
      // trajectory options buttons + navigation buttons
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

    it("現在の軌道タイプが aria-pressed=true になる", () => {
      renderComponent({ creation: withTrajectory });
      const highBtn = screen.getByLabelText("tactics.creation.trajectory.high");
      expect(highBtn).toHaveAttribute("aria-pressed", "true");
    });

    it("軌道タイプをクリックすると onTrajectoryTypeChange が呼ばれる", () => {
      const onTrajectoryTypeChange = vi.fn();
      renderComponent({ creation: withTrajectory, onTrajectoryTypeChange });
      fireEvent.click(screen.getByLabelText("tactics.creation.trajectory.low"));
      expect(onTrajectoryTypeChange).toHaveBeenCalledWith("low");
    });
  });

  // ── ナビゲーション ──────────────────────────────────────────

  describe("ナビゲーション", () => {
    it("戻るボタンで ballPosition ステップに移動する", () => {
      const { onWizardStep } = renderComponent();
      fireEvent.click(screen.getByText("tactics.creation.back"));
      expect(onWizardStep).toHaveBeenCalledWith("ballPosition");
    });

    it("スキップボタンで setPosition ステップに移動する", () => {
      const { onWizardStep } = renderComponent();
      fireEvent.click(screen.getByText("tactics.creation.skip"));
      expect(onWizardStep).toHaveBeenCalledWith("setPosition");
    });

    it("次へボタン（有効時）で setPosition ステップに移動する", () => {
      const onWizardStep = vi.fn();
      const withTrajectory = createCreationState({
        ballTrajectory: {
          endX: 10,
          endZ: 20,
          color: "#fff",
          trajectoryType: "high",
        },
      });
      renderComponent({ creation: withTrajectory, onWizardStep });
      fireEvent.click(screen.getByText("tactics.creation.next"));
      expect(onWizardStep).toHaveBeenCalledWith("setPosition");
    });
  });

  // ── ドラッグハンドル ─────────────────────────────────────────

  describe("ドラッグハンドル", () => {
    it("isDragging が true のとき cursor-grabbing クラスが適用される", () => {
      const { container } = renderComponent({ isDragging: true }).container
        ? renderComponent({ isDragging: true })
        : renderComponent({ isDragging: true });
      // Find the drag handle by its pointer-down handler
      const handle = container.querySelector(".cursor-grabbing");
      expect(handle).toBeInTheDocument();
    });

    it("isDragging が false のとき cursor-grab クラスが適用される", () => {
      const { container } = renderComponent({ isDragging: false });
      const handle = container.querySelector(".cursor-grab");
      expect(handle).toBeInTheDocument();
    });

    it("PointerDown イベントで handlePointerDown が呼ばれる", () => {
      const handlePointerDown = vi.fn();
      const { container } = renderComponent({ handlePointerDown });
      const handle = container.querySelector(".cursor-grab");
      fireEvent.pointerDown(handle!);
      expect(handlePointerDown).toHaveBeenCalledTimes(1);
    });
  });

  // ── オフセット ──────────────────────────────────────────────

  describe("オフセット", () => {
    it("offset が transform スタイルに反映される", () => {
      const { container } = renderComponent({
        offset: { x: 50, y: 100 },
      });
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.transform).toContain("50px");
      expect(wrapper.style.transform).toContain("100px");
    });
  });
});
