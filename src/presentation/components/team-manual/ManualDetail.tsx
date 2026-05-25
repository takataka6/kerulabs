/**
 * @module ManualDetail
 * @description チームマニュアルの詳細表示コンポーネント。セクション・項目の追加/編集/削除とMermaid図解表示を行う。
 */
import { useState, memo } from "react";
import { generateUUID } from "@shared/utils/generateUUID";
import type {
  TeamManual,
  ManualSection,
  ManualItem,
  ManualCategory,
} from "@domain/entities/TeamManual";
import { IS_ELECTRON } from "@shared/constants";
import { SectionFormModal } from "./SectionFormModal";
import { ItemFormModal } from "./ItemFormModal";
import { ManualImportModal } from "./ManualImportModal";
import type { TFunc } from "./types";
import { useSaveTeamManual } from "@presentation/hooks/queries";
import {
  useConfirm,
  useToast,
  MermaidFlowchart,
} from "@presentation/components/ui";

/** カテゴリごとの表示設定（戦術シミュレーターのフェーズ色に準拠） */
const CATEGORY_CONFIG: Record<
  ManualCategory,
  { icon: string; bg: string; text: string }
> = {
  offense: {
    icon: "⚽",
    bg: "bg-red-500/5",
    text: "text-red-400",
  },
  defense: {
    icon: "🛡️",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
  },
  positive_transition: {
    icon: "⚡",
    bg: "bg-green-500/5",
    text: "text-green-400",
  },
  negative_transition: {
    icon: "🔄",
    bg: "bg-orange-500/5",
    text: "text-orange-400",
  },
  set_piece: {
    icon: "🎯",
    bg: "bg-teal-500/5",
    text: "text-teal-400",
  },
  position_task: {
    icon: "📋",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
  },
  free_note: {
    icon: "📝",
    bg: "bg-slate-500/5",
    text: "text-slate-400",
  },
};

/** Mermaid再レンダリング防止用のメモ化ラッパー */
const MemoizedMermaid = memo(
  function MemoizedMermaid({ chart }: { chart: string }) {
    return (
      <MermaidFlowchart
        chart={chart}
        className="overflow-x-auto [&_svg]:max-w-full"
      />
    );
  },
  (prev, next) => prev.chart === next.chart,
);

interface ManualDetailProps {
  manual: TeamManual;
  onBack: () => void;
  t: TFunc;
}

