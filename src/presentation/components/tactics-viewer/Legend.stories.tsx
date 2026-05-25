/**
 * @module Legend.stories
 * @description Legendコンポーネントの Storybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Legend } from "./Legend";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "TacticsViewer/Legend",
  component: Legend,
  args: {
    colorsData: {
      gk: "#ffcc00",
      df: "#0055ff",
      mf: "#0055ff",
      fw: "#0055ff",
    },
    opponents: [],
    captureMode: false,
    t: mockT,
  },
} satisfies Meta<typeof Legend>;
export default meta;

type Story = StoryObj<typeof meta>;

export const MyTeamOnly: Story = {};

export const WithOpponent: Story = {
  args: {
    opponents: [{ id: 0, x: 0, z: 0, color: "#dc2626" }],
  },
};

export const CaptureMode: Story = {
  args: {
    captureMode: true,
  },
};
