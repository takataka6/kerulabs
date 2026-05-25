/**
 * @module PlayerFormFields.stories
 * @description PlayerFormFieldsコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PlayerFormFields } from "./PlayerFormFields";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "PlayerManagement/PlayerFormFields",
  component: PlayerFormFields,
  args: {
    name: "",
    onNameChange: fn(),
    number: "",
    onNumberChange: fn(),
    position: "mf",
    onPositionChange: fn(),
    nationality: "",
    onNationalityChange: fn(),
    club: "",
    onClubChange: fn(),
    leagueCountry: "",
    onLeagueCountryChange: fn(),
    note: "",
    onNoteChange: fn(),
    status: "available",
    onStatusChange: fn(),
    language: "ja",
    t: mockT,
  },
} satisfies Meta<typeof PlayerFormFields>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    name: "田中 太郎",
    number: "10",
    position: "mf",
    nationality: "Japan",
    club: "FC Sample",
    leagueCountry: "Japan",
  },
};

export const Goalkeeper: Story = {
  args: {
    name: "佐藤 一郎",
    number: "1",
    position: "gk",
    nationality: "Japan",
    club: "FC Sample B",
    leagueCountry: "Japan",
  },
};
