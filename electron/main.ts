import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { mainLogger } from "./logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 開発環境では開発サーバーをロード、本番環境ではビルドされたファイルをロード
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* ---- IPC handlers for native file dialogs ---- */

/** ファイルパスが .json 拡張子を持つ通常パスであることを検証する */
function isValidJsonPath(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  return (
    normalized === filePath &&
    path.extname(filePath).toLowerCase() === ".json" &&
    !filePath.includes("\0")
  );
}

ipcMain.handle(
  "file:save-json",
  async (_event, json: string, defaultFilename: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return false;
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      defaultPath: defaultFilename,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (canceled || !filePath) return false;
    if (!isValidJsonPath(filePath)) {
      mainLogger.error("system", "Invalid file path rejected", { filePath });
      return false;
    }
    fs.writeFileSync(filePath, json, "utf-8");
    return true;
  },
);

ipcMain.handle("file:open-json", async () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"],
  });
  if (canceled || filePaths.length === 0) return null;
  return fs.readFileSync(filePaths[0], "utf-8");
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/* ---- Global error handlers ---- */
process.on("uncaughtException", (error) => {
  mainLogger.error("system", "Uncaught exception in main process", { error });
});

process.on("unhandledRejection", (reason) => {
  mainLogger.error("system", "Unhandled rejection in main process", {
    reason: reason instanceof Error ? reason : String(reason),
  });
});

app.on("render-process-gone", (_event, _webContents, details) => {
  mainLogger.error("system", "Render process gone", {
    reason: details.reason,
    exitCode: details.exitCode,
  });
});
