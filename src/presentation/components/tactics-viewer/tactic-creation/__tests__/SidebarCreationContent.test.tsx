/**
 * @module SidebarCreationContent コンポーネント
 * @description サイドバー戦術作成コンテンツの単体テスト
 *
 * テスト方針:
 * - 翻訳関数をvi.fnでモック化
 * - ウィザード各ステップに応じたコンテンツ切替を検証
 * - ステップコンポーネントへのprops受け渡しを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarCreationContent } from "../SidebarCreationContent";
import type { CreationState, WizardStep } from "@presentation/hooks/tactic";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants", () => {
  const PHASE_CONFIG: Record<
    string,
    { nameKey: string; icon: string; bgColor: string }
  > = {
    attack: { nameKey: "phase.attack", icon: "A", bgColor: "bg-red-600" },
    defense: { nameKey: "phase.defense", icon: "D", bgColor: "bg-blue-600" },
    positive_transition: {
      nameKey: "phase.positive_transition",
      icon: "PT",
      bgColor: "bg-green-600",
    },
    negative_transition: {
      nameKey: "phase.negative_transition",
      icon: "NT",
      bgColor: "bg-orange-600",
    },
  };
  return { PHASE_CONFIG, Z_INDEX: { DROPDOWN: 100 } };
});

vi.mock("../constants", () => ({
  PHASE_DROPDOWN_KEYS: [
    "attack",
    "defense",
    "positive_transition",
    "negative_transition",
  ],
  ICON_OPTIONS: ["icon1", "icon2"],
  TRAJECTORY_OPTIONS: [
    { type: "low", icon: "->", labelKey: "tactics.creation.trajectory.low" },
    { type: "high", icon: "^", labelKey: "tactics.creation.trajectory.high" },
  ],
  STEP_INDICATOR: "text-slate-500 text-xs mt-0.5",
  SECTION_TITLE: "text-white font-bold text-base tracking-wide",
  SIDEBAR_BTN_PRIMARY:
    "w-full py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white",
  SIDEBAR_BTN_SECONDARY:
    "w-full py-2 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-400",
  SIDEBAR_BTN_DISABLED:
    "w-full py-2 rounded-lg text-xs font-bold bg-slate-800 text-slate-600 cursor-not-allowed",
  SIDEBAR_SECTION: "px-3 py-2 border-b border-slate-800/50",
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function makeCreationState(
  overrides: Partial<CreationState> = {},
): CreationState {
  return {
    nameJa: "",
    nameEn: "",
    icon: "icon1",
    gamePhase: "attack",
    formationName: "4-4-2",
    currentStepIndex: 0,
    steps: [{ id: 1, movements: new Map(), ballPasses: [], duration: 1000 }],
    timelineOpen: false,
    movementDelays: {},
    wizardStep: "metadata",
    ballPosition: null,
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

function defaultProps(
  overrides: Partial<React.ComponentProps<typeof SidebarCreationContent>> = {},
) {
  return {
    creation: makeCreationState(
      overrides.creation as Partial<CreationState> | undefined,
    ),
    language: "ja",
    isExecuting: false,
    isSetPlayMode: false,
    t: mockT,
    onNameJaChange: vi.fn(),
    onNameEnChange: vi.fn(),
    onIconChange: vi.fn(),
    onGamePhaseChange: vi.fn(),
    onWizardStep: vi.fn(),
    onSwitchStep: vi.fn(),
    onAddStep: vi.fn(),
    onResetStep: vi.fn(),
    onResetPreview: vi.fn(),
    onToggleTimeline: vi.fn(),
    onTrajectoryTypeChange: vi.fn(),
    onPreview: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    ballPassCreationMode: false,
    ballPassStartPos: null,
    selectedBallPassTrajectoryType: "high" as const,
    onToggleBallPassMode: vi.fn(),
    onBallPassTrajectoryTypeChange: vi.fn(),
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SidebarCreationContent", () => {
  // ── メタデータステップ ───────────────────────────────

  describe("メタデータステップ (metadata)", () => {
    it("メタデータステップが正常にレンダリングされる", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "metadata" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.create")).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.stepIndicator"),
      ).toBeInTheDocument();
    });

    it("名前入力フィールドが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "metadata",
          nameJa: "test-ja",
          nameEn: "test-en",
        }),
      });
      render(<SidebarCreationContent {...props} />);

      const jaInput = screen.getByLabelText(
        "tactics.creation.nameJaPlaceholder",
      );
      expect(jaInput).toHaveValue("test-ja");

      const enInput = screen.getByLabelText(
        "tactics.creation.nameEnPlaceholder",
      );
      expect(enInput).toHaveValue("test-en");
    });

    it("フォーメーション名が表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "metadata",
          formationName: "4-3-3",
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("4-3-3")).toBeInTheDocument();
    });

    it("名前が未入力の場合、次へボタンが無効になる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "metadata",
          nameJa: "",
          nameEn: "",
        }),
      });
      render(<SidebarCreationContent {...props} />);

      const nextButton = screen
        .getByText("tactics.creation.next")
        .closest("button")!;
      expect(nextButton).toBeDisabled();
    });

    it("名前が入力されている場合、次へボタンが有効になる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "metadata",
          nameJa: "テスト戦術",
        }),
      });
      render(<SidebarCreationContent {...props} />);

      const nextButton = screen
        .getByText("tactics.creation.next")
        .closest("button")!;
      expect(nextButton).not.toBeDisabled();
    });

    it("セットプレーモードの場合、フェーズドロップダウンが静的表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "metadata" }),
        isSetPlayMode: true,
      });
      render(<SidebarCreationContent {...props} />);

      // セットプレーモードではドロップダウンボタンではなく静的テキスト
      expect(
        screen.getByText("tactics.creation.gamePhase"),
      ).toBeInTheDocument();
      expect(screen.getByText("phase.attack")).toBeInTheDocument();
    });

    it("キャンセルボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "metadata" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.cancel")).toBeInTheDocument();
    });
  });

  // ── ボール位置ステップ ───────────────────────────────

  describe("ボール位置ステップ (ballPosition)", () => {
    it("ボール位置ステップが正常にレンダリングされる", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "ballPosition" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText("tactics.creation.ballPosition"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.ballPositionHint"),
      ).toBeInTheDocument();
    });

    it("ボール位置が未設定の場合、次へボタンが無効になる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "ballPosition",
          ballPosition: null,
        }),
      });
      render(<SidebarCreationContent {...props} />);

      const nextButton = screen
        .getByText("tactics.creation.next")
        .closest("button")!;
      expect(nextButton).toBeDisabled();
    });

    it("ボール位置が設定済みの場合、座標が表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "ballPosition",
          ballPosition: { x: 1.5, z: 2.3 },
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText(/1\.5/)).toBeInTheDocument();
      expect(screen.getByText(/2\.3/)).toBeInTheDocument();
    });

    it("戻るボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "ballPosition" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.back")).toBeInTheDocument();
    });
  });

  // ── ボール軌道ステップ ───────────────────────────────

  describe("ボール軌道ステップ (ballTrajectory)", () => {
    it("ボール軌道ステップが正常にレンダリングされる", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "ballTrajectory" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText("tactics.creation.ballLanding"),
      ).toBeInTheDocument();
    });

    it("軌道が未設定の場合、次へボタンが無効になる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "ballTrajectory",
          ballTrajectory: null,
        }),
      });
      render(<SidebarCreationContent {...props} />);

      const nextButton = screen
        .getByText("tactics.creation.next")
        .closest("button")!;
      expect(nextButton).toBeDisabled();
    });

    it("軌道が設定済みの場合、軌道タイプセレクターが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "ballTrajectory",
          ballTrajectory: {
            endX: 3.0,
            endZ: 4.0,
            color: "#fff",
            trajectoryType: "high",
          },
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText("tactics.creation.trajectoryType"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.trajectory.low"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.trajectory.high"),
      ).toBeInTheDocument();
    });

    it("スキップボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "ballTrajectory" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.skip")).toBeInTheDocument();
    });
  });

  // ── セット位置ステップ ───────────────────────────────

  describe("セット位置ステップ (setPosition)", () => {
    it("セット位置ステップが正常にレンダリングされる", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "setPosition" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText("tactics.creation.setPosition"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.setPositionHint"),
      ).toBeInTheDocument();
    });

    it("配置済み選手数が表示される", () => {
      const positions = new Map<string, { x: number; z: number }>();
      positions.set("role1", { x: 1, z: 1 });
      positions.set("role2", { x: 2, z: 2 });

      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "setPosition",
          setPositions: positions,
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText("tactics.creation.playersPlaced"),
      ).toBeInTheDocument();
    });
  });

  // ── 編集ステップ ───────────────────────────────────

  describe("編集ステップ (editing)", () => {
    it("編集ステップが正常にレンダリングされる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "editing",
          nameJa: "テスト戦術",
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("テスト戦術")).toBeInTheDocument();
      expect(
        screen.getByText("tactics.creation.editingGuide"),
      ).toBeInTheDocument();
    });

    it("ステップタブが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "editing",
          steps: [
            {
              id: 1,
              movements: new Map(),
              ballPasses: [],
              duration: 1000,
            },
            {
              id: 2,
              movements: new Map(),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("ボールパスモードの場合、パスモードUIが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "editing" }),
        ballPassCreationMode: true,
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText(/tactics\.creation\.passStartPosition/),
      ).toBeInTheDocument();
    });

    it("ボールパス開始位置が設定済みの場合、開始座標が表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "editing" }),
        ballPassCreationMode: true,
        ballPassStartPos: { x: 1.0, z: 2.0 },
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText(/1\.0/)).toBeInTheDocument();
      expect(screen.getByText(/2\.0/)).toBeInTheDocument();
    });

    it("動きが0件の場合、完了ボタンが無効になる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "editing",
          steps: [
            {
              id: 1,
              movements: new Map(),
              ballPasses: [],
              duration: 1000,
            },
          ],
        }),
      });
      render(<SidebarCreationContent {...props} />);

      const completeButton = screen
        .getByText(/tactics\.creation\.stepComplete/)
        .closest("button")!;
      expect(completeButton).toBeDisabled();
    });

    it("動きがある場合、完了ボタンが有効になる", () => {
      const movements = new Map<
        string,
        { targetX: number; targetZ: number; color: string }
      >();
      movements.set("role1", { targetX: 1, targetZ: 1, color: "#fff" });

      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "editing",
          steps: [{ id: 1, movements, ballPasses: [], duration: 1000 }],
        }),
      });
      render(<SidebarCreationContent {...props} />);

      const completeButton = screen
        .getByText(/tactics\.creation\.stepComplete/)
        .closest("button")!;
      expect(completeButton).not.toBeDisabled();
    });

    it("リセットステップボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "editing" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText("tactics.creation.resetStep"),
      ).toBeInTheDocument();
    });

    it("Passトグルボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "editing" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("Pass")).toBeInTheDocument();
    });
  });

  // ── 確認ステップ ───────────────────────────────────

  describe("確認ステップ (confirm)", () => {
    it("確認ステップが正常にレンダリングされる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "confirm",
          nameJa: "テスト戦術",
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("テスト戦術")).toBeInTheDocument();
      expect(screen.getByText("tactics.creation.confirm")).toBeInTheDocument();
    });

    it("保存ボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "confirm" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.getByText("tactics.creation.saveTactic"),
      ).toBeInTheDocument();
    });

    it("複数ステップ時にプレビューボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "confirm",
          steps: [
            { id: 1, movements: new Map(), ballPasses: [], duration: 1000 },
            { id: 2, movements: new Map(), ballPasses: [], duration: 1000 },
          ],
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.preview")).toBeInTheDocument();
    });

    it("ステップ1のみの場合はプレビューボタンが表示されない", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "confirm" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(
        screen.queryByText("tactics.creation.preview"),
      ).not.toBeInTheDocument();
    });

    it("タイムラインボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "confirm" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.timeline")).toBeInTheDocument();
    });

    it("ステップ追加ボタンが表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({ wizardStep: "confirm" }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.addStep2")).toBeInTheDocument();
    });

    it("実行中の場合、プレビューボタンが無効になる", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "confirm",
          steps: [
            { id: 1, movements: new Map(), ballPasses: [], duration: 1000 },
            { id: 2, movements: new Map(), ballPasses: [], duration: 1000 },
          ],
        }),
        isExecuting: true,
      });
      render(<SidebarCreationContent {...props} />);

      const previewButton = screen
        .getByText("tactics.creation.preview")
        .closest("button")!;
      expect(previewButton).toBeDisabled();
    });

    it("ボールパス数が0より大きい場合、パス数が表示される", () => {
      const props = defaultProps({
        creation: makeCreationState({
          wizardStep: "confirm",
          steps: [
            {
              id: 1,
              movements: new Map(),
              ballPasses: [
                {
                  startRole: "r1",
                  endRole: "r2",
                  color: "#fff",
                },
              ],
              duration: 1000,
            },
          ],
        }),
      });
      render(<SidebarCreationContent {...props} />);

      expect(screen.getByText("tactics.creation.passes")).toBeInTheDocument();
    });
  });

  // ── ウィザードステップルーティング ───────────────────

  describe("ウィザードステップルーティング", () => {
    const wizardSteps: WizardStep[] = [
      "metadata",
      "ballPosition",
      "ballTrajectory",
      "setPosition",
      "editing",
      "confirm",
    ];

    it.each(wizardSteps)(
      "wizardStep='%s' でクラッシュせずレンダリングされる",
      (step) => {
        const creation = makeCreationState({
          wizardStep: step,
          nameJa: "test",
        });
        const props = defaultProps({ creation });
        const { container } = render(<SidebarCreationContent {...props} />);
        expect(container.firstChild).not.toBeNull();
      },
    );
  });
});
