/**
 * @module GlossaryFormModal
 * @description 用語集の新規作成・編集用モーダルコンポーネント。名前と説明の入力フォームを表示する。
 */
import { useState, useRef, useEffect } from "react";
import { AccessibleModal } from "@presentation/components/ui";
import type { TFunc } from "./types";

interface GlossaryFormModalProps {
  initialName?: string;
  initialDescription?: string;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
  t: TFunc;
}

export function GlossaryFormModal({
  initialName,
  initialDescription,
  onSave,
  onClose,
  t,
}: GlossaryFormModalProps) {
  const [name, setName] = useState(initialName || "");
  const [description, setDescription] = useState(initialDescription || "");
  const isEdit = initialName !== undefined;
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="glossary-form-modal-title"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl"
    >
      <h2
        id="glossary-form-modal-title"
        className="text-2xl font-bold text-white mb-6"
      >
        {isEdit ? t("glossary.editGlossary") : t("glossary.create")}
      </h2>

      <label
        htmlFor="glossary-form-name"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("glossary.nameLabel")}
      </label>
      <input
        ref={nameInputRef}
        id="glossary-form-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("glossary.namePlaceholder")}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-emerald-500"
      />

      <label
        htmlFor="glossary-form-desc"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("glossary.descriptionLabel")}
      </label>
      <input
        id="glossary-form-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("glossary.descriptionPlaceholder")}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-6 focus:outline-none focus:border-emerald-500"
      />

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          aria-label={t("a11y.closeModal")}
          className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
        >
          {t("glossary.cancel")}
        </button>
        <button
          onClick={() => {
            if (!name.trim()) return;
            onSave(name.trim(), description.trim());
          }}
          disabled={!name.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("glossary.save")}
        </button>
      </div>
    </AccessibleModal>
  );
}
