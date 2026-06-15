import type { TranslationKey } from "@shared/i18n/translations";
import { AccessibleModal } from "@presentation/components/ui";

interface TacticCreationEntryModalProps {
  t: (key: TranslationKey) => string;
  isSetPlayMode: boolean;
  onClose: () => void;
  onCreateStandard: () => void;
  onCreateSituation: () => void;
  onCreateFromExisting: () => void;
}

export function TacticCreationEntryModal({
  t,
  isSetPlayMode,
  onClose,
  onCreateStandard,
  onCreateSituation,
  onCreateFromExisting,
}: TacticCreationEntryModalProps) {
  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabel={t("tactics.creation.entry.title")}
      overlayClassName="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 pointer-events-none"
      className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 text-slate-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-md pointer-events-auto"
    >
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/80">
            {t("tactics.creation.create")}
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">
            {t("tactics.creation.entry.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {t("tactics.creation.entry.description")}
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={onCreateStandard}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-3 text-left text-sm font-semibold text-white transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400"
          >
            {t(
              isSetPlayMode
                ? "tactics.creation.entry.new"
                : "tactics.creation.entry.standard",
            )}
          </button>
          {!isSetPlayMode && (
            <button
              onClick={onCreateSituation}
              className="w-full rounded-xl border border-teal-500/40 bg-teal-500/10 px-3 py-3 text-left text-sm font-medium text-teal-100 transition-all duration-200 hover:bg-teal-500/15"
            >
              {t("tactics.creation.entry.situation")}
            </button>
          )}
          <button
            onClick={onCreateFromExisting}
            className="w-full rounded-xl border border-slate-700/50 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-white/[0.06]"
          >
            {t("tactics.creation.entry.fromExisting")}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl border border-slate-700/50 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.06]"
        >
          {t("tactics.creation.cancel")}
        </button>
      </div>
    </AccessibleModal>
  );
}
