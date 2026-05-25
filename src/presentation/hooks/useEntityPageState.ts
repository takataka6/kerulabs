/**
 * @module useEntityPageState
 * @description エンティティ一覧ページ（Glossary/TeamManual）の共通状態管理と
 * CRUD操作ヘルパーを提供するカスタムフック。
 */
import { useState, useCallback } from "react";
import { handleError } from "@shared/errors";
import { useToast, useConfirm } from "@presentation/components/ui";
import { useLanguage } from "@presentation/contexts/LanguageContext";
import type { TranslationKey } from "@shared/i18n/translations";

interface EntityWithId {
  id: { value: string };
}

interface EntityPageI18nKeys {
  deleteConfirm: TranslationKey;
  deleteFailed: TranslationKey;
  exportSuccess: TranslationKey;
  exportError: TranslationKey;
}

interface UseEntityPageStateOptions<T extends EntityWithId> {
  items: T[];
  deleteMutateAsync: (id: string) => Promise<unknown>;
  serializeForExport: (item: T) => unknown;
  i18nKeys: EntityPageI18nKeys;
}

export function useEntityPageState<T extends EntityWithId>({
  items,
  deleteMutateAsync,
  serializeForExport,
  i18nKeys,
}: UseEntityPageStateOptions<T>) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [showCreator, setShowCreator] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.id.value === selectedId);
  const editingItem = items.find((item) => item.id.value === editingId);

  const handleDelete = useCallback(
    async (id: string, name: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (
        await confirm({
          message: t(i18nKeys.deleteConfirm).replace("{name}", name),
          variant: "red",
        })
      ) {
        try {
          await deleteMutateAsync(id);
          setSelectedId((prev) => (prev === id ? null : prev));
        } catch (error) {
          handleError(error, "database", `Failed to delete entity ${id}`, {
            toast: { show: showToast, message: t(i18nKeys.deleteFailed) },
          });
        }
      }
    },
    [confirm, deleteMutateAsync, showToast, t, i18nKeys],
  );

  const handleExport = useCallback(
    (item: T, e: React.MouseEvent) => {
      e.stopPropagation();
      const data = serializeForExport(item);
      navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(
        () => showToast(t(i18nKeys.exportSuccess), "success"),
        () => showToast(t(i18nKeys.exportError), "error"),
      );
    },
    [serializeForExport, showToast, t, i18nKeys],
  );

  return {
    // State
    showCreator,
    setShowCreator,
    showImport,
    setShowImport,
    selectedId,
    setSelectedId,
    editingId,
    setEditingId,
    // Derived
    selectedItem,
    editingItem,
    // Handlers
    handleDelete,
    handleExport,
    // Dependencies (forwarded for entity-specific handlers)
    t,
    showToast,
    confirm,
  };
}
