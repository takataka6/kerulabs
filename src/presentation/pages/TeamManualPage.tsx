/**
 * @module TeamManualPage
 * @description チームマニュアルの一覧表示・作成・編集・削除・インポートを行うページコンポーネント。
 */
import { useLanguage } from "@presentation/contexts/LanguageContext";
import { TeamManual } from "@domain/entities/TeamManual";
import { TeamManualId } from "@domain/value-objects/TeamManualId";
import { teamManualImportSchema } from "@application/schemas";
import { z } from "zod";
import { handleError } from "@shared/errors";
import { generateUUID } from "@shared/utils/generateUUID";
import { CardListSkeleton } from "@presentation/components/ui";
import {
  ManualDetail,
  ManualFormModal,
  ManualImportModal,
} from "@presentation/components/team-manual";
import {
  useTeamManuals,
  useSaveTeamManual,
  useDeleteTeamManual,
} from "@presentation/hooks/queries";
import { PageShell, PageHeader } from "@presentation/components/layout";
import {
  CreateIcon,
  DeleteIcon,
  EditIcon,
  ExportIcon,
  ImportIcon,
  ManualPageIcon,
} from "@presentation/components/ui/LineIcons";
import { STAGGER_DELAY_MS } from "@shared/constants";
import { useEntityPageState } from "@presentation/hooks/useEntityPageState";

const MANUAL_I18N_KEYS = {
  deleteConfirm: "manual.deleteConfirm" as const,
  deleteFailed: "manual.deleteFailed" as const,
  exportSuccess: "manual.exportSuccess" as const,
  exportError: "manual.exportError" as const,
};

function serializeManual(manual: TeamManual) {
  return {
    name: manual.name,
    description: manual.description,
    sections: manual.sections.map((s) => ({
      title: s.title,
      category: s.category,
      formations: s.formations,
      items: s.items.map((i) => ({
        title: i.title,
        content: i.content,
        diagram: i.diagram,
        linkedTacticIds: i.linkedTacticIds,
      })),
    })),
  };
}

