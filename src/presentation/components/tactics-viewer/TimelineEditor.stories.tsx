/**
 * @module TimelineEditor.stories
 * @description TimelineEditorコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TimelineEditor } from "./TimelineEditor";
import { mockT } from "@sb/mocks/translations";
import { createMock433 } from "@sb/mocks/formations";
import type { CreationStep } from "@presentation/hooks/tactic/useTacticCreation";

const mockSteps: CreationStep[] = [
  {
    id: 0,
    movements: new Map([
      ["LW", { targetX: -0.3, targetZ: -0.1, color: "#3b82f6" }],
      ["ST", { targetX: 0.05, targetZ: -0.15, color: "#3b82f6" }],
      ["RW", { targetX: 0.3, targetZ: -0.1, color: "#3b82f6" }],
    ]),
    ballPasses: [],
    duration: 2000,
  },
  {
    id: 1,
    movements: new Map([
      ["CM2", { targetX: 0, targetZ: 0.2, color: "#3b82f6" }],
    ]),
    ballPasses: [
      {
        startRole: "CM2",
        endRole: "ST",
        color: "#fbbf24",
      },
    ],
    duration: 1500,
  },
];

const meta = {
  title: "TacticsViewer/TimelineEditor",
  component: TimelineEditor,
  args: {
    steps: mockSteps,
    movementDelays: { 0: {}, 1: {} },
    formation: createMock433(),
    t: mockT,
    onMovementDelayChange: fn(),
    onStepDurationChange: fn(),
    onRemoveBallPass: fn(),
    onBallPassTrajectoryChange: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof TimelineEditor>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDelays: Story = {
  args: {
    movementDelays: {
      0: { LW: 500, ST: 200 },
      1: { CM2: 300 },
    },
  },
};
