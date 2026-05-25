/**
 * @module useAppBackup フック
 * @description アプリケーションバックアップUI操作フックの単体テスト
 *
 * テスト方針:
 * - ServiceContainer / toast / confirm をvi.mockでスタブ化
 * - exportBackup: JSON生成→ファイルダウンロードの流れを検証
 * - importBackup: ファイルピッカー→JSON読込→リストア→ページリロードの流れを検証
 * - resetAll: 確認ダイアログ→全データクリア→リロードの流れを検証
 * - エラーケース: エクスポート/インポート失敗時のトースト表示を検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppBackup } from "../useAppBackup";

const mockExport = vi.fn();
const mockImport = vi.fn();
const mockResetAll = vi.fn();
const mockDownloadJson = vi.fn();
const mockOpenFilePicker = vi.fn();

vi.mock("@application/ServiceContainer", () => ({
  getContainer: () => ({
    appBackupService: {
      export: mockExport,
      import: mockImport,
      resetAll: mockResetAll,
    },
    fileService: {
      downloadJson: mockDownloadJson,
      openFilePicker: mockOpenFilePicker,
    },
  }),
}));

describe("useAppBackup", () => {
  const showToast = vi.fn();
  const t = vi.fn((key: string) => key);
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });
  });

  it("初期状態: isExporting, isImporting, isResetting が false", () => {
    const { result } = renderHook(() => useAppBackup(showToast, t));
    expect(result.current.isExporting).toBe(false);
    expect(result.current.isImporting).toBe(false);
    expect(result.current.isResetting).toBe(false);
  });

  it("handleExport 成功: バックアップをエクスポートし success トーストを表示", async () => {
    const exportData = '{"data":"test"}';
    mockExport.mockResolvedValue(exportData);

    const { result } = renderHook(() => useAppBackup(showToast, t));

    await act(async () => {
      await result.current.handleExport();
    });

    expect(mockExport).toHaveBeenCalledOnce();
    expect(mockDownloadJson).toHaveBeenCalledWith(
      exportData,
      expect.stringMatching(/^kerulabs-backup-\d{4}-\d{2}-\d{2}\.json$/),
    );
    expect(showToast).toHaveBeenCalledWith(
      "app.backup.exportSuccess",
      "success",
    );
    expect(result.current.isExporting).toBe(false);
  });

  it("handleExport 失敗: error トーストを表示", async () => {
    mockExport.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useAppBackup(showToast, t));

    await act(async () => {
      await result.current.handleExport();
    });

    expect(showToast).toHaveBeenCalledWith("app.backup.exportError", "error");
    expect(result.current.isExporting).toBe(false);
  });

  it("handleImport 成功: バックアップをインポートし success トーストを表示", async () => {
    const importData = '{"data":"imported"}';
    mockOpenFilePicker.mockResolvedValue(importData);
    mockImport.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAppBackup(showToast, t));

    await act(async () => {
      await result.current.handleImport();
    });

    expect(mockOpenFilePicker).toHaveBeenCalledWith(".json");
    expect(mockImport).toHaveBeenCalledWith(importData);
    expect(showToast).toHaveBeenCalledWith(
      "app.backup.importSuccess",
      "success",
    );
    expect(result.current.isImporting).toBe(false);

    // リロードが 1 秒後に呼ばれる
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(reloadMock).toHaveBeenCalledOnce();
  });

  it("handleImport 失敗: error トーストを表示", async () => {
    mockOpenFilePicker.mockRejectedValue(new Error("cancelled"));

    const { result } = renderHook(() => useAppBackup(showToast, t));

    await act(async () => {
      await result.current.handleImport();
    });

    expect(showToast).toHaveBeenCalledWith("app.backup.importError", "error");
    expect(result.current.isImporting).toBe(false);
  });

  it("handleReset 成功: リセットし success トーストを表示", async () => {
    mockResetAll.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAppBackup(showToast, t));

    await act(async () => {
      await result.current.handleReset();
    });

    expect(mockResetAll).toHaveBeenCalledOnce();
    expect(showToast).toHaveBeenCalledWith(
      "app.backup.resetSuccess",
      "success",
    );
    expect(result.current.isResetting).toBe(false);

    // リロードが 1 秒後に呼ばれる
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(reloadMock).toHaveBeenCalledOnce();
  });

  it("handleReset 失敗: error トーストを表示", async () => {
    mockResetAll.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useAppBackup(showToast, t));

    await act(async () => {
      await result.current.handleReset();
    });

    expect(showToast).toHaveBeenCalledWith("app.backup.resetError", "error");
    expect(result.current.isResetting).toBe(false);
  });

  describe("ローディング状態の遷移", () => {
    it("handleExport 実行中は isExporting が true になる", async () => {
      let resolveExport!: (value: string) => void;
      mockExport.mockReturnValue(
        new Promise((r) => {
          resolveExport = r;
        }),
      );

      const { result } = renderHook(() => useAppBackup(showToast, t));

      // 非同期処理を開始（await しない）
      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleExport();
      });

      // pending 中は isExporting が true
      expect(result.current.isExporting).toBe(true);

      // Promise を解決して完了を待つ
      await act(async () => {
        resolveExport('{"data":"test"}');
        await promise!;
      });

      expect(result.current.isExporting).toBe(false);
    });

    it("handleImport 実行中は isImporting が true になる", async () => {
      let resolveFilePicker!: (value: string) => void;
      mockOpenFilePicker.mockReturnValue(
        new Promise((r) => {
          resolveFilePicker = r;
        }),
      );
      mockImport.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAppBackup(showToast, t));

      // 非同期処理を開始（await しない）
      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleImport();
      });

      // pending 中は isImporting が true
      expect(result.current.isImporting).toBe(true);

      // Promise を解決して完了を待つ
      await act(async () => {
        resolveFilePicker('{"data":"imported"}');
        await promise!;
      });

      expect(result.current.isImporting).toBe(false);

      // リロードタイマーを消化
      act(() => {
        vi.advanceTimersByTime(1_000);
      });
    });

    it("handleReset 実行中は isResetting が true になる", async () => {
      let resolveReset!: (value: undefined) => void;
      mockResetAll.mockReturnValue(
        new Promise((r) => {
          resolveReset = r;
        }),
      );

      const { result } = renderHook(() => useAppBackup(showToast, t));

      // 非同期処理を開始（await しない）
      let promise: Promise<void>;
      act(() => {
        promise = result.current.handleReset();
      });

      // pending 中は isResetting が true
      expect(result.current.isResetting).toBe(true);

      // Promise を解決して完了を待つ
      await act(async () => {
        resolveReset(undefined);
        await promise!;
      });

      expect(result.current.isResetting).toBe(false);

      // リロードタイマーを消化
      act(() => {
        vi.advanceTimersByTime(1_000);
      });
    });
  });
});
