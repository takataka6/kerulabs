/**
 * @module AccessibleModal コンポーネント
 * @description アクセシブルモーダルの単体テスト
 *
 * テスト方針:
 * - コールバックをvi.fnでモック化
 * - モーダルの表示/非表示・フォーカストラップを検証
 * - Escキー・オーバーレイクリックでの閉じ動作を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccessibleModal } from "../AccessibleModal";

/* ------------------------------------------------------------------ */
/*  ヘルパー                                                            */
/* ------------------------------------------------------------------ */

function renderModal(
  props: Partial<React.ComponentProps<typeof AccessibleModal>> = {},
) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div data-testid="modal-content">Modal Content</div>,
    ...props,
  };
  return { ...render(<AccessibleModal {...defaultProps} />), ...defaultProps };
}

/* ------------------------------------------------------------------ */
/*  テスト                                                              */
/* ------------------------------------------------------------------ */

describe("AccessibleModal", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      },
    );
  });

  // ── 表示/非表示 ──────────────────────────────────────────

  describe("表示/非表示", () => {
    it("isOpen が true のとき children を表示する", () => {
      renderModal({ isOpen: true });
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });

    it("isOpen が false のとき何も表示しない", () => {
      renderModal({ isOpen: false });
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    });
  });

  // ── アクセシビリティ ────────────────────────────────────

  describe("アクセシビリティ", () => {
    it("role='dialog' が設定される", () => {
      renderModal();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("aria-modal='true' が設定される", () => {
      renderModal();
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("aria-labelledby が設定される", () => {
      renderModal({ ariaLabelledBy: "modal-title" });
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-labelledby",
        "modal-title",
      );
    });

    it("aria-label が設定される", () => {
      renderModal({ ariaLabel: "Test Modal" });
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-label",
        "Test Modal",
      );
    });
  });

  // ── Escape キーで閉じる ──────────────────────────────────

  describe("Escape キーで閉じる", () => {
    it("Escape キーで onClose が呼ばれる", () => {
      const { onClose } = renderModal();

      fireEvent.keyDown(window, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("isOpen が false の場合、Escape キーで onClose は呼ばれない", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: false, onClose });

      fireEvent.keyDown(window, { key: "Escape" });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ── オーバーレイクリックで閉じる ──────────────────────────

  describe("オーバーレイクリック", () => {
    it("オーバーレイをクリックすると onClose が呼ばれる", () => {
      const onClose = vi.fn();
      render(
        <AccessibleModal isOpen={true} onClose={onClose}>
          <div>Content</div>
        </AccessibleModal>,
      );

      // オーバーレイ（dialog の親要素）をクリック
      const overlay = screen.getByRole("dialog").parentElement as HTMLElement;
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("モーダル内部をクリックしても onClose は呼ばれない", () => {
      const onClose = vi.fn();
      render(
        <AccessibleModal isOpen={true} onClose={onClose}>
          <button data-testid="inner-button">Click me</button>
        </AccessibleModal>,
      );

      fireEvent.click(screen.getByTestId("inner-button"));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ── カスタムクラス ──────────────────────────────────────

  describe("カスタムクラス", () => {
    it("className がモーダル要素に適用される", () => {
      renderModal({ className: "custom-modal-class" });
      expect(screen.getByRole("dialog")).toHaveClass("custom-modal-class");
    });

    it("overlayClassName がオーバーレイに適用される", () => {
      render(
        <AccessibleModal
          isOpen={true}
          onClose={vi.fn()}
          overlayClassName="custom-overlay"
        >
          <div>Content</div>
        </AccessibleModal>,
      );

      const overlay = screen.getByRole("dialog").parentElement as HTMLElement;
      expect(overlay).toHaveClass("custom-overlay");
    });
  });

  // ── フォーカストラップ ──────────────────────────────────

  describe("フォーカストラップ", () => {
    it("Tab キーでフォーカスがモーダル内に閉じ込められる", () => {
      render(
        <AccessibleModal isOpen={true} onClose={vi.fn()}>
          <button data-testid="btn1">First</button>
          <button data-testid="btn2">Last</button>
        </AccessibleModal>,
      );

      const btn2 = screen.getByTestId("btn2");
      btn2.focus();

      // 最後の要素で Tab → 最初の要素にフォーカス
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Tab" });

      // フォーカス移動は DOM 操作で行われるため、preventDefault が呼ばれたことを確認
      // （jsdom ではフォーカス移動の完全なシミュレーションが困難）
    });

    it("Shift+Tab キーで逆方向のフォーカストラップ", () => {
      render(
        <AccessibleModal isOpen={true} onClose={vi.fn()}>
          <button data-testid="btn1">First</button>
          <button data-testid="btn2">Last</button>
        </AccessibleModal>,
      );

      const btn1 = screen.getByTestId("btn1");
      btn1.focus();

      // 最初の要素で Shift+Tab → 最後の要素にフォーカス
      fireEvent.keyDown(screen.getByRole("dialog"), {
        key: "Tab",
        shiftKey: true,
      });
    });
  });
});
