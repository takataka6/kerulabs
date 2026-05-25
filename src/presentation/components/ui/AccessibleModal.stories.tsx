/**
 * @module AccessibleModal.stories
 * @description AccessibleModalコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AccessibleModal } from "./AccessibleModal";

const meta = {
  title: "UI/AccessibleModal",
  component: AccessibleModal,
  args: {
    isOpen: true,
    onClose: fn(),
  },
} satisfies Meta<typeof AccessibleModal>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: "Sample modal",
    className:
      "bg-slate-800 rounded-xl p-6 max-w-md w-full text-white shadow-xl",
    children: (
      <div>
        <h2 className="text-lg font-bold mb-4">Modal Title</h2>
        <p className="text-slate-300 mb-4">
          This is an accessible modal with focus trapping and Escape key
          support.
        </p>
        <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white">
          Action
        </button>
      </div>
    ),
  },
};

export const WithForm: Story = {
  args: {
    ariaLabel: "Form modal",
    className:
      "bg-slate-800 rounded-xl p-6 max-w-md w-full text-white shadow-xl",
    children: (
      <div>
        <h2 className="text-lg font-bold mb-4">Form Modal</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            className="w-full bg-slate-700 rounded px-3 py-2 text-white"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-slate-700 rounded px-3 py-2 text-white"
          />
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-500 text-white">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white">
            Submit
          </button>
        </div>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    ariaLabel: "Closed modal",
    children: <div>This should not be visible</div>,
  },
};
