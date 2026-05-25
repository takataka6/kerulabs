/**
 * @module SectionFormModal
 * @description マニュアルセクションの新規作成・編集用モーダルコンポーネント。
 */
import { useState, useRef, useEffect } from "react";
import { AccessibleModal } from "@presentation/components/ui";
import type {
  ManualCategory,
  ManualSection,
} from "@domain/entities/TeamManual";
import type { TFunc } from "./types";

const CATEGORIES: ManualCategory[] = [
  "offense",
  "defense",
  "positive_transition",
  "negative_transition",
  "set_piece",
  "position_task",
  "free_note",
];

interface SectionFormModalProps {
  initial?: ManualSection;
  onSave: (data: {
    title: string;
    category: ManualCategory;
    formations: string[];
  }) => void;
  onClose: () => void;
  t: TFunc;
}

export function SectionFormModal({
  initial,
  onSave,
  onClose,
  t,
}: SectionFormModalProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState<ManualCategory>(
    initial?.category || "offense",
  );
  const [formations, setFormations] = useState(
    initial?.formations.join(", ") || "",
  );
  const isEdit = initial !== undefined;
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      ariaLabelledBy="section-form-modal-title"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl"
    >
      <h2
        id="section-form-modal-title"
        className="text-2xl font-bold text-white mb-6"
      >
        {isEdit ? t("manual.editSection") : t("manual.addSection")}
      </h2>

      <label
        htmlFor="section-form-title"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("manual.sectionTitle")}
      </label>
      <input
        ref={titleInputRef}
        id="section-form-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("manual.sectionTitlePlaceholder")}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-amber-500"
      />

      <label
        htmlFor="section-form-category"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("manual.category")}
      </label>
      <select
        id="section-form-category"
        value={category}
        onChange={(e) => setCategory(e.target.value as ManualCategory)}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white mb-4 focus:outline-none focus:border-amber-500"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {t(`manual.category.${cat}` as Parameters<TFunc>[0])}
          </option>
        ))}
      </select>

      <label
        htmlFor="section-form-formations"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("manual.formations")}
      </label>
      <input
        id="section-form-formations"
        value={formations}
        onChange={(e) => setFormations(e.target.value)}
        placeholder={t("manual.formationsPlaceholder")}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-6 focus:outline-none focus:border-amber-500"
      />

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          aria-label={t("a11y.closeModal")}
          className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
        >
          {t("manual.cancel")}
        </button>
        <button
          onClick={() => {
            if (!title.trim()) return;
            onSave({
              title: title.trim(),
              category,
              formations: formations
                .split(",")
                .map((f) => f.trim())
                .filter(Boolean),
            });
          }}
          disabled={!title.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("manual.save")}
        </button>
      </div>
    </AccessibleModal>
  );
}
