/**
 * @module PhaseDiamond コンポーネント
 * @description フェーズダイヤモンド（4フェーズ表示）の単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 攻撃/守備/ポジ遷移/ネガ遷移の4フェーズ表示を検証
 * - フェーズ選択時のコールバック呼び出しを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhaseDiamond } from "../PhaseDiamond";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/phases", () => ({
  PHASE_CONFIG: {
    attack: { icon: "⚽" },
    positive_transition: { icon: "⚡" },
    negative_transition: { icon: "🔄" },
    defense: { icon: "🛡️" },
  },
}));

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function renderPhaseDiamond(
  overrides: Partial<React.ComponentProps<typeof PhaseDiamond>> = {},
) {
  const props = {
    selectedPhase: "attack" as const,
    onPhaseChange: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return { ...render(<PhaseDiamond {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("PhaseDiamond", () => {
  // ── レンダリング ──────────────────────────────────────────

  describe("レンダリング", () => {
    it("4つのフェーズボタンが表示される", () => {
      renderPhaseDiamond();

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);
    });

    it("各フェーズのアイコンが表示される", () => {
      renderPhaseDiamond();

      expect(screen.getByText("⚽")).toBeInTheDocument();
      expect(screen.getByText("⚡")).toBeInTheDocument();
      expect(screen.getByText("🔄")).toBeInTheDocument();
      expect(screen.getByText("🛡️")).toBeInTheDocument();
    });

    it("翻訳関数が各フェーズのラベルで呼ばれる", () => {
      renderPhaseDiamond();

      expect(mockT).toHaveBeenCalledWith("phase.attack");
      expect(mockT).toHaveBeenCalledWith("phase.positive_transition");
      expect(mockT).toHaveBeenCalledWith("phase.negative_transition");
      expect(mockT).toHaveBeenCalledWith("phase.defense");
    });

    it("SVG 菱形が描画される", () => {
      const { container } = renderPhaseDiamond();

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();

      const path = container.querySelector("path");
      expect(path).toBeInTheDocument();
    });
  });

  // ── フェーズ選択 ──────────────────────────────────────────

  describe("フェーズ選択", () => {
    it("attack ボタンクリックで onPhaseChange('attack') が呼ばれる", () => {
      const { onPhaseChange } = renderPhaseDiamond({
        selectedPhase: "defense",
      });

      const attackButton = screen.getByTitle("phase.attack");
      fireEvent.click(attackButton);

      expect(onPhaseChange).toHaveBeenCalledWith("attack");
    });

    it("defense ボタンクリックで onPhaseChange('defense') が呼ばれる", () => {
      const { onPhaseChange } = renderPhaseDiamond({
        selectedPhase: "attack",
      });

      const defenseButton = screen.getByTitle("phase.defense");
      fireEvent.click(defenseButton);

      expect(onPhaseChange).toHaveBeenCalledWith("defense");
    });

    it("positive_transition ボタンクリックで onPhaseChange が呼ばれる", () => {
      const { onPhaseChange } = renderPhaseDiamond();

      const ptButton = screen.getByTitle("phase.positive_transition");
      fireEvent.click(ptButton);

      expect(onPhaseChange).toHaveBeenCalledWith("positive_transition");
    });

    it("negative_transition ボタンクリックで onPhaseChange が呼ばれる", () => {
      const { onPhaseChange } = renderPhaseDiamond();

      const ntButton = screen.getByTitle("phase.negative_transition");
      fireEvent.click(ntButton);

      expect(onPhaseChange).toHaveBeenCalledWith("negative_transition");
    });
  });

  // ── 選択状態のスタイル ────────────────────────────────────

  describe("選択状態", () => {
    it("選択中のフェーズに scale-110 クラスが適用される", () => {
      renderPhaseDiamond({ selectedPhase: "attack" });

      const button = screen.getByTitle("phase.attack");
      expect(button.className).toContain("scale-110");
    });

    it("非選択のフェーズに scale-110 が適用されない", () => {
      renderPhaseDiamond({ selectedPhase: "attack" });

      const button = screen.getByTitle("phase.defense");
      expect(button.className).not.toContain("scale-110");
    });
  });
});
