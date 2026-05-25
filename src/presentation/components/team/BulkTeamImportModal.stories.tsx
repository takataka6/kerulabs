/**
 * @module BulkTeamImportModal.stories
 * @description BulkTeamImportModalコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BulkTeamImportModal } from "./BulkTeamImportModal";
import { withAllProviders } from "@sb/decorators";

const meta = {
  title: "Team/BulkTeamImportModal",
  component: BulkTeamImportModal,
  decorators: [withAllProviders],
  args: {
    onImport: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof BulkTeamImportModal>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
