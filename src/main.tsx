import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@shared/config/tanstackQuery";
import { IS_ELECTRON } from "@shared/constants";
import { initLogger } from "@shared/logger";
import { handleError } from "@shared/errors/handleError";
import { IndexedDBLogStore } from "@infrastructure/logging/IndexedDBLogStore";
import { App } from "./App";
import "./styles/globals.css";

/* ---- ロガー初期化 ---- */
initLogger(new IndexedDBLogStore());

/* ---- グローバルエラーハンドラ ---- */
window.addEventListener("error", (event) => {
  handleError(event.error, "system", "Uncaught error", {
    meta: {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
  });
});

window.addEventListener("unhandledrejection", (event) => {
  handleError(event.reason, "system", "Unhandled promise rejection");
});

// eslint-disable-next-line react-refresh/only-export-components -- エントリポイントにエクスポートは不要
const Router = IS_ELECTRON ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Router>
  </React.StrictMode>,
);
