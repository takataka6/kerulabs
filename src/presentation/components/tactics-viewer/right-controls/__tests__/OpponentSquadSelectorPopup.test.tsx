import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OpponentSquadSelectorPopup } from "../OpponentSquadSelectorPopup";

vi.mock("../OpponentSquadSelector", () => ({
  OpponentSquadSelector: (props: { headerActions?: ReactNode }) => (
    <div data-testid="opponent-squad-selector">
      <div data-testid="opponent-squad-selector-actions">
        {props.headerActions}
      </div>
      Opponent Squad
    </div>
  ),
}));

const mockT = vi.fn((key: string) => key);

function createOpponentsHook(overrides: Record<string, unknown> = {}) {
  return {
    opponents: [],
    opponentPlacementMode: true,
    selectedOpponentPlayerId: null,
    showOpponentFormationSelect: false,
    showOpponentSquadBuilder: false,
    setOpponentPlacementMode: vi.fn(),
    setSelectedOpponentPlayerId: vi.fn(),
    clearOpponents: vi.fn(),
    ...overrides,
  } as never;
}

function renderComponent(overrides: Record<string, unknown> = {}) {
  return render(
    <OpponentSquadSelectorPopup
      opponentsHook={createOpponentsHook(overrides.opponentsHook as never)}
      teams={[{ id: { value: "team-2" }, name: "Sample Team" } as never]}
      selectedTeamId="team-1"
      t={mockT}
    />,
  );
}

describe("OpponentSquadSelectorPopup", () => {
  it("相手選手配置中はポップアップを表示する", () => {
    renderComponent();

    expect(
      screen.getByTestId("opponent-squad-selector-popup"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("opponent-squad-selector")).toBeInTheDocument();
  });

  it("相手フォーメーション選択中はポップアップを表示しない", () => {
    renderComponent({
      opponentsHook: { showOpponentFormationSelect: true },
    });

    expect(
      screen.queryByTestId("opponent-squad-selector-popup"),
    ).not.toBeInTheDocument();
  });

  it("閉じるボタン押下で相手選手選択状態を閉じる", () => {
    const setOpponentPlacementMode = vi.fn();
    const setSelectedOpponentPlayerId = vi.fn();
    renderComponent({
      opponentsHook: {
        setOpponentPlacementMode,
        setSelectedOpponentPlayerId,
      },
    });

    fireEvent.click(screen.getByLabelText("a11y.closeModal"));
    expect(setOpponentPlacementMode).toHaveBeenCalledWith(false);
    expect(setSelectedOpponentPlayerId).toHaveBeenCalledWith(null);
  });

  it("ポップアップ外クリックで閉じる", () => {
    const setOpponentPlacementMode = vi.fn();
    const setSelectedOpponentPlayerId = vi.fn();
    renderComponent({
      opponentsHook: {
        setOpponentPlacementMode,
        setSelectedOpponentPlayerId,
      },
    });

    fireEvent.mouseDown(document.body);
    expect(setOpponentPlacementMode).toHaveBeenCalledWith(false);
    expect(setSelectedOpponentPlayerId).toHaveBeenCalledWith(null);
  });

  it("キャンバス領域クリックでは閉じない", () => {
    const setOpponentPlacementMode = vi.fn();
    const setSelectedOpponentPlayerId = vi.fn();
    renderComponent({
      opponentsHook: {
        setOpponentPlacementMode,
        setSelectedOpponentPlayerId,
      },
    });

    const canvasRoot = document.createElement("div");
    canvasRoot.setAttribute("data-tactics-canvas-root", "true");
    document.body.appendChild(canvasRoot);

    fireEvent.mouseDown(canvasRoot);

    expect(setOpponentPlacementMode).not.toHaveBeenCalled();
    expect(setSelectedOpponentPlayerId).not.toHaveBeenCalled();

    canvasRoot.remove();
  });

  it("相手選手がいる場合はクリアボタンを表示する", () => {
    renderComponent({
      opponentsHook: { opponents: [{ id: 1, x: 0, z: 0 }] },
    });

    expect(
      screen.getByLabelText("tactics.opponents.clear"),
    ).toBeInTheDocument();
  });

  it("クリアボタン押下で clearOpponents を呼ぶ", () => {
    const clearOpponents = vi.fn();
    renderComponent({
      opponentsHook: {
        opponents: [{ id: 1, x: 0, z: 0 }],
        clearOpponents,
      },
    });

    fireEvent.click(screen.getByLabelText("tactics.opponents.clear"));
    expect(clearOpponents).toHaveBeenCalled();
  });
});
