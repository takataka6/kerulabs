/**
 * @module LogViewer コンポーネント
 * @description ログビューアの単体テスト
 *
 * テスト方針:
 * - LogStore をvi.mockでスタブ化
 * - ログエントリの一覧表示とフィルタリングを検証
 * - ログレベル別の表示スタイルを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LogViewer } from "../LogViewer";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetEntries = vi.fn();
const mockClear = vi.fn();
const mockExportJSON = vi.fn();

vi.mock("@shared/logger", () => ({
  getLogger: () => ({
    getEntries: mockGetEntries,
    clear: mockClear,
    exportJSON: mockExportJSON,
  }),
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("LogViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with empty logs", async () => {
    mockGetEntries.mockResolvedValue([]);

    render(<LogViewer onClose={vi.fn()} />);

    // Header
    expect(screen.getByText("Log Viewer")).toBeInTheDocument();

    // Action buttons
    expect(screen.getByText("Export JSON")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.getByText("Refresh")).toBeInTheDocument();

    // Filter selects
    expect(screen.getByLabelText(/ログレベルフィルター/)).toBeInTheDocument();
    expect(screen.getByLabelText(/カテゴリフィルター/)).toBeInTheDocument();

    // Search input
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();

    // Wait for loading to finish and empty state to show
    await waitFor(() => {
      expect(screen.getByText("No log entries")).toBeInTheDocument();
    });

    // Entry count
    expect(screen.getByText("0 entries")).toBeInTheDocument();
  });

  it("renders with log entries", async () => {
    const mockEntries = [
      {
        id: "log-1",
        level: "info" as const,
        category: "ui",
        message: "Application started",
        timestamp: Date.now(),
        meta: { version: "1.0.0" },
      },
      {
        id: "log-2",
        level: "error" as const,
        category: "system",
        message: "Connection failed",
        timestamp: Date.now() - 60000,
        meta: null,
      },
      {
        id: "log-3",
        level: "warn" as const,
        category: "validation",
        message: "Invalid input detected",
        timestamp: Date.now() - 120000,
        meta: undefined,
      },
    ];

    mockGetEntries.mockResolvedValue(mockEntries);

    render(<LogViewer onClose={vi.fn()} />);

    // Wait for entries to be loaded
    await waitFor(() => {
      expect(screen.getByText("Application started")).toBeInTheDocument();
    });

    // Check log messages
    expect(screen.getByText("Connection failed")).toBeInTheDocument();
    expect(screen.getByText("Invalid input detected")).toBeInTheDocument();

    // Check log levels (use getAllByText as the levels also appear in the filter select)
    expect(screen.getAllByText("INFO").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ERROR").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("WARN").length).toBeGreaterThanOrEqual(1);

    // Check categories (use getAllByText as some also appear in category filter)
    expect(screen.getAllByText("ui").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("system").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("validation").length).toBeGreaterThanOrEqual(1);

    // Check entry count
    expect(screen.getByText("3 entries")).toBeInTheDocument();

    // Table headers
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Level")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
  });

  it("Clearボタンでログがクリアされる", async () => {
    mockGetEntries.mockResolvedValue([
      {
        id: "log-1",
        level: "info" as const,
        category: "ui",
        message: "Test log",
        timestamp: Date.now(),
        meta: null,
      },
    ]);
    mockClear.mockResolvedValue(undefined);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Test log")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Clear"));

    await waitFor(() => {
      expect(mockClear).toHaveBeenCalledTimes(1);
    });
  });

  it("Export JSONボタンでexportJSONが呼ばれる", async () => {
    mockGetEntries.mockResolvedValue([]);
    mockExportJSON.mockResolvedValue('{"logs":[]}');

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No log entries")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Export JSON"));

    await waitFor(() => {
      expect(mockExportJSON).toHaveBeenCalledTimes(1);
    });
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
  });

  it("ログレベルフィルターを変更するとgetEntriesが再呼び出しされる", async () => {
    mockGetEntries.mockResolvedValue([]);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No log entries")).toBeInTheDocument();
    });

    mockGetEntries.mockClear();

    fireEvent.change(screen.getByLabelText(/ログレベルフィルター/), {
      target: { value: "error" },
    });

    await waitFor(() => {
      expect(mockGetEntries).toHaveBeenCalled();
    });
  });

  it("カテゴリフィルターを変更するとgetEntriesが再呼び出しされる", async () => {
    mockGetEntries.mockResolvedValue([]);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No log entries")).toBeInTheDocument();
    });

    mockGetEntries.mockClear();

    fireEvent.change(screen.getByLabelText(/カテゴリフィルター/), {
      target: { value: "system" },
    });

    await waitFor(() => {
      expect(mockGetEntries).toHaveBeenCalled();
    });
  });

  it("検索入力を変更するとgetEntriesが再呼び出しされる", async () => {
    mockGetEntries.mockResolvedValue([]);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No log entries")).toBeInTheDocument();
    });

    mockGetEntries.mockClear();

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "test query" },
    });

    await waitFor(() => {
      expect(mockGetEntries).toHaveBeenCalled();
    });
  });

  it("RefreshボタンでloadEntriesが再呼び出しされる", async () => {
    mockGetEntries.mockResolvedValue([]);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No log entries")).toBeInTheDocument();
    });

    mockGetEntries.mockClear();

    fireEvent.click(screen.getByText("Refresh"));

    await waitFor(() => {
      expect(mockGetEntries).toHaveBeenCalled();
    });
  });

  it("CloseボタンでonCloseが呼ばれる", async () => {
    mockGetEntries.mockResolvedValue([]);
    const onClose = vi.fn();

    render(<LogViewer onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText("No log entries")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Clearボタン後にgetEntriesが空配列で再取得される", async () => {
    mockGetEntries.mockResolvedValueOnce([
      {
        id: "log-1",
        level: "info" as const,
        category: "ui",
        message: "Before clear",
        timestamp: Date.now(),
        meta: null,
      },
    ]);
    mockClear.mockResolvedValue(undefined);
    mockGetEntries.mockResolvedValue([]);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Before clear")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Clear"));

    await waitFor(() => {
      expect(screen.getByText("0 entries")).toBeInTheDocument();
    });
  });

  it("メタデータがないログエントリを展開しても詳細は表示されない", async () => {
    const mockEntries = [
      {
        id: "log-1",
        level: "info" as const,
        category: "ui",
        message: "No meta log",
        timestamp: Date.now(),
        meta: null,
      },
    ];
    mockGetEntries.mockResolvedValue(mockEntries);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("No meta log")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("No meta log").closest("tr")!);

    // No pre element should appear since meta is null
    expect(screen.queryByText(/{}/)).not.toBeInTheDocument();
  });

  it("ログエントリをクリックすると展開される", async () => {
    const mockEntries = [
      {
        id: "log-1",
        level: "info" as const,
        category: "ui",
        message: "Expandable log",
        timestamp: Date.now(),
        meta: { detail: "expanded content" },
      },
    ];
    mockGetEntries.mockResolvedValue(mockEntries);

    render(<LogViewer onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Expandable log")).toBeInTheDocument();
    });

    // Click the row to expand
    fireEvent.click(screen.getByText("Expandable log").closest("tr")!);

    await waitFor(() => {
      expect(
        screen.getByText(/"detail": "expanded content"/),
      ).toBeInTheDocument();
    });

    // Click again to collapse
    fireEvent.click(screen.getByText("Expandable log").closest("tr")!);

    await waitFor(() => {
      expect(
        screen.queryByText(/"detail": "expanded content"/),
      ).not.toBeInTheDocument();
    });
  });
});
