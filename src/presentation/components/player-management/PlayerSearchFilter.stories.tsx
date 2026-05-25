/**
 * @module PlayerSearchFilter.stories
 * @description PlayerSearchFilterコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PlayerSearchFilter } from "./PlayerSearchFilter";
import { mockT } from "@sb/mocks/translations";

const meta = {
  title: "PlayerManagement/PlayerSearchFilter",
  component: PlayerSearchFilter,
  args: {
    searchQuery: "",
    onSearchChange: fn(),
    filterPosition: "all",
    onFilterChange: fn(),
    sortBy: "number",
    onSortChange: fn(),
    t: mockT,
  },
} satisfies Meta<typeof PlayerSearchFilter>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearch: Story = {
  args: {
    searchQuery: "田中",
  },
};

export const FilteredByPosition: Story = {
  args: {
    filterPosition: "fw",
    sortBy: "name",
  },
};
