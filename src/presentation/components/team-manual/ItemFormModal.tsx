/**
 * @module ItemFormModal
 * @description マニュアル項目の新規作成・編集用モーダルコンポーネント。Mermaid図解エディタとリアルタイムプレビューを含む。
 */
import { useState, useRef, useEffect } from "react";
import { AccessibleModal, MermaidFlowchart } from "@presentation/components/ui";
import type { ManualItem } from "@domain/entities/TeamManual";
import type { TFunc } from "./types";

interface ItemFormModalProps {
  initial?: ManualItem;
  onSave: (data: Omit<ManualItem, "id">) => void;
  onClose: () => void;
  t: TFunc;
}

export function ItemFormModal({
  initial,
  onSave,
  onClose,
  t,
}: ItemFormModalProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [diagram, setDiagram] = useState(initial?.diagram || "");
  const [debouncedDiagram, setDebouncedDiagram] = useState(diagram);
  const isEdit = initial !== undefined;
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Mermaidレンダリングをデバウンス（入力中に毎回レンダリングしない）
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDiagram(diagram), 500);
    return () => clearTimeout(timer);
  }, [diagram]);

  return (
    <AccessibleModal
      isOpen={true}
      onClose={onClose}
      overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      ariaLabelledBy="item-form-modal-title"
      className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
    >
      <h2
        id="item-form-modal-title"
        className="text-2xl font-bold text-white mb-6"
      >
        {isEdit ? t("manual.editItem") : t("manual.addItem")}
      </h2>

      <label
        htmlFor="item-form-title"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("manual.itemTitle")}
      </label>
      <input
        ref={titleInputRef}
        id="item-form-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("manual.itemTitlePlaceholder")}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-amber-500"
      />

      <label
        htmlFor="item-form-content"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("manual.itemContent")}
      </label>
      <textarea
        id="item-form-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder={t("manual.itemContentPlaceholder")}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-amber-500 text-sm"
      />

      <label
        htmlFor="item-form-diagram"
        className="block text-sm font-semibold text-slate-300 mb-2"
      >
        {t("manual.diagram")} ({t("manual.diagramOptional")})
      </label>

      {/* Mermaidエディタ + プレビュー 2ペイン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* エディタ */}
        <div>
          <textarea
            id="item-form-diagram"
            value={diagram}
            onChange={(e) => setDiagram(e.target.value)}
            rows={8}
            placeholder={t("manual.diagramPlaceholder")}
            className="w-full h-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-sm resize-none"
          />
        </div>

        {/* プレビュー */}
        <div className="min-h-[200px] p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center overflow-auto">
          {debouncedDiagram.trim() ? (
            <MermaidFlowchart
              chart={debouncedDiagram}
              className="w-full [&_svg]:max-w-full"
            />
          ) : (
            <span className="text-slate-600 text-sm">
              {t("manual.diagramPreview" as Parameters<TFunc>[0])}
            </span>
          )}
        </div>
      </div>

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
              content: content.trim(),
              diagram: diagram.trim() || undefined,
              linkedTacticIds: initial?.linkedTacticIds || [],
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
