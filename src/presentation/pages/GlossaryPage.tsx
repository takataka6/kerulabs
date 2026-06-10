/**
 * @module GlossaryPage
 * @description 用語集の一覧表示・作成・編集・削除・インポートを行うページコンポーネント。
 */
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects/GlossaryId";
import { glossaryImportSchema } from "@application/schemas";
import { z } from "zod";
import { handleError } from "@shared/errors";
import { generateUUID } from "@shared/utils/generateUUID";
import { CardListSkeleton } from "@presentation/components/ui";
import {
  GlossaryDetail,
  GlossaryFormModal,
  GlossaryImportModal,
} from "@presentation/components/glossary";
import {
  useGlossaries,
  useSaveGlossary,
  useDeleteGlossary,
} from "@presentation/hooks/queries";
import { PageShell, PageHeader } from "@presentation/components/layout";
import {
  CreateIcon,
  DeleteIcon,
  EditIcon,
  ExportIcon,
  GlossaryPageIcon,
  ImportIcon,
} from "@presentation/components/ui/LineIcons";
import { STAGGER_DELAY_MS } from "@shared/constants";
import { useEntityPageState } from "@presentation/hooks/useEntityPageState";
import { useSeedSampleData } from "@presentation/hooks/useSeedSampleData";

const GLOSSARY_I18N_KEYS = {
  deleteConfirm: "glossary.deleteConfirm" as const,
  deleteFailed: "glossary.deleteFailed" as const,
  exportSuccess: "glossary.exportSuccess" as const,
  exportError: "glossary.exportError" as const,
};

function serializeGlossary(glossary: Glossary) {
  return {
    name: glossary.name,
    description: glossary.description,
    terms: glossary.terms.map(({ term, reading, description, keywords }) => ({
      term,
      reading,
      description,
      keywords,
    })),
  };
}

