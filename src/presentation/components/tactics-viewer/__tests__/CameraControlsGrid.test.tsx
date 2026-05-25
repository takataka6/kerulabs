/**
 * @module CameraControlsGrid コンポーネント
 * @description カメラコントロールグリッドの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - カメラアングル切替ボタンの表示とクリックイベントを検証
 * - 各視点（正面・俯瞰・サイド等）の選択を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CameraControlsGrid } from "../right-controls/CameraControlsGrid";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function createPlayerView(overrides = {}) {
  return {
    playerViewEnabled: false,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    ...overrides,
  } as never;
}

function renderGrid(overrides = {}) {
  const props = {
    playerView: createPlayerView(),
    onCameraAction: vi.fn(),
    fieldLocked: false,
    onToggleFieldLock: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return render(<CameraControlsGrid {...props} />);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("CameraControlsGrid", () => {
  it("4 つのカメラボタンとロックボタンを描画する", () => {
    renderGrid();

    expect(
      screen.getByRole("button", { name: "tactics.cameraReset" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "tactics.cameraTopDown" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "tactics.cameraSideView" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "tactics.cameraSideViewReverse" }),
    ).toBeInTheDocument();
  });

  it("カメラリセットボタンをクリックすると onCameraAction('reset') が呼ばれる", () => {
    const onCameraAction = vi.fn();
    renderGrid({ onCameraAction });

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.cameraReset" }),
    );
    expect(onCameraAction).toHaveBeenCalledWith("reset");
  });

  it("フィールドロックボタンをクリックすると onToggleFieldLock が呼ばれる", () => {
    const onToggleFieldLock = vi.fn();
    renderGrid({ onToggleFieldLock });

    fireEvent.click(screen.getByRole("button", { name: "tactics.lockField" }));
    expect(onToggleFieldLock).toHaveBeenCalledOnce();
  });

  it("fieldLocked=true の場合ロック解除ラベルが表示される", () => {
    renderGrid({ fieldLocked: true });

    expect(
      screen.getByRole("button", { name: "tactics.unlockField" }),
    ).toBeInTheDocument();
  });

  it("playerView が有効でプレイヤーが選択されている場合、カメラボタンが disabled", () => {
    const playerView = createPlayerView({
      playerViewEnabled: true,
      selectedPlayerIndex: 0,
    });
    renderGrid({ playerView });

    const resetBtn = screen.getByRole("button", {
      name: "tactics.cameraReset",
    });
    expect(resetBtn).toBeDisabled();
  });

  it("俯瞰ボタンをクリックすると onCameraAction('topDown') が呼ばれる", () => {
    const onCameraAction = vi.fn();
    renderGrid({ onCameraAction });

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.cameraTopDown" }),
    );
    expect(onCameraAction).toHaveBeenCalledWith("topDown");
  });

  it("サイドビューボタンをクリックすると onCameraAction('sideView') が呼ばれる", () => {
    const onCameraAction = vi.fn();
    renderGrid({ onCameraAction });

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.cameraSideView" }),
    );
    expect(onCameraAction).toHaveBeenCalledWith("sideView");
  });

  it("サイドビューリバースボタンをクリックすると onCameraAction('sideViewReverse') が呼ばれる", () => {
    const onCameraAction = vi.fn();
    renderGrid({ onCameraAction });

    fireEvent.click(
      screen.getByRole("button", { name: "tactics.cameraSideViewReverse" }),
    );
    expect(onCameraAction).toHaveBeenCalledWith("sideViewReverse");
  });

  it("playerView が有効で opponent が選択されている場合もカメラボタンが disabled", () => {
    const playerView = createPlayerView({
      playerViewEnabled: true,
      selectedOpponentViewId: "opp-1",
    });
    renderGrid({ playerView });

    const topDownBtn = screen.getByRole("button", {
      name: "tactics.cameraTopDown",
    });
    expect(topDownBtn).toBeDisabled();
  });

  it("playerView が有効だがプレイヤー未選択の場合、カメラボタンは enabled", () => {
    const playerView = createPlayerView({
      playerViewEnabled: true,
      selectedPlayerIndex: null,
      selectedOpponentViewId: null,
    });
    renderGrid({ playerView });

    const resetBtn = screen.getByRole("button", {
      name: "tactics.cameraReset",
    });
    expect(resetBtn).not.toBeDisabled();
  });
});
