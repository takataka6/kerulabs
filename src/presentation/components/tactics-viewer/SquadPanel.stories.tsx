/**
 * @module SquadPanel.stories
 * @description SquadPanelコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SquadPanel } from "./SquadPanel";
import { mockT } from "@sb/mocks/translations";
import { createMockTeam } from "@sb/mocks/teams";
import { createMock433 } from "@sb/mocks/formations";

const team = createMockTeam();

const meta = {
  title: "TacticsViewer/SquadPanel",
  component: SquadPanel,
  args: {
    customSquad: [...team.players],
    currentFormation: createMock433(),
    playerCards: {},
    squadPanelOpen: true,
    captureMode: false,
    showSquadBuilder: false,
    playerViewEnabled: false,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    onToggleSquadPanel: fn(),
    onCycleCard: fn(),
    t: mockT,
  },
} satisfies Meta<typeof SquadPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = {
  args: { squadPanelOpen: false },
};

export const WithCards: Story = {
  args: {
    playerCards: { 0: "yellow", 3: "red" },
  },
};
