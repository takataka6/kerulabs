/**
 * @module MetadataStep コンポーネント
 * @description メタデータ入力ステップの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 戦術名・アイコン・フェーズの入力フォームを検証
 * - バリデーションと次ステップへの遷移を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MetadataStep } from "../MetadataStep";
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
    formationName: "4-3-3",
    currentStepIndex: 0,
    steps: [],
    timelineOpen: false,
    movementDelays: {},
    wizardStep: "metadata",
    ballPosition: null,
    ballTrajectory: null,
    setPositions: new Map(),
    ...overrides,
  };
}

function renderComponent(
  overrides: Partial<React.ComponentProps<typeof MetadataStep>> = {},
) {
  const defaultProps = {
    creation: createCreationState(),
    isSetPlayMode: false,
    offset: { x: 0, y: 0 },
    isDragging: false,
    handlePointerDown: vi.fn(),
    t: mockT,
    onNameJaChange: vi.fn(),
    onNameEnChange: vi.fn(),
    onIconChange: vi.fn(),
    onGamePhaseChange: vi.fn(),
    onWizardStep: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  return { ...render(<MetadataStep {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("MetadataStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 基本レンダリング ──

  describe("基本レンダリング", () => {
    it("タイトルが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.create")).toBeInTheDocument();
    });

    it("ステップインジケーターが表示される", () => {
      renderComponent();

      expect(
        screen.getByText("tactics.creation.stepIndicator"),
      ).toBeInTheDocument();
    });

    it("日本語名入力フィールドが表示される", () => {
      renderComponent();

      expect(
        screen.getByLabelText("tactics.creation.nameJaPlaceholder"),
      ).toBeInTheDocument();
    });

    it("英語名入力フィールドが表示される", () => {
      renderComponent();

      expect(
        screen.getByLabelText("tactics.creation.nameEnPlaceholder"),
      ).toBeInTheDocument();
    });

    it("フォーメーション名が表示される", () => {
      renderComponent();

      expect(screen.getByText("4-3-3")).toBeInTheDocument();
    });

    it("キャンセルボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.cancel")).toBeInTheDocument();
    });

    it("次へボタンが表示される", () => {
      renderComponent();

      expect(screen.getByText("tactics.creation.next")).toBeInTheDocument();
    });

    it("アイコン選択ボタンが表示される", () => {
      renderComponent();

      expect(
        screen.getByLabelText("tactics.creation.selectIcon"),
      ).toBeInTheDocument();
    });

    it("フェーズ選択ラベルが表示される", () => {
      renderComponent();

      expect(
        screen.getByText("tactics.creation.gamePhase"),
      ).toBeInTheDocument();
    });
  });

  // ── 名前入力 ──

  describe("名前入力", () => {
    it("日本語名を入力するとonNameJaChangeが呼ばれる", () => {
      const { onNameJaChange } = renderComponent();

      const input = screen.getByLabelText("tactics.creation.nameJaPlaceholder");
      fireEvent.change(input, { target: { value: "テスト戦術" } });

      expect(onNameJaChange).toHaveBeenCalledWith("テスト戦術");
    });

    it("英語名を入力するとonNameEnChangeが呼ばれる", () => {
      const { onNameEnChange } = renderComponent();

      const input = screen.getByLabelText("tactics.creation.nameEnPlaceholder");
      fireEvent.change(input, { target: { value: "Test Tactic" } });

      expect(onNameEnChange).toHaveBeenCalledWith("Test Tactic");
    });
  });

  // ── 次へボタン状態 ──

  describe("次へボタン状態", () => {
    it("名前が未入力の場合、次へボタンが無効になる", () => {
      renderComponent();

      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).toBeDisabled();
    });

    it("日本語名が入力されている場合、次へボタンが有効になる", () => {
      renderComponent({
        creation: createCreationState({ nameJa: "テスト" }),
      });

      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).not.toBeDisabled();
    });

    it("英語名が入力されている場合、次へボタンが有効になる", () => {
      renderComponent({
        creation: createCreationState({ nameEn: "Test" }),
      });

      const nextBtn = screen
        .getByText("tactics.creation.next")
        .closest("button");
      expect(nextBtn).not.toBeDisabled();
    });
  });

  // ── ナビゲーション ──

  describe("ナビゲーション", () => {
    it("通常モードで次へボタンをクリックするとeditingステップに移動する", () => {
      const onWizardStep = vi.fn();
      renderComponent({
        creation: createCreationState({ nameJa: "テスト" }),
        isSetPlayMode: false,
        onWizardStep,
      });

      fireEvent.click(screen.getByText("tactics.creation.next"));

      expect(onWizardStep).toHaveBeenCalledWith("editing");
    });

    it("セットプレーモードで次へボタンをクリックするとballPositionステップに移動する", () => {
      const onWizardStep = vi.fn();
      renderComponent({
        creation: createCreationState({ nameJa: "テスト" }),
        isSetPlayMode: true,
        onWizardStep,
      });

      fireEvent.click(screen.getByText("tactics.creation.next"));

      expect(onWizardStep).toHaveBeenCalledWith("ballPosition");
    });

    it("キャンセルボタンをクリックするとonCancelが呼ばれる", () => {
      const { onCancel } = renderComponent();

      fireEvent.click(screen.getByText("tactics.creation.cancel"));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ── フェーズ選択（通常モード） ──

  describe("フェーズ選択（通常モード）", () => {
    it("フェーズドロップダウンボタンが表示される", () => {
      renderComponent({ isSetPlayMode: false });

      const phaseButton = screen.getByRole("button", {
        name: /phase\./,
      });
      expect(phaseButton).toBeInTheDocument();
    });

    it("ドロップダウンをクリックするとフェーズ一覧が表示される", () => {
      renderComponent({ isSetPlayMode: false });

      const phaseButton = screen.getByRole("button", {
        name: /phase\./,
      });
      fireEvent.click(phaseButton);

      // 4つのフェーズオプションが表示される
      const phaseButtons = screen.getAllByRole("button");
      expect(phaseButtons.length).toBeGreaterThan(3);
    });
  });

  // ── フェーズ表示（セットプレーモード） ──

  describe("フェーズ表示（セットプレーモード）", () => {
    it("セットプレーモードではフェーズが読み取り専用で表示される", () => {
      renderComponent({ isSetPlayMode: true });

      // ドロップダウンボタンではなく、静的表示
      expect(
        screen.queryByRole("button", { name: /phase\./ }),
      ).not.toBeInTheDocument();
    });
  });

  // ── アイコンピッカー ──

  describe("アイコンピッカー", () => {
    it("アイコンボタンをクリックするとピッカーが表示される", () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText("tactics.creation.selectIcon"));

      // ICON_OPTIONS = ["⚽", "📐", "↗️", "↘️", "🔄", "⚡", "🛡️", "🎯"]
      // アイコン選択ボタンが8つ存在する
      const iconButtons = screen.getAllByLabelText(/tactics\.creation\.icon/);
      expect(iconButtons.length).toBe(8);
    });

    it("アイコンを選択するとonIconChangeが呼ばれる", () => {
      const { onIconChange } = renderComponent();

      fireEvent.click(screen.getByLabelText("tactics.creation.selectIcon"));

      // 🎯 アイコンを選択
      const targetIcon = screen.getByLabelText("tactics.creation.icon 🎯");
      fireEvent.click(targetIcon);

      expect(onIconChange).toHaveBeenCalledWith("🎯");
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

    it("PointerDown で handlePointerDown が呼ばれる", () => {
      const handlePointerDown = vi.fn();
      const { container } = renderComponent({ handlePointerDown });

      fireEvent.pointerDown(container.querySelector(".cursor-grab")!);

      expect(handlePointerDown).toHaveBeenCalledTimes(1);
    });
  });

  // ── オフセット ──

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
