/**
 * @module SquadBuilder.stories
 * @description SquadBuilderコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SquadBuilder } from "./SquadBuilder";
import { withAllProviders } from "@sb/decorators";
import { createMockTeam } from "@sb/mocks/teams";
import { createMock433 } from "@sb/mocks/formations";

const team = createMockTeam();
const formation = createMock433();

const meta = {
  title: "Team/SquadBuilder",
  component: SquadBuilder,
  decorators: [withAllProviders],
  args: {
    team,
    formation,
    selectedPlayers: Array(11).fill(null),
    onUpdateSquad: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof SquadBuilder>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithPlayers: Story = {
  args: {
    selectedPlayers: [
      ...team.players.slice(0, 11),
      ...Array(Math.max(0, 11 - team.players.length)).fill(null),
    ],
  },
};
