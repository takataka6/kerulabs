/**
 * @module LogViewer
 * @description ログビューアーコンポーネント。アプリケーションログのリアルタイム表示・フィルタリング・エクスポート機能を提供する。
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { getLogger } from "@shared/logger";
import { getDateStamp } from "@shared/utils";
import type {
  LogEntry,
  LogLevel,
  ErrorCategory,
  LogFilter,
} from "@shared/logger";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "text-slate-400",
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
};

const LEVEL_BG: Record<LogLevel, string> = {
  debug: "bg-slate-400/10",
  info: "bg-blue-400/10",
  warn: "bg-yellow-400/10",
  error: "bg-red-400/10",
};

const LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];
const CATEGORIES: ErrorCategory[] = [
  "validation",
  "database",
  "domain",
  "ui",
  "system",
];

/* ------------------------------------------------------------------ */
/*  LogViewer                                                          */
/* ------------------------------------------------------------------ */

export function LogViewer({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<LogLevel | "">("");
  const [categoryFilter, setCategoryFilter] = useState<ErrorCategory | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const filter: LogFilter = {};
    if (levelFilter) filter.level = levelFilter;
    if (categoryFilter) filter.category = categoryFilter;
    if (search) filter.search = search;
    const data = await getLogger().getEntries(filter);
    setEntries(data);
    setLoading(false);
  }, [levelFilter, categoryFilter, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- フィルター条件 (loadEntries) 変更時にログ再取得。非同期データフェッチの標準パターン
    loadEntries();
  }, [loadEntries]);

  const handleClear = async () => {
    await getLogger().clear();
    setEntries([]);
  };

  const handleExport = async () => {
    const json = await getLogger().exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.download = `kerulabs-logs-${getDateStamp()}.json`;
      downloadRef.current.click();
    }
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const locale = navigator.language.startsWith("ja") ? "ja-JP" : "en-US";
    return d.toLocaleString(locale, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col">
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid -- hidden programmatic download anchor; not user-interactive */}
      <a
        ref={downloadRef}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white">Log Viewer</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800">
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as LogLevel | "")}
          aria-label="ログレベルフィルター"
          className="bg-slate-800 text-white text-xs rounded px-2 py-1.5 border border-slate-700"
        >
          <option value="">All Levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as ErrorCategory | "")
          }
          aria-label="カテゴリフィルター"
          className="bg-slate-800 text-white text-xs rounded px-2 py-1.5 border border-slate-700"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-slate-800 text-white text-xs rounded px-2 py-1.5 border border-slate-700 flex-1 max-w-xs"
        />

        <button
          onClick={loadEntries}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          Refresh
        </button>

        <span className="text-xs text-slate-500 ml-auto">
          {entries.length} entries
        </span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            No log entries
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-700">
              <tr className="text-slate-500 text-left">
                <th className="px-3 py-2 w-32">Time</th>
                <th className="px-3 py-2 w-16">Level</th>
                <th className="px-3 py-2 w-24">Category</th>
                <th className="px-3 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer ${LEVEL_BG[entry.level]}`}
                  onClick={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                >
                  <td className="px-3 py-1.5 text-slate-500 whitespace-nowrap align-top">
                    {formatTime(entry.timestamp)}
                  </td>
                  <td
                    className={`px-3 py-1.5 font-bold whitespace-nowrap align-top ${LEVEL_COLORS[entry.level]}`}
                  >
                    {entry.level.toUpperCase()}
                  </td>
                  <td className="px-3 py-1.5 text-slate-400 whitespace-nowrap align-top">
                    {entry.category}
                  </td>
                  <td className="px-3 py-1.5 text-slate-300 align-top">
                    <div>{entry.message}</div>
                    {expandedId === entry.id && entry.meta && (
                      <pre className="mt-1 p-2 bg-slate-800 rounded text-[10px] text-slate-400 overflow-auto max-h-48 whitespace-pre-wrap">
                        {JSON.stringify(entry.meta, null, 2)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
