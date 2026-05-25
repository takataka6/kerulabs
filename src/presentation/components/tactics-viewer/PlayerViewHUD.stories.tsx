/**
 * @module PlayerViewHUD.stories
 * @description PlayerViewHUDコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PlayerViewHUD } from "./PlayerViewHUD";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "TacticsViewer/PlayerViewHUD",
  component: PlayerViewHUD,
  args: {
    playerViewEnabled: false,
    selectedPlayerIndex: null,
    selectedOpponentViewId: null,
    captureMode: false,
    playersData: [
      { name: "田中 太郎", number: 1 },
      { name: "佐藤 二郎", number: 2 },
      { name: "鈴木 三郎", number: 10 },
    ],
    colorsData: {
      gk: "#ffcc00",
      df: "#0055ff",
      mf: "#0055ff",
      fw: "#0055ff",
    },
    opponents: [],
    isFirstPerson: false,
    onExitPlayerView: fn(),
    onRotateLeft: fn(),
    onRotateRight: fn(),
    onTogglePerspective: fn(),
    t: mockT,
  },
} satisfies Meta<typeof PlayerViewHUD>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Disabled: Story = {};

export const SelectingPlayer: Story = {
  args: {
    playerViewEnabled: true,
  },
};

export const TrackingPlayer: Story = {
  args: {
    playerViewEnabled: true,
    selectedPlayerIndex: 2,
  },
};
