/**
 * @module HomePage.stories
 * @description HomePageコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomePage } from "./HomePage";
import { withPageProviders } from "@sb/decorators";

const meta = {
  title: "Pages/HomePage",
  component: HomePage,
  decorators: [withPageProviders],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HomePage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
