/**
 * @module PlayerSearchFilter コンポーネント
 * @description 選手検索フィルタの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - テキスト検索入力とフィルタ変更のコールバックを検証
 * - ポジション別フィルタの動作を検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerSearchFilter } from "../PlayerSearchFilter";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@shared/constants/positionColors", () => ({
  getPositionBgDark: () => "bg-slate-700",
  getPositionBorderDark: () => "border-slate-600",
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockT = vi.fn((key: string) => key);

function renderFilter(overrides = {}) {
  const props = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    filterPosition: "all" as const,
    onFilterChange: vi.fn(),
    sortBy: "number" as const,
    onSortChange: vi.fn(),
    t: mockT,
    ...overrides,
  };
  return render(<PlayerSearchFilter {...props} />);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("PlayerSearchFilter", () => {
  it("検索入力フィールドを表示する", () => {
    renderFilter();
    expect(
      screen.getByLabelText("player.searchPlaceholder"),
    ).toBeInTheDocument();
  });

  it("ポジションフィルターセレクトを表示する", () => {
    renderFilter();
    expect(screen.getByLabelText("player.positionFilter")).toBeInTheDocument();
  });

  it("ソートセレクトを表示する", () => {
    renderFilter();
    expect(screen.getByLabelText("player.sortLabel")).toBeInTheDocument();
  });

  it("検索入力時に onSearchChange が呼ばれる", () => {
    const onSearchChange = vi.fn();
    renderFilter({ onSearchChange });

    fireEvent.change(screen.getByLabelText("player.searchPlaceholder"), {
      target: { value: "test" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("test");
  });

  it("フィルター変更時に onFilterChange が呼ばれる", () => {
    const onFilterChange = vi.fn();
    renderFilter({ onFilterChange });

    fireEvent.change(screen.getByLabelText("player.positionFilter"), {
      target: { value: "gk" },
    });
    expect(onFilterChange).toHaveBeenCalledWith("gk");
  });

  it("ソート変更時に onSortChange が呼ばれる", () => {
    const onSortChange = vi.fn();
    renderFilter({ onSortChange });

    fireEvent.change(screen.getByLabelText("player.sortLabel"), {
      target: { value: "name" },
    });
    expect(onSortChange).toHaveBeenCalledWith("name");
  });
});
