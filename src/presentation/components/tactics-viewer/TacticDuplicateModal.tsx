import { useEffect, useRef, useState } from "react";
import type { Tactic } from "@domain/entities/Tactic";
import type { Language } from "@presentation/contexts/LanguageContext";
import type { TranslationKey } from "@shared/i18n/translations";
import { getVisibleTacticStepCount } from "@presentation/hooks/tactic/restoreCreationStateFromTactic";
import { AccessibleModal } from "@presentation/components/ui";

interface TacticDuplicateModalProps {
  tactic: Tactic;
  language: Language;
  t: (key: TranslationKey) => string;
  tDynamic: (key: string) => string;
  onClose: () => void;
  onConfirm: (copyUntilStep: number) => void;
  onPreview: (copyUntilStep: number) => void;
  onClearPreview: () => void;
}

export function TacticDuplicateModal({
  tactic,
  language,
  t,
  tDynamic,
  onClose,
  onConfirm,
  onPreview,
  onClearPreview,
}: TacticDuplicateModalProps) {
  const totalSteps = getVisibleTacticStepCount(tactic);
  const [selectedStep, setSelectedStep] = useState(totalSteps);
  const displayName = tactic.isCustom
    ? tactic.getDisplayName(language)
    : tDynamic(`tactics.name.${tactic.id.value}`);
  const formatStepRange = (step: number) => `1~${step}`;

  const onPreviewRef = useRef(onPreview);
  const onClearPreviewRef = useRef(onClearPreview);
  const isConfirmedRef = useRef(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onPreviewRef.current = onPreview;
    onClearPreviewRef.current = onClearPreview;
  }, [onPreview, onClearPreview]);

  useEffect(() => {
    onPreviewRef.current(selectedStep);
    return () => {
      if (!isConfirmedRef.current) {
        onClearPreviewRef.current();
      }
    };
  }, [selectedStep]);

  // Close modal on click outside the content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleConfirm = () => {
    isConfirmedRef.current = true;
    onConfirm(selectedStep);
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabel={t("tactics.duplicate.title")}
      overlayClassName="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 pointer-events-none"
      className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4 text-slate-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-md pointer-events-auto"
    >
      <div
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/80">
              {t("tactics.duplicate.title")}
            </p>
            <h2 className="mt-1 text-base font-semibold text-white">
              {displayName}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {t("tactics.duplicate.selectSteps")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: totalSteps }, (_, index) => {
              const step = index + 1;
              const isActive = selectedStep === step;
              return (
                <button
                  key={step}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStep(step);
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100 shadow-lg shadow-emerald-500/10"
                      : "border-slate-700/50 bg-white/[0.03] text-slate-300 hover:border-slate-500/60 hover:bg-white/[0.06]"
                  }`}
                >
                  {formatStepRange(step)}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
            {t("tactics.duplicate.summary")
              .replace("{current}", String(selectedStep))
              .replace("{total}", String(totalSteps))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700/50 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.06]"
            >
              {t("tactics.creation.cancel")}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400"
            >
              {t("tactics.duplicate.confirm")}
            </button>
          </div>
        </div>
      </div>
    </AccessibleModal>
  );
}
