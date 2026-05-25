/**
 * @module useTacticShareHandlers
 * @description 戦術のエクスポート・インポートハンドラを提供するフック。
 * useTacticsOrchestration から抽出した単一責務フック。
 */
import { useCallback, useMemo } from "react";
import type { Tactic } from "@domain/entities/Tactic";
import { TacticShareService } from "@application/services/TacticShareService";
import { getContainer } from "@application/ServiceContainer";
import { getDateStamp } from "@shared/utils";
import type { TranslationKey } from "@shared/i18n/translations";
import { handleError } from "@shared/errors/handleError";
import type { useSaveTactic } from "../queries/useSaveTactic";

export function useTacticShareHandlers(params: {
  tactics: Tactic[] | undefined;
  saveTacticMutation: ReturnType<typeof useSaveTactic>;
  showToast: (msg: string, type: "success" | "error") => void;
  t: (key: TranslationKey) => string;
}) {
  const { tactics, saveTacticMutation, showToast, t } = params;

  const hasCustomTactics = useMemo(() => {
    return (tactics || []).some((t) => t.isCustom);
  }, [tactics]);

  const handleExportTactics = useCallback(() => {
    const customTactics = (tactics || []).filter((t) => t.isCustom);
    if (customTactics.length === 0) return;
    const json = TacticShareService.export(customTactics);
    const date = getDateStamp();
    const { fileService } = getContainer();
    fileService.downloadJson(json, `tactics-${date}.json`);
  }, [tactics]);

  const handleImportTactics = useCallback(async () => {
    try {
      const { fileService } = getContainer();
      const json = await fileService.openFilePicker(".json");
      const imported = TacticShareService.import(json);
      if (imported.length === 0) {
        showToast(t("tactics.importEmpty"), "error");
        return;
      }
      for (const tactic of imported) {
        await saveTacticMutation.mutateAsync(tactic);
      }
      showToast(
        t("tactics.importSuccess").replace("{count}", String(imported.length)),
        "success",
      );
    } catch (error) {
      handleError(error, "database", "Tactic import failed", {
        toast: { show: showToast, message: t("tactics.importError") },
      });
    }
  }, [saveTacticMutation, t, showToast]);

  const handleImportFromJson = useCallback(
    async (json: string) => {
      const imported = TacticShareService.import(json);
      if (imported.length === 0) {
        showToast(t("tactics.importEmpty"), "error");
        return;
      }
      for (const tactic of imported) {
        await saveTacticMutation.mutateAsync(tactic);
      }
      showToast(
        t("tactics.importSuccess").replace("{count}", String(imported.length)),
        "success",
      );
    },
    [saveTacticMutation, t, showToast],
  );

  return {
    hasCustomTactics,
    handleExportTactics,
    handleImportTactics,
    handleImportFromJson,
  };
}
