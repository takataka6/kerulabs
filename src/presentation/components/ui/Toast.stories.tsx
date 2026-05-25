/**
 * @module Toast.stories
 * @description Toastコンポーネントの Storybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider, useToast } from "./Toast";

function ToastDemo({
  type,
  message,
}: {
  type?: "success" | "error" | "info";
  message?: string;
}) {
  const { showToast } = useToast();
  return (
    <div className="flex gap-3">
      <button
        className="px-4 py-2 bg-emerald-600 rounded text-white hover:bg-emerald-500"
        onClick={() =>
          showToast(message ?? "Operation successful!", type ?? "success")
        }
      >
        Show {type ?? "success"} toast
      </button>
    </div>
  );
}

const meta = {
  title: "UI/Toast",
  component: ToastDemo,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ToastDemo>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { type: "success", message: "保存しました！" },
};

export const Error: Story = {
  args: { type: "error", message: "エラーが発生しました" },
};

export const Info: Story = {
  args: { type: "info", message: "クリップボードにコピーしました" },
};