export function ManualDetail({ manual, onBack, t }: ManualDetailProps) {
  const saveManual = useSaveTeamManual();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [showAddSection, setShowAddSection] = useState(false);
  const [showImportSection, setShowImportSection] = useState(false);
  const [editingSection, setEditingSection] = useState<ManualSection | null>(
    null,
  );
  const [addingItemSectionId, setAddingItemSectionId] = useState<string | null>(
    null,
  );
  const [editingItem, setEditingItem] = useState<{
    sectionId: string;
    item: ManualItem;
  } | null>(null);

  const handleAddSection = async (data: {
    title: string;
    category: ManualCategory;
    formations: string[];
  }) => {
    manual.addSection({ ...data, items: [] });
    await saveManual.mutateAsync(manual);
    setShowAddSection(false);
  };

  const handleUpdateSection = async (data: {
    title: string;
    category: ManualCategory;
    formations: string[];
  }) => {
    if (!editingSection) return;
    manual.updateSection(editingSection.id, data);
    await saveManual.mutateAsync(manual);
    setEditingSection(null);
  };

  const handleExportSection = (section: ManualSection) => {
    const data = {
      title: section.title,
      category: section.category,
      formations: section.formations,
      items: section.items.map((i) => ({
        title: i.title,
        content: i.content,
        diagram: i.diagram,
        linkedTacticIds: i.linkedTacticIds,
      })),
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(
      () => showToast(t("manual.exportSuccess"), "success"),
      () => showToast(t("manual.exportError"), "error"),
    );
  };

  const handleImportSection = async (json: string) => {
    try {
      const raw = JSON.parse(json);
      const sections = Array.isArray(raw) ? raw : [raw];
      for (const s of sections) {
        manual.addSection({
          title: s.title || "",
          category: s.category || "free_note",
          formations: s.formations || [],
          items: (s.items || []).map(
            (i: {
              title?: string;
              content?: string;
              diagram?: string;
              linkedTacticIds?: string[];
            }) => ({
              id: generateUUID(),
              title: i.title || "",
              content: i.content || "",
              diagram: i.diagram,
              linkedTacticIds: i.linkedTacticIds || [],
            }),
          ),
        });
      }
      await saveManual.mutateAsync(manual);
      setShowImportSection(false);
      showToast(
        `${sections.length}${t("manual.sectionImportSuccess")}`,
        "success",
      );
    } catch {
      showToast(t("manual.importError"), "error");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !(await confirm({
        message: t("manual.deleteSectionConfirm"),
        variant: "red",
      }))
    )
      return;
    manual.removeSection(sectionId);
    await saveManual.mutateAsync(manual);
  };

  const handleAddItem = async (data: Omit<ManualItem, "id">) => {
    if (!addingItemSectionId) return;
    manual.addItem(addingItemSectionId, data);
    await saveManual.mutateAsync(manual);
    setAddingItemSectionId(null);
  };

  const handleUpdateItem = async (data: Omit<ManualItem, "id">) => {
    if (!editingItem) return;
    manual.updateItem(editingItem.sectionId, editingItem.item.id, data);
    await saveManual.mutateAsync(manual);
    setEditingItem(null);
  };

  const handleDeleteItem = async (sectionId: string, itemId: string) => {
    if (
      !(await confirm({
        message: t("manual.deleteItemConfirm"),
        variant: "red",
      }))
    )
      return;
    manual.removeItem(sectionId, itemId);
    await saveManual.mutateAsync(manual);
  };

  return (
    <div className="h-full bg-slate-950 relative overflow-y-auto overflow-x-hidden">
      {IS_ELECTRON && (
        <div
          className="absolute top-0 left-0 right-0 h-10 z-30"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        ></div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* パンくずナビ */}
        <nav className="flex items-center gap-2 mb-8 text-sm">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-amber-400 transition-colors"
            {...(IS_ELECTRON && {
              style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
            })}
          >
            {t("manual")}
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold">{manual.name}</span>
        </nav>

        {/* ヘッダー（コンパクト・左寄せ） */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            {manual.name}
          </h1>
          {manual.description && (
            <p className="text-slate-400 text-sm sm:text-base">
              {manual.description}
            </p>
          )}
        </div>

        <div className="max-w-5xl">
          {/* セクション追加・インポートボタン */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setShowImportSection(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600/80 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              <span>📋</span>
              <span>{t("manual.importSection")}</span>
            </button>
            <button
              onClick={() => setShowAddSection(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              <span>➕</span>
              <span>{t("manual.addSection")}</span>
            </button>
          </div>

          {/* セクション一覧 */}
          {manual.sections.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-700 rounded-2xl">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-slate-500">{t("manual.noSections")}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {(manual.sections as ManualSection[]).map((section) => {
                const config = CATEGORY_CONFIG[section.category];
                return (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-slate-800 overflow-hidden"
                  >
                    {/* セクションヘッダー */}
                    <div
                      className={`flex items-center justify-between px-5 sm:px-8 py-5 ${config.bg}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{config.icon}</span>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white">
                            {section.title}
                          </h2>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.text} bg-slate-800/80 border border-slate-700/50`}
                            >
                              {t(
                                `manual.category.${section.category}` as Parameters<TFunc>[0],
                              )}
                            </span>
                            {section.formations.map((f) => (
                              <span
                                key={f}
                                className="px-2.5 py-0.5 bg-slate-800/80 text-slate-300 rounded-full text-xs border border-slate-700/50"
                              >
                                {f}
                              </span>
                            ))}
                            <span className="px-2.5 py-0.5 text-slate-500 text-xs">
                              {section.items.length}{" "}
                              {t("manual.itemsCount" as Parameters<TFunc>[0])}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleExportSection(section)}
                          className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                          title={t("manual.exportSection")}
                        >
                          📤
                        </button>
                        <button
                          onClick={() => setAddingItemSectionId(section.id)}
                          className="p-2 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                          title={t("manual.addItem")}
                        >
                          ➕
                        </button>
                        <button
                          onClick={() => setEditingSection(section)}
                          className="p-2 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                          title={t("manual.edit")}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                          title={t("manual.delete")}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* 項目一覧 */}
                    {section.items.length === 0 ? (
                      <div className="px-5 sm:px-8 py-8 text-center text-slate-600 text-sm border-t border-slate-800/50">
                        {t("manual.noItems")}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/50">
                        {section.items.map((item, idx) => (
                          <div
                            key={item.id}
                            className="px-5 sm:px-8 py-5 hover:bg-slate-900/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-slate-600 text-xs font-mono w-6">
                                    {String(idx + 1).padStart(2, "0")}
                                  </span>
                                  <h3 className="text-white font-semibold">
                                    {item.title}
                                  </h3>
                                </div>
                                <div className="ml-8">
                                  <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">
                                    {item.content}
                                  </p>
                                  {item.diagram && (
                                    <div className="mt-3 p-4 bg-slate-900 rounded-xl border border-slate-700/50">
                                      <MemoizedMermaid chart={item.diagram} />
                                      <details className="mt-2">
                                        <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-400 transition-colors">
                                          Mermaid
                                        </summary>
                                        <pre className="mt-1 text-amber-300/60 text-xs font-mono overflow-x-auto leading-relaxed">
                                          {item.diagram}
                                        </pre>
                                      </details>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() =>
                                    setEditingItem({
                                      sectionId: section.id,
                                      item,
                                    })
                                  }
                                  className="p-1.5 text-slate-600 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                  title={t("manual.edit")}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteItem(section.id, item.id)
                                  }
                                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                  title={t("manual.delete")}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* セクション追加モーダル */}
        {showAddSection && (
          <SectionFormModal
            onSave={handleAddSection}
            onClose={() => setShowAddSection(false)}
            t={t}
          />
        )}

        {/* セクション編集モーダル */}
        {editingSection && (
          <SectionFormModal
            initial={editingSection}
            onSave={handleUpdateSection}
            onClose={() => setEditingSection(null)}
            t={t}
          />
        )}

        {/* 項目追加モーダル */}
        {addingItemSectionId && (
          <ItemFormModal
            onSave={handleAddItem}
            onClose={() => setAddingItemSectionId(null)}
            t={t}
          />
        )}

        {/* 項目編集モーダル */}
        {editingItem && (
          <ItemFormModal
            initial={editingItem.item}
            onSave={handleUpdateItem}
            onClose={() => setEditingItem(null)}
            t={t}
          />
        )}

        {/* セクションインポートモーダル */}
        {showImportSection && (
          <ManualImportModal
            onImport={handleImportSection}
            onClose={() => setShowImportSection(false)}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
