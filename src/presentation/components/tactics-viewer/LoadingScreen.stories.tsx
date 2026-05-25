/**
 * @module LoadingScreen.stories
 * @description LoadingScreenコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingScreen } from "./LoadingScreen";

const meta = {
  title: "TacticsViewer/LoadingScreen",
  component: LoadingScreen,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoadingScreen>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "Loading...",
  },
};

export const Japanese: Story = {
  args: {
    message: "データを読み込んでいます...",
  },
};
