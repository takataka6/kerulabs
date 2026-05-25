/**
 * @module TimelineEditor コンポーネント
 * @description タイムラインエディタの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 移動・ボールパスのタイムライン表示と編集を検証
 * - ドラッグ操作によるdelay変更を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimelineEditor } from "../TimelineEditor";
import type { CreationStep } from "@presentation/hooks/tactic";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createStep(overrides?: Partial<CreationStep>): CreationStep {
  return {
    id: overrides?.id ?? 1,
    movements: overrides?.movements ?? new Map(),
    ballPasses: overrides?.ballPasses ?? [],
    duration: overrides?.duration ?? 500,
  };
}

function createStepWithMovements(
  id: number,
  roles: Array<{
    role: string;
    targetX: number;
    targetZ: number;
    color: string;
  }>,
  duration = 500,
): CreationStep {
  const movements = new Map<
    string,
    { targetX: number; targetZ: number; color: string }
  >();
  for (const r of roles) {
    movements.set(r.role, {
      targetX: r.targetX,
      targetZ: r.targetZ,
      color: r.color,
    });
  }
  return { id, movements, ballPasses: [], duration };
}

interface RenderOptions {
  steps?: CreationStep[];
  movementDelays?: Record<number, Record<string, number>>;
  onMovementDelayChange?: ReturnType<typeof vi.fn>;
  onStepDurationChange?: ReturnType<typeof vi.fn>;
  onRemoveBallPass?: ReturnType<typeof vi.fn>;
  onBallPassTrajectoryChange?: ReturnType<typeof vi.fn>;
  onClose?: ReturnType<typeof vi.fn>;
}

function renderTimelineEditor(options: RenderOptions = {}) {
  const {
    steps = [createStep()],
    movementDelays = {},
    onMovementDelayChange = vi.fn(),
    onStepDurationChange = vi.fn(),
    onRemoveBallPass,
    onBallPassTrajectoryChange,
    onClose = vi.fn(),
  } = options;

  const formation = {
    id: "f-1",
    name: "4-3-3",
    positions: [],
    roleMap: new Map(),
    getPlayerIndexByRole: () => undefined,
    getPositionByIndex: () => undefined,
  };

  return {
    ...render(
      <TimelineEditor
        steps={steps}
        movementDelays={movementDelays}
        formation={formation as never}
        t={mockT}
        onMovementDelayChange={onMovementDelayChange}
        onStepDurationChange={onStepDurationChange}
        onRemoveBallPass={onRemoveBallPass}
        onBallPassTrajectoryChange={onBallPassTrajectoryChange}
        onClose={onClose}
      />,
    ),
    onMovementDelayChange,
    onStepDurationChange,
    onClose,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("TimelineEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── ヘッダー ──

  it("Timeline ヘッダーと閉じるボタンを表示する", () => {
    renderTimelineEditor();

    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "timeline.close" }),
    ).toBeInTheDocument();
  });

  it("閉じるボタンをクリックすると onClose が呼ばれる", () => {
    const { onClose } = renderTimelineEditor();

    fireEvent.click(screen.getByRole("button", { name: "timeline.close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── ステップヘッダー ──

  it("ステップ番号を表示する", () => {
    renderTimelineEditor({
      steps: [createStep({ id: 1 }), createStep({ id: 2, duration: 300 })],
    });

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  // ── duration 入力 ──

  it("duration 入力フィールドにステップの duration が表示される", () => {
    renderTimelineEditor({ steps: [createStep({ duration: 800 })] });

    const input = screen.getByRole("spinbutton", {
      name: /timeline\.stepDuration/,
    });
    expect(input).toHaveValue(800);
  });

  it("duration を変更すると onStepDurationChange が呼ばれる", () => {
    const { onStepDurationChange } = renderTimelineEditor({
      steps: [createStep({ duration: 500 })],
    });

    const input = screen.getByRole("spinbutton", {
      name: /timeline\.stepDuration/,
    });
    fireEvent.change(input, { target: { value: "1000" } });

    expect(onStepDurationChange).toHaveBeenCalledWith(0, 1000);
  });

  it("100 未満の duration は無視される", () => {
    const { onStepDurationChange } = renderTimelineEditor({
      steps: [createStep({ duration: 500 })],
    });

    const input = screen.getByRole("spinbutton", {
      name: /timeline\.stepDuration/,
    });
    fireEvent.change(input, { target: { value: "50" } });

    expect(onStepDurationChange).not.toHaveBeenCalled();
  });

  // ── ムーブメントバー ──

  it("ムーブメントの role ラベルを表示する", () => {
    const step = createStepWithMovements(1, [
      { role: "CF", targetX: 0, targetZ: 5, color: "#ef4444" },
      { role: "CM", targetX: 1, targetZ: 3, color: "#3b82f6" },
    ]);

    renderTimelineEditor({ steps: [step] });

    expect(screen.getByText("CF")).toBeInTheDocument();
    expect(screen.getByText("CM")).toBeInTheDocument();
  });

  it("ムーブメントバーに slider role と aria 属性がある", () => {
    const step = createStepWithMovements(1, [
      { role: "CF", targetX: 0, targetZ: 5, color: "#ef4444" },
    ]);

    renderTimelineEditor({
      steps: [step],
      movementDelays: { 1: { CF: 200 } },
    });

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "200");
  });

  it("遅延がある場合、+{delay}ms テキストを表示する", () => {
    const step = createStepWithMovements(1, [
      { role: "CF", targetX: 0, targetZ: 5, color: "#ef4444" },
    ]);

    renderTimelineEditor({
      steps: [step],
      movementDelays: { 1: { CF: 300 } },
    });

    expect(screen.getByText("+300")).toBeInTheDocument();
  });

  // ── ボールパスバー ──

  it("ボールパスの Pass ラベルを表示する", () => {
    const step = createStep({
      ballPasses: [
        {
          startRole: "CB",
          endRole: "CF",
          color: "#facc15",
        },
      ],
    });

    renderTimelineEditor({ steps: [step] });

    expect(screen.getByText("Pass")).toBeInTheDocument();
  });

  it("ボールパスの startRole → endRole を表示する", () => {
    const step = createStep({
      ballPasses: [
        {
          startRole: "GK",
          endRole: "CB",
          color: "#facc15",
        },
      ],
    });

    renderTimelineEditor({ steps: [step] });

    expect(screen.getByText(/GK.*→.*CB/)).toBeInTheDocument();
  });

  it("onRemoveBallPass が渡された場合、削除ボタンを表示する", () => {
    const onRemoveBallPass = vi.fn();
    const step = createStep({
      ballPasses: [
        {
          startRole: "CB",
          endRole: "CF",
          color: "#facc15",
        },
      ],
    });

    renderTimelineEditor({ steps: [step], onRemoveBallPass });

    const removeBtn = screen.getByRole("button", {
      name: /timeline\.removePass/,
    });
    fireEvent.click(removeBtn);

    expect(onRemoveBallPass).toHaveBeenCalledWith(0);
  });

  // ── トラジェクトリ変更 ──

  it("onBallPassTrajectoryChange が渡された場合、トラジェクトリボタンを表示する", () => {
    const onBallPassTrajectoryChange = vi.fn();
    const step = createStep({
      ballPasses: [
        {
          startRole: "CB",
          endRole: "CF",
          color: "#facc15",
          trajectoryType: "low",
        },
      ],
    });

    renderTimelineEditor({ steps: [step], onBallPassTrajectoryChange });

    const btn = screen.getByRole("button", {
      name: /timeline\.trajectoryType/,
    });
    fireEvent.click(btn);

    // low → high (cycle order: low, high, curveLeft, curveRight)
    expect(onBallPassTrajectoryChange).toHaveBeenCalledWith(0, "high");
  });

  // ── ルーラー ──

  it("ルーラーに時間目盛りを表示する", () => {
    renderTimelineEditor({
      steps: [createStep({ duration: 1500 })],
    });

    // 0ms, 500ms, 1000ms, 1500ms, 2000ms が表示されるはず
    expect(screen.getByText("0ms")).toBeInTheDocument();
    expect(screen.getByText("500ms")).toBeInTheDocument();
    expect(screen.getByText("1000ms")).toBeInTheDocument();
  });

  // ── 座標ベースのボールパス表示 ──

  it("座標ベースのボールパスは座標を表示する", () => {
    const step = createStep({
      ballPasses: [
        {
          startRole: "",
          endRole: "",
          color: "#facc15",
          startX: 1.5,
          startZ: 2.5,
          endX: 3.5,
          endZ: 4.5,
        },
      ],
    });

    renderTimelineEditor({ steps: [step] });

    // (1,3) → (4,5) or similar fixed formatting
    expect(screen.getByText(/\(2,3\).*→.*\(4,5\)/)).toBeInTheDocument();
  });
});
