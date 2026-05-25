/**
 * @module TeamSelectionScreen.stories
 * @description TeamSelectionScreenコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TeamSelectionScreen } from "./TeamSelectionScreen";
import { mockT } from "@sb/mocks/translations";
import { createMockTeam } from "@sb/mocks/teams";

const team1 = createMockTeam();
const team2 = createMockTeam();
team2.updateName("レアル・マドリード", "ラ・リーガ");

const meta = {
  title: "TacticsViewer/TeamSelectionScreen",
  component: TeamSelectionScreen,
  parameters: { layout: "fullscreen" },
  args: {
    teams: [team1, team2],
    language: "ja",
    showTeamCreator: false,
    showBulkTeamImport: false,
    onSelectTeam: fn(),
    onDeleteTeam: fn(),
    onNavigateHome: fn(),
    onShowTeamCreator: fn(),
    onCloseTeamCreator: fn(),
    onShowBulkTeamImport: fn(),
    onCloseBulkTeamImport: fn(),
    onCreateTeam: fn(),
    onBulkImport: fn(),
    onEditTeam: fn(),
    onCloseEditTeam: fn(),
    onUpdateTeam: fn(),
    t: mockT,
  },
} satisfies Meta<typeof TeamSelectionScreen>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithTeams: Story = {};

export const Empty: Story = {
  args: {
    teams: [],
  },
};

export const Loading: Story = {
  args: {
    teams: undefined,
  },
};
