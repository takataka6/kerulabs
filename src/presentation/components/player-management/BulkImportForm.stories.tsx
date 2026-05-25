/**
 * @module BulkImportForm.stories
 * @description BulkImportFormコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BulkImportForm } from "./BulkImportForm";
import { mockT } from "@sb/mocks/translations";
import { createMockTeam } from "@sb/mocks/teams";
import { withAllProviders } from "@sb/decorators";

const meta = {
  title: "PlayerManagement/BulkImportForm",
  component: BulkImportForm,
  decorators: [withAllProviders],
  args: {
    team: createMockTeam(),
    onUpdateTeam: fn(),
    onClose: fn(),
    t: mockT,
  },
} satisfies Meta<typeof BulkImportForm>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
