/**
 * @module ErrorBoundary.stories
 * @description ErrorBoundaryコンポーネントのStorybookストーリー定義。
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorBoundary } from "./ErrorBoundary";
import { withAllProviders } from "@sb/decorators";

function ThrowError(): React.ReactElement {
  throw new Error("This is a test error for Storybook");
}

function NormalChild() {
  return (
    <div className="text-white p-4">Normal content rendered successfully.</div>
  );
}

const meta = {
  title: "UI/ErrorBoundary",
  component: ErrorBoundary,
  decorators: [withAllProviders],
} satisfies Meta<typeof ErrorBoundary>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithError: Story = {
  args: {
    children: <ThrowError />,
  },
};

export const WithErrorInline: Story = {
  args: {
    children: <ThrowError />,
    inline: true,
  },
};

export const NoError: Story = {
  args: {
    children: <NormalChild />,
  },
};