export function TeamManualPage() {
  const { t } = useLanguage();
  const { data: manuals = [], isLoading } = useTeamManuals();
  const saveManual = useSaveTeamManual();
  const deleteManual = useDeleteTeamManual();

  const {
    showCreator,
    setShowCreator,
    showImport,
    setShowImport,
    setSelectedId,
    setEditingId,
    selectedItem: selectedManual,
    editingItem: editingManual,
    handleDelete,
    handleExport,
    showToast,
    confirm,
  } = useEntityPageState({
    items: manuals,
    deleteMutateAsync: deleteManual.mutateAsync,
    serializeForExport: serializeManual,
    i18nKeys: MANUAL_I18N_KEYS,
  });

  const handleCreate = async (name: string, description: string) => {
    try {
      const manual = TeamManual.create(name, description);
      await saveManual.mutateAsync(manual);
      setShowCreator(false);
    } catch (error) {
      handleError(error, "database", "Failed to create manual", {
        toast: { show: showToast, message: t("manual.saveFailed") },
      });
    }
  };

  const handleUpdate = async (
    id: string,
    name: string,
    description: string,
  ) => {
    const manual = manuals.find((m) => m.id.value === id);
    if (!manual) return;
    try {
      const clone = new TeamManual({
        id: manual.id,
        name: manual.name,
        description: manual.description,
        teamId: manual.teamId,
        sections: [...manual.sections],
        createdAt: manual.createdAt,
        updatedAt: manual.updatedAt,
      });
      clone.updateInfo(name, description);
      await saveManual.mutateAsync(clone);
    } catch (error) {
      handleError(error, "database", "Failed to update manual", {
        toast: { show: showToast, message: t("manual.saveFailed") },
      });
    }
    setEditingId(null);
  };

  const handleImport = async (json: string) => {
    try {
      const raw = JSON.parse(json);
      const items = z
        .array(teamManualImportSchema)
        .parse(Array.isArray(raw) ? raw : [raw]);

      if (
        !(await confirm({
          message: t("manual.importConfirm").replace(
            "{count}",
            String(items.length),
          ),
        }))
      ) {
        return;
      }

      let count = 0;
      for (const item of items) {
        const m = new TeamManual({
          id: new TeamManualId(generateUUID()),
          name: item.name,
          description: item.description,
          teamId: item.teamId,
          sections: item.sections.map((s) => ({
            id: generateUUID(),
            title: s.title,
            category: s.category,
            formations: s.formations,
            items: s.items.map((i) => ({
              id: generateUUID(),
              title: i.title,
              content: i.content,
              diagram: i.diagram,
              linkedTacticIds: i.linkedTacticIds,
            })),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await saveManual.mutateAsync(m);
        count++;
      }
      setShowImport(false);
      showToast(`${count}${t("manual.importSuccess")}`, "success");
    } catch (error) {
      handleError(error, "database", "Failed to import team manual", {
        toast: { show: showToast, message: t("manual.importError") },
      });
    }
  };

  // --- マニュアル詳細画面 ---
  if (selectedManual) {
    return (
      <ManualDetail
        manual={selectedManual}
        onBack={() => setSelectedId(null)}
        t={t}
      />
    );
  }

  // --- マニュアル一覧画面 ---
  return (
    <PageShell className="h-full overflow-x-hidden" backgroundOrbs={[]}>
      <PageHeader
        icon={<ManualPageIcon className="h-full w-full text-amber-400" />}
        titleKey="manual"
        subtitleKey="manual.subtitle"
        descriptionKey="manual.description"
      />

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setShowImport(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <ImportIcon className="h-4 w-4 shrink-0" />
          {t("manual.import")}
        </button>
        <button
          onClick={() => setShowCreator(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <CreateIcon className="h-4 w-4 shrink-0" />
          {t("manual.create")}
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : manuals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">{t("manual.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {manuals.map((manual, index) => (
              <div
                key={manual.id.value}
                className="group relative animate-slide-in-right"
                style={{
                  animationDelay: `${index * STAGGER_DELAY_MS}ms`,
                }}
              >
                <button
                  onClick={() => setSelectedId(manual.id.value)}
                  className="w-full p-5 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/50 transition-colors duration-200 hover:border-amber-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="mb-4">
                      <div className="text-left flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                          {manual.name}
                        </h2>
                        <p className="text-slate-400 text-sm font-light">
                          {manual.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1.5 bg-slate-800/80 text-slate-300 rounded-lg text-xs font-semibold tracking-wider border border-slate-700/50 group-hover:border-amber-500/30 transition-colors">
                        {manual.sections.length} {t("manual.sectionsCount")}
                      </span>
                      <span className="px-3 py-1.5 bg-slate-800/80 text-slate-400 rounded-lg text-xs border border-slate-700/50">
                        {manual.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={(e) => handleExport(manual, e)}
                  className="absolute top-3 right-[7.5rem] z-20 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600/90 hover:bg-blue-500 rounded-xl transition-colors duration-200 flex items-center justify-center text-white border border-blue-500/50"
                  title={t("manual.export")}
                >
                  <ExportIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(manual.id.value);
                  }}
                  className="absolute top-3 right-16 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-slate-600/90 hover:bg-slate-500 rounded-xl transition-colors duration-200 flex items-center justify-center text-white border border-slate-500/50"
                  title={t("manual.edit")}
                >
                  <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <button
                  onClick={(e) => handleDelete(manual.id.value, manual.name, e)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-red-600/90 hover:bg-red-500 rounded-xl transition-colors duration-200 flex items-center justify-center text-white border border-red-500/50"
                  title={t("manual.delete")}
                >
                  <DeleteIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreator && (
        <ManualFormModal
          onSave={handleCreate}
          onClose={() => setShowCreator(false)}
          t={t}
        />
      )}

      {editingManual && (
        <ManualFormModal
          initialName={editingManual.name}
          initialDescription={editingManual.description}
          onSave={(name, desc) =>
            handleUpdate(editingManual.id.value, name, desc)
          }
          onClose={() => setEditingId(null)}
          t={t}
        />
      )}

      {showImport && (
        <ManualImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
          t={t}
        />
      )}
    </PageShell>
  );
}
