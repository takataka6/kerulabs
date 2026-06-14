/**
 * @module OpponentFormationSelectModal
 * @description 相手チームのフォーメーション選択モーダル。利用可能なフォーメーションを一覧表示し、選択またはスカッドビルダーへ遷移する。
 */
import { useRef } from "react";
import type { Formation } from "@domain/entities/Formation";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { useClickOutside } from "@presentation/hooks/ui";

interface OpponentFormationSelectModalProps {
  teamName: string;
  formations: Formation[];
  onSelect: (formationId: string) => void;
  onClose: () => void;
}

export function OpponentFormationSelectModal({
  teamName,
  formations,
  onSelect,
  onClose,
}: OpponentFormationSelectModalProps) {
  const { t } = useLanguage();
  const popupRef = useRef<HTMLDivElement>(null);

  useClickOutside(popupRef, onClose);

  return (
    <div
      ref={popupRef}
      data-testid="opponent-formation-select-popup"
      className="absolute top-2 right-14 z-40 w-[320px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-[24px] border border-slate-600/40 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.94)_100%)] shadow-[0_18px_40px_rgba(2,6,23,0.32),0_4px_12px_rgba(2,6,23,0.16)] ring-1 ring-white/5 backdrop-blur-xl sm:top-3 sm:right-[164px] xl:right-[176px]"
    >
      <div className="flex items-center justify-end gap-2 border-b border-slate-700/50 px-4 py-3">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/85 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
          aria-label={t("a11y.closeModal")}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className="border-b border-slate-700/50 px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/90">
          {t("tactics.opponents.selectFormation")}
        </div>
        <p className="mt-1 text-xs text-slate-400">{teamName}</p>
      </div>
      <div className="max-h-[min(70vh,560px)] overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          {formations.map((f) => (
            <button
              key={f.id.value}
              onClick={() => onSelect(f.id.value)}
              className="rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-slate-500 hover:bg-slate-700/70"
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
