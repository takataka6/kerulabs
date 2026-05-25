/**
 * @module PhaseDiamond.stories
 * @description PhaseDiamondコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PhaseDiamond } from "./PhaseDiamond";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "TacticsViewer/PhaseDiamond",
  component: PhaseDiamond,
  args: {
    selectedPhase: "attack",
    onPhaseChange: fn(),
    t: mockT,
  },
} satisfies Meta<typeof PhaseDiamond>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Attack: Story = {};

export const Defense: Story = {
  args: { selectedPhase: "defense" },
};

export const PositiveTransition: Story = {
  args: { selectedPhase: "positive_transition" },
};

export const NegativeTransition: Story = {
  args: { selectedPhase: "negative_transition" },
};
