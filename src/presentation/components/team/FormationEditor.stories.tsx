/**
 * @module FormationEditor.stories
 * @description FormationEditorコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FormationEditor } from "./FormationEditor";
import { withAllProviders } from "@sb/decorators";
import { createMockTeam } from "@sb/mocks/teams";

const meta = {
  title: "Team/FormationEditor",
  component: FormationEditor,
  decorators: [withAllProviders],
  args: {
    team: createMockTeam(),
    allTactics: [],
    onUpdateTeam: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof FormationEditor>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
