/**
 * @module PlayerAddForm.stories
 * @description PlayerAddFormコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PlayerAddForm } from "./PlayerAddForm";
import { mockT } from "@sb/mocks/translations";
import { createMockTeam } from "@sb/mocks/teams";
import { withAllProviders } from "@sb/decorators";

const meta = {
  title: "PlayerManagement/PlayerAddForm",
  component: PlayerAddForm,
  decorators: [withAllProviders],
  args: {
    team: createMockTeam(),
    onUpdateTeam: fn(),
    onClose: fn(),
    language: "ja",
    t: mockT,
  },
} satisfies Meta<typeof PlayerAddForm>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
