/**
 * @module GlossaryDetail.stories
 * @description GlossaryDetailコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GlossaryDetail } from "./GlossaryDetail";
import { mockT } from "@sb/mocks/translations";
import { createMockGlossary } from "@sb/mocks/glossary";
import { Glossary } from "@domain/entities/Glossary";
import { withAllProviders, withQueryClient } from "@sb/decorators";

const meta = {
  title: "Glossary/GlossaryDetail",
  component: GlossaryDetail,
  decorators: [withAllProviders, withQueryClient],
  args: {
    onBack: fn(),
    t: mockT,
  },
} satisfies Meta<typeof GlossaryDetail>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithTerms: Story = {
  args: {
    glossary: createMockGlossary(),
  },
};

export const Empty: Story = {
  args: {
    glossary: Glossary.create("空の用語集", "用語はまだ追加されていません"),
  },
};
