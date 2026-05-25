import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OpponentSquadSelectorPopup } from "../OpponentSquadSelectorPopup";

vi.mock("../OpponentSquadSelector", () => ({
  OpponentSquadSelector: () => (
    <div data-testid="opponent-squad-selector">Opponent Squad</div>
  ),
}));

const mockT = vi.fn((key: string) => key);

function createOpponentsHook(overrides: Record<string, unknown> = {}) {
  return {
    opponentPlacementMode: true,
    selectedOpponentPlayerId: null,
    showOpponentFormationSelect: false,
    showOpponentSquadBuilder: false,
    setOpponentPlacementMode: vi.fn(),
    setSelectedOpponentPlayerId: vi.fn(),
    ...overrides,
  } as never;
}

function renderComponent(overrides: Record<string, unknown> = {}) {
  return render(
    <OpponentSquadSelectorPopup
      opponentsHook={createOpponentsHook(overrides.opponentsHook as never)}
      teams={[{ id: { value: "team-2" }, name: "Sample Team" } as never]}
      selectedTeamId="team-1"
      headerVisible={true}
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
});
