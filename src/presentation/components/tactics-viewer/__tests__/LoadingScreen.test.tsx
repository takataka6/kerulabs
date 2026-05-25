/**
 * @module LoadingScreen コンポーネント
 * @description ローディング画面の単体テスト
 *
 * テスト方針:
 * - モック不要（純粋な表示コンポーネント）
 * - ローディングインジケータとメッセージの表示を検証
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "../LoadingScreen";

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("LoadingScreen", () => {
  // ── メッセージ表示 ─────────────────────────────────────

  describe("メッセージ表示", () => {
    it("渡されたメッセージが画面に表示される", () => {
      render(<LoadingScreen message="読み込み中..." />);

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("異なるメッセージを渡すと正しく反映される", () => {
      const { rerender } = render(
        <LoadingScreen message="データを取得中..." />,
      );

      expect(screen.getByText("データを取得中...")).toBeInTheDocument();

      rerender(<LoadingScreen message="保存しています..." />);

      expect(screen.getByText("保存しています...")).toBeInTheDocument();
      expect(screen.queryByText("データを取得中...")).not.toBeInTheDocument();
    });
  });

  // ── レイアウト ─────────────────────────────────────────

  describe("レイアウト", () => {
    it("フルスクリーンレイアウト（h-screen クラス）が適用される", () => {
      const { container } = render(<LoadingScreen message="読み込み中..." />);

      const outerDiv = container.firstElementChild as HTMLElement;
      expect(outerDiv.className).toContain("h-screen");
    });

    it("w-full クラスで横幅が全幅に設定される", () => {
      const { container } = render(<LoadingScreen message="読み込み中..." />);

      const outerDiv = container.firstElementChild as HTMLElement;
      expect(outerDiv.className).toContain("w-full");
    });
  });

  // ── アニメーション ─────────────────────────────────────

  describe("アニメーション", () => {
    it("スピナー（animate-spin クラス）が存在する", () => {
      const { container } = render(<LoadingScreen message="読み込み中..." />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("ピングアニメーション（animate-ping クラス）が存在する", () => {
      const { container } = render(<LoadingScreen message="読み込み中..." />);

      const ping = container.querySelector(".animate-ping");
      expect(ping).toBeInTheDocument();
    });
  });
});
