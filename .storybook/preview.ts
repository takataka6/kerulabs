import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";
import { setupMockContainer } from "./mocks/serviceContainer";

setupMockContainer();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0f172a" },
        { name: "light", value: "#ffffff" },
      ],
    },
    a11y: {
      // "error" mode runs axe in-browser and marks stories with violations as errored.
      // color-contrast is disabled because the dark theme palette needs a design review for WCAG AA.
      test: "error",
      config: {
        rules: [{ id: "color-contrast", enabled: false }],
      },
    },
  },
};

export default preview;
