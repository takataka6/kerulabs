/**
 * @module TeamCreator.stories
 * @description TeamCreatorコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TeamCreator } from "./TeamCreator";
import { withAllProviders } from "@sb/decorators";

const meta = {
  title: "Team/TeamCreator",
  component: TeamCreator,
  decorators: [withAllProviders],
  args: {
    onCreateTeam: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof TeamCreator>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
