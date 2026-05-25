/**
 * @module TermFormModal.stories
 * @description TermFormModalコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TermFormModal } from "./TermFormModal";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "Glossary/TermFormModal",
  component: TermFormModal,
  args: {
    allKeywords: ["攻撃", "守備", "戦術", "トランジション", "セットプレー"],
    onSave: fn(),
    onClose: fn(),
    t: mockT,
  },
} satisfies Meta<typeof TermFormModal>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {},
};

export const Edit: Story = {
  args: {
    initial: {
      id: "term-1",
      term: "ポゼッション",
      reading: "ぽぜっしょん",
      description: "ボールを保持する戦術。",
      keywords: ["攻撃", "戦術"],
    },
  },
};
