/**
 * @module OpponentFormationSelectModal
 * @description 相手チームのフォーメーション選択モーダル。利用可能なフォーメーションを一覧表示し、選択またはスカッドビルダーへ遷移する。
 */
import { useRef } from "react";
import type { Formation } from "@domain/entities/Formation";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { useClickOutside } from "@presentation/hooks/ui";
import {
  RIGHT_RAIL_POPUP_ANCHOR_CLASS,
  RIGHT_RAIL_POPUP_CLOSE_BUTTON_CLASS,
  RIGHT_RAIL_POPUP_HEADER_ACTIONS_CLASS,
  RIGHT_RAIL_POPUP_HEADER_CLASS,
  RIGHT_RAIL_POPUP_HEADER_SUBTITLE_CLASS,
  RIGHT_RAIL_POPUP_HEADER_TITLE_CLASS,
} from "./rightRailPopupLayout";

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
      className={`${RIGHT_RAIL_POPUP_ANCHOR_CLASS} overflow-hidden rounded-[24px] border border-slate-600/40 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.94)_100%)] shadow-[0_18px_40px_rgba(2,6,23,0.32),0_4px_12px_rgba(2,6,23,0.16)] ring-1 ring-white/5 backdrop-blur-xl`}
    >
      <div className={RIGHT_RAIL_POPUP_HEADER_CLASS}>
        <div className="min-w-0">
          <div className={RIGHT_RAIL_POPUP_HEADER_TITLE_CLASS}>
            {t("tactics.opponents.selectFormation")}
          </div>
          <p className={RIGHT_RAIL_POPUP_HEADER_SUBTITLE_CLASS}>{teamName}</p>
        </div>
        <div className={RIGHT_RAIL_POPUP_HEADER_ACTIONS_CLASS}>
          <button
            onClick={onClose}
            className={RIGHT_RAIL_POPUP_CLOSE_BUTTON_CLASS}
            aria-label={t("a11y.closeModal")}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
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
