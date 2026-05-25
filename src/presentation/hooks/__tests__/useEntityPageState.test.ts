/**
 * @module useEntityPageState フック
 * @description エンティティ一覧ページの共通状態管理フックの単体テスト
 *
 * テスト方針:
 * - LanguageContext / Toast / Confirm をvi.mockでスタブ化
 * - 初期状態・モーダル状態切替・選択/編集アイテム派生値を検証
 * - handleDelete: 確認ダイアログ→削除→選択解除の流れを検証
 * - handleExport: シリアライズ→クリップボード→トースト表示を検証
 * - エラーケース: 削除失敗時のエラーハンドリングを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEntityPageState } from "../useEntityPageState";

const mockShowToast = vi.fn();
const mockConfirm = vi.fn();

vi.mock("@presentation/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ja",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    tDynamic: (key: string) => key,
  }),
}));

vi.mock("@presentation/components/ui", () => ({
  useToast: () => ({ showToast: mockShowToast }),
  useConfirm: () => ({ confirm: mockConfirm }),
}));

interface TestEntity {
  id: { value: string };
  name: string;
}

const ITEMS: TestEntity[] = [
  { id: { value: "id-1" }, name: "Item 1" },
  { id: { value: "id-2" }, name: "Item 2" },
];

const I18N_KEYS = {
  deleteConfirm: "glossary.deleteConfirm" as const,
  deleteFailed: "glossary.deleteFailed" as const,
  exportSuccess: "glossary.exportSuccess" as const,
  exportError: "glossary.exportError" as const,
};

describe("useEntityPageState", () => {
  const mockDeleteMutateAsync = vi.fn();
  const mockSerialize = vi.fn((item: TestEntity) => ({ name: item.name }));

  function setup(items = ITEMS) {
    return renderHook(() =>
      useEntityPageState({
        items,
        deleteMutateAsync: mockDeleteMutateAsync,
        serializeForExport: mockSerialize,
        i18nKeys: I18N_KEYS,
      }),
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 初期状態 ──

  it("初期状態でモーダルは全て非表示", () => {
    const { result } = setup();
    expect(result.current.showCreator).toBe(false);
    expect(result.current.showImport).toBe(false);
    expect(result.current.selectedItem).toBeUndefined();
    expect(result.current.editingItem).toBeUndefined();
  });

  // ── モーダル状態 ──

  it("setShowCreator で作成モーダルの表示を切り替えられる", () => {
    const { result } = setup();
    act(() => result.current.setShowCreator(true));
    expect(result.current.showCreator).toBe(true);
    act(() => result.current.setShowCreator(false));
    expect(result.current.showCreator).toBe(false);
  });

  it("setShowImport でインポートモーダルの表示を切り替えられる", () => {
    const { result } = setup();
    act(() => result.current.setShowImport(true));
    expect(result.current.showImport).toBe(true);
  });

  // ── 選択/編集アイテム派生値 ──

  it("setSelectedId で selectedItem が派生される", () => {
    const { result } = setup();
    act(() => result.current.setSelectedId("id-1"));
    expect(result.current.selectedItem).toEqual(ITEMS[0]);
  });

  it("setEditingId で editingItem が派生される", () => {
    const { result } = setup();
    act(() => result.current.setEditingId("id-2"));
    expect(result.current.editingItem).toEqual(ITEMS[1]);
  });

  it("存在しないIDでは派生値がundefinedになる", () => {
    const { result } = setup();
    act(() => result.current.setSelectedId("nonexistent"));
    expect(result.current.selectedItem).toBeUndefined();
  });

  // ── handleDelete ──

  it("確認後に削除が実行される", async () => {
    mockConfirm.mockResolvedValue(true);
    mockDeleteMutateAsync.mockResolvedValue(undefined);

    const { result } = setup();
    const mockEvent = {
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    await act(async () => {
      await result.current.handleDelete("id-1", "Item 1", mockEvent);
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockConfirm).toHaveBeenCalledWith({
      message: "glossary.deleteConfirm",
      variant: "red",
    });
    expect(mockDeleteMutateAsync).toHaveBeenCalledWith("id-1");
  });

  it("確認をキャンセルすると削除されない", async () => {
    mockConfirm.mockResolvedValue(false);

    const { result } = setup();
    const mockEvent = {
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    await act(async () => {
      await result.current.handleDelete("id-1", "Item 1", mockEvent);
    });

    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it("選択中のアイテムを削除すると選択が解除される", async () => {
    mockConfirm.mockResolvedValue(true);
    mockDeleteMutateAsync.mockResolvedValue(undefined);

    const { result } = setup();
    act(() => result.current.setSelectedId("id-1"));

    const mockEvent = {
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;
    await act(async () => {
      await result.current.handleDelete("id-1", "Item 1", mockEvent);
    });

    expect(result.current.selectedItem).toBeUndefined();
  });

  it("削除失敗時にトーストが表示される", async () => {
    mockConfirm.mockResolvedValue(true);
    mockDeleteMutateAsync.mockRejectedValue(new Error("DB error"));

    const { result } = setup();
    const mockEvent = {
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    await act(async () => {
      await result.current.handleDelete("id-1", "Item 1", mockEvent);
    });

    expect(mockShowToast).toHaveBeenCalled();
  });

  // ── handleExport ──

  it("エクスポートがクリップボードに書き込まれ成功トーストが表示される", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    const { result } = setup();
    const mockEvent = {
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleExport(ITEMS[0], mockEvent);
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockSerialize).toHaveBeenCalledWith(ITEMS[0]);
    expect(writeTextMock).toHaveBeenCalledWith(
      JSON.stringify({ name: "Item 1" }, null, 2),
    );

    // clipboard success callback
    await act(async () => {
      await writeTextMock.mock.results[0].value;
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      "glossary.exportSuccess",
      "success",
    );
  });

  // ── 転送された依存 ──

  it("t, showToast, confirm が返される", () => {
    const { result } = setup();
    expect(typeof result.current.t).toBe("function");
    expect(typeof result.current.showToast).toBe("function");
    expect(typeof result.current.confirm).toBe("function");
  });
});
