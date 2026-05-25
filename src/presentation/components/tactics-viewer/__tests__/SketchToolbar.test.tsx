/**
 * @module SketchToolbar コンポーネント
 * @description スケッチツールバーの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - ペン/消しゴムツール切替・色選択・太さ変更を検証
 * - レイヤー管理UIの表示を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SketchToolbar } from "../SketchToolbar";
import type { SketchLayer } from "@presentation/hooks/sketch";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function makeLayer(overrides: Partial<SketchLayer> = {}): SketchLayer {
  return {
    id: 1,
    strokes: [],
    visible: true,
    name: "Layer 1",
    ...overrides,
  } as SketchLayer;
}

function defaultProps(
  overrides: Partial<React.ComponentProps<typeof SketchToolbar>> = {},
): React.ComponentProps<typeof SketchToolbar> {
  return {
    activeTool: "pen",
    onToolChange: vi.fn(),
    strokeColor: "#ef4444",
    onColorChange: vi.fn(),
    strokeWidth: 4,
    onWidthChange: vi.fn(),
    layers: [makeLayer()],
    activeLayerId: 1,
    onLayerSelect: vi.fn(),
    onToggleLayerVisibility: vi.fn(),
    onAddLayer: vi.fn(),
    onRemoveLayer: vi.fn(),
    onRenameLayer: vi.fn(),
    onReorderLayers: vi.fn(),
    onUndo: vi.fn(),
    onClear: vi.fn(),
    onClearAll: vi.fn(),
    t: mockT,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("SketchToolbar", () => {
  // ── ツール選択 ────────────────────────────────────────

  describe("ツール選択", () => {
    it("ペン・ライン・矢印のツールボタンが表示される", () => {
      render(<SketchToolbar {...defaultProps()} />);

      expect(screen.getByLabelText("tactics.sketch.pen")).toBeInTheDocument();
      expect(screen.getByLabelText("tactics.sketch.line")).toBeInTheDocument();
      expect(screen.getByLabelText("tactics.sketch.arrow")).toBeInTheDocument();
    });

    it("アクティブツールがaria-pressedでマークされる", () => {
      render(<SketchToolbar {...defaultProps({ activeTool: "line" })} />);

      const lineBtn = screen.getByLabelText("tactics.sketch.line");
      expect(lineBtn).toHaveAttribute("aria-pressed", "true");

      const penBtn = screen.getByLabelText("tactics.sketch.pen");
      expect(penBtn).toHaveAttribute("aria-pressed", "false");
    });
  });

  // ── カラーパレット ────────────────────────────────────

  describe("カラーパレット", () => {
    it("6色のカラーボタンが表示される", () => {
      render(<SketchToolbar {...defaultProps()} />);

      expect(screen.getByLabelText("Red")).toBeInTheDocument();
      expect(screen.getByLabelText("Cyan")).toBeInTheDocument();
      expect(screen.getByLabelText("Green")).toBeInTheDocument();
      expect(screen.getByLabelText("Amber")).toBeInTheDocument();
      expect(screen.getByLabelText("Purple")).toBeInTheDocument();
      expect(screen.getByLabelText("White")).toBeInTheDocument();
    });
  });

  // ── 太さ選択 ──────────────────────────────────────────

  describe("太さ選択", () => {
    it("S, M, Lの太さボタンが表示される", () => {
      render(<SketchToolbar {...defaultProps()} />);

      expect(screen.getByText("S")).toBeInTheDocument();
      expect(screen.getByText("M")).toBeInTheDocument();
      expect(screen.getByText("L")).toBeInTheDocument();
    });

    it("選択中の太さがaria-pressedでマークされる", () => {
      render(<SketchToolbar {...defaultProps({ strokeWidth: 2 })} />);

      const sBtn = screen.getByText("S");
      expect(sBtn).toHaveAttribute("aria-pressed", "true");

      const mBtn = screen.getByText("M");
      expect(mBtn).toHaveAttribute("aria-pressed", "false");
    });
  });

  // ── アクションボタン ──────────────────────────────────

  describe("アクションボタン", () => {
    it("Undo, Clear, ClearAllボタンが表示される", () => {
      render(<SketchToolbar {...defaultProps()} />);

      expect(screen.getByText("tactics.sketch.undo")).toBeInTheDocument();
      expect(screen.getByText("tactics.sketch.clear")).toBeInTheDocument();
      expect(screen.getByText("tactics.sketch.clearAll")).toBeInTheDocument();
    });
  });

  // ── レイヤーパネル ────────────────────────────────────

  describe("レイヤーパネル", () => {
    it("Layersヘッダーが表示される", () => {
      render(<SketchToolbar {...defaultProps()} />);

      expect(screen.getByText("Layers")).toBeInTheDocument();
    });

    it("レイヤー名が表示される", () => {
      render(
        <SketchToolbar
          {...defaultProps({
            layers: [makeLayer({ id: 1, name: "My Layer" })],
          })}
        />,
      );

      expect(screen.getByText("My Layer")).toBeInTheDocument();
    });

    it("レイヤーが3未満の場合、追加ボタンが表示される", () => {
      render(
        <SketchToolbar
          {...defaultProps({
            layers: [
              makeLayer({ id: 1, name: "Layer 1" }),
              makeLayer({ id: 2, name: "Layer 2" }),
            ],
          })}
        />,
      );

      expect(screen.getByText(/tactics\.sketch\.addLayer/)).toBeInTheDocument();
    });

    it("レイヤーが3つの場合、追加ボタンが表示されない", () => {
      render(
        <SketchToolbar
          {...defaultProps({
            layers: [
              makeLayer({ id: 1, name: "Layer 1" }),
              makeLayer({ id: 2, name: "Layer 2" }),
              makeLayer({ id: 3, name: "Layer 3" }),
            ],
          })}
        />,
      );

      expect(
        screen.queryByText(/tactics\.sketch\.addLayer/),
      ).not.toBeInTheDocument();
    });

    it("レイヤーが複数ある場合、削除ボタンが表示される", () => {
      render(
        <SketchToolbar
          {...defaultProps({
            layers: [
              makeLayer({ id: 1, name: "Layer 1" }),
              makeLayer({ id: 2, name: "Layer 2" }),
            ],
          })}
        />,
      );

      const deleteButtons = screen.getAllByLabelText("Delete layer");
      expect(deleteButtons.length).toBe(2);
    });

    it("レイヤーが1つだけの場合、削除ボタンが表示されない", () => {
      render(
        <SketchToolbar
          {...defaultProps({
            layers: [makeLayer({ id: 1, name: "Layer 1" })],
          })}
        />,
      );

      expect(screen.queryByLabelText("Delete layer")).not.toBeInTheDocument();
    });

    it("可視レイヤーの表示/非表示切り替えボタンが表示される", () => {
      render(
        <SketchToolbar
          {...defaultProps({
            layers: [makeLayer({ id: 1, visible: true })],
          })}
        />,
      );

      expect(screen.getByLabelText("Hide layer")).toBeInTheDocument();
    });

    it("非表示レイヤーのShow layerボタンが表示される", () => {
      render(
        <SketchToolbar
          {...defaultProps({
            layers: [makeLayer({ id: 1, visible: false })],
          })}
        />,
      );

      expect(screen.getByLabelText("Show layer")).toBeInTheDocument();
    });
  });

  // ── スモークテスト ────────────────────────────────────

  describe("スモークテスト", () => {
    it("全プロパティが渡された場合にクラッシュしない", () => {
      const { container } = render(
        <SketchToolbar
          {...defaultProps({
            activeTool: "arrow",
            strokeColor: "#ffffff",
            strokeWidth: 6,
            layers: [
              makeLayer({ id: 1, name: "L1", visible: true }),
              makeLayer({ id: 2, name: "L2", visible: false }),
            ],
            activeLayerId: 2,
          })}
        />,
      );

      expect(container.firstChild).not.toBeNull();
    });
  });
});
