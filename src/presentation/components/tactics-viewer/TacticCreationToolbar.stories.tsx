/**
 * @module TacticCreationToolbar.stories
 * @description TacticCreationToolbarコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TacticCreationToolbar } from "./TacticCreationToolbar";
import { mockT } from "@sb/mocks/translations";
import type { CreationState } from "@presentation/hooks/tactic/useTacticCreation";

const baseCreation: CreationState = {
  nameJa: "ポゼッション攻撃",
  nameEn: "Possession Attack",
  icon: "⚽",
  gamePhase: "attack",
  formationName: "4-3-3",
  currentStepIndex: 0,
  steps: [{ id: 0, movements: new Map(), ballPasses: [], duration: 2000 }],
  timelineOpen: false,
  movementDelays: {},
  wizardStep: "metadata",
  ballPosition: null,
  ballTrajectory: null,
  setPositions: new Map(),
};

const meta = {
  title: "TacticsViewer/TacticCreationToolbar",
  component: TacticCreationToolbar,
  args: {
    creation: baseCreation,
    language: "ja",
    isExecuting: false,
    t: mockT,
    onNameJaChange: fn(),
    onNameEnChange: fn(),
    onIconChange: fn(),
    onGamePhaseChange: fn(),
    onWizardStep: fn(),
    onSwitchStep: fn(),
    onAddStep: fn(),
    onResetStep: fn(),
    onResetPreview: fn(),
    onToggleTimeline: fn(),
    onPreview: fn(),
    onSave: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof TacticCreationToolbar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const MetadataStep: Story = {};

export const EditingStep: Story = {
  args: {
    creation: { ...baseCreation, wizardStep: "editing" },
  },
};

export const ConfirmStep: Story = {
  args: {
    creation: { ...baseCreation, wizardStep: "confirm" },
  },
};

export const Executing: Story = {
  args: {
    creation: { ...baseCreation, wizardStep: "confirm" },
    isExecuting: true,
  },
};
