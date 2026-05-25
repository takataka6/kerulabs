/**
 * @module GlossaryPage.stories
 * @description GlossaryPageコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GlossaryPage } from "./GlossaryPage";
import { withPageProviders, withQueryClient } from "@sb/decorators";

const meta = {
  title: "Pages/GlossaryPage",
  component: GlossaryPage,
  decorators: [withPageProviders, withQueryClient],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof GlossaryPage>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
