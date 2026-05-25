import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

/* ------------------------------------------------------------------ */
/*  Types (self-contained for Electron main process)                   */
/* ------------------------------------------------------------------ */

type LogLevel = "debug" | "info" | "warn" | "error";
type ErrorCategory = "validation" | "database" | "domain" | "ui" | "system";

interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: ErrorCategory;
  message: string;
  meta?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  FileLogStore — JSON file-based persistence                         */
/* ------------------------------------------------------------------ */

const MAX_ENTRIES = 500;

class FileLogStore {
  private logPath: string;
  private entries: LogEntry[] = [];
  private loaded = false;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.logPath = path.join(userDataPath, "kerulabs-main.log.json");
  }

  private load(): void {
    if (this.loaded) return;
    try {
      if (fs.existsSync(this.logPath)) {
        const raw = fs.readFileSync(this.logPath, "utf-8");
        this.entries = JSON.parse(raw);
      }
    } catch {
      this.entries = [];
    }
    this.loaded = true;
  }

  private save(): void {
    try {
      fs.writeFileSync(this.logPath, JSON.stringify(this.entries), "utf-8");
    } catch {
      // サイレント — ログ書き込み失敗で再帰しない
    }
  }

  append(entry: LogEntry): void {
    this.load();
    this.entries.push(entry);
    if (this.entries.length > MAX_ENTRIES) {
      this.entries = this.entries.slice(-MAX_ENTRIES);
    }
    this.save();
  }
}

/* ------------------------------------------------------------------ */
/*  Main Process Logger                                                */
/* ------------------------------------------------------------------ */

let store: FileLogStore | null = null;

function getStore(): FileLogStore {
  if (!store) {
    store = new FileLogStore();
  }
  return store;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value instanceof Error) {
      result[key] = {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    } else {
      result[key] = value;
    }
  }
  return result;
}

function log(
  level: LogLevel,
  category: ErrorCategory,
  message: string,
  meta?: Record<string, unknown>,
): void {
  const entry: LogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    level,
    category,
    message,
    ...(meta !== undefined ? { meta: sanitizeMeta(meta) } : {}),
  };

  // コンソールにも出力
  const tag = `[${level.toUpperCase()}][${category}]`;
  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info;
  fn(tag, message, meta ?? "");

  getStore().append(entry);
}

export const mainLogger = {
  debug: (
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => log("debug", category, message, meta),
  info: (
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => log("info", category, message, meta),
  warn: (
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => log("warn", category, message, meta),
  error: (
    category: ErrorCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => log("error", category, message, meta),
};
