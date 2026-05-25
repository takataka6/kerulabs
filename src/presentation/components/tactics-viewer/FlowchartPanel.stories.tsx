/**
 * @module FlowchartPanel.stories
 * @description FlowchartPanelコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FlowchartPanel } from "./FlowchartPanel";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "TacticsViewer/FlowchartPanel",
  component: FlowchartPanel,
  args: {
    onClose: fn(),
    t: mockT,
  },
} satisfies Meta<typeof FlowchartPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chartContent: `graph TD
    A[Build Up] --> B{Decision}
    B -->|Pass| C[Through Ball]
    B -->|Dribble| D[1v1]
    C --> E[Shot]
    D --> E`,
  },
};

export const Empty: Story = {
  args: {
    chartContent: "",
  },
};
