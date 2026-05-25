/**
 * @module CodeLabPage.stories
 * @description CodeLabPageコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeLabPage } from "./CodeLabPage";
import { withPageProviders } from "@sb/decorators";

const meta = {
  title: "Pages/CodeLabPage",
  component: CodeLabPage,
  decorators: [withPageProviders],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CodeLabPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
