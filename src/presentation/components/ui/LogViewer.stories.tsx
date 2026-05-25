/**
 * @module LogViewer.stories
 * @description LogViewerコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LogViewer } from "./LogViewer";
import { withAllProviders } from "@sb/decorators";

const meta = {
  title: "UI/LogViewer",
  component: LogViewer,
  decorators: [withAllProviders],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof LogViewer>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
