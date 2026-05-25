/**
 * @module GlossaryDetail
 * @description 用語集の詳細表示コンポーネント。用語一覧テーブル・検索・ソート・用語の追加/編集/削除を表示する。
 */
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import type { Glossary, GlossaryTerm } from "@domain/entities/Glossary";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { IS_ELECTRON } from "@shared/constants";
import { TermFormModal } from "./TermFormModal";
import type { TFunc, TermFormData } from "./types";
import { useSaveGlossary } from "@presentation/hooks/queries";
import { useConfirm } from "@presentation/components/ui";

const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 200;

const columnHelper = createColumnHelper<GlossaryTerm>();

interface GlossaryDetailProps {
  glossary: Glossary;
  onBack: () => void;
  t: TFunc;
}

export function GlossaryDetail({ glossary, onBack, t }: GlossaryDetailProps) {
  const saveGlossary = useSaveGlossary();
  const { confirm } = useConfirm();
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchInput, setSearchInput] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setGlobalFilter(value);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const allKeywords = useMemo(
    () => glossary.getAllKeywords(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- glossary.terms is the reactive data source; glossary object reference changes on every parent render
    [glossary.terms],
  );

  const handleDeleteTerm = async (termId: string) => {
    if (
      !(await confirm({
        message: t("glossary.deleteTermConfirm"),
        variant: "red",
      }))
    )
      return;
    glossary.removeTerm(termId);
    await saveGlossary.mutateAsync(glossary);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("term", {
        header: () => t("glossary.termLabel"),
        cell: (info) => (
          <span className="font-semibold text-white">{info.getValue()}</span>
        ),
        size: 160,
      }),
      columnHelper.accessor("reading", {
        header: () => t("glossary.readingLabel"),
        cell: (info) => (
          <span className="text-slate-400">{info.getValue() || "—"}</span>
        ),
        size: 140,
      }),
      columnHelper.accessor("keywords", {
        header: () => t("glossary.keywordLabel"),
        cell: (info) => {
          const kws = info.getValue();
          if (!kws || kws.length === 0)
            return <span className="text-slate-600">—</span>;
          return (
            <div className="flex gap-1 flex-wrap">
              {kws.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-emerald-900/40 text-emerald-400 rounded text-xs font-semibold border border-emerald-800/50"
                >
                  {kw}
                </span>
              ))}
            </div>
          );
        },
        filterFn: (row, _columnId, filterValue: string) => {
          if (!filterValue) return true;
          return row.original.keywords.includes(filterValue);
        },
        size: 180,
      }),
      columnHelper.accessor("description", {
        header: () => t("glossary.descriptionLabel"),
        cell: (info) => (
          <span className="text-slate-300 text-sm leading-relaxed">
            {info.getValue()}
          </span>
        ),
        size: 300,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">{t("glossary.actions")}</span>,
        cell: ({ row }) => (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => setEditingTerm(row.original)}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title={t("glossary.edit")}
            >
              ✏️
            </button>
            <button
              onClick={() => handleDeleteTerm(row.original.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title={t("glossary.delete")}
            >
              🗑️
            </button>
          </div>
        ),
        size: 80,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleDeleteTerm accesses glossary/saveGlossary via closure; including it would defeat memoization
    [t, allKeywords],
  );

  const table = useReactTable({
    data: glossary.terms as GlossaryTerm[],
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: PAGE_SIZE },
    },
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase();
      const r = row.original;
      return (
        r.term.toLowerCase().includes(q) ||
        (r.reading?.toLowerCase().includes(q) ?? false) ||
        r.description.toLowerCase().includes(q) ||
        r.keywords.some((c) => c.toLowerCase().includes(q))
      );
    },
  });

  const handleAddTerm = async (data: TermFormData) => {
    glossary.addTerm(data);
    await saveGlossary.mutateAsync(glossary);
    setShowAddTerm(false);
  };

  const handleUpdateTerm = async (data: TermFormData) => {
    if (!editingTerm) return;
    glossary.updateTerm(editingTerm.id, data);
    await saveGlossary.mutateAsync(glossary);
    setEditingTerm(null);
  };

  const keywordFilterValue =
    (table.getColumn("keywords")?.getFilterValue() as string) || "";

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-y-auto">
      {/* ウィンドウドラッグ領域（Electron のみ） */}
      {IS_ELECTRON && (
        <div
          className="absolute top-0 left-0 right-0 h-10 z-30"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        ></div>
      )}

      {/* 背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ナビゲーション */}
        <div className="flex items-center gap-4 mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors text-sm"
            {...(IS_ELECTRON && {
              style: { WebkitAppRegion: "no-drag" } as React.CSSProperties,
            })}
          >
            ← {t("glossary.backToList")}
          </button>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            {glossary.name}
          </h1>
          {glossary.description && (
            <p className="text-base sm:text-xl text-slate-400">
              {glossary.description}
            </p>
          )}
        </div>

        <div className="max-w-7xl mx-auto">
          {/* ツールバー */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            {/* グローバル検索 */}
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <input
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("glossary.searchPlaceholder")}
                aria-label={t("glossary.searchPlaceholder")}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* キーワードフィルター */}
            {allKeywords.length > 0 && (
              <select
                value={keywordFilterValue}
                onChange={(e) =>
                  table
                    .getColumn("keywords")
                    ?.setFilterValue(e.target.value || undefined)
                }
                aria-label={t("glossary.allKeywords")}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">{t("glossary.allKeywords")}</option>
                {allKeywords.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* 用語追加ボタン */}
            <button
              onClick={() => setShowAddTerm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all duration-300 text-sm"
            >
              <span>➕</span>
              <span>{t("glossary.addTerm")}</span>
            </button>
          </div>

          {/* テーブル */}
          {glossary.terms.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-slate-400">{t("glossary.noTerms")}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="bg-slate-900/80 border-b border-slate-800"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-200 transition-colors"
                          style={{ width: header.getSize() }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1.5">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            {header.column.getIsSorted() === "asc" && (
                              <span className="text-emerald-400">↑</span>
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <span className="text-emerald-400">↓</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-12 text-center text-slate-400"
                      >
                        {t("glossary.noResults")}
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-3"
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* テーブルフッター */}
              <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  {table.getFilteredRowModel().rows.length} /{" "}
                  {glossary.terms.length} {t("glossary.termsCount")}
                </span>
                {table.getPageCount() > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-slate-300 transition-colors"
                    >
                      {t("common.pagination.prev")}
                    </button>
                    <span className="text-slate-400">
                      {t("common.pagination.page")
                        .replace(
                          "{current}",
                          String(table.getState().pagination.pageIndex + 1),
                        )
                        .replace("{total}", String(table.getPageCount()))}
                    </span>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-slate-300 transition-colors"
                    >
                      {t("common.pagination.next")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 用語追加モーダル */}
        {showAddTerm && (
          <TermFormModal
            allKeywords={allKeywords}
            onSave={handleAddTerm}
            onClose={() => setShowAddTerm(false)}
            t={t}
          />
        )}

        {/* 用語編集モーダル */}
        {editingTerm && (
          <TermFormModal
            initial={editingTerm}
            allKeywords={allKeywords}
            onSave={handleUpdateTerm}
            onClose={() => setEditingTerm(null)}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
