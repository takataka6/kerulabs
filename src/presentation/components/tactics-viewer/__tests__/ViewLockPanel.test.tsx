/**
 * @module ViewLockPanel コンポーネント
 * @description ビューロックパネルの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - カメラロック/アンロックの切替UIを検証
 * - ロック状態の表示更新を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewLockPanel } from "../ViewLockPanel";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function renderViewLockPanel(
  overrides: Partial<React.ComponentProps<typeof ViewLockPanel>> = {},
) {
  const props = {
    onCameraAction: vi.fn(),
    fieldLocked: false,
    onToggleFieldLock: vi.fn(),
    touchlineLocked: false,
    onToggleTouchlineLock: vi.fn(),
    disabled: false,
    t: mockT,
    ...overrides,
  };
  return { ...render(<ViewLockPanel {...props} />), ...props };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("ViewLockPanel", () => {
  // ── レンダリング ──────────────────────────────────────────

  describe("レンダリング", () => {
    it("4つのカメラアクションボタンが表示される", () => {
      renderViewLockPanel();

      expect(screen.getByText("🏠")).toBeInTheDocument();
      expect(screen.getByText("⬇️")).toBeInTheDocument();
      expect(screen.getByText("➡️")).toBeInTheDocument();
      expect(screen.getByText("⬅️")).toBeInTheDocument();
    });
  });

  // ── カメラアクション ────────────────────────────────────

  describe("カメラアクション", () => {
    it("ホームボタンクリックで onCameraAction('reset') が呼ばれる", () => {
      const { onCameraAction } = renderViewLockPanel();

      fireEvent.click(screen.getByLabelText("tactics.cameraHome"));
      expect(onCameraAction).toHaveBeenCalledWith("reset");
    });

    it("トップダウンボタンクリックで onCameraAction('topDown') が呼ばれる", () => {
      const { onCameraAction } = renderViewLockPanel();

      fireEvent.click(screen.getByLabelText("tactics.cameraTopDown"));
      expect(onCameraAction).toHaveBeenCalledWith("topDown");
    });

    it("サイドビューボタンクリックで onCameraAction('sideView') が呼ばれる", () => {
      const { onCameraAction } = renderViewLockPanel();

      fireEvent.click(screen.getByLabelText("tactics.cameraSideView"));
      expect(onCameraAction).toHaveBeenCalledWith("sideView");
    });

    it("サイドビューリバースボタンクリックで onCameraAction('sideViewReverse') が呼ばれる", () => {
      const { onCameraAction } = renderViewLockPanel();

      fireEvent.click(screen.getByLabelText("tactics.cameraSideViewReverse"));
      expect(onCameraAction).toHaveBeenCalledWith("sideViewReverse");
    });
  });

  // ── ロックトグル ────────────────────────────────────────

  describe("ロックトグル", () => {
    it("フィールドロックボタンクリックで onToggleFieldLock が呼ばれる", () => {
      const { onToggleFieldLock } = renderViewLockPanel();

      fireEvent.click(screen.getByLabelText("tactics.lockField"));
      expect(onToggleFieldLock).toHaveBeenCalledTimes(1);
    });

    it("fieldLocked 時のラベルが unlockField になる", () => {
      renderViewLockPanel({ fieldLocked: true });
      expect(screen.getByLabelText("tactics.unlockField")).toBeInTheDocument();
    });

    it("タッチラインロックボタンクリックで onToggleTouchlineLock が呼ばれる", () => {
      const { onToggleTouchlineLock } = renderViewLockPanel();

      fireEvent.click(screen.getByLabelText("tactics.touchlineLock"));
      expect(onToggleTouchlineLock).toHaveBeenCalledTimes(1);
    });

    it("touchlineLocked 時のラベルが touchlineUnlock になる", () => {
      renderViewLockPanel({ touchlineLocked: true });
      expect(
        screen.getByLabelText("tactics.touchlineUnlock"),
      ).toBeInTheDocument();
    });
  });

  // ── 無効状態 ─────────────────────────────────────────────

  describe("無効状態", () => {
    it("disabled でカメラアクションボタンが無効になる", () => {
      renderViewLockPanel({ disabled: true });

      const homeButton = screen.getByLabelText("tactics.cameraHome");
      expect(homeButton).toBeDisabled();
    });

    it("disabled でカーソルが not-allowed になる", () => {
      renderViewLockPanel({ disabled: true });

      const homeButton = screen.getByLabelText("tactics.cameraHome");
      expect(homeButton.className).toContain("cursor-not-allowed");
    });
  });

  // ── 折りたたみ ───────────────────────────────────────────

  describe("折りたたみ", () => {
    it("折りたたみボタンクリックでパネルが非表示になる", () => {
      renderViewLockPanel();

      const toggleButton = screen.getByLabelText("tactics.hideControls");
      fireEvent.click(toggleButton);

      // カメラアクションボタンが非表示
      expect(screen.queryByText("🏠")).not.toBeInTheDocument();
    });

    it("再クリックでパネルが再表示される", () => {
      renderViewLockPanel();

      const toggleButton = screen.getByLabelText("tactics.hideControls");
      fireEvent.click(toggleButton);

      const showButton = screen.getByLabelText("tactics.showControls");
      fireEvent.click(showButton);

      expect(screen.getByText("🏠")).toBeInTheDocument();
    });
  });
});