export function GlossaryPage() {
  const { t } = useLanguage();
  const { data: glossaries = [], isLoading } = useGlossaries();
  const saveGlossary = useSaveGlossary();
  const deleteGlossary = useDeleteGlossary();

  const {
    showCreator,
    setShowCreator,
    showImport,
    setShowImport,
    setSelectedId,
    setEditingId,
    selectedItem: selectedGlossary,
    editingItem: editingGlossary,
    handleDelete,
    handleExport,
    showToast,
    confirm,
  } = useEntityPageState({
    items: glossaries,
    deleteMutateAsync: deleteGlossary.mutateAsync,
    serializeForExport: serializeGlossary,
    i18nKeys: GLOSSARY_I18N_KEYS,
  });

  const { handleSeed: handleSeedGlossary, isSeeding: isSeedingGlossary } =
    useSeedSampleData(showToast, t, { glossary: true });

  const handleSeedSample = async () => {
    if (await confirm({ message: t("app.seed.glossary.confirm") })) {
      await handleSeedGlossary();
    }
  };

  const handleCreate = async (name: string, description: string) => {
    try {
      const glossary = Glossary.create(name, description);
      await saveGlossary.mutateAsync(glossary);
      setShowCreator(false);
      setSelectedId(glossary.id.value);
    } catch (error) {
      handleError(error, "database", "Failed to create glossary", {
        toast: { show: showToast, message: t("glossary.saveFailed") },
      });
    }
  };

  const handleUpdate = async (
    id: string,
    name: string,
    description: string,
  ) => {
    const glossary = glossaries.find((g) => g.id.value === id);
    if (!glossary) return;
    try {
      const clone = new Glossary({
        id: glossary.id,
        name: glossary.name,
        description: glossary.description,
        terms: [...glossary.terms],
        createdAt: glossary.createdAt,
        updatedAt: glossary.updatedAt,
      });
      clone.updateInfo(name, description);
      await saveGlossary.mutateAsync(clone);
    } catch (error) {
      handleError(error, "database", "Failed to update glossary", {
        toast: { show: showToast, message: t("glossary.saveFailed") },
      });
    }
    setEditingId(null);
  };

  const handleImport = async (json: string) => {
    try {
      const raw = JSON.parse(json);
      const items = z
        .array(glossaryImportSchema)
        .parse(Array.isArray(raw) ? raw : [raw]);

      if (
        !(await confirm({
          message: t("glossary.importConfirm").replace(
            "{count}",
            String(items.length),
          ),
        }))
      ) {
        return;
      }

      let count = 0;
      for (const item of items) {
        const g = new Glossary({
          id: new GlossaryId(generateUUID()),
          name: item.name,
          description: item.description,
          terms: item.terms.map((tm) => ({
            id: generateUUID(),
            term: tm.term,
            reading: tm.reading,
            description: tm.description,
            keywords: tm.keywords ?? [],
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await saveGlossary.mutateAsync(g);
        count++;
      }
      setShowImport(false);
      showToast(`${count}${t("glossary.importSuccess")}`, "success");
    } catch (error) {
      handleError(error, "database", "Failed to import glossary", {
        toast: { show: showToast, message: t("glossary.importError") },
      });
    }
  };

  // --- 辞典詳細画面 ---
  if (selectedGlossary) {
    return (
      <GlossaryDetail
        glossary={selectedGlossary}
        onBack={() => setSelectedId(null)}
        t={t}
      />
    );
  }

  // --- 辞典一覧画面 ---
  return (
    <PageShell
      backgroundOrbs={[
        { color: "bg-emerald-500/10", position: "top-left" },
        { color: "bg-teal-500/10", position: "bottom-right" },
      ]}
    >
      <PageHeader
        icon={<GlossaryPageIcon className="h-full w-full text-emerald-400" />}
        titleKey="glossary"
        subtitleKey="glossary.subtitle"
        descriptionKey="glossary.description"
      />

      {/* アクションボタン */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setShowImport(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <ImportIcon className="h-4 w-4 shrink-0" />
          {t("glossary.import")}
        </button>
        <button
          onClick={() => setShowCreator(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <CreateIcon className="h-4 w-4 shrink-0" />
          {t("glossary.create")}
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : glossaries.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <p className="text-slate-400 text-lg">{t("glossary.empty")}</p>
            <button
              onClick={handleSeedSample}
              disabled={isSeedingGlossary}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-emerald-500/60 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("app.seed.trySample")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {glossaries.map((glossary, index) => (
              <div
                key={glossary.id.value}
                className="group relative animate-slide-in-right"
                style={{
                  animationDelay: `${index * STAGGER_DELAY_MS}ms`,
                }}
              >
                <button
                  onClick={() => setSelectedId(glossary.id.value)}
                  className="w-full p-5 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-4">
                      <div className="text-left flex-1 min-w-0">
                        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate">
                          {glossary.name}
                        </h2>
                        <p className="text-slate-400 text-sm font-light">
                          {glossary.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1.5 bg-slate-800/80 text-slate-300 rounded-lg text-xs font-semibold tracking-wider border border-slate-700/50 group-hover:border-emerald-500/30 transition-colors">
                        {glossary.terms.length} {t("glossary.termsCount")}
                      </span>
                      <span className="px-3 py-1.5 bg-slate-800/80 text-slate-400 rounded-lg text-xs border border-slate-700/50">
                        {glossary.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>

                {/* エクスポートボタン */}
                <button
                  onClick={(e) => handleExport(glossary, e)}
                  className="absolute top-3 right-[7.5rem] z-20 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 shadow-lg hover:shadow-xl border border-blue-500/50"
                  title={t("glossary.export")}
                >
                  <ExportIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* 編集ボタン */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(glossary.id.value);
                  }}
                  className="absolute top-3 right-16 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-slate-600/90 hover:bg-slate-500 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 shadow-lg hover:shadow-xl border border-slate-500/50"
                  title={t("glossary.edit")}
                >
                  <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* 削除ボタン */}
                <button
                  onClick={(e) =>
                    handleDelete(glossary.id.value, glossary.name, e)
                  }
                  className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-red-600/90 hover:bg-red-500 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 shadow-lg hover:shadow-xl border border-red-500/50"
                  title={t("glossary.delete")}
                >
                  <DeleteIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 作成モーダル */}
      {showCreator && (
        <GlossaryFormModal
          onSave={handleCreate}
          onClose={() => setShowCreator(false)}
          t={t}
        />
      )}

      {/* 編集モーダル */}
      {editingGlossary && (
        <GlossaryFormModal
          initialName={editingGlossary.name}
          initialDescription={editingGlossary.description}
          onSave={(name, desc) =>
            handleUpdate(editingGlossary.id.value, name, desc)
          }
          onClose={() => setEditingId(null)}
          t={t}
        />
      )}

      {/* インポートモーダル */}
      {showImport && (
        <GlossaryImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
          t={t}
        />
      )}
    </PageShell>
  );
}
