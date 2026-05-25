/**
 * @module ImageCropModal.stories
 * @description ImageCropModalコンポーネントのStorybookストーリー定義。
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ImageCropModal } from "./ImageCropModal";
import { withAllProviders } from "@sb/decorators";

const meta = {
  title: "UI/ImageCropModal",
  component: ImageCropModal,
  decorators: [withAllProviders],
  args: {
    onSave: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof ImageCropModal>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "プロフィール画像を選択",
  },
};

export const WithRemoveOption: Story = {
  args: {
    title: "画像を編集",
    onRemove: fn(),
  },
};

export const RectCrop: Story = {
  args: {
    title: "メインビジュアルを選択",
    aspectRatio: 3 / 4,
    cropShape: "rect",
    outputWidth: 300,
    outputHeight: 400,
  },
};
