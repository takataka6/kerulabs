import { useMemo, useState } from "react";
import type { Tactic } from "@domain/entities/Tactic";
import type { Language } from "@presentation/contexts/LanguageContext";
import { AccessibleModal } from "@presentation/components/ui";
import type { TranslationFn } from "./types";

interface TacticExportModalProps {
  customTactics: Tactic[];
  language: Language;
  t: TranslationFn;
  onClose: () => void;
  buildExportJson: (tactics: Tactic[]) => string;
  downloadExportJson: (tactics: Tactic[]) => void;
}

export function TacticExportModal({
  customTactics,
  language,
  t,
  onClose,
  buildExportJson,
  downloadExportJson,
}: TacticExportModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(customTactics.map((tactic) => tactic.id.value)),
  );
  const [exportText, setExportText] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedTactics = useMemo(
    () => customTactics.filter((tactic) => selectedIds.has(tactic.id.value)),
    [customTactics, selectedIds],
  );

  const toggleTactic = (tacticId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tacticId)) {
        next.delete(tacticId);
      } else {
        next.add(tacticId);
      }
      return next;
    });
    setCopied(false);
  };

  const selectAll = () => {
    setSelectedIds(new Set(customTactics.map((tactic) => tactic.id.value)));
    setCopied(false);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setCopied(false);
  };

  const handleExportFile = () => {
    if (selectedTactics.length === 0) return;
    downloadExportJson(selectedTactics);
    onClose();
  };

  const handleShowText = () => {
    if (selectedTactics.length === 0) return;
    setExportText(buildExportJson(selectedTactics));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!exportText) return;
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
  };

  const isTextMode = exportText.length > 0;

  return (
    <AccessibleModal
      isOpen
      onClose={onClose}
      ariaLabel={t("tactics.export.title")}
    >
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-950/95 p-4 text-slate-100 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">
              {t("tactics.export.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {t("tactics.export.description")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            aria-label={t("a11y.closeModal")}
          >
            ✕
          </button>
        </div>

        {!isTextMode && (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-400">
                {t("tactics.export.selectedCount").replace(
                  "{count}",
                  String(selectedTactics.length),
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="rounded-lg border border-slate-700/50 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/5"
                >
                  {t("tactics.export.selectAll")}
                </button>
                <button
                  onClick={clearSelection}
                  className="rounded-lg border border-slate-700/50 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/5"
                >
                  {t("tactics.export.clearSelection")}
                </button>
              </div>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-800/70 bg-slate-900/50 p-2">
              {customTactics.map((tactic) => {
                const checked = selectedIds.has(tactic.id.value);
                return (
                  <label
                    key={tactic.id.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition ${
                      checked
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-slate-800/80 bg-slate-950/40 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTactic(tactic.id.value)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500"
                    />
                    <span className="text-base">{tactic.icon}</span>
                    <span className="text-sm text-slate-100">
                      {tactic.getDisplayName(language)}
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedTactics.length === 0 && (
              <p className="mt-3 text-xs text-amber-400">
                {t("tactics.export.noneSelected")}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleExportFile}
                disabled={selectedTactics.length === 0}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("tactics.export.file")}
              </button>
              <button
                onClick={handleShowText}
                disabled={selectedTactics.length === 0}
                className="rounded-xl border border-slate-700/50 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("tactics.export.text")}
              </button>
            </div>
          </>
        )}

        {isTextMode && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-400">
                {t("tactics.export.jsonPreview")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleCopy()}
                  className="rounded-lg border border-slate-700/50 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/5"
                >
                  {copied
                    ? t("tactics.export.copied")
                    : t("tactics.export.copy")}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-700/50 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/5"
                >
                  {t("a11y.closeModal")}
                </button>
              </div>
            </div>
            <textarea
              value={exportText}
              readOnly
              className="h-64 w-full rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 font-mono text-xs text-slate-200"
            />
          </div>
        )}
      </div>
    </AccessibleModal>
  );
}
