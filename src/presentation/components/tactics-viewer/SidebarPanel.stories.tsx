/**
 * @module SidebarPanel.stories
 * @description SidebarPanelコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SidebarPanel } from "./SidebarPanel";
import { mockT, mockTDynamic } from "@sb/mocks/translations";

const meta = {
  title: "TacticsViewer/SidebarPanel",
  component: SidebarPanel,
  args: {
    layout: {
      sidebarOpen: true,
      sidebarAnimating: false,
      onTransitionEnd: fn(),
      isActive: true,
      headerVisible: true,
    },
    phase: {
      playMode: "field",
      selectedPhase: "attack",
      onPhaseChange: fn(),
      selectedSetPlayType: "goal_kick",
      onSetPlayTypeChange: fn(),
      onResetState: fn(),
      onResetTactic: fn(),
    },
    tactics: {
      tacticsLoading: false,
      tacticsForCurrentFormation: [],
      activeTacticId: null,
      isExecuting: false,
      isCreating: false,
      hasCustomTactics: false,
      onTriggerTactic: fn(),
      onTriggerStepTactic: fn(),
      onDeleteTactic: fn(),
      stepExecution: {
        isStepMode: false,
        currentStep: 0,
        totalSteps: 1,
        isStepRunning: false,
        tactic: null,
      },
      onExecuteNextStep: fn(),
      onExitStepMode: fn(),
      onStartCreation: fn(),
      onImportTactics: fn(),
      onExportTactics: fn(),
    },
    capture: {
      captureMode: false,
      lineupAnimation: {
        isActive: false,
        selectedPresetId: "classic-tv-reveal",
        setSelectedPresetId: fn(),
        start: fn(),
      },
      showPlayerNames: true,
      onTogglePlayerNames: fn(),
      onExitCaptureMode: fn(),
      onSavePng: fn(),
    },
    i18n: {
      language: "ja",
      t: mockT,
      tDynamic: mockTDynamic,
    },
  },
} satisfies Meta<typeof SidebarPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SetPlayMode: Story = {
  args: {
    phase: {
      ...meta.args.phase,
      playMode: "setPlay",
    },
  },
};

export const Closed: Story = {
  args: {
    layout: {
      ...meta.args.layout,
      sidebarOpen: false,
    },
  },
};

export const Loading: Story = {
  args: {
    tactics: {
      ...meta.args.tactics,
      tacticsLoading: true,
    },
  },
};
