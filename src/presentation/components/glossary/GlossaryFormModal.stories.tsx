/**
 * @module GlossaryFormModal.stories
 * @description GlossaryFormModalコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GlossaryFormModal } from "./GlossaryFormModal";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "Glossary/GlossaryFormModal",
  component: GlossaryFormModal,
  args: {
    onSave: fn(),
    onClose: fn(),
    t: mockT,
  },
} satisfies Meta<typeof GlossaryFormModal>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {},
};

export const Edit: Story = {
  args: {
    initialName: "サッカー用語集",
    initialDescription: "基本的なサッカー用語をまとめた用語集です。",
  },
};
