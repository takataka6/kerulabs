import type { TestRunnerConfig } from "@storybook/test-runner";
import { injectAxe, checkA11y } from "axe-playwright";

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      // TODO: Enable color-contrast once dark theme palette is reviewed for WCAG AA compliance
      axeOptions: {
        rules: {
          "color-contrast": { enabled: false },
        },
      },
    });
  },
};

export default config;
