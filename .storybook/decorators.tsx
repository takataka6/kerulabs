import type { Decorator } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@presentation/contexts/LanguageContext";
import { ToastProvider } from "@presentation/components/ui/Toast";
import { ConfirmProvider } from "@presentation/components/ui/ConfirmDialog";

/** Storybook用QueryClient（リトライ無効で安定した描画を保証） */
const storybookQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export const withLanguageProvider: Decorator = (Story) => (
  <LanguageProvider>
    <Story />
  </LanguageProvider>
);

export const withToastProvider: Decorator = (Story) => (
  <ToastProvider>
    <Story />
  </ToastProvider>
);

export const withAllProviders: Decorator = (Story) => (
  <LanguageProvider>
    <ToastProvider>
      <ConfirmProvider>
        <Story />
      </ConfirmProvider>
    </ToastProvider>
  </LanguageProvider>
);

export const withRouter: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

export const withPageProviders: Decorator = (Story) => (
  <QueryClientProvider client={storybookQueryClient}>
    <MemoryRouter>
      <LanguageProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Story />
          </ConfirmProvider>
        </ToastProvider>
      </LanguageProvider>
    </MemoryRouter>
  </QueryClientProvider>
);

export const withQueryClient: Decorator = (Story) => (
  <QueryClientProvider client={storybookQueryClient}>
    <Story />
  </QueryClientProvider>
);
