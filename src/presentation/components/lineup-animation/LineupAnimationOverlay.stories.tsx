/**
 * @module LineupAnimationOverlay.stories
 * @description LineupAnimationOverlayコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LineupAnimationOverlay } from "./LineupAnimationOverlay";
import { withAllProviders } from "@sb/decorators";
import type { LineupPlayer, LineupTeamInfo } from "./types";

const mockPlayers: LineupPlayer[] = [
  { name: "田中 太郎", number: 1, category: "gk", positionLabel: "GK" },
  { name: "佐藤 二郎", number: 2, category: "df", positionLabel: "RB" },
  { name: "鈴木 三郎", number: 3, category: "df", positionLabel: "CB" },
  { name: "高橋 四郎", number: 4, category: "df", positionLabel: "CB" },
  { name: "伊藤 五郎", number: 5, category: "df", positionLabel: "LB" },
  { name: "渡辺 六郎", number: 6, category: "mf", positionLabel: "CM" },
  { name: "山本 七郎", number: 7, category: "mf", positionLabel: "CM" },
  { name: "中村 八郎", number: 8, category: "mf", positionLabel: "CM" },
  { name: "小林 九郎", number: 9, category: "fw", positionLabel: "LW" },
  { name: "加藤 十郎", number: 10, category: "fw", positionLabel: "ST" },
  { name: "吉田 十一", number: 11, category: "fw", positionLabel: "RW" },
];

const mockTeamInfo: LineupTeamInfo = {
  teamName: "サンプルFC",
  formationName: "4-3-3",
  colors: { gk: "#ffcc00", df: "#0055ff", mf: "#0055ff", fw: "#0055ff" },
  manager: "山田 監督",
};

const meta = {
  title: "LineupAnimation/LineupAnimationOverlay",
  component: LineupAnimationOverlay,
  decorators: [withAllProviders],
  parameters: { layout: "fullscreen" },
  args: {
    players: mockPlayers,
    teamInfo: mockTeamInfo,
    phase: "running",
    presetId: "default",
    onComplete: fn(),
    onSkip: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof LineupAnimationOverlay>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Running: Story = {};

export const Idle: Story = {
  args: { phase: "idle" },
};
