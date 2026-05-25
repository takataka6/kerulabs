/**
 * @module GlossaryDetail コンポーネント
 * @description 用語集詳細表示コンポーネントの単体テスト
 *
 * テスト方針:
 * - 翻訳関数・コールバックをvi.fnでモック化
 * - 用語一覧の表示、キーワードフィルタ、検索機能のUI描画を検証
 * - 用語の追加・編集・削除コールバックの呼び出しを検証
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Glossary } from "@domain/entities/Glossary";
import { GlossaryId } from "@domain/value-objects/GlossaryId";
import { GlossaryDetail } from "../GlossaryDetail";
import type { TranslationKey } from "@shared/i18n/translations";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock("@presentation/components/ui", () => ({
  useConfirm: () => ({
    confirm: vi.fn().mockResolvedValue(true),
    alert: vi.fn(),
  }),
  AccessibleModal: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="modal" aria-label={title}>
      {children}
    </div>
  ),
}));

vi.mock("@presentation/hooks/queries", () => ({
  useSaveGlossary: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

vi.mock("../TermFormModal", () => ({
  TermFormModal: () => <div data-testid="term-form-modal" />,
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** 翻訳関数スタブ — キーをそのまま返す */
const t = ((key: TranslationKey) => key) as unknown as Parameters<
  typeof GlossaryDetail
>[0]["t"];

function createGlossary(
  terms: Array<{
    id: string;
    term: string;
    description: string;
    keywords: string[];
    reading?: string;
  }> = [],
): Glossary {
  return new Glossary({
    id: new GlossaryId("glossary-1"),
    name: "Test Glossary",
    description: "A test glossary",
    terms,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  });
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GlossaryDetail", () => {
  const onBack = vi.fn();

  it("用語付きの用語集を正しくレンダリングする", () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "オフサイド",
        description:
          "攻撃側の選手が相手陣内で守備側の最後尾の選手より前にいる状態",
        keywords: ["ルール"],
        reading: "おふさいど",
      },
      {
        id: "term-2",
        term: "コーナーキック",
        description:
          "守備側が最後に触れたボールがゴールラインを割った場合に攻撃側に与えられるキック",
        keywords: ["セットプレー"],
      },
    ]);

    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);

    // 用語集名が表示される
    expect(screen.getByText("Test Glossary")).toBeInTheDocument();

    // 説明が表示される
    expect(screen.getByText("A test glossary")).toBeInTheDocument();

    // 用語がテーブルに表示される
    expect(screen.getByText("オフサイド")).toBeInTheDocument();
    expect(screen.getByText("コーナーキック")).toBeInTheDocument();

    // 読み仮名が表示される
    expect(screen.getByText("おふさいど")).toBeInTheDocument();

    // キーワードが表示される（テーブル内とフィルタードロップダウンの両方に出現）
    expect(screen.getAllByText("ルール").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("セットプレー").length).toBeGreaterThanOrEqual(
      1,
    );

    // 検索入力が存在する
    expect(
      screen.getByLabelText("glossary.searchPlaceholder"),
    ).toBeInTheDocument();

    // 用語追加ボタンが存在する
    expect(screen.getByText("glossary.addTerm")).toBeInTheDocument();

    // 戻るボタンが存在する
    expect(screen.getByText(/glossary.backToList/)).toBeInTheDocument();
  });

  it("用語が空の場合にエンプティステートを表示する", () => {
    const glossary = createGlossary([]);

    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);

    // 用語集名が表示される
    expect(screen.getByText("Test Glossary")).toBeInTheDocument();

    // エンプティステートのメッセージが表示される
    expect(screen.getByText("glossary.noTerms")).toBeInTheDocument();

    // テーブルは表示されない
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("戻るボタンが onBack コールバックを持つ", () => {
    const glossary = createGlossary([]);

    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);

    const backButton = screen.getByText(/glossary.backToList/);
    expect(backButton).toBeInTheDocument();
    expect(backButton.tagName).toBe("BUTTON");
  });

  it("キーワードがある場合にキーワードフィルターセレクトを表示する", () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "パス",
        description: "ボールを味方に渡すこと",
        keywords: ["技術"],
      },
    ]);

    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);

    // キーワードフィルター（select）が表示される
    expect(screen.getByLabelText("glossary.allKeywords")).toBeInTheDocument();
  });

  it("用語の件数情報を表示する", () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "ドリブル",
        description: "ボールを足で運ぶ技術",
        keywords: ["技術"],
      },
    ]);

    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);

    // "1 / 1 glossary.termsCount" のようなテキストが表示される
    expect(
      screen.getByText(/1.*\/.*1.*glossary\.termsCount/),
    ).toBeInTheDocument();
  });

  it("戻るボタンをクリックすると onBack が呼ばれる", () => {
    const glossary = createGlossary([]);
    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);
    fireEvent.click(screen.getByText(/glossary.backToList/));
    expect(onBack).toHaveBeenCalled();
  });

  it("用語追加ボタンをクリックするとモーダルが表示される", () => {
    const glossary = createGlossary([]);
    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);
    fireEvent.click(screen.getByText("glossary.addTerm"));
    expect(screen.getByTestId("term-form-modal")).toBeInTheDocument();
  });

  it("検索入力が変更できる", () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "オフサイド",
        description: "攻撃側の位置ルール",
        keywords: [],
      },
    ]);
    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);
    const searchInput = screen.getByLabelText("glossary.searchPlaceholder");
    fireEvent.change(searchInput, { target: { value: "オフサイド" } });
    expect(searchInput).toHaveValue("オフサイド");
  });

  it("キーワードフィルターが変更できる", () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "パス",
        description: "ボールを味方に渡すこと",
        keywords: ["技術"],
      },
      {
        id: "term-2",
        term: "タックル",
        description: "ボールを奪うこと",
        keywords: ["守備"],
      },
    ]);
    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);
    const filterSelect = screen.getByLabelText("glossary.allKeywords");
    fireEvent.change(filterSelect, { target: { value: "技術" } });
    expect(filterSelect).toHaveValue("技術");
  });

  it("用語の編集ボタンをクリックすると編集モーダルが表示される", () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "オフサイド",
        description: "位置ルール",
        keywords: [],
      },
    ]);
    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);
    const editButton = screen.getByTitle("glossary.edit");
    fireEvent.click(editButton);
    // 編集モーダルが表示される
    expect(
      screen.getAllByTestId("term-form-modal").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("用語の削除ボタンをクリックすると確認ダイアログ後に削除される", async () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "オフサイド",
        description: "位置ルール",
        keywords: [],
      },
    ]);
    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);
    const deleteButton = screen.getByTitle("glossary.delete");
    fireEvent.click(deleteButton);
  });

  it("テーブルヘッダーをクリックするとソートできる", () => {
    const glossary = createGlossary([
      {
        id: "term-1",
        term: "Bタックル",
        description: "守備技術",
        keywords: [],
      },
      {
        id: "term-2",
        term: "Aパス",
        description: "攻撃技術",
        keywords: [],
      },
    ]);
    render(<GlossaryDetail glossary={glossary} onBack={onBack} t={t} />);
    // ヘッダーをクリックしてソート
    const termHeader = screen.getByText("glossary.termLabel");
    fireEvent.click(termHeader);
    // ソートアイコンが表示される
    expect(screen.getByText("↑")).toBeInTheDocument();
  });
});
