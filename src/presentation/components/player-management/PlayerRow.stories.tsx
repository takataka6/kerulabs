/**
 * @module PlayerRow.stories
 * @description PlayerRowコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PlayerRow } from "./PlayerRow";
import { mockT } from "@sb/mocks/translations";
import { createMockPlayers } from "@sb/mocks/teams";

const players = createMockPlayers();

const meta = {
  title: "PlayerManagement/PlayerRow",
  component: PlayerRow,
  args: {
    isEditing: false,
    onStartEdit: fn(),
    onCancelEdit: fn(),
    onUpdate: fn(),
    onRemove: fn(),
    language: "ja",
    t: mockT,
  },
} satisfies Meta<typeof PlayerRow>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {
  args: {
    player: players[0],
  },
};

export const EditMode: Story = {
  args: {
    player: players[0],
    isEditing: true,
  },
};

export const ForwardPlayer: Story = {
  args: {
    player: players[8],
  },
};
