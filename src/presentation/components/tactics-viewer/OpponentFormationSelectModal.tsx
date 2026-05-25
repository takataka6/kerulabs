/**
 * @module OpponentFormationSelectModal
 * @description 相手チームのフォーメーション選択モーダル。利用可能なフォーメーションを一覧表示し、選択またはスカッドビルダーへ遷移する。
 */
import type { Formation } from "@domain/entities/Formation";
import { AccessibleModal } from "../ui/AccessibleModal";
import { useLanguage } from "@presentation/contexts/LanguageContext";

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

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabel={t("tactics.opponents.selectFormation")}
      className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full relative z-10 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-red-800 to-red-600 px-5 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3
              id="opponent-formation-title"
              className="text-base font-bold text-white"
            >
              {t("tactics.opponents.selectFormation")}
            </h3>
            <p className="text-white/70 text-xs">{teamName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label={t("a11y.closeModal")}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {formations.map((f) => (
            <button
              key={f.id.value}
              onClick={() => onSelect(f.id.value)}
              className="py-2 px-4 rounded-lg text-sm font-bold bg-slate-800/50 text-slate-300 hover:bg-red-600/30 hover:text-red-200 border border-slate-700/30 hover:border-red-500/30 transition-all duration-300"
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </AccessibleModal>
  );
}
