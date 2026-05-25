/**
 * @module PlayerManagement.stories
 * @description PlayerManagementコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PlayerManagement } from "./PlayerManagement";
import { withAllProviders } from "@sb/decorators";
import { createMockTeam } from "@sb/mocks/teams";

const meta = {
  title: "PlayerManagement/PlayerManagement",
  component: PlayerManagement,
  decorators: [withAllProviders],
  args: {
    team: createMockTeam(),
    onUpdateTeam: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof PlayerManagement>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
