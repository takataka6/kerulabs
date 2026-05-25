/**
 * @module SubstitutesPanel.stories
 * @description SubstitutesPanelコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SubstitutesPanel } from "./SubstitutesPanel";
import { mockT } from "@sb/mocks/translations";
import { createMockTeam } from "@sb/mocks/teams";
import { createMock433 } from "@sb/mocks/formations";

const team = createMockTeam();

const meta = {
  title: "TacticsViewer/SubstitutesPanel",
  component: SubstitutesPanel,
  args: {
    customSquad: [...team.players],
    currentFormation: createMock433(),
    captureMode: false,
    showSquadBuilder: false,
    squadPanelOpen: true,
    playerViewEnabled: false,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    substitutionRecords: [],
    t: mockT,
  },
} satisfies Meta<typeof SubstitutesPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
