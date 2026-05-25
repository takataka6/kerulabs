/**
 * @module useAppBackup
 * @description アプリデータのエクスポート・インポート・リセット機能を提供するフック。
 */
import { useCallback, useState } from "react";
import { getContainer } from "@application/ServiceContainer";
import type { TranslationKey } from "@shared/i18n/translations";
import { handleError } from "@shared/errors";
import { getDateStamp } from "@shared/utils";

/** トースト表示後にページリロードするまでの待機時間 (ms) */
const RELOAD_DELAY_MS = 1_000;

export function useAppBackup(
  showToast: (msg: string, type: "success" | "error") => void,
  t: (key: TranslationKey) => string,
) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { appBackupService, fileService } = getContainer();
      const json = await appBackupService.export();
      const date = getDateStamp();
      fileService.downloadJson(json, `kerulabs-backup-${date}.json`);
      showToast(t("app.backup.exportSuccess"), "success");
    } catch (error) {
      handleError(error, "database", "Failed to export backup", {
        toast: { show: showToast, message: t("app.backup.exportError") },
      });
    } finally {
      setIsExporting(false);
    }
  }, [showToast, t]);

  const handleImport = useCallback(async () => {
    setIsImporting(true);
    try {
      const { appBackupService, fileService } = getContainer();
      const json = await fileService.openFilePicker(".json");
      await appBackupService.import(json);
      showToast(t("app.backup.importSuccess"), "success");
      // データ全体が置き換わったのでリロードして再初期化
      setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
    } catch (error) {
      handleError(error, "database", "Failed to import backup", {
        toast: { show: showToast, message: t("app.backup.importError") },
      });
    } finally {
      setIsImporting(false);
    }
  }, [showToast, t]);

  const [isResetting, setIsResetting] = useState(false);

  const handleReset = useCallback(async () => {
    setIsResetting(true);
    try {
      const { appBackupService } = getContainer();
      await appBackupService.resetAll();
      showToast(t("app.backup.resetSuccess"), "success");
      setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
    } catch (error) {
      handleError(error, "database", "Failed to reset all data", {
        toast: { show: showToast, message: t("app.backup.resetError") },
      });
    } finally {
      setIsResetting(false);
    }
  }, [showToast, t]);

  return {
    handleExport,
    handleImport,
    handleReset,
    isExporting,
    isImporting,
    isResetting,
  };
}
