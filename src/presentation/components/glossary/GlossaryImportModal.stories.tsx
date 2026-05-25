/**
 * @module GlossaryImportModal.stories
 * @description GlossaryImportModalコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GlossaryImportModal } from "./GlossaryImportModal";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "Glossary/GlossaryImportModal",
  component: GlossaryImportModal,
  args: {
    onImport: fn(),
    onClose: fn(),
    t: mockT,
  },
} satisfies Meta<typeof GlossaryImportModal>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
