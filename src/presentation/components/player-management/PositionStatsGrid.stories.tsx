/**
 * @module PositionStatsGrid.stories
 * @description PositionStatsGridコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PositionStatsGrid } from "./PositionStatsGrid";
import { mockT } from "@sb/mocks/translations";
import { createMockPlayers } from "@sb/mocks/teams";

const meta = {
  title: "PlayerManagement/PositionStatsGrid",
  component: PositionStatsGrid,
  args: {
    t: mockT,
  },
} satisfies Meta<typeof PositionStatsGrid>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    players: createMockPlayers(),
  },
};

export const Empty: Story = {
  args: {
    players: [],
  },
};
