/**
 * @module TermFormModal
 * @description 用語の新規追加・編集用モーダルコンポーネント。用語名・読み・説明・キーワードの入力フォームを表示する。
 */
import { useState, useRef, useEffect } from "react";
import type { GlossaryTerm } from "@domain/entities/Glossary";
import { AccessibleModal } from "@presentation/components/ui";
import type { TFunc, TermFormData } from "./types";

interface TermFormModalProps {
  initial?: GlossaryTerm;
  allKeywords: string[];
  onSave: (data: TermFormData) => void;
  onClose: () => void;
  t: TFunc;
}

export function TermFormModal({
  initial,
  allKeywords,
  onSave,
  onClose,
  t,
}: TermFormModalProps) {
  const [term, setTerm] = useState(initial?.term || "");
  const [reading, setReading] = useState(initial?.reading || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    initial?.keywords || [],
  );
  const [newKeyword, setNewKeyword] = useState("");
  const termInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    termInputRef.current?.focus();
  }, []);

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((c) => c !== kw) : [...prev, kw],
    );
  };

  const addNewKeyword = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !selectedKeywords.includes(trimmed)) {
      setSelectedKeywords((prev) => [...prev, trimmed]);
    }
    setNewKeyword("");
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      ariaLabelledBy="term-form-modal-title"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
    >
      <h2
        id="term-form-modal-title"
        className="text-xl font-bold text-white mb-6"
      >
        {initial ? t("glossary.editTerm") : t("glossary.addTerm")}
      </h2>

      <div className="space-y-4">
        {/* 用語名 & 読み仮名 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="term-form-term"
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              {t("glossary.termLabel")} *
            </label>
            <input
              ref={termInputRef}
              id="term-form-term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t("glossary.termPlaceholder")}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label
              htmlFor="term-form-reading"
              className="block text-xs font-semibold text-slate-400 mb-1"
            >
              {t("glossary.readingLabel")}
            </label>
            <input
              id="term-form-reading"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              placeholder={t("glossary.readingPlaceholder")}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* キーワード複数選択 */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            {t("glossary.keywordLabel")}
          </label>
          {/* 既存キーワードチップ */}
          {allKeywords.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {allKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleKeyword(kw)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    selectedKeywords.includes(kw)
                      ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          )}
          {/* 選択済みの新規キーワード（既存にないもの） */}
          {selectedKeywords.filter((c) => !allKeywords.includes(c)).length >
            0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {selectedKeywords
                .filter((c) => !allKeywords.includes(c))
                .map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => toggleKeyword(kw)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border bg-emerald-600/30 text-emerald-300 border-emerald-500/50 transition-all duration-200"
                  >
                    {kw} ×
                  </button>
                ))}
            </div>
          )}
          {/* 新規キーワード追加 */}
          <div className="flex gap-2">
            <input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addNewKeyword();
                }
              }}
              placeholder={t("glossary.newKeywordPlaceholder")}
              aria-label={t("glossary.newKeywordPlaceholder")}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={addNewKeyword}
              disabled={!newKeyword.trim()}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* 説明 */}
        <div>
          <label
            htmlFor="term-form-desc"
            className="block text-xs font-semibold text-slate-400 mb-1"
          >
            {t("glossary.descriptionLabel")}
          </label>
          <textarea
            id="term-form-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("glossary.termDescriptionPlaceholder")}
            rows={3}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-6">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
        >
          {t("glossary.cancel")}
        </button>
        <button
          onClick={() => {
            if (!term.trim()) return;
            onSave({
              term: term.trim(),
              reading: reading.trim() || undefined,
              description: description.trim(),
              keywords: selectedKeywords,
            });
          }}
          disabled={!term.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("glossary.save")}
        </button>
      </div>
    </AccessibleModal>
  );
}
