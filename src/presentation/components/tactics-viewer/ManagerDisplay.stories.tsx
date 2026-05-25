/**
 * @module ManagerDisplay.stories
 * @description ManagerDisplayコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ManagerDisplay } from "./ManagerDisplay";
import { mockT } from "@sb/mocks/translations";
import { createMockTeam } from "@sb/mocks/teams";

const meta = {
  title: "TacticsViewer/ManagerDisplay",
  component: ManagerDisplay,
  args: {
    selectedTeam: createMockTeam(),
    teamColor: "#0055ff",
    editingManager: false,
    managerInput: "",
    managerCard: "none",
    captureMode: false,
    onStartEditing: fn(),
    onManagerInputChange: fn(),
    onSaveManager: fn(),
    onCancelEditing: fn(),
    onCycleManagerCard: fn(),
    t: mockT,
  },
} satisfies Meta<typeof ManagerDisplay>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    editingManager: true,
    managerInput: "山田 監督",
  },
};

export const YellowCard: Story = {
  args: {
    managerCard: "yellow",
  },
};

export const RedCard: Story = {
  args: {
    managerCard: "red",
  },
};
