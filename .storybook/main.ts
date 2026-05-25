import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@domain": path.resolve(__dirname, "../src/domain"),
      "@application": path.resolve(__dirname, "../src/application"),
      "@infrastructure": path.resolve(__dirname, "../src/infrastructure"),
      "@presentation": path.resolve(__dirname, "../src/presentation"),
      "@shared": path.resolve(__dirname, "../src/shared"),
      "@sb": path.resolve(__dirname, "."),
    };
    return config;
  },
};
export default config;
