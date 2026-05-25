/**
 * @module MermaidFlowchart.stories
 * @description MermaidFlowchartコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MermaidFlowchart } from "./MermaidFlowchart";

const meta = {
  title: "Common/MermaidFlowchart",
  component: MermaidFlowchart,
} satisfies Meta<typeof MermaidFlowchart>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SimpleFlowchart: Story = {
  args: {
    chart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
    className: "p-4",
  },
};

export const TacticFlow: Story = {
  args: {
    chart: `graph LR
    A[Build Up] --> B[Progression]
    B --> C[Final Third]
    C --> D[Finishing]
    A --> E[Long Ball]
    E --> D`,
    className: "p-4",
  },
};

export const EmptyChart: Story = {
  args: {
    chart: "",
    className: "p-4",
  },
};
